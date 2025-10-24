const CACHE_NAME = 'nova-planner-v3';
const urlsToCache = [
  '/Nova-AI-Planer/',
  '/Nova-AI-Planer/nova-192.png',
  '/Nova-AI-Planer/nova-512.png',
  '/Nova-AI-Planer/manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        // 각 URL을 개별적으로 캐시하여 실패한 URL이 있어도 다른 URL들은 캐시되도록 함
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(error => {
              console.warn('Failed to cache:', url, error);
              return null;
            })
          )
        );
      })
  );
});

self.addEventListener('fetch', function(event) {
  // 네트워크 우선, 캐시 대체 전략
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // 응답이 성공적이면 캐시에 저장
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(function() {
        // 네트워크 실패 시 캐시에서 응답
        return caches.match(event.request);
      })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});