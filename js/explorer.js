// ── js/explorer.js ──
// Onglet "Explorer" : recherche, filtres par catégorie / auteur / époque, tri.

// ── État des filtres ──────────────────────────────────────────────────────────
const explorerFilters = {
  cats:    new Set(),   // catégories actives (vide = toutes)
  authors: new Set(),   // auteurs actifs
  eras:    new Set(),   // époques actives
};

// ── Extraction des époques ────────────────────────────────────────────────────
// Regroupe chaque citation dans un "siècle" lisible à partir du champ `era`.
function getEraLabel(eraStr) {
  if (!eraStr) return 'Époque inconnue';

  // Chercher une année à 4 chiffres (ex : 1879, 1900…)
  const yearMatch = eraStr.match(/\b(\d{3,4})\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10);
    if (year < 0)   return 'Antiquité';
    if (year < 500) return 'Antiquité tardive';
    if (year < 1400) return 'Moyen Âge';
    if (year < 1600) return 'Renaissance';
    if (year < 1700) return 'XVIIe siècle';
    if (year < 1800) return 'XVIIIe siècle';
    if (year < 1900) return 'XIXe siècle';
    if (year < 2000) return 'XXe siècle';
    return 'XXIe siècle';
  }

  // Cherche "av. J.-C." dans la chaîne
  if (eraStr.match(/av\.\s*J/i)) return 'Antiquité';

  return 'Époque inconnue';
}

// ── Initialisation des chips de filtre ───────────────────────────────────────
let explorerInitialized = false;

function initExplorerChips() {
  if (explorerInitialized) return;
  explorerInitialized = true;

  // Catégories uniques
  const cats    = [...new Set(ALL_QUOTES.map(q => q.cat))].sort();
  // Auteurs uniques
  const authors = [...new Set(ALL_QUOTES.map(q => q.author))].sort();
  // Époques uniques (ordre chronologique par valeur)
  const eraOrder = [
    'Antiquité', 'Antiquité tardive', 'Moyen Âge',
    'Renaissance', 'XVIIe siècle', 'XVIIIe siècle',
    'XIXe siècle', 'XXe siècle', 'XXIe siècle', 'Époque inconnue'
  ];
  const eras = [...new Set(ALL_QUOTES.map(q => getEraLabel(q.era)))]
    .sort((a, b) => eraOrder.indexOf(a) - eraOrder.indexOf(b));

  renderChips('filter-cats',    cats,    'cats');
  renderChips('filter-authors', authors, 'authors');
  renderChips('filter-eras',    eras,    'eras');
}

function renderChips(containerId, values, filterKey) {
  const container = document.getElementById(containerId);
  container.innerHTML = values.map(v => `
    <button
      class="filter-chip"
      data-key="${filterKey}"
      data-val="${v}"
      onclick="toggleChip(this, '${filterKey}', '${v.replace(/'/g, "\\'")}')"
    >${v}</button>
  `).join('');
}

// ── Toggle d'un chip ─────────────────────────────────────────────────────────
function toggleChip(el, key, val) {
  const set = explorerFilters[key];
  if (set.has(val)) {
    set.delete(val);
    el.classList.remove('active');
  } else {
    set.add(val);
    el.classList.add('active');
  }
  handleExplorerFilter();
}

// ── Filtrage + tri ────────────────────────────────────────────────────────────
function handleExplorerFilter() {
  const query  = (document.getElementById('explorer-search')?.value || '').toLowerCase().trim();
  const sortBy = document.getElementById('explorer-sort')?.value || 'score';

  let results = ALL_QUOTES.filter(q => {
    // Filtre texte
    if (query) {
      const haystack = `${q.text} ${q.author} ${q.era} ${q.cat}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    // Filtre catégorie
    if (explorerFilters.cats.size && !explorerFilters.cats.has(q.cat)) return false;
    // Filtre auteur
    if (explorerFilters.authors.size && !explorerFilters.authors.has(q.author)) return false;
    // Filtre époque
    if (explorerFilters.eras.size && !explorerFilters.eras.has(getEraLabel(q.era))) return false;

    return true;
  });

  // Tri
  if (sortBy === 'score') {
    results.sort((a, b) => displayScore(state, b) - displayScore(state, a));
  } else if (sortBy === 'author') {
    results.sort((a, b) => a.author.localeCompare(b.author, 'fr'));
  } else if (sortBy === 'era') {
    const eraOrder = [
      'Antiquité', 'Antiquité tardive', 'Moyen Âge',
      'Renaissance', 'XVIIe siècle', 'XVIIIe siècle',
      'XIXe siècle', 'XXe siècle', 'XXIe siècle', 'Époque inconnue'
    ];
    results.sort((a, b) => eraOrder.indexOf(getEraLabel(a.era)) - eraOrder.indexOf(getEraLabel(b.era)));
  }

  // Mise à jour du compteur
  const count = results.length;
  document.getElementById('explorer-count').textContent =
    count === 0 ? 'Aucune citation trouvée' :
    count === 1 ? '1 citation' :
    `${count} citations`;

  // Rendu des cartes
  const container = document.getElementById('explorer-cards');
  if (!results.length) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        Aucune citation ne correspond à vos filtres.<br>Essayez d'en retirer quelques-uns.
      </div>`;
    return;
  }

  container.innerHTML = results.map(q => renderExplorerCard(q)).join('');
}

// ── Rendu d'une carte Explorer ────────────────────────────────────────────────
function renderExplorerCard(quote) {
  const vote  = getVote(state, quote.id);
  const score = displayScore(state, quote);
  const era   = getEraLabel(quote.era);
  const hasEn = !!quote.textEn;

  return `
    <article class="quote-card explorer-card" data-id="${quote.id}">
      <div class="explorer-card-meta-top">
        <span class="category-tag">${quote.cat}</span>
        <div style="display:flex;align-items:center;gap:6px">
          <span class="explorer-era-badge">${era}</span>
          ${hasEn ? `<button class="icon-btn lang-toggle" onclick="toggleLang(this)" data-fr="${encodeURIComponent(quote.text)}" data-en="${encodeURIComponent(quote.textEn)}" title="Voir en anglais" aria-label="Basculer la langue"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/></svg> <span class="lang-label">EN</span></button>` : ''}
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
            onclick="handleVoteExplorer(${quote.id}, 'up')"
            aria-label="J'aime (${score} votes)"
            aria-pressed="${vote === 'up'}"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>
            <span class="explorer-vote-score">${score}</span>
          </button>
          <button
            class="vote-btn${vote === 'down' ? ' voted-down' : ''}"
            onclick="handleVoteExplorer(${quote.id}, 'down')"
            aria-label="Je n'aime pas"
            aria-pressed="${vote === 'down'}"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/></svg>
          </button>
          <button
            class="icon-btn"
            onclick="openImageModal(${quote.id})"
            title="Créer une image"
            aria-label="Créer une image à partager"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </button>
        </div>
      </footer>
    </article>`;
}

// ── Vote dans l'Explorer : mise à jour en place sans re-render ────────────────
// Évite de perdre les filtres actifs et la position de scroll.
function handleVoteExplorer(quoteId, dir) {
  castVote(state, quoteId, dir);

  const vote  = getVote(state, quoteId);
  const quote = ALL_QUOTES.find(q => q.id === quoteId);
  const score = displayScore(state, quote);

  // Mettre à jour tous les articles qui affichent cette citation (Explorer + autres onglets)
  document.querySelectorAll(`[data-id="${quoteId}"]`).forEach(article => {
    const btns = article.querySelectorAll('.vote-btn');
    if (!btns.length) return;

    const upBtn   = btns[0];
    const downBtn = btns[1];

    // Couleurs
    upBtn.classList.toggle('voted-up',   vote === 'up');
    downBtn.classList.toggle('voted-down', vote === 'down');
    upBtn.classList.remove('voted-down');
    downBtn.classList.remove('voted-up');

    // Score — cherche d'abord le span dédié, sinon le nœud texte
    const scoreEl = upBtn.querySelector('.explorer-vote-score');
    if (scoreEl) {
      scoreEl.textContent = score;
    } else {
      const textNode = [...upBtn.childNodes].find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
      if (textNode) textNode.textContent = ` ${score}`;
    }

    // Animation pop
    [upBtn, downBtn].forEach(btn => {
      btn.classList.remove('pop');
      void btn.offsetWidth;
      btn.classList.add('pop');
      btn.addEventListener('animationend', () => btn.classList.remove('pop'), { once: true });
    });
  });

  // Met à jour les autres onglets (today, top, stats) en arrière-plan
  renderAll();
}

// ── Réinitialiser tous les filtres ───────────────────────────────────────────
function resetExplorerFilters() {
  explorerFilters.cats.clear();
  explorerFilters.authors.clear();
  explorerFilters.eras.clear();
  document.querySelectorAll('.filter-chip.active').forEach(el => el.classList.remove('active'));
  document.getElementById('explorer-search').value = '';
  handleExplorerFilter();
}

// ── Point d'entrée (appelé par showTab) ──────────────────────────────────────
function renderExplorer() {
  initExplorerChips();
  handleExplorerFilter();
}