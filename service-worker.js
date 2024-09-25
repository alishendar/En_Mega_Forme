const CACHE_NAME = "my-cache";
const QUEUE_NAME = "get-request-queue";
const urlsToCache = [
    // CSS files
    "client/css/style.css",
    // HTML files
    "client/html/copySession.html",
    "client/html/generatorSession.html",
    "client/html/listSession.html",
    "client/html/login.html",
    "client/html/menu.html",
    "client/html/startSession.html",
    "client/html/userList.html",
    // JavaScript files
    "client/js/ctrl/appCtrl.js",
    "client/js/ctrl/indexCtrl.js",
    "client/js/ctrl/menu.js",
    "client/js/ihm/copySession.js",
    "client/js/ihm/genratorSession.js",
    "client/js/ihm/loginCtrl.js",
    "client/js/ihm/myListSession.js",
    "client/js/ihm/startSession.js",
    "client/js/ihm/updateSession.js",
    "client/js/ihm/userList.js",
    "client/js/wrk/serviceHttp.js"
];

// Install event to cache the necessary files
self.addEventListener('install', (event) => {
    // Attendre que le processus d'installation soit terminé avant de continuer
    event.waitUntil(
        // Ouvrir les caches et ajouter les ressources à mettre en cache
        Promise.all([
            caches.open(CACHE_NAME).then((cache) => {
                return cache.addAll(urlsToCache);// Ajouter les URLs spécifiées à mettre en cache
            }),
            caches.open(QUEUE_NAME),// Ouvrir un deuxième cache pour une utilisation ultérieure
        ]).then(() => {
            // Passer au service worker actif
            return self.skipWaiting();
        })
    );
    // Afficher un message dans la console pour indiquer que le service worker a été installé
    console.log('Service Worker installed');
});

self.addEventListener('activate', (event) => {
    // Attendre que le service worker prenne le contrôle des clients actifs
    event.waitUntil(self.clients.claim());
    // Afficher un message dans la console pour indiquer que le service worker a été activé
    console.log('Service Worker activated');
});


// Fetch event to handle network requests
self.addEventListener("fetch", (event) => {
    // Obtenir l'URL de la requête
    const url = new URL(event.request.url);
    // Vérifier si l'URL contient un paramètre "action"
    if (!url.searchParams.has("action")) {
        // Si l'URL ne contient pas de paramètre "action", répondre avec une requête réseau normale
        event.respondWith(fetch(event.request));
    } else {
        // Si l'URL contient un paramètre "action", extraire sa valeur
        const action = url.searchParams.get("action");
        // Répondre en utilisant une stratégie réseau en premier
        event.respondWith(networkFirst(event.request, action));
    }
});

// Message event to handle offline popup
self.addEventListener("message", async function (event) {
    // Vérifier si le message reçu est de type "offlinePopup"
    if (event.data.type === "offlinePopup") {
        try {
            // Ouvrir le cache de la file d'attente
            const queueCache = await caches.open(QUEUE_NAME);
            // Obtenir les clés de la file d'attente
            const queueKeys = await queueCache.keys();
            // Obtenir la longueur de la file d'attente
            const queueLength = queueKeys.length;
            // Envoyer une réponse au site web avec la longueur de la file d'attente
            sendResponseToSite("offlinePopupTrigger", queueLength, null);
        } catch (error) {
            // Gérer les erreurs
            console.error("Error handling offlinePopup event:", error);
        }
    }
});

// Network-first strategy for fetching requests
async function networkFirst(request, action) {
    // Vérifier si l'utilisateur est en ligne
    const online = navigator.onLine;
    // Si l'utilisateur est en ligne
    if (online) {
        try {
            // Effectuer une requête réseau
            const networkResponse = await fetch(request);
            // Traiter différentes actions en fonction de l'action
            if (action === "getFinishSession") {
                // Ajouter la requête au cache de la file d'attente
                await addRequestToCache(request, QUEUE_NAME);
            } else if (action === "getStartSession") {
                // Cloner la réponse réseau
                const clonedResponse = networkResponse.clone();
                // Analyser la réponse JSON
                const data = await clonedResponse.json();
                // Gérer la réponse de démarrage de session
                handleGetStartSession(data);
            }
            // Traiter le cache de la file d'attente
            await processCache(QUEUE_NAME);
            // Retourner la réponse réseau
            return networkResponse;
        } catch (error) {
            // Gérer les échecs de requête réseau
            console.error("Network request failed. Falling back to cache:", error);
        }
    } else {
        // Si l'utilisateur est hors ligne
        try {
            // Rechercher une réponse mise en cache pour la requête
            const cachedResponse = await caches.match(request);
            // Si une réponse mise en cache est trouvée
            if (cachedResponse) {
                // Retourner la réponse mise en cache
                return cachedResponse;
            } else if (action === "getFinishSession") {
                // Ajouter la requête au cache de la file d'attente
                await addRequestToCache(request, QUEUE_NAME);
                // Démarrer l'intervalle de traitement de la file d'attente
                startInterval();
            }else if (action === "createSession") {
                // Ajouter la requête au cache de la file d'attente
                await addRequestToCache(request, QUEUE_NAME);
                // Démarrer l'intervalle de traitement de la file d'attente
                startInterval();
            }else if (action === "updateSession") {
                // Ajouter la requête au cache de la file d'attente
                await addRequestToCache(request, QUEUE_NAME);
                // Démarrer l'intervalle de traitement de la file d'attente
                startInterval();
            }else if (action === "copySession") {
                // Ajouter la requête au cache de la file d'attente
                await addRequestToCache(request, QUEUE_NAME);
                // Démarrer l'intervalle de traitement de la file d'attente
                startInterval();
            }else if (action === "updateUserStatus") {
                // Ajouter la requête au cache de la file d'attente
                await addRequestToCache(request, QUEUE_NAME);
                // Démarrer l'intervalle de traitement de la file d'attente
                startInterval();
            }else if (action === "addUser") {
                // Ajouter la requête au cache de la file d'attente
                await addRequestToCache(request, QUEUE_NAME);
                // Démarrer l'intervalle de traitement de la file d'attente
                startInterval();
            }
        } catch (error) {
            // Gérer les erreurs
            console.error("Error in networkFirst:", error);
        }
    }
}

// Handle caching of start session GIFs
async function handleGetStartSession(data) {
    // Ouvrir le cache "my-gif-cache"
    const cache = await caches.open('my-gif-cache');
    // Extraire les URL des GIF à partir des données
    const gifUrls = data.map(item => item.gifUrl);
    // Parcourir les URL des GIF et les mettre en cache
    await Promise.all(
        gifUrls.map(async (url) => {
            // Effectuer une requête pour récupérer le GIF
            const response = await fetch(url, {mode: 'no-cors'});
            // Vérifier si la réponse est OK
            if (response.ok) {
                // Mettre le GIF en cache
                await cache.put(url, response);
            }
        })
    );
}

// Add request to cache with timestamp
async function addRequestToCache(request, cacheName) {
    // Ouvre le cache spécifié
    const queueCache = await caches.open(cacheName);
    // Crée une nouvelle requête avec un timestamp pour éviter les doublons dans le cache
    const timestampedRequest = new Request(request.url + `&timestamp=${Date.now()}`, {
        method: request.method,
        headers: request.headers,
        body: request.body
    });
    // Met la requête dans le cache
    await queueCache.put(timestampedRequest, new Response());
    // Récupère les clés du cache pour déterminer la longueur de la file d'attente
    const keys = await queueCache.keys();
    const queueLength = keys.length;
    // Envoie une réponse au site avec la longueur de la file d'attente
    sendResponseToSite("offlinePopupTrigger", queueLength, null);
}

// Interval functions to check connection status
let intervalID;
let interval = false;

function startInterval() {
    // Vérifie si l'intervalle n'est pas déjà en cours
    if (!interval) {
        // Marque l'intervalle comme en cours
        interval = true;
        // Démarre l'intervalle qui appelle la fonction checkConnection toutes les 1000 millisecondes (1 seconde)
        intervalID = setInterval(checkConnection, 1000);
    }
}

function stopInterval() {
    // Efface l'intervalle en utilisant clearInterval avec l'identifiant de l'intervalle intervalID
    clearInterval(intervalID);
    // Marque l'intervalle comme arrêté
    interval = false;
}

// Check if the connection is back online
async function checkConnection() {
    // Vérifie si le navigateur est en ligne
    if (navigator.onLine) {
        // Arrête l'intervalle de vérification
        stopInterval();
        // Traite le cache en appelant la fonction processCache avec le nom de cache QUEUE_NAME
        await processCache(QUEUE_NAME);
    }
}

// Process queued requests when back online
async function processCache(cacheName) {
    // Ouvre le cache spécifié
    const queueCache = await caches.open(cacheName);
    // Récupère toutes les demandes mises en cache
    const requests = await queueCache.keys();
    // Parcourt chaque demande mise en cache
    for (let request of requests) {
        // Extrait l'URL d'origine à partir de la demande
        const url = new URL(request.url);
        const timestamp = url.searchParams.get("timestamp");
        const originalUrl = request.url.replace(`&timestamp=${timestamp}`, "");
        const originalRequest = new Request(originalUrl, {method: "GET"});

        console.log('Processing cached request:', originalUrl);

        try {
            // Effectue une requête réseau pour obtenir la réponse originale
            const response = await fetch(originalRequest);
            // Vérifie si la réponse est valide
            if (response.ok) {
                // Supprime la demande mise en cache du cache
                await queueCache.delete(request);
                // Récupère les données de réponse au format JSON
                const responseData = await response.json();
                // Envoie les données de réponse au site
                sendResponseToSite("response", responseData, timestamp);
            }
        } catch (error) {
            console.error("Error processing cache:", error);
        }
    }
}

// Send response to the main thread
function sendResponseToSite(type, response, timestamp) {
    // Récupère tous les clients connectés
    self.clients.matchAll().then((clients) => {
        // Parcourt chaque client
        clients.forEach((client) => {
            // Envoie un message au client avec le type de réponse, les données de réponse et le timestamp
            client.postMessage({
                type: type,
                data: response,
                time: timestamp,
            });
        });
    });
}
