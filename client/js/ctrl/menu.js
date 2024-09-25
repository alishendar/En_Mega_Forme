/**
 * menu.js
 *
 * Description :
 * Ce script gérer la gestion de menu
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


/**
 * Constante représentant les droits d'administrateur.
 * @constant {number}
 */
const ADMIN_RIGHT = 1;

/**
 * Constante représentant les droits de support.c
 * @constant {number}
 */
const SUPPORT_RIGHT = 3;

/**
 * Fonction exécutée lorsque le document est prêt.
 * Initialise les gestionnaires d'événements et effectue des actions spécifiques.
 */
let menu;
/**
 * Classe représentant le menu de l'application.
 * @class
 */
class Menu {
    /**
     * Constructeur de la classe Menu.
     * @param {AppCtrl} appCtrlInstance - Instance du contrôleur de l'application.
     */
    constructor(appCtrlInstance) {
        this.getMySession(appCtrlInstance);
        this.initialise(appCtrlInstance);
        this.appCtrlInstance = appCtrlInstance;
    }
    /**
     * Initialise les gestionnaires d'événements pour les éléments du menu.
     * @param {AppCtrl} appCtrlInstance - Instance du contrôleur de l'application.
     */
    initialise(appCtrlInstance) {
        /**
         * Charge la vue de liste des utilisateurs lors du clic sur le bouton "listMember".
         * @event
         */
        $("#listMember").click(() => {
            appCtrlInstance.loadListUser()
        });
        /**
         * Charge la vue de génération de session lors du clic sur le bouton "creatSession".
         * @event
         */
        $("#creatSession").click(() => {
            appCtrlInstance.loadGeneratorSession();
        });
        /**
         * Charge la vue de copie de session lors du clic sur le bouton "copySession".
         * @event
         */
        $("#copySession").click(() => {
            appCtrlInstance.loadCopySession();
        });
        /**
         * Charge la vue de liste des sessions lors du clic sur le bouton "MyListSession".
         * @event
         */
        $("#MyListSession").click(() => {
            appCtrlInstance.loadListSession()
        });
        // Définir d'autres événements si nécessaire
        $("#sessionEnCours").click(() => {

        });
        /**
         * Déconnecte l'utilisateur lors du clic sur le bouton "logout".
         * @event
         */
        $("#logout").click(() => {
           this.disconnect()
        });

    }
    /**
     * Affiche ou masque les éléments du menu en fonction du statut de l'utilisateur.
     * @param {AppCtrl} appCtrlInstance - Instance du contrôleur de l'application.
     */
    getMySession(appCtrlInstance) {
        if (appCtrlInstance.getStatut() == 1) {
            $("#listMember").show();
            $("#creatSession").show();
            $("#copySession").show();
            $("#logout").show();
            $("#MyListSession").hide();
            $("#sessionEnCours").hide();
        } else {
            $("#listMember").hide();
            $("#copySession").hide();
            $("#logout").show();
            $("#MyListSession").show();
            $("#sessionEnCours").show();

        }


    }

    /**
     * Déconnecte l'utilisateur en supprimant la session du cache et en appelant la fonction de déconnexion.
     */
        disconnect(appCtrlInstance) {
        caches
            .open("cache-session") // Remplacez 'nom_du_cache' par le nom de votre cache
            .then((cache) => {
                cache
                    .delete("/server/ctrl/requestHandler.php?action=getSession")
                    .then((deleted) => {
                        if (deleted) {
                            console.log("Ligne supprimée avec succès.");
                        } else {
                            window.location.reload();
                            console.error("La session n'a pas pu être trouvée dans le cache.");

                        }
                    })
                    .catch((error) => {
                        console.error("Erreur lors de la suppression de la ligne :", error);
                    });
            })
            .catch((error) => {
                console.error("Erreur lors de l'ouverture du cache :", error);
            });

        this.appCtrlInstance.disconnectUser(this.disconnectSucces.bind(this), this.callbackError.bind(this));
    }
    /**
     * Gère le succès de la déconnexion en affichant un message et en rechargeant la page.
     * @param {AppCtrl} appCtrlInstance - Instance du contrôleur de l'application.
     * @param {Object} request - Réponse de la requête.
     * @param {string} status - Statut de la requête.
     * @param {Object} error - Erreur éventuelle de la requête.
     */
    disconnectSucces(appCtrlInstance, request, status, error) {
        this.appCtrlInstance.getToast().fire({
            icon: "success",
            text: "Vous allez être déconnecté",
            timer: 2000,
            timerProgressBar: true,
            allowOutsideClick: false,
            showConfirmButton: false, // Cacher le bouton de confirmation
        });
        window.location.reload();
    }
    /**
     * Gère les erreurs lors de la déconnexion.
     * @param {Object} error - Objet d'erreur contenant le message d'erreur.
     */
    callbackError(error){
        this.appCtrlInstance.getToast().fire({
            icon: "error",
            title: "Error",
            text: error["message"],
            allowOutsideClick: false,
        });
    }
}