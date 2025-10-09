// UltraBlabla Service Worker
const VERSION = 'ultrablabla-v1';
const STATIC_PATHS = [
  'index.html',
  'style.css',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'js/hooks.umd.js',
  'js/preact.umd.js',
  'js/alpine.js',
  'js/webapp.js',
  'bootstrap.js'
];
const STATIC = STATIC_PATHS.map(p => new URL(p, self.registration.scope).toString());

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    // On pré-cache en filtrant les réponses non-cachables (Vary: *)
    for (const url of STATIC) {
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        const vary = res.headers.get('Vary') || '';
        if (!res.ok || vary.includes('*')) continue; // on ignore cet asset
        await cache.put(url, res);
      } catch (_) {
        // on ignore les erreurs d'un asset, on n'échoue pas toute l'installation
      }
    }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(n => n !== VERSION).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

// Navigation : réseau d'abord, fallback sur /index.html (si précaché), sinon erreur.
self.addEventListener('fetch', (e) => {
  const req = e.request;

  // Requêtes de navigation (clics, refresh)
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        return await fetch(req);
      } catch {
        const cache = await caches.open(VERSION);
        const fallback = await cache.match('/index.html');
        return fallback || Response.error();
      }
    })());
    return;
  }

  // Autres GET : cache d'abord, sinon réseau (simple & non invasif)
  if (req.method === 'GET' && !new URL(req.url).pathname.startsWith('/api/')) {
    e.respondWith(caches.match(req).then(r => r || fetch(req)));
  }
});
