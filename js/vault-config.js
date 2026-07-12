/* Runtime config for J2026Vault Mini App (safe to commit).
   For live profile sync from every Mini App user, set MEMBERS_API_URL to a
   public HTTPS URL that reaches your Mac's members API (port 8765), e.g. a
   Cloudflare Tunnel. Leave blank to auto-detect localhost / members-api-url.json.
*/
window.VAULT_CONFIG = window.VAULT_CONFIG || {
  MEMBERS_API_URL: '',
  TELEGRAM_BOT_LINK: 'https://t.me/J26VaultBot',
  WEBAPP_URL: 'https://jawhwf.github.io/J2026VAULT/',
};
