/**
 * notificationCtrl.js
 *
 * Description :
 * Démarrer l'application
 *
 * Auteur : Shendar Ali
 * Version : 1.2
 *
 * Modifications :
 *
 */

/**
 * NotificationCtrl est une classe qui gère les notifications pour l'application.
 * @class
 */
class NotificationCtrl {
    indexCtrlInstance
    courent;
    /**
     * Crée une instance de NotificationCtrl.
     * @param {Object} indexCtrlInstance - Instance de l'index contrôleur.
     */
    constructor(indexCtrlInstance) {
        this.indexCtrlInstance = indexCtrlInstance;
        if (this.indexCtrlInstance.getUserId()) {
            this.startTimer();
            this.requestPermission();
        }

    }
    /**
     * Vérifie l'heure actuelle et déclenche les notifications à des moments spécifiques.
     */
    checkTime() {
        const now = new Date();
        const swissTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Zurich"}));

        // Vérifier l'heure actuelle à des moments spécifiques
        const triggerTimes = [
            {hours: 8, minutes: 0, seconds: 0},
            {hours: 10, minutes: 0, seconds: 0},
            {hours: 12, minutes: 0, seconds: 0},
            {hours: 14, minutes: 0, seconds: 0},
            {hours: 16, minutes: 0, seconds: 0},
            {hours: 18, minutes: 0, seconds: 0},
            {hours: 20, minutes: 0, seconds: 0},
            {hours: 22, minutes: 0, seconds: 0},
        ];

        for (const time of triggerTimes) {
            if (swissTime.getHours() === time.hours && swissTime.getMinutes() === time.minutes && swissTime.getSeconds() === time.seconds) {
                this.getHaveDrink();
                if (swissTime.getHours()===22 || swissTime.getHours()===8){
                    this.indexCtrlInstance.restDayiledrink()
                }
            }
        }
    }
    /**
     * Récupère les données de consommation d'eau pour l'utilisateur.
     */
    getHaveDrink() {
        let shouldNotify = this.indexCtrlInstance.getUserNotify();
        if (shouldNotify) {
            this.indexCtrlInstance.getHaveDrinked("",this.getHaveDrinkSucsses.bind(this), this.getHaveDrinkError.bind(this));
        }
    }
    /**
     * Callback en cas de succès de la récupération des données de consommation d'eau.
     * @param {Object} data - Données récupérées.
     */
    getHaveDrinkSucsses(data){
        this.courent=data[0]
        let all = this.indexCtrlInstance.getUserliterByDay();
        let byTowHour = all / 8;
        let arroundi = Math.round(byTowHour * 100) / 100
        if (all > this.courent && all > byTowHour) {
            this.nonPersistentNotification("Il faut boir :" + arroundi + "L d'eau")
        }
    }
    /**
     * Callback en cas d'erreur de la récupération des données de consommation d'eau.
     * @param {Object} error - Erreur rencontrée.
     */
    getHaveDrinkError(error){

    }
    /**
     * Démarre le timer pour vérifier l'heure actuelle toutes les secondes.
     */
    startTimer() {
        // Vérifier l'heure actuelle toutes les secondes
        setInterval(this.checkTime.bind(this), 1000);
    }
    /**
     * Demande la permission pour envoyer des notifications.
     * @param {string} message - Message à afficher dans la console en fonction du résultat de la demande de permission.
     */
    requestPermission(message) {
        if (!('Notification' in window)) {
            alert('Notification API not supported!');
            return;
        }

        Notification.requestPermission().then((result) => {
            if (result === 'granted') {
                console.log(message);
            } else {
                console.log(message);
            }
        }).catch((error) => {
            console.error('Error requesting notification permission:', error);
        });
    }
    /**
     * Envoie une notification non persistante.
     * @param {string} message - Message à afficher dans la notification.
     */
    nonPersistentNotification(message) {
        if (!('Notification' in window)) {
            alert('Notification API not supported!');
            return;
        }

        if (Notification.permission === 'granted') {
            try {
                navigator.serviceWorker.getRegistration().then(registration => {
                    registration.showNotification(message);
                }).catch(err => {
                    console.error('ServiceWorker registration error:', err);
                });
            } catch (err) {
                console.error('Notification API error:', err);
            }
        }
    }
    /**
     * Envoie une notification persistante.
     */
    persistentNotification() {
        if (!('Notification' in window) || !('ServiceWorkerRegistration' in window)) {
            alert('Persistent Notification API not supported!');
            return;
        }

        navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification("Hi there - persistent!");
        }).catch((err) => {
            console.error('Service Worker registration error:', err);
        });
    }
}

