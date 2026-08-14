$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$python = $null
if (Get-Command py -ErrorAction SilentlyContinue) {
  $python = 'py -3.11'
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
  $python = 'python'
} else {
  Write-Host 'Python 3.11+ bulunamadı. Önce Python kurun.' -ForegroundColor Red
  exit 1
}

if (-not (Test-Path '.venv\Scripts\python.exe')) {
  Write-Host 'İlk kurulum: sanal ortam oluşturuluyor...'
  if ($python -eq 'py -3.11') { py -3.11 -m venv .venv } else { python -m venv .venv }
}

$venvPython = Join-Path $PSScriptRoot '.venv\Scripts\python.exe'
$marker = Join-Path $PSScriptRoot '.venv\.deps-installed'
if (-not (Test-Path $marker)) {
  Write-Host 'Gerekli paketler kuruluyor...'
  & $venvPython -m pip install --disable-pip-version-check -r requirements.txt
  New-Item -ItemType File -Path $marker -Force | Out-Null
}

if (-not (Test-Path '.env')) {
  Copy-Item '.env.example' '.env'
  Write-Host ''
  Write-Host 'OPENAI_API_KEY henüz ayarlı değil.' -ForegroundColor Yellow
  Write-Host '.env dosyası açılıyor. Anahtarınızı OPENAI_API_KEY= satırına ekleyin; anahtarı GitHub veya sohbet içine yapıştırmayın.' -ForegroundColor Yellow
  Start-Process notepad.exe (Join-Path $PSScriptRoot '.env')
  Write-Host 'Kaydedince bu start.ps1 dosyasını tekrar çalıştırın.'
  exit 0
}

$envText = Get-Content '.env' -Raw
if ($envText -notmatch '(?m)^OPENAI_API_KEY=\S+') {
  Write-Host 'OPENAI_API_KEY .env içinde boş.' -ForegroundColor Yellow
  Start-Process notepad.exe (Join-Path $PSScriptRoot '.env')
  exit 1
}

Write-Host ''
Write-Host 'Transdev Canlı Asistan başlatılıyor...' -ForegroundColor Green
& $venvPython app.py @args
