// ── js/submit.js ──
// Gestion de la page "Soumettre une citation" — envoi par email via Formspree.

const FORMSPREE_URL = 'https://formspree.io/f/mzdweaon';

function validateSubmit(text, author, cat) {
  if (!text.trim())            return 'Veuillez saisir le texte de la citation.';
  if (text.trim().length < 10) return 'La citation doit faire au moins 10 caractères.';
  if (!author.trim())          return "Veuillez indiquer le nom de l'auteur.";
  if (!cat)                    return 'Veuillez choisir une catégorie.';
  return null;
}

document.getElementById('input-text').addEventListener('input', function () {
  document.getElementById('char-count').textContent = this.value.length;
});

async function handleSubmit() {
  const text   = document.getElementById('input-text').value;
  const author = document.getElementById('input-author').value;
  const era    = document.getElementById('input-era').value.trim();
  const cat    = document.getElementById('input-cat').value;

  const error   = validateSubmit(text, author, cat);
  const errorEl = document.getElementById('submit-error');

  if (error) {
    errorEl.textContent = error;
    errorEl.removeAttribute('hidden');
    errorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }

  errorEl.setAttribute('hidden', '');

  // Affichage immédiat du succès
  document.getElementById('submit-form').setAttribute('hidden', '');
  document.getElementById('submit-success').removeAttribute('hidden');

  // Envoi à Formspree en arrière-plan
  fetch(FORMSPREE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      citation:  text.trim(),
      auteur:    author.trim(),
      epoque:    era || '—',
      categorie: cat,
    }),
  }).catch(err => console.warn('Erreur Formspree :', err));
}

function resetSubmitForm() {
  document.getElementById('input-text').value   = '';
  document.getElementById('input-author').value = '';
  document.getElementById('input-era').value    = '';
  document.getElementById('input-cat').value    = '';
  document.getElementById('char-count').textContent = '0';
  document.getElementById('submit-error').setAttribute('hidden', '');
  document.getElementById('submit-success').setAttribute('hidden', '');
  document.getElementById('submit-form').removeAttribute('hidden');
}

// renderSubmissions n'est plus utilisé (section supprimée)