#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

# Auto-detect npm / node if not on PATH (Anaconda, nvm, etc.)
for candidate in /opt/anaconda3/bin /opt/homebrew/bin /usr/local/bin "$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node 2>/dev/null | sort -V | tail -1)/bin"; do
  if [ -x "$candidate/npm" ] && ! command -v npm &>/dev/null; then
    export PATH="$candidate:$PATH"
  fi
done

# ── Backend setup ─────────────────────────────────────────────────────────────
echo "📦 Cài đặt backend dependencies..."
cd "$BACKEND"

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi

source .venv/bin/activate
pip install -q -r requirements.txt

echo "🚀 Khởi động FastAPI backend (port 8000)..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# ── Frontend setup ────────────────────────────────────────────────────────────
cd "$FRONTEND"

if [ ! -d "node_modules" ]; then
  echo "📦 Cài đặt frontend dependencies..."
  npm install
fi

echo "🎨 Khởi động React frontend (port 5173)..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Ứng dụng đang chạy!"
echo "   Frontend : http://localhost:5173"
echo "   Backend  : http://localhost:8000"
echo "   API docs : http://localhost:8000/docs"
echo ""
echo "Nhấn Ctrl+C để dừng tất cả."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Đã dừng.'" INT TERM
wait
