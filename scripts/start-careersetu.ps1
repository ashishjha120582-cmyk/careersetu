$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $projectRoot ".env"

if (-not (Test-Path $envPath)) {
  Write-Host "Missing .env file. Create it from .env.example and set OPENROUTER_API_KEY."
  exit 1
}

Set-Location $projectRoot
node --use-system-ca prototype\server.js
