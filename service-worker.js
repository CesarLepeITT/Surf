const CACHE='entrena-v2';const ASSETS=['/','/index.html','/manifest.webmanifest','/src/app.js','/src/dom.js','/src/editor.js','/src/editor-view.js','/src/models.js','/src/routines.js','/src/storage.js','/src/timer.js','/src/notifications.js','/src/exercise-mapping.js','/src/styles.css'];
const install=async()=>{const cache=await caches.open(CACHE);await cache.addAll(ASSETS);await self.skipWaiting();};
const activate=async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)));await self.clients.claim();};
const respond=async request=>{try{const response=await fetch(request);if(response.ok){const cache=await caches.open(CACHE);cache.put(request,response.clone());}return response;}catch{return (await caches.match(request))||(request.mode==='navigate'?await caches.match('/index.html'):null)||Response.error();}};
self.addEventListener('install',e=>e.waitUntil(install()));
self.addEventListener('activate',e=>e.waitUntil(activate()));
self.addEventListener('fetch',e=>{const url=new URL(e.request.url);if(e.request.method==='GET'&&url.origin===self.location.origin)e.respondWith(respond(e.request));});
