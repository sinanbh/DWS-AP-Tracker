const CACHE_NAME = 'event-tracker-v5';

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
  './icons/items/hero_shards.png',
  './icons/chips/advanced_chip_material.png',
  './icons/chips/orange_chip_chest.png',
  './icons/chips/purple_chip_chest.png',
  './icons/chips/blue_chip_chest.png',
  './icons/chips/green_chip_chest.png',
  './icons/chips/orange_chip_choice_chest.png'
];

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
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

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
