const SHELL_CACHE = 'verifiedrent-shell-v1'
const SHELL_ASSETS = ['/', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-512-maskable.png', '/apple-icon.webp']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)
  const isIcon = url.pathname.startsWith('/icons/') || url.pathname === '/apple-icon.webp'
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('/')))
    return
  }
  if (isIcon) {
    event.respondWith(fetch(event.request).then((response) => {
      const copy = response.clone()
      void caches.open(SHELL_CACHE).then((cache) => cache.put(event.request, copy))
      return response
    }).catch(() => caches.match(event.request)))
  }
})
