// ── js/imagecard.js ──
// Génère une carte visuelle 1080×1080 px (format Instagram carré)
// Design épuré : fond uni, texte centré, zéro décoration parasite.

// ── Palettes de thèmes ────────────────────────────────────────────────────────
const CARD_THEMES = [
  {
    id: 'dark',
    label: 'Nuit',
    bg: '#1A1916',
    text: '#F0EDE6',
    textSub: '#9E9B96',
    accent: '#9490C4',
    sep: 'rgba(240,237,230,0.15)',
  },
  {
    id: 'violet',
    label: 'Violet',
    bg: '#2D2660',
    text: '#F0EDE6',
    textSub: '#C5C2E8',
    accent: '#C5C2E8',
    sep: 'rgba(255,255,255,0.18)',
  },
  {
    id: 'stone',
    label: 'Pierre',
    bg: '#2C2A25',
    text: '#F0EDE6',
    textSub: '#9E9B96',
    accent: '#C4A96B',
    sep: 'rgba(196,169,107,0.3)',
  },
  {
    id: 'cream',
    label: 'Crème',
    bg: '#F7F5F0',
    text: '#1A1916',
    textSub: '#6B6760',
    accent: '#4A3F8F',
    sep: 'rgba(26,25,22,0.15)',
  },
];

// ── Utilitaire : retour à la ligne ────────────────────────────────────────────
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const word of words) {
    const test = cur ? `${cur} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur);
      cur = word;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

// ── Moteur de rendu Canvas ────────────────────────────────────────────────────
function generateQuoteCanvas(quote, themeId = 'dark') {
  const SIZE  = 1080;
  const PAD   = 100;
  const theme = CARD_THEMES.find(t => t.id === themeId) || CARD_THEMES[0];

  const canvas  = document.createElement('canvas');
  canvas.width  = SIZE;
  canvas.height = SIZE;
  const ctx     = canvas.getContext('2d');

  // ── 1. Fond plat uni ─────────────────────────────────────────────────────────
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // ── 2. Guillemet décoratif (grand, très transparent) ────────────────────────
  ctx.save();
  ctx.font         = `italic 320px Georgia, serif`;
  ctx.fillStyle    = theme.accent;
  ctx.globalAlpha  = 0.07;
  ctx.textBaseline = 'top';
  ctx.fillText('\u201C', PAD - 20, PAD - 60);
  ctx.restore();

  // ── 3. Texte de la citation ───────────────────────────────────────────────────
  const textMaxW = SIZE - PAD * 2;
  const textLen  = quote.text.length;
  const fontSize = textLen < 70  ? 62
                 : textLen < 120 ? 52
                 : textLen < 180 ? 44
                 : textLen < 250 ? 38
                 :                  33;
  const lineH    = fontSize * 1.6;

  ctx.font         = `italic ${fontSize}px "Playfair Display", Georgia, serif`;
  ctx.fillStyle    = theme.text;
  ctx.textBaseline = 'top';

  const lines = wrapText(ctx, quote.text, textMaxW);

  // Centrage vertical de l'ensemble (citation + sépa + auteur)
  const authorBlockH = 46 + 36 + 28; // name + era + gap
  const totalTextH   = lines.length * lineH + 60 + authorBlockH;
  const startY       = (SIZE - totalTextH) / 2;

  lines.forEach((line, i) => {
    ctx.fillText(line, PAD, startY + i * lineH);
  });

  // ── 4. Ligne séparatrice ─────────────────────────────────────────────────────
  const sepY = startY + lines.length * lineH + 44;
  ctx.strokeStyle = theme.sep;
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.moveTo(PAD, sepY);
  ctx.lineTo(PAD + 80, sepY);
  ctx.stroke();

  // ── 5. Auteur ────────────────────────────────────────────────────────────────
  const authorY = sepY + 28;

  ctx.font         = `600 34px "DM Sans", system-ui, sans-serif`;
  ctx.fillStyle    = theme.text;
  ctx.textBaseline = 'top';
  ctx.fillText(`— ${quote.author}`, PAD, authorY);

  ctx.font         = `300 26px "DM Sans", system-ui, sans-serif`;
  ctx.fillStyle    = theme.textSub;
  ctx.fillText(quote.era || '', PAD, authorY + 46);

  // ── 6. Nom du site en bas à droite ───────────────────────────────────────────
  const siteName = 'Les mots qui comptent';
  ctx.font         = `italic 500 26px "Playfair Display", Georgia, serif`;
  ctx.fillStyle    = theme.accent;
  ctx.globalAlpha  = 0.65;
  ctx.textBaseline = 'bottom';
  ctx.textAlign    = 'right';
  ctx.fillText(siteName, SIZE - PAD, SIZE - PAD + 10);

  // Point déco avant le nom
  const nameW = ctx.measureText(siteName).width;
  ctx.beginPath();
  ctx.arc(SIZE - PAD - nameW - 14, SIZE - PAD + 10 - 13, 4, 0, Math.PI * 2);
  ctx.fillStyle   = theme.accent;
  ctx.globalAlpha = 0.5;
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.textAlign   = 'left';

  return canvas;
}

// ── État ──────────────────────────────────────────────────────────────────────
let _currentImageQuote = null;
let _currentImageTheme = 'dark';

// ── Ouvrir la modale depuis n'importe quelle page ─────────────────────────────
function openImageModal(quoteId) {
  const quote = ALL_QUOTES.find(q => q.id === quoteId);
  if (!quote) return;

  _currentImageQuote = quote;
  _refreshPreview(quote, _currentImageTheme);

  document.querySelectorAll('.theme-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.theme === _currentImageTheme);
  });

  const modal   = document.getElementById('image-modal');
  const overlay = document.getElementById('image-overlay');
  modal.removeAttribute('hidden');
  overlay.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => {
    modal.classList.add('open');
    overlay.classList.add('visible');
  });
}

function closeImageModal() {
  const modal   = document.getElementById('image-modal');
  const overlay = document.getElementById('image-overlay');
  modal.classList.remove('open');
  overlay.classList.remove('visible');
  setTimeout(() => {
    modal.setAttribute('hidden', '');
    overlay.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }, 300);
}

function _refreshPreview(quote, themeId) {
  const canvas    = generateQuoteCanvas(quote, themeId);
  const container = document.getElementById('image-preview');
  container.innerHTML = '';
  canvas.style.cssText = 'width:100%;height:auto;display:block;border-radius:8px;';
  container.appendChild(canvas);
}

function selectTheme(themeId) {
  _currentImageTheme = themeId;
  document.querySelectorAll('.theme-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.theme === themeId);
  });
  if (_currentImageQuote) _refreshPreview(_currentImageQuote, themeId);
}

// ── Téléchargement ────────────────────────────────────────────────────────────
function downloadQuoteImage() {
  if (!_currentImageQuote) return;
  const canvas = generateQuoteCanvas(_currentImageQuote, _currentImageTheme);
  const link   = document.createElement('a');
  link.download = `citation-${_currentImageQuote.author.replace(/\s+/g, '-').toLowerCase()}.png`;
  link.href     = canvas.toDataURL('image/png');
  link.click();
  showToast('Image téléchargée !');
}

// ── Partage natif ─────────────────────────────────────────────────────────────
async function shareQuoteImage() {
  if (!_currentImageQuote) return;
  const canvas = generateQuoteCanvas(_currentImageQuote, _currentImageTheme);
  canvas.toBlob(async blob => {
    if (!blob) return;
    const file = new File([blob], 'citation.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Les mots qui comptent',
          text: `"${_currentImageQuote.text}" — ${_currentImageQuote.author}`,
        });
      } catch (_) {}
    } else {
      downloadQuoteImage();
    }
  }, 'image/png');
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeImageModal();
});