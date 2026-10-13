// Falah service worker: offline app shell + notification actions.
const CACHE = 'falah-v3';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'app.css',
  'app.js', 'views.js', 'ui.js', 'store.js', 'times.js', 'tracker.js', 'notify.js',
  'praytimes.js', 'data.js', 'icons.js', 'art.js', 'wirid.js',
  'icon.svg', 'icon-192.png', 'icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (url.origin !== location.origin && !isFont) return;

  if (isFont) {
    // Stale-while-revalidate for web fonts.
    e.respondWith(
      caches.open(CACHE).then(async (c) => {
        const hit = await c.match(req);
        const net = fetch(req).then((r) => (c.put(req, r.clone()), r)).catch(() => hit);
        return hit || net;
      }),
    );
    return;
  }
  // Network-first for app files so updates land immediately; cache as offline fallback.
  e.respondWith(
    fetch(req)
      .then((r) => {
        if (r.ok) caches.open(CACHE).then((c) => c.put(req, r.clone()));
        return r;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('index.html'))),
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const data = e.notification.data || {};
  const target = e.action === 'prayed' && data.k ? `./?log=${data.k}:${data.p}` : './';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) {
          c.postMessage({ type: 'notif', action: e.action, data });
          return c.focus();
        }
      }
      return self.clients.openWindow(target);
    }),
  );
});
