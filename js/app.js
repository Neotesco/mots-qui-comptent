// ── js/app.js ──
// Point d'entrée de l'application.

// ── État global ───────────────────────────────────────────────────────────────
let state = loadState();
updateStreak(state);
saveState(state);

// ── Calcul du jour courant ────────────────────────────────────────────────────
function getTodayDayIndex() {
  const EPOCH    = new Date('2025-01-01T00:00:00');
  const now      = new Date();
  const diffDays = Math.floor((now - EPOCH) / (1000 * 60 * 60 * 24));
  return diffDays % TOTAL_DAYS;
}

function getTodayQuotes() {
  const idx = getTodayDayIndex();
  return ALL_QUOTES.filter(q => q.day === idx);
}

// ── Rendu des onglets ─────────────────────────────────────────────────────────
function renderToday() {
  const quotes    = getTodayQuotes();
  const container = document.getElementById('today-cards');

  if (!quotes.length) {
    container.innerHTML = renderEmpty('Aucune citation programmée pour aujourd\'hui.<br>Revenez demain !');
    return;
  }

  container.innerHTML = quotes
    .map((q, i) => renderQuoteCard(q, state, i === 0))
    .join('');
}

function renderTop() {
  const sorted = [...ALL_QUOTES].sort(
    (a, b) => displayScore(state, b) - displayScore(state, a)
  );

  document.getElementById('top-cards').innerHTML = sorted
    .map((q, i) => renderTopCard(q, i + 1, state))
    .join('');
}

function renderStats() {
  document.getElementById('s-votes').textContent  = state.totalVotes;
  document.getElementById('s-seen').textContent   = ALL_QUOTES.length;
  document.getElementById('s-streak').textContent = state.streak;

  const likedCats = ALL_QUOTES
    .filter(q => state.votes[q.id] === 1)
    .map(q => q.cat);

  if (likedCats.length) {
    const freq = likedCats.reduce((acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1; return acc;
    }, {});
    const fav = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
    document.getElementById('s-fav').textContent = fav;
  } else {
    document.getElementById('s-fav').textContent = '—';
  }

  const liked = ALL_QUOTES.filter(q => state.votes[q.id] === 1);
  const likedContainer = document.getElementById('liked-cards');

  if (liked.length) {
    likedContainer.innerHTML = liked.map(q => renderQuoteCard(q, state)).join('');
  } else {
    likedContainer.innerHTML = renderEmpty(
      'Votez pour vos citations préférées<br>et elles apparaîtront ici.'
    );
  }
}

function renderAll() {
  renderToday();
  renderTop();
  renderStats();
}

// ── Titres des onglets ────────────────────────────────────────────────────────
const TAB_TITLES = {
  today:    'Aujourd\'hui',
  top:      'Top classement',
  stats:    'Statistiques',
  explorer: 'Explorer',
  about:    'À propos',
  submit:   'Soumettre une citation',
  admin:    'Administration',
};

// ── Navigation par onglets ────────────────────────────────────────────────────
const TABS = ['today', 'top', 'stats', 'explorer', 'about', 'submit', 'admin'];

function showTab(name) {
  TABS.forEach(t => {
    const panel = document.getElementById(`tab-${t}`);
    const btn   = document.getElementById(`btn-${t}`);
    if (!panel) return;

    if (t === name) {
      panel.removeAttribute('hidden');
      if (btn) { btn.classList.add('active'); btn.setAttribute('aria-selected', 'true'); }
    } else {
      panel.setAttribute('hidden', '');
      if (btn) { btn.classList.remove('active'); btn.setAttribute('aria-selected', 'false'); }
    }
  });

  // ── Titre de l'onglet navigateur ──────────────────────────────────────────
  const label = TAB_TITLES[name] || '';
  document.title = label
    ? `${label} — Les mots qui comptent`
    : 'Les mots qui comptent';

  // Fermer la sidebar sur mobile après navigation
  if (typeof closeSidebar === 'function') closeSidebar();

  if (name === 'today')    renderToday();
  if (name === 'top')      renderTop();
  if (name === 'stats')    renderStats();
  if (name === 'explorer') renderExplorer();
  if (name === 'submit')   renderSubmissions();
  if (name === 'admin')    renderAdminPanel();
}

// ── Gestion du vote ───────────────────────────────────────────────────────────
function handleVote(quoteId, dir) {
  // castVote met à jour state.votes de façon synchrone avant l'envoi Supabase
  castVote(state, quoteId, dir).then(() => {
    // Une fois la réponse Supabase reçue, on recharge les scores globaux et on re-rend
    loadGlobalScores().then(() => renderAll());
  });

  // Animation immédiate sur les boutons
  document.querySelectorAll(`[data-id="${quoteId}"] .vote-btn`).forEach(btn => {
    btn.classList.remove('pop');
    void btn.offsetWidth;
    btn.classList.add('pop');
    btn.addEventListener('animationend', () => btn.classList.remove('pop'), { once: true });
  });

  // Rendu optimiste : state.votes est déjà mis à jour de façon synchrone dans castVote
  // On laisse la microtask queue se vider avant de re-rendre pour être sûr
  Promise.resolve().then(() => renderAll());
}

// ── Date affichée ─────────────────────────────────────────────────────────────
function setDisplayDates() {
  const now   = new Date();
  const opts  = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const full  = now.toLocaleDateString('fr-FR', opts);
  const short = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

  document.getElementById('today-date').textContent  = full;
  document.getElementById('today-label').textContent = short;
}

// ── Init async ────────────────────────────────────────────────────────────────
async function init() {
  setDisplayDates();
  renderAll(); // rendu immédiat avec cache local

  // Chargement async depuis Supabase
  await Promise.all([
    loadVotesFromSupabase(state),
    loadGlobalScores(),
  ]);

  renderAll(); // re-rendu avec données à jour
}

init();

// ── Polling Supabase — rafraîchissement automatique des scores ────────────────
// Toutes les 30 secondes, on recharge les scores globaux et on re-rend
// pour que les votes des autres visiteurs apparaissent sans recharger la page.
setInterval(() => {
  loadGlobalScores().then(() => renderAll());
}, 30000);

// ── Bouton remonter en haut ───────────────────────────────────────────────────
const _scrollBtn = document.getElementById('scroll-top-btn');
window.addEventListener('scroll', () => {
  _scrollBtn.classList.toggle('visible', window.scrollY > 300);
}, { passive: true });
