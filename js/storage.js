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

// ── Clé utilisateur : uid si connecté, sinon clé anonyme ─────────────────────
function getUserKey() {
  // Si l'utilisateur est connecté via Supabase Auth, on utilise son uid
  if (typeof _currentUser !== 'undefined' && _currentUser?.id) {
    return _currentUser.id;
  }
  // Sinon, clé anonyme persistée en localStorage
  let key = localStorage.getItem('user_key');
  if (!key) {
    key = 'u_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('user_key', key);
  }
  return key;
}

// ── Votes via Supabase ────────────────────────────────────────────────────────

// Charger tous les votes du visiteur depuis Supabase au démarrage
async function loadVotesFromSupabase(state) {
  const userKey = getUserKey();

  const { data, error } = await sbClient
    .from('votes')
    .select('quote_id, value')
    .eq('user_key', userKey);

  if (error) {
    console.warn('Erreur chargement votes :', error.message);
    return;
  }

  // Réinitialiser le cache local et le remplir avec les votes Supabase
  state.votes = {};
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
  const prev    = getVote(state, id);
  const prevRaw = state.votes[id] || 0;
  let newValue;

  if (prev === dir) {
    newValue = 0; // annuler
  } else {
    newValue = dir === 'up' ? 1 : -1;
    if (prev === null) state.totalVotes += 1;
  }

  // Mise à jour cache local immédiate (UX réactive)
  state.votes[id] = newValue;
  saveState(state);

  // Mise à jour optimiste de _globalScores
  const delta = newValue - prevRaw;
  _globalScores[id] = (_globalScores[id] || 0) + delta;

  // Envoi à Supabase (upsert = insert ou update si déjà existant)
  const userKey = getUserKey();
  const { error } = await sbClient
    .from('votes')
    .upsert(
      { quote_id: id, user_key: userKey, value: newValue },
      { onConflict: 'quote_id,user_key' }
    );

  if (error) console.warn('Erreur vote Supabase :', error.message);
}

// ── Score global ──────────────────────────────────────────────────────────────
const _globalScores = {}; // { [quoteId]: score agrégé }

// Charge les scores depuis la vue SQL quote_scores (SUM côté serveur).
// Requête O(nb citations) au lieu de O(nb votes total) — beaucoup plus léger.
async function loadGlobalScores() {
  const { data, error } = await sbClient
    .from('quote_scores')
    .select('quote_id, score');

  if (error) {
    console.warn('Erreur chargement scores :', error.message);
    return;
  }

  // Réinitialiser puis remplir depuis les agrégats
  Object.keys(_globalScores).forEach(k => delete _globalScores[k]);

  (data || []).forEach(row => {
    _globalScores[row.quote_id] = row.score ?? 0;
  });
}

function displayScore(state, quote) {
  return _globalScores[quote.id] || 0;
}
