const STATIC_CACHE = "static-cache-v1";
const RUNTIME_CACHE = "runtime-cache";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/dist/bundle.js",
  "/db.js",
  "/service-worker.js",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/style.css",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", function (event) {
  const current = [STATIC_CACHE, RUNTIME_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return cacheNames.filter((cacheName) => !current.includes(cacheName));
      })
      .then((deletedCaches) => {
        return Promise.all(
          deletedCaches.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", function (event) {
  if (
    event.request.method !== "GET" ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (event.request.url.includes("/api/transaction")) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => caches.match(event.request));
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((responseFromCache) => {
      if (responseFromCache) {
        return responseFromCache;
      }

      return caches.open(RUNTIME_CACHE).then((cache) => {
        return fetch(event.request).then((response) => {
          return cache.put(event.request, response.clone()).then(() => {
            return response;
          });
        });
      });
    })
  );
});
