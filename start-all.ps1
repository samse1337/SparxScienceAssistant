$ErrorActionPreference = 'Stop'
$root = 'D:\AutoSparxScience'
$profile = "$env:USERPROFILE\sparx-profile"
$keyFile = Join-Path $root '.dragonapi-key'
$chrome = "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"
if (!(Test-Path $chrome)) { $chrome = "$env:ProgramFiles(x86)\Google\Chrome\Application\chrome.exe" }
if (!(Test-Path $chrome)) { throw 'Chrome not found' }
$savedKey = if (Test-Path $keyFile) { (Get-Content $keyFile -Raw).Trim() } else { '' }
if (-not $savedKey) { $savedKey = Read-Host 'Enter DragonAPI key'; Set-Content $keyFile $savedKey -NoNewline -Encoding UTF8 }
$env:OPENAI_API_KEY = $savedKey
$env:OPENAI_BASE_URL = 'https://newapi.dragon3api.com/v1'
$env:OPENAI_MODEL = 'gpt-6.1-sol'
Start-Process $chrome -ArgumentList '--remote-debugging-port=9222', "--user-data-dir=$profile", "--load-extension=$root", 'https://science.sparx-learning.com/'
Start-Process powershell -ArgumentList '-NoExit', '-Command', "Set-Location '$root'; node server.js"
Start-Process powershell -ArgumentList '-NoExit', '-Command', "Set-Location '$root'; node automation-server.mjs"
Write-Host 'Chrome, AI API, and Playwright automation servers started.'
Read-Host 'Press Enter to close this launcher'
