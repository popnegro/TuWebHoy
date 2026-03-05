const CACHE_NAME = 'taxigo-v1';
const urlsToCache = [
  './',
  './index.html',
  './theme.min.css',
  './taxigo-icon.webp',
  './slide-02.webp'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});