#!/usr/bin/env bash
# J2026VaultBot — start Telegram bot (macOS / Linux)
# Usage: ./bot/run-bot.sh   OR   ./run-bot.sh
set -euo pipefail

BOT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$BOT_DIR/.." && pwd)"
cd "$ROOT"

PYTHON_BIN=""
if command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="python3"
elif command -v python >/dev/null 2>&1; then
  PYTHON_BIN="python"
else
  echo "Python 3 is required. Install Python 3, then run this script again."
  exit 1
fi

if [[ ! -f "$BOT_DIR/config.py" ]]; then
  echo "Missing bot/config.py"
  echo "Copy bot/config.example.py → bot/config.py and add your bot token."
  exit 1
fi

for img in welcome.png membership.png help.png menu.png; do
  if [[ ! -f "$BOT_DIR/assets/$img" ]]; then
    echo "Missing bot/assets/$img"
    exit 1
  fi
done

# Stop anything else already polling this bot (LaunchAgent / old terminals)
stop_other_instances() {
  echo "Checking for other bot instances..."

  if command -v launchctl >/dev/null 2>&1; then
    if launchctl print "gui/$(id -u)/com.j2026.vaultbot" >/dev/null 2>&1; then
      echo "  Stopping LaunchAgent com.j2026.vaultbot ..."
      launchctl bootout "gui/$(id -u)/com.j2026.vaultbot" 2>/dev/null || true
      sleep 1
    fi
  fi

  # Kill other python processes running this bot/main.py (not this shell's child yet)
  if command -v pgrep >/dev/null 2>&1; then
    local pids
    pids="$(pgrep -f "$BOT_DIR/main.py" 2>/dev/null || true)"
    if [[ -n "${pids}" ]]; then
      echo "  Stopping existing bot process(es): $pids"
      # shellcheck disable=SC2086
      kill $pids 2>/dev/null || true
      sleep 1
      # shellcheck disable=SC2086
      kill -9 $pids 2>/dev/null || true
    fi
  fi
}

stop_other_instances

if [[ ! -d "$ROOT/.venv" ]]; then
  echo "Creating virtual environment in .venv ..."
  "$PYTHON_BIN" -m venv "$ROOT/.venv"
fi

# shellcheck disable=SC1091
source "$ROOT/.venv/bin/activate"

echo "Installing / updating dependencies..."
python -m pip install --upgrade pip >/dev/null
python -m pip install -r "$BOT_DIR/requirements.txt"

mkdir -p "$BOT_DIR/logs"

echo ""
echo "Starting J2026VaultBot..."
echo "  Assets: $BOT_DIR/assets"
echo "  Press Ctrl+C to stop."
echo ""
exec python "$BOT_DIR/main.py"
