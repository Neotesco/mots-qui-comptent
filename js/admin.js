// ── js/admin.js ──
// Panneau d'administration : publication de nouvelles citations directement dans Supabase.
// Protégé par mot de passe côté client (hash SHA-256).

// ⚠️ Ce hash correspond à ton mot de passe — ne partage jamais le mot de passe lui-même.
// Pour générer un nouveau hash : https://emn178.github.io/online-tools/sha256.html
const ADMIN_PASSWORD_HASH = '5ddac91c34cefae85d4734ebefd4412950bab0533f7ddcf21fb0fb0fb33b019e';

let _adminUnlocked = false;

// ── Vérification du mot de passe ─────────────────────────────────────────────
async function checkAdminPassword() {
  const input   = document.getElementById('admin-password-input').value;
  const errorEl = document.getElementById('admin-password-error');

  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(input)
  );
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  if (hashHex === ADMIN_PASSWORD_HASH) {
    _adminUnlocked = true;
    document.getElementById('admin-login-screen').setAttribute('hidden', '');
    document.getElementById('admin-dashboard').removeAttribute('hidden');
    _refreshAdminInfo();
  } else {
    errorEl.removeAttribute('hidden');
    errorEl.textContent = 'Mot de passe incorrect.';
    document.getElementById('admin-password-input').value = '';
  }
}

// ── Infos courantes (dernier id/jour depuis Supabase) ─────────────────────────
async function _refreshAdminInfo() {
  const { data, error } = await sbClient
    .from('published_quotes')
    .select('id, day')
    .order('id', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    document.getElementById('admin-last-day').textContent = 'aucune citation publiée';
    return;
  }
  document.getElementById('admin-last-day').textContent =
    `jour ${data.day} · dernier ID : ${data.id} · prochain ID : ${data.id + 1}`;
}

// ── Publication directe dans Supabase ─────────────────────────────────────────
async function handleAdminPublish() {
  const text   = document.getElementById('admin-input-text').value.trim();
  const textEn = document.getElementById('admin-input-text-en').value.trim();
  const author = document.getElementById('admin-input-author').value.trim();
  const era    = document.getElementById('admin-input-era').value.trim();
  const cat    = document.getElementById('admin-input-cat').value;
  const day    = document.getElementById('admin-input-day').value;

  // Validation
  if (!text)            return _showAdminError('Veuillez saisir le texte de la citation.');
  if (text.length < 10) return _showAdminError('La citation doit faire au moins 10 caractères.');
  if (!author)          return _showAdminError("Veuillez indiquer le nom de l'auteur.");
  if (!cat)             return _showAdminError('Veuillez choisir une catégorie.');
  if (day === '')       return _showAdminError("Veuillez indiquer le jour d'affichage.");

  document.getElementById('admin-publish-error').setAttribute('hidden', '');

  // Récupère le prochain id
  const { data: last } = await sbClient
    .from('published_quotes')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .single();

  const nextId = last ? last.id + 1 : 1;

  // Construction de l'objet à insérer
  const row = {
    id:     nextId,
    text,
    author,
    era:    era || null,
    cat,
    day:    parseInt(day, 10),
  };
  if (textEn) row.text_en = textEn;

  // Affichage de l'état de chargement
  _setPublishBtnLoading(true);

  const { error } = await sbClient
    .from('published_quotes')
    .insert(row);

  _setPublishBtnLoading(false);

  if (error) {
    _showAdminError(`Erreur Supabase : ${error.message}`);
    return;
  }

  // Succès : afficher le résumé
  document.getElementById('admin-publish-form').setAttribute('hidden', '');
  document.getElementById('admin-publish-result').removeAttribute('hidden');

  // Affiche le bloc de confirmation avec les données insérées
  document.getElementById('admin-code-output').textContent =
    `✅ Citation #${nextId} publiée avec succès !\n\n` +
    `Auteur : ${author}\n` +
    `Catégorie : ${cat}\n` +
    `Jour : ${day}\n` +
    (textEn ? `Traduction EN : ${textEn.slice(0, 60)}…\n` : '') +
    `\nElle apparaîtra sur le site dès le prochain rechargement.`;

  // Recharge ALL_QUOTES en arrière-plan pour que la preview soit à jour
  if (typeof loadQuotes === 'function') loadQuotes().then(() => renderAll());
}

function _setPublishBtnLoading(loading) {
  const btn = document.querySelector('#admin-publish-form button[onclick="handleAdminPublish()"]');
  if (!btn) return;
  btn.disabled    = loading;
  btn.textContent = loading ? 'Publication…' : 'Publier dans Supabase';
}

function _showAdminError(msg) {
  const el = document.getElementById('admin-publish-error');
  el.textContent = msg;
  el.removeAttribute('hidden');
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Suppression d'une citation (optionnel) ────────────────────────────────────
async function adminDeleteQuote(id) {
  showConfirmModal(
    'Supprimer cette citation ?',
    `La citation #${id} sera définitivement supprimée de Supabase.`,
    async () => {
      const { error } = await sbClient
        .from('published_quotes')
        .delete()
        .eq('id', id);

      if (error) {
        showToast(`Erreur : ${error.message}`);
        return;
      }
      showToast(`Citation #${id} supprimée.`);
      if (typeof loadQuotes === 'function') loadQuotes().then(() => renderAll());
      _refreshAdminInfo();
    }
  );
}

// ── Réinitialiser le formulaire ───────────────────────────────────────────────
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
  _refreshAdminInfo();
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

// Soumettre avec Entrée
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.activeElement?.id === 'admin-password-input') {
    checkAdminPassword();
  }
});
