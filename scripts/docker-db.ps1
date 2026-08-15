$ErrorActionPreference = "Stop"

$composeArgs = @($args)
if ($composeArgs.Count -eq 0) {
  $composeArgs = @("up", "-d")
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $projectRoot ".env"
$databaseUrlLine = Get-Content -LiteralPath $envPath |
  Where-Object { $_ -match "^DATABASE_URL=" } |
  Select-Object -First 1

if (-not $databaseUrlLine) {
  throw ".env에서 DATABASE_URL을 찾을 수 없습니다."
}

$databaseUrl = ($databaseUrlLine -replace "^DATABASE_URL=", "").Trim('"')
$uri = [Uri]$databaseUrl
$separator = $uri.UserInfo.IndexOf(":")

if ($separator -lt 1) {
  throw "DATABASE_URL의 사용자 정보를 읽을 수 없습니다."
}

$env:POSTGRES_USER = [Uri]::UnescapeDataString($uri.UserInfo.Substring(0, $separator))
$env:POSTGRES_PASSWORD = [Uri]::UnescapeDataString($uri.UserInfo.Substring($separator + 1))
$env:POSTGRES_DB = [Uri]::UnescapeDataString($uri.AbsolutePath.TrimStart("/"))

Push-Location $projectRoot
try {
  & docker compose @composeArgs
  exit $LASTEXITCODE
} finally {
  Pop-Location
}
