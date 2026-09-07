/* Rootflow — sw.js
   Cache key changes per deploy so installed PWA receives one coherent asset set. */
var CACHE = 'rootflow-cache-v21-2026-09-07-brand-fix';

var ASSETS = [
  './',
  './index.html',
  './styles.css',
  './v4.css',
  './v4-polish.css',
  './brand/rootflow-splash.css',
  './domain.js',
  './v3-domain.js',
  './v4-domain.js',
  './v3-compat.js',
  './v3-i18n.js',
  './v4-i18n.js',
  './store.js',
  './v3-store.js',
  './selftest.js',
  './app.js',
  './v4-ui.js',
  './v4-polish.js',
  './manifest.json',
  './vendor/react.production.min.js',
  './vendor/react-dom.production.min.js',
  './icon-180.png',
  './icon-192.png',
  './icon-256.png',
  './icon-512.png',
  './icon-1024.png',
  './brand/rootflow-symbol.svg',
  './brand/rootflow-mark.svg',
  './brand/rootflow-wordmark.svg',
  './brand/rootflow-logo.svg',
  './brand/rootflow-icon-master.svg'
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
  var coreAsset = /\/(index\.html|styles\.css|v4\.css|v4-polish\.css|rootflow-splash\.css|app\.js|v4-ui\.js|v4-polish\.js|domain\.js|v3-domain\.js|v4-domain\.js|v3-compat\.js|v3-i18n\.js|v4-i18n\.js|store\.js|v3-store\.js|selftest\.js|manifest\.json)$/.test(url.pathname);
  event.respondWith(navigation || coreAsset ? networkFirst(req, navigation) : cacheFirst(req));
});
