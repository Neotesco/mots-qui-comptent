// ── js/auth.js ──
// Gestion de l'authentification Supabase (email)

let _currentUser = null;

// ── Init : récupère la session au chargement ──────────────────────────────────
async function initAuth() {
  const { data: { session } } = await sbClient.auth.getSession();
  _currentUser = session?.user || null;
  _updateAuthUI();

  // Écoute les changements de session
  sbClient.auth.onAuthStateChange((_event, session) => {
    _currentUser = session?.user || null;
    _updateAuthUI();

    // Recharger les votes avec le bon user_key (uid ou anonyme)
    if (typeof state !== 'undefined') {
      state.votes = {};
      loadVotesFromSupabase(state).then(() => {
        loadGlobalScores().then(() => renderAll());
      });
    }
  });
}

// ── Récupère l'utilisateur courant ────────────────────────────────────────────
function getCurrentUser() {
  return _currentUser;
}

// ── Mise à jour de l'UI selon l'état de connexion ────────────────────────────
function _updateAuthUI() {
  const btnAuth = document.getElementById('btn-auth');
  const label = document.getElementById('btn-auth-label');

  if (!btnAuth || !label) return;

  if (_currentUser) {
    label.textContent = 'Mon compte';
    btnAuth.title = _currentUser.email;

    // Style connecté
    btnAuth.style.background = 'rgba(124, 58, 237, 0.12)';
    btnAuth.style.color = 'var(--accent)';
  } else {
    label.textContent = 'Mon compte';
    btnAuth.title = 'Se connecter';

    // Style normal
    btnAuth.style.background = '';
    btnAuth.style.color = '';
  }
}

// ── Inscription ───────────────────────────────────────────────────────────────
async function handleSignUp() {
  const email    = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const errorEl  = document.getElementById('auth-error');
  const successEl = document.getElementById('auth-success');

  errorEl.setAttribute('hidden', '');
  successEl.setAttribute('hidden', '');

  if (!email)             return _showAuthError('Veuillez saisir votre email.');
  if (password.length < 6) return _showAuthError('Le mot de passe doit faire au moins 6 caractères.');

  _setAuthLoading(true);

  const { error } = await sbClient.auth.signUp({ email, password });

  _setAuthLoading(false);

  if (error) return _showAuthError(error.message);

  successEl.textContent = '✅ Compte créé ! Vérifiez votre email pour confirmer.';
  successEl.removeAttribute('hidden');
}

// ── Connexion ─────────────────────────────────────────────────────────────────
async function handleSignIn() {
  const email    = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const errorEl  = document.getElementById('auth-error');

  errorEl.setAttribute('hidden', '');

  if (!email)    return _showAuthError('Veuillez saisir votre email.');
  if (!password) return _showAuthError('Veuillez saisir votre mot de passe.');

  _setAuthLoading(true);

  const { error } = await sbClient.auth.signInWithPassword({ email, password });

  _setAuthLoading(false);

  if (error) return _showAuthError('Email ou mot de passe incorrect.');

  // Succès : ferme l'onglet et va sur aujourd'hui
  showTab('today');
  showToast('✅ Connecté avec succès !');
}

// ── Déconnexion ───────────────────────────────────────────────────────────────
async function handleSignOut() {
  await sbClient.auth.signOut();
  _currentUser = null;
  _updateAuthUI();

  // Recharger les votes avec la clé anonyme
  if (typeof state !== 'undefined') {
    state.votes = {};
    loadVotesFromSupabase(state).then(() => {
      loadGlobalScores().then(() => renderAll());
    });
  }

  showTab('today');
  showToast('Déconnecté.');
}

// ── Mot de passe oublié ───────────────────────────────────────────────────────
async function handleForgotPassword() {
  const email = document.getElementById('auth-email').value.trim();
  if (!email) return _showAuthError('Saisissez votre email pour réinitialiser le mot de passe.');

  const { error } = await sbClient.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://mots-qui-comptent.pages.dev',
  });

  if (error) return _showAuthError(error.message);

  showToast('📧 Email de réinitialisation envoyé !');
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function _showAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = msg;
  el.removeAttribute('hidden');
}

function _setAuthLoading(loading) {
  const btnIn  = document.getElementById('auth-btn-signin');
  const btnUp  = document.getElementById('auth-btn-signup');
  if (btnIn) btnIn.disabled = loading;
  if (btnUp) btnUp.disabled = loading;
}

// ── Basculer entre connexion et inscription ───────────────────────────────────
function toggleAuthMode() {
  const signInSection = document.getElementById('auth-signin-section');
  const signUpSection = document.getElementById('auth-signup-section');
  const errorEl = document.getElementById('auth-error');
  const successEl = document.getElementById('auth-success');

  errorEl.setAttribute('hidden', '');
  successEl.setAttribute('hidden', '');
  document.getElementById('auth-email').value = '';
  document.getElementById('auth-password').value = '';

  if (signInSection.hasAttribute('hidden')) {
    signInSection.removeAttribute('hidden');
    signUpSection.setAttribute('hidden', '');
  } else {
    signInSection.setAttribute('hidden', '');
    signUpSection.removeAttribute('hidden');
  }
}

// ── Rendu de l'onglet auth ────────────────────────────────────────────────────
function renderAuthPanel() {
  const panel = document.getElementById('auth-user-panel');
  const formPanel = document.getElementById('auth-form-panel');

  if (_currentUser) {
    panel.removeAttribute('hidden');
    formPanel.setAttribute('hidden', '');
    document.getElementById('auth-user-email').textContent = _currentUser.email;
  } else {
    panel.setAttribute('hidden', '');
    formPanel.removeAttribute('hidden');
  }
}
