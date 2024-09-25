/**
 * offlineInfo.js
 *
 * Description :
 * Ce script fait le contrôle de connexion a chaque changement de vue pour vérifier si il y a afficher quelque chose en hors ligne.
 *
 * Auteur : shendar ali
 * Date : 19.12.2023
 * Version : 1.0
 *
 * Modifications :
 * Ajouter ici les futures modifications
 */

/**
 * Initialise le script une fois que le document est prêt.
 * Vérifie la disponibilité des service workers et envoie un message à un service worker actif, en attente ou en cours d'installation.
 * @function
 * @returns {void}
 */
$(document).ready(function () {
    // Vérifier si le navigateur prend en charge les Service Workers
    if ("serviceWorker" in navigator) {
        // Récupérer le Service Worker enregistré
        navigator.serviceWorker.ready
            .then(function (registration) {
                // Accéder à l'instance du Service Worker
                var serviceWorker =
                    registration.active ||
                    registration.waiting ||
                    registration.installing;

                // Vérifier si le Service Worker est disponible
                if (serviceWorker) {
                    // Envoyer un message au Service Worker pour afficher une notification hors ligne
                    serviceWorker.postMessage({ type: "offlinePopup" });
                }
            })
            .catch(function (error) {
                // Gérer les erreurs liées à la récupération du Service Worker
                console.error("Error getting service worker registration:", error);
            });
    }
});

