// UltraBlabla Service Worker - Next-Gen 2028 (Stale-While-Revalidate)
const VERSION = 'ultrablabla-v2-nextgen';
const CACHE_NAME = `static-cache-${VERSION}`;
const DYNAMIC_CACHE_NAME = `dynamic-cache-${VERSION}`;

const STATIC_PATHS = [
  '/',
  '/index.html',
  '/style.css',
  '/responsive.css',
  '/ultra-effects.css',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/webapp.js',
  '/neural-effects.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(STATIC_PATHS);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
          return caches.delete(key);
        }
      })
    );
    await self.clients.claim();
  })());
});

// Stale-While-Revalidate for static assets
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // Bypass API calls entirely
  if (url.pathname.startsWith('/api/')) {
    return; // Let the browser handle it directly
  }

  e.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(req);
    
    const fetchPromise = fetch(req).then((networkResponse) => {
      // Put a copy in cache for next time
      if (networkResponse.ok) {
        cache.put(req, networkResponse.clone());
      }
      return networkResponse;
    }).catch(() => {
      // Fallback for offline navigation
      if (req.mode === 'navigate') {
        return cache.match('/index.html');
      }
      return null;
    });

    return cachedResponse || fetchPromise;
  })());
});
