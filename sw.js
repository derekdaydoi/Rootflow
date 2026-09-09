/* Rootflow service worker. */
var CACHE = 'rootflow-cache-2026-09-09-green-logo-v7-valid-png-splash';

var ASSETS = [
  './',
  './index.html',
  './styles.css',
  './capital.css',
  './brand/rootflow-theme.css',
  './rootflow-icon-512-v2.png?v=20260909-splash-v1&rev=final',
  './operating-policy.js',
  './brand/rootflow-splash.css',
  './domain.js',
  './cashflow-domain.js',
  './capital-domain.js',
  './store.js',
  './selftest.js',
  './capital-ui.js',
  './app.js',
  './manifest.json?v=20260909-homescreen-v2&rev=final',
  './vendor/react.production.min.js',
  './vendor/react-dom.production.min.js',
  './rootflow-touch-180-v2.png?v=20260909&rev=final',
  './rootflow-icon-192-v2.png?v=20260909&rev=final',
  './rootflow-icon-512-v2.png?rev=final'
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
  var coreAsset = /\/(index\.html|styles\.css|capital\.css|rootflow-theme\.css|rootflow-splash\.css|rootflow-touch-180-v2\.png|rootflow-icon-192-v2\.png|rootflow-icon-512-v2\.png|operating-policy\.js|app\.js|capital-ui\.js|domain\.js|cashflow-domain\.js|capital-domain\.js|store\.js|selftest\.js|manifest\.json)$/.test(url.pathname);
  event.respondWith(navigation || coreAsset ? networkFirst(req, navigation) : cacheFirst(req));
});
