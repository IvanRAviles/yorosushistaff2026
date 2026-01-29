const CACHE_NAME = 'yorokobi-staff-v12-fixed';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // CRITICAL FIX: NEVER touch Supabase API or Realtime connections
  if (url.hostname.includes('supabase.co')) {
    return;
  }

  // HTML: Network First
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Assets: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request).then((resp) => {
        if (resp.status === 200) {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resp.clone()));
        }
        return resp;
      });
      return cached || fetched;
    })
  );
});
