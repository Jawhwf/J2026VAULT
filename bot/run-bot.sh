#!/usr/bin/env bash
# Start J2026VaultBot from this folder.
# Usage: ./bot/run-bot.sh
set -euo pipefail

BOT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$BOT_DIR/.." && pwd)"
cd "$BOT_DIR"

if command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="python3"
elif command -v python >/dev/null 2>&1; then
  PYTHON_BIN="python"
else
  echo "Python 3 is required."
  exit 1
fi

if [[ ! -f "$BOT_DIR/config.py" ]]; then
  echo "Missing bot/config.py"
  echo "Copy bot/config.example.py → bot/config.py and add your bot token."
  exit 1
fi

for base in welcome membership help menu; do
  if [[ ! -f "$BOT_DIR/assets/${base}.jpg" && ! -f "$BOT_DIR/assets/${base}.png" ]]; then
    echo "Missing bot/assets/${base}.jpg (or .png)"
    exit 1
  fi
done

echo "Stopping other bot instances..."
if command -v launchctl >/dev/null 2>&1; then
  launchctl bootout "gui/$(id -u)/com.j2026.vaultbot" 2>/dev/null || true
fi
if command -v pgrep >/dev/null 2>&1; then
  pids="$(pgrep -f "$BOT_DIR/main.py" 2>/dev/null || true)"
  if [[ -n "${pids}" ]]; then
    # shellcheck disable=SC2086
    kill $pids 2>/dev/null || true
    sleep 2
    # shellcheck disable=SC2086
    kill -9 $pids 2>/dev/null || true
  fi
fi

if [[ ! -d "$ROOT/.venv" ]]; then
  echo "Creating $ROOT/.venv ..."
  "$PYTHON_BIN" -m venv "$ROOT/.venv"
fi
# shellcheck disable=SC1091
source "$ROOT/.venv/bin/activate"

python -m pip install --upgrade pip >/dev/null
python -m pip install -r "$BOT_DIR/requirements.txt"

mkdir -p "$BOT_DIR/logs" "$BOT_DIR/data"
if [[ ! -f "$BOT_DIR/data/members.json" ]]; then
  printf '%s\n' '{ "updatedAt": null, "members": [] }' > "$BOT_DIR/data/members.json"
fi

echo ""
echo "Starting J2026VaultBot..."
echo "  $BOT_DIR"
echo "  Members: $BOT_DIR/data/members.json"
echo "  Press Ctrl+C to stop."
echo ""
exec python "$BOT_DIR/main.py"
