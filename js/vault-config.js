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

/* Accent themes — applied early so the UI doesn’t flash purple on load */
window.VAULT_ACCENT_THEMES = {
  violet: { id: 'violet', label: 'Violet', accent: '#8b5cf6', bright: '#a78bfa', deep: '#6d40e0' },
  blue:   { id: 'blue',   label: 'Blue',   accent: '#3b82f6', bright: '#60a5fa', deep: '#1d4ed8' },
  teal:   { id: 'teal',   label: 'Teal',   accent: '#14b8a6', bright: '#2dd4bf', deep: '#0f766e' },
  green:  { id: 'green',  label: 'Green',  accent: '#22c55e', bright: '#4ade80', deep: '#15803d' },
  rose:   { id: 'rose',   label: 'Rose',   accent: '#f43f5e', bright: '#fb7185', deep: '#be123c' },
  orange: { id: 'orange', label: 'Orange', accent: '#f97316', bright: '#fb923c', deep: '#c2410c' },
  amber:  { id: 'amber',  label: 'Amber',  accent: '#eab308', bright: '#facc15', deep: '#a16207' },
  slate:  { id: 'slate',  label: 'Slate',  accent: '#64748b', bright: '#94a3b8', deep: '#334155' },
};

window.VAULT_ACCENT_STORAGE_KEY = 'j2026vault_accent_theme';

window.applyVaultAccentTheme = function applyVaultAccentTheme(themeId, { persist = true } = {}) {
  const themes = window.VAULT_ACCENT_THEMES || {};
  const theme = themes[themeId] || themes.violet;
  if (!theme) return null;

  const hex = String(theme.accent || '#8b5cf6').replace('#', '');
  const full = hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;

  const root = document.documentElement;
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-bright', theme.bright);
  root.style.setProperty('--accent-deep', theme.deep);
  root.style.setProperty('--accent-dim', `rgba(${r}, ${g}, ${b}, 0.12)`);
  root.style.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b}, 0.30)`);
  root.style.setProperty('--accent-line', `rgba(${r}, ${g}, ${b}, 0.55)`);
  root.style.setProperty('--accent-ambient', `rgba(${r}, ${g}, ${b}, 0.12)`);
  root.dataset.accentTheme = theme.id;

  if (persist) {
    try { localStorage.setItem(window.VAULT_ACCENT_STORAGE_KEY, theme.id); } catch {}
  }
  return theme;
};

(function bootAccentTheme() {
  let id = 'violet';
  try { id = localStorage.getItem(window.VAULT_ACCENT_STORAGE_KEY) || 'violet'; } catch {}
  window.applyVaultAccentTheme(id, { persist: false });
})();
