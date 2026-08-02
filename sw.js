/**
 * Selfcare Diagnostics - Service Worker & Offline Cache Controller
 * Production Ready Offline Engine
 */

const CACHE_NAME = "selfcare-cache-v1.0.0";
const RUNTIME_CACHE = "selfcare-runtime-v1.0.0";

// Core App Shell Assets to pre-cache on install
const PRECACHE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/css/variables.css",
  "./assets/css/style.css",
  "./assets/css/components.css",
  "./assets/js/config.js",
  "./assets/js/app.js",
  "./assets/js/router.js",
  "./assets/js/store.js",
  "./assets/js/api.js",
  "./assets/js/auth.js",
  "./assets/js/ai-engine.js",
  "./assets/js/ui-render.js"
];

/**
 * Service Worker Installation Event
 */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching Core App Shell");
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

/**
 * Service Worker Activation & Cache Cleanup Event
 */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== RUNTIME_CACHE) {
            console.log("[Service Worker] Clearing Old Cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

/**
 * Service Worker Fetch Interceptor
 */
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests for standard caching (Handled via LocalStorage Sync in Step 17)
  if (request.method !== "GET") {
    return;
  }

  // Strategy 1: Apps Script Backend API Requests (Network-First with fallback response)
  if (url.href.includes("script.google.com") || url.href.includes("googleapis.com")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache latest successful API response
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Fallback to offline cached API data if available
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return new Response(
              JSON.stringify({
                status: "offline",
                message: "You are currently offline. Showing cached data."
              }),
              { headers: { "Content-Type": "application/json" } }
            );
          });
        })
    );
    return;
  }

  // Strategy 2: Core App Shell & Static Assets (Stale-While-Revalidate)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
        }
        return networkResponse;
      }).catch(() => {
        // Return offline fallback if network fails
        if (request.headers.get("accept") && request.headers.get("accept").includes("text/html")) {
          return caches.match("./index.html");
        }
      });

      return cachedResponse || fetchPromise;
    })
  );
});
