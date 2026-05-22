// ── js/admin.js ──
// Panneau d'administration : publication de nouvelles citations.
// Protégé par mot de passe côté client (hash SHA-256).

// ⚠️ Ce hash correspond à ton mot de passe — ne partage jamais le mot de passe lui-même.
// Pour générer un nouveau hash : https://emn178.github.io/online-tools/sha256.html
const ADMIN_PASSWORD_HASH = '5ddac91c34cefae85d4734ebefd4412950bab0533f7ddcf21fb0fb0fb33b019e';

let _adminUnlocked = false;

// ── Vérification du mot de passe (async car SHA-256 est asynchrone) ───────────
async function checkAdminPassword() {
  const input   = document.getElementById('admin-password-input').value;
  const errorEl = document.getElementById('admin-password-error');

  // Hasher la saisie avec SHA-256 (API Web Crypto, native dans tous les navigateurs)
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(input)
  );
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex   = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  if (hashHex === ADMIN_PASSWORD_HASH) {
    _adminUnlocked = true;
    document.getElementById('admin-login-screen').setAttribute('hidden', '');
    document.getElementById('admin-dashboard').removeAttribute('hidden');
    _showLastDay();
  } else {
    errorEl.removeAttribute('hidden');
    errorEl.textContent = 'Mot de passe incorrect.';
    document.getElementById('admin-password-input').value = '';
  }
}

// ── Affiche le dernier jour utilisé dans data.js ──────────────────────────────
function _showLastDay() {
  const lastDay = Math.max(...ALL_QUOTES.map(q => q.day));
  const lastId  = Math.max(...ALL_QUOTES.map(q => q.id));
  document.getElementById('admin-last-day').textContent =
    `jour ${lastDay} · prochain ID : ${lastId + 1}`;
}

// ── Génération du bloc data.js ────────────────────────────────────────────────
function handleAdminPublish() {
  const text   = document.getElementById('admin-input-text').value.trim();
  const textEn = document.getElementById('admin-input-text-en').value.trim();
  const author = document.getElementById('admin-input-author').value.trim();
  const era    = document.getElementById('admin-input-era').value.trim();
  const cat    = document.getElementById('admin-input-cat').value;
  const day    = document.getElementById('admin-input-day').value;

  const errorEl = document.getElementById('admin-publish-error');

  // Validation
  if (!text)            return _showAdminError('Veuillez saisir le texte de la citation.');
  if (text.length < 10) return _showAdminError('La citation doit faire au moins 10 caractères.');
  if (!author)          return _showAdminError("Veuillez indiquer le nom de l'auteur.");
  if (!cat)             return _showAdminError('Veuillez choisir une catégorie.');
  if (day === '')       return _showAdminError('Veuillez indiquer le jour d\'affichage.');

  errorEl.setAttribute('hidden', '');

  const nextId  = Math.max(...ALL_QUOTES.map(q => q.id)) + 1;
  const dayNum  = parseInt(day, 10);

  // Génère le bloc formaté
  const lines = [`  {`];
  lines.push(`    id: ${nextId},`);
  lines.push(`    text: ${JSON.stringify(text)},`);
  if (textEn) lines.push(`    textEn: ${JSON.stringify(textEn)},`);
  lines.push(`    author: ${JSON.stringify(author)},`);
  if (era) lines.push(`    era: ${JSON.stringify(era)},`);
  lines.push(`    cat: ${JSON.stringify(cat)},`);
  lines.push(`    day: ${dayNum},`);
  lines.push(`  },`);

  const code = lines.join('\n');

  document.getElementById('admin-code-output').textContent = code;
  document.getElementById('admin-publish-form').setAttribute('hidden', '');
  document.getElementById('admin-publish-result').removeAttribute('hidden');
}

function _showAdminError(msg) {
  const el = document.getElementById('admin-publish-error');
  el.textContent = msg;
  el.removeAttribute('hidden');
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Copier le code ────────────────────────────────────────────────────────────
function adminCopyCode() {
  const code = document.getElementById('admin-code-output').textContent;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('admin-copy-btn');
    btn.textContent = '✓ Copié !';
    setTimeout(() => btn.textContent = 'Copier', 2000);
  }).catch(() => {
    showToast('Impossible de copier automatiquement.');
  });
}

// ── Réinitialiser ─────────────────────────────────────────────────────────────
function resetAdminPublishForm() {
  document.getElementById('admin-input-text').value    = '';
  document.getElementById('admin-input-text-en').value = '';
  document.getElementById('admin-input-author').value  = '';
  document.getElementById('admin-input-era').value     = '';
  document.getElementById('admin-input-cat').value     = '';
  document.getElementById('admin-input-day').value     = '';
  document.getElementById('admin-char-count').textContent = '0';
  document.getElementById('admin-publish-error').setAttribute('hidden', '');
  document.getElementById('admin-publish-result').setAttribute('hidden', '');
  document.getElementById('admin-publish-form').removeAttribute('hidden');
  _showLastDay();
}

// ── Déconnexion ───────────────────────────────────────────────────────────────
function adminLogout() {
  _adminUnlocked = false;
  resetAdminPublishForm();
  document.getElementById('admin-dashboard').setAttribute('hidden', '');
  document.getElementById('admin-login-screen').removeAttribute('hidden');
  document.getElementById('admin-password-input').value = '';
  document.getElementById('admin-password-error').setAttribute('hidden', '');
  showTab('today');
}

// ── Point d'entrée ────────────────────────────────────────────────────────────
function renderAdminPanel() {
  if (!_adminUnlocked) {
    document.getElementById('admin-login-screen').removeAttribute('hidden');
    document.getElementById('admin-dashboard').setAttribute('hidden', '');
  }
}

// Soumettre avec Entrée sur le champ mot de passe
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.activeElement?.id === 'admin-password-input') {
    checkAdminPassword();
  }
});
