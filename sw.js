const CACHE_NAME = "studyno-1";


const APP_SHELL = [
 "./",
 "./index.html",
];


self.addEventListener("install", (event) => {
 event.waitUntil(
   caches.open(CACHE_NAME).then((cache) => {
     // Cache what exists; don't fail install if an optional
     // asset (e.g. icons) hasn't been added yet.
     return Promise.all(
       APP_SHELL.map((url) =>
         cache.add(url).catch((err) => {
           console.warn("SW: could not cache", url, err);
         })
       )
     );
   })
 );
 self.skipWaiting();
});


self.addEventListener("activate", (event) => {
 event.waitUntil(
   caches.keys().then((keys) =>
     Promise.all(
       keys
         .filter((key) => key !== CACHE_NAME)
         .map((key) => caches.delete(key))
     )
   )
 );
 self.clients.claim();
});


self.addEventListener("fetch", (event) => {
 const { request } = event;


 // Only handle GET requests for same-origin app assets.
 // Everything else (CDN three.js, etc.) goes straight to network.
 if (request.method !== "GET" || new URL(request.url).origin !== location.origin) {
   return;
 }


 event.respondWith(
   caches.match(request).then((cached) => {
     if (cached) return cached;


     return fetch(request)
       .then((response) => {
         const clone = response.clone();
         caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
         return response;
       })
       .catch(() => cached);
   })
 );
});