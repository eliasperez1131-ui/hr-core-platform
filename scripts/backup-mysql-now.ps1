# scripts/backup-mysql-now.ps1
# One-shot: conecta al VPS, hace dump MySQL, descarga a local.
# Ejecuta desde PowerShell:
#   pwsh -ExecutionPolicy Bypass -File scripts/backup-mysql-now.ps1

$ErrorActionPreference = 'Stop'

$VPS_HOST = '177.7.33.146'
$VPS_USER = 'root'
$VPS_PASS = '318088330Unam#'
$MYSQL_PASS = '123456'

$BACKUP_DIR = 'C:\Users\elias\talent-ats-platform\backups'
New-Item -ItemType Directory -Path $BACKUP_DIR -Force | Out-Null

$TS = Get-Date -Format 'yyyyMMdd-HHmmss'
$REMOTE_FILE = "/tmp/hrcore_db-$TS.sql"
$LOCAL_FILE = Join-Path $BACKUP_DIR "hrcore_db-$TS.sql"

Write-Host "=== Backup de MySQL desde $VPS_HOST ===" -ForegroundColor Cyan
Write-Host "Remoto: $REMOTE_FILE"
Write-Host "Local:  $LOCAL_FILE`n"

# Construye un script bash inline (sin archivo .sh, evita CRLF)
$REMOTE_CMD = @"
set -e
echo '--- Dump de hrcore_db ---'
mysqldump -uroot -p'$MYSQL_PASS' --single-transaction --routines --triggers --add-drop-database hrcore_db > $REMOTE_FILE
ls -la $REMOTE_FILE
echo '--- Primeras lineas (validar SQL) ---'
head -5 $REMOTE_FILE
echo '--- Descarga via cat (stdin) ---'
cat $REMOTE_FILE
"@

# Lanza SSH con stdin redirigido
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = 'ssh'
$psi.Arguments = "-tt -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -o PreferredAuthentications=password -o PubkeyAuthentication=no $VPS_USER@$VPS_HOST"
$psi.RedirectStandardInput  = $true
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError  = $true
$psi.UseShellExecute = $false

$proc = New-Object System.Diagnostics.Process
$proc.StartInfo = $psi
$proc.Start() | Out-Null

# SSH suele tardar en mostrar "password:"
Start-Sleep -Seconds 1

# Lee hasta encontrar "password:" o timeout
$timeout = 0
while ($timeout -lt 30) {
  Start-Sleep -Milliseconds 200
  $timeout++
  if ($proc.StandardOutput.Peek() -ne -1) {
    $peek = $proc.StandardOutput.ReadLine()
    if ($peek -match 'password:') { break }
  }
  # Tambien revisar si ya cerro el proceso
  if ($proc.HasExited) { break }
}

# Envia la password
$proc.StandardInput.WriteLine($VPS_PASS)
$proc.StandardInput.Flush()

# Ahora envia el comando
Start-Sleep -Milliseconds 500
$proc.StandardInput.WriteLine($REMOTE_CMD)
$proc.StandardInput.Flush()
$proc.StandardInput.WriteLine("exit")
$proc.StandardInput.Flush()

# Lee todo el output
$out = $proc.StandardOutput.ReadToEnd()
$err = $proc.StandardError.ReadToEnd()
$proc.WaitForExit()

Write-Host "--- STDOUT (raw) ---" -ForegroundColor Gray
Write-Host $out

if ($err) {
  Write-Host "`n--- STDERR (raw) ---" -ForegroundColor Yellow
  Write-Host $err
}

# Si el dump se hizo, lo capturamos
if ($out -match 'BEGINNING.*?STATEMENTS' -or $out -match 'CREATE TABLE') {
  Write-Host "`n✓ El dump contiene SQL valido" -ForegroundColor Green
}

# Buscar el bloque entre marcadores de tamano
$lines = $out -split "`n"
$sizeLine = $lines | Where-Object { $_ -match '^-rw-r--r--' -or $_ -match 'hrcore_db' } | Select-Object -First 1
if ($sizeLine) {
  Write-Host "`nArchivo en VPS: $sizeLine" -ForegroundColor Cyan
}

# Intenta extraer el contenido del dump desde la salida
$marker = '--- Descarga via cat (stdin) ---'
$idx = $out.IndexOf($marker)
if ($idx -ge 0) {
  $dumpContent = $out.Substring($idx + $marker.Length).TrimEnd()
  if ($dumpContent.Length -gt 100) {
    Set-Content -Path $LOCAL_FILE -Value $dumpContent -Encoding UTF8 -NoNewline
    $localSize = (Get-Item $LOCAL_FILE).Length
    Write-Host "`n✓ Backup descargado: $LOCAL_FILE ($localSize bytes)" -ForegroundColor Green
  } else {
    Write-Host "`n⚠ El contenido extraido es muy pequeno ($($dumpContent.Length) bytes)" -ForegroundColor Yellow
  }
} else {
  Write-Host "`n⚠ No se detecto el marcador de descarga en el output" -ForegroundColor Yellow
  Write-Host "  Si el dump se hizo en el VPS, descargalo manualmente con:" -ForegroundColor Yellow
  Write-Host "  scp $VPS_USER@${VPS_HOST}:$REMOTE_FILE $BACKUP_DIR/" -ForegroundColor Cyan
}

Write-Host "`n=== Verificacion final ===" -ForegroundColor Cyan
if (Test-Path $LOCAL_FILE) {
  Get-Item $LOCAL_FILE | Format-Table Name, Length, LastWriteTime
} else {
  Write-Host "Archivo local NO creado. Revisa el output de arriba." -ForegroundColor Red
}
