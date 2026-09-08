/* Rootflow service worker. */
var CACHE = 'rootflow-cache-2026-09-08-interest-only-receivable';

var ASSETS = [
  './',
  './index.html',
  './styles.css',
  './capital.css',
  './domain.js',
  './cashflow-domain.js',
  './capital-domain.js',
  './store.js',
  './selftest.js',
  './capital-ui.js',
  './app.js',
  './manifest.json',
  './vendor/react.production.min.js',
  './vendor/react-dom.production.min.js',
  './rootflow-touch-180.png',
  './rootflow-icon-192.png',
  './rootflow-icon-512.png',
  './brand/rootflow-mark.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE)
      .then(function (cache) { return cache.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.map(function (key) { return key === CACHE ? null : caches.delete(key); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

function remember(req, res) {
  if (res && res.status === 200 && res.type === 'basic') {
    var copy = res.clone();
    caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
  }
  return res;
}

function networkFirst(req, navigation) {
  return fetch(req)
    .then(function (res) { return remember(req, res); })
    .catch(function () {
      return caches.match(req).then(function (hit) {
        if (hit) return hit;
        if (navigation) return caches.match('./index.html');
        return Response.error();
      });
    });
}

function cacheFirst(req) {
  return caches.match(req).then(function (hit) {
    if (hit) return hit;
    return fetch(req).then(function (res) { return remember(req, res); });
  });
}

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;

  var navigation = req.mode === 'navigate';
  var coreAsset = /\/(index\.html|styles\.css|capital\.css|app\.js|capital-ui\.js|domain\.js|cashflow-domain\.js|capital-domain\.js|store\.js|selftest\.js|manifest\.json)$/.test(url.pathname);
  event.respondWith(navigation || coreAsset ? networkFirst(req, navigation) : cacheFirst(req));
});
