// ── js/admin.js ──
// Panneau d'administration : publication de nouvelles citations + modération des soumissions.
// Protégé par mot de passe côté client (hash SHA-256).

const ADMIN_PASSWORD_HASH = '5ddac91c34cefae85d4734ebefd4412950bab0533f7ddcf21fb0fb0fb33b019e';

let _adminUnlocked = false;

// ── Vérification du mot de passe ─────────────────────────────────────────────
async function checkAdminPassword() {
  const input   = document.getElementById('admin-password-input').value;
  const errorEl = document.getElementById('admin-password-error');

  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  if (hashHex === ADMIN_PASSWORD_HASH) {
    _adminUnlocked = true;
    document.getElementById('admin-login-screen').setAttribute('hidden', '');
    document.getElementById('admin-dashboard').removeAttribute('hidden');
    _refreshAdminInfo();
    loadPendingQuotes();
  } else {
    errorEl.removeAttribute('hidden');
    errorEl.textContent = 'Mot de passe incorrect.';
    document.getElementById('admin-password-input').value = '';
  }
}

// ── Infos courantes ───────────────────────────────────────────────────────────
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


// ════════════════════════════════════════════════════════════════════════════
//  SECTION "CITATIONS EN ATTENTE"
// ════════════════════════════════════════════════════════════════════════════

let _pendingQuotes = [];

async function loadPendingQuotes() {
  const container = document.getElementById('pending-list');
  container.innerHTML = '<p style="color:var(--text-secondary);font-size:14px">Chargement…</p>';

  const { data, error } = await sbClient
    .from('pending_quotes')
    .select('*')
    .eq('status', 'en_attente')
    .order('submitted_at', { ascending: true });

  if (error) {
    container.innerHTML = `<p style="color:var(--danger);font-size:14px">Erreur : ${error.message}</p>`;
    return;
  }

  _pendingQuotes = data || [];
  _renderPendingList();
  _updatePendingBadge();
}

function _updatePendingBadge() {
  const badge = document.getElementById('pending-badge');
  if (!badge) return;
  const count = _pendingQuotes.length;
  badge.textContent = count > 0 ? count : '';
  badge.style.display = count > 0 ? 'inline-flex' : 'none';
}

function _renderPendingList() {
  const container = document.getElementById('pending-list');

  if (_pendingQuotes.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:2rem;color:var(--text-secondary)">
        <div style="font-size:32px;margin-bottom:.5rem">✅</div>
        <p style="font-size:14px">Aucune citation en attente.</p>
      </div>`;
    return;
  }

  container.innerHTML = _pendingQuotes.map(q => `
    <div class="pending-card" id="pending-card-${q.id}" data-id="${q.id}">

      <!-- Vue lecture -->
      <div id="pending-view-${q.id}">
        <div class="pending-meta">
          <span class="pending-badge-cat">${q.cat}</span>
          <span class="pending-date">${new Date(q.submitted_at).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })}</span>
        </div>
        <blockquote class="pending-text">"${_esc(q.text)}"</blockquote>
        <p class="pending-author">— ${_esc(q.author)}${q.era ? ` <span class="pending-era">(${_esc(q.era)})</span>` : ''}</p>
        <div class="pending-actions">
          <button class="btn-validate" onclick="validatePending(${q.id})">
            ✅ Valider &amp; publier
          </button>
          <button class="btn-edit" onclick="editPending(${q.id})">
            ✏️ Modifier
          </button>
          <button class="btn-reject" onclick="rejectPending(${q.id})">
            ✖ Rejeter
          </button>
        </div>
      </div>

      <!-- Vue édition (cachée par défaut) -->
      <div id="pending-edit-${q.id}" hidden>
        <p style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:.75rem;text-transform:uppercase;letter-spacing:.05em">Modifier la citation</p>

        <div class="field-group" style="margin-bottom:.75rem">
          <label class="field-label" style="font-size:13px">Citation</label>
          <textarea id="edit-text-${q.id}" class="field-input field-textarea" rows="3" maxlength="400">${_esc(q.text)}</textarea>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:.75rem">
          <div class="field-group">
            <label class="field-label" style="font-size:13px">Auteur</label>
            <input id="edit-author-${q.id}" class="field-input" type="text" value="${_esc(q.author)}" />
          </div>
          <div class="field-group">
            <label class="field-label" style="font-size:13px">Époque / titre</label>
            <input id="edit-era-${q.id}" class="field-input" type="text" value="${_esc(q.era || '')}" />
          </div>
        </div>
        <div class="field-group" style="margin-bottom:1rem">
          <label class="field-label" style="font-size:13px">Catégorie</label>
          <select id="edit-cat-${q.id}" class="field-input field-select">
            ${['Courage','Sagesse','Motivation','Amour','Bonheur','Succès','Résilience','Créativité','Leadership','Paix intérieure','Humanité','Temps','Philosophie','Humour','Autre']
              .map(c => `<option value="${c}"${c === q.cat ? ' selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="pending-actions">
          <button class="btn-validate" onclick="saveAndPublish(${q.id})">
            ✅ Enregistrer &amp; publier
          </button>
          <button class="btn-edit" onclick="cancelEdit(${q.id})">
            ✖ Annuler
          </button>
        </div>
      </div>

    </div>
  `).join('');
}

function _esc(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function editPending(id) {
  document.getElementById(`pending-view-${id}`).setAttribute('hidden', '');
  document.getElementById(`pending-edit-${id}`).removeAttribute('hidden');
}

function cancelEdit(id) {
  document.getElementById(`pending-edit-${id}`).setAttribute('hidden', '');
  document.getElementById(`pending-view-${id}`).removeAttribute('hidden');
}

async function validatePending(id) {
  const q = _pendingQuotes.find(p => p.id === id);
  if (!q) return;
  await _publishPending(q, q.text, q.author, q.era, q.cat);
}

async function saveAndPublish(id) {
  const text   = document.getElementById(`edit-text-${id}`).value.trim();
  const author = document.getElementById(`edit-author-${id}`).value.trim();
  const era    = document.getElementById(`edit-era-${id}`).value.trim();
  const cat    = document.getElementById(`edit-cat-${id}`).value;

  if (!text || text.length < 10) return showToast('La citation doit faire au moins 10 caractères.');
  if (!author)                    return showToast("Veuillez indiquer le nom de l'auteur.");
  if (!cat)                       return showToast('Veuillez choisir une catégorie.');

  await sbClient.from('pending_quotes').update({ text, author, era: era || null, cat }).eq('id', id);
  await _publishPending({ id }, text, author, era, cat);
}

async function _publishPending(q, text, author, era, cat) {
  const { data: last } = await sbClient
    .from('published_quotes')
    .select('id, day')
    .order('id', { ascending: false })
    .limit(1)
    .single();

  const nextId  = last ? last.id + 1 : 1;
  const nextDay = last ? last.day + 1 : 1;

  const { error: insertErr } = await sbClient
    .from('published_quotes')
    .insert({ id: nextId, text, author, era: era || null, cat, day: nextDay });

  if (insertErr) {
    showToast(`Erreur publication : ${insertErr.message}`);
    return;
  }

  await sbClient.from('pending_quotes').update({ status: 'publiee' }).eq('id', q.id);

  _pendingQuotes = _pendingQuotes.filter(p => p.id !== q.id);
  _renderPendingList();
  _updatePendingBadge();
  _refreshAdminInfo();

  showToast(`✅ Citation publiée (ID #${nextId}, Jour ${nextDay})`);

  if (typeof loadQuotes === 'function') loadQuotes().then(() => renderAll());
}

async function rejectPending(id) {
  showConfirmModal(
    'Rejeter cette citation ?',
    "Elle sera marquée comme rejetée et disparaîtra de la file d'attente.",
    async () => {
      const { error } = await sbClient
        .from('pending_quotes')
        .update({ status: 'rejetee' })
        .eq('id', id);

      if (error) { showToast(`Erreur : ${error.message}`); return; }

      _pendingQuotes = _pendingQuotes.filter(p => p.id !== id);
      _renderPendingList();
      _updatePendingBadge();
      showToast('Citation rejetée.');
    }
  );
}


// ════════════════════════════════════════════════════════════════════════════
//  PUBLICATION MANUELLE (formulaire existant)
// ════════════════════════════════════════════════════════════════════════════

async function handleAdminPublish() {
  const text   = document.getElementById('admin-input-text').value.trim();
  const textEn = document.getElementById('admin-input-text-en').value.trim();
  const author = document.getElementById('admin-input-author').value.trim();
  const era    = document.getElementById('admin-input-era').value.trim();
  const cat    = document.getElementById('admin-input-cat').value;
  const day    = document.getElementById('admin-input-day').value;

  if (!text)            return _showAdminError('Veuillez saisir le texte de la citation.');
  if (text.length < 10) return _showAdminError('La citation doit faire au moins 10 caractères.');
  if (!author)          return _showAdminError("Veuillez indiquer le nom de l'auteur.");
  if (!cat)             return _showAdminError('Veuillez choisir une catégorie.');
  if (day === '')       return _showAdminError("Veuillez indiquer le jour d'affichage.");

  document.getElementById('admin-publish-error').setAttribute('hidden', '');

  const { data: last } = await sbClient
    .from('published_quotes')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .single();

  const nextId = last ? last.id + 1 : 1;

  const row = { id: nextId, text, author, era: era || null, cat, day: parseInt(day, 10) };
  if (textEn) row.text_en = textEn;

  _setPublishBtnLoading(true);

  const { error } = await sbClient.from('published_quotes').insert(row);

  _setPublishBtnLoading(false);

  if (error) { _showAdminError(`Erreur Supabase : ${error.message}`); return; }

  document.getElementById('admin-publish-form').setAttribute('hidden', '');
  document.getElementById('admin-publish-result').removeAttribute('hidden');

  document.getElementById('admin-code-output').textContent =
    `✅ Citation #${nextId} publiée avec succès !\n\n` +
    `Auteur : ${author}\nCatégorie : ${cat}\nJour : ${day}\n` +
    (textEn ? `Traduction EN : ${textEn.slice(0, 60)}…\n` : '') +
    `\nElle apparaîtra sur le site dès le prochain rechargement.`;

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

async function adminDeleteQuote(id) {
  showConfirmModal(
    'Supprimer cette citation ?',
    `La citation #${id} sera définitivement supprimée de Supabase.`,
    async () => {
      const { error } = await sbClient.from('published_quotes').delete().eq('id', id);
      if (error) { showToast(`Erreur : ${error.message}`); return; }
      showToast(`Citation #${id} supprimée.`);
      if (typeof loadQuotes === 'function') loadQuotes().then(() => renderAll());
      _refreshAdminInfo();
    }
  );
}

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

function adminLogout() {
  _adminUnlocked = false;
  resetAdminPublishForm();
  document.getElementById('admin-dashboard').setAttribute('hidden', '');
  document.getElementById('admin-login-screen').removeAttribute('hidden');
  document.getElementById('admin-password-input').value = '';
  document.getElementById('admin-password-error').setAttribute('hidden', '');
  showTab('today');
}

function renderAdminPanel() {
  if (!_adminUnlocked) {
    document.getElementById('admin-login-screen').removeAttribute('hidden');
    document.getElementById('admin-dashboard').setAttribute('hidden', '');
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.activeElement?.id === 'admin-password-input') {
    checkAdminPassword();
  }
});
