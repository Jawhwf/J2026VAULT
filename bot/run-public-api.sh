#!/usr/bin/env bash
# Expose the local members API (port 8765) with a quick Cloudflare Tunnel,
# and write the public URL into ../members-api-url.json for the Mini App.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${MEMBERS_API_PORT:-8765}"
OUT="$ROOT/members-api-url.json"

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "cloudflared not found."
  echo "Install: brew install cloudflare/cloudflare/cloudflared"
  exit 1
fi

echo "Starting Cloudflare quick tunnel -> http://127.0.0.1:${PORT}"
echo "Leave this running. Upload members-api-url.json (and members.json) to GitHub Pages when the URL appears."
echo

cloudflared tunnel --url "http://127.0.0.1:${PORT}" 2>&1 | while IFS= read -r line; do
  echo "$line"
  if [[ "$line" =~ https://[a-zA-Z0-9.-]+\.trycloudflare\.com ]]; then
    url="$(echo "$line" | grep -Eo 'https://[a-zA-Z0-9.-]+\.trycloudflare\.com' | head -1)"
    if [[ -n "$url" ]]; then
      printf '{\n  "url": "%s",\n  "updatedAt": "%s"\n}\n' "$url" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$OUT"
      echo ""
      echo "Wrote $OUT"
      echo "Public members API: $url"
      echo "Re-upload members-api-url.json to GitHub Pages so Mini App users can sync."
      echo ""
    fi
  fi
done
