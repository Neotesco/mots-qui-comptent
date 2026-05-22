// ── js/render.js ──
// Fonctions pures qui génèrent du HTML à partir des données.

// ── Icônes SVG inline ────────────────────────────────────────────────────────
const ICON = {
  thumbUp:   `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>`,
  thumbDown: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/></svg>`,
  trophy:    `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg>`,
  heart:     `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
  share:     `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
  image:     `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  translate: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/></svg>`,
  user:      `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0112 0v2"/></svg>`,
};

// ── Quote card (onglet "Aujourd'hui" et Stats) ───────────────────────────────
function renderQuoteCard(quote, state, featured = false) {
  const vote  = getVote(state, quote.id);
  const score = displayScore(state, quote);
  const hasEn = !!quote.textEn;

  return `
    <article class="quote-card${featured ? ' featured' : ''}" data-id="${quote.id}">
      <div class="quote-card-top">
        <span class="category-tag">${quote.cat}</span>
        <div class="quote-card-actions">
          ${hasEn ? `<button class="icon-btn lang-toggle" onclick="toggleLang(this)" data-fr="${encodeURIComponent(quote.text)}" data-en="${encodeURIComponent(quote.textEn)}" title="Voir en anglais" aria-label="Basculer la langue">${ICON.translate} <span class="lang-label">EN</span></button>` : ''}
          <button class="icon-btn share-btn" onclick="shareQuote(${quote.id})" title="Partager" aria-label="Partager cette citation">${ICON.share}</button>
          <button class="icon-btn" onclick="openImageModal(${quote.id})" title="Créer une image" aria-label="Créer une image à partager">${ICON.image}</button>
        </div>
      </div>
      <p class="quote-text" data-quote-text>${quote.text}</p>
      <footer class="quote-footer">
        <div>
          <button class="author-link" onclick="openAuthorPanel('${quote.author.replace(/'/g, "\\'")}', this)">
            <p class="quote-author-name">${quote.author}</p>
          </button>
          <p class="quote-author-era">${quote.era}</p>
        </div>
        <div class="vote-row" role="group" aria-label="Voter pour cette citation">
          <button
            class="vote-btn${vote === 'up' ? ' voted-up' : ''}"
            onclick="handleVote(${quote.id}, 'up')"
            aria-label="J'aime (${score} votes)"
            aria-pressed="${vote === 'up'}"
          >${ICON.thumbUp} ${score}</button>
          <button
            class="vote-btn${vote === 'down' ? ' voted-down' : ''}"
            onclick="handleVote(${quote.id}, 'down')"
            aria-label="Je n'aime pas"
            aria-pressed="${vote === 'down'}"
          >${ICON.thumbDown}</button>
        </div>
      </footer>
    </article>`;
}

// ── Top card ─────────────────────────────────────────────────────────────────
function renderTopCard(quote, rank, state) {
  const score     = displayScore(state, quote);
  const rankClass = rank <= 3 ? `rank-${rank}` : 'rank-n';
  const label     = rank <= 3 ? ['🥇','🥈','🥉'][rank - 1] : rank;
  const hasEn     = !!quote.textEn;

  return `
    <article class="top-card" data-id="${quote.id}">
      <div class="rank-badge ${rankClass}" aria-label="Rang ${rank}">${label}</div>
      <div class="top-card-body">
        <p class="top-quote-text" data-quote-text>${quote.text}</p>
        <div class="top-meta">
          <span class="top-author">
            <button class="author-link" onclick="openAuthorPanel('${quote.author.replace(/'/g, "\\'")}', this)">
              ${quote.author}
            </button>
            &nbsp;<span class="category-tag" style="font-size:10px">${quote.cat}</span>
          </span>
          <div class="top-card-actions">
            <span class="top-score">${ICON.thumbUp} ${score} votes</span>
            ${hasEn ? `<button class="icon-btn lang-toggle" onclick="toggleLang(this)" data-fr="${encodeURIComponent(quote.text)}" data-en="${encodeURIComponent(quote.textEn)}" title="Voir en anglais" aria-label="Basculer la langue">${ICON.translate} <span class="lang-label">EN</span></button>` : ''}
            <button class="icon-btn" onclick="openImageModal(${quote.id})" title="Créer une image" aria-label="Créer une image à partager">${ICON.image}</button>
          </div>
        </div>
      </div>
    </article>`;
}

// ── Empty state ───────────────────────────────────────────────────────────────
function renderEmpty(message) {
  return `
    <div class="empty-state">
      ${ICON.heart}
      ${message}
    </div>`;
}