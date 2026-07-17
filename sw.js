const CACHE_NAME = 'cryptosignal-v1';
const STATIC_ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './manifest.json',
    './assets/icon-192.png',
    './assets/icon-512.png'
];

// Install - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        }).catch((err) => {
            console.error('Cache install failed:', err);
        })
    );
    self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).catch((err) => {
            console.error('Cache activation failed:', err);
        })
    );
    self.clients.claim();
});

// Fetch - network first for APIs, cache first for static assets
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests and chrome-extension requests
    if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

    // Skip API requests - network first with cache fallback
    if (url.hostname.includes('api.') || 
        url.hostname.includes('coingecko') || 
        url.hostname.includes('alternative')) {
        event.respondWith(
            fetch(request).catch(() => {
                return caches.match(request);
            })
        );
        return;
    }

    // For static assets - cache first, network fallback
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) {
                // Return cached and update in background
                fetch(request).then((response) => {
                    if (response.ok) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, response.clone());
                        });
                    }
                }).catch(() => {});
                return cached;
            }

            return fetch(request).then((response) => {
                if (!response || !response.ok || response.type === 'opaque') {
                    return response;
                }
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, clone);
                });
                return response;
            }).catch(() => {
                // If both fail, return index.html for navigation requests
                if (request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
                return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
            });
        })
    );
});
