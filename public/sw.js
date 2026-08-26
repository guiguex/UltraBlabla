// UltraBlabla Service Worker - Next-Gen 2028 (Stale-While-Revalidate)
const VERSION = 'ultrablabla-v7-dmr-cuda-live';
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

  // Bypass API calls entirely and non-GET requests
  if (req.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return;
  }

  // Bypass Cloudflare-injected beacons (RUM/analytics POST no-cors)
  if (url.pathname.startsWith('/cdn-cgi/')) {
    return;
  }

  // Bypass external domains (like Cloudflare Insights, Analytics, etc.)
  if (url.origin !== location.origin) {
    return;
  }

  e.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(req);
    
    const fetchPromise = fetch(req).then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(req, networkResponse.clone());
      }
      return networkResponse;
    }).catch(() => {
      if (req.mode === 'navigate') {
        return cache.match('/index.html');
      }
      return Response.error();
    });

    return cachedResponse || fetchPromise;
  })());
});
