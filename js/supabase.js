// ── js/supabase.js ──
const SUPABASE_URL = 'https://izswmkpkijkshicvhrhv.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6c3dta3BraWprc2hpY3Zocmh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMDYzODcsImV4cCI6MjA5NDg4MjM4N30.BIabNBpDd262_NmWb04Op8zWFGYNjI2gdYVV9iNO-QU';

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
