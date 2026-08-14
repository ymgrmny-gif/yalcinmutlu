$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$python = $null
$installedPython = Join-Path $env:LOCALAPPDATA 'Programs\Python\Python311\python.exe'
if (Test-Path $installedPython) {
  $python = $installedPython
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
  $python = 'py -3.11'
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
  $python = 'python'
} else {
  Write-Host 'Python 3.11+ bulunamadı.' -ForegroundColor Red
  exit 1
}

if (-not (Test-Path '.venv\Scripts\python.exe')) {
  Write-Host 'İlk kurulum: sanal ortam oluşturuluyor...'
  if ($python -eq 'py -3.11') { py -3.11 -m venv .venv }
  elseif ($python -eq 'python') { python -m venv .venv }
  else { & $python -m venv .venv }
}

$venvPython = Join-Path $PSScriptRoot '.venv\Scripts\python.exe'
$marker = Join-Path $PSScriptRoot '.venv\.deps-api-free-v1'
if (-not (Test-Path $marker)) {
  Write-Host 'Yerel konuşma tanıma paketleri kuruluyor...'
  & $venvPython -m pip install --disable-pip-version-check -r requirements.txt
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  New-Item -ItemType File -Path $marker -Force | Out-Null
}

$bridge = Join-Path $PSScriptRoot 'bridge'
New-Item -ItemType Directory -Path $bridge -Force | Out-Null

Write-Host ''
Write-Host 'Transdev Canlı Asistan (API gerektirmez) başlatılıyor...' -ForegroundColor Green
Write-Host 'İlk açılışta yerel Whisper modeli indirilebilir; bu yalnız bir kez olur.' -ForegroundColor Yellow
Write-Host 'ChatGPT Desktop Work için bridge klasörü:' -ForegroundColor Cyan
Write-Host $bridge -ForegroundColor Cyan
Write-Host ''
& $venvPython app_local.py @args
