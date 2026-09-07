// UltraBlabla Service Worker - Next-Gen 2028 (Stale-While-Revalidate)
const VERSION = 'ultrablabla-v10-onnx-prefetch';
const CACHE_NAME = `static-cache-${VERSION}`;
const DYNAMIC_CACHE_NAME = `dynamic-cache-${VERSION}`;
const ONNX_CACHE_NAME = `onnx-cache-${VERSION}`;

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

// ONNX model + WASM files — pre-cached at install for low ttfa (served from R2 root)
const ONNX_PATHS = [
  'https://vad.guig.dev/silero_vad_v5.onnx',
  'https://vad.guig.dev/ort-wasm-simd-threaded.asyncify.wasm',
  'https://vad.guig.dev/ort-wasm-simd-threaded.asyncify.mjs',
  'https://vad.guig.dev/ort-wasm-simd-threaded.wasm',
  'https://vad.guig.dev/ort-wasm-simd-threaded.mjs',
  'https://vad.guig.dev/ort-wasm-simd-threaded.jsep.wasm',
  'https://vad.guig.dev/ort-wasm-simd-threaded.jsep.mjs',
  'https://vad.guig.dev/ort-wasm-simd-threaded.jspi.wasm',
  'https://vad.guig.dev/ort-wasm-simd-threaded.jspi.mjs',
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(
      STATIC_PATHS.map(path => cache.add(path).catch(err => console.warn('[SW] Cache miss:', path, err)))
    );

    // Pre-cache ONNX model + WASM for low ttfa
    const onnxCache = await caches.open(ONNX_CACHE_NAME);
    await Promise.allSettled(
      ONNX_PATHS.map(url => onnxCache.add(new Request(url, { mode: 'cors' })).catch(err => console.warn('[SW] ONNX cache miss:', url, err)))
    );

    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME && key !== ONNX_CACHE_NAME) {
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

  // Catch-all: same-origin static assets (stale-while-revalidate)
  if (url.origin === location.origin) {
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
    return;
  }

  // ONNX/WASM cross-origin: serve from pre-cache, fallback to network
  if (url.host === 'vad.guig.dev') {
    e.respondWith((async () => {
      const onnxCache = await caches.open(ONNX_CACHE_NAME);
      const cachedResponse = await onnxCache.match(req);
      if (cachedResponse) return cachedResponse;

      try {
        const networkResponse = await fetch(req);
        if (networkResponse.ok) {
          onnxCache.put(req, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        return Response.error();
      }
    })());
    return;
  }
});
