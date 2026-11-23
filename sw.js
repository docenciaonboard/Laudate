// Laudate service worker — versión 5d721cc5ff
const CACHE = 'laudate-5d721cc5ff';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('laudate-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Primero la copia guardada (funciona sin internet); de fondo se actualiza.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (url.origin !== location.origin && !isFont) return;
  if (url.pathname.includes('/data/')) return; // la publicación de cantos siempre se pide a la red
  e.respondWith(caches.open(CACHE).then(async (cache) => {
    const key = req.mode === 'navigate' ? './index.html' : req;
    const cached = await cache.match(key);
    const network = fetch(req).then((res) => { if (res && (res.ok || res.type === 'opaque')) cache.put(key, res.clone()); return res; }).catch(() => cached);
    return cached || network;
  }));
});
