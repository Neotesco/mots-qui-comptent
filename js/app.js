// ── js/app.js ──
let state = loadState();
updateStreak(state);
saveState(state);

let ALL_QUOTES = [];
let TOTAL_DAYS = 0;

async function loadQuotes() {
  const { data, error } = await sbClient
    .from('published_quotes')
    .select('id, text, text_en, author, era, cat, day')
    .order('id', { ascending: true });

  if (error) {
    console.error('Erreur chargement citations :', error.message);
    return;
  }

  ALL_QUOTES = (data || []).map(q => ({ ...q, textEn: q.text_en }));
  TOTAL_DAYS = ALL_QUOTES.length
    ? Math.max(...ALL_QUOTES.map(q => q.day)) + 1
    : 1;
}

function getTodayDayIndex() {
  const EPOCH    = new Date('2025-01-01T00:00:00');
  const now      = new Date();
  const diffDays = Math.floor((now - EPOCH) / (1000 * 60 * 60 * 24));
  return diffDays % (TOTAL_DAYS || 1);
}

function getTodayQuotes() {
  const idx = getTodayDayIndex();
  return ALL_QUOTES.filter(q => q.day === idx);
}

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

const TAB_TITLES = {
  today:    'Aujourd\'hui',
  top:      'Top classement',
  stats:    'Statistiques',
  explorer: 'Explorer',
  about:    'À propos',
  submit:   'Soumettre une citation',
  auth:     'Mon compte',
  admin:    'Administration',
};

const TABS = ['today', 'top', 'stats', 'explorer', 'about', 'submit', 'auth', 'admin'];

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

  const label = TAB_TITLES[name] || '';
  document.title = label
    ? `${label} — Les mots qui comptent`
    : 'Les mots qui comptent';

  if (typeof closeSidebar === 'function') closeSidebar();

  if (name === 'today')    renderToday();
  if (name === 'top')      renderTop();
  if (name === 'stats')    renderStats();
  if (name === 'explorer') renderExplorer();
  if (name === 'auth')     renderAuthPanel();
  if (name === 'admin')    renderAdminPanel();
}

function handleVote(quoteId, dir) {
  castVote(state, quoteId, dir).then(() => {
    loadGlobalScores().then(() => renderAll());
  });

  document.querySelectorAll(`[data-id="${quoteId}"] .vote-btn`).forEach(btn => {
    btn.classList.remove('pop');
    void btn.offsetWidth;
    btn.classList.add('pop');
    btn.addEventListener('animationend', () => btn.classList.remove('pop'), { once: true });
  });

  Promise.resolve().then(() => renderAll());
}

function setDisplayDates() {
  const now   = new Date();
  const opts  = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const full  = now.toLocaleDateString('fr-FR', opts);
  const short = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

  document.getElementById('today-date').textContent  = full;
  document.getElementById('today-label').textContent = short;
}

async function init() {
  setDisplayDates();

  const skeleton = '<div class="empty-state" style="padding:2rem">Chargement…</div>';
  ['today-cards', 'top-cards'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = skeleton;
  });

  await Promise.all([
    loadQuotes(),
    loadVotesFromSupabase(state),
    loadGlobalScores(),
    initAuth(),
  ]);

  renderAll();
}

init();

function updateScoresSilently() {
  document.querySelectorAll('[data-id]').forEach(card => {
    const id    = parseInt(card.dataset.id);
    const quote = ALL_QUOTES.find(q => q.id === id);
    if (!quote) return;

    const score   = displayScore(state, quote);
    const upBtn   = card.querySelector('.vote-btn:first-child, .vote-btn');
    const topScore = card.querySelector('.top-score');

    if (upBtn && upBtn.childNodes.length) {
      const textNode = [...upBtn.childNodes].find(n => n.nodeType === 3);
      if (textNode) textNode.textContent = ' ' + score;
    }
    if (topScore) {
      const textNode = [...topScore.childNodes].find(n => n.nodeType === 3);
      if (textNode) textNode.textContent = ' ' + score + ' votes';
    }
  });
}

setInterval(() => {
  loadGlobalScores().then(() => updateScoresSilently());
}, 30000);

const _scrollBtn = document.getElementById('scroll-top-btn');
window.addEventListener('scroll', () => {
  _scrollBtn.classList.toggle('visible', window.scrollY > 300);
}, { passive: true });
