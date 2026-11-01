/* Casa en Orden: funciona sin conexión y se actualiza solo.
   Siempre busca primero la versión nueva en internet; si no hay conexión, usa la guardada. */
var V='ceo-cache';
var CORE=['./','index.html','manifest.json','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',function(e){self.skipWaiting();e.waitUntil(caches.open(V).then(function(c){return c.addAll(CORE)}).catch(function(){}))});
self.addEventListener('activate',function(e){e.waitUntil(self.clients.claim())});
self.addEventListener('fetch',function(e){
  var r=e.request;if(r.method!=='GET')return;
  var u=new URL(r.url);
  if(u.hostname==='script.google.com'||u.hostname.indexOf('googleusercontent.com')>-1)return;
  var req=u.origin===self.location.origin?new Request(r.url,{cache:'no-cache'}):r;
  var net=fetch(req).then(function(res){if(res&&(res.ok||res.type==='opaque')){var cp=res.clone();caches.open(V).then(function(c){c.put(r,cp)})}return res});
  e.respondWith(caches.match(r).then(function(cached){
    if(!cached)return net.catch(function(){return r.mode==='navigate'?caches.match('index.html'):Response.error()});
    var wait=new Promise(function(ok){setTimeout(function(){ok(null)},4000)});
    return Promise.race([net.catch(function(){return null}),wait]).then(function(res){return res||cached});
  }));
});
