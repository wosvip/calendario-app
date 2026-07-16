const CACHE_NAME = "calendario-wosvip-v3";
const ARQUIVOS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icone.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ARQUIVOS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(chaves =>
      Promise.all(
        chaves
          .filter(chave => chave !== CACHE_NAME)
          .map(chave => caches.delete(chave))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if(event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(resposta => {
      return resposta || fetch(event.request).then(rede => {
        const copia = rede.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copia));
        return rede;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
