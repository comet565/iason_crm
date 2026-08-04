const CACHE_NAME = 'tactical-crm-v3';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './car.html',
  './car-manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // 오프라인에서 페이지를 못 찾으면 해당 앱의 시작 화면으로 되돌린다.
          const fallback = event.request.url.includes('car') ? './car.html' : './index.html';
          return caches.match(fallback);
        })
      )
  );
});
