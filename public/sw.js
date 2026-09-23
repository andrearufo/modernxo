// Offline: all'installazione salva la pagina e gli asset che referenzia.
// Pagina: prima la rete (così gli aggiornamenti arrivano subito), poi la cache.
// Asset (hash nel nome, quindi immutabili) e font: prima la cache, poi la rete.
const CACHE = 'trisinfinito-v1'
// Radice dell'app (es. /modernxo/ su GitHub Pages): tutti i percorsi sono relativi a questa.
const ROOT = self.registration.scope

self.addEventListener('install', e => {
    e.waitUntil((async () => {
        const cache = await caches.open(CACHE)
        const res = await fetch(ROOT, { cache: 'no-store' })
        const html = await res.clone().text()
        await cache.put(ROOT, res)
        const urls = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m => new URL(m[1], ROOT).href)
        await cache.addAll([...new Set(urls.filter(u => u.startsWith(ROOT)))])
        await self.skipWaiting()
    })())
})

self.addEventListener('activate', e => {
    e.waitUntil((async () => {
        for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k)
        await self.clients.claim()
    })())
})

// ponytail: gli asset delle versioni vecchie restano in cache; alza CACHE per ripulire se crescono troppo.
self.addEventListener('fetch', e => {
    const req = e.request
    if (req.method !== 'GET' || !req.url.startsWith('http')) return
    e.respondWith((async () => {
        const cache = await caches.open(CACHE)
        const save = res => {
            if (res.ok || res.type === 'opaque') cache.put(req.mode === 'navigate' ? ROOT : req, res.clone())
            return res
        }
        if (req.mode === 'navigate') return fetch(req).then(save).catch(() => cache.match(ROOT))
        return (await cache.match(req)) ?? fetch(req).then(save)
    })())
})
