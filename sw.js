const CACHE_NAME = 'calendario-cache-v1';
const urlsToCache = [
    'index.html',
    // Adicione mais arquivos se precisar (ex: CSS/JS externos, mas aqui é tudo inline)
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});