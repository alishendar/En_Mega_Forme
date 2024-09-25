/**
 * indexCtrl.js
 *
 * Description :
 * démarrer l'application
 *
 * Auteur : Shendar Ali
 * Version : 1.2
 *
 * Modifications :
 *
 */

/**
 * ServiceHttp est une classe qui gère les requêtes HTTP vers le serveur.
 * @class
 */
$(document).ready(function () {
    // Initialiser l'instance du contrôleur IndexCtrl lorsque le document est prêt
    indexCtrlInstance = new IndexCtrl();
});

/**
 * Contrôleur principal de l'application.
 * Cette classe initialise l'application en chargeant la vue de connexion.
 * @class
 */
class IndexCtrl {
    /**
     * Constructeur de la classe IndexCtrl.
     * Initialise le contrôleur de l'application et charge la vue de connexion.
     */
    constructor() {
        // Créer une instance du contrôleur de l'application
        let appCtrl = new AppCtrl();
        // Charger la vue de connexion
        appCtrl.loadLogin();
    }
}