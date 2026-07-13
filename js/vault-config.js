/* Runtime config for J2026Vault Mini App (safe to commit).
   Catalog + profile sync use a public HTTPS members API. The bot auto-starts a
   tunnel and puts ?api=… on the Telegram menu Mini App URL — leave MEMBERS_API_URL
   blank unless you have a stable custom domain.
*/
window.VAULT_CONFIG = window.VAULT_CONFIG || {
  MEMBERS_API_URL: '',
  TELEGRAM_BOT_LINK: 'https://t.me/J26VaultBot',
  WEBAPP_URL: 'https://jawhwf.github.io/J2026VAULT/',
};

/* Accent themes — applied early so splash / catalog don’t flash purple on load.
   lurkerHue: hue-rotate from the purple lurker crown GIF toward this accent. */
window.VAULT_ACCENT_THEMES = {
  violet: { id: 'violet', label: 'Violet', accent: '#8b5cf6', bright: '#a78bfa', deep: '#6d40e0', lurkerHue: 0 },
  blue:   { id: 'blue',   label: 'Blue',   accent: '#3b82f6', bright: '#60a5fa', deep: '#1d4ed8', lurkerHue: -42 },
  teal:   { id: 'teal',   label: 'Teal',   accent: '#14b8a6', bright: '#2dd4bf', deep: '#0f766e', lurkerHue: -86 },
  green:  { id: 'green',  label: 'Green',  accent: '#22c55e', bright: '#4ade80', deep: '#15803d', lurkerHue: -116 },
  rose:   { id: 'rose',   label: 'Rose',   accent: '#f43f5e', bright: '#fb7185', deep: '#be123c', lurkerHue: 92 },
  orange: { id: 'orange', label: 'Orange', accent: '#f97316', bright: '#fb923c', deep: '#c2410c', lurkerHue: 129 },
  amber:  { id: 'amber',  label: 'Amber',  accent: '#eab308', bright: '#facc15', deep: '#a16207', lurkerHue: 150 },
  slate:  { id: 'slate',  label: 'Slate',  accent: '#64748b', bright: '#94a3b8', deep: '#334155', lurkerHue: -43 },
};

window.VAULT_ACCENT_STORAGE_KEY = 'j2026vault_accent_theme';
window.VAULT_ACCENT_COOKIE = 'j2026vault_accent_theme';

function _vaultAccentCookieRead() {
  try {
    const match = document.cookie.match(/(?:^|;\s*)j2026vault_accent_theme=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : '';
  } catch {
    return '';
  }
}

function _vaultAccentCookieWrite(themeId) {
  try {
    const maxAge = 60 * 60 * 24 * 400;
    document.cookie = `${window.VAULT_ACCENT_COOKIE}=${encodeURIComponent(themeId)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch {}
}

function _vaultNormalizeAccentId(raw) {
  const id = String(raw || '').trim().toLowerCase();
  return (window.VAULT_ACCENT_THEMES && window.VAULT_ACCENT_THEMES[id]) ? id : '';
}

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

  const brightHex = String(theme.bright || theme.accent).replace('#', '');
  const brightFull = brightHex.length === 3 ? brightHex.split('').map(c => c + c).join('') : brightHex;
  const bn = parseInt(brightFull, 16);
  const br = (bn >> 16) & 255;
  const bg = (bn >> 8) & 255;
  const bb = bn & 255;

  const deepHex = String(theme.deep || theme.accent).replace('#', '');
  const deepFull = deepHex.length === 3 ? deepHex.split('').map(c => c + c).join('') : deepHex;
  const dn = parseInt(deepFull, 16);
  const dr = (dn >> 16) & 255;
  const dg = (dn >> 8) & 255;
  const db = dn & 255;

  const root = document.documentElement;
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-bright', theme.bright);
  root.style.setProperty('--accent-deep', theme.deep);
  root.style.setProperty('--accent-dim', `rgba(${r}, ${g}, ${b}, 0.12)`);
  root.style.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b}, 0.30)`);
  root.style.setProperty('--accent-line', `rgba(${r}, ${g}, ${b}, 0.55)`);
  root.style.setProperty('--accent-ambient', `rgba(${r}, ${g}, ${b}, 0.12)`);
  root.style.setProperty('--accent-soft', `rgba(${r}, ${g}, ${b}, 0.18)`);
  root.style.setProperty('--accent-mid', `rgba(${r}, ${g}, ${b}, 0.42)`);
  root.style.setProperty('--splash-ray', `rgba(${r}, ${g}, ${b}, 0.08)`);
  root.style.setProperty('--splash-ray-bright', `rgba(${br}, ${bg}, ${bb}, 0.06)`);
  root.style.setProperty('--splash-ray-deep', `rgba(${dr}, ${dg}, ${db}, 0.06)`);
  root.style.setProperty('--splash-glow-core', `rgba(${r}, ${g}, ${b}, 0.22)`);
  root.style.setProperty('--splash-glow-edge', `rgba(${dr}, ${dg}, ${db}, 0.08)`);
  root.style.setProperty('--lurker-hue', `${Number(theme.lurkerHue) || 0}deg`);
  root.dataset.accentTheme = theme.id;

  if (persist) {
    try {
      localStorage.setItem(window.VAULT_ACCENT_STORAGE_KEY, theme.id);
      localStorage.setItem(`${window.VAULT_ACCENT_STORAGE_KEY}_at`, new Date().toISOString());
    } catch {}
    _vaultAccentCookieWrite(theme.id);
  }
  return theme;
};

window.readLocalVaultAccentThemeId = function readLocalVaultAccentThemeId() {
  try {
    const fromUrl = new URLSearchParams(location.search || '');
    const fromParam = _vaultNormalizeAccentId(fromUrl.get('accent') || fromUrl.get('theme'));
    if (fromParam) return fromParam;
  } catch {}
  try {
    const fromLs = _vaultNormalizeAccentId(localStorage.getItem(window.VAULT_ACCENT_STORAGE_KEY));
    if (fromLs) return fromLs;
  } catch {}
  const fromCookie = _vaultNormalizeAccentId(_vaultAccentCookieRead());
  if (fromCookie) return fromCookie;
  return 'violet';
};

/** Candidate URLs for the shared vault accent (API + Pages mirror). */
window.vaultAccentFetchUrls = function vaultAccentFetchUrls() {
  const urls = [];
  const push = (u) => {
    const clean = String(u || '').trim();
    if (!clean || urls.includes(clean)) return;
    urls.push(clean);
  };

  try {
    const ls = localStorage.getItem('j2026vault_members_api_url');
    if (ls) push(`${String(ls).replace(/\/$/, '')}/api/accent`);
  } catch {}

  const cfgApi = String(window.VAULT_CONFIG?.MEMBERS_API_URL || '').trim().replace(/\/$/, '');
  if (cfgApi) push(`${cfgApi}/api/accent`);

  const host = (location.hostname || '').toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1' || location.protocol === 'file:') {
    push('http://127.0.0.1:8765/api/accent');
  }

  const webapp = String(window.VAULT_CONFIG?.WEBAPP_URL || '').trim().replace(/\/?$/, '/');
  if (webapp) push(`${webapp}accent-theme.json`);

  if (location.protocol !== 'file:') {
    try { push(new URL('accent-theme.json', location.href).href); } catch {}
    push('accent-theme.json');
  }

  return urls;
};

window.fetchSharedVaultAccentTheme = async function fetchSharedVaultAccentTheme() {
  const urls = window.vaultAccentFetchUrls();
  const stamp = Date.now();

  // Resolve members-api-url.json first when on Pages / local http (not file:// relative)
  if (location.protocol !== 'file:') {
    try {
      const res = await fetch(`members-api-url.json?t=${stamp}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const base = String(data?.url || '').trim().replace(/\/$/, '');
        if (base) {
          try { localStorage.setItem('j2026vault_members_api_url', base); } catch {}
          urls.unshift(`${base}/api/accent`);
        }
      }
    } catch {}
  }

  for (const url of urls) {
    try {
      const sep = url.includes('?') ? '&' : '?';
      const res = await fetch(`${url}${sep}t=${stamp}`, { cache: 'no-store' });
      if (!res.ok) continue;
      const data = await res.json();
      const theme = _vaultNormalizeAccentId(data?.theme || data?.id);
      if (theme) {
        return { theme, updatedAt: data?.updatedAt || null, source: url };
      }
    } catch {}
  }
  return null;
};

/** Pull shared accent so Telegram / browser / file:// stay in sync. */
window.syncSharedVaultAccentTheme = async function syncSharedVaultAccentTheme({ force = false } = {}) {
  const shared = await window.fetchSharedVaultAccentTheme();
  if (!shared?.theme) return null;
  const current = document.documentElement.dataset.accentTheme || window.readLocalVaultAccentThemeId();

  let localAt = 0;
  try {
    localAt = Date.parse(localStorage.getItem(`${window.VAULT_ACCENT_STORAGE_KEY}_at`) || '') || 0;
  } catch {}
  const sharedAt = Date.parse(shared.updatedAt || '') || 0;
  const inTelegram = !!(window.Telegram?.WebApp?.initData);
  // Inside Telegram: don't clobber a newer local pick that hasn't reached the API yet.
  // Outside Telegram (gate / browser URL / file://): shared vault theme wins.
  const keepLocal = !force
    && inTelegram
    && shared.theme !== current
    && localAt > 0
    && localAt > sharedAt;

  if (keepLocal) return shared;

  if (!force && shared.theme === current) {
    try {
      localStorage.setItem(window.VAULT_ACCENT_STORAGE_KEY, shared.theme);
      if (shared.updatedAt) {
        localStorage.setItem(`${window.VAULT_ACCENT_STORAGE_KEY}_at`, shared.updatedAt);
      }
    } catch {}
    _vaultAccentCookieWrite(shared.theme);
    return shared;
  }

  window.applyVaultAccentTheme(shared.theme, { persist: true });
  if (shared.updatedAt) {
    try { localStorage.setItem(`${window.VAULT_ACCENT_STORAGE_KEY}_at`, shared.updatedAt); } catch {}
  }
  try {
    window.dispatchEvent(new CustomEvent('vault:accent-theme', { detail: shared }));
  } catch {}
  return shared;
};

(function bootAccentTheme() {
  const id = window.readLocalVaultAccentThemeId();
  window.applyVaultAccentTheme(id, { persist: false });
  // Shared sync (API / accent-theme.json) — keeps gate + browser URL matching Telegram
  const run = () => {
    window.syncSharedVaultAccentTheme().catch(() => {});
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
})();
