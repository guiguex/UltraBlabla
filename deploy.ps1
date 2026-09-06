# UltraBlabla -- Deploy to Cloudflare (ultrablabla.pages.dev + ultrablabla-gateway)
# Usage :
#    .\deploy.ps1                       (frontend + gateway)
#    .\deploy.ps1 -Target frontend
#    .\deploy.ps1 -Target gateway
#    .\deploy.ps1 -NoBuild
#    .\deploy.ps1 -DryRun

param(
    [ValidateSet('all','frontend','gateway','silero')]
    [string]$Target = 'all',
    [switch]$NoBuild,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$Root          = 'd:\Applications\UltraBlabla'
$FrontendDir   = Join-Path $Root 'public'
$GatewayDir    = Join-Path $Root 'services\ultrablabla-gateway-worker'
$SileroDir     = Join-Path $Root 'silero-vad-webgpu-do'
$PagesProject  = 'ultrablabla'
$Branch        = 'main'

Write-Host ''
Write-Host '=== UltraBlabla Deploy ===' -ForegroundColor Cyan
Write-Host "target=$Target  noBuild=$NoBuild  dryRun=$DryRun" -ForegroundColor DarkGray
Write-Host ''

Set-Location $Root

function Run-Step($title, [scriptblock]$cmd) {
    Write-Host "[step] $title" -ForegroundColor Yellow
    if ($DryRun) {
        Write-Host "  [dry-run] (skip)" -ForegroundColor DarkGray
    } else {
        & $cmd
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[FAIL] $title (code $LASTEXITCODE)" -ForegroundColor Red
            exit $LASTEXITCODE
        }
    }
}

# 0) Build
if (-not $NoBuild -and $Target -in @('all','frontend')) {
    Run-Step 'bun install'             { bun install --frozen-lockfile }
    Run-Step 'bun run build:fe'       { bun run build:fe }
    Run-Step 'bun run build:server'   { bun run build:server }
}

# 1) Frontend -> Cloudflare Pages
if ($Target -in @('all','frontend')) {
    Write-Host ''
    Write-Host '=== Deploy Frontend (Cloudflare Pages) ===' -ForegroundColor Cyan
    if (-not (Test-Path (Join-Path $FrontendDir 'index.html'))) {
        Write-Host "[FAIL] public/index.html introuvable" -ForegroundColor Red
        exit 1
    }
    Run-Step "wrangler pages deploy ($PagesProject)" {
        npx wrangler pages deploy $FrontendDir --project-name $PagesProject --branch $Branch --commit-dirty=true
    }
}

# 2) Gateway -> Cloudflare Worker (ultrablabla-gateway)
if ($Target -in @('all','gateway')) {
    Write-Host ''
    Write-Host '=== Deploy Gateway (Cloudflare Worker) ===' -ForegroundColor Cyan
    if (-not (Test-Path (Join-Path $GatewayDir 'wrangler.toml'))) {
        Write-Host "[FAIL] services\ultrablabla-gateway-worker\wrangler.toml introuvable" -ForegroundColor Red
        exit 1
    }
    Push-Location $GatewayDir
    try {
        Run-Step 'wrangler deploy --dry-run (validation toml)' {
            npx wrangler deploy --dry-run --outdir (Join-Path $env:TEMP 'wrangler-dryrun') 2>&1 | Out-Null
        }
        Run-Step 'wrangler deploy (cible: ultrablabla-gateway)' { npx wrangler deploy }
    } finally {
        Pop-Location
    }
}

# 3) Silero VAD WebGPU Durable Object
if ($Target -in @('all','silero')) {
    Write-Host ''
    Write-Host '=== Deploy Silero VAD WebGPU Durable Object ===' -ForegroundColor Cyan
    if (-not (Test-Path (Join-Path $SileroDir 'wrangler.jsonc'))) {
        Write-Host "[FAIL] silero-vad-webgpu-do\wrangler.jsonc introuvable" -ForegroundColor Red
        exit 1
    }
    if (-not (Test-Path (Join-Path $SileroDir 'node_modules'))) {
        Run-Step 'npm install silero-vad-webgpu-do' {
            Push-Location $SileroDir
            try { npm install --legacy-peer-deps } finally { Pop-Location }
        }
    }
    Push-Location $SileroDir
    try {
        Run-Step 'wrangler deploy (silero-vad-webgpu-do)' { npx wrangler deploy }
    } finally {
        Pop-Location
    }
}

Write-Host ''
Write-Host '=== OK -> https://ultrablabla.pages.dev ===' -ForegroundColor Green