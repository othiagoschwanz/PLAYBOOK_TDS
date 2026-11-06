const CACHE = 'playbook-v02-shell-v2';
const ROOT = new URL('./', self.registration.scope).pathname;
const SHELL = ['', 'index.html', 'styles.css', 'app.js', 'lib.js', 'db.js', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'config.js'].map((name) => new URL(name, self.registration.scope).href);
let accessToken = '';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all([self.clients.claim(), caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))]));
});
self.addEventListener('message', (event) => {
  if (event.data?.type === 'PLAYBOOK_DRIVE_TOKEN') accessToken = String(event.data.token || '');
});

async function askToken() {
  if (accessToken) return accessToken;
  const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of windows) {
    const channel = new MessageChannel();
    const value = await new Promise((resolve) => {
      let finished = false;
      const finish = (token) => { if (finished) return; finished = true; clearTimeout(timer); channel.port1.close(); resolve(token); };
      channel.port1.onmessage = (event) => finish(event.data?.token || '');
      const timer = setTimeout(() => finish(''), 1700);
      client.postMessage({ type: 'PLAYBOOK_TOKEN_REQUEST' }, [channel.port2]);
    });
    if (value) { accessToken = value; return value; }
  }
  return '';
}

async function streamDrive(request, url) {
  const id = url.pathname.slice((ROOT + '__drive/').length);
  if (!/^[A-Za-z0-9_-]{3,}$/.test(id)) return new Response('Arquivo inválido', { status: 400 });
  const token = await askToken();
  if (!token) return new Response('Conecte sua conta Google no player', { status: 401 });
  const headers = new Headers({ Authorization: `Bearer ${token}` });
  const range = request.headers.get('range');
  if (range) headers.set('Range', range);
  try {
    const upstream = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media`, { headers, cache: 'no-store' });
    const safe = new Headers({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    for (const name of ['content-type', 'content-length', 'content-range', 'accept-ranges', 'etag']) {
      const value = upstream.headers.get(name);
      if (value) safe.set(name, value);
    }
    if (upstream.status === 401) accessToken = '';
    return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers: safe });
  } catch {
    return new Response('Não foi possível transmitir o arquivo do Drive', { status: 502 });
  }
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith(ROOT + '__drive/')) {
    event.respondWith(streamDrive(event.request, url));
    return;
  }
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then((res) => res || Response.error())));
});
