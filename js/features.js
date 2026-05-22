// ── js/features.js ──
// Fonctionnalités transversales :
//   • Partage de citation (Web Share API + fallback clipboard)
//   • Toggle langue FR ↔ EN
//   • Panneau auteur (bio + toutes ses citations)
//   • Modale de confirmation générique

// ─────────────────────────────────────────────────────────────────────────────
// PARTAGE
// ─────────────────────────────────────────────────────────────────────────────
function shareQuote(quoteId) {
  const quote = ALL_QUOTES.find(q => q.id === quoteId);
  if (!quote) return;

  const text = `"${quote.text}" — ${quote.author}`;

  if (navigator.share) {
    navigator.share({ title: 'Les mots qui comptent', text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Citation copiée dans le presse-papier !');
    }).catch(() => {
      showToast('Impossible de copier automatiquement.');
    });
  }
}

// Toast léger
function showToast(message) {
  const existing = document.getElementById('share-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'share-toast';
  toast.className = 'share-toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ─────────────────────────────────────────────────────────────────────────────
// TOGGLE LANGUE FR ↔ EN
// ─────────────────────────────────────────────────────────────────────────────
function toggleLang(btn) {
  const card     = btn.closest('.quote-card, .explorer-card, .surprise-modal-inner, .ap-quote-item, .top-card-body');
  const textEl   = card.querySelector('[data-quote-text]');
  const label    = btn.querySelector('.lang-label');
  const isEnMode = label.textContent === 'FR';

  if (isEnMode) {
    textEl.textContent = decodeURIComponent(btn.dataset.fr);
    label.textContent  = 'EN';
    btn.title          = 'Voir en anglais';
    btn.classList.remove('lang-active');
  } else {
    textEl.textContent = decodeURIComponent(btn.dataset.en);
    label.textContent  = 'FR';
    btn.title          = 'Voir en français';
    btn.classList.add('lang-active');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POPOVER AUTEUR — carte compacte ancrée sur le bouton cliqué
// ─────────────────────────────────────────────────────────────────────────────
let _authorPopoverOpen = false;

function openAuthorPanel(authorName, triggerEl) {
  closeAuthorPanel(); // ferme tout popover déjà ouvert

  const bio    = (AUTHOR_BIOS && AUTHOR_BIOS[authorName]) || null;
  const quotes = ALL_QUOTES.filter(q => q.author === authorName);
  const initials = authorName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  // Injecter le popover dans le DOM
  const pop = document.createElement('div');
  pop.id        = 'author-popover';
  pop.className = 'author-popover';
  pop.setAttribute('role', 'dialog');
  pop.setAttribute('aria-label', `Biographie de ${authorName}`);
  pop.innerHTML = `
    <div class="apop-arrow"></div>
    <div class="apop-inner">
      <div class="apop-header">
        <div class="apop-avatar">${initials}</div>
        <div class="apop-info">
          <p class="apop-name">${authorName}</p>
          ${bio ? `<p class="apop-years">${bio.years}</p>` : `<p class="apop-years">${quotes[0]?.era || ''}</p>`}
        </div>
        <button class="apop-close" onclick="closeAuthorPanel()" aria-label="Fermer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      ${bio
        ? `<p class="apop-bio">${bio.bio}</p>`
        : `<p class="apop-bio apop-bio--unknown">Aucune biographie disponible pour cet auteur.</p>`
      }
      <div class="apop-footer">
        <span class="apop-count">${quotes.length} citation${quotes.length > 1 ? 's' : ''} dans l'app</span>
      </div>
    </div>`;

  document.body.appendChild(pop);
  _authorPopoverOpen = true;

  // ── Positionnement intelligent ────────────────────────────────────────────
  // On essaie de placer le popover sous l'élément déclencheur,
  // en le recadrant si ça déborde de l'écran.
  function positionPopover() {
    const anchor = (triggerEl instanceof Element) ? triggerEl : null;
    const popW   = pop.offsetWidth  || 320;
    const popH   = pop.offsetHeight || 180;
    const vw     = window.innerWidth;
    const vh     = window.innerHeight;

    if (anchor) {
      const rect = anchor.getBoundingClientRect();
      let top  = rect.bottom + window.scrollY + 8;
      let left = rect.left   + window.scrollX - 12;

      // Débordement droite
      if (left + popW > vw - 12) left = vw - popW - 12;
      // Débordement gauche
      if (left < 12) left = 12;
      // Débordement bas → placer au-dessus
      if (rect.bottom + popH + 16 > vh) {
        top = rect.top + window.scrollY - popH - 8;
        pop.classList.add('apop--above');
      }

      pop.style.top  = `${top}px`;
      pop.style.left = `${left}px`;
    } else {
      // Centré en fallback
      pop.style.top  = `${(vh - popH) / 2 + window.scrollY}px`;
      pop.style.left = `${(vw - popW) / 2}px`;
    }
  }

  // Premier positionnement après rendu
  requestAnimationFrame(() => {
    positionPopover();
    pop.classList.add('apop--visible');
  });

  // Fermer en cliquant dehors
  setTimeout(() => {
    document.addEventListener('click', _outsideClickHandler, { capture: true });
  }, 50);
}

function _outsideClickHandler(e) {
  const pop = document.getElementById('author-popover');
  if (pop && !pop.contains(e.target)) {
    closeAuthorPanel();
  }
}

function closeAuthorPanel() {
  const pop = document.getElementById('author-popover');
  if (!pop) return;
  pop.classList.remove('apop--visible');
  document.removeEventListener('click', _outsideClickHandler, { capture: true });
  setTimeout(() => { pop.remove(); _authorPopoverOpen = false; }, 200);
}

// Fermer avec Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeAuthorPanel();
});

// ─────────────────────────────────────────────────────────────────────────────
// MODALE DE CONFIRMATION GÉNÉRIQUE
// ─────────────────────────────────────────────────────────────────────────────
let _confirmCallback = null;

function showConfirmModal(title, message, onConfirm) {
  _confirmCallback = onConfirm;
  document.getElementById('confirm-title').textContent   = title;
  document.getElementById('confirm-message').textContent = message;
  const modal   = document.getElementById('confirm-modal');
  const overlay = document.getElementById('confirm-overlay');
  modal.removeAttribute('hidden');
  overlay.removeAttribute('hidden');
  requestAnimationFrame(() => {
    modal.classList.add('open');
    overlay.classList.add('visible');
  });
}

function closeConfirmModal() {
  const modal   = document.getElementById('confirm-modal');
  const overlay = document.getElementById('confirm-overlay');
  modal.classList.remove('open');
  overlay.classList.remove('visible');
  setTimeout(() => {
    modal.setAttribute('hidden', '');
    overlay.setAttribute('hidden', '');
    _confirmCallback = null;
  }, 250);
}

function confirmAction() {
  if (_confirmCallback) _confirmCallback();
  closeConfirmModal();
}