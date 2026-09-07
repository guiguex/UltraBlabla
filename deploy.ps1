# Deploy to Cloudflare
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

# 0) Build frontend
if (-not $NoBuild -and $Target -in @('all','frontend')) {
    Run-Step 'bun install (root)'  { bun install }
    Run-Step 'bun run build:fe'    { bun run build:fe }
    # build:server is NOT needed for frontend-only deploy
    # Run-Step 'bun run build:server' { bun run build:server }
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

# 2) Gateway -> Cloudflare Worker
if ($Target -in @('all','gateway')) {
    Write-Host ''
    Write-Host '=== Deploy Gateway ===' -ForegroundColor Cyan
    Push-Location $GatewayDir
    try {
        if (-not $NoBuild) {
            Run-Step 'install gateway deps' { bun install }
        }
        if (-not $DryRun) {
            Run-Step 'wrangler deploy (gateway)' { npx wrangler deploy }
        }
    } finally {
        Pop-Location
    }
}

# 3) Silero VAD WebGPU DO
if ($Target -in @('all','silero')) {
    Write-Host ''
    Write-Host '=== Deploy Silero VAD DO ===' -ForegroundColor Cyan
    Push-Location $SileroDir
    try {
        if (-not (Test-Path 'node_modules')) {
            Run-Step 'npm install (silero)' { npm install --legacy-peer-deps }
        }
        if (-not $NoBuild) {
            Run-Step 'build silero (esbuild + patches)' { npm run build }
        }
        if (-not $DryRun) {
            Run-Step 'wrangler deploy (silero)' { npx wrangler deploy }
        }
    } finally {
        Pop-Location
    }
}

Write-Host ''
Write-Host '=== OK ===' -ForegroundColor Green