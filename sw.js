const CACHE_NAME = 'event-tracker-v2';
const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './storage.js',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/power_core.png',
  './icons/dx_blueprints.png',
  './icons/precision_parts.png',
  './icons/weapon_fragments.png',
  './icons/titanium_alloys.png',
  './icons/hero_shards.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Prevents 404s on unuploaded images from breaking PWA installation
      return Promise.all(
        CORE_ASSETS.map((url) =>
          cache.add(url).catch((err) => console.log('Asset skipped during pre-cache:', url))
        )
      );
    })
  );
  self.skipWaiting();
});

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

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
      );
    })
  );
});
