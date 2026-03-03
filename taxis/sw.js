self.addEventListener('install', (e) => {
  console.log('TaxiGO SW: Instalado');
});

self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request));
});