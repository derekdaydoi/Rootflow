/* Rootflow — sw.js
   Cache version phải đổi ở mọi deploy để PWA Home Screen nhận code mới. */
var CACHE = 'rootflow-v2.6-2026-08-07';

var ASSETS = [
  './',
  './index.html',
  './domain.js',
  './store.js',
  './selftest.js',
  './app.js',
  './manifest.json',
  './vendor/react.production.min.js',
  './vendor/react-dom.production.min.js',
  './icon-180.png',
  './icon-192.png',
  './icon-256.png',
  './icon-512.png',
  './icon-1024.png',
  './icon-master.svg'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.map(function (k) {
          return k === CACHE ? null : caches.delete(k);
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

function networkFirst(req) {
  return fetch(req).then(function (res) {
    if (res && res.status === 200 && res.type === 'basic') {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
    }
    return res;
  }).catch(function () {
    return caches.match(req).then(function (hit) {
      return hit || caches.match('./index.html');
    });
  });
}

function cacheFirst(req) {
  return caches.match(req).then(function (hit) {
    if (hit) return hit;
    return fetch(req).then(function (res) {
      if (res && res.status === 200 && res.type === 'basic') {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    });
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var u = new URL(req.url);
  if (u.origin !== location.origin) return;

  /* Navigation + app code ưu tiên mạng để refresh Home Screen chỉ cần một lần.
     Khi offline vẫn fallback về cache. Vendor/icon giữ cache-first. */
  var core = req.mode === 'navigate' || /\/(index\.html|app\.js|domain\.js|store\.js|selftest\.js|manifest\.json)$/.test(u.pathname);
  e.respondWith(core ? networkFirst(req) : cacheFirst(req));
});
