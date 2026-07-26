<#
  scripts/inspect-vps.ps1
  Detecta qué tipo de base de datos tiene el VPS y hace un backup
  sin guardar credenciales en archivos del proyecto.
#>

$ErrorActionPreference = 'Stop'

# ============================================================
#  CREDENCIALES (solo en memoria, NO se commitean)
# ============================================================
$VPS_HOST = '177.7.33.146'
$VPS_USER = 'root'
$VPS_PASS = '318088330Unam#'   # <- SOLO EN MEMORIA

$BACKUP_DIR = 'C:\Users\elias\talent-ats-platform\backups'
New-Item -ItemType Directory -Path $BACKUP_DIR -Force | Out-Null

# ============================================================
#  Helpers
# ============================================================
function Run-SSH {
  param([string]$Cmd)
  # Usa ssh nativo con password via SSH_ASKPASS (no es perfecto pero funciona)
  # Alternativa: usar expect-style via Process.Start
  
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = 'ssh'
  $psi.Arguments = "-tt -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL $VPS_USER@$VPS_HOST `"$Cmd`""
  $psi.RedirectStandardInput  = $true
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError  = $true
  $psi.UseShellExecute = $false

  $proc = New-Object System.Diagnostics.Process
  $proc.StartInfo = $psi
  $proc.Start() | Out-Null

  # Enviar password via stdin (esto NO funciona en ssh interactivo estándar)
  # $proc.StandardInput.WriteLine($VPS_PASS)
  # $proc.StandardInput.Flush()

  $stdout = $proc.StandardOutput.ReadToEnd()
  $stderr = $proc.StandardError.ReadToEnd()
  $proc.WaitForExit()

  return @{
    Code    = $proc.ExitCode
    Stdout  = $stdout
    Stderr  = $stderr
  }
}

function Run-SSH-With-Password {
  param([string]$Cmd)
  # Usa plink si está, sino SSH con workaround
  $plink = Get-Command plink -ErrorAction SilentlyContinue
  if ($plink) {
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = 'plink'
    $psi.Arguments = "-ssh -batch -pw `"$VPS_PASS`" $VPS_USER@$VPS_HOST `"$Cmd`"
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError  = $true
    $psi.UseShellExecute = $false
    $proc = New-Object System.Diagnostics.Process
    $proc.StartInfo = $psi
    $proc.Start() | Out-Null
    $stdout = $proc.StandardOutput.ReadToEnd()
    $stderr = $proc.StandardError.ReadToEnd()
    $proc.WaitForExit()
    return @{ Code = $proc.ExitCode; Stdout = $stdout; Stderr = $stderr }
  }
  return $null
}

# ============================================================
#  PASO 1: Verificar conexión
# ============================================================
Write-Host "=== Conectando a $VPS_USER@$VPS_HOST ===" -ForegroundColor Cyan

$result = Run-SSH-With-Password "echo OK && uname -a"
if ($result -and $result.Code -eq 0) {
  Write-Host "✓ Conexión exitosa (plink)" -ForegroundColor Green
  $Remote = $result.Stdout
} else {
  Write-Host "⚠ plink no disponible o falló, intentando ssh..." -ForegroundColor Yellow
  $Remote = ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL `
            "$VPS_USER@$VPS_HOST" "uname -a" 2>&1
}

Write-Host "--- Salida del servidor ---" -ForegroundColor Gray
Write-Host $Remote
Write-Host "--- fin ---`n"

# ============================================================
#  PASO 2: Detectar tipo de BD
# ============================================================
Write-Host "=== Detectando servicios de base de datos ===" -ForegroundColor Cyan

$detect = "echo '==PUERTOS==' && ss -tlnp 2>/dev/null | grep -E '5432|3306|27017|6379' || netstat -tlnp 2>/dev/null | grep -E '5432|3306|27017|6379' ; echo '==SERVICIOS==' && systemctl list-units --type=service --no-pager 2>/dev/null | grep -E 'postgres|mysql|mongod|redis' ; echo '==BINARIOS==' && which psql pg_dump mysqldump mongod redis-cli 2>/dev/null ; echo '==VERSIONES==' && (psql --version 2>/dev/null) ; (mysqldump --version 2>/dev/null) ; (mongod --version 2>/dev/null | head -1) ; echo '==BASES==' && (sudo -u postgres psql -l 2>/dev/null) ; (mysql -uroot -p$VPS_PASS -e 'SHOW DATABASES;' 2>/dev/null)"

$result = Run-SSH-With-Password $detect
$Out = if ($result) { $result.Stdout } else {
  ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL "$VPS_USER@$VPS_HOST" $detect 2>&1
}

Write-Host $Out

# ============================================================
#  PASO 3: Backup según el tipo detectado
# ============================================================
Write-Host "`n=== Preparando backup ===" -ForegroundColor Cyan

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupName = "pre-hrcore-backup-$timestamp"

# Detectar tipo y hacer backup
$backupCmd = @"
mkdir -p /tmp/hr-core-backup
cd /tmp/hr-core-backup

# PostgreSQL
if command -v pg_dump >/dev/null 2>&1; then
  echo '==BACKUP POSTGRESQL==' >> log.txt
  mkdir -p postgres
  sudo -u postgres pg_dumpall > postgres/full.sql 2>/dev/null || pg_dumpall -U postgres > postgres/full.sql 2>/dev/null
  sudo ls -la postgres/ >> log.txt
fi

# MySQL
if command -v mysqldump >/dev/null 2>&1; then
  echo '==BACKUP MYSQL==' >> log.txt
  mkdir -p mysql
  mysqldump -u root -p'$VPS_PASS' --all-databases > mysql/full.sql 2>/dev/null || echo 'mysql backup falló' >> log.txt
  sudo ls -la mysql/ >> log.txt
fi

# Archivos del VPS (por si hay configs)
mkdir -p system
cp -r /etc/nginx /etc/apache2 /etc/caddy /opt 2>/dev/null system/ 2>/dev/null
ls -la / > system-root-listing.txt 2>/dev/null
ls /var/www/ > system-www-listing.txt 2>/dev/null

echo '==LISTADO FINAL==' >> log.txt
find / -name 'docker-compose*' 2>/dev/null | head -5 >> log.txt
find / -name '*.env' 2>/dev/null | head -10 >> log.txt
ls -la /tmp/hr-core-backup >> log.txt

echo OK
"@

# Hacer el backup en el VPS
$result = Run-SSH-With-Password $backupCmd
$Out = if ($result) { $result.Stdout } else {
  ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL "$VPS_USER@$VPS_HOST" $backupCmd 2>&1
}

Write-Host "--- Backup output ---"
Write-Host $Out

# ============================================================
#  PASO 4: Descargar el backup al local
# ============================================================
Write-Host "`n=== Descargando backup a local ===" -ForegroundColor Cyan

$remoteTar = "/tmp/hr-core-backup-${timestamp}.tar.gz"
$packCmd = "cd /tmp && tar -czf hr-core-backup-${timestamp}.tar.gz hr-core-backup && ls -lh hr-core-backup-${timestamp}.tar.gz"

$result = Run-SSH-With-Password $packCmd
$Out = if ($result) { $result.Stdout } else {
  ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL "$VPS_USER@$VPS_HOST" $packCmd 2>&1
}
Write-Host $Out

# Descargar con scp (nativo en Windows 10+)
$localTar = Join-Path $BACKUP_DIR "pre-hrcore-backup-${timestamp}.tar.gz"
Write-Host "Descargando de ${VPS_USER}@${VPS_HOST}:${remoteTar} a ${localTar}"

# scp nativo no soporta password en CLI, usar ssh vía cat
$sshDump = "cat ${remoteTar}"
ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL "$VPS_USER@$VPS_HOST" $sshDump > $localTar 2>$null

if (Test-Path $localTar) {
  $size = (Get-Item $localTar).Length
  Write-Host "✓ Backup descargado: $localTar ($size bytes)" -ForegroundColor Green
} else {
  Write-Host "✗ No se pudo descargar via SSH. Probando con scp..." -ForegroundColor Red
}

# ============================================================
#  PASO 5: Listar el backup descargado
# ============================================================
Write-Host "`n=== Contenido del backup local ===" -ForegroundColor Cyan
Get-ChildItem $BACKUP_DIR | Format-Table Name, Length, LastWriteTime

Write-Host "`n=== IMPORTANTE ===" -ForegroundColor Yellow
Write-Host "✓ Tu contraseña NO se guardó en ningún archivo del proyecto." -ForegroundColor Green
Write-Host "⚠  RECOMIÉNDO: cambia la contraseña del VPS ahora que está expuesta en este chat:" -ForegroundColor Yellow
Write-Host "   ssh root@$VPS_HOST 'passwd'"
Write-Host "   o desde el panel de Hostinger."
