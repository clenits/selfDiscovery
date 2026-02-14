const CACHE_NAME = "self-discovery-v3";
const APP_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./data/registry.json",
  "./data/i18n/registry.json",
  "./data/i18n/quizzes/hogwarts-house.json",
  "./data/i18n/quizzes/personality-4axis.json",
  "./data/i18n/quizzes/thinking-os.json",
  "./data/hogwarts-house.json",
  "./data/personality-4axis.json",
  "./data/thinking-os.json",
  "./js/lib/dom.js",
  "./js/lib/components.js",
  "./js/lib/i18n.js",
  "./js/lib/router.js",
  "./js/lib/meta.js",
  "./js/lib/storage.js",
  "./js/lib/quiz-localize.js",
  "./js/lib/quiz-validator.js",
  "./js/lib/quiz-loader.js",
  "./js/lib/quiz-engine.js",
  "./js/lib/share-card.js",
  "./js/views/home-view.js",
  "./js/views/tests-view.js",
  "./js/views/quiz-view.js",
  "./js/views/profile-view.js",
  "./js/views/share-view.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
