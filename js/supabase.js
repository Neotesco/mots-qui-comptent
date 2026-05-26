// ── js/supabase.js ──
const SUPABASE_URL = 'https://izswmkpkijkshicvhrhv.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_mTdGX2PCaORZnEoBzOp5rg_jA34zrGz';

// Client public (votes)
// On utilise "sbClient" pour éviter le conflit avec window.supabase exposé par le CDN
const sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const supabaseAdmin = sbClient;

function getUserKey() {
  let key = localStorage.getItem('user_key');
  if (!key) {
    key = 'u_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('user_key', key);
  }
  return key;
}
