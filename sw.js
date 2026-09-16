const CACHE_VERSION = 'v2';
const CACHE_NAME = `flixio-${CACHE_VERSION}`;

// Versioned asset map — bump version per-file to force revalidation
const STATIC_ASSETS = {
    '/': { url: '/index.html', version: '1' },
    '/index.html': { url: '/index.html', version: '1' },
    '/styles.css': { url: '/styles.css', version: '1' },
    '/app.js': { url: '/app.js', version: '1' },
    '/js/state.js': { url: '/js/state.js', version: '1' },
    '/js/router.js': { url: '/js/router.js', version: '1' },
    '/js/data.js': { url: '/js/data.js', version: '1' },
    '/js/utils.js': { url: '/js/utils.js', version: '1' },
    '/js/components/ProfileScreen.js': { url: '/js/components/ProfileScreen.js', version: '1' },
    '/js/components/CatalogScreen.js': { url: '/js/components/CatalogScreen.js', version: '1' },
    '/js/components/ContentCard.js': { url: '/js/components/ContentCard.js', version: '1' },
    '/js/components/HeroBanner.js': { url: '/js/components/HeroBanner.js', version: '1' },
    '/js/components/Carousel.js': { url: '/js/components/Carousel.js', version: '1' },
    '/js/components/ProfileModal.js': { url: '/js/components/ProfileModal.js', version: '1' },
    '/favicon.svg': { url: '/favicon.svg', version: '1' },
};

const ASSET_URLS = Object.keys(STATIC_ASSETS);

// Minimal offline fallback page
const OFFLINE_FALLBACK = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FLIXIO - Offline</title>
    <style>
        body {
            margin: 0; padding: 2rem; background: #141414; color: #e5e5e5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            display: flex; flex-direction: column; align-items: center;
            justify-content: center; min-height: 100vh; text-align: center;
        }
        h1 { color: #E50914; font-size: 2rem; margin-bottom: 1rem; }
        p { color: #999; max-width: 400px; line-height: 1.6; }
        .icon { font-size: 4rem; margin-bottom: 1.5rem; }
    </style>
</head>
<body>
    <div class="icon">📡</div>
    <h1>FLIXIO</h1>
    <p>Você está offline. Verifique sua conexão com a internet e tente novamente.</p>
</body>
</html>`;

// --- Install ---
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            try {
                await cache.addAll(ASSET_URLS);
            } catch (e) {
                console.warn('[SW] Failed to cache some assets:', e);
            }
            // Cache the offline fallback page
            try {
                await cache.put(
                    new Request('/offline'),
                    new Response(OFFLINE_FALLBACK, {
                        headers: { 'Content-Type': 'text/html; charset=utf-8' },
                    })
                );
            } catch (_) {
                // Ignore fallback cache errors
            }
        })
    );
});

// --- Activate ---
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) => {
                // Delete all caches that don't match the current version
                return Promise.all(
                    keys.filter((key) => key !== CACHE_NAME).map((key) => {
                        console.log(`[SW] Deleting old cache: ${key}`);
                        return caches.delete(key);
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// --- Fetch ---
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Only handle same-origin requests
    if (url.origin !== self.location.origin) return;

    const isStaticAsset = ASSET_URLS.includes(url.pathname);

    if (isStaticAsset) {
        // Stale-while-revalidate: serve cached, update in background
        event.respondWith(staleWhileRevalidate(event.request));
    } else {
        // Network-first for dynamic/navigation requests with offline fallback
        event.respondWith(networkFirstWithFallback(event.request));
    }
});

// --- Strategies ---

/**
 * Stale-while-revalidate for static assets.
 * Returns cached version immediately, fetches update in background.
 */
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    const fetchPromise = fetch(request)
        .then((response) => {
            if (response.ok) {
                cache.put(request, response.clone());
            }
            return response;
        })
        .catch(() => null);

    // Return cached immediately if available, otherwise wait for network
    return cached || (await fetchPromise) || new Response('Offline', { status: 503 });
}

/**
 * Network-first strategy with offline fallback.
 * Tries network, falls back to cache, then offline page.
 */
async function networkFirstWithFallback(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            // Cache successful navigation responses
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch (e) {
        // Network failed — try cache
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        if (cached) return cached;

        // Last resort — offline fallback for navigation
        if (request.mode === 'navigate') {
            const fallback = await cache.match('/offline');
            if (fallback) return fallback;
        }

        return new Response('Offline', { status: 503 });
    }
}
