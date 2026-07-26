# scripts/expect-ssh.ps1
# Wrapper estilo expect para SSH en Windows usando Process.
# Uso: pwsh -File scripts/expect-ssh.ps1 -Host 177.7.33.146 -User root -Pass 'xxx' -Cmd 'uname -a'

param(
  [Parameter(Mandatory=$true)][string]$Host,
  [Parameter(Mandatory=$true)][string]$User,
  [Parameter(Mandatory=$true)][string]$Pass,
  [Parameter(Mandatory=$true)][string]$Cmd
)

# Detecta plink, si no usa ssh nativo con env-via-stdin
$plink = Get-Command plink -ErrorAction SilentlyContinue
if ($plink) {
  Write-Host "[plink] Conectando a $User@$Host..." -ForegroundColor Cyan
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = 'plink'
  $psi.Arguments = "-ssh -batch -pw `"$Pass`" $User@$Host `"$Cmd`"
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError  = $true
  $psi.UseShellExecute = $false
  $p = New-Object System.Diagnostics.Process
  $p.StartInfo = $psi
  $p.Start() | Out-Null
  $out = $p.StandardOutput.ReadToEnd()
  $err = $p.StandardError.ReadToEnd()
  $p.WaitForExit()
  Write-Host "---STDOUT---`n$out"
  if ($err) { Write-Host "---STDERR---`n$err" -ForegroundColor Yellow }
  exit $p.ExitCode
}

# Fallback: SSH nativo de Windows con envío manual de password
Write-Host "[ssh-nativo] Conectando a $User@$Host..." -ForegroundColor Cyan

# Usamos ssh con clave temporal generada. Como no la tenemos,
# hacemos un truco: ssh nativo que envíe la password via stdin.
# Esto funciona con OpenSSH reciente si usamos -o PreferredAuthentications.

$fullCmd = $Cmd
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = 'ssh'
$psi.Arguments = "-tt -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -o PreferredAuthentications=password -o PubkeyAuthentication=no $User@$Host `"$fullCmd`"
$psi.RedirectStandardInput  = $true
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError  = $true
$psi.UseShellExecute = $false
$psi.EnvironmentVariables['SSH_ASKPASS'] = ''
$psi.EnvironmentVariables['SSH_ASKPASS_REQUIRE'] = 'never'

$p = New-Object System.Diagnostics.Process
$p.StartInfo = $psi
$p.Start() | Out-Null

# Espera un poco para que SSH pida password
Start-Sleep -Milliseconds 500

# Escribe la password via stdin
try {
  $p.StandardInput.WriteLine($Pass)
  $p.StandardInput.Flush()
} catch {
  Write-Host "No se pudo enviar password via stdin: $($_.Exception.Message)" -ForegroundColor Red
}

$out = $p.StandardOutput.ReadToEnd()
$err = $p.StandardError.ReadToEnd()
$p.WaitForExit()

Write-Host "---STDOUT---`n$out"
if ($err) { Write-Host "---STDERR---`n$err" -ForegroundColor Yellow }
exit $p.ExitCode
