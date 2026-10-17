// Bumping to v4 forces browsers to detect a Service Worker change
const CACHE_NAME = 'event-tracker-v4';

const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './storage.js',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/items/power_core.png',
  './icons/items/dx_blueprints.png',
  './icons/items/precision_parts.png',
  './icons/items/weapon_fragments.png',
  './icons/items/titanium_alloys.png',
  './icons/items/hero_shards.png'
];

// 1. Install & Cache Core Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        CORE_ASSETS.map((url) =>
          cache.add(url).catch((err) => console.log('Asset skipped during pre-cache:', url))
        )
      );
    })
  );
  self.skipWaiting();
});

// 2. Clean Up Old Cache Versions (v1, v2, v3) Immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// 3. Network-First for Navigation (HTML), Cache-First for Static Assets
self.addEventListener('fetch', (event) => {
  // If loading the web page itself (HTML / Navigation)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => caches.match('./index.html')) // Fallback to offline cache if no internet
    );
    return;
  }

  // For CSS, JS, and image assets: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
