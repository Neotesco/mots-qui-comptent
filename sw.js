// ── sw.js — Service Worker ──
const CACHE_NAME = 'mots-qui-comptent-v2';

// Fichiers à mettre en cache pour le mode hors-ligne
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/reset.css',
  '/css/variables.css',
  '/css/layout.css',
  '/css/components.css',
  '/css/animations.css',
  '/js/supabase.js',
  '/js/storage.js',
  '/js/app.js',
  '/js/render.js',
  '/js/explorer.js',
  '/js/features.js',
  '/js/imagecard.js',
  '/js/surprise.js',
  '/js/submit.js',
  '/js/auth.js',
  '/js/admin.js',
  '/js/data.js',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// ── Installation : mise en cache des fichiers statiques ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ── Activation : suppression des anciens caches ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch : stratégie Network First pour l'API, Cache First pour les assets ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Requêtes Supabase → toujours depuis le réseau (données en temps réel)
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ data: [], error: 'Hors-ligne' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // Polices Google → cache first
  if (url.hostname.includes('fonts.')) {
    event.respondWith(
      caches.match(event.request).then(cached =>
        cached || fetch(event.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return res;
        })
      )
    );
    return;
  }

  // Assets statiques → cache first, réseau en fallback
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        return res;
      });
    })
  );
});
