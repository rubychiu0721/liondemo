const CACHE_NAME = "jingsuanshi-prototype-v1";

const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./assets/checkin-pet.jpeg",
  "./assets/header-user.png",
  "./assets/login-dog.png",
  "./assets/owner-avatar.jpg",
  "./assets/pet-cat-card.png",
  "./assets/pet-dog-card.png",
  "./assets/photo-dog-black.webp",
  "./assets/photo-dog-closeup.png",
  "./assets/photo-dog-lab.jpeg",
  "./assets/photo-dog-white.jpg",
  "./assets/service-custom.png",
  "./assets/service-large.png",
  "./assets/service-small.png",
  "./assets/trash-icon.png",
  "./assets/pwa-icons/icon-192.png",
  "./assets/pwa-icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request);
    })
  );
});
