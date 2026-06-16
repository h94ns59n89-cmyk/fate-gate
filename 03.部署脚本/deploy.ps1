# =============================================================================
# deploy.ps1 - AI命理人格系统 (fate-gate) Windows 部署脚本
# 支持: Docker / 本地直接部署
# 架构: x86_64 / arm64
# 环境: Windows (PowerShell 5.1+)
# =============================================================================

param(
  [ValidateSet("docker", "bare")]
  [string]$Mode = "docker",
  [string]$EnvFile = ".env"
)

$ErrorActionPreference = "Stop"

$ProjectDir = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$AppName = "fate-gate"
$AppPort = if ($env:PORT) { $env:PORT } else { 3000 }

function Write-Info  { Write-Host "[INFO]  $args" -ForegroundColor Cyan }
function Write-Ok    { Write-Host "[OK]    $args" -ForegroundColor Green }
function Write-Warn  { Write-Host "[WARN]  $args" -ForegroundColor Yellow }
function Write-Error { Write-Host "[ERROR] $args" -ForegroundColor Red }

# ---- Pre-flight checks ----
function Check-Prerequisites {
  Write-Info "Running pre-flight checks..."

  if ($Mode -eq "docker") {
    $dockerVer = docker --version 2>$null
    if (-not $dockerVer) {
      Write-Error "Docker is not installed. Install Docker Desktop for Windows first."
      exit 1
    }
    Write-Ok "Docker: $dockerVer"

    $composeVer = docker compose version 2>$null
    if (-not $composeVer) {
      Write-Error "Docker Compose is not available."
      exit 1
    }
    Write-Ok "Compose: $composeVer"
  } else {
    $nodeVer = node --version 2>$null
    if (-not $nodeVer) {
      Write-Error "Node.js is not installed. Download from https://nodejs.org/"
      exit 1
    }
    Write-Ok "Node.js: $nodeVer"

    $npmVer = npm --version 2>$null
    if (-not $npmVer) {
      Write-Error "npm is not available."
      exit 1
    }
    Write-Ok "npm: $npmVer"
  }
}

# ---- .env setup ----
function Setup-Env {
  $envPath = Join-Path $ProjectDir $EnvFile
  $examplePath = Join-Path $ProjectDir ".env.example"

  if (Test-Path $envPath) {
    Write-Ok ".env file found: $EnvFile"
  } elseif (Test-Path $examplePath) {
    Copy-Item -Path $examplePath -Destination $envPath
    Write-Warn "Created $EnvFile from .env.example — EDIT it with real values!"
    Write-Warn "Required: DATABASE_URL, JWT_SECRET, WECHAT_*, AI keys"
  } else {
    Write-Error "No .env.example found. Create $EnvFile manually."
    exit 1
  }
}

# ---- Docker deployment ----
function Deploy-Docker {
  Write-Info "Deploying with Docker Compose..."

  Setup-Env

  Push-Location $ProjectDir
  try {
    Write-Info "Building and starting services..."
    docker compose build
    docker compose up -d

    Write-Info "Waiting for app to start..."
    $healthy = $false
    for ($i = 1; $i -le 30; $i++) {
      try {
        $req = Invoke-WebRequest -Uri "http://localhost:$AppPort/api/v1/health/live" -UseBasicParsing -TimeoutSec 3
        if ($req.StatusCode -eq 200) {
          $healthy = $true
          break
        }
      } catch {}
      Start-Sleep -Seconds 2
    }

    if (-not $healthy) {
      Write-Error "App failed to start. Check logs: docker compose logs app"
      exit 1
    }
    Write-Ok "App is healthy!"

    Write-Info "Running database migrations..."
    docker compose exec -T app npx prisma migrate deploy

    Write-Ok "Docker deployment complete!"
    Write-Info "App:     http://localhost:$AppPort"
    Write-Info "Logs:    docker compose logs -f app"
    Write-Info "Stop:    docker compose down"
  } finally {
    Pop-Location
  }
}

# ---- Bare-metal deployment ----
function Deploy-Bare {
  Write-Info "Deploying directly on host..."

  Setup-Env

  Push-Location $ProjectDir
  try {
    Write-Info "Installing dependencies..."
    npm ci --ignore-scripts

    Write-Info "Generating Prisma client..."
    npx prisma generate

    Write-Info "Running database migrations..."
    npx prisma migrate deploy

    Write-Info "Building Next.js app..."
    npm run build

    # Check for PM2 (via npm)
    $pm2Path = Get-Command "pm2" -ErrorAction SilentlyContinue
    if ($pm2Path) {
      Write-Info "Starting with PM2..."
      pm2 delete $AppName 2>$null
      pm2 start ".\.next\standalone\server.js" --name $AppName -- -p $AppPort
      pm2 save
      Write-Ok "PM2 started — app name: $AppName"
    } else {
      Write-Warn "PM2 not found. Starting directly in this window."
      Write-Warn "Press Ctrl+C to stop. Install PM2: npm i -g pm2"
      $env:NODE_ENV = "production"
      $env:PORT = $AppPort
      node ".\.next\standalone\server.js"
    }

    Write-Info "Waiting for app to start..."
    $healthy = $false
    for ($i = 1; $i -le 15; $i++) {
      try {
        $req = Invoke-WebRequest -Uri "http://localhost:$AppPort/api/v1/health/live" -UseBasicParsing -TimeoutSec 3
        if ($req.StatusCode -eq 200) {
          $healthy = $true
          break
        }
      } catch {}
      Start-Sleep -Seconds 2
    }

    if (-not $healthy) {
      Write-Error "App failed to start. Check logs for details."
      exit 1
    }
    Write-Ok "App is healthy!"

    Write-Ok "Bare-metal deployment complete!"
    Write-Info "App: http://localhost:$AppPort"
  } finally {
    Pop-Location
  }
}

# ---- Main ----
Clear-Host
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  fate-gate — AI命理人格系统 部署脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Check-Prerequisites

switch ($Mode) {
  "docker" { Deploy-Docker }
  "bare"   { Deploy-Bare }
}

Write-Host ""
Write-Ok "All done!"
