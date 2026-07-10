/* J2026Vault — Vault Manager :: template + example data only */

const DISCORD_INVITE = 'https://discord.gg/J2026Vault';
const TELEGRAM_LINK = 'https://t.me/J2026Vault';
const TELEGRAM_BOT_LINK = 'https://t.me/J2026VaultBot';
const CHARLEY_PANGUS_LOGO = 'assets/charley-pangus-logo.gif';

/* Vault owner — only this Telegram account can unlock Vault Admin.
   Open the Mini App in Telegram → owner ID/username is detected → password prompt.
   Browser visits to https://jawhwf.github.io/J2026VAULT/ are gated.
   TEMP: local/file opens skip the gate for editing — reclose when user asks. */
const VAULT_OWNER_TELEGRAM_IDS = [6690519994];
const VAULT_OWNER_TELEGRAM_USERNAMES = []; // optional: ['your_username']
const VAULT_ADMIN_PASSWORD = 'JAWH2005!';
const VAULT_ADMIN_UNLOCK_KEY = 'j2026vault_admin_unlocked';

let telegramUser = null;
let vaultAdminUnlocked = false;
let vaultAdminPromptDismissed = false;
const PROFILE_NAME_KEY = 'j2026vault_profile_name';

/* NOTE: these are placeholder EXAMPLES to demonstrate the template layout.
   No real products are listed. Swap this array for live data later. */
const BASE_PRODUCTS = [
  { id: 1, title: 'Example Leaker Bundle', author: 'Studio Name', price: 9.99, oldPrice: 16.99, type: 'bundle', planRequired: 'ACOLYTE', thumb: 'thumb-1', badges: ['off', 'bundle'], discount: '45% OFF', downloads: '10+', favs: 1, version: '1.0', format: '.zip', software: 'Photoshop', systems: ['photoshop', 'premiere', 'after-effects'], delivery: 'mega', tags: ['example', 'bundle', 'leaker'], about: 'Paid bundle for Leaker-tier members. Lurker can still purchase at the sale price — subscription not included.' },
  { id: 2, title: 'Example Premium Asset', author: 'Studio Name', price: 4.99, type: 'premium', planRequired: 'ACOLYTE', thumb: 'thumb-2', badges: ['premium'], downloads: '20+', favs: 1, version: 'v1.0.3', format: '.ccx', software: 'Photoshop', systems: ['photoshop'], delivery: 'google-drive', tags: ['example', 'premium'], about: 'Premium drop for Leaker or Heavenly plans, or buy outright.' },
  { id: 3, title: 'Example Free Pack', author: 'Studio Name', price: 0, type: 'free', planRequired: 'MORTAL', thumb: 'thumb-3', badges: ['free'], downloads: '50+', favs: 12, version: '2026', format: '.jpg', software: 'Any', systems: ['windows', 'apple'], delivery: 'telegram', tags: ['example', 'free'], about: 'Free catalog item — download instantly on Lurker. No subscription needed.' },
  { id: 4, title: 'Example Exclusive', author: 'Studio Name', price: 6.99, type: 'exclusive', planRequired: 'ETERNAL', thumb: 'thumb-4', badges: ['exclusive'], downloads: '10+', favs: 1, version: '1.1.0', format: '.abr', software: 'Photoshop', systems: ['photoshop', 'davinci'], delivery: 'google-drive', tags: ['example', 'exclusive'], about: 'Exclusive vault item — Heavenly plan required, or purchase separately.' },
  { id: 5, title: 'Example Premium Pack', author: 'Studio Name', price: 2.99, type: 'premium', planRequired: 'ACOLYTE', thumb: 'thumb-5', badges: ['premium'], downloads: '15+', favs: 3, version: '1.0', format: '.png', software: 'Any', systems: ['premiere', 'after-effects'], delivery: 'mega', tags: ['example', 'premium'], about: 'Another Leaker-tier premium item for catalog variety.' },
  { id: 6, title: 'Example Lurker Pack', author: 'Studio Name', price: 0, type: 'free', planRequired: 'MORTAL', thumb: 'thumb-6', badges: ['free'], downloads: '25+', favs: 6, version: '2.0', format: '.svg', software: 'Illustrator', systems: ['apple', 'windows'], delivery: 'telegram', tags: ['example', 'free'], about: 'Second free example — always shows the Lurker plan badge.' },
  { id: 7, title: 'Example Heavenly Bundle', author: 'Studio Name', price: 49.99, oldPrice: 99.99, type: 'bundle', planRequired: 'ETERNAL', thumb: 'thumb-7', badges: ['off', 'bundle'], discount: '50% OFF', downloads: '5+', favs: 2, version: '2.0', format: '.zip', software: 'Photoshop', systems: ['photoshop', 'premiere', 'davinci'], delivery: 'google-drive', tags: ['example', 'bundle', 'heavenly'], about: 'Top-tier bundle — Heavenly plan badge only. Purchase or subscribe to unlock.' },
];

const SYSTEM_ICONS = {
  photoshop: 'assets/system-icons/photoshop.gif',
  premiere: 'assets/system-icons/premiere.gif',
  'after-effects': 'assets/system-icons/after-effects.gif',
  davinci: 'assets/system-icons/davinci.gif',
  windows: 'assets/system-icons/windows.gif',
  apple: 'assets/system-icons/apple.gif',
};

const DELIVERY_ICONS = {
  'google-drive': 'assets/delivery-icons/google-drive.gif',
  mega: 'assets/delivery-icons/mega.gif',
  telegram: 'assets/delivery-icons/telegram.gif',
};

const DELIVERY_LABELS = {
  'google-drive': 'Google Drive',
  mega: 'MEGA',
  telegram: 'Telegram',
};

const GOOGLE_DRIVE_ACCESS_HINT = 'Request access on Google Drive and mention your purchase — buyers are approved manually to keep the link secure.';

const DELIVERY_LINK_PLACEHOLDERS = {
  'google-drive': 'https://drive.google.com/drive/folders/...',
  mega: 'https://mega.nz/folder/...',
  telegram: 'https://t.me/...',
};

const DELIVERY_LINK_HINTS = {
  'google-drive': GOOGLE_DRIVE_ACCESS_HINT,
  mega: 'Paste your MEGA folder or file link for buyers.',
  telegram: 'Paste your Telegram channel or file link for buyers.',
};

const DELIVERY_LINK_LABELS = {
  'google-drive': 'Drive link',
  mega: 'MEGA link',
  telegram: 'Telegram link',
};

const SYSTEM_LABELS = {
  photoshop: 'Photoshop',
  premiere: 'Premiere',
  'after-effects': 'After Effects',
  davinci: 'DaVinci',
  windows: 'Windows',
  apple: 'Mac',
};

const OS_SYSTEM_KEYS = new Set(['windows', 'apple']);
const APP_SYSTEM_KEYS = new Set(['photoshop', 'premiere', 'after-effects', 'davinci']);

const FORMAT_ICONS = {
  '.zip': 'assets/format-icons/zip.gif',
};

function isCharleyPangusAuthor(author) {
  return (author || '').trim().toLowerCase() === 'charley pangus';
}

function getAuthorIcon(source, { fallback = false } = {}) {
  if (typeof source === 'object' && source?.authorIcon) return source.authorIcon;
  if (fallback && typeof source === 'object' && isCharleyPangusAuthor(source?.author)) {
    return CHARLEY_PANGUS_LOGO;
  }
  return null;
}

function renderAuthorIcon(source, className = 'author-icon', { fallback = false } = {}) {
  const src = getAuthorIcon(source, { fallback });
  if (!src) return '';
  return `<img src="${src}" alt="" class="${className}" loading="lazy">`;
}

function renderCardAuthor(product) {
  const icon = renderAuthorIcon(product, 'card-author-icon', { fallback: true });
  return `<div class="card-author">${icon}<span>by ${product.author}</span></div>`;
}

function renderProductAuthorLine(product) {
  const icon = renderAuthorIcon(product, 'product-author-icon', { fallback: true });
  return `${icon}<span>by ${product.author}</span>`;
}

function renderProductPriceContent(product) {
  if (product.price === 0) return 'Free';
  let html = `$${product.price.toFixed(2)}`;
  if (product.oldPrice) {
    html += `<span class="old">$${product.oldPrice.toFixed(2)}</span>`;
  }
  return html;
}

function cancelProductIntroAnimation(el) {
  if (!el) return;
  if (el._animTimer) clearInterval(el._animTimer);
  el._animTimer = null;
}

const AUTHOR_TYPE_MS = 78;

function playProductAuthorAnimation(product) {
  const authorEl = document.getElementById('productAuthorLine');
  if (!authorEl || authorEl.classList.contains('is-animating')) return;

  const fullText = `by ${product.author}`;
  const icon = renderAuthorIcon(product, 'product-author-icon', { fallback: true });
  cancelProductIntroAnimation(authorEl);

  authorEl.classList.add('is-animating', 'is-typing');
  authorEl.innerHTML = `${icon}<span class="author-anim-text"></span><span class="author-anim-cursor" aria-hidden="true">|</span>`;
  const textEl = authorEl.querySelector('.author-anim-text');
  const cursorEl = authorEl.querySelector('.author-anim-cursor');
  if (!textEl) return;

  let index = 0;
  authorEl._animTimer = window.setInterval(() => {
    index += 1;
    textEl.textContent = fullText.slice(0, index);
    if (index >= fullText.length) {
      clearInterval(authorEl._animTimer);
      authorEl._animTimer = null;
      cursorEl?.remove();
      authorEl.classList.remove('is-animating', 'is-typing');
    }
  }, AUTHOR_TYPE_MS);
}

function playProductIntroAnimations(product) {
  playProductAuthorAnimation(product);
}

function setupProductIntroHover() {
  const authorEl = document.getElementById('productAuthorLine');
  if (authorEl && !authorEl.dataset.hoverBound) {
    authorEl.dataset.hoverBound = '1';
    authorEl.addEventListener('mouseenter', () => {
      if (!currentProduct) return;
      cancelProductIntroAnimation(authorEl);
      authorEl.classList.remove('is-animating', 'is-typing');
      playProductAuthorAnimation(currentProduct);
    });
  }
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatAboutPlainText(raw) {
  return `<p class="about-text">${escapeHtml(raw).replace(/\r?\n/g, '<br>')}</p>`;
}

function parseAboutPlainText(raw) {
  const lines = (raw || '').split(/\r?\n/);
  const headingIdx = lines.findIndex(line => /^what'?s inside\??$/i.test(line.trim()));
  if (headingIdx === -1) {
    return { intro: (raw || '').trimEnd(), hasInside: false, heading: '', body: '' };
  }
  return {
    intro: lines.slice(0, headingIdx).join('\n').trimEnd(),
    hasInside: true,
    heading: lines[headingIdx].trim(),
    body: lines.slice(headingIdx + 1).join('\n').trimEnd(),
  };
}

function aboutBodyLinesToHtml(body) {
  const text = (body || '').trim();
  if (!text) return '';
  return text.split(/\r?\n/).map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('•')) {
      return `<p class="about-bullet-line">${escapeHtml(trimmed)}</p>`;
    }
    return `<p class="about-text">${escapeHtml(trimmed)}</p>`;
  }).filter(Boolean).join('');
}

function introTextToHtml(raw) {
  const text = (raw || '').trim();
  if (!text) return '';
  return text.split(/\r?\n/).map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    return `<p class="about-text">${escapeHtml(trimmed)}</p>`;
  }).filter(Boolean).join('');
}

function sanitizeAboutRichHtml(html) {
  const allowed = new Set(['B', 'I', 'U', 'STRONG', 'EM', 'P', 'BR', 'SPAN', 'DIV', 'SVG', 'TEXT', 'IMG']);
  const wrap = document.createElement('div');
  wrap.innerHTML = html || '';
  const walk = node => {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE && !allowed.has(child.tagName)) {
        const text = document.createTextNode(child.textContent || '');
        child.replaceWith(text);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    });
  };
  walk(wrap);
  return wrap.innerHTML;
}

function renderAboutInsideSection(bodyHtml, bodyPlain, heading = "What's Inside?") {
  const safeHeading = (heading || '').trim() || "What's Inside?";
  const mediaItems = parseAboutMediaItemsFromHtml(bodyHtml);
  if (mediaItems.length) {
    return renderAboutFolderWidget({ heading: safeHeading, items: mediaItems });
  }
  const lead = `<p class="about-lead">${escapeHtml(safeHeading)}</p><div class="about-inside-divider" aria-hidden="true"></div>`;
  if (bodyHtml && bodyHtml.trim()) {
    return `${lead}<div class="about-inside-rich">${sanitizeAboutRichHtml(bodyHtml)}</div>`;
  }
  const lines = (bodyPlain || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (!lines.length) return lead;
  const list = lines.map(line => {
    const text = line.replace(/^•\s*/, '');
    return `<li>${escapeHtml(text)}</li>`;
  }).join('');
  return `${lead}<ul class="about-list">${list}</ul>`;
}

function aboutZoneHasVisibleContent(el) {
  if (!el) return false;
  const text = (el.innerText || '').replace(/\u00a0/g, ' ').trim();
  if (text) return true;
  return !!el.querySelector('.about-divider, .about-fx-inline, .about-bullet-line, .about-media-item');
}

const CHARLEY_PANGUS_ICON_BASE = 'assets/bundle-icons/charley-pangus/';
const CHARLEY_PANGUS_MASTER_ABOUT_ITEMS = [
  { icon: 'lite.webp', name: 'AutoThresh Lite V1.0.1', indent: 0 },
  { icon: 'displacecraft.webp', name: 'Displacecraft V1.2.0', indent: 0 },
  { icon: 'style-forge.webp', name: 'StyleForge V1.0.3', indent: 0 },
  { icon: 'mockup_bundle.webp', name: 'Mockup Bundle – Volume 1', indent: 0 },
  { icon: 'plastisol-texture-pack.webp', name: 'Plastisol Texture Pack', indent: 0 },
  { icon: 'member-loot.png', name: 'Member Loot', indent: 0 },
  { icon: 'pro.webp', name: 'AutoThresh Pro V1.1.0 (New!)', indent: 0 },
  { icon: 'web.webp', name: 'AutoThresh™ Web V1.0.1 (New!)', indent: 0 },
];

function buildAboutMediaItemHtml(src, name, indent = 0) {
  const safeSrc = String(src || '').replace(/"/g, '&quot;');
  const safeName = escapeHtml((name || '').trim() || 'Product name');
  const level = Math.max(0, Math.min(3, Number(indent) || 0));
  return `<div class="about-media-item" data-indent="${level}" contenteditable="false"><img class="about-media-item-img" src="${safeSrc}" alt="" draggable="false"><p class="about-media-item-name" contenteditable="true">${safeName}</p></div>`;
}

function buildAboutMediaListHtml(items = []) {
  return items.map(item => buildAboutMediaItemHtml(
    item.src || `${CHARLEY_PANGUS_ICON_BASE}${item.icon}`,
    item.name,
    item.indent
  )).join('');
}

function getCharleyPangusMasterBundleAboutHtml() {
  return buildAboutMediaListHtml(CHARLEY_PANGUS_MASTER_ABOUT_ITEMS);
}

function refreshCharleyPangusMasterAboutHtml(html) {
  if (!html?.trim()) return html;
  return html
    .replace(/charley-pangus\/folder\.gif/gi, 'charley-pangus/mockup_bundle.webp')
    .replace(/charley-pangus\/mockup-bundle\.webp/gi, 'charley-pangus/mockup_bundle.webp')
    .replace(/\sdata-indent="[1-3]"/g, ' data-indent="0"');
}

function getResolvedAboutInsideHtml(product) {
  let html = product?.aboutInsideHtml || '';
  if (isCharleyPangusAuthor(product?.author) && /master\s*bundle/i.test(product?.title || '')) {
    html = refreshCharleyPangusMasterAboutHtml(html);
  }
  return html;
}

function shouldApplyCharleyPangusAboutPreset(product) {
  if (!product || !isCharleyPangusAuthor(product.author)) return false;
  if (product.aboutInsideHtml?.trim()) return false;
  return /master\s*bundle/i.test(product.title || '');
}

function insertAboutBlockHtml(el, html, { forceAppend = false } = {}) {
  if (!el) return null;
  const tpl = document.createElement('div');
  tpl.innerHTML = html.trim();
  const node = tpl.firstElementChild;
  if (!node) return null;
  el.focus();
  const sel = window.getSelection();
  const anchor = sel?.anchorNode;
  const inMediaName = anchor && (anchor.nodeType === Node.ELEMENT_NODE ? anchor : anchor.parentElement)
    ?.closest?.('.about-media-item-name');
  const canInsertAtCaret = !forceAppend && !inMediaName && sel?.rangeCount && el.contains(anchor);
  if (canInsertAtCaret) {
    const range = sel.getRangeAt(0);
    range.collapse(false);
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  } else {
    el.appendChild(node);
  }
  return node;
}

function updateAboutInsideEmptyState() {
  if (editorAboutInsideEmpty) editorAboutInsideEmpty.hidden = true;
}

function aboutFileToProductName(file) {
  return (file?.name || '').replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'Product name';
}

function getImageFilesFromFileList(fileList) {
  if (!fileList?.length) return [];
  return [...fileList].filter(file => file.type.startsWith('image/'));
}

function readImageFilesSequential(files, onDone) {
  const results = [];
  let i = 0;
  const next = () => {
    if (i >= files.length) {
      onDone(results);
      return;
    }
    const file = files[i++];
    if (file.size > 4 * 1024 * 1024) {
      showToast(`${file.name} is too large (max 4MB)`);
      next();
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      results.push({ src: reader.result, name: aboutFileToProductName(file) });
      next();
    };
    reader.onerror = next;
    reader.readAsDataURL(file);
  };
  next();
}

function handleAboutMediaFilesDrop(fileList) {
  const files = getImageFilesFromFileList(fileList);
  if (!files.length) {
    showToast('Please drop an image or GIF');
    return;
  }
  const hadItems = parseAboutMediaItemsFromHtml(serializeEditorAboutInsideHtml()).length > 0;
  pendingAboutMediaImg = null;
  readImageFilesSequential(files, entries => {
    if (!entries.length) return;
    insertAboutMediaItems(entries, { openFolder: !hadItems });
    if (entries.length > 1) showToast(`Added ${entries.length} items`);
  });
}

function bindAboutInsideDropzone(el) {
  if (!el) return;
  el.addEventListener('dragover', e => {
    if (!editorAboutInsideWrap || editorAboutInsideWrap.hidden) return;
    e.preventDefault();
    e.stopPropagation();
    el.classList.add('is-dragover');
  });
  el.addEventListener('dragleave', e => {
    if (!el.contains(e.relatedTarget)) el.classList.remove('is-dragover');
  });
  el.addEventListener('drop', e => {
    if (!editorAboutInsideWrap || editorAboutInsideWrap.hidden) return;
    e.preventDefault();
    e.stopPropagation();
    el.classList.remove('is-dragover');
    handleAboutMediaFilesDrop(e.dataTransfer?.files);
  });
}

const ABOUT_MEDIA_REPLACE_ICON = `<svg class="about-media-item-replace-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M21 15l-5-5L5 21"/><path d="M16 3h5v5"/><path d="M3 21l7-7"/></svg>`;

function enhanceEditorAboutMediaItem(item) {
  if (!item || item.querySelector('.about-media-item-img-btn')) return;
  const img = [...item.children].find(child => child.classList?.contains('about-media-item-img'));
  if (!img) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'about-media-item-img-btn';
  btn.setAttribute('aria-label', 'Replace image or GIF');
  btn.title = 'Replace image or GIF';
  const overlay = document.createElement('span');
  overlay.className = 'about-media-item-replace';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `${ABOUT_MEDIA_REPLACE_ICON}<span class="about-media-item-replace-label">Replace</span>`;
  img.replaceWith(btn);
  btn.appendChild(img);
  btn.appendChild(overlay);
}

function enhanceEditorAboutMediaItems(root = editorAboutInsideBody) {
  if (!root) return;
  const items = root.classList.contains('about-media-item')
    ? [root]
    : [...root.querySelectorAll('.about-media-item')];
  items.forEach(enhanceEditorAboutMediaItem);
}

function serializeEditorAboutInsideHtml() {
  if (!editorAboutInsideBody) return '';
  const clone = editorAboutInsideBody.cloneNode(true);
  clone.querySelectorAll('.about-media-item-img-btn').forEach(btn => {
    const img = btn.querySelector('.about-media-item-img');
    if (img) btn.replaceWith(img.cloneNode(true));
  });
  return clone.innerHTML;
}

function renderAboutIntroHtml(introHtml, introPlain) {
  if (introHtml?.trim()) {
    return `<div class="about-intro-rich">${sanitizeAboutRichHtml(introHtml)}</div>`;
  }
  return introPlain ? formatAboutPlainText(introPlain) : '';
}

function renderProductAbout(about, product = null) {
  const raw = (about || '').trim();
  const bundleItems = getProductBundleItems(product);

  if (bundleItems.length) {
    const intro = renderAboutIntroHtml(product?.aboutIntroHtml, raw);
    return intro + renderBundleFolderAbout(bundleItems);
  }

  const { intro, hasInside, body } = parseAboutPlainText(raw);
  if (hasInside) {
    const introHtml = renderAboutIntroHtml(product?.aboutIntroHtml, intro);
    const insideHtml = renderAboutInsideSection(getResolvedAboutInsideHtml(product), body, product?.aboutInsideHeading);
    return introHtml + insideHtml;
  }

  if (product?.aboutIntroHtml?.trim()) {
    return renderAboutIntroHtml(product.aboutIntroHtml, '');
  }

  if (!raw) return '<p class="about-text about-empty">No description yet.</p>';

  const hasBullets = raw.includes('•');
  if (!hasBullets) {
    return formatAboutPlainText(raw);
  }

  const parts = raw
    .split(/\s*•\s*|\r?\n+/)
    .map(part => part.trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    return formatAboutPlainText(raw);
  }

  let heading = '';
  let items = parts;
  const first = parts[0];
  if (/^what'?s inside\??$/i.test(first) || (first.endsWith('?') && first.length < 48)) {
    heading = `<p class="about-lead">${escapeHtml(first)}</p>`;
    items = parts.slice(1);
  }

  if (!items.length) {
    return heading || formatAboutPlainText(raw);
  }

  const list = items.map(item => `<li>${escapeHtml(item)}</li>`).join('');
  return `${heading}<ul class="about-list">${list}</ul>`;
}

const FOLDER_GIF = 'assets/bundle-contents/folder.gif';
const FOLDER_POSTER = 'assets/bundle-contents/folder-poster.png';

function getProductBundleItems(product) {
  if (!product || !Array.isArray(product.bundleItems)) return [];
  return product.bundleItems.filter(item => (item?.name || '').trim());
}

function getProductDownloadUrl(product) {
  if (!product) return null;
  const links = normalizeDeliveryLinks(product);
  const deliveries = normalizeDeliveries(product.delivery);
  for (const key of deliveries) {
    const url = (links[key] || '').trim();
    if (url) return url;
  }
  const fallback = (links['google-drive'] || product.downloadUrl || '').trim();
  return fallback || null;
}

function productUsesDriveAccess(product) {
  const deliveries = normalizeDeliveries(product.delivery);
  if (!deliveries.includes('google-drive')) return false;
  const links = normalizeDeliveryLinks(product);
  const url = (links['google-drive'] || '').trim();
  return !!url && /drive\.google\.com/i.test(url);
}

function openProductDownload(product) {
  const url = getProductDownloadUrl(product);
  if (!url) return false;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

function renderBundleFolderAbout(items = []) {
  const mapped = items
    .map(item => ({
      src: item.icon || item.src || '',
      name: (item.name || '').trim(),
    }))
    .filter(item => item.name);
  if (!mapped.length) return '';
  return renderAboutFolderWidget({ heading: "What's Inside?", items: mapped });
}

function parseAboutMediaItemsFromHtml(html) {
  const wrap = document.createElement('div');
  wrap.innerHTML = html || '';
  return [...wrap.querySelectorAll('.about-media-item')].map(item => {
    const img = item.querySelector('.about-media-item-img');
    const nameEl = item.querySelector('.about-media-item-name');
    return {
      src: img?.getAttribute('src') || '',
      name: (nameEl?.textContent || '').trim(),
    };
  }).filter(item => item.src || item.name);
}

function renderAboutFolderRow(item) {
  const safeSrc = String(item.src || '').replace(/"/g, '&quot;');
  const icon = safeSrc
    ? `<img class="about-folder-row-icon" src="${safeSrc}" alt="" draggable="false">`
    : '';
  return `<div class="about-folder-row">${icon}<span class="about-folder-row-name">${escapeHtml(item.name || '')}</span></div>`;
}

function renderAboutFolderWidget({ heading = "What's inside?", items = [], includeHeading = true } = {}) {
  const safeHeading = (heading || '').trim() || "What's inside?";
  const count = items.length;
  const rows = items.map(renderAboutFolderRow).join('');
  const header = includeHeading
    ? `<div class="about-folder-header"><p class="about-lead">${escapeHtml(safeHeading)}</p></div>`
    : '';
  return `
    <div class="about-folder" data-item-count="${count}">
      ${header}
      <div class="about-folder-stage">
        <button type="button" class="about-folder-trigger" aria-expanded="false" aria-label="Open folder to see ${count} item${count === 1 ? '' : 's'}">
          <span class="about-folder-icon-wrap">
            <img class="about-folder-icon" src="${FOLDER_POSTER}" alt="" draggable="false">
          </span>
          <span class="about-folder-cta">Open me</span>
        </button>
        <div class="about-folder-contents" hidden>
          <div class="about-folder-list">${rows}</div>
        </div>
      </div>
    </div>`;
}

function renderAboutFolderShell(itemCount, { editorMode = false } = {}) {
  const ctaText = itemCount === 0 && editorMode ? 'Add items' : 'Open me';
  return `
    <div class="about-folder" data-item-count="${itemCount}"${editorMode ? ' data-editor-folder="1"' : ''}>
      <div class="about-folder-stage">
        <button type="button" class="about-folder-trigger" aria-expanded="false" aria-label="${itemCount === 0 ? 'Open folder to add items' : `Open folder to see ${itemCount} item${itemCount === 1 ? '' : 's'}`}">
          <span class="about-folder-icon-wrap">
            <img class="about-folder-icon" src="${FOLDER_POSTER}" alt="" draggable="false">
          </span>
          <span class="about-folder-cta">${ctaText}</span>
        </button>
        <div class="about-folder-contents" hidden></div>
      </div>
    </div>`;
}

function initAboutFolders(root = document) {
  let folders = [];
  if (!root || root === document) {
    folders = [...document.querySelectorAll('.about-folder')];
  } else if (root.classList?.contains('about-folder')) {
    folders = [root];
  } else {
    folders = [...root.querySelectorAll('.about-folder')];
  }

  folders.forEach(folder => {
    if (folder.dataset.folderInit === '1') return;
    folder.dataset.folderInit = '1';

    const itemCount = Number(folder.dataset.itemCount) || 0;
    const iconEl = folder.querySelector('.about-folder-icon');
    const iconWrap = folder.querySelector('.about-folder-icon-wrap');
    const trigger = folder.querySelector('.about-folder-trigger');
    const contents = folder.querySelector('.about-folder-contents');
    const cta = trigger?.querySelector('.about-folder-cta');
    let isOpen = trigger?.classList.contains('is-open') || false;

    const showPoster = () => {
      if (iconEl) iconEl.src = FOLDER_POSTER;
    };

    const playGif = () => {
      if (!iconEl) return;
      iconEl.src = `${FOLDER_GIF}?play=${Date.now()}`;
    };

    if (iconEl) {
      iconEl.onerror = () => {
        if (iconEl.src.includes('folder-poster')) iconEl.src = FOLDER_GIF;
      };
    }

    if (iconWrap) {
      iconWrap.addEventListener('mouseenter', playGif);
      iconWrap.addEventListener('mouseleave', showPoster);
    }

    if (trigger) {
      trigger.onclick = () => {
        isOpen = !isOpen;
        trigger.classList.toggle('is-open', isOpen);
        folder.classList.toggle('is-open', isOpen);
        trigger.setAttribute('aria-expanded', String(isOpen));
        if (contents) {
          contents.hidden = !isOpen;
          if (isOpen) requestAnimationFrame(() => contents.classList.add('is-visible'));
          else contents.classList.remove('is-visible');
        }
        const count = Number(folder.dataset.itemCount) || itemCount;
        const isEditorEmpty = folder.dataset.editorFolder === '1' && !count;
        if (cta) {
          if (isOpen) cta.textContent = count ? `${count} items` : 'Drop files here';
          else cta.textContent = isEditorEmpty ? 'Add items' : 'Open me';
        }
        showPoster();
      };
    }
  });
}

function initAboutFolder() {
  initAboutFolders(document.getElementById('productAbout') || document);
}

function normalizeFormatKey(format) {
  const raw = (format || '').trim().toLowerCase();
  if (!raw) return '';
  return raw.startsWith('.') ? raw : `.${raw}`;
}

function normalizeDeliveries(delivery) {
  if (!delivery) return [];
  const list = Array.isArray(delivery) ? delivery : [delivery];
  return list.filter(key => DELIVERY_ICONS[key]);
}

function normalizeDeliveryLinks(productOrLinks) {
  const source = productOrLinks && typeof productOrLinks === 'object' && !Array.isArray(productOrLinks)
    ? productOrLinks
    : {};
  const links = { ...(source.deliveryLinks || {}) };
  const legacyUrl = (source.downloadUrl || '').trim();
  if (legacyUrl && !links['google-drive']) links['google-drive'] = legacyUrl;
  return links;
}

const CATALOG_STORAGE_KEY = 'j2026vault_catalog_products';
const BASE_PRODUCT_IDS = new Set(BASE_PRODUCTS.map(p => p.id));
let PRODUCTS = [...BASE_PRODUCTS];

function formatPostDate(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '—';
  }
}

function formatVersionLabel(version) {
  const v = (version || '1.0').trim();
  return v.toLowerCase().startsWith('v') ? v : `V${v}`;
}

function normalizeVersionInput(version) {
  return String(version ?? '').replace(/^v/i, '');
}

function stripVersionPrefix(version) {
  const value = normalizeVersionInput(version).trim();
  return value || '1.0';
}

function getEditorVersionRaw() {
  return normalizeVersionInput(editorDetailVersion?.value ?? editorVersion?.value ?? '');
}

function formatProductFileSize(product) {
  if (product?.fileSize) return product.fileSize;
  if (product?.type === 'bundle') return '4 GB';
  return '—';
}

function renderVaultBadge() {
  return `<span class="card-vault-badge">
    <a class="card-vault-link" href="${DISCORD_INVITE}" target="_blank" rel="noopener noreferrer" aria-label="Join Discord" onclick="event.stopPropagation()">
      <img src="assets/community-icons/discord.gif" alt="" class="card-vault-social" width="22" height="22">
    </a>
    <a class="card-vault-link" href="${TELEGRAM_LINK}" target="_blank" rel="noopener noreferrer" aria-label="Telegram" onclick="event.stopPropagation()">
      <img src="assets/community-icons/telegram.gif" alt="" class="card-vault-social" width="22" height="22">
    </a>
    <img src="assets/j26-logo.svg" alt="J26" class="card-vault-icon" width="44" height="16">
  </span>`;
}

function isCustomProduct(product) {
  if (!product) return false;
  return product.custom === true || !BASE_PRODUCT_IDS.has(product.id);
}

function configuredVaultOwnerIds() {
  return VAULT_OWNER_TELEGRAM_IDS.map(id => Number(id)).filter(id => Number.isFinite(id) && id > 0);
}

function configuredVaultOwnerUsernames() {
  return VAULT_OWNER_TELEGRAM_USERNAMES
    .map(name => String(name || '').replace(/^@/, '').trim().toLowerCase())
    .filter(Boolean);
}

function isVaultOwnerDevOverride() {
  // Dev override is local-only — never honor it on GitHub Pages / public hosts
  if (!isLocalDevHost()) return false;
  try {
    if (new URLSearchParams(window.location.search).get('vault_owner') === '1') return true;
    return sessionStorage.getItem('j2026vault_owner_dev') === '1';
  } catch {
    return false;
  }
}

function persistVaultOwnerDevOverride() {
  if (!isLocalDevHost()) {
    try { sessionStorage.removeItem('j2026vault_owner_dev'); } catch {}
    return;
  }
  try {
    if (new URLSearchParams(window.location.search).get('vault_owner') === '1') {
      sessionStorage.setItem('j2026vault_owner_dev', '1');
    }
  } catch {}
}

function matchesConfiguredVaultOwner(user) {
  if (!user) return false;
  const ids = configuredVaultOwnerIds();
  const names = configuredVaultOwnerUsernames();
  if (ids.length && ids.includes(Number(user.id))) return true;
  if (names.length && user.username && names.includes(String(user.username).toLowerCase())) return true;
  return false;
}

function isVaultOwnerIdentity() {
  if (isVaultOwnerDevOverride()) return true;
  return matchesConfiguredVaultOwner(telegramUser);
}

function readVaultAdminUnlock() {
  try {
    return sessionStorage.getItem(VAULT_ADMIN_UNLOCK_KEY) === '1';
  } catch {
    return false;
  }
}

function writeVaultAdminUnlock(unlocked) {
  vaultAdminUnlocked = !!unlocked;
  try {
    if (unlocked) sessionStorage.setItem(VAULT_ADMIN_UNLOCK_KEY, '1');
    else sessionStorage.removeItem(VAULT_ADMIN_UNLOCK_KEY);
  } catch {}
}

function canAccessVaultAdmin() {
  return isVaultOwnerIdentity() && vaultAdminUnlocked;
}

function initTelegramUser() {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;
  try {
    tg.ready();
    tg.expand();
  } catch {}
  const user = tg.initDataUnsafe?.user;
  if (!user) return;
  telegramUser = user;
  syncProfileFromTelegram(user);
}

function hasTelegramIdentity() {
  if (!telegramUser) return false;
  const id = Number(telegramUser.id);
  if (Number.isFinite(id) && id > 0) return true;
  if (telegramUser.username && String(telegramUser.username).trim()) return true;
  return false;
}

/** True only inside a real Telegram Mini App session (not a normal browser tab). */
function isInsideTelegramMiniApp() {
  const tg = window.Telegram?.WebApp;
  if (!tg) return false;
  // initData is only populated when Telegram launches the Mini App
  if (!tg.initData || !String(tg.initData).trim()) return false;
  return hasTelegramIdentity();
}

function isLocalDevHost() {
  const host = (window.location.hostname || '').toLowerCase();
  const protocol = (window.location.protocol || '').toLowerCase();
  if (protocol === 'file:') return true;
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

function isTelegramGateBypassed() {
  // TEMP: local/file always open for editing. Public GitHub URL stays gated.
  // Re-enable local gate later when user asks to "reclose" it.
  if (isLocalDevHost()) return true;
  return false;
}

function shouldShowTelegramGate() {
  if (isTelegramGateBypassed()) return false;
  // Blocks browser visits to https://jawhwf.github.io/J2026VAULT/ (and any other host)
  // unless Telegram actually opened the Mini App with a signed user session.
  return !isInsideTelegramMiniApp();
}

function showTelegramGate() {
  const gate = document.getElementById('telegramGate');
  const openBtn = document.getElementById('telegramGateOpenBtn');
  const splash = document.getElementById('splash');
  if (openBtn) openBtn.href = TELEGRAM_BOT_LINK;
  document.documentElement.classList.remove('tg-session-ok');
  if (gate) {
    gate.hidden = false;
    gate.removeAttribute('hidden');
    gate.setAttribute('aria-hidden', 'false');
  }
  if (splash) splash.hidden = true;
  document.body.classList.add('tg-gate-active');
  document.body.classList.remove('splash-active');
}

function hideTelegramGate() {
  const gate = document.getElementById('telegramGate');
  if (gate) {
    gate.hidden = true;
    gate.setAttribute('hidden', '');
    gate.setAttribute('aria-hidden', 'true');
  }
  document.documentElement.classList.add('tg-session-ok');
  document.body.classList.remove('tg-gate-active');
}

function beginSplash() {
  const splash = document.getElementById('splash');
  if (splash) {
    splash.hidden = false;
    splash.removeAttribute('hidden');
  }
  document.body.classList.add('splash-active');
}

function syncProfileFromTelegram(user) {
  const avatar = document.getElementById('profileAvatar');
  const nameInput = document.getElementById('profileNameInput');
  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ')
    || (user.username ? `@${user.username}` : 'Vault User');

  if (avatar && user.photo_url) {
    avatar.src = user.photo_url;
    avatar.referrerPolicy = 'no-referrer';
  }
  if (!nameInput) return;

  let hasSavedName = false;
  try { hasSavedName = !!localStorage.getItem(PROFILE_NAME_KEY); } catch {}
  if (!hasSavedName) nameInput.value = displayName.slice(0, 24);
}

function applyVaultAdminAccess() {
  const adminBtn = document.getElementById('openVaultAdminBtn');
  // Only the unlocked owner sees Vault Admin. Other users never see it.
  // Owner who closes the password prompt without unlocking also won't see it.
  const canAdmin = canAccessVaultAdmin();

  if (adminBtn) {
    adminBtn.hidden = !canAdmin;
    adminBtn.classList.remove('is-locked');
    const sub = adminBtn.querySelector('.admin-entry-sub');
    if (sub) sub.textContent = 'Add, edit, and publish listings';
  }
}

function openAdminPasswordModal({ focus = true } = {}) {
  const overlay = document.getElementById('adminPasswordModal');
  const input = document.getElementById('adminPasswordInput');
  const errorEl = document.getElementById('adminPasswordError');
  if (!overlay) return;
  if (errorEl) {
    errorEl.hidden = true;
    errorEl.textContent = '';
  }
  if (input) input.value = '';
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  if (focus) {
    requestAnimationFrame(() => input?.focus());
  }
}

function closeAdminPasswordModal() {
  const overlay = document.getElementById('adminPasswordModal');
  const input = document.getElementById('adminPasswordInput');
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  if (input) input.value = '';
}

function dismissAdminPasswordPrompt() {
  // Owner closed without unlocking — hide Vault Admin for this session
  vaultAdminPromptDismissed = true;
  const overlay = document.getElementById('adminPasswordModal');
  if (overlay) delete overlay.dataset.enterAdmin;
  closeAdminPasswordModal();
  applyVaultAdminAccess();
}

function submitAdminPassword() {
  const input = document.getElementById('adminPasswordInput');
  const errorEl = document.getElementById('adminPasswordError');
  const overlay = document.getElementById('adminPasswordModal');
  const value = (input?.value || '');
  if (value !== VAULT_ADMIN_PASSWORD) {
    if (errorEl) {
      errorEl.textContent = 'Incorrect password';
      errorEl.hidden = false;
    }
    input?.select();
    showToast('Incorrect admin password');
    return false;
  }
  const enterAdmin = overlay?.dataset.enterAdmin === '1';
  if (overlay) delete overlay.dataset.enterAdmin;
  vaultAdminPromptDismissed = false;
  writeVaultAdminUnlock(true);
  closeAdminPasswordModal();
  applyVaultAdminAccess();
  showToast('Vault Admin unlocked');
  if (enterAdmin) showView('admin');
  return true;
}

function promptVaultAdminUnlock({ enterAdmin = false } = {}) {
  if (!isVaultOwnerIdentity()) {
    showToast('Vault Admin is only available to the vault owner');
    return;
  }
  if (vaultAdminUnlocked) {
    if (enterAdmin) showView('admin');
    return;
  }
  vaultAdminPromptDismissed = false;
  openAdminPasswordModal();
  const overlay = document.getElementById('adminPasswordModal');
  if (!overlay || !enterAdmin) return;
  overlay.dataset.enterAdmin = '1';
}

function maybePromptOwnerPassword() {
  if (!isVaultOwnerIdentity()) return;
  if (vaultAdminUnlocked) return;
  if (vaultAdminPromptDismissed) return;
  openAdminPasswordModal({ focus: true });
}

function guardVaultAdminAccess(viewName) {
  if (viewName !== 'admin' && viewName !== 'admin-editor') return true;
  if (canAccessVaultAdmin()) return true;
  if (isVaultOwnerIdentity()) {
    promptVaultAdminUnlock({ enterAdmin: true });
    return false;
  }
  showToast('Vault Admin is only available to the vault owner');
  showView('profile');
  return false;
}

/* products the user "owns" (bought or free) — enables Download */
const owned = new Set();
const favorites = new Set();
const library = new Set();
let subscribed = false;
let currentProduct = null;
let editingProductId = null;

/* Subscription — starts on free plan, no localStorage */
const PLAN_META = {
  MORTAL:  { duration: 'Viewer only · never expires', forever: true, credits: 0 },
  ACOLYTE: { duration: '1 month', days: 30, credits: 2 },
  ETERNAL: { duration: 'Forever', forever: true, credits: 'Unlimited' },
};

const PLAN_DISPLAY = {
  MORTAL: {
    crown: 'assets/crown-lurker.gif',
    period: 'Viewer only · never expires',
    feats: ['FREE label items', 'Browse everything', 'No premium access'],
    blurb: 'Download anything with a FREE label in the catalog. Browse all items — premium, exclusive, and bundles need an upgrade or purchase.',
    price: '$0',
    pricePeriod: 'viewer · no expiry',
    free: true,
    iconWrap: 'plan-icon-wrap plan-icon-lurker-current',
    cardExtra: 'plan-card-current-lurker',
    name: 'Lurker',
  },
  ACOLYTE: {
    crown: 'assets/crown-leaker.gif',
    period: '1 month',
    feats: ['2 premium', '5 / day', '8% referral'],
    blurb: 'Unlock premium & exclusive drops with monthly credits. Renews every 30 days — cancel anytime.',
    price: '$9.99',
    pricePeriod: '/ month',
    iconWrap: 'plan-icon-wrap plan-icon-current',
    name: 'Leaker',
  },
  ETERNAL: {
    crown: 'assets/crown-heavenly.gif',
    period: 'Forever',
    feats: ['6 premium', 'Unlimited', '20% referral'],
    blurb: 'One payment, lifetime access. Unlimited credits, every premium item — yours forever.',
    price: '$199.99',
    pricePeriod: 'one-time',
    iconWrap: 'plan-icon-wrap plan-icon-heavenly',
    cardExtra: 'plan-card-current-heavenly',
    name: 'HEAVENLY',
  },
};
let subscription = { plan: null, endsAt: null, credits: 0 };

const PLAN_CROWNS = {
  MORTAL: 'assets/crown-lurker.gif',
  ACOLYTE: 'assets/crown-leaker.gif',
  ETERNAL: 'assets/crown-heavenly.gif',
};
const BUNDLE_TGS_PATH = encodeURI('assets/bundle-icon/AnimatedSticker.tgs');

const PLAN_CROWN_CLASS = {
  MORTAL: 'lurker',
  ACOLYTE: 'leaker',
  ETERNAL: 'heavenly',
};

function applyCrownClass(img, planKey, baseClass = 'plan-crown') {
  if (!img) return;
  Object.values(PLAN_CROWN_CLASS).forEach(suffix => img.classList.remove(`${baseClass}--${suffix}`));
  const suffix = PLAN_CROWN_CLASS[planKey];
  if (suffix) img.classList.add(`${baseClass}--${suffix}`);
}

const FREE_VIEWER_COPY = {
  eyebrow: 'No subscription yet',
  subtitle: 'FREE label items only · tap Get Premium to subscribe',
  status: 'Free',
  plan: 'No subscription',
  daysLeft: '—',
  ends: '—',
};

function applySubscription(planName) {
  const meta = PLAN_META[planName];
  if (!meta) return;
  subscription = {
    plan: planName,
    credits: meta.credits,
    endsAt: meta.forever ? null : new Date(Date.now() + meta.days * 86400000),
  };
  subscribed = true;
  updatePremiumUI();
  updatePlansPageUI();
  filterProducts();
}

function getActivePlanName() {
  return subscribed && subscription.plan ? subscription.plan : 'MORTAL';
}

function updatePlansPageUI() {
  const active = getActivePlanName();
  const display = PLAN_DISPLAY[active];
  if (!display) return;

  const card = document.getElementById('currentPlanCard');
  const crown = document.getElementById('currentPlanCrown');
  const iconWrap = document.getElementById('currentPlanIcon');
  const nameEl = document.getElementById('currentPlanName');
  const periodEl = document.getElementById('currentPlanPeriod');
  const featsEl = document.getElementById('currentPlanFeats');
  const priceEl = document.getElementById('currentPlanPrice');
  const pricePeriodEl = document.getElementById('currentPlanPricePeriod');
  const blurbEl = document.getElementById('currentPlanBlurb');
  const statusEl = document.getElementById('currentPlanStatus');
  const upgradeSection = document.getElementById('plansUpgradeSection');

  if (!card) return;

  card.className = `plan-card plan-card-current${display.cardExtra ? ` ${display.cardExtra}` : ''}`;
  crown.src = display.crown;
  applyCrownClass(crown, active);
  iconWrap.className = display.iconWrap || 'plan-icon-wrap';

  if (display.discount) {
    nameEl.innerHTML = `${display.name} <span class="discount">${display.discount}</span>`;
  } else {
    nameEl.textContent = display.name;
  }
  periodEl.textContent = subscribed ? display.period : FREE_VIEWER_COPY.subtitle;
  if (statusEl) statusEl.textContent = subscribed ? 'Active' : FREE_VIEWER_COPY.status;
  featsEl.innerHTML = display.feats.map(f => `<span class="plan-feat">${f}</span>`).join('');
  priceEl.textContent = display.price;
  priceEl.classList.toggle('price-free', !!display.free);
  pricePeriodEl.textContent = display.pricePeriod;

  if (blurbEl) {
    if (display.blurb) {
      blurbEl.textContent = display.blurb;
      blurbEl.hidden = false;
    } else {
      blurbEl.hidden = true;
    }
  }

  document.querySelectorAll('.plan-list .plan-card').forEach(el => {
    const plan = el.dataset.plan;
    if (plan === 'MORTAL') {
      el.hidden = active === 'MORTAL';
    } else {
      el.hidden = plan === active;
    }
  });

  if (upgradeSection) {
    const anyVisible = [...document.querySelectorAll('.plan-list .plan-card')].some(el => !el.hidden);
    upgradeSection.hidden = !anyVisible;
  }
}

function formatEndDate(date) {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function updatePremiumUI() {
  const active = subscribed && subscription.plan;
  const meta = active ? PLAN_META[subscription.plan] : null;
  const planKey = active ? subscription.plan : 'MORTAL';

  const eyebrow = document.getElementById('premiumEyebrow');
  const status = document.getElementById('premiumStatus');
  const nameEl = document.getElementById('premiumName');
  const sub = document.getElementById('premiumSub');
  const crown = document.getElementById('premiumCrown');
  const iconWrap = document.getElementById('premiumIconWrap');
  const planEl = document.getElementById('premiumPlan');
  const daysEl = document.getElementById('premiumDaysLeft');
  const creditsEl = document.getElementById('premiumCredits');
  const endsEl = document.getElementById('premiumEnds');
  const btn = document.getElementById('openPlansBtn');

  if (crown) {
    crown.src = PLAN_CROWNS[planKey] || PLAN_CROWNS.MORTAL;
    applyCrownClass(crown, planKey, 'premium-crown');
  }
  if (iconWrap) {
    iconWrap.classList.toggle('is-active', active);
    iconWrap.classList.toggle('is-eternal', planKey === 'ETERNAL');
  }
  if (nameEl) nameEl.textContent = PLAN_DISPLAY[planKey]?.name || planKey;
  if (eyebrow) eyebrow.textContent = active ? 'Subscription' : FREE_VIEWER_COPY.eyebrow;
  if (status) {
    status.textContent = active ? 'Active' : FREE_VIEWER_COPY.status;
    status.classList.toggle('is-active', active);
  }
  if (sub) sub.textContent = active ? meta.duration : FREE_VIEWER_COPY.subtitle;
  if (planEl) planEl.textContent = active ? meta.duration : FREE_VIEWER_COPY.plan;
  if (creditsEl) creditsEl.textContent = active ? String(subscription.credits) : '0';

  if (!active) {
    if (daysEl) daysEl.textContent = FREE_VIEWER_COPY.daysLeft;
    if (endsEl) endsEl.textContent = FREE_VIEWER_COPY.ends;
    if (btn) {
      btn.hidden = false;
      btn.textContent = 'Get Premium';
    }
    return;
  }

  if (meta.forever) {
    if (daysEl) daysEl.textContent = 'Forever';
    if (endsEl) endsEl.textContent = 'Never';
  } else {
    const daysLeft = Math.max(0, Math.ceil((subscription.endsAt - Date.now()) / 86400000));
    if (daysEl) daysEl.textContent = `${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
    if (endsEl) endsEl.textContent = formatEndDate(subscription.endsAt);
  }
  if (btn) {
    const isMaxPlan = subscription.plan === 'ETERNAL';
    btn.hidden = isMaxPlan;
    if (!isMaxPlan) btn.textContent = 'Upgrade Plan';
  }
}

/* Profile counters — start at zero, no localStorage */
const userStats = { downloads: 0, purchases: 0 };

const DL_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
const BADGE_ICONS = {
  tag: '<img class="badge-icon badge-icon-tag" src="assets/badges/price-tag.gif" alt="">',
  box: '<svg class="badge-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>',
  crown: '<svg class="badge-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18h18M5 18l2-10 5 4 2-6 2 6 5-4 2 10"/></svg>',
  star: '<svg class="badge-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  check: '<svg class="badge-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>',
  download: '<svg class="badge-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  lock: '<svg class="badge-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
};

function getProductAccessTier(product) {
  if (product.type === 'free' || product.badges?.includes('free')) return 'free';
  if (product.type === 'exclusive' || product.badges?.includes('exclusive')) return 'exclusive';
  if (product.type === 'premium' || product.badges?.includes('premium')) return 'premium';
  if (product.type === 'bundle' || product.badges?.includes('bundle')) return 'bundle';
  return product.price > 0 ? 'premium' : 'free';
}

const PLAN_RANK = { MORTAL: 0, ACOLYTE: 1, ETERNAL: 2 };

function getProductRequiredPlan(product) {
  if (product.planRequired) return product.planRequired;
  const tier = getProductAccessTier(product);
  if (tier === 'free') return 'MORTAL';
  if (tier === 'exclusive') return 'ETERNAL';
  return 'ACOLYTE';
}

function canAccessWithPlan(product, planKey = getActivePlanName()) {
  const tier = getProductAccessTier(product);
  if (tier === 'free') return true;
  if (owned.has(product.id) || library.has(product.id)) return true;
  return PLAN_RANK[planKey] >= PLAN_RANK[getProductRequiredPlan(product)];
}

function canDownloadProduct(product) {
  const tier = getProductAccessTier(product);
  if (tier === 'free') return true;
  if (owned.has(product.id) || library.has(product.id)) return true;
  if (tier === 'bundle') return false;
  return canAccessWithPlan(product);
}

const PLAN_BADGE_META = {
  MORTAL:  { name: 'Lurker',   cls: 'badge-plan-lurker' },
  ACOLYTE: { name: 'Leaker',   cls: 'badge-plan-leaker' },
  ETERNAL: { name: 'HEAVENLY', cls: 'badge-plan-heavenly' },
};

function renderPlanBadge(planKey) {
  const meta = PLAN_BADGE_META[planKey];
  if (!meta) return '';
  const crownCls = PLAN_CROWN_CLASS[planKey] ? ` badge-plan-icon--${PLAN_CROWN_CLASS[planKey]}` : '';
  return `<span class="badge badge-plan ${meta.cls}"><img class="badge-plan-icon${crownCls}" src="${PLAN_CROWNS[planKey]}" alt="">${meta.name}</span>`;
}

function renderCatalogPlanBadges(product) {
  return renderPlanBadge(getProductRequiredPlan(product));
}

function renderCatalogBadges(product) {
  let html = '';
  if (product.badges.includes('off')) {
    html += `<span class="badge badge-off">${BADGE_ICONS.tag} ${product.discount || 'OFF'}</span>`;
  }
  if (product.badges.includes('bundle')) {
    html += `<span class="badge badge-bundle badge-bundle-tier"><span class="bundle-lottie" data-tgs="${BUNDLE_TGS_PATH}" aria-hidden="true"></span>BUNDLE</span>`;
  }
  html += renderCatalogPlanBadges(product);
  return html;
}

function getUnusedEditorBadges() {
  const unused = [];
  const type = editorType?.value || 'bundle';
  const discountOn = type === 'bundle' && editorDiscountOn?.checked;
  const plan = editorPlanRequired?.value || 'ACOLYTE';

  if (type !== 'bundle') {
    unused.push({ key: 'type-bundle', label: 'Bundle', kind: 'type-bundle' });
  }
  if (type === 'bundle' && !discountOn) {
    unused.push({ key: 'sale', label: 'Sale', kind: 'sale' });
  }
  Object.entries(PLAN_BADGE_META).forEach(([planKey, meta]) => {
    if (planKey !== plan) {
      unused.push({ key: `plan-${planKey}`, label: meta.name, kind: 'plan', planKey, cls: meta.cls });
    }
  });
  return unused;
}

function enableEditorCoverBadge(key) {
  if (key === 'sale') {
    if (editorType?.value !== 'bundle') setEditorType('bundle');
    if (editorDiscountOn) editorDiscountOn.checked = true;
  } else if (key === 'type-bundle') {
    setEditorType('bundle');
  } else if (key.startsWith('plan-')) {
    setEditorPlan(key.slice(5));
  }
  updateEditorFeatureStates();
  updateEditorPreview();
}

function disableEditorCoverBadge(badge) {
  if (badge === 'discount') {
    if (editorDiscountOn) editorDiscountOn.checked = false;
    if (editorOldPriceWrap) editorOldPriceWrap.hidden = true;
  } else if (badge === 'bundle') {
    setEditorType('premium');
  } else if (badge === 'plan') {
    const current = editorPlanRequired?.value || 'ACOLYTE';
    let next = editorPreviousPlan && editorPreviousPlan !== current ? editorPreviousPlan : null;
    if (!next) {
      if (current === 'ETERNAL') next = 'ACOLYTE';
      else if (current === 'ACOLYTE') next = 'MORTAL';
    }
    if (next && next !== current) {
      editorPreviousPlan = null;
      if (editorPlanRequired) editorPlanRequired.value = next;
      editorPlanPicker?.querySelectorAll('.editor-tier-chip').forEach(btn => {
        btn.classList.toggle('is-on', btn.dataset.plan === next);
      });
    }
  }
  updateEditorPreview();
}

function applyEditorCoverDiscountPct(raw) {
  const val = Math.min(99, Math.max(1, Number(String(raw).replace(/\D/g, '')) || getEditorDiscountPercent()));
  if (editorDiscountPercent) editorDiscountPercent.value = val;
  if (editorType?.value !== 'bundle') setEditorType('bundle');
  if (editorDiscountOn) editorDiscountOn.checked = true;
  updateEditorPreview();
}

function closeEditorCoverBadgePop() {
  document.getElementById('editorCoverBadgePop')?.setAttribute('hidden', '');
  const add = document.getElementById('editorCoverBadgeAdd');
  add?.classList.remove('is-open');
  add?.setAttribute('aria-expanded', 'false');
  document.getElementById('editorCoverBadgesPanel')?.classList.remove('is-open');
}

function toggleEditorCoverBadgePop() {
  const pop = document.getElementById('editorCoverBadgePop');
  const panel = document.getElementById('editorCoverBadgesPanel');
  const add = document.getElementById('editorCoverBadgeAdd');
  if (!pop || !add) return;
  if (pop.hasAttribute('hidden')) {
    pop.removeAttribute('hidden');
    add.classList.add('is-open');
    add.setAttribute('aria-expanded', 'true');
    panel?.classList.add('is-open');
    initBundleLottie(pop);
  } else {
    closeEditorCoverBadgePop();
  }
}

function renderEditorCoverBadges(draft) {
  const unused = getUnusedEditorBadges();
  const showAdd = unused.length > 0;
  let tags = '';

  if (draft.badges.includes('off')) {
    const pct = getEditorDiscountPercent();
    tags += `<span class="badge badge-off editor-cover-badge editor-cover-badge--removable" data-badge="discount" title="Click to remove">
      ${BADGE_ICONS.tag}
      <span class="editor-cover-badge-pct" contenteditable="plaintext-only" spellcheck="false" aria-label="Discount percent" title="Click number to edit">${pct}</span><span class="editor-cover-badge-suffix">% OFF</span>
    </span>`;
  }
  if (draft.badges.includes('bundle')) {
    tags += `<span class="badge badge-bundle badge-bundle-tier editor-cover-badge editor-cover-badge--removable" data-badge="bundle" title="Click to remove">
      <span class="bundle-lottie" data-tgs="${BUNDLE_TGS_PATH}" aria-hidden="true"></span>BUNDLE
    </span>`;
  }
  const planKey = draft.planRequired || getProductRequiredPlan(draft);
  const planMeta = PLAN_BADGE_META[planKey];
  if (planMeta) {
    const crownCls = PLAN_CROWN_CLASS[planKey] ? ` badge-plan-icon--${PLAN_CROWN_CLASS[planKey]}` : '';
    tags += `<span class="badge badge-plan ${planMeta.cls} editor-cover-badge editor-cover-badge--removable" data-badge="plan" title="Click to remove">
      <img class="badge-plan-icon${crownCls}" src="${PLAN_CROWNS[planKey]}" alt="">${planMeta.name}
    </span>`;
  }

  const unusedItems = unused.map(item => {
    if (item.kind === 'plan') {
      const crownCls = PLAN_CROWN_CLASS[item.planKey] ? ` badge-plan-icon--${PLAN_CROWN_CLASS[item.planKey]}` : '';
      return `<button type="button" class="editor-cover-badge-pick badge badge-plan ${item.cls}" data-badge-key="${item.key}">
        <img class="badge-plan-icon${crownCls}" src="${PLAN_CROWNS[item.planKey]}" alt="">${item.label}
      </button>`;
    }
    if (item.kind === 'type-bundle') {
      return `<button type="button" class="editor-cover-badge-pick badge badge-bundle badge-bundle-tier" data-badge-key="${item.key}">
        <span class="bundle-lottie" data-tgs="${BUNDLE_TGS_PATH}" aria-hidden="true"></span>BUNDLE
      </button>`;
    }
    if (item.kind === 'sale') {
      return `<button type="button" class="editor-cover-badge-pick badge badge-off" data-badge-key="${item.key}">
        ${BADGE_ICONS.tag} Sale
      </button>`;
    }
    return '';
  }).join('');

  return `
    <div class="editor-cover-badges-panel" id="editorCoverBadgesPanel">
      <div class="editor-cover-badges-row">
        ${showAdd ? `<button type="button" class="editor-cover-badges-add" id="editorCoverBadgeAdd" aria-label="Add tag" aria-expanded="false"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>` : ''}
        <div class="editor-cover-badges-tags">${tags}</div>
      </div>
      <div class="editor-cover-badges-pop" id="editorCoverBadgePop" hidden>${unusedItems}</div>
    </div>
  `;
}

function renderBadges(product, context = 'catalog') {
  if (context === 'purchases') {
    return `<span class="badge badge-owned">${BADGE_ICONS.check} OWNED</span>`;
  }
  if (context === 'catalog' || context === 'admin') return renderCatalogBadges(product);

  let badges = '';
  const requiredPlan = getProductRequiredPlan(product);
  if (product.badges.includes('off')) badges += `<span class="badge badge-off">${BADGE_ICONS.tag} ${product.discount || 'OFF'}</span>`;
  if (product.badges.includes('bundle')) badges += `<span class="badge badge-bundle badge-bundle-tier"><span class="bundle-lottie" data-tgs="${BUNDLE_TGS_PATH}" aria-hidden="true"></span>BUNDLE</span>`;
  badges += renderPlanBadge(requiredPlan);
  return badges;
}
const isPaid = p => p.price > 0;

function updateProfileStats() {
  const dl = document.getElementById('profileDownloads');
  const pu = document.getElementById('profilePurchases');
  if (dl) dl.textContent = userStats.downloads;
  if (pu) pu.textContent = userStats.purchases;
}

function updateNavBadges() {
  const favBadge = document.getElementById('favNavBadge');
  const purchasesBadge = document.getElementById('purchasesNavBadge');
  const favUnread = Math.max(0, favorites.size - favoritesSeenCount);
  const purchaseUnread = Math.max(0, library.size - purchasesSeenCount);

  if (favBadge) {
    const showFav = favUnread > 0 && currentView !== 'favourites';
    favBadge.textContent = favUnread > 99 ? '99+' : String(favUnread);
    favBadge.hidden = !showFav;
  }
  if (purchasesBadge) {
    const showPurchases = purchaseUnread > 0 && currentView !== 'purchases';
    purchasesBadge.textContent = purchaseUnread > 99 ? '99+' : String(purchaseUnread);
    purchasesBadge.hidden = !showPurchases;
  }
}

function startDownload(product) {
  userStats.downloads++;
  updateProfileStats();
  const wasNew = !library.has(product.id);
  library.add(product.id);
  renderPurchases();
  if (wasNew) {
    filterProducts();
    renderBundles();
  }
  const openedDrive = openProductDownload(product);
  showDownloadCelebration(product, openedDrive);
}

/* ── Celebration modals (purchase + download + favourites) ── */
const celebrateOverlay = document.getElementById('celebrateOverlay');
const celebratePanel = document.getElementById('celebratePanel');
const celebrateConfetti = document.getElementById('celebrateConfetti');
const celebrateMark = document.getElementById('celebrateMark');
let celebrateProduct = null;
let celebratePlan = null;
let celebrateMode = 'purchase';
let confettiRaf = null;
const FAV_MODAL_PREF = 'j2026vault_skip_fav_modal';

function favModalEnabled() {
  try { return localStorage.getItem(FAV_MODAL_PREF) !== '1'; } catch { return true; }
}

function disableFavModal() {
  try { localStorage.setItem(FAV_MODAL_PREF, '1'); } catch {}
}

function setCelebrateSkip(show) {
  document.getElementById('celebrateSkip').hidden = !show;
}

const CELEBRATE_ICONS = {
  check: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 6L9 17l-5-5"/></svg>',
  heart: '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  heartOff: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/><line x1="4" y1="4" x2="20" y2="20"/></svg>',
  trash: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>',
  crown: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18h18M5 18l2-10 5 4 2-6 2 6 5-4 2 10"/></svg>',
  tag: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.25" fill="currentColor" stroke="none"/></svg>',
};

function setCelebrateMode(mode, planKey = null) {
  celebratePanel.classList.remove(
    'mode-purchase', 'mode-download', 'mode-fav-add', 'mode-fav-remove', 'mode-subscription',
    'mode-catalog-save', 'mode-catalog-reset', 'mode-catalog-reset-done',
    'mode-catalog-delete', 'mode-catalog-delete-done',
    'mode-sub-lurker', 'mode-sub-leaker', 'mode-sub-heavenly',
  );
  celebratePanel.classList.add(`mode-${mode}`);
  if (mode === 'subscription' && planKey) {
    const suffix = PLAN_CROWN_CLASS[planKey];
    if (suffix) celebratePanel.classList.add(`mode-sub-${suffix}`);
  }
}

function setCelebrateIcon(name) {
  celebrateMark.innerHTML = CELEBRATE_ICONS[name] || CELEBRATE_ICONS.check;
}

function setCelebratePlanCrown(planKey) {
  const src = PLAN_CROWNS[planKey];
  const suffix = PLAN_CROWN_CLASS[planKey] || 'lurker';
  if (!src) {
    setCelebrateIcon('crown');
    return;
  }
  celebrateMark.innerHTML = `<img class="celebrate-crown celebrate-crown--${suffix}" src="${src}" alt="">`;
}

function stopConfetti() {
  if (confettiRaf) cancelAnimationFrame(confettiRaf);
  confettiRaf = null;
  const ctx = celebrateConfetti.getContext('2d');
  ctx.clearRect(0, 0, celebrateConfetti.width, celebrateConfetti.height);
}

function fireConfetti(opts = {}) {
  const { count = 130, colors = ['#8b5cf6', '#a78bfa', '#6d40e0', '#cf9f45', '#e8e4ff', '#c4b5fd'] } = opts;
  stopConfetti();
  const parent = celebrateOverlay;
  celebrateConfetti.width = parent.clientWidth;
  celebrateConfetti.height = parent.clientHeight;
  const ctx = celebrateConfetti.getContext('2d');
  const cx = celebrateConfetti.width / 2;
  const cy = celebrateConfetti.height * 0.44;
  const particles = Array.from({ length: count }, () => ({
    x: cx + (Math.random() - 0.5) * 40,
    y: cy + (Math.random() - 0.5) * 20,
    vx: (Math.random() - 0.5) * 16,
    vy: Math.random() * -14 - 5,
    w: Math.random() * 7 + 4,
    h: Math.random() * 4 + 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    rot: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.22,
    life: 1,
    drag: 0.985,
    gravity: 0.16 + Math.random() * 0.08,
  }));

  const tick = () => {
    ctx.clearRect(0, 0, celebrateConfetti.width, celebrateConfetti.height);
    let alive = false;
    for (const p of particles) {
      if (p.life <= 0) continue;
      alive = true;
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.spin;
      p.life -= 0.007;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (alive) confettiRaf = requestAnimationFrame(tick);
    else stopConfetti();
  };
  tick();
}

function openCelebrateOverlay() {
  celebrateOverlay.classList.remove('open');
  void celebrateOverlay.offsetWidth;
  celebrateOverlay.classList.add('open');
  celebrateOverlay.setAttribute('aria-hidden', 'false');
}

function closeCelebrate() {
  celebrateOverlay.classList.remove('open');
  celebrateOverlay.setAttribute('aria-hidden', 'true');
  stopConfetti();
  celebrateProduct = null;
  celebratePlan = null;
}

function showPurchaseCelebration(product) {
  celebrateProduct = product;
  celebrateMode = 'purchase';
  setCelebrateMode('purchase');
  setCelebrateIcon('check');

  const driveFlow = productUsesDriveAccess(product);
  document.getElementById('celebrateEyebrow').textContent = 'Purchase complete';
  document.getElementById('celebrateTitle').textContent = 'Congratulations!';
  document.getElementById('celebrateSub').innerHTML = `You purchased <strong>${product.title}</strong>`;
  const hint = document.getElementById('celebrateHint');
  hint.textContent = driveFlow ? GOOGLE_DRIVE_ACCESS_HINT : 'You can now download';
  hint.hidden = false;

  document.getElementById('celebratePrimary').textContent = driveFlow ? 'Open Google Drive' : 'Download';
  document.getElementById('celebrateDismiss').hidden = false;
  setCelebrateSkip(false);

  openCelebrateOverlay();
  fireConfetti();
}

function showDownloadCelebration(product, openedDrive = false) {
  celebrateProduct = product;
  celebrateMode = 'download';
  setCelebrateMode('download');
  setCelebrateIcon('check');

  const driveFlow = openedDrive || productUsesDriveAccess(product);
  const hint = document.getElementById('celebrateHint');
  if (driveFlow) {
    document.getElementById('celebrateEyebrow').textContent = 'Google Drive';
    document.getElementById('celebrateTitle').textContent = 'Opening Google Drive';
    document.getElementById('celebrateSub').textContent = product.title;
    hint.textContent = GOOGLE_DRIVE_ACCESS_HINT;
    hint.hidden = false;
    document.getElementById('celebratePrimary').textContent = 'Open Google Drive again';
  } else {
    document.getElementById('celebrateEyebrow').textContent = 'Download';
    document.getElementById('celebrateTitle').textContent = 'Download started';
    document.getElementById('celebrateSub').textContent = product.title;
    hint.hidden = true;
    document.getElementById('celebratePrimary').textContent = 'Got it';
  }

  document.getElementById('celebrateDismiss').hidden = true;
  setCelebrateSkip(false);

  openCelebrateOverlay();
}

function showFavoriteAddedCelebration(product) {
  celebrateProduct = product;
  celebrateMode = 'fav-add';
  setCelebrateMode('fav-add');
  setCelebrateIcon('heart');

  document.getElementById('celebrateEyebrow').textContent = 'Favourites';
  document.getElementById('celebrateTitle').textContent = 'Added to favourites';
  document.getElementById('celebrateSub').innerHTML = `<strong>${product.title}</strong> is saved for quick access`;
  const hint = document.getElementById('celebrateHint');
  hint.textContent = 'Find it anytime in your favourites tab';
  hint.hidden = false;

  document.getElementById('celebratePrimary').textContent = 'View favourites';
  document.getElementById('celebrateDismiss').hidden = false;
  setCelebrateSkip(true);

  openCelebrateOverlay();
  fireConfetti({
    count: 90,
    colors: ['#f472b6', '#ec4899', '#a78bfa', '#c4b5fd', '#fbcfe8', '#e8e4ff'],
  });
}

function showFavoriteRemovedCelebration(product) {
  celebrateProduct = product;
  celebrateMode = 'fav-remove';
  setCelebrateMode('fav-remove');
  setCelebrateIcon('heartOff');

  document.getElementById('celebrateEyebrow').textContent = 'Favourites';
  document.getElementById('celebrateTitle').textContent = 'Removed from favourites';
  document.getElementById('celebrateSub').textContent = product.title;
  document.getElementById('celebrateHint').hidden = true;

  document.getElementById('celebratePrimary').textContent = 'Got it';
  document.getElementById('celebrateDismiss').hidden = true;
  setCelebrateSkip(true);

  openCelebrateOverlay();
}

function showCatalogSaveCelebration(product) {
  celebrateProduct = product;
  celebratePlan = null;
  celebrateMode = 'catalog-save';
  setCelebrateMode('catalog-save');
  setCelebrateIcon('tag');

  document.getElementById('celebrateEyebrow').textContent = 'Catalog updated';
  document.getElementById('celebrateTitle').textContent = 'Item saved!';
  document.getElementById('celebrateSub').innerHTML = `<strong>${product.title}</strong> is now in your catalog`;
  const hint = document.getElementById('celebrateHint');
  hint.textContent = 'Visible on this device instantly';
  hint.hidden = false;

  document.getElementById('celebratePrimary').textContent = 'View in catalog';
  document.getElementById('celebrateDismiss').textContent = 'Create another';
  document.getElementById('celebrateDismiss').hidden = false;
  setCelebrateSkip(false);

  openCelebrateOverlay();
  fireConfetti({ count: 110, colors: ['#a78bfa', '#c4b5fd', '#e8e4ff', '#f9a8d4', '#fff'] });
}

function showCatalogResetConfirm() {
  celebrateProduct = null;
  celebratePlan = null;
  celebrateMode = 'catalog-reset';
  setCelebrateMode('catalog-reset');
  setCelebrateIcon('crown');

  document.getElementById('celebrateEyebrow').textContent = 'Reset draft';
  document.getElementById('celebrateTitle').textContent = 'Start over?';
  document.getElementById('celebrateSub').textContent = 'This only resets the item you are editing — your catalog stays untouched.';
  document.getElementById('celebrateHint').hidden = true;

  document.getElementById('celebratePrimary').textContent = 'Reset draft';
  document.getElementById('celebrateDismiss').textContent = 'Keep editing';
  document.getElementById('celebrateDismiss').hidden = false;
  setCelebrateSkip(false);

  openCelebrateOverlay();
}

function showCatalogResetDone() {
  celebrateMode = 'catalog-reset-done';
  setCelebrateMode('catalog-reset-done');
  setCelebrateIcon('check');

  document.getElementById('celebrateEyebrow').textContent = 'Draft reset';
  document.getElementById('celebrateTitle').textContent = 'Template reloaded';
  document.getElementById('celebrateSub').textContent = 'Example post loaded — edit anything you want.';
  document.getElementById('celebrateHint').hidden = true;

  document.getElementById('celebratePrimary').textContent = 'Continue editing';
  document.getElementById('celebrateDismiss').hidden = true;
  setCelebrateSkip(false);

  openCelebrateOverlay();
  fireConfetti({ count: 60, colors: ['#a78bfa', '#c4b5fd', '#e8e4ff'] });
}

function showCatalogDeleteConfirm(product) {
  celebrateProduct = product;
  celebratePlan = null;
  celebrateMode = 'catalog-delete';
  setCelebrateMode('catalog-delete');
  setCelebrateIcon('trash');
  setCelebrateSkip(false);
  document.getElementById('celebrateEyebrow').textContent = 'Delete post';
  document.getElementById('celebrateTitle').textContent = 'Remove from catalog?';
  document.getElementById('celebrateSub').innerHTML = `<strong>${product.title}</strong> will be permanently removed from your catalog.`;
  document.getElementById('celebrateHint').hidden = true;
  document.getElementById('celebratePrimary').textContent = 'Delete post';
  document.getElementById('celebrateDismiss').textContent = 'Cancel';
  document.getElementById('celebrateDismiss').hidden = false;
  openCelebrateOverlay();
}

function showCatalogDeleteDone(product) {
  celebrateProduct = product;
  celebratePlan = null;
  celebrateMode = 'catalog-delete-done';
  setCelebrateMode('catalog-delete-done');
  setCelebrateIcon('trash');
  setCelebrateSkip(false);
  document.getElementById('celebrateEyebrow').textContent = 'Catalog updated';
  document.getElementById('celebrateTitle').textContent = 'Post deleted';
  document.getElementById('celebrateSub').innerHTML = `<strong>${product.title}</strong> was removed from your catalog`;
  document.getElementById('celebrateHint').hidden = true;
  document.getElementById('celebratePrimary').textContent = 'Back to admin';
  document.getElementById('celebrateDismiss').hidden = true;
  openCelebrateOverlay();
  fireConfetti({ count: 55, colors: ['#f87171', '#fca5a5', '#8b5cf6', '#a78bfa'] });
}

function requestDeleteCatalogProduct(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product || !isCustomProduct(product)) return;
  showCatalogDeleteConfirm(product);
}

function deleteCatalogProduct(id) {
  const idx = PRODUCTS.findIndex(p => p.id === id);
  if (idx === -1) return false;
  const product = PRODUCTS[idx];
  if (!isCustomProduct(product)) return false;

  PRODUCTS.splice(idx, 1);
  favorites.delete(id);
  library.delete(id);
  owned.delete(id);
  saveCatalogProducts();

  if (currentProduct?.id === id) {
    currentProduct = null;
    showView(previousView || 'catalog');
  }
  syncCatalogUI();
  renderAdminPanel();
  return true;
}

function showSubscriptionCelebration(planName) {
  const meta = PLAN_META[planName];
  if (!meta) return;

  const displayName = PLAN_DISPLAY[planName]?.name || planName;
  celebratePlan = planName;
  celebrateProduct = null;
  celebrateMode = 'subscription';
  setCelebrateMode('subscription', planName);
  setCelebratePlanCrown(planName);

  const planNameHtml = `<span class="celebrate-plan-name">${displayName}</span>`;
  document.getElementById('celebrateEyebrow').textContent = 'Subscription active';
  document.getElementById('celebrateTitle').innerHTML = `${planNameHtml} unlocked`;
  document.getElementById('celebrateSub').innerHTML = `${planNameHtml} subscription active — premium & exclusive unlocked`;
  const hint = document.getElementById('celebrateHint');
  hint.textContent = meta.forever
    ? 'Unlimited credits · lifetime access'
    : `${meta.duration} · ${meta.credits} premium credits`;
  hint.hidden = false;

  document.getElementById('celebratePrimary').textContent = 'Explore catalog';
  document.getElementById('celebrateDismiss').textContent = 'Continue';
  document.getElementById('celebrateDismiss').hidden = false;
  setCelebrateSkip(false);

  openCelebrateOverlay();
  fireConfetti({
    count: 110,
    colors: ['#8b5cf6', '#a78bfa', '#cf9f45', '#e8c56a', '#f2f2f5', '#6d40e0'],
  });
}

document.getElementById('celebrateClose').addEventListener('click', closeCelebrate);
document.getElementById('celebrateDismiss').addEventListener('click', () => {
  const mode = celebrateMode;
  if (mode === 'catalog-save') {
    closeCelebrate();
    openAdminEditor();
    return;
  }
  if (mode === 'catalog-delete') {
    closeCelebrate();
    return;
  }
  closeCelebrate();
});

document.getElementById('celebrateSkip').addEventListener('click', () => {
  disableFavModal();
  closeCelebrate();
});
celebrateOverlay.addEventListener('click', e => { if (e.target === celebrateOverlay) closeCelebrate(); });
document.getElementById('celebratePrimary').addEventListener('click', () => {
  const product = celebrateProduct;
  const mode = celebrateMode;
  if (mode === 'catalog-reset') {
    loadEditorTemplate();
    closeCelebrate();
    showCatalogResetDone();
    return;
  }
  if (mode === 'catalog-delete') {
    const deleted = product ? deleteCatalogProduct(product.id) : false;
    if (deleted) {
      if (currentView === 'admin-editor') closeAdminEditor();
      showCatalogDeleteDone(product);
    } else closeCelebrate();
    return;
  }
  if (mode === 'catalog-reset-done' || mode === 'catalog-delete-done') {
    closeCelebrate();
    if (mode === 'catalog-delete-done') showView('admin');
    return;
  }
  if (mode === 'catalog-save') {
    closeCelebrate();
    if (product) {
      openProduct(product);
      return;
    }
    showView('catalog');
    return;
  }
  if (mode === 'download' && product && productUsesDriveAccess(product)) {
    openProductDownload(product);
    closeCelebrate();
    return;
  }
  closeCelebrate();
  if (mode === 'purchase' && product) startDownload(product);
  else if (mode === 'fav-add') showView('favourites');
  else if (mode === 'subscription') showView('catalog');
});

/* ── DOM refs ── */
const appWindow = document.getElementById('appWindow');
const content = document.getElementById('content');
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');
const productGrid = document.getElementById('productGrid');
const bundleList = document.getElementById('bundleList');
const searchInput = document.getElementById('searchInput');
const filterChips = document.getElementById('filterChips');
const sortChips = document.getElementById('sortChips');
const itemCount = document.getElementById('itemCount');
const carouselTrack = document.getElementById('carouselTrack');
const carouselDots = document.getElementById('carouselDots');
const favouritesGrid = document.getElementById('favouritesGrid');
const favouritesEmpty = document.getElementById('favouritesEmpty');
const purchasesGrid = document.getElementById('purchasesGrid');
const purchasesEmpty = document.getElementById('purchasesEmpty');
const adminPostGrid = document.getElementById('adminPostGrid');
const editorDeleteBtn = document.getElementById('editorDeleteBtn');
const adminEditorBack = document.getElementById('adminEditorBack');
const catalogEditorForm = document.getElementById('catalogEditorForm');
const editorResetBtn = document.getElementById('editorResetBtn');

let currentView = 'catalog';
let previousView = 'catalog';
let currentFilter = 'all';
let currentSort = 'date';
let carouselIndex = 0;
let carouselTimer;
let purchasesSeenCount = 0;
let favoritesSeenCount = 0;

const editorTitle = document.getElementById('editorTitle');
const editorAuthor = document.getElementById('editorAuthor');
const editorWebsite = document.getElementById('editorWebsite');
const editorFileSize = document.getElementById('editorFileSize');
const editorFileSizeAmount = document.getElementById('editorFileSizeAmount');
const editorFileSizeUnits = document.getElementById('editorFileSizeUnits');
const editorPrice = document.getElementById('editorPrice');
const editorType = document.getElementById('editorType');
const editorPlanRequired = document.getElementById('editorPlanRequired');
const editorThumb = document.getElementById('editorThumb');
const editorVersion = document.getElementById('editorVersion');
const editorFormat = document.getElementById('editorFormat');
const editorFormatPicker = document.getElementById('editorFormatPicker');
const editorTags = document.getElementById('editorTags');
const editorTagsInput = document.getElementById('editorTagsInput');
const editorAbout = document.getElementById('editorAbout');
const editorAboutInsideHtml = document.getElementById('editorAboutInsideHtml');
const editorAboutIntroHtml = document.getElementById('editorAboutIntroHtml');
const editorAboutIntro = document.getElementById('editorAboutIntro');
const editorAboutInsideWrap = document.getElementById('editorAboutInsideWrap');
const editorAboutInsideTitle = document.getElementById('editorAboutInsideTitle');
const editorAboutInsideBody = document.getElementById('editorAboutInsideBody');
const editorAboutInsideEmpty = document.getElementById('editorAboutInsideEmpty');
const editorAboutInsideFolder = document.getElementById('editorAboutInsideFolder');
const editorAboutBundleBlock = document.getElementById('editorAboutBundleBlock');
const editorAboutToolbarEffects = document.getElementById('editorAboutToolbarEffects');
const editorAboutLive = document.getElementById('editorAboutLive');
const editorAboutHelp = document.getElementById('editorAboutHelp');
const editorAboutSwitchLabel = document.getElementById('editorAboutSwitchLabel');
const editorAboutMediaFile = document.getElementById('editorAboutMediaFile');
let pendingAboutMediaImg = null;
const editorAboutEditableWrap = document.querySelector('.editor-about-editable-wrap');
let editorAboutIntroFocused = false;
let editorAboutInsideTitleFocused = false;
let editorAboutInsideFocused = false;
let savedAboutSelection = null;
let aboutLastFocusedEditable = null;
const editorDownloads = document.getElementById('editorDownloads');
const editorFavs = document.getElementById('editorFavs');
const editorStatsOn = document.getElementById('editorStatsOn');
const editorStatsField = document.getElementById('editorStatsField');
const editorStatsPills = document.getElementById('editorStatsPills');
const editorDetailsOn = document.getElementById('editorDetailsOn');
const editorAboutOn = document.getElementById('editorAboutOn');
const editorDetailsPanel = document.getElementById('editorDetailsPanel');
const editorAboutPanel = document.getElementById('editorAboutPanel');
const editorBundlePanel = document.getElementById('editorBundlePanel');
const editorBundleFolderOn = document.getElementById('editorBundleFolderOn');
const editorBundleItemsList = document.getElementById('editorBundleItemsList');
const editorBundleAddItem = document.getElementById('editorBundleAddItem');
const editorAuthorIconFile = document.getElementById('editorAuthorIconFile');
const editorAuthorIconClear = document.getElementById('editorAuthorIconClear');
const editorPreviewHero = document.getElementById('editorPreviewHero');
const editorPreviewBadges = document.getElementById('editorPreviewBadges');
const editorPreviewIcons = document.getElementById('editorPreviewIcons');
const editorThumbRow = document.getElementById('editorThumbRow');
const editorSystemChips = document.getElementById('editorSystemChips');
const editorOsPicker = document.getElementById('editorOsPicker');
const editorAppPicker = document.getElementById('editorAppPicker');
const editorDetailVersion = document.getElementById('editorDetailVersion');
const editorDetailFormat = document.getElementById('editorDetailFormat');
const editorDetailOS = document.getElementById('editorDetailOS');
const editorDetailSoftware = document.getElementById('editorDetailSoftware');
const editorDetailDelivery = document.getElementById('editorDetailDelivery');
const editorDetailTags = document.getElementById('editorDetailTags');
const editorDetailFileSize = document.getElementById('editorDetailFileSize');
const editorDetailAuthorIconSlot = document.getElementById('editorDetailAuthorIconSlot');
const OS_EDITOR_KEYS = ['windows', 'apple'];
const APP_EDITOR_KEYS = ['photoshop', 'premiere', 'after-effects', 'davinci'];
const DELIVERY_EDITOR_KEYS = ['google-drive', 'mega', 'telegram'];

const editorDetailPopIds = {
  format: 'editorDetailFormatPop',
  delivery: 'editorDetailDeliveryPop',
  filesize: 'editorDetailFileSizePop',
  tags: 'editorDetailTagsPop',
};
const editorOldPriceWrap = document.getElementById('editorOldPriceWrap');
const editorOldPricePreview = document.getElementById('editorOldPricePreview');
const editorThumbPicker = document.getElementById('editorThumbPicker');
const editorCoverFile = document.getElementById('editorCoverFile');
const editorCoverClear = document.getElementById('editorCoverClear');
const editorCoverEmpty = document.getElementById('editorCoverEmpty');
const editorCoverImg = document.getElementById('editorCoverImg');
const editorDeliveryPicker = document.getElementById('editorDeliveryPicker');
const editorDeliveryLinksFields = document.getElementById('editorDeliveryLinksFields');
const editorTypePicker = document.getElementById('editorTypePicker');
const editorPlanPicker = document.getElementById('editorPlanPicker');
const editorDiscountOn = document.getElementById('editorDiscountOn');
const editorDiscountPercent = document.getElementById('editorDiscountPercent');
const editorPostVaultBadgeHost = document.getElementById('editorPostVaultBadgeHost');
const editorPostAuthorIconSlot = document.getElementById('editorPostAuthorIconSlot');
const editorPostAuthorRow = document.getElementById('editorPostAuthorRow');
if (editorPostVaultBadgeHost) {
  editorPostVaultBadgeHost.innerHTML = renderVaultBadge();
}
let editorCoverDataUrl = null;
let editorPreviousPlan = null;
let editorAuthorIconDataUrl = null;
let editorBundleItems = [];
let editorDeliveryLinks = { 'google-drive': '', mega: '', telegram: '' };

function cloneBundleItems(items = []) {
  return items.map(item => ({ name: item.name || '', icon: item.icon || '' }));
}

function setEditorAuthorIcon(dataUrl) {
  editorAuthorIconDataUrl = dataUrl || null;
  if (editorAuthorIconClear) editorAuthorIconClear.hidden = !editorAuthorIconDataUrl;
}

function getEditorBundleItemsFromState() {
  return editorBundleItems
    .map(item => ({ name: (item.name || '').trim(), icon: item.icon || '' }))
    .filter(item => item.name);
}

function setEditorBundleItems(items = []) {
  editorBundleItems = cloneBundleItems(items);
  renderEditorBundleItemsList();
}

function assignEditorBundleItemIcon(index, file) {
  if (Number.isNaN(index) || !editorBundleItems[index]) return;
  readImageFile(file, dataUrl => {
    editorBundleItems[index].icon = dataUrl;
    renderEditorBundleItemsList();
    updateEditorPreview();
    showToast('Item icon added');
  });
}

function renderEditorBundleItemsList() {
  if (!editorBundleItemsList) return;
  if (!editorBundleItems.length) {
    editorBundleItemsList.innerHTML = '<p class="editor-bundle-empty">No items yet — add what ships in this bundle.</p>';
    return;
  }
  editorBundleItemsList.innerHTML = editorBundleItems.map((item, i) => {
    const hasIcon = !!item.icon;
    const dropzoneContent = hasIcon
      ? `<img src="${item.icon}" alt="" class="editor-bundle-item-thumb">
         <button type="button" class="editor-bundle-icon-clear" data-index="${i}" aria-label="Remove icon">&times;</button>`
      : `<span class="editor-bundle-dropzone-empty">
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
           <span>Drop or click</span>
         </span>`;
    return `
      <div class="editor-bundle-item" data-index="${i}">
        <label class="editor-bundle-dropzone${hasIcon ? ' has-icon' : ''}" data-index="${i}">
          <input type="file" accept="image/*,.gif" data-index="${i}" hidden>
          ${dropzoneContent}
        </label>
        <input type="text" class="editor-detail-input editor-bundle-item-name" value="${escapeHtml(item.name)}" placeholder="Item name" data-index="${i}">
        <button type="button" class="editor-bundle-item-remove" data-index="${i}" aria-label="Remove item">&times;</button>
      </div>`;
  }).join('');
}

function addEditorBundleItem() {
  editorBundleItems.push({ name: '', icon: '' });
  renderEditorBundleItemsList();
  updateEditorPreview();
  const lastInput = editorBundleItemsList?.querySelector('.editor-bundle-item:last-child .editor-bundle-item-name');
  lastInput?.focus();
}

function readImageFile(file, onLoad) {
  if (!file) return;
  if (file.size > 4 * 1024 * 1024) {
    showToast('Image is too large (max 4MB)');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => onLoad(reader.result);
  reader.readAsDataURL(file);
}

const THUMB_CLASSES = ['thumb-1', 'thumb-2', 'thumb-3', 'thumb-4', 'thumb-5', 'thumb-6', 'thumb-7'];

function applyProductCover(el, product) {
  if (!el || !product) return;
  const isHero = el.classList.contains('product-hero');
  THUMB_CLASSES.forEach(cls => el.classList.remove(cls));
  el.querySelector('.product-hero-img, .card-cover-img')?.remove();
  el.classList.toggle('has-cover-image', !!product.coverImage);

  if (product.coverImage) {
    el.style.backgroundImage = '';
    const img = document.createElement('img');
    img.className = isHero ? 'product-hero-img' : 'card-cover-img';
    img.src = product.coverImage;
    img.alt = product.title || 'Product cover';
    el.appendChild(img);
  } else {
    el.style.backgroundImage = '';
    el.classList.add(product.thumb || 'thumb-1');
  }
}

const EDITOR_TEMPLATE = {
  title: 'Example Bundle',
  author: 'Studio Name',
  authorIcon: null,
  price: 9.99,
  type: 'bundle',
  planRequired: 'ACOLYTE',
  thumb: '',
  coverImage: null,
  discountOn: true,
  discountPercent: 45,
  version: '1.0',
  format: '.zip',
  fileSize: '4 GB',
  software: 'Photoshop',
  website: '',
  downloadUrl: '',
  deliveryLinks: {},
  systems: ['photoshop', 'windows', 'apple'],
  delivery: ['google-drive'],
  tags: ['example', 'bundle', 'leaker'],
  about: '',
  aboutOn: true,
  bundleFolderOn: true,
  bundleItems: [],
  downloads: '0+',
  favs: 0,
  statsOn: true,
  detailsOn: true,
  deliveryOn: true,
  systemsOn: true,
  aboutOn: true,
};

function setEditorFormat(format) {
  const key = normalizeFormatKey(format || '.zip');
  if (editorFormat) editorFormat.value = key;
  editorFormatPicker?.querySelectorAll('.editor-icon-chip').forEach(btn => {
    btn.classList.toggle('is-on', normalizeFormatKey(btn.dataset.format) === key);
  });
}

function getEditorFormat() {
  return normalizeFormatKey(editorFormat?.value || '.zip');
}

function getEditorDeliveries() {
  if (!editorDeliveryPicker) return [];
  return [...editorDeliveryPicker.querySelectorAll('.editor-icon-chip.is-on')]
    .map(btn => btn.dataset.delivery)
    .filter(Boolean);
}

function setEditorDeliveries(deliveries) {
  if (!editorDeliveryPicker) return;
  const set = new Set(normalizeDeliveries(deliveries));
  editorDeliveryPicker.querySelectorAll('.editor-icon-chip').forEach(btn => {
    btn.classList.toggle('is-on', set.has(btn.dataset.delivery));
  });
}

function getEditorDeliveryChip(deliveryKey) {
  return editorDeliveryPicker?.querySelector(`[data-delivery="${deliveryKey}"]`);
}

function syncEditorDeliveryLinksFromInputs() {
  editorDeliveryLinksFields?.querySelectorAll('[data-delivery-link]').forEach(input => {
    editorDeliveryLinks[input.dataset.deliveryLink] = input.value;
  });
}

function getEditorDeliveryLinksFromState() {
  syncEditorDeliveryLinksFromInputs();
  const links = {};
  DELIVERY_EDITOR_KEYS.forEach(key => {
    const value = (editorDeliveryLinks[key] || '').trim();
    if (value) links[key] = value;
  });
  return links;
}

function setEditorDeliveryLinks(links = {}) {
  const normalized = normalizeDeliveryLinks({ deliveryLinks: links });
  editorDeliveryLinks = {
    'google-drive': normalized['google-drive'] || '',
    mega: normalized.mega || '',
    telegram: normalized.telegram || '',
  };
}

function clearEditorDeliveryLink(key) {
  if (!DELIVERY_EDITOR_KEYS.includes(key)) return;
  editorDeliveryLinks[key] = '';
}

function renderEditorDeliveryLinksFields() {
  if (!editorDeliveryLinksFields) return;
  syncEditorDeliveryLinksFromInputs();
  const deliveries = getEditorDeliveries();
  if (!deliveries.length) {
    editorDeliveryLinksFields.innerHTML = '<p class="editor-detail-pop-hint">Add a delivery method with the + button first.</p>';
    return;
  }
  editorDeliveryLinksFields.innerHTML = deliveries.map(key => {
    const placeholder = DELIVERY_LINK_PLACEHOLDERS[key] || 'https://';
    const ariaLabel = DELIVERY_LABELS[key] || 'Delivery';
    const value = escapeHtml(editorDeliveryLinks[key] || '');
    const src = DELIVERY_ICONS[key];
    return `
      <div class="editor-detail-delivery-link-row">
        <img class="delivery-icon" src="${src}" alt="" aria-hidden="true">
        <input type="url" class="editor-detail-delivery-link-input" data-delivery-link="${key}" value="${value}" placeholder="${placeholder}" inputmode="url" aria-label="${ariaLabel} link">
      </div>`;
  }).join('');
}

function closeEditorDetailDeliveryAddPop() {
  document.getElementById('editorDetailDeliveryAddPop')?.setAttribute('hidden', '');
  const add = document.getElementById('editorDetailDeliveryAdd');
  add?.classList.remove('is-open');
  add?.setAttribute('aria-expanded', 'false');
}

function toggleEditorDetailDeliveryAddPop() {
  const pop = document.getElementById('editorDetailDeliveryAddPop');
  const add = document.getElementById('editorDetailDeliveryAdd');
  if (!pop || !add) return;
  if (pop.hasAttribute('hidden')) {
    pop.removeAttribute('hidden');
    add.classList.add('is-open');
    add.setAttribute('aria-expanded', 'true');
  } else {
    closeEditorDetailDeliveryAddPop();
  }
}

function getUnusedEditorDeliveries(deliveries = getEditorDeliveries()) {
  const active = new Set(normalizeDeliveries(deliveries));
  return DELIVERY_EDITOR_KEYS.filter(key => !active.has(key));
}

function enableEditorDelivery(key) {
  if (!DELIVERY_ICONS[key]) return;
  getEditorDeliveryChip(key)?.classList.add('is-on');
  closeEditorDetailDeliveryAddPop();
  renderEditorDeliveryLinksFields();
  updateEditorPreview();
}

function disableEditorDelivery(key) {
  getEditorDeliveryChip(key)?.classList.remove('is-on');
  clearEditorDeliveryLink(key);
  closeEditorDetailDeliveryAddPop();
  renderEditorDeliveryLinksFields();
  updateEditorPreview();
}

function renderEditorDetailDelivery(draft) {
  const detailsOn = draft.detailsOn !== false;
  if (!detailsOn) return '—';

  const deliveryList = normalizeDeliveries(draft.delivery);
  const unused = getUnusedEditorDeliveries(deliveryList);
  const showAdd = unused.length > 0;

  const tags = deliveryList.map(key => {
    const src = DELIVERY_ICONS[key];
    const label = DELIVERY_LABELS[key];
    if (!src || !label) return '';
    return `<button type="button" class="delivery-detail editor-detail-inline-chip editor-detail-inline-chip--removable" data-delivery-key="${key}" title="Remove ${label}">
      <img class="delivery-icon" src="${src}" alt="" loading="lazy">${label}
    </button>`;
  }).join('');

  if (!tags && !showAdd) return '—';

  const unusedItems = unused.map(key => {
    const src = DELIVERY_ICONS[key];
    const label = DELIVERY_LABELS[key];
    return `<button type="button" class="editor-detail-inline-pick" data-delivery-key="${key}" aria-label="Add ${label}" title="Add ${label}">
      <img class="delivery-icon" src="${src}" alt="">
    </button>`;
  }).join('');

  return `
    <div class="editor-detail-inline-panel editor-detail-delivery-panel" id="editorDetailDeliveryPanel">
      <div class="editor-detail-inline-cluster">
        ${showAdd ? `<span class="editor-detail-inline-add-group">
          <button type="button" class="editor-cover-badges-add editor-detail-inline-add" id="editorDetailDeliveryAdd" aria-label="Add delivery" aria-expanded="false"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>
          <span class="editor-detail-inline-pop" id="editorDetailDeliveryAddPop" hidden>${unusedItems}</span>
        </span>` : ''}
        ${tags ? `<span class="editor-detail-inline-chips editor-detail-inline-chips--delivery">${tags}</span>` : ''}
      </div>
    </div>
  `;
}

function getEditorSystemChip(systemKey) {
  return editorOsPicker?.querySelector(`[data-system="${systemKey}"]`)
    || editorAppPicker?.querySelector(`[data-system="${systemKey}"]`)
    || editorSystemChips?.querySelector(`[data-system="${systemKey}"]`);
}

function getEditorSystems() {
  const pickers = [editorOsPicker, editorAppPicker, editorSystemChips].filter(Boolean);
  if (!pickers.length) return [];
  const keys = new Set();
  pickers.forEach(picker => {
    picker.querySelectorAll('.editor-icon-chip.is-on').forEach(btn => {
      if (btn.dataset.system) keys.add(btn.dataset.system);
    });
  });
  return [...keys];
}

function getEditorAppSystems() {
  return getEditorSystems().filter(key => APP_SYSTEM_KEYS.has(key));
}

function getEditorSoftwareLabel() {
  const apps = getEditorAppSystems();
  if (!apps.length) return 'Any';
  return apps.map(key => SYSTEM_LABELS[key] || key).join(', ');
}

function setEditorSystems(systems) {
  const set = new Set(systems || []);
  [editorOsPicker, editorAppPicker, editorSystemChips].forEach(picker => {
    picker?.querySelectorAll('.editor-icon-chip').forEach(btn => {
      btn.classList.toggle('is-on', set.has(btn.dataset.system));
    });
  });
}

function syncEditorVersionFields(source = editorVersion) {
  const value = normalizeVersionInput(source?.value ?? editorDetailVersion?.value ?? '');
  if (editorVersion && editorVersion.value !== value) editorVersion.value = value;
  if (editorDetailVersion && editorDetailVersion.value !== value) editorDetailVersion.value = value;
}

function closeEditorDetailOsPop() {
  document.getElementById('editorDetailOsPop')?.setAttribute('hidden', '');
  const add = document.getElementById('editorDetailOsAdd');
  add?.classList.remove('is-open');
  add?.setAttribute('aria-expanded', 'false');
}

function closeEditorDetailSoftwarePop() {
  document.getElementById('editorDetailSoftwarePop')?.setAttribute('hidden', '');
  const add = document.getElementById('editorDetailSoftwareAdd');
  add?.classList.remove('is-open');
  add?.setAttribute('aria-expanded', 'false');
}

function closeEditorDetailInlinePops(except = '') {
  if (except !== 'os') closeEditorDetailOsPop();
  if (except !== 'software') closeEditorDetailSoftwarePop();
  if (except !== 'delivery-add') closeEditorDetailDeliveryAddPop();
}

function toggleEditorDetailOsPop() {
  const pop = document.getElementById('editorDetailOsPop');
  const add = document.getElementById('editorDetailOsAdd');
  if (!pop || !add) return;
  if (pop.hasAttribute('hidden')) {
    pop.removeAttribute('hidden');
    add.classList.add('is-open');
    add.setAttribute('aria-expanded', 'true');
  } else {
    closeEditorDetailOsPop();
  }
}

function getEditorOsSystems(systems = getEditorSystems()) {
  return (systems || []).filter(key => OS_SYSTEM_KEYS.has(key));
}

function getUnusedEditorOs(systems = getEditorSystems()) {
  const active = new Set(getEditorOsSystems(systems));
  return OS_EDITOR_KEYS.filter(key => !active.has(key));
}

function enableEditorOs(key) {
  if (!OS_SYSTEM_KEYS.has(key)) return;
  getEditorSystemChip(key)?.classList.add('is-on');
  closeEditorDetailOsPop();
  updateEditorPreview();
}

function disableEditorOs(key) {
  getEditorSystemChip(key)?.classList.remove('is-on');
  closeEditorDetailOsPop();
  updateEditorPreview();
}

function toggleEditorDetailSoftwarePop() {
  const pop = document.getElementById('editorDetailSoftwarePop');
  const add = document.getElementById('editorDetailSoftwareAdd');
  if (!pop || !add) return;
  if (pop.hasAttribute('hidden')) {
    pop.removeAttribute('hidden');
    add.classList.add('is-open');
    add.setAttribute('aria-expanded', 'true');
  } else {
    closeEditorDetailSoftwarePop();
  }
}

function getUnusedEditorApps(systems = getEditorSystems()) {
  const active = new Set(getEditorAppSystems(systems));
  return APP_EDITOR_KEYS.filter(key => !active.has(key));
}

function enableEditorApp(key) {
  if (!APP_SYSTEM_KEYS.has(key)) return;
  getEditorSystemChip(key)?.classList.add('is-on');
  closeEditorDetailSoftwarePop();
  updateEditorPreview();
}

function disableEditorApp(key) {
  getEditorSystemChip(key)?.classList.remove('is-on');
  closeEditorDetailSoftwarePop();
  updateEditorPreview();
}

function renderEditorDetailSoftware(draft) {
  const detailsOn = draft.detailsOn !== false;
  if (!detailsOn) return '—';

  const appList = getEditorAppSystems(draft.systems);
  const unused = getUnusedEditorApps(draft.systems);
  const showAdd = unused.length > 0;

  const tags = appList.map(key => {
    const src = SYSTEM_ICONS[key];
    const label = SYSTEM_LABELS[key];
    if (!src || !label) return '';
    return `<button type="button" class="delivery-detail editor-detail-inline-chip editor-detail-inline-chip--removable" data-app-key="${key}" title="Remove ${label}">
      <img class="delivery-icon system-detail-icon" src="${src}" alt="" loading="lazy">${label}
    </button>`;
  }).join('');

  if (!tags && !showAdd) return '—';

  const unusedItems = unused.map(key => {
    const src = SYSTEM_ICONS[key];
    const label = SYSTEM_LABELS[key];
    return `<button type="button" class="editor-detail-inline-pick" data-app-key="${key}" aria-label="Add ${label}" title="Add ${label}">
      <img class="delivery-icon system-detail-icon" src="${src}" alt="">
    </button>`;
  }).join('');

  return `
    <div class="editor-detail-inline-panel editor-detail-software-panel" id="editorDetailSoftwarePanel">
      <div class="editor-detail-inline-cluster">
        ${showAdd ? `<span class="editor-detail-inline-add-group">
          <button type="button" class="editor-cover-badges-add editor-detail-inline-add" id="editorDetailSoftwareAdd" aria-label="Add software" aria-expanded="false"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>
          <span class="editor-detail-inline-pop" id="editorDetailSoftwarePop" hidden>${unusedItems}</span>
        </span>` : ''}
        ${tags ? `<span class="editor-detail-inline-chips${appList.length >= 4 ? ' editor-detail-inline-chips--quad' : ''}">${tags}</span>` : ''}
      </div>
    </div>
  `;
}

function renderEditorDetailOS(draft) {
  const detailsOn = draft.detailsOn !== false;
  if (!detailsOn) return '—';

  const osList = getEditorOsSystems(draft.systems);
  const unused = getUnusedEditorOs(draft.systems);
  const showAdd = unused.length > 0;

  const tags = osList.map(key => {
    const src = SYSTEM_ICONS[key];
    const label = SYSTEM_LABELS[key];
    if (!src || !label) return '';
    return `<button type="button" class="delivery-detail editor-detail-inline-chip editor-detail-inline-chip--removable" data-os-key="${key}" title="Remove ${label}">
      <img class="delivery-icon system-detail-icon" src="${src}" alt="" loading="lazy">${label}
    </button>`;
  }).join('');

  if (!tags && !showAdd) return '—';

  const unusedItems = unused.map(key => {
    const src = SYSTEM_ICONS[key];
    const label = SYSTEM_LABELS[key];
    return `<button type="button" class="editor-detail-inline-pick" data-os-key="${key}" aria-label="Add ${label}" title="Add ${label}">
      <img class="delivery-icon system-detail-icon" src="${src}" alt="">
    </button>`;
  }).join('');

  return `
    <div class="editor-detail-inline-panel editor-detail-os-panel" id="editorDetailOsPanel">
      <div class="editor-detail-inline-cluster">
        ${showAdd ? `<span class="editor-detail-inline-add-group">
          <button type="button" class="editor-cover-badges-add editor-detail-inline-add" id="editorDetailOsAdd" aria-label="Add OS" aria-expanded="false"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>
          <span class="editor-detail-inline-pop" id="editorDetailOsPop" hidden>${unusedItems}</span>
        </span>` : ''}
        ${tags ? `<span class="editor-detail-inline-chips">${tags}</span>` : ''}
      </div>
    </div>
  `;
}

function normalizeTagInput(val) {
  return (val || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function getCatalogTagSuggestions() {
  const tags = new Set();
  PRODUCTS.forEach(p => (p.tags || []).forEach(t => tags.add(normalizeTagInput(t))));
  (EDITOR_TEMPLATE.tags || []).forEach(t => tags.add(normalizeTagInput(t)));
  return [...tags].filter(Boolean).sort();
}

function getEditorTags() {
  return splitList(editorTags?.value || '');
}

function syncEditorTagsHidden(tags) {
  if (editorTags) editorTags.value = tags.join(', ');
}

function renderEditorTagsSuggestions(currentTags = getEditorTags()) {
  const el = document.getElementById('editorTagsSuggestions');
  if (!el) return;
  const current = new Set(currentTags);
  const suggestions = getCatalogTagSuggestions().filter(tag => !current.has(tag));
  el.innerHTML = `
    <p class="editor-detail-tags-suggestions-label">Suggestions</p>
    <div class="editor-detail-tags-suggestion-list">
      ${suggestions.map(tag => (
        `<button type="button" class="editor-detail-tag-suggestion" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`
      )).join('')}
    </div>
  `;
}

function setEditorTags(tags) {
  const normalized = [...new Set((tags || []).map(normalizeTagInput).filter(Boolean))];
  syncEditorTagsHidden(normalized);
  renderEditorTagsSuggestions(normalized);
}

function addEditorTag(raw) {
  const tag = normalizeTagInput(raw);
  if (!tag) return false;
  const tags = getEditorTags();
  if (tags.includes(tag)) return false;
  setEditorTags([...tags, tag]);
  return true;
}

function removeEditorTag(tag) {
  const key = normalizeTagInput(tag);
  setEditorTags(getEditorTags().filter(t => t !== key));
}

function commitEditorTagsInput() {
  if (!editorTagsInput) return false;
  const added = addEditorTag(editorTagsInput.value);
  if (added) editorTagsInput.value = '';
  return added;
}

function syncEditorDetailsPopOpenState() {
  const detailsPanel = document.getElementById('editorDetailsPanel');
  const detailsCard = document.getElementById('editorDetailsLiveCard');
  const tagsOpen = !document.getElementById('editorDetailTagsPop')?.hasAttribute('hidden');
  detailsCard?.classList.toggle('is-tags-pop-open', tagsOpen);
  detailsPanel?.classList.toggle('is-tags-pop-open', tagsOpen);
}

function scrollEditorDetailPopIntoView(popEl, extraBottom = 36) {
  if (!popEl || popEl.hasAttribute('hidden')) return;
  const content = document.querySelector('.content');
  if (!content) {
    popEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const popRect = popEl.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      const bottomLimit = contentRect.bottom - 20;
      const bottomOverflow = popRect.bottom + extraBottom - bottomLimit;
      if (bottomOverflow > 0) {
        content.scrollBy({ top: bottomOverflow, behavior: 'smooth' });
        return;
      }
      const topOverflow = contentRect.top + 16 - popRect.top;
      if (topOverflow > 0) {
        content.scrollBy({ top: -topOverflow, behavior: 'smooth' });
      }
    });
  });
}

function closeEditorDetailPops(exceptKey = '') {
  const exceptKeys = Array.isArray(exceptKey) ? exceptKey : exceptKey ? [exceptKey] : [];
  const inlineExcept = exceptKeys.find(k => ['os', 'software', 'delivery-add'].includes(k)) || '';
  closeEditorDetailInlinePops(inlineExcept);
  Object.entries(editorDetailPopIds).forEach(([key, id]) => {
    if (exceptKeys.includes(key)) return;
    document.getElementById(id)?.setAttribute('hidden', '');
  });
  syncEditorDetailsPopOpenState();
}

function toggleEditorDetailPop(key) {
  const popId = editorDetailPopIds[key];
  const pop = popId ? document.getElementById(popId) : null;
  if (!pop) return;
  const willOpen = pop.hasAttribute('hidden');
  if (key === 'delivery' || key === 'filesize' || key === 'tags') {
    closeEditorDetailInlinePops();
    Object.entries(editorDetailPopIds).forEach(([popKey, id]) => {
      if (popKey === key) return;
      document.getElementById(id)?.setAttribute('hidden', '');
    });
  } else {
    closeEditorDetailPops(willOpen ? key : '');
  }
  if (willOpen) {
    pop.removeAttribute('hidden');
    if (key === 'tags') {
      renderEditorTagsSuggestions(getEditorTags());
      scrollEditorDetailPopIntoView(pop);
      editorTagsInput?.focus();
    }
    if (key === 'filesize') editorFileSizeAmount?.focus();
    if (key === 'delivery') renderEditorDeliveryLinksFields();
  } else {
    pop.setAttribute('hidden', '');
  }
  syncEditorDetailsPopOpenState();
}

function updateEditorDetailsPreview(draft) {
  const detailsOn = draft.detailsOn !== false;
  const deliveryOn = draft.deliveryOn !== false;
  const systemsOn = draft.systemsOn !== false;

  if (editorDetailFormat) {
    editorDetailFormat.innerHTML = detailsOn
      ? (renderFormatBadge(draft.format) || '—')
      : '—';
  }

  if (editorDetailOS) {
    const popWasOpen = !document.getElementById('editorDetailOsPop')?.hasAttribute('hidden');
    editorDetailOS.innerHTML = detailsOn
      ? renderEditorDetailOS(draft)
      : '—';
    if (popWasOpen) {
      document.getElementById('editorDetailOsPop')?.removeAttribute('hidden');
      const add = document.getElementById('editorDetailOsAdd');
      add?.classList.add('is-open');
      add?.setAttribute('aria-expanded', 'true');
    }
  }

  if (editorDetailSoftware) {
    const popWasOpen = !document.getElementById('editorDetailSoftwarePop')?.hasAttribute('hidden');
    editorDetailSoftware.innerHTML = detailsOn
      ? renderEditorDetailSoftware(draft)
      : '—';
    if (popWasOpen) {
      document.getElementById('editorDetailSoftwarePop')?.removeAttribute('hidden');
      const add = document.getElementById('editorDetailSoftwareAdd');
      add?.classList.add('is-open');
      add?.setAttribute('aria-expanded', 'true');
    }
  }

  if (editorDetailDelivery) {
    const addPopWasOpen = !document.getElementById('editorDetailDeliveryAddPop')?.hasAttribute('hidden');
    editorDetailDelivery.innerHTML = detailsOn
      ? renderEditorDetailDelivery(draft)
      : '—';
    if (addPopWasOpen) {
      document.getElementById('editorDetailDeliveryAddPop')?.removeAttribute('hidden');
      const add = document.getElementById('editorDetailDeliveryAdd');
      add?.classList.add('is-open');
      add?.setAttribute('aria-expanded', 'true');
    }
    if (!document.getElementById('editorDetailDeliveryPop')?.hasAttribute('hidden')) {
      renderEditorDeliveryLinksFields();
    }
  }

  if (editorDetailFileSize) {
    editorDetailFileSize.textContent = detailsOn && draft.fileSize
      ? draft.fileSize
      : '—';
  }

  if (editorDetailTags) {
    editorDetailTags.innerHTML = detailsOn && draft.tags?.length
      ? draft.tags.map(tag => (
        `<span class="tag editor-detail-tag-preview editor-detail-tag-preview--removable" role="button" tabindex="0" data-tag="${escapeHtml(tag)}" title="Remove ${escapeHtml(tag)}">${escapeHtml(tag)}</span>`
      )).join('')
      : '';
  }
}

function parseFileSize(value) {
  const raw = (value || '').trim();
  if (!raw) return { amount: '', unit: 'GB' };
  const match = raw.match(/^([\d.]+)\s*(KB|MB|GB|TB)$/i);
  if (match) return { amount: match[1], unit: match[2].toUpperCase() };
  return { amount: raw, unit: 'GB' };
}

function getEditorFileSizeUnit() {
  const on = editorFileSizeUnits?.querySelector('.editor-size-chip.is-on');
  return on?.dataset.unit || 'GB';
}

function formatEditorFileSize(amount, unit) {
  const n = (amount || '').trim();
  const u = (unit || 'GB').toUpperCase();
  if (!n) return '';
  return `${n} ${u}`;
}

function syncEditorFileSizeHidden() {
  if (editorFileSize) editorFileSize.value = getEditorFileSize();
}

function getEditorFileSize() {
  return formatEditorFileSize(editorFileSizeAmount?.value, getEditorFileSizeUnit());
}

function setEditorFileSizeUnit(unit) {
  const key = (unit || 'GB').toUpperCase();
  editorFileSizeUnits?.querySelectorAll('.editor-size-chip').forEach(btn => {
    btn.classList.toggle('is-on', btn.dataset.unit === key);
  });
}

function setEditorFileSize(size) {
  const { amount, unit } = parseFileSize(size);
  if (editorFileSizeAmount) editorFileSizeAmount.value = amount;
  setEditorFileSizeUnit(unit);
  syncEditorFileSizeHidden();
  if (editorDetailFileSize) {
    const display = getEditorFileSize();
    editorDetailFileSize.textContent = display || '—';
  }
}

function setEditorCoverImage(dataUrl) {
  editorCoverDataUrl = dataUrl || null;
  if (editorCoverImg) {
    if (editorCoverDataUrl) {
      editorCoverImg.src = editorCoverDataUrl;
      editorCoverImg.hidden = false;
    } else {
      editorCoverImg.removeAttribute('src');
      editorCoverImg.hidden = true;
    }
  }
  if (editorCoverEmpty) editorCoverEmpty.hidden = !!editorCoverDataUrl;
  if (editorCoverClear) editorCoverClear.hidden = !editorCoverDataUrl;
  if (editorPreviewHero) editorPreviewHero.classList.toggle('has-cover', !!editorCoverDataUrl);
  if (editorPreviewHero) editorPreviewHero.classList.toggle('has-cover-image', !!editorCoverDataUrl);
  if (editorThumbPicker) editorThumbPicker.classList.toggle('is-disabled', !!editorCoverDataUrl);
  if (editorCoverDataUrl && editorThumb) {
    editorThumb.value = '';
    editorThumbRow?.querySelectorAll('.editor-thumb-btn').forEach(btn => btn.classList.remove('is-active'));
  }
}

function importCoverFile(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('Please use an image or GIF');
    return;
  }
  if (file.size > 4 * 1024 * 1024) {
    showToast('Cover file is too large (max 4MB)');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    setEditorCoverImage(reader.result);
    updateEditorPreview();
    showToast('Cover imported');
  };
  reader.readAsDataURL(file);
}

function setEditorType(type) {
  if (editorType) editorType.value = type;
  const isBundle = type === 'bundle';
  editorTypePicker?.querySelectorAll('.editor-tier-chip').forEach(btn => {
    btn.classList.toggle('is-on', isBundle && btn.dataset.type === 'bundle');
    if (btn.dataset.type === 'bundle') btn.setAttribute('aria-pressed', String(isBundle));
  });
  if (editorDiscountOn) {
    editorDiscountOn.disabled = !isBundle;
    if (!isBundle) editorDiscountOn.checked = false;
  }
  if (editorDiscountPercent) editorDiscountPercent.disabled = !isBundle;
  updateEditorFeatureStates();
}

function setEditorPlan(plan) {
  const prev = editorPlanRequired?.value;
  if (prev && prev !== plan) editorPreviousPlan = prev;
  if (editorPlanRequired) editorPlanRequired.value = plan;
  editorPlanPicker?.querySelectorAll('.editor-tier-chip').forEach(btn => {
    btn.classList.toggle('is-on', btn.dataset.plan === plan);
  });
}

function getEditorDiscountPercent() {
  return Math.min(99, Math.max(1, Number(editorDiscountPercent?.value) || 45));
}

function isEditorAboutOn() {
  return editorAboutOn?.checked !== false;
}

function placeCaretAtEnd(node) {
  if (!node) return;
  const range = document.createRange();
  if (node.childNodes.length) {
    range.selectNodeContents(node);
    range.collapse(false);
  } else {
    range.setStart(node, 0);
    range.collapse(true);
  }
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}

function getEditorInsideHeading() {
  const text = (editorAboutInsideTitle?.innerText || '').replace(/\u00a0/g, ' ').trim();
  return text || "What's inside?";
}

function getFocusedAboutEditable() {
  const active = document.activeElement;
  if (active?.classList?.contains('about-media-item-name')) return active;
  if (active === editorAboutInsideTitle || active === editorAboutInsideBody || active === editorAboutIntro) {
    return active;
  }
  return null;
}

function isAboutBodyEditable() {
  if (!editorAboutInsideBody || editorAboutInsideBody.hidden) return false;
  if (editorAboutInsideBody.classList.contains('is-collapsed-body')) return false;
  if (editorAboutInsideBody.classList.contains('is-folder-mode')) {
    return !!editorAboutInsideFolder?.querySelector('.about-folder.is-open');
  }
  return true;
}

function ensureAboutInsideBodyReady() {
  if (!editorAboutInsideWrap || editorAboutInsideWrap.hidden) return false;
  const folder = editorAboutInsideFolder?.querySelector('.about-folder');
  if (folder && editorAboutInsideBody?.classList.contains('is-folder-mode') && !folder.classList.contains('is-open')) {
    folder.querySelector('.about-folder-trigger')?.click();
  }
  if (editorAboutInsideBody) editorAboutInsideBody.hidden = false;
  return isAboutBodyEditable();
}

function saveAboutSelection() {
  const sel = window.getSelection();
  if (!sel?.rangeCount) return;
  const range = sel.getRangeAt(0);
  const node = range.commonAncestorContainer;
  const editable = (node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement)?.closest(
    '.editor-about-zone, .about-media-item-name'
  );
  if (!editable) return;
  savedAboutSelection = { range: range.cloneRange(), editable };
}

function restoreAboutSelection() {
  if (!savedAboutSelection) return false;
  const { range, editable } = savedAboutSelection;
  if (!document.contains(editable)) {
    savedAboutSelection = null;
    return false;
  }
  editable.focus();
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
  return true;
}

function getActiveAboutEditor() {
  const focused = getFocusedAboutEditable();
  if (focused) return focused;
  if (aboutLastFocusedEditable && document.contains(aboutLastFocusedEditable)) {
    return aboutLastFocusedEditable;
  }
  if (editorAboutInsideWrap && !editorAboutInsideWrap.hidden) {
    if (isAboutBodyEditable()) return editorAboutInsideBody;
    return editorAboutInsideTitle || editorAboutIntro;
  }
  return editorAboutIntro;
}

function resolveAboutInsertTarget() {
  const focused = getFocusedAboutEditable();
  if (focused === editorAboutIntro) return editorAboutIntro;
  if (editorAboutInsideWrap && !editorAboutInsideWrap.hidden) {
    ensureAboutInsideBodyReady();
    if (editorAboutInsideBody && isAboutBodyEditable()) return editorAboutInsideBody;
    return editorAboutInsideTitle || editorAboutIntro;
  }
  return editorAboutIntro;
}

function isMediaNameFocused() {
  const focused = getFocusedAboutEditable();
  if (focused?.classList?.contains('about-media-item-name')) return true;
  const anchor = savedAboutSelection?.editable;
  return !!anchor?.classList?.contains('about-media-item-name');
}

function buildPlainAboutSnapshot() {
  const parts = [];
  const intro = (editorAboutIntro?.innerText || '').replace(/\u00a0/g, ' ').replace(/\r/g, '').trimEnd();
  if (intro) parts.push(intro);
  if (editorAboutInsideWrap && !editorAboutInsideWrap.hidden) {
    parts.push(getEditorInsideHeading());
    const body = (editorAboutInsideBody?.innerText || '').replace(/\u00a0/g, ' ').replace(/\r/g, '').trimEnd();
    if (body) parts.push(body);
  }
  return parts.join('\n').trimEnd();
}

function updateEditorAboutFolderPreview() {
  if (!editorAboutInsideFolder || !editorAboutInsideBody || !editorAboutInsideWrap) return;

  const items = parseAboutMediaItemsFromHtml(serializeEditorAboutInsideHtml());
  const insideOn = !editorAboutInsideWrap.hidden;
  const hasMedia = items.length > 0;

  if (!insideOn) {
    editorAboutInsideFolder.hidden = true;
    editorAboutInsideBody.classList.remove('is-folder-mode', 'is-collapsed-body');
    editorAboutInsideBody.hidden = false;
    if (editorAboutInsideBody.parentElement !== editorAboutInsideWrap) {
      editorAboutInsideWrap.appendChild(editorAboutInsideBody);
    }
    return;
  }

  editorAboutInsideFolder.hidden = false;

  if (!hasMedia) {
    editorAboutInsideBody.classList.remove('is-folder-mode');
    editorAboutInsideBody.classList.add('is-collapsed-body');
    editorAboutInsideBody.hidden = true;
    if (editorAboutInsideBody.parentElement !== editorAboutInsideWrap) {
      editorAboutInsideWrap.appendChild(editorAboutInsideBody);
    }

    const existingFolder = editorAboutInsideFolder.querySelector('.about-folder');
    const wasOpen = !!existingFolder?.classList.contains('is-open');
    if (!existingFolder || Number(existingFolder.dataset.itemCount) !== 0 || existingFolder.dataset.editorFolder !== '1') {
      editorAboutInsideFolder.innerHTML = renderAboutFolderShell(0, { editorMode: true });
      initAboutFolders(editorAboutInsideFolder);
      if (wasOpen) editorAboutInsideFolder.querySelector('.about-folder-trigger')?.click();
    }
    return;
  }

  editorAboutInsideBody.hidden = false;
  editorAboutInsideBody.classList.remove('is-collapsed-body');
  editorAboutInsideBody.classList.add('is-folder-mode');

  const existingFolder = editorAboutInsideFolder.querySelector('.about-folder');
  const wasOpen = !!existingFolder?.classList.contains('is-open');
  const bodyAlreadyMounted = editorAboutInsideBody.parentElement?.classList.contains('about-folder-contents');

  if (existingFolder && bodyAlreadyMounted && Number(existingFolder.dataset.itemCount) === items.length) {
    existingFolder.dataset.itemCount = String(items.length);
    enhanceEditorAboutMediaItems(editorAboutInsideBody);
    return;
  }

  if (editorAboutInsideBody.parentElement === editorAboutInsideFolder
    || editorAboutInsideBody.parentElement?.closest('#editorAboutInsideFolder')) {
    editorAboutInsideWrap.appendChild(editorAboutInsideBody);
  }

  editorAboutInsideFolder.innerHTML = renderAboutFolderShell(items.length);
  const folder = editorAboutInsideFolder.querySelector('.about-folder');
  const contents = folder?.querySelector('.about-folder-contents');
  if (contents) contents.appendChild(editorAboutInsideBody);
  enhanceEditorAboutMediaItems(editorAboutInsideBody);
  initAboutFolders(editorAboutInsideFolder);

  if (wasOpen || items.length === 1) {
    folder?.querySelector('.about-folder-trigger')?.click();
  }
}

function syncEditorAboutHiddenField() {
  const introText = (editorAboutIntro?.innerText || '').replace(/\u00a0/g, ' ').replace(/\r/g, '').trimEnd();
  if (!aboutZoneHasVisibleContent(editorAboutIntro) && editorAboutIntro) editorAboutIntro.innerHTML = '';
  editorAboutIntro?.classList.toggle('is-empty', !aboutZoneHasVisibleContent(editorAboutIntro));
  if (editorAboutIntroHtml) {
    editorAboutIntroHtml.value = aboutZoneHasVisibleContent(editorAboutIntro)
      ? (editorAboutIntro?.innerHTML || '')
      : '';
  }
  const bodyText = (editorAboutInsideBody?.innerText || '').replace(/\u00a0/g, ' ').replace(/\r/g, '').trimEnd();
  editorAboutInsideBody?.classList.toggle('is-empty', !aboutZoneHasVisibleContent(editorAboutInsideBody));
  if (editorAboutInsideHtml) {
    editorAboutInsideHtml.value = editorAboutInsideWrap && !editorAboutInsideWrap.hidden
      ? serializeEditorAboutInsideHtml()
      : '';
  }
  if (editorAbout) editorAbout.value = buildPlainAboutSnapshot();
  updateAboutToolbarVisibility();
  updateAboutInsideEmptyState();
  updateEditorAboutFolderPreview();
}

function setEditorAboutField(text, insideHtml = '', insideHeading = '', introHtml = '') {
  let { intro, hasInside, body, heading } = parseAboutPlainText(text || '');
  if (!hasInside && insideHtml?.trim()) hasInside = true;
  const resolvedHeading = insideHeading || heading || (hasInside ? "What's inside?" : '');
  if (editorAbout) editorAbout.value = text || '';
  if (editorAboutIntro && !editorAboutIntroFocused) {
    editorAboutIntro.innerHTML = introHtml?.trim()
      ? sanitizeAboutRichHtml(introHtml)
      : introTextToHtml(intro);
    editorAboutIntro.classList.toggle('is-empty', !aboutZoneHasVisibleContent(editorAboutIntro));
  }
  if (editorAboutInsideWrap) editorAboutInsideWrap.hidden = !hasInside;
  if (editorAboutIntro && !editorAboutIntroFocused) {
    editorAboutIntro.hidden = hasInside;
  }
  if (editorAboutInsideTitle && !editorAboutInsideTitleFocused) {
    editorAboutInsideTitle.textContent = resolvedHeading;
  }
  if (editorAboutInsideBody && !editorAboutInsideFocused) {
    editorAboutInsideBody.innerHTML = insideHtml?.trim()
      ? sanitizeAboutRichHtml(insideHtml)
      : aboutBodyLinesToHtml(body);
    enhanceEditorAboutMediaItems(editorAboutInsideBody);
  }
  if (editorAboutInsideHtml) {
    editorAboutInsideHtml.value = hasInside ? (insideHtml || editorAboutInsideBody?.innerHTML || '') : '';
  }
  if (editorAboutIntroHtml) {
    editorAboutIntroHtml.value = introHtml || editorAboutIntro?.innerHTML || '';
  }
  updateAboutToolbarVisibility();
  updateAboutInsideEmptyState();
  updateEditorAboutFolderPreview();
}

function updateAboutToolbarVisibility() {
  const aboutOn = isEditorAboutOn();
  const insideOn = editorAboutInsideWrap && !editorAboutInsideWrap.hidden;
  if (editorAboutToolbarEffects) editorAboutToolbarEffects.hidden = !aboutOn;
  if (editorAboutIntro) editorAboutIntro.hidden = !!insideOn;
  const headingBtn = document.querySelector('[data-about-format="heading"]');
  if (headingBtn) {
    headingBtn.classList.toggle('is-active', !!insideOn);
    headingBtn.title = insideOn
      ? "Remove the What's inside list from your page"
      : "Add a What's inside list section";
    headingBtn.setAttribute('aria-label', insideOn ? "Remove What's inside section" : "Add What's inside section");
    const nameEl = headingBtn.querySelector('.editor-about-tool-name');
    if (nameEl) nameEl.textContent = insideOn ? 'Remove list' : "What's inside?";
  }
  if (editorAboutSwitchLabel) {
    editorAboutSwitchLabel.textContent = aboutOn ? 'Visible' : 'Hidden';
  }
  if (editorAboutHelp) {
    if (!aboutOn) {
      editorAboutHelp.textContent = 'Flip the switch to Visible to show this section on your product page.';
    } else if (insideOn) {
      editorAboutHelp.textContent = 'Hover the folder to play the animation. Drag images onto it, or use Image to add products.';
    } else {
      editorAboutHelp.textContent = 'Click below and type your description, or tap What\'s inside? to add a contents list.';
    }
  }
  updateAboutInsideEmptyState();
}

function removeEditorAboutInsideSection() {
  if (editorAboutInsideWrap) editorAboutInsideWrap.hidden = true;
  if (editorAboutIntro) editorAboutIntro.hidden = false;
  if (editorAboutInsideBody) {
    editorAboutInsideBody.innerHTML = '';
    editorAboutInsideBody.classList.add('is-empty');
  }
  if (editorAboutInsideTitle) editorAboutInsideTitle.textContent = "What's inside?";
  if (editorAboutInsideHtml) editorAboutInsideHtml.value = '';
  updateAboutToolbarVisibility();
  syncEditorAboutHiddenField();
}

function renderEditorAboutBundleBlock(bundleItems = []) {
  if (!editorAboutBundleBlock) return;
  const items = bundleItems.filter(item => (item?.name || '').trim());
  if (!items.length) {
    editorAboutBundleBlock.innerHTML = '';
    editorAboutBundleBlock.hidden = true;
    return;
  }
  editorAboutBundleBlock.hidden = false;
  editorAboutBundleBlock.innerHTML = renderBundleFolderAbout(items);
  initAboutFolders(editorAboutBundleBlock);
}

function updateEditorAboutPanel(draft) {
  if (!editorAboutLive) return;
  setEditorAboutField(draft.about || '', draft.aboutInsideHtml || '', draft.aboutInsideHeading || '', draft.aboutIntroHtml || '');
  if (editorAboutBundleBlock) {
    editorAboutBundleBlock.innerHTML = '';
    editorAboutBundleBlock.hidden = true;
  }
}

function insertEditorAboutHtml(html) {
  const el = resolveAboutInsertTarget();
  if (!el) return;
  restoreAboutSelection();
  el.focus();
  const forceAppend = isMediaNameFocused();
  if (!aboutZoneHasVisibleContent(el)) {
    el.innerHTML = html;
    placeCaretAtEnd(el.querySelector('.about-text, .about-bullet-line, p') || el);
  } else {
    const node = insertAboutBlockHtml(el, html, { forceAppend });
    const caretTarget = node?.querySelector?.('.about-text') || node;
    if (caretTarget?.tagName) placeCaretAtEnd(caretTarget);
    else placeCaretAfter(node || el.lastChild);
  }
  syncEditorAboutHiddenField();
}

function insertEditorAboutBullet() {
  const el = resolveAboutInsertTarget();
  if (!el) return;
  restoreAboutSelection();
  el.focus();
  const forceAppend = isMediaNameFocused();
  if (!aboutZoneHasVisibleContent(el)) {
    el.innerHTML = '<p class="about-bullet-line">• </p>';
    placeCaretAtEnd(el.querySelector('.about-bullet-line') || el);
  } else {
    const bullet = insertAboutBlockHtml(el, '<p class="about-bullet-line">• </p>', { forceAppend });
    const line = bullet?.classList?.contains('about-bullet-line')
      ? bullet
      : el.querySelector('.about-bullet-line:last-of-type');
    placeCaretAtEnd(line || el);
  }
  syncEditorAboutHiddenField();
}

function openEditorAboutInsideSection({ clearBody = false } = {}) {
  if (editorAboutInsideWrap) editorAboutInsideWrap.hidden = false;
  if (editorAboutIntro) editorAboutIntro.hidden = true;
  if (editorAboutInsideTitle && !editorAboutInsideTitle.textContent.trim()) {
    editorAboutInsideTitle.textContent = "What's inside?";
  }
  updateAboutToolbarVisibility();
  if (clearBody && editorAboutInsideBody) {
    editorAboutInsideBody.innerHTML = '';
    editorAboutInsideBody.classList.add('is-empty');
  }
  updateAboutInsideEmptyState();
  updateEditorAboutFolderPreview();
}

function insertAboutMediaItems(entries, { openFolder = false } = {}) {
  const valid = (entries || []).filter(entry => entry?.src);
  if (!valid.length) return;
  openEditorAboutInsideSection({ clearBody: false });
  const el = editorAboutInsideBody;
  if (!el) return;
  let lastItem = null;
  valid.forEach(({ src, name }) => {
    const html = buildAboutMediaItemHtml(src, name || 'Product name', 0);
    lastItem = insertAboutBlockHtml(el, html) || lastItem;
  });
  enhanceEditorAboutMediaItems(el);
  const nameEl = lastItem?.querySelector('.about-media-item-name')
    || el.querySelector('.about-media-item:last-of-type .about-media-item-name');
  if (nameEl) {
    nameEl.focus();
    const range = document.createRange();
    range.selectNodeContents(nameEl);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  } else if (lastItem) {
    placeCaretAfter(lastItem);
  }
  syncEditorAboutHiddenField();
  if (openFolder) {
    const folder = editorAboutInsideFolder?.querySelector('.about-folder');
    if (folder && !folder.classList.contains('is-open')) {
      folder.querySelector('.about-folder-trigger')?.click();
    }
  }
}

function insertAboutMediaItem(src, name = '') {
  insertAboutMediaItems([{ src, name }], { openFolder: true });
}

function insertEditorAboutHeading() {
  if (editorAboutInsideWrap?.hidden === false) {
    removeEditorAboutInsideSection();
    editorAboutIntro?.focus();
    return;
  }
  openEditorAboutInsideSection({ clearBody: true });
  syncEditorAboutHiddenField();
}

function insertEditorAboutDivider() {
  const el = resolveAboutInsertTarget();
  if (!el) return;
  restoreAboutSelection();
  el.focus();
  const divider = insertAboutBlockHtml(
    el,
    '<div class="about-divider" contenteditable="false" aria-hidden="true"></div>',
    { forceAppend: isMediaNameFocused() }
  );
  placeCaretAfter(divider || el.lastChild);
  syncEditorAboutHiddenField();
}

function applyEditorAboutFormat(action) {
  if (action === 'bullet') insertEditorAboutBullet();
  else if (action === 'newline') insertEditorAboutHtml('<p class="about-text"><br></p>');
  else if (action === 'divider') insertEditorAboutDivider();
  else if (action === 'heading') insertEditorAboutHeading();
}

function applyAboutTextEffect(effect) {
  const el = getActiveAboutEditor();
  if (!el) return;
  restoreAboutSelection();
  el.focus();
  if (effect === 'bold') document.execCommand('bold');
  else if (effect === 'italic') document.execCommand('italic');
  else if (effect === 'underline') document.execCommand('underline');
  aboutLastFocusedEditable = el;
  syncEditorAboutHiddenField();
}

function placeCaretAfter(node) {
  if (!node) return;
  const range = document.createRange();
  range.setStartAfter(node);
  range.collapse(true);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}

function insertAboutFxIcon() {
  const el = getActiveAboutEditor();
  if (!el) return;
  restoreAboutSelection();
  el.focus();
  if (el.classList?.contains('about-media-item-name')) {
    document.execCommand('insertHTML', false, ABOUT_FX_ICON_HTML);
  } else if (!aboutZoneHasVisibleContent(el)) {
    el.innerHTML = ABOUT_FX_ICON_HTML;
  } else {
    const node = insertAboutBlockHtml(el, ABOUT_FX_ICON_HTML, { forceAppend: isMediaNameFocused() });
    if (!node) document.execCommand('insertHTML', false, ABOUT_FX_ICON_HTML);
  }
  const icon = el.querySelector('.about-fx-inline:last-of-type');
  placeCaretAfter(icon || el.lastChild);
  aboutLastFocusedEditable = el;
  syncEditorAboutHiddenField();
}

const ABOUT_FX_SVG = '<svg class="about-fx-svg" width="18" height="14" viewBox="0 0 18 14" aria-hidden="true" focusable="false"><text x="1" y="12" font-family="Georgia, \'Times New Roman\', serif" font-size="13" font-style="italic" fill="currentColor">f</text><text x="10" y="7" font-family="system-ui, sans-serif" font-size="8" fill="currentColor">x</text></svg>';
const ABOUT_FX_ICON_HTML = `<span class="about-fx-inline" contenteditable="false" aria-label="FX">${ABOUT_FX_SVG}</span>`;

function insertAboutSymbol(symbol) {
  const el = getActiveAboutEditor();
  if (!el || !symbol) return;
  restoreAboutSelection();
  el.focus();
  if (symbol === 'FX') {
    insertAboutFxIcon();
    return;
  }
  document.execCommand('insertText', false, symbol);
  aboutLastFocusedEditable = el;
  syncEditorAboutHiddenField();
}

function updateEditorFeatureStates() {
  const statsOn = editorStatsOn?.checked !== false;
  const aboutOn = isEditorAboutOn();

  editorDetailsPanel?.classList.remove('is-off');
  editorStatsPills?.classList.toggle('is-off', !statsOn);
  editorAboutLive?.classList.toggle('is-off', !aboutOn);
}

function buildDraftFromEditor() {
  syncEditorAboutHiddenField();
  const price = Math.max(0, Number(editorPrice.value) || 0);
  const type = editorType.value;
  const discountOn = type === 'bundle' && editorDiscountOn?.checked;
  const discountPct = getEditorDiscountPercent();
  const detailsOn = editorDetailsOn?.checked !== false;
  const aboutOn = isEditorAboutOn();
  const statsOn = editorStatsOn?.checked !== false;
  const systemKeys = detailsOn ? getEditorSystems() : [];
  const deliveryKeys = detailsOn ? getEditorDeliveries() : [];
  const deliveryLinks = detailsOn ? getEditorDeliveryLinksFromState() : {};
  const downloadUrl = deliveryLinks['google-drive'] || '';
  const systemsOn = systemKeys.length > 0;
  const deliveryOn = deliveryKeys.length > 0 || Object.keys(deliveryLinks).length > 0;
  let oldPrice = null;
  let discountLabel;
  if (discountOn && price > 0) {
    oldPrice = Number((price / (1 - discountPct / 100)).toFixed(2));
    discountLabel = `${discountPct}% OFF`;
  }
  const badges = [];
  if (discountOn && oldPrice) badges.push('off');
  if (type === 'free') badges.push('free');
  if (type === 'bundle') badges.push('bundle');

  return {
    title: editorTitle.value.trim() || 'Untitled item',
    author: detailsOn ? (editorAuthor.value.trim() || 'Studio Name') : '',
    authorIcon: detailsOn ? (editorAuthorIconDataUrl || undefined) : undefined,
    website: detailsOn ? (editorWebsite?.value.trim() || '') : '',
    price,
    oldPrice: oldPrice || undefined,
    type,
    planRequired: editorPlanRequired.value,
    thumb: editorCoverDataUrl ? '' : (editorThumb.value || ''),
    coverImage: editorCoverDataUrl || undefined,
    badges,
    discount: discountLabel,
    version: stripVersionPrefix(getEditorVersionRaw()),
    format: detailsOn ? getEditorFormat() : '',
    fileSize: detailsOn ? getEditorFileSize() : '',
    software: detailsOn ? getEditorSoftwareLabel() : '',
    systems: systemKeys,
    delivery: deliveryKeys,
    deliveryLinks: Object.keys(deliveryLinks).length ? deliveryLinks : undefined,
    downloadUrl: downloadUrl || undefined,
    tags: detailsOn ? getEditorTags() : [],
    about: aboutOn ? (editorAbout.value.trim() || '') : '',
    aboutInsideHtml: aboutOn && editorAboutInsideHtml?.value?.trim() ? editorAboutInsideHtml.value : undefined,
    aboutInsideHeading: aboutOn && editorAboutInsideWrap && !editorAboutInsideWrap.hidden
      ? getEditorInsideHeading()
      : undefined,
    aboutIntroHtml: aboutOn && editorAboutIntroHtml?.value?.trim() ? editorAboutIntroHtml.value : undefined,
    aboutOn,
    downloads: statsOn ? (editorDownloads?.value.trim() || '0+') : '',
    favs: statsOn ? Math.max(0, Number(editorFavs?.value) || 0) : 0,
    detailsOn,
    deliveryOn,
    systemsOn,
  };
}

function updateEditorPreview() {
  const draft = buildDraftFromEditor();
  if (editorPreviewHero) {
    editorPreviewHero.className = 'product-hero editor-hero editor-cover-dropzone';
    THUMB_CLASSES.forEach(cls => editorPreviewHero.classList.remove(cls));
    if (draft.coverImage) {
      editorPreviewHero.classList.add('has-cover', 'has-cover-image');
      editorPreviewHero.style.backgroundImage = '';
    } else {
      editorPreviewHero.style.backgroundImage = '';
      if (draft.thumb) editorPreviewHero.classList.add(draft.thumb);
    }
  }
  if (editorPreviewBadges) {
    const editingPct = editorPreviewBadges.querySelector('.editor-cover-badge-pct');
    if (!(editingPct && document.activeElement === editingPct)) {
      editorPreviewBadges.innerHTML = renderEditorCoverBadges(draft);
      initBundleLottie(editorPreviewBadges);
      closeEditorCoverBadgePop();
    }
  }
  if (editorPreviewIcons) {
    editorPreviewIcons.innerHTML = renderEditorCoverIcons(draft.systems, draft.delivery);
    closeEditorCoverIconPop();
  }
  if (editorOldPriceWrap && editorOldPricePreview) {
    const discountActive = draft.badges.includes('off');
    const showOld = discountActive && draft.oldPrice && draft.price > 0;
    editorOldPriceWrap.hidden = !showOld;
    if (showOld) editorOldPricePreview.textContent = `$${draft.oldPrice.toFixed(2)}`;
    else editorOldPricePreview.textContent = '';
  }
  if (editorPostAuthorRow) {
    editorPostAuthorRow.hidden = draft.detailsOn === false;
  }
  if (editorPostAuthorIconSlot || editorDetailAuthorIconSlot) {
    const authorIconHtml = draft.author && draft.detailsOn !== false
      ? renderAuthorIcon(draft, 'card-author-icon')
      : '';
    if (editorPostAuthorIconSlot) editorPostAuthorIconSlot.innerHTML = authorIconHtml;
    if (editorDetailAuthorIconSlot) editorDetailAuthorIconSlot.innerHTML = authorIconHtml;
  }
  updateEditorDetailsPreview(draft);
  updateEditorFeatureStates();
  updateEditorAboutPanel(draft);
  if (editorCoverEmpty) {
    const needsCover = !draft.coverImage && !draft.thumb;
    editorCoverEmpty.hidden = !!draft.coverImage;
    const strong = editorCoverEmpty.querySelector('strong');
    const hint = editorCoverEmpty.querySelector('.editor-cover-hint');
    if (strong) strong.textContent = needsCover ? 'Import a cover GIF or image' : 'Cover style selected';
    if (hint) hint.textContent = needsCover ? 'Drag & drop here, or tap to browse' : 'Tap to replace with your own file';
  }
  if (editorCoverClear) editorCoverClear.hidden = !draft.coverImage;
}

function loadEditorTemplate() {
  const t = EDITOR_TEMPLATE;
  editorTitle.value = t.title;
  editorAuthor.value = t.author;
  if (editorWebsite) editorWebsite.value = t.website || '';
  setEditorDeliveryLinks(normalizeDeliveryLinks(t));
  editorPrice.value = t.price;
  setEditorType(t.type);
  setEditorPlan(t.planRequired);
  editorThumb.value = t.thumb;
  if (editorDiscountOn) editorDiscountOn.checked = !!t.discountOn;
  if (editorDiscountPercent) editorDiscountPercent.value = t.discountPercent ?? 45;
  editorVersion.value = stripVersionPrefix(t.version);
  syncEditorVersionFields(editorVersion);
  editorFormat.value = t.format;
  setEditorFormat(t.format);
  if (editorFileSize) setEditorFileSize(t.fileSize || '4 GB');
  setEditorDeliveries(t.delivery);
  setEditorTags(t.tags);
  setEditorAboutField(t.about || '', t.aboutInsideHtml || '', t.aboutInsideHeading || '', t.aboutIntroHtml || '');
  if (editorDownloads) editorDownloads.value = t.downloads;
  if (editorFavs) editorFavs.value = t.favs ?? 0;
  if (editorStatsOn) editorStatsOn.checked = t.statsOn !== false;
  if (editorDetailsOn) editorDetailsOn.checked = t.detailsOn !== false;
  if (editorAboutOn) editorAboutOn.checked = t.aboutOn !== false;
  if (editorBundleFolderOn) editorBundleFolderOn.checked = t.bundleFolderOn !== false;
  setEditorAuthorIcon(t.authorIcon || null);
  setEditorBundleItems(t.bundleItems || []);
  if (editorCoverFile) editorCoverFile.value = '';
  setEditorCoverImage(t.coverImage);
  setEditorSystems(t.systems);
  if (editorThumbRow) {
    editorThumbRow.querySelectorAll('.editor-thumb-btn').forEach(btn => {
      btn.classList.toggle('is-active', !!t.thumb && btn.dataset.thumb === t.thumb);
    });
  }
  updateEditorPreview();
  initBundleLottie(editorTypePicker);
}

function loadProductIntoEditor(product) {
  if (!product) return;
  editorTitle.value = product.title;
  editorAuthor.value = product.author || '';
  if (editorWebsite) editorWebsite.value = product.website || '';
  setEditorDeliveryLinks(normalizeDeliveryLinks(product));
  editorPrice.value = product.price;
  setEditorType(product.type);
  setEditorPlan(product.planRequired);
  editorThumb.value = product.thumb || '';
  if (editorDiscountOn) editorDiscountOn.checked = !!(product.oldPrice && product.badges?.includes('off'));
  if (editorDiscountPercent && product.discount) {
    const pct = parseInt(product.discount, 10);
    if (!Number.isNaN(pct)) editorDiscountPercent.value = pct;
  }
  editorVersion.value = stripVersionPrefix(product.version || '1.0');
  syncEditorVersionFields(editorVersion);
  setEditorFormat(product.format || '.zip');
  setEditorFileSize(product.fileSize || (product.type === 'bundle' ? '4 GB' : ''));
  setEditorDeliveries(product.delivery);
  setEditorTags(product.tags || []);
  let insideHtml = getResolvedAboutInsideHtml(product);
  let insideHeading = product.aboutInsideHeading || '';
  if (shouldApplyCharleyPangusAboutPreset(product)) {
    insideHtml = getCharleyPangusMasterBundleAboutHtml();
    insideHeading = insideHeading || "What's inside?";
  }
  setEditorAboutField(product.about || '', insideHtml, insideHeading, product.aboutIntroHtml || '');
  if (editorDownloads) editorDownloads.value = product.downloads || '0+';
  if (editorFavs) editorFavs.value = product.favs ?? 0;
  if (editorStatsOn) editorStatsOn.checked = product.downloads !== undefined && product.downloads !== '';
  if (editorDetailsOn) {
    editorDetailsOn.checked = !!(product.author || product.website || product.format || product.tags?.length
      || (product.systems || []).length || product.software);
  }
  if (editorAboutOn) editorAboutOn.checked = product.aboutOn !== false;
  if (editorBundleFolderOn) editorBundleFolderOn.checked = !!product.bundleItems?.length;
  setEditorAuthorIcon(product.authorIcon || null);
  setEditorBundleItems(product.bundleItems || []);
  if (editorCoverFile) editorCoverFile.value = '';
  setEditorCoverImage(product.coverImage || null);
  setEditorSystems(product.systems || []);
  if (editorThumbRow) {
    editorThumbRow.querySelectorAll('.editor-thumb-btn').forEach(btn => {
      btn.classList.toggle('is-active', !!product.thumb && btn.dataset.thumb === product.thumb);
    });
  }
  updateEditorFeatureStates();
  updateEditorPreview();
  initBundleLottie(editorTypePicker);
}

function isAdminEditorOpen() {
  return currentView === 'admin-editor';
}

function openAdminEditor(product = null) {
  if (!canAccessVaultAdmin()) {
    if (isVaultOwnerIdentity()) {
      promptVaultAdminUnlock({ enterAdmin: true });
      return;
    }
    showToast('Vault Admin is only available to the vault owner');
    return;
  }
  editingProductId = product?.id ?? null;
  const titleEl = document.getElementById('adminEditorTitle');
  const subtitleEl = document.getElementById('adminEditorSubtitle');
  if (product) {
    loadProductIntoEditor(product);
    if (titleEl) titleEl.textContent = 'Edit post';
    if (subtitleEl) subtitleEl.textContent = 'Update listing details and publish';
    if (editorDeleteBtn) editorDeleteBtn.hidden = false;
  } else {
    loadEditorTemplate();
    if (titleEl) titleEl.textContent = 'New post';
    if (subtitleEl) subtitleEl.textContent = 'Build your listing and publish to the catalog';
    if (editorDeleteBtn) editorDeleteBtn.hidden = true;
  }
  showView('admin-editor');
  initBundleLottie(document.getElementById('view-admin-editor'));
  requestAnimationFrame(() => initBundleLottie(editorTypePicker));
}

function editCatalogProduct(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product || !isCustomProduct(product)) return;
  openAdminEditor(product);
}

function catalogProducts() {
  return PRODUCTS.filter(p => !library.has(p.id));
}

function getNextProductId() {
  return PRODUCTS.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0) + 1;
}

function saveCatalogProducts() {
  try {
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(PRODUCTS));
  } catch {}
}

function loadCatalogProducts() {
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) PRODUCTS = parsed;
  } catch {}
}

function syncCatalogUI() {
  renderBundles();
  filterProducts();
  renderFavourites();
  renderPurchases();
  if (currentProduct) {
    const fresh = PRODUCTS.find(p => p.id === currentProduct.id);
    if (fresh) openProduct(fresh);
  }
}

/* ── Navigation ── */
function showView(name) {
  if (!guardVaultAdminAccess(name)) return;
  document.body.classList.toggle('hide-nav', name === 'product' || name === 'plans');
  document.body.classList.toggle('product-view', name === 'product');
  document.body.classList.toggle('plans-view', name === 'plans');
  views.forEach(v => v.classList.toggle('active', v.dataset.view === name));
  navItems.forEach(n => {
    const nav = n.dataset.nav;
    n.classList.toggle('active', nav === name || (nav === 'profile' && (name === 'admin' || name === 'admin-editor')));
  });
  if (name !== 'product' && name !== 'plans') {
    currentView = name;
    if (name !== 'admin-editor') previousView = name;
  }
  if (name === 'purchases') purchasesSeenCount = library.size;
  if (name === 'favourites') favoritesSeenCount = favorites.size;
  if (name === 'admin') renderAdminPanel();
  document.getElementById('adminFabBar')?.toggleAttribute('hidden', name !== 'admin');
  updateNavBadges();
  content.scrollTop = 0;
}

navItems.forEach(item => item.addEventListener('click', () => showView(item.dataset.nav)));
document.getElementById('productBackBtn').addEventListener('click', () => showView(previousView));
document.getElementById('plansBackBtn').addEventListener('click', () => showView('profile'));
document.getElementById('openPlansBtn').addEventListener('click', () => showView('plans'));
document.getElementById('subAccessBtn').addEventListener('click', () => showView('plans'));

function closeAdminEditor() {
  editingProductId = null;
  if (editorDeleteBtn) editorDeleteBtn.hidden = true;
  showView('admin');
}

function splitList(val) {
  return val.split(',').map(v => v.trim().toLowerCase()).filter(Boolean);
}

function buildProductFromForm() {
  const title = editorTitle.value.trim();
  if (!title) return null;
  const draft = buildDraftFromEditor();
  const detailsOn = editorDetailsOn?.checked !== false;
  const aboutOn = isEditorAboutOn();
  const statsOn = editorStatsOn?.checked !== false;
  const existing = editingProductId ? PRODUCTS.find(p => p.id === editingProductId) : null;
  return {
    id: existing?.id ?? getNextProductId(),
    ...draft,
    title,
    thumb: draft.coverImage ? '' : (draft.thumb || 'thumb-1'),
    favs: statsOn ? Math.max(0, Number(editorFavs?.value) || 0) : (existing?.favs ?? 0),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    tags: detailsOn ? (draft.tags.length ? draft.tags : ['custom']) : [],
    systems: detailsOn ? draft.systems : [],
    delivery: detailsOn ? draft.delivery : [],
    deliveryLinks: detailsOn && draft.deliveryLinks ? draft.deliveryLinks : undefined,
    downloadUrl: detailsOn && draft.downloadUrl ? draft.downloadUrl : undefined,
    author: detailsOn ? (draft.author || 'Studio Name') : '',
    authorIcon: detailsOn ? draft.authorIcon : undefined,
    about: aboutOn ? draft.about : '',
    aboutInsideHtml: aboutOn ? draft.aboutInsideHtml : undefined,
    aboutInsideHeading: aboutOn ? draft.aboutInsideHeading : undefined,
    aboutIntroHtml: aboutOn ? draft.aboutIntroHtml : undefined,
    aboutOn,
    downloads: statsOn ? (draft.downloads || '0+') : '',
    custom: true,
  };
}

function saveEditorProduct() {
  const product = buildProductFromForm();
  if (!product) return null;
  if (editingProductId) {
    const idx = PRODUCTS.findIndex(p => p.id === editingProductId);
    if (idx !== -1) PRODUCTS[idx] = product;
  } else {
    PRODUCTS.unshift(product);
  }
  saveCatalogProducts();
  syncCatalogUI();
  renderAdminPanel();
  return product;
}

adminEditorBack?.addEventListener('click', closeAdminEditor);

catalogEditorForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!editorCoverDataUrl && !editorThumb.value) {
    showToast('Import a cover GIF/image or pick a gradient style');
    editorThumbPicker?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  const product = saveEditorProduct();
  if (!product) {
    showToast('Title is required');
    return;
  }
  closeAdminEditor();
  showCatalogSaveCelebration(product);
});

editorResetBtn.addEventListener('click', () => {
  showCatalogResetConfirm();
});

[
  editorTitle, editorAuthor, editorWebsite, editorPrice, editorVersion, editorDetailVersion, editorFormat, editorFileSizeAmount,
  editorDownloads, editorFavs, editorDiscountPercent,
].forEach(el => {
  if (!el) return;
  el.addEventListener('input', updateEditorPreview);
});

editorDeliveryLinksFields?.addEventListener('input', e => {
  const input = e.target.closest('[data-delivery-link]');
  if (!input) return;
  editorDeliveryLinks[input.dataset.deliveryLink] = input.value;
  updateEditorPreview();
});

editorDiscountOn?.addEventListener('change', updateEditorPreview);

editorTypePicker?.querySelectorAll('.editor-tier-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    const isBundle = editorType?.value === 'bundle';
    setEditorType(isBundle ? 'premium' : 'bundle');
    updateEditorPreview();
  });
});

editorPlanPicker?.querySelectorAll('.editor-tier-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    setEditorPlan(btn.dataset.plan);
    updateEditorPreview();
  });
});

editorCoverFile?.addEventListener('change', e => {
  const file = e.target.files?.[0];
  importCoverFile(file);
  e.target.value = '';
});

editorCoverClear?.addEventListener('click', e => {
  e.stopPropagation();
  if (editorCoverFile) editorCoverFile.value = '';
  setEditorCoverImage(null);
  updateEditorPreview();
});

editorCoverEmpty?.addEventListener('click', () => {
  if (editorCoverDataUrl) return;
  editorCoverFile?.click();
});

editorPreviewHero?.addEventListener('dragover', e => {
  e.preventDefault();
  editorPreviewHero.classList.add('is-dragover');
});
editorPreviewHero?.addEventListener('dragleave', e => {
  if (!editorPreviewHero.contains(e.relatedTarget)) {
    editorPreviewHero.classList.remove('is-dragover');
  }
});
editorPreviewHero?.addEventListener('drop', e => {
  e.preventDefault();
  editorPreviewHero.classList.remove('is-dragover');
  importCoverFile(e.dataTransfer?.files?.[0]);
});

editorThumbRow?.querySelectorAll('.editor-thumb-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (editorCoverDataUrl) return;
    editorThumb.value = btn.dataset.thumb || '';
    editorThumbRow.querySelectorAll('.editor-thumb-btn').forEach(b => {
      b.classList.toggle('is-active', b === btn);
    });
    updateEditorPreview();
  });
});

editorSystemChips?.querySelectorAll('.editor-icon-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('is-on');
    updateEditorPreview();
  });
});

[editorOsPicker, editorAppPicker].forEach(picker => {
  picker?.querySelectorAll('.editor-icon-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('is-on');
      updateEditorPreview();
    });
  });
});

editorDeliveryPicker?.querySelectorAll('.editor-icon-chip').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
  });
});

editorPreviewIcons?.addEventListener('click', e => {
  const addBtn = e.target.closest('#editorCoverIconAdd');
  const pickBtn = e.target.closest('.editor-cover-icon-pick');
  const activeBtn = e.target.closest('.editor-cover-icon-active');
  if (addBtn) {
    e.stopPropagation();
    closeEditorCoverBadgePop();
    toggleEditorCoverIconPop();
    return;
  }
  if (pickBtn) {
    e.stopPropagation();
    enableEditorCoverIcon(pickBtn.dataset.iconType, pickBtn.dataset.iconKey);
    return;
  }
  if (activeBtn) {
    e.stopPropagation();
    disableEditorCoverIcon(activeBtn.dataset.iconType, activeBtn.dataset.iconKey);
  }
});

editorPreviewBadges?.addEventListener('click', e => {
  if (e.target.closest('.editor-cover-badge-pct')) return;
  const addBtn = e.target.closest('#editorCoverBadgeAdd');
  const pickBtn = e.target.closest('.editor-cover-badge-pick');
  const removable = e.target.closest('.editor-cover-badge--removable');
  if (addBtn) {
    e.stopPropagation();
    closeEditorCoverIconPop();
    toggleEditorCoverBadgePop();
    return;
  }
  if (pickBtn) {
    e.stopPropagation();
    enableEditorCoverBadge(pickBtn.dataset.badgeKey);
    return;
  }
  if (removable) {
    e.stopPropagation();
    disableEditorCoverBadge(removable.dataset.badge);
  }
});

editorPreviewBadges?.addEventListener('keydown', e => {
  const pct = e.target.closest('.editor-cover-badge-pct');
  if (!pct) return;
  if (e.key === 'Enter') {
    e.preventDefault();
    pct.blur();
  }
});

editorPreviewBadges?.addEventListener('blur', e => {
  const pct = e.target.closest('.editor-cover-badge-pct');
  if (!pct) return;
  applyEditorCoverDiscountPct(pct.textContent);
}, true);

document.addEventListener('click', e => {
  if (e.target.closest('#editorCoverIconsPanel')) return;
  closeEditorCoverIconPop();
  if (e.target.closest('#editorCoverBadgesPanel')) return;
  closeEditorCoverBadgePop();
  if (e.target.closest('#editorDetailOsPanel') || e.target.closest('#editorDetailSoftwarePanel')) return;
  if (e.target.closest('#editorDetailDeliveryAdd') || e.target.closest('#editorDetailDeliveryAddPop')) return;
  if (e.target.closest('#editorDetailDeliveryPop')) return;
  if (e.target.closest('#editorDetailFileSizePop')) return;
  if (e.target.closest('#editorDetailTagsPop')) return;
  closeEditorDetailInlinePops();
  if (e.target.closest('.editor-detail-pop') || e.target.closest('.editor-detail-editable')) return;
  closeEditorDetailPops();
});

document.getElementById('editorDetailsLiveCard')?.addEventListener('click', e => {
  const osAdd = e.target.closest('#editorDetailOsAdd');
  const osPick = e.target.closest('.editor-detail-inline-pick[data-os-key]');
  const osRemove = e.target.closest('.editor-detail-inline-chip--removable[data-os-key]');
  const appAdd = e.target.closest('#editorDetailSoftwareAdd');
  const appPick = e.target.closest('.editor-detail-inline-pick[data-app-key]');
  const appRemove = e.target.closest('.editor-detail-inline-chip--removable[data-app-key]');
  const deliveryAdd = e.target.closest('#editorDetailDeliveryAdd');
  const deliveryPick = e.target.closest('.editor-detail-inline-pick[data-delivery-key]');
  const deliveryRemove = e.target.closest('.editor-detail-inline-chip--removable[data-delivery-key]');
  const tagRemove = e.target.closest('.editor-detail-tag-preview--removable[data-tag]');
  const tagSuggest = e.target.closest('.editor-detail-tag-suggestion[data-tag]');
  if (osAdd) {
    e.stopPropagation();
    closeEditorDetailPops('os');
    toggleEditorDetailOsPop();
    return;
  }
  if (osPick) {
    e.stopPropagation();
    enableEditorOs(osPick.dataset.osKey);
    return;
  }
  if (osRemove) {
    e.stopPropagation();
    disableEditorOs(osRemove.dataset.osKey);
    return;
  }
  if (appAdd) {
    e.stopPropagation();
    closeEditorDetailPops('software');
    toggleEditorDetailSoftwarePop();
    return;
  }
  if (appPick) {
    e.stopPropagation();
    enableEditorApp(appPick.dataset.appKey);
    return;
  }
  if (appRemove) {
    e.stopPropagation();
    disableEditorApp(appRemove.dataset.appKey);
    return;
  }
  if (deliveryAdd) {
    e.stopPropagation();
    closeEditorDetailPops(['delivery', 'delivery-add']);
    toggleEditorDetailDeliveryAddPop();
    return;
  }
  if (deliveryPick) {
    e.stopPropagation();
    enableEditorDelivery(deliveryPick.dataset.deliveryKey);
    return;
  }
  if (deliveryRemove) {
    e.stopPropagation();
    disableEditorDelivery(deliveryRemove.dataset.deliveryKey);
    return;
  }
  if (tagRemove) {
    e.stopPropagation();
    removeEditorTag(tagRemove.dataset.tag);
    updateEditorPreview();
    return;
  }
  if (tagSuggest) {
    e.stopPropagation();
    addEditorTag(tagSuggest.dataset.tag);
    updateEditorPreview();
    editorTagsInput?.focus();
    return;
  }
  if (e.target.closest('#editorDetailOsPanel') || e.target.closest('#editorDetailSoftwarePanel')) return;

  const deliveryRow = e.target.closest('.editor-detail-delivery-row');
  if (deliveryRow && !e.target.closest('button, a, label')) {
    e.stopPropagation();
    toggleEditorDetailPop('delivery');
    return;
  }

  const filesizeRow = e.target.closest('.editor-detail-filesize-row');
  if (filesizeRow && !e.target.closest('button, a, label, input')) {
    e.stopPropagation();
    toggleEditorDetailPop('filesize');
    return;
  }

  const tagsRow = e.target.closest('.editor-detail-tags-row');
  if (tagsRow && !e.target.closest('button, a, label, input, .editor-detail-tag-preview--removable')) {
    e.stopPropagation();
    toggleEditorDetailPop('tags');
    return;
  }

  const row = e.target.closest('.editor-detail-editable');
  if (!row || row.classList.contains('editor-detail-delivery-row') || row.classList.contains('editor-detail-filesize-row') || row.classList.contains('editor-detail-tags-row')) return;
  if (e.target.closest('input, textarea, select, button, a, label')) return;
  toggleEditorDetailPop(row.dataset.detailPop);
});

document.getElementById('editorDetailsLiveCard')?.addEventListener('keydown', e => {
  const row = e.target.closest('.editor-detail-editable');
  if (!row || (e.key !== 'Enter' && e.key !== ' ')) return;
  e.preventDefault();
  toggleEditorDetailPop(row.dataset.detailPop);
});

editorTagsInput?.addEventListener('keydown', e => {
  e.stopPropagation();
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    if (commitEditorTagsInput()) updateEditorPreview();
    return;
  }
  if (e.key === 'Backspace' && !editorTagsInput.value) {
    const tags = getEditorTags();
    if (tags.length) {
      e.preventDefault();
      removeEditorTag(tags[tags.length - 1]);
      updateEditorPreview();
    }
  }
});

editorTagsInput?.addEventListener('blur', () => {
  if (commitEditorTagsInput()) updateEditorPreview();
});

editorTagsInput?.addEventListener('paste', e => {
  const text = e.clipboardData?.getData('text') || '';
  if (!text.includes(',')) return;
  e.preventDefault();
  const parts = text.split(',').map(normalizeTagInput).filter(Boolean);
  if (!parts.length) return;
  const merged = [...new Set([...getEditorTags(), ...parts])];
  setEditorTags(merged);
  editorTagsInput.value = '';
  updateEditorPreview();
});

document.getElementById('editorTagsSuggestions')?.addEventListener('mousedown', e => {
  if (e.target.closest('.editor-detail-tag-suggestion')) e.preventDefault();
});

editorDetailVersion?.addEventListener('input', () => syncEditorVersionFields(editorDetailVersion));
editorVersion?.addEventListener('input', () => syncEditorVersionFields(editorVersion));

editorFileSizeUnits?.querySelectorAll('.editor-size-chip').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    setEditorFileSizeUnit(btn.dataset.unit);
    syncEditorFileSizeHidden();
    updateEditorPreview();
  });
});

editorFileSizeAmount?.addEventListener('input', () => {
  syncEditorFileSizeHidden();
  updateEditorPreview();
});

editorFormatPicker?.querySelectorAll('.editor-icon-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    setEditorFormat(btn.dataset.format);
    updateEditorPreview();
  });
});

[editorStatsOn, editorDetailsOn, editorAboutOn].forEach(el => {
  if (!el) return;
  el.addEventListener('change', updateEditorPreview);
});

document.getElementById('editorAboutToolbar')?.addEventListener('mousedown', e => {
  if (e.target.closest('[data-about-format], [data-about-effect], [data-about-symbol]')) {
    saveAboutSelection();
    e.preventDefault();
  }
});

document.getElementById('editorAboutToolbar')?.addEventListener('click', e => {
  const formatBtn = e.target.closest('[data-about-format]');
  if (formatBtn && !formatBtn.hidden) {
    e.preventDefault();
    applyEditorAboutFormat(formatBtn.dataset.aboutFormat);
    return;
  }
  const symbolBtn = e.target.closest('[data-about-symbol]');
  if (symbolBtn) {
    e.preventDefault();
    insertAboutSymbol(symbolBtn.dataset.aboutSymbol);
    return;
  }
  const effectBtn = e.target.closest('[data-about-effect]');
  if (effectBtn) {
    e.preventDefault();
    applyAboutTextEffect(effectBtn.dataset.aboutEffect);
  }
});

function bindAboutZone(el, focusKey) {
  if (!el) return;
  el.addEventListener('focus', () => {
    aboutLastFocusedEditable = el;
    if (focusKey === 'intro') editorAboutIntroFocused = true;
    if (focusKey === 'insideTitle') editorAboutInsideTitleFocused = true;
    if (focusKey === 'inside') editorAboutInsideFocused = true;
  });
  el.addEventListener('blur', () => {
    if (focusKey === 'intro') editorAboutIntroFocused = false;
    if (focusKey === 'insideTitle') editorAboutInsideTitleFocused = false;
    if (focusKey === 'inside') editorAboutInsideFocused = false;
    syncEditorAboutHiddenField();
  });
  el.addEventListener('input', () => syncEditorAboutHiddenField());
}

bindAboutZone(editorAboutIntro, 'intro');
bindAboutZone(editorAboutInsideTitle, 'insideTitle');
bindAboutZone(editorAboutInsideBody, 'inside');

editorAboutLive?.addEventListener('focusin', e => {
  const name = e.target.closest?.('.about-media-item-name');
  if (name) aboutLastFocusedEditable = name;
});

editorAboutInsideBody?.addEventListener('focusin', e => {
  const name = e.target.closest?.('.about-media-item-name');
  if (name) aboutLastFocusedEditable = name;
});

editorAboutInsideTitle?.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    editorAboutInsideBody?.focus();
    placeCaretAtEnd(editorAboutInsideBody);
  }
});

editorAboutInsideBody?.addEventListener('click', e => {
  const btn = e.target.closest('.about-media-item-img-btn');
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();
  pendingAboutMediaImg = btn.querySelector('.about-media-item-img');
  editorAboutMediaFile?.click();
});

bindAboutInsideDropzone(editorAboutInsideWrap);

document.querySelector('label[for="editorAboutMediaFile"]')?.addEventListener('click', () => {
  pendingAboutMediaImg = null;
});

editorAboutMediaFile?.addEventListener('change', e => {
  const files = getImageFilesFromFileList(e.target.files);
  e.target.value = '';
  if (!files.length) return;
  if (pendingAboutMediaImg) {
    readImageFile(files[0], dataUrl => {
      pendingAboutMediaImg.src = dataUrl;
      pendingAboutMediaImg = null;
      syncEditorAboutHiddenField();
    });
    return;
  }
  const hadItems = parseAboutMediaItemsFromHtml(serializeEditorAboutInsideHtml()).length > 0;
  readImageFilesSequential(files, entries => {
    if (!entries.length) return;
    insertAboutMediaItems(entries, { openFolder: !hadItems });
    if (entries.length > 1) showToast(`Added ${entries.length} items`);
  });
});

editorAboutEditableWrap?.addEventListener('mousedown', e => {
  if (editorAboutInsideWrap?.hidden || e.target.closest('.editor-about-zone, .about-media-item-img-btn, .about-media-item-name, .about-folder')) return;
  e.preventDefault();
  editorAboutInsideBody?.focus();
  placeCaretAtEnd(editorAboutInsideBody);
});

editorBundleAddItem?.addEventListener('click', addEditorBundleItem);

editorBundleItemsList?.addEventListener('input', e => {
  const input = e.target.closest('.editor-bundle-item-name');
  if (!input) return;
  const i = Number(input.dataset.index);
  if (Number.isNaN(i) || !editorBundleItems[i]) return;
  editorBundleItems[i].name = input.value;
  updateEditorPreview();
});

editorBundleItemsList?.addEventListener('change', e => {
  const input = e.target;
  if (input.type !== 'file' || !input.dataset.index) return;
  const i = Number(input.dataset.index);
  const file = input.files?.[0];
  input.value = '';
  if (!file || Number.isNaN(i)) return;
  assignEditorBundleItemIcon(i, file);
});

editorBundleItemsList?.addEventListener('dragover', e => {
  const zone = e.target.closest('.editor-bundle-dropzone');
  if (!zone) return;
  e.preventDefault();
  zone.classList.add('is-dragover');
});

editorBundleItemsList?.addEventListener('dragleave', e => {
  const zone = e.target.closest('.editor-bundle-dropzone');
  if (!zone || zone.contains(e.relatedTarget)) return;
  zone.classList.remove('is-dragover');
});

editorBundleItemsList?.addEventListener('drop', e => {
  const zone = e.target.closest('.editor-bundle-dropzone');
  if (!zone) return;
  e.preventDefault();
  zone.classList.remove('is-dragover');
  const file = e.dataTransfer?.files?.[0];
  if (!file || !file.type.startsWith('image/')) {
    showToast('Drop an image or GIF');
    return;
  }
  assignEditorBundleItemIcon(Number(zone.dataset.index), file);
});

editorBundleItemsList?.addEventListener('click', e => {
  const clearBtn = e.target.closest('.editor-bundle-icon-clear');
  if (clearBtn) {
    e.preventDefault();
    e.stopPropagation();
    const i = Number(clearBtn.dataset.index);
    if (!Number.isNaN(i) && editorBundleItems[i]) {
      editorBundleItems[i].icon = '';
      renderEditorBundleItemsList();
      updateEditorPreview();
    }
    return;
  }
  const btn = e.target.closest('.editor-bundle-item-remove');
  if (!btn) return;
  const i = Number(btn.dataset.index);
  if (Number.isNaN(i)) return;
  editorBundleItems.splice(i, 1);
  renderEditorBundleItemsList();
  updateEditorPreview();
});

editorAuthorIconFile?.addEventListener('change', e => {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (!file) return;
  readImageFile(file, dataUrl => {
    setEditorAuthorIcon(dataUrl);
    updateEditorPreview();
    showToast('Author icon imported');
  });
});

editorAuthorIconClear?.addEventListener('click', () => {
  if (editorAuthorIconFile) editorAuthorIconFile.value = '';
  setEditorAuthorIcon(null);
  updateEditorPreview();
});

updateEditorFeatureStates();
syncEditorVersionFields();

function renderAdminPanel() {
  const grid = adminPostGrid;
  const emptyEl = document.getElementById('adminEmpty');
  const countEl = document.getElementById('adminItemCount');
  if (!grid) return;

  const posts = PRODUCTS.filter(isCustomProduct).sort((a, b) => {
    const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return db - da;
  });

  grid.innerHTML = '';
  if (emptyEl) emptyEl.hidden = posts.length > 0;
  if (countEl) {
    countEl.textContent = posts.length === 1 ? '1 post' : `${posts.length} posts`;
  }

  posts.forEach(product => {
    grid.appendChild(renderCard(product, false, 'admin'));
  });
  initBundleLottie(grid);
}

document.getElementById('adminAddPostBtn')?.addEventListener('click', () => openAdminEditor());
document.getElementById('openVaultAdminBtn')?.addEventListener('click', () => {
  if (canAccessVaultAdmin()) {
    showView('admin');
    return;
  }
  promptVaultAdminUnlock({ enterAdmin: true });
});
document.getElementById('adminBackBtn')?.addEventListener('click', () => showView('profile'));

document.getElementById('adminPasswordSubmit')?.addEventListener('click', () => submitAdminPassword());
document.getElementById('adminPasswordClose')?.addEventListener('click', () => {
  dismissAdminPasswordPrompt();
});
document.getElementById('adminPasswordModal')?.addEventListener('click', (e) => {
  if (e.target?.id !== 'adminPasswordModal') return;
  dismissAdminPasswordPrompt();
});
document.getElementById('adminPasswordInput')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    submitAdminPassword();
  } else if (e.key === 'Escape') {
    dismissAdminPasswordPrompt();
  }
});
editorDeleteBtn?.addEventListener('click', () => {
  if (!editingProductId) return;
  requestDeleteCatalogProduct(editingProductId);
});
document.getElementById('productHeartBtn').addEventListener('click', () => {
  if (!currentProduct) return;
  toggleFavorite(currentProduct.id);
});

document.getElementById('productFavPill')?.addEventListener('click', () => {
  if (!currentProduct) return;
  toggleFavorite(currentProduct.id);
});

/* ── Payment method sheet ── */
const paymentModal = document.getElementById('paymentModal');
let pendingPlan = null;

function openPaymentModal(plan, price) {
  pendingPlan = { plan, price };
  document.getElementById('paySummaryPlan').textContent = PLAN_DISPLAY[plan]?.name || plan;
  document.getElementById('paySummaryPrice').textContent = `$${price}`;
  const paySummaryCrown = document.getElementById('paySummaryCrown');
  const crownSrc = PLAN_DISPLAY[plan]?.crown || PLAN_CROWNS[plan];
  if (paySummaryCrown && crownSrc) {
    paySummaryCrown.src = crownSrc;
    applyCrownClass(paySummaryCrown, plan, 'pay-summary-crown');
  }
  paymentModal.classList.add('open');
  paymentModal.setAttribute('aria-hidden', 'false');
}

function closePaymentModal() {
  paymentModal.classList.remove('open');
  paymentModal.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('.btn-getplan').forEach(btn => {
  btn.addEventListener('click', () => openPaymentModal(btn.dataset.plan, btn.dataset.price));
});

document.getElementById('payCloseBtn').addEventListener('click', closePaymentModal);
paymentModal.addEventListener('click', e => { if (e.target === paymentModal) closePaymentModal(); });

/* Selecting a payment method */
document.querySelectorAll('#payMethods .pay-method').forEach(m => {
  m.addEventListener('click', () => {
    document.querySelectorAll('#payMethods .pay-method').forEach(x => x.classList.remove('is-selected'));
    m.classList.add('is-selected');
  });
});

document.getElementById('createPaymentBtn').addEventListener('click', () => {
  const name = pendingPlan?.plan;
  if (name) {
    applySubscription(name);
    if (currentProduct) refreshBuyButton(currentProduct);
  }
  closePaymentModal();
  if (name) showSubscriptionCelebration(name);
});

/* ── Card template ── */
function getUnusedEditorIcons() {
  const unused = [];
  Object.keys(DELIVERY_ICONS).forEach(key => {
    const btn = editorDeliveryPicker?.querySelector(`[data-delivery="${key}"]`);
    if (!btn?.classList.contains('is-on')) {
      unused.push({ type: 'delivery', key, src: DELIVERY_ICONS[key], label: DELIVERY_LABELS[key] || key });
    }
  });
  Object.keys(SYSTEM_ICONS).forEach(key => {
    const btn = getEditorSystemChip(key);
    if (!btn?.classList.contains('is-on')) {
      unused.push({ type: 'system', key, src: SYSTEM_ICONS[key], label: SYSTEM_LABELS[key] || key });
    }
  });
  return unused;
}

function enableEditorCoverIcon(type, key) {
  if (type === 'delivery') {
    editorDeliveryPicker?.querySelector(`[data-delivery="${key}"]`)?.classList.add('is-on');
  } else if (type === 'system') {
    getEditorSystemChip(key)?.classList.add('is-on');
  }
  updateEditorFeatureStates();
  updateEditorPreview();
}

function disableEditorCoverIcon(type, key) {
  if (type === 'delivery') {
    editorDeliveryPicker?.querySelector(`[data-delivery="${key}"]`)?.classList.remove('is-on');
  } else if (type === 'system') {
    getEditorSystemChip(key)?.classList.remove('is-on');
  }
  updateEditorFeatureStates();
  updateEditorPreview();
}

function closeEditorCoverIconPop() {
  document.getElementById('editorCoverIconPop')?.setAttribute('hidden', '');
  const add = document.getElementById('editorCoverIconAdd');
  add?.classList.remove('is-open');
  add?.setAttribute('aria-expanded', 'false');
  document.getElementById('editorCoverIconsPanel')?.classList.remove('is-open');
}

function toggleEditorCoverIconPop() {
  const pop = document.getElementById('editorCoverIconPop');
  const panel = document.getElementById('editorCoverIconsPanel');
  const add = document.getElementById('editorCoverIconAdd');
  if (!pop || !add) return;
  const opening = pop.hasAttribute('hidden');
  if (opening) {
    pop.removeAttribute('hidden');
    add.classList.add('is-open');
    add.setAttribute('aria-expanded', 'true');
    panel?.classList.add('is-open');
  } else {
    closeEditorCoverIconPop();
  }
}

function renderEditorCoverIcons(systems, delivery) {
  const deliveries = normalizeDeliveries(delivery);
  const deliveryItems = deliveries.map(key => {
    const src = DELIVERY_ICONS[key];
    const label = DELIVERY_LABELS[key] || key;
    if (!src) return '';
    return `<button type="button" class="editor-cover-icon-active" data-icon-type="delivery" data-icon-key="${key}" aria-label="Remove ${label}" title="Click to remove">
      <img class="delivery-icon" src="${src}" alt="" loading="lazy">
    </button>`;
  }).join('');
  const systemItems = (systems || []).map(key => {
    const src = SYSTEM_ICONS[key];
    const label = SYSTEM_LABELS[key] || key;
    if (!src) return '';
    return `<button type="button" class="editor-cover-icon-active" data-icon-type="system" data-icon-key="${key}" aria-label="Remove ${label}" title="Click to remove">
      <img class="system-icon" src="${src}" alt="" loading="lazy">
    </button>`;
  }).join('');
  const unused = getUnusedEditorIcons();
  const showAdd = unused.length > 0;
  if (!deliveryItems && !systemItems && !showAdd) return '';

  const unusedItems = unused.map(item => `
    <button type="button" class="editor-cover-icon-pick" data-icon-type="${item.type}" data-icon-key="${item.key}" aria-label="Add ${item.label}">
      <img src="${item.src}" alt="">
    </button>
  `).join('');

  return `
    <div class="editor-cover-icons-panel" id="editorCoverIconsPanel">
      <div class="editor-cover-icons-pop" id="editorCoverIconPop" hidden>${unusedItems}</div>
      <div class="editor-cover-icons-row">
        ${deliveryItems}${systemItems}
        ${showAdd ? `<button type="button" class="editor-cover-icons-add" id="editorCoverIconAdd" aria-label="Add icon" aria-expanded="false"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>` : ''}
      </div>
    </div>
  `;
}

function renderSystemIcons(systems, delivery) {
  const deliveries = normalizeDeliveries(delivery);
  const systemItems = (systems || []).map(key => {
    const src = SYSTEM_ICONS[key];
    if (!src) return '';
    return `<img class="system-icon" src="${src}" alt="" loading="lazy">`;
  }).join('');
  const deliveryItems = deliveries.map(key => {
    const src = DELIVERY_ICONS[key];
    const label = DELIVERY_LABELS[key];
    if (!src) return '';
    return `<img class="delivery-icon" src="${src}" alt="" title="${label}" loading="lazy">`;
  }).join('');
  if (!deliveryItems && !systemItems) return '';
  return `<div class="card-systems">${deliveryItems}${systemItems}</div>`;
}

function renderDeliveryBadge(delivery) {
  const deliveries = normalizeDeliveries(delivery);
  if (!deliveries.length) return '';
  return `<span class="delivery-detail-list">${deliveries.map(key => {
    const src = DELIVERY_ICONS[key];
    const label = DELIVERY_LABELS[key];
    if (!src || !label) return '';
    return `<span class="delivery-detail"><img class="delivery-icon" src="${src}" alt="" loading="lazy">${label}</span>`;
  }).join('')}</span>`;
}

function renderSystemDetailBadge(systems, kind) {
  const keys = kind === 'os' ? OS_SYSTEM_KEYS : APP_SYSTEM_KEYS;
  const list = (systems || []).filter(key => keys.has(key));
  if (!list.length) return '';
  return `<span class="delivery-detail-list">${list.map(key => {
    const src = SYSTEM_ICONS[key];
    const label = SYSTEM_LABELS[key];
    if (!src || !label) return '';
    return `<span class="delivery-detail"><img class="delivery-icon system-detail-icon" src="${src}" alt="" loading="lazy">${label}</span>`;
  }).join('')}</span>`;
}

function formatProductWebsite(url) {
  const raw = (url || '').trim();
  if (!raw) return null;
  const href = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const label = raw.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  return { href, label };
}

const WEBSITE_LINK_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17L17 7M7 7h10v10"/></svg>';

function renderProductWebsiteLink(websiteInfo, product = null) {
  if (!websiteInfo) return '—';
  const icon = product ? renderAuthorIcon(product, 'product-website-icon', { fallback: true }) : '';
  return `<a class="product-website-link" href="${websiteInfo.href}" target="_blank" rel="noopener noreferrer">${icon}<span>${websiteInfo.label}</span>${WEBSITE_LINK_ICON}</a>`;
}

function renderFormatBadge(format) {
  const key = normalizeFormatKey(format);
  if (!key) return '';
  const src = FORMAT_ICONS[key];
  if (!src) return `<span class="tag">${key}</span>`;
  return `<span class="delivery-detail-list"><span class="delivery-detail"><img class="delivery-icon format-detail-icon" src="${src}" alt="" loading="lazy">${key}</span></span>`;
}

function renderCard(product, isBundle = false, context = 'catalog') {
  const card = document.createElement('article');
  card.className = `product-card${isBundle ? ' bundle-card' : ''}${context === 'purchases' ? ' card-owned-item' : ''}`;
  card.dataset.id = product.id;

  let badges = renderBadges(product, context);

  const price = product.price === 0
    ? `<span class="card-price free">Free</span>`
    : `<span class="card-price">$${product.price.toFixed(2)}${product.oldPrice ? `<span class="old">$${product.oldPrice.toFixed(2)}</span>` : ''}</span>`;

  const footerLeft = context === 'purchases'
    ? `<span class="card-owned">Purchased</span>`
    : price;

  const systemIcons = (context === 'catalog' || context === 'admin')
    ? renderSystemIcons(product.systems, product.delivery)
    : '';
  const vaultBadge = isCustomProduct(product) && context !== 'purchases'
    ? renderVaultBadge()
    : '';
  const versionTag = `<span class="card-version-tag">${formatVersionLabel(product.version)}</span>`;

  card.innerHTML = `
    <div class="card-image ${product.thumb || 'thumb-1'}">
      <div class="card-badges">${badges}</div>
      <button class="card-fav${favorites.has(product.id) ? ' is-faved' : ''}" aria-label="Favourite" aria-pressed="${favorites.has(product.id)}" onclick="event.stopPropagation(); toggleFavorite(${product.id})">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>
      <div class="card-stats">
        <span class="stat-pill"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> ${product.downloads}</span>
        <button type="button" class="stat-pill stat-pill-fav${favorites.has(product.id) ? ' is-faved' : ''}" aria-label="Favourite" aria-pressed="${favorites.has(product.id)}" onclick="event.stopPropagation(); toggleFavorite(${product.id})">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> ${product.favs}
        </button>
      </div>
      ${systemIcons}
    </div>
    <div class="card-body">
      <div class="card-title-row">
        <div class="card-title">${product.title}</div>
        ${vaultBadge ? `<div class="card-title-end">${vaultBadge}</div>` : ''}
      </div>
      ${renderCardAuthor(product)}
      <div class="card-footer">
        ${footerLeft}
        ${versionTag}
      </div>
    </div>`;

  if (context === 'admin') {
    card.classList.add('admin-catalog-card');
    card.addEventListener('click', () => editCatalogProduct(product.id));
  } else {
    card.addEventListener('click', () => openProduct(product));
  }
  applyProductCover(card.querySelector('.card-image'), product);
  return card;
}

function sortList(list) {
  const arr = [...list];
  if (currentSort === 'downloads') arr.sort((a, b) => parseInt(b.downloads) - parseInt(a.downloads));
  else if (currentSort === 'favourites') arr.sort((a, b) => b.favs - a.favs);
  return arr;
}

let bundleTgsCachePromise = null;

async function getBundleTgsJson() {
  if (bundleTgsCachePromise) return bundleTgsCachePromise;
  bundleTgsCachePromise = (async () => {
    if (window.BUNDLE_TGS_JSON) return window.BUNDLE_TGS_JSON;
    const res = await fetch(BUNDLE_TGS_PATH);
    if (!res.ok) throw new Error('Failed to load bundle .tgs');
    const blob = await res.blob();
    const ds = new DecompressionStream('gzip');
    const decompressed = blob.stream().pipeThrough(ds);
    const text = await new Response(decompressed).text();
    return JSON.parse(text);
  })();
  return bundleTgsCachePromise;
}

async function initBundleLottie(scope = document) {
  if (typeof window.lottie === 'undefined') return;
  const nodes = scope.querySelectorAll('.bundle-lottie[data-tgs]');
  if (!nodes.length) return;

  let animationData;
  try {
    animationData = await getBundleTgsJson();
  } catch {
    return;
  }

  nodes.forEach(node => {
    if (node.dataset.lottieReady === '1') return;
    node.dataset.lottieReady = '1';
    window.lottie.loadAnimation({
      container: node,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: JSON.parse(JSON.stringify(animationData)),
      rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
    });
  });
}

function renderProducts(list) {
  const sorted = sortList(list);
  productGrid.innerHTML = '';
  sorted.forEach(p => productGrid.appendChild(renderCard(p)));
  initBundleLottie(productGrid);
  const available = catalogProducts().length;
  itemCount.textContent = `${sorted.length} of ${available} in catalog`;
}

function renderBundles() {
  const available = PRODUCTS.filter(p => p.type === 'bundle' && !library.has(p.id));
  bundleList.innerHTML = '';
  available.forEach(p => bundleList.appendChild(renderCard(p)));
  initBundleLottie(bundleList);
  if (!available.length) bundleList.innerHTML = '<p class="item-count">No bundles in catalog.</p>';
}

/* ── Filters & search ── */
function filterProducts() {
  const q = searchInput.value.toLowerCase().trim();
  const list = catalogProducts().filter(p => {
    if (currentFilter !== 'all' && p.type !== currentFilter) return false;
    if (q && !p.title.toLowerCase().includes(q) && !p.author.toLowerCase().includes(q)) return false;
    return true;
  });
  renderProducts(list);
}

filterChips.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    filterChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentFilter = chip.dataset.filter;
    filterProducts();
  });
});

sortChips.querySelectorAll('.chip[data-sort]').forEach(chip => {
  chip.addEventListener('click', () => {
    sortChips.querySelectorAll('.chip[data-sort]').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentSort = chip.dataset.sort;
    filterProducts();
  });
});

searchInput.addEventListener('input', filterProducts);

/* ── Product detail ── */
function renderFavourites() {
  const list = PRODUCTS.filter(p => favorites.has(p.id));
  favouritesGrid.innerHTML = '';
  favouritesEmpty.style.display = list.length ? 'none' : '';
  list.forEach(p => favouritesGrid.appendChild(renderCard(p)));
  initBundleLottie(favouritesGrid);
  updateNavBadges();
}

function toggleFavorite(id) {
  const product = PRODUCTS.find(p => p.id === id);
  const adding = !favorites.has(id);
  if (adding) favorites.add(id);
  else favorites.delete(id);
  if (product) {
    if (adding) product.favs = (product.favs || 0) + 1;
    else product.favs = Math.max(0, (product.favs || 0) - 1);
    saveCatalogProducts();
  }
  if (currentView === 'favourites') favoritesSeenCount = favorites.size;
  renderFavourites();
  filterProducts();
  renderBundles();
  if (currentProduct?.id === id && product) {
    currentProduct = product;
    refreshHeartButton(product);
  }
  if (product && favModalEnabled()) {
    if (adding) showFavoriteAddedCelebration(product);
    else showFavoriteRemovedCelebration(product);
  }
}

function refreshHeartButton(product) {
  const isFaved = favorites.has(product.id);
  const btn = document.getElementById('productHeartBtn');
  if (btn) {
    btn.classList.toggle('is-faved', isFaved);
    btn.setAttribute('aria-pressed', isFaved);
  }
  const pill = document.getElementById('productFavPill');
  if (pill) {
    pill.classList.toggle('is-faved', isFaved);
    pill.setAttribute('aria-pressed', isFaved);
  }
  const favCount = document.getElementById('productFavs');
  if (favCount) favCount.textContent = product.favs ?? 0;
}

function openProduct(product) {
  currentProduct = product;
  previousView = currentView;
  document.getElementById('productHero').className = `product-hero ${product.thumb || 'thumb-1'}`;
  applyProductCover(document.getElementById('productHero'), product);
  document.getElementById('productTitle').textContent = product.title;
  const authorLine = document.getElementById('productAuthorLine');
  if (authorLine) {
    authorLine.classList.remove('is-animating', 'is-typing');
    authorLine.innerHTML = `${renderAuthorIcon(product, 'product-author-icon', { fallback: true })}<span class="author-anim-text"></span>`;
  }
  const vaultBadgeEl = document.getElementById('productVaultBadge');
  if (vaultBadgeEl) vaultBadgeEl.hidden = !isCustomProduct(product);
  const versionEl = document.getElementById('productVersion');
  if (versionEl) versionEl.textContent = formatVersionLabel(product.version);
  const fileSizeEl = document.getElementById('productFileSize');
  if (fileSizeEl) fileSizeEl.textContent = formatProductFileSize(product);
  document.getElementById('productDownloads').textContent = product.downloads;
  document.getElementById('productFavs').textContent = product.favs;
  document.getElementById('productFormat').innerHTML = renderFormatBadge(product.format) || '—';

  const osHtml = renderSystemDetailBadge(product.systems, 'os');
  document.getElementById('productOS').innerHTML = osHtml || '—';

  const appHtml = renderSystemDetailBadge(product.systems, 'app');
  const softwareFallback = product.software && product.software !== 'Any' ? product.software : '';
  document.getElementById('productSoftware').innerHTML = appHtml || softwareFallback || '—';

  const aboutEl = document.getElementById('productAbout');
  const aboutOn = product.aboutOn !== false;
  const aboutHeading = document.querySelector('#view-product .about-heading');
  const aboutCard = document.querySelector('#view-product .about-card');
  if (aboutHeading) aboutHeading.hidden = !aboutOn;
  if (aboutCard) aboutCard.hidden = !aboutOn;
  if (aboutEl) aboutEl.innerHTML = aboutOn ? renderProductAbout(product.about, product) : '';
  initAboutFolder();
  document.getElementById('productDelivery').innerHTML = renderDeliveryBadge(product.delivery) || '—';

  const websiteInfo = formatProductWebsite(product.website);
  const websiteEl = document.getElementById('productWebsite');
  if (websiteEl) {
    websiteEl.innerHTML = renderProductWebsiteLink(websiteInfo, product);
  }

  const priceEl = document.getElementById('productPrice');
  if (priceEl) {
    priceEl.innerHTML = renderProductPriceContent(product);
    priceEl.classList.toggle('free', product.price === 0);
  }

  // Subscription access for premium / exclusive when lurker
  const tier = getProductAccessTier(product);
  document.getElementById('subAccessBtn').style.display =
    tier !== 'free' && tier !== 'bundle' && !canAccessWithPlan(product) ? 'flex' : 'none';
  refreshBuyButton(product);
  refreshHeartButton(product);

  const badgesEl = document.getElementById('productBadges');
  if (badgesEl) {
    badgesEl.innerHTML = renderBadges(product, 'product');
    initBundleLottie(badgesEl);
  }

  document.getElementById('productTags').innerHTML = product.tags.map(t => `<span class="tag">${t}</span>`).join('');
  showView('product');
  playProductIntroAnimations(product);
}

/* Buy / Download state for the product detail bar */
function refreshBuyButton(product) {
  const btn = document.getElementById('buyBtn');
  const tier = getProductAccessTier(product);
  btn.classList.remove('is-buy');
  if (canDownloadProduct(product)) {
    const label = tier === 'free' ? 'Download Free' : 'Download';
    btn.innerHTML = `${DL_ICON} ${label}`;
    btn.onclick = () => startDownload(product);
  } else if (tier === 'bundle' || isPaid(product)) {
    btn.classList.add('is-buy');
    btn.textContent = `Buy $${product.price.toFixed(2)}`;
    btn.onclick = () => {
      owned.add(product.id);
      userStats.purchases++;
      updateProfileStats();
      library.add(product.id);
      renderPurchases();
      filterProducts();
      renderBundles();
      showPurchaseCelebration(product);
      refreshBuyButton(product);
    };
  } else {
    btn.innerHTML = `${DL_ICON} Download Free`;
    btn.onclick = () => startDownload(product);
  }
}

function renderPurchases() {
  const list = PRODUCTS.filter(p => library.has(p.id));
  purchasesGrid.innerHTML = '';
  purchasesEmpty.style.display = list.length ? 'none' : '';
  list.forEach(p => purchasesGrid.appendChild(renderCard(p)));
  initBundleLottie(purchasesGrid);
  updateNavBadges();
}

/* ── Carousel ── */
const slideCount = carouselTrack.children.length;

function buildDots() {
  carouselDots.innerHTML = '';
  for (let i = 0; i < slideCount; i++) {
    const dot = document.createElement('button');
    dot.className = `carousel-dot${i === 0 ? ' active' : ''}`;
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    carouselDots.appendChild(dot);
  }
}
function goToSlide(i) {
  carouselIndex = i;
  carouselTrack.style.transform = `translateX(-${i * 100}%)`;
  carouselDots.querySelectorAll('.carousel-dot').forEach((d, idx) => d.classList.toggle('active', idx === i));
}
function nextSlide() { goToSlide((carouselIndex + 1) % slideCount); }
function startCarousel() { buildDots(); clearInterval(carouselTimer); carouselTimer = setInterval(nextSlide, 4500); }

let touchStartX = 0;
const carEl = carouselTrack.parentElement;
carEl.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
carEl.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 40) diff > 0 ? nextSlide() : goToSlide((carouselIndex - 1 + slideCount) % slideCount);
}, { passive: true });

/* ── Profile avatar (PNG / GIF) ── */
let avatarObjectUrl = null;
const profileNameInput = document.getElementById('profileNameInput');

function loadProfileName() {
  if (!profileNameInput) return;
  try {
    const saved = localStorage.getItem(PROFILE_NAME_KEY);
    if (saved) profileNameInput.value = saved;
  } catch {}
}

function saveProfileName() {
  if (!profileNameInput) return;
  const val = profileNameInput.value.trim() || 'J2026Vault';
  profileNameInput.value = val;
  try { localStorage.setItem(PROFILE_NAME_KEY, val); } catch {}
}

if (profileNameInput) {
  profileNameInput.addEventListener('blur', saveProfileName);
  profileNameInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      profileNameInput.blur();
    }
  });
}

document.getElementById('avatarEditBtn').addEventListener('click', () => {
  document.getElementById('avatarInput').click();
});

document.getElementById('avatarInput').addEventListener('change', e => {
  const file = e.target.files?.[0];
  if (!file) return;
  const ok = file.type === 'image/png' || file.type === 'image/gif' || /\.(png|gif)$/i.test(file.name);
  if (!ok) {
    showToast('Please choose a PNG or GIF');
    e.target.value = '';
    return;
  }
  if (avatarObjectUrl) URL.revokeObjectURL(avatarObjectUrl);
  avatarObjectUrl = URL.createObjectURL(file);
  document.getElementById('profileAvatar').src = avatarObjectUrl;
  showToast('Profile picture updated');
  e.target.value = '';
});

function showToast(msg = 'Copied!') {
  let toast = document.querySelector('.toast');
  if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; document.body.appendChild(toast); }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 2000);
}

/* ── Keyboard ── */
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') nextSlide();
  if (e.key === 'ArrowLeft') goToSlide((carouselIndex - 1 + slideCount) % slideCount);
  if (e.key === 'Escape' && celebrateOverlay.classList.contains('open')) closeCelebrate();
});

/* ── Init (auto-loads, no button) ── */
let scrollHideTimer;
content.addEventListener('scroll', () => {
  content.classList.add('is-scrolling');
  clearTimeout(scrollHideTimer);
  scrollHideTimer = setTimeout(() => content.classList.remove('is-scrolling'), 700);
}, { passive: true });

const SPLASH_MIN_MS = 850;
const SPLASH_SLOW_MS = 3200;
const SPLASH_TIPS = [
  'Lurker plan: download anything with a Lurker badge in Catalog.',
  'Premium & Exclusive items need Leaker or Heavenly.',
  'Tap the heart on any post to save it to Favourites.',
  'Bundles keep their discount — grab them while they\'re listed.',
  'Need help? Profile → Contact support opens our Discord.',
  'Subscription plans live under Profile → Get Premium.',
];

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function initApp() {
  persistVaultOwnerDevOverride();
  vaultAdminUnlocked = readVaultAdminUnlock();
  initTelegramUser();

  if (shouldShowTelegramGate()) {
    showTelegramGate();
    return false;
  }

  hideTelegramGate();
  applyVaultAdminAccess();
  loadCatalogProducts();
  loadProfileName();
  updateProfileStats();
  updateNavBadges();
  updatePremiumUI();
  updatePlansPageUI();
  renderFavourites();
  renderPurchases();
  filterProducts();
  renderBundles();
  initBundleLottie(document);
  startCarousel();
  renderAdminPanel();
  setupProductIntroHover();
  return true;
}

async function runSplash() {
  // Gate first — never boot the vault UI on a public browser URL
  persistVaultOwnerDevOverride();
  initTelegramUser();
  if (shouldShowTelegramGate()) {
    showTelegramGate();
    return;
  }

  hideTelegramGate();
  beginSplash();

  const splash = document.getElementById('splash');
  const statusEl = document.getElementById('splashStatus');
  const tipEl = document.getElementById('splashTip');

  const finishWithoutSplash = () => {
    const ready = initApp();
    if (ready) maybePromptOwnerPassword();
  };

  if (!splash) {
    finishWithoutSplash();
    return;
  }

  const started = performance.now();
  let tipIndex = 0;
  let tipTimer = null;

  const showTip = () => {
    tipEl.hidden = false;
    tipEl.textContent = SPLASH_TIPS[tipIndex % SPLASH_TIPS.length];
    tipIndex += 1;
  };

  const slowTimer = setTimeout(() => {
    statusEl.textContent = 'Taking longer than expected — please wait…';
    showTip();
    tipTimer = setInterval(showTip, 4500);
  }, SPLASH_SLOW_MS);

  let ready = false;
  try {
    if (document.fonts?.ready) await document.fonts.ready;
    ready = initApp();
    await wait(0);
  } catch (err) {
    console.error('Splash init error:', err);
  }

  if (!ready) {
    clearTimeout(slowTimer);
    if (tipTimer) clearInterval(tipTimer);
    showTelegramGate();
    return;
  }

  const elapsed = performance.now() - started;
  await wait(Math.max(0, SPLASH_MIN_MS - elapsed));

  clearTimeout(slowTimer);
  if (tipTimer) clearInterval(tipTimer);

  splash.classList.add('splash-out');
  document.body.classList.remove('splash-active');
  await wait(680);
  splash.remove();
  maybePromptOwnerPassword();
}

runSplash();
