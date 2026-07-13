#!/usr/bin/env bash
# Expose the local members API (port 8765) with a Pinggy HTTPS tunnel,
# and write the public URL into ../members-api-url.json.
# Prefer starting the bot (./bot/run-bot.sh) — it does this automatically
# and also updates the Telegram menu button so every device gets ?api=.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${MEMBERS_API_PORT:-8765}"
OUT="$ROOT/members-api-url.json"

if ! command -v ssh >/dev/null 2>&1; then
  echo "ssh is required for the public tunnel."
  exit 1
fi

echo "Starting Pinggy tunnel -> http://127.0.0.1:${PORT}"
echo "Leave this running while you want live catalog sync."
echo

ssh -p 443 \
  -o StrictHostKeyChecking=no \
  -o UserKnownHostsFile=/dev/null \
  -o ServerAliveInterval=30 \
  -o ServerAliveCountMax=3 \
  -o ExitOnForwardFailure=yes \
  -R0:127.0.0.1:"${PORT}" \
  a.pinggy.io 2>&1 | while IFS= read -r line; do
  echo "$line"
  url="$(echo "$line" | grep -Eo 'https://[a-zA-Z0-9.-]+\.(free\.pinggy\.net|run\.pinggy-free\.link)' | head -1 || true)"
  if [[ -n "${url}" ]]; then
    printf '{\n  "url": "%s",\n  "updatedAt": "%s"\n}\n' "$url" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$OUT"
    echo ""
    echo "Wrote $OUT"
    echo "Public members API: $url"
    echo "Restart the bot (or wait for it) so the Telegram menu button picks this up."
    echo ""
  fi
done
