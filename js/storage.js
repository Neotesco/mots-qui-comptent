// ── js/storage.js ──
// Gestion de la persistance : votes via Supabase, stats locales en localStorage.

const STORAGE_KEY = 'citations_app_v1';

// ── État local (streak, stats) ────────────────────────────────────────────────
function defaultState() {
  return {
    votes: {},        // cache local { [quoteId]: 1 | -1 | 0 }
    totalVotes: 0,
    firstVisit: new Date().toISOString().slice(0, 10),
    lastVisit:  new Date().toISOString().slice(0, 10),
    streak: 1,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return Object.assign(defaultState(), JSON.parse(raw));
  } catch {
    return defaultState();
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('localStorage indisponible :', e);
  }
}

function updateStreak(state) {
  const today = new Date().toISOString().slice(0, 10);
  if (state.lastVisit === today) return;
  const last = new Date(state.lastVisit);
  const diff = Math.round((new Date(today) - last) / 86400000);
  state.streak = diff === 1 ? (state.streak || 1) + 1 : 1;
  state.lastVisit = today;
}

// ── Votes via Supabase ────────────────────────────────────────────────────────

// Charger tous les votes du visiteur depuis Supabase au démarrage
async function loadVotesFromSupabase(state) {
  const userKey = getUserKey();
  const { data, error } = await supabase
    .from('votes')
    .select('quote_id, value')
    .eq('user_key', userKey);

  if (error) {
    console.warn('Erreur chargement votes :', error.message);
    return;
  }

  // Remplir le cache local
  (data || []).forEach(row => {
    state.votes[row.quote_id] = row.value;
  });
  saveState(state);
}

// Lire le vote d'une citation depuis le cache local
function getVote(state, id) {
  const v = state.votes[id];
  if (v === 1)  return 'up';
  if (v === -1) return 'down';
  return null;
}

// Enregistrer un vote (toggle si même direction) — local + Supabase
async function castVote(state, id, dir) {
  const prev  = getVote(state, id);
  const isNew = prev === null;
  let newValue;

  if (prev === dir) {
    newValue = 0; // annuler
  } else {
    newValue = dir === 'up' ? 1 : -1;
    if (isNew) state.totalVotes += 1;
  }

  // Mise à jour cache local immédiate (UX réactive)
  state.votes[id] = newValue;
  saveState(state);

  // Envoi à Supabase (upsert = insert ou update si déjà existant)
  const userKey = getUserKey();
  const { error } = await supabase
    .from('votes')
    .upsert(
      { quote_id: id, user_key: userKey, value: newValue },
      { onConflict: 'quote_id,user_key' }
    );

  if (error) console.warn('Erreur vote Supabase :', error.message);
}

// ── Score affiché ─────────────────────────────────────────────────────────────
// Score global = base pseudo-aléatoire + somme de tous les votes Supabase
// Pour simplifier, on garde le score de base + le vote local en cache.
// Les scores globaux sont chargés séparément via loadGlobalScores().

const _globalScores = {}; // { [quoteId]: totalVotes }

async function loadGlobalScores() {
  const { data, error } = await supabase
    .from('votes')
    .select('quote_id, value');

  if (error) {
    console.warn('Erreur chargement scores :', error.message);
    return;
  }

  // Réinitialiser
  Object.keys(_globalScores).forEach(k => delete _globalScores[k]);

  (data || []).forEach(row => {
    _globalScores[row.quote_id] = (_globalScores[row.quote_id] || 0) + row.value;
  });
}

function displayScore(state, quote) {
  const globalVote = _globalScores[quote.id] || 0;
  return globalVote;
}
