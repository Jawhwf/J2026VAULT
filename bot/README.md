# J2026VaultBot

Everything for the Telegram bot lives in this folder.

## Start

```bash
./bot/run-bot.sh
```

Or Windows: `bot\run-bot.bat`

LaunchAgent label (macOS): `com.j2026.vaultbot`

## Member tracking

- **Bot** — every `/start`, command, and button tap records Telegram id / username into `bot/data/members.json` (mirrored to repo-root `members.json` for GitHub Pages).
- **Mini App** — on open, heartbeats to the members API with source `webapp` / `web`.
- **Profile editor** — owners see profile counts + member list (Refresh).

### Live Mini App sync (needed for Pages users)

GitHub Pages cannot reach `localhost:8765`. Expose the API:

```bash
brew install cloudflare/cloudflare/cloudflared
./bot/run-public-api.sh
```

Then upload `members-api-url.json` (and optionally `members.json`) with the Mini App to Pages.

Or set `MEMBERS_API_PUBLIC_URL` in `config.py` to a stable tunnel URL.

## Config

Copy `config.example.py` → `config.py` (gitignored). Never commit the token.

## Assets

Runtime images:

- `assets/*.jpg` — welcome / membership / help banners
- `assets/payments/*-card.jpg` — PayPal / Cash App / Zelle panels
