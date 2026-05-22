// ── js/surprise.js ──
// Modale "Surprenez-moi" : affiche une citation aléatoire en plein écran.

// ── Historique pour éviter les répétitions immédiates ────────────────────────
const _surpriseHistory = [];
const HISTORY_SIZE = 5; // ne répète pas les 5 dernières citations

function pickRandomQuote() {
  const pool = ALL_QUOTES.filter(q => !_surpriseHistory.includes(q.id));
  // Si toutes les citations ont été vues (collection très petite), on vide l'historique
  const source = pool.length > 0 ? pool : ALL_QUOTES;
  const quote  = source[Math.floor(Math.random() * source.length)];

  _surpriseHistory.push(quote.id);
  if (_surpriseHistory.length > HISTORY_SIZE) _surpriseHistory.shift();

  return quote;
}

// ── Rendu du contenu de la modale ────────────────────────────────────────────
function renderSurpriseContent(quote, animate = false) {
  const vote  = getVote(state, quote.id);
  const score = displayScore(state, quote);
  const hasEn = !!quote.textEn;

  const content = document.getElementById('surprise-content');

  content.innerHTML = `
    <p
      class="surprise-quote-text${animate ? ' swapping' : ''}"
      data-quote-text
      data-id="${quote.id}"
    >${quote.text}</p>

    <div class="surprise-meta">
      <div class="surprise-author-block">
        <button
          class="author-link"
          onclick="closeSurpriseModal(); openAuthorPanel('${quote.author.replace(/'/g, "\\'")}'  , this)"
        >
          <span class="surprise-author-name">${quote.author}</span>
        </button>
        <span class="surprise-author-era">${quote.era}</span>
      </div>

      <div class="surprise-meta-right">
        <span class="category-tag">${quote.cat}</span>

        ${hasEn ? `
        <button
          class="icon-btn lang-toggle"
          onclick="toggleLang(this)"
          data-fr="${encodeURIComponent(quote.text)}"
          data-en="${encodeURIComponent(quote.textEn)}"
          title="Voir en anglais"
          aria-label="Basculer la langue"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/>
            <path d="M2 5h12"/><path d="M7 2h1"/>
            <path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/>
          </svg>
          <span class="lang-label">EN</span>
        </button>` : ''}

        <button
          class="icon-btn"
          onclick="shareQuote(${quote.id})"
          title="Partager"
          aria-label="Partager cette citation"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        </button>
        <button
          class="icon-btn"
          onclick="openImageModal(${quote.id})"
          title="Créer une image"
          aria-label="Créer une image à partager"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Votes -->
    <div class="vote-row" role="group" aria-label="Voter pour cette citation" style="margin-bottom:0">
      <button
        class="vote-btn${vote === 'up' ? ' voted-up' : ''}"
        onclick="handleVoteSurprise(${quote.id}, 'up')"
        aria-label="J'aime (${score} votes)"
        aria-pressed="${vote === 'up'}"
        id="sv-up-${quote.id}"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/>
          <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
        </svg>
        ${score}
      </button>
      <button
        class="vote-btn${vote === 'down' ? ' voted-down' : ''}"
        onclick="handleVoteSurprise(${quote.id}, 'down')"
        aria-label="Je n'aime pas"
        aria-pressed="${vote === 'down'}"
        id="sv-down-${quote.id}"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"/>
          <path d="M17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/>
        </svg>
      </button>
    </div>
  `;
}

// ── Gestion du vote depuis la modale (met aussi à jour les onglets) ───────────
function handleVoteSurprise(quoteId, dir) {
  castVote(state, quoteId, dir);

  // Mise à jour des boutons dans la modale
  const vote  = getVote(state, quoteId);
  const score = displayScore(state, ALL_QUOTES.find(q => q.id === quoteId));

  const upBtn   = document.getElementById(`sv-up-${quoteId}`);
  const downBtn = document.getElementById(`sv-down-${quoteId}`);

  if (upBtn && downBtn) {
    upBtn.classList.toggle('voted-up', vote === 'up');
    downBtn.classList.toggle('voted-down', vote === 'down');
    // Met à jour le score affiché (dernier nœud texte du bouton up)
    const textNode = [...upBtn.childNodes].find(n => n.nodeType === Node.TEXT_NODE);
    if (textNode) textNode.textContent = ` ${score}`;

    // Animation pop
    [upBtn, downBtn].forEach(btn => {
      btn.classList.remove('pop');
      void btn.offsetWidth;
      btn.classList.add('pop');
      btn.addEventListener('animationend', () => btn.classList.remove('pop'), { once: true });
    });
  }

  // Met à jour les autres onglets en arrière-plan
  renderAll();
}

// ── Ouvrir la modale ─────────────────────────────────────────────────────────
function openSurpriseModal() {
  const modal   = document.getElementById('surprise-modal');
  const overlay = document.getElementById('surprise-overlay');
  const isOpen  = modal.classList.contains('open');

  if (!isOpen) {
    // Première ouverture
    const quote = pickRandomQuote();
    renderSurpriseContent(quote, false);

    modal.removeAttribute('hidden');
    overlay.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      modal.classList.add('open');
      overlay.classList.add('visible');
    });
  } else {
    // "Encore une" — animation de swap puis nouvelle citation
    const textEl = document.querySelector('.surprise-quote-text');
    if (textEl) {
      textEl.classList.remove('swapping');
      void textEl.offsetWidth; // reflow
      textEl.classList.add('swapping');
    }

    setTimeout(() => {
      const quote = pickRandomQuote();
      renderSurpriseContent(quote, true);
    }, 160); // au milieu de l'animation (opacity: 0)
  }
}

// ── Fermer la modale ─────────────────────────────────────────────────────────
function closeSurpriseModal() {
  const modal   = document.getElementById('surprise-modal');
  const overlay = document.getElementById('surprise-overlay');

  modal.classList.remove('open');
  overlay.classList.remove('visible');

  setTimeout(() => {
    modal.setAttribute('hidden', '');
    overlay.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }, 300);
}

// Fermer avec Échap (s'ajoute à l'écouteur existant dans features.js)
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSurpriseModal();
});