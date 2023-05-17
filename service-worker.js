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
  // Check if the request is for index.html
  if (event.request.url.endsWith('index.html')) {
    event.respondWith(
      caches.open('v1').then(function(cache) {
        return Promise.all([
          fetch(event.request).then(function(networkResponse) {
            // Cache the fetched version of index.html
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }).catch(function() {
            // If fetching fails, serve the cached version of index.html
            return cache.match(event.request);
          }),
          cache.match(event.request).then(function(response) {
            // Serve the cached version of index.html
            return response;
          })
        ]).then(function(responses) {
          // Return the first available response (either from fetch or cache)
          return responses.find(function(response) {
            return response;
          });
        });
      })
    );
  } else if (event.request.headers.get('Accept').indexOf('font') !== -1) {
    // Check if the request is for a font file
    event.respondWith(
      caches.match(event.request).then(function(response) {
        if (response) {
          // Font is found in the cache, return it
          return response;
        }

        // Font is not in the cache, try to retrieve it from localStorage
        var fontData = localStorage.getItem('selectedFont');
        if (fontData) {
          // Font data is found in localStorage, convert it to a Blob object
          var blob = base64ToBlob(fontData);

          // Create a new response with the font data
          var fontResponse = new Response(blob, {
            headers: {
              'Content-Type': 'font/opentype',
            },
          });

          // Cache the font for future use
          caches.open('fontCache').then(function(cache) {
            cache.put('iconMode.otf', fontResponse);
          });
          console.log("font cached from localStorage");

          // Return the font response
          return fontResponse;
        }

        // Font is not in the cache or localStorage, return empty response
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

// Helper function to convert a base64 string to a Blob object
function base64ToBlob(base64) {
  var binaryString = window.atob(base64);
  var arrayBuffer = new ArrayBuffer(binaryString.length);
  var uint8Array = new Uint8Array(arrayBuffer);
  for (var i = 0; i < binaryString.length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }
  return new Blob([uint8Array]);
}
