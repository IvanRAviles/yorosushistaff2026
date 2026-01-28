const CACHE_NAME = 'yorokobi-staff-v11-final';

self.addEventListener('install', (event) => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then(names => Promise.all(
    names.map(n => n !== CACHE_NAME ? caches.delete(n) : null)
  )));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetched = fetch(event.request).then(resp => {
        caches.open(CACHE_NAME).then(c => c.put(event.request, resp.clone()));
        return resp;
      });
      return cached || fetched;
    })
  );
});
