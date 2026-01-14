#!/usr/bin/env bash
set -euo pipefail

# One-command local setup + run for fresh clones.
# - Installs root + frontend dependencies
# - Initializes SQLite schema / seed users
# - Starts backend (3000) + frontend (5173)

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"

echo "==> Using project root: $ROOT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: node is not installed. Install Node.js (recommended: via nvm) and retry."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm is not installed. Install Node.js (includes npm) and retry."
  exit 1
fi

echo "==> Node: $(node -v)"
echo "==> npm:  $(npm -v)"

echo "==> Installing backend dependencies..."
cd "$ROOT_DIR"
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

echo "==> Installing frontend dependencies..."
cd "$FRONTEND_DIR"
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

echo "==> Initializing database (db.sqlite)..."
cd "$ROOT_DIR"
node init_db.js

cleanup() {
  echo
  echo "==> Shutting down..."
  [[ -n "${BACKEND_PID:-}" ]] && kill "$BACKEND_PID" 2>/dev/null || true
  [[ -n "${FRONTEND_PID:-}" ]] && kill "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "==> Starting backend on http://localhost:3000 ..."
node server.js &
BACKEND_PID=$!

echo "==> Starting frontend on http://localhost:5173 ..."
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!

echo
echo "==> Running!"
echo "    Frontend: http://localhost:5173"
echo "    Backend:  http://localhost:3000"
echo
echo "Press Ctrl+C to stop."

wait "$BACKEND_PID" "$FRONTEND_PID"
