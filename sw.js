// Service  worker SCCSCSCS

const cacheName = 'v1';

// Installing Service Worker
self.addEventListener('install', (e) => {
    console.log('Service Worker: Installed');
})

// Activating Service Worker
self.addEventListener('activate', (e) => {
    console.log('Service Worker: Activated');
    // Remove unwanted caches

    e.waitUntil(
        caches.keys().then(cacheNames =>{
            return Promise.all(
                cacheNames.map(cache=>{
                    if(cache!= cacheName){
                        console.log('Service Worker: Clearing old cache');
                        return caches.delete(cache);
                    }
                })
            )
        })
    )

});

// Fetching resources from cache
self.addEventListener('fetch',e=>{
    console.log('Service Worker: Fetching');
    e.respondWith(
        fetch(e.request)
            .then(res => {
            // Clone response from Server
            const resClone = res.clone();
            // Open cache
            caches
            .open(cacheName)
            .then(cache=>{
                 // Add response to cache
                    cache
                    .put(e.request, resClone)
            .catch((e)=>{/* Do nothing */})
            });
            return res;    
        }). catch(err => caches.match(e.request).then(res => res))
    )
})



