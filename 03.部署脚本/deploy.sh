#!/usr/bin/env bash
# =============================================================================
# deploy.sh - AI命理人格系统 (fate-gate) 部署脚本
# 支持: Docker Compose / 本地裸机部署
# 架构: x86_64 / arm64
# 环境: Linux / macOS
# =============================================================================

set -euo pipefail

# ---- Color output ----
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info()  { echo -e "${CYAN}[INFO]${NC}  $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ---- Config ----
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

MODE="${1:-docker}"   # docker | bare
ENV_FILE="${2:-.env}"

APP_PORT="${PORT:-3000}"
APP_NAME="fate-gate"

# ---- Pre-flight checks ----
check_prerequisites() {
  log_info "Running pre-flight checks..."

  if [[ "$MODE" == "docker" ]]; then
    if ! command -v docker &>/dev/null; then
      log_error "Docker is not installed. Install it first: https://docs.docker.com/engine/install/"
      exit 1
    fi
    if ! docker compose version &>/dev/null; then
      log_warn "docker compose plugin not found, falling back to docker-compose"
      if ! command -v docker-compose &>/dev/null; then
        log_error "docker-compose is not installed."
        exit 1
      fi
      COMPOSE_CMD="docker-compose"
    else
      COMPOSE_CMD="docker compose"
    fi
    log_ok "Docker: $(docker --version)"
    log_ok "Compose: $($COMPOSE_CMD version)"
  else
    if ! command -v node &>/dev/null; then
      log_error "Node.js is not installed."
      exit 1
    fi
    NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
    if [[ "$NODE_VER" -lt 18 ]]; then
      log_error "Node.js >= 18 required (current: $(node -v)). Use nvm to upgrade."
      exit 1
    fi
    log_ok "Node.js: $(node -v)"
    log_ok "npm: $(npm -v)"

    if ! command -v psql &>/dev/null; then
      log_warn "psql not found — make sure PostgreSQL is running and accessible."
    fi
  fi
}

# ---- .env setup ----
setup_env() {
  if [[ -f "$ENV_FILE" ]]; then
    log_ok ".env file found: $ENV_FILE"
  elif [[ -f ".env.example" ]]; then
    cp .env.example "$ENV_FILE"
    log_warn "Created $ENV_FILE from .env.example — PLEASE edit it with real values!"
    log_warn "Required: DATABASE_URL, JWT_SECRET, WECHAT_*, AI keys"
  else
    log_error "No .env.example found. Create $ENV_FILE manually."
    exit 1
  fi
}

# ---- Docker deployment ----
deploy_docker() {
  log_info "Deploying with Docker Compose..."

  setup_env

  # Generate Prisma migration if needed
  if [[ ! -d "prisma/migrations" ]]; then
    log_warn "No Prisma migrations found. Creating initial migration..."
    # Use a temporary container to generate migration
    docker run --rm -v "$PROJECT_DIR:/app" -w /app node:20-alpine \
      sh -c "npm ci --ignore-scripts && npx prisma migrate dev --name init --skip-seed" 2>/dev/null || true
  fi

  log_info "Building and starting services..."
  $COMPOSE_CMD build
  $COMPOSE_CMD up -d

  log_info "Waiting for app to be healthy..."
  for i in $(seq 1 30); do
    if curl -sf "http://localhost:${APP_PORT}/api/v1/health/live" >/dev/null 2>&1; then
      log_ok "App is healthy!"
      break
    fi
    if [[ "$i" -eq 30 ]]; then
      log_error "App failed to start within 60s. Check logs: $COMPOSE_CMD logs app"
      exit 1
    fi
    sleep 2
  done

  # Run database migrations
  log_info "Running database migrations..."
  $COMPOSE_CMD exec -T app npx prisma migrate deploy

  log_ok "Docker deployment complete!"
  log_info "App:     http://localhost:${APP_PORT}"
  log_info "Logs:    $COMPOSE_CMD logs -f app"
  log_info "Stop:    $COMPOSE_CMD down"
}

# ---- Bare-metal deployment ----
deploy_bare() {
  log_info "Deploying directly on host..."

  setup_env

  # Source env
  set -a; source "$ENV_FILE"; set +a

  log_info "Installing dependencies..."
  npm ci --ignore-scripts

  log_info "Generating Prisma client..."
  npx prisma generate

  log_info "Running database migrations..."
  npx prisma migrate deploy

  log_info "Building Next.js app..."
  npm run build

  # Choose process manager
  if command -v pm2 &>/dev/null; then
    log_info "Starting with PM2..."
    pm2 delete "$APP_NAME" 2>/dev/null || true
    pm2 start .next/standalone/server.js --name "$APP_NAME" -- -p "$APP_PORT"
    pm2 save
    log_ok "PM2 started — app name: $APP_NAME"
  elif command -v systemctl &>/dev/null; then
    log_warn "PM2 not found. Creating systemd service instead..."
    sudo tee "/etc/systemd/system/${APP_NAME}.service" >/dev/null <<SERVICE
[Unit]
Description=AI命理人格系统 - fate-gate
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR
EnvironmentFile=$PROJECT_DIR/$ENV_FILE
ExecStart=$(which node) $PROJECT_DIR/.next/standalone/server.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=$APP_PORT

[Install]
WantedBy=multi-user.target
SERVICE
    sudo systemctl daemon-reload
    sudo systemctl enable "$APP_NAME"
    sudo systemctl start "$APP_NAME"
    log_ok "systemd service created and started: $APP_NAME"
  else
    log_warn "No PM2 or systemd found. Starting in foreground..."
    log_warn "Use Ctrl+C to stop, or install PM2: npm i -g pm2"
    NODE_ENV=production PORT="$APP_PORT" node .next/standalone/server.js
  fi

  log_info "Waiting for app to start..."
  for i in $(seq 1 15); do
    if curl -sf "http://localhost:${APP_PORT}/api/v1/health/live" >/dev/null 2>&1; then
      log_ok "App is healthy!"
      break
    fi
    if [[ "$i" -eq 15 ]]; then
      log_error "App failed to start. Check logs for details."
      exit 1
    fi
    sleep 2
  done

  log_ok "Bare-metal deployment complete!"
  log_info "App: http://localhost:${APP_PORT}"
}

# ---- Main ----
main() {
  echo ""
  echo -e "${CYAN}========================================${NC}"
  echo -e "${CYAN}  fate-gate — AI命理人格系统 部署脚本${NC}"
  echo -e "${CYAN}========================================${NC}"
  echo ""

  case "$MODE" in
    docker)
      check_prerequisites
      deploy_docker
      ;;
    bare)
      check_prerequisites
      deploy_bare
      ;;
    *)
      log_error "Usage: $0 {docker|bare} [env-file]"
      log_info "  docker  — Deploy with Docker Compose (default)"
      log_info "  bare    — Deploy directly on host (PM2 / systemd)"
      exit 1
      ;;
  esac

  echo ""
  log_ok "All done!"
}

main
