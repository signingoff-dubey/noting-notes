#!/usr/bin/env bash
set -e

# ── Colours ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()    { echo -e "         $1"; }
success() { echo -e "  ${GREEN}✓${NC}  $1"; }
error()   { echo -e "  ${RED}✗  ERROR: $1${NC}"; }

echo ""
echo "  ============================================"
echo "    NOTING — Think local. Think deep."
echo "  ============================================"
echo ""

# ── Track background PIDs for cleanup ────────────────────────────────────────
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
    echo ""
    echo "  Shutting down..."
    [ -n "$BACKEND_PID" ]  && kill "$BACKEND_PID"  2>/dev/null
    [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null
    wait 2>/dev/null
    echo "  Stopped. Goodbye."
}
trap cleanup EXIT INT TERM

# ── 1. Check Python ───────────────────────────────────────────────────────────
echo "  [1/6] Checking Python..."
PYTHON=""
for cmd in python3 python; do
    if command -v "$cmd" &>/dev/null; then
        VER=$("$cmd" -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>/dev/null)
        MAJOR=$(echo "$VER" | cut -d. -f1)
        MINOR=$(echo "$VER" | cut -d. -f2)
        if [ "$MAJOR" -ge 3 ] && [ "$MINOR" -ge 11 ]; then
            PYTHON="$cmd"
            break
        fi
    fi
done

if [ -z "$PYTHON" ]; then
    error "Python 3.11+ not found."
    echo ""
    echo "  Install options:"
    echo "    macOS:   brew install python@3.12"
    echo "    Linux:   sudo apt install python3.12  (Ubuntu/Debian)"
    echo "    Manual:  https://www.python.org/downloads/"
    echo ""
    exit 1
fi
success "Python $($PYTHON --version 2>&1 | awk '{print $2}') found ($PYTHON)"

# ── 2. Check Node.js ──────────────────────────────────────────────────────────
echo "  [2/6] Checking Node.js..."
if ! command -v node &>/dev/null; then
    error "Node.js not found."
    echo ""
    echo "  Install options:"
    echo "    macOS:   brew install node"
    echo "    Linux:   sudo apt install nodejs npm"
    echo "    Manual:  https://nodejs.org/"
    echo ""
    exit 1
fi
success "Node.js $(node --version) found"

# ── 3. Python venv + backend deps ─────────────────────────────────────────────
echo "  [3/6] Setting up backend environment..."
if [ ! -d "backend/venv" ]; then
    info "Creating virtual environment..."
    "$PYTHON" -m venv backend/venv
fi

info "Installing backend dependencies..."
backend/venv/bin/pip install -r backend/requirements.txt -q --disable-pip-version-check
success "Backend environment ready"

# ── 4. Config files + data dirs ───────────────────────────────────────────────
echo "  [4/6] Checking configuration..."
if [ ! -f "backend/.env" ]; then
    info "Creating backend/.env..."
    cat > backend/.env <<'EOF'
HOST=0.0.0.0
PORT=8000
DATA_DIR=data
OLLAMA_URL=http://localhost:11434
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001
VAULT_BCRYPT_ROUNDS=12
EOF
fi

if [ ! -f "frontend/.env.local" ]; then
    info "Creating frontend/.env.local..."
    cat > frontend/.env.local <<'EOF'
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=NOTING
EOF
fi

mkdir -p data/attachments data/ai_memory data/embeddings data/versions
success "Configuration ready"

# ── 5. Start backend ──────────────────────────────────────────────────────────
echo "  [5/6] Starting backend server..."
backend/venv/bin/python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend health check
TIMEOUT=30
ELAPSED=0
until curl -s http://localhost:8000/api/health >/dev/null 2>&1; do
    sleep 1
    ELAPSED=$((ELAPSED + 1))
    if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
        error "Backend failed to start after ${TIMEOUT}s. Check for port conflicts."
        exit 1
    fi
done
success "Backend ready on http://localhost:8000"

# ── 6. Frontend ───────────────────────────────────────────────────────────────
echo "  [6/6] Starting frontend..."
if [ ! -d "frontend/node_modules" ]; then
    info "Running npm install — this may take a minute..."
    (cd frontend && npm install --silent)
fi

(cd frontend && npm run dev -- --port 3000 --strictPort false) &
FRONTEND_PID=$!

# Wait for frontend (try 3000, fallback 3001)
TIMEOUT=60
ELAPSED=0
FRONTEND_PORT=3000
until curl -s http://localhost:3000 >/dev/null 2>&1 || curl -s http://localhost:3001 >/dev/null 2>&1; do
    sleep 1
    ELAPSED=$((ELAPSED + 1))
    if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
        error "Frontend failed to start after ${TIMEOUT}s."
        exit 1
    fi
done

# Detect which port
if curl -s http://localhost:3001 >/dev/null 2>&1 && ! curl -s http://localhost:3000 >/dev/null 2>&1; then
    FRONTEND_PORT=3001
fi
success "Frontend ready on http://localhost:${FRONTEND_PORT}"

# ── Open browser ──────────────────────────────────────────────────────────────
URL="http://localhost:${FRONTEND_PORT}"
if command -v open &>/dev/null; then
    open "$URL"               # macOS
elif command -v xdg-open &>/dev/null; then
    xdg-open "$URL"           # Linux
fi

echo ""
echo "  ============================================"
echo "    NOTING is running!"
echo "    App  → $URL"
echo "    API  → http://localhost:8000"
echo ""
echo "    Press Ctrl+C to stop both servers."
echo "  ============================================"
echo ""

# Keep running until Ctrl+C
wait
