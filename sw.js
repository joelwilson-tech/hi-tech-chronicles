const CACHE_NAME = 'htc-cache-v3';
const ASSETS = [
    './',
    './index.html',
    './css/main.css',
    './css/animations.css',
    './css/components.css',
    './css/responsive.css',
    './js/utils.js',
    './js/ui.js',
    './js/storage.js',
    './js/apps.js',
    './js/downloads.js',
    './js/search.js',
    './js/admin.js',
    './js/router.js',
    './js/pwa.js',
    './js/auth.js',
    './js/firebase.js',
    './js/firebase-config.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});
