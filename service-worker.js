self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('v1').then(function(cache) {
      return cache.addAll([
        'index.html',
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  // Check if the request is for a font file
  if (event.request.headers.get('Accept').indexOf('font') !== -1) {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        if (response) {
          // Font is found in the cache, return it
          return response;
        }

        // Font is not in the cache, return empty response
        return new Response(null, { status: 404 });
      })
    );
  } else {
    // For other requests, follow the default caching behavior
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  }
});

