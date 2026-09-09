from pathlib import Path
import runpy

runpy.run_path('tools/rootflow-brand-release.py', run_name='__main__')

Path('sw.js').write_text('''/* Rootflow service worker. */
var CACHE='rootflow-ui-2026-09-09-brand-r3';
var ASSETS=['./','./index.html','./styles.css','./capital.css','./brand/rootflow-theme.css','./brand/rootflow-splash.css?v=20260909-brand-r3','./brand/rootflow-mark.png?v=20260909-brand-r3','./brand/rootflow-icon.png?v=20260909-brand-r3','./operating-policy.js','./domain.js','./cashflow-domain.js','./capital-domain.js','./store.js','./selftest.js','./capital-ui.js','./app.js','./manifest.json?v=20260909-brand-r3','./vendor/react.production.min.js','./vendor/react-dom.production.min.js'];
self.addEventListener('install',function(event){event.waitUntil(caches.open(CACHE).then(function(cache){return cache.addAll(ASSETS)}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(event){event.waitUntil(caches.keys().then(function(keys){return Promise.all(keys.filter(function(key){return key!==CACHE}).map(function(key){return caches.delete(key)}))}).then(function(){return self.clients.claim()}))});
function ok(res){return res&&res.ok&&res.type==='basic'}
function remember(req,res){if(ok(res)){var copy=res.clone();caches.open(CACHE).then(function(cache){cache.put(req,copy)})}return res}
function networkFirst(req,navigation){return fetch(req).then(function(res){return remember(req,res)}).catch(function(){return caches.match(req).then(function(hit){if(hit)return hit;if (navigation) return caches.match('./index.html');return Response.error()})})}
function cacheFirst(req){return caches.match(req).then(function(hit){if(hit)return hit;return fetch(req).then(function(res){return remember(req,res)}).catch(function(){return Response.error()})})}
self.addEventListener('fetch',function(event){var req=event.request;if(req.method!=='GET')return;var url=new URL(req.url);if(url.origin!==location.origin)return;var navigation=req.mode==='navigate';event.respondWith(navigation?networkFirst(req,true):cacheFirst(req))});
''', encoding='utf-8')
