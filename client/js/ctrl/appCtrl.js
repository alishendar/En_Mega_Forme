$(document).ready(function () {
    const indexCtrlInstance = new IndexCtrl();
});


/**
 * viewCtrl.js
 *
 * Description :
 * Ce script fait le contrôle et le chargement des vues HTML.
 *
 * Auteur : Dimitri Colella
 * Date : 06.05.2024
 * Version : 2.0
 *
 * Modifications :
 * Ajouter ici les futures modifications
 */

/**
 * Contrôleur de vue générique pour la gestion du chargement de pages et de scripts.
 * @class
 */
class AppCtrl {
    static serviceHttp;
    statusOfUser; //la status de l'utilisateur connecter
    userId; // l'id de utilisateur conecter
    userLiterByDay;
    userNotfiyActive;

    /**
     * Crée une instance du contrôleur de vue.
     * @constructor
     */
    constructor() {
        AppCtrl.serviceHttp = new ServiceHttp(); //monter la classe de worker pour la connexion aux serveur
        new Login(this);//monter la classe pour que le visiteur puisse se connecter
    }

    /**
     * Charge le menu HTML et initialise le contrôleur de menu.
     */
    loadMenu() {
        Promise.all([
            fetch("client/html/menu.html").then((response) => response.text())
        ])
            .then(([html]) => {
                const contentElement = document.getElementById("menu");
                if (contentElement) {
                    contentElement.innerHTML = html;
                    /*le code ici est executé comme si c'était le $(document).ready*/
                    new Menu(this);
                }
            })
            .catch((error) =>
                console.error("Erreur de chargement de la page:", error)
            );

    }
    /**
     * Charge la page de login HTML et initialise le contrôleur de login.
     */
    loadLogin() {
        Promise.all([
            fetch("client/html/login.html").then((response) => response.text())
        ])
            .then(([html, scriptContent]) => {
                const contentElement = document.getElementById("content");
                if (contentElement) {
                    contentElement.innerHTML = html;
                    /*le code ici est executé comme si c'était le $(document).ready*/
                    new Login(this);
                }
            })
            .catch((error) =>
                console.error("Erreur de chargement de la page:", error)
            );
    }

    /**
     * Charge la page de liste des utilisateurs HTML et initialise le contrôleur de liste des utilisateurs.
     */
    loadListUser() {
        Promise.all([
            fetch("client/html/userList.html").then((response) => response.text())
        ])
            .then(([html, scriptContent]) => {
                const contentElement = document.getElementById("content");
                if (contentElement) {
                    contentElement.innerHTML = html;
                    /*le code ici est executé comme si c'était le $(document).ready*/
                    new UserList(this);
                }
            })
            .catch((error) =>
                console.error("Erreur de chargement de la page:", error)
            );
    }

    /**
     * Charge la page de génération de session HTML et initialise le contrôleur de génération ou de mise à jour de session.
     * @param {number} [idSession] - L'ID de la session à mettre à jour (facultatif).
     */
    loadGeneratorSession(idSession) {
        Promise.all([
            fetch("client/html/generatorSession.html").then((response) => response.text())
        ])
            .then(([html, scriptContent]) => {
                const contentElement = document.getElementById("content");
                if (contentElement) {
                    contentElement.innerHTML = html;
                    /*le code ici est executé comme si c'était le $(document).ready*/
                    if (idSession) {
                        new UpdateSession(this, idSession)
                    } else {
                        new GenratorSession(this, this.getStatut());
                    }

                }
            })
            .catch((error) =>
                console.error("Erreur de chargement de la page:", error)
            );
    }

    /**
     * Charge la page de copie de session HTML et initialise le contrôleur de copie de session.
     */
    loadCopySession() {
        Promise.all([
            fetch("client/html/copySession.html").then((response) => response.text())
        ])
            .then(([html, scriptContent]) => {
                const contentElement = document.getElementById("content");
                if (contentElement) {
                    contentElement.innerHTML = html;
                    /*le code ici est executé comme si c'était le $(document).ready*/
                    new CopySession(this);
                }
            })
            .catch((error) =>
                console.error("Erreur de chargement de la page:", error)
            );

    }

    /**
     * Charge la page de liste des sessions HTML et initialise le contrôleur de liste des sessions.
     */
    loadListSession() {

        Promise.all([
            fetch("client/html/listSession.html").then((response) => response.text())
        ])
            .then(([html, scriptContent]) => {
                const contentElement = document.getElementById("content");
                if (contentElement) {
                    contentElement.innerHTML = html;
                    /*le code ici est executé comme si c'était le $(document).ready*/
                    new MyListSession(this);
                    new NotificationCtrl(this)
                }
            })
            .catch((error) =>
                console.error("Erreur de chargement de la page:", error)
            );
    }

    /**
     * Charge la page de démarrage de session HTML et initialise le contrôleur de démarrage de session.
     * @param {number} sessionId - L'ID de la session à démarrer.
     */
    loadStartSession(sessionId) {

        Promise.all([
            fetch("client/html/startSession.html").then((response) => response.text())
        ])
            .then(([html, scriptContent]) => {
                const contentElement = document.getElementById("content");
                if (contentElement) {
                    contentElement.innerHTML = html;
                    /*le code ici est executé comme si c'était le $(document).ready*/
                    new StartSession(this, sessionId);
                }
            })
            .catch((error) =>
                console.error("Erreur de chargement de la page:", error)
            );
    }

    /**
     * Connecte l'administrateur avec le pseudo et le mot de passe fournis.
     * @param {string} pseudo - Le pseudo de l'administrateur.
     * @param {string} mdp - Le mot de passe de l'administrateur.
     * @param {function} successCallback - Fonction de rappel en cas de succès.
     * @param {function} errorCallback - Fonction de rappel en cas d'erreur.
     * @returns {Promise} - Une promesse représentant la demande de connexion.
     */
    loginAdmin(pseudo, mdp, successCallback, errorCallback) {
        return AppCtrl.serviceHttp.login(pseudo, mdp, successCallback, errorCallback);
    }

    /**
     * Déconnecte l'utilisateur.
     * @param {function} successCallback - Fonction de rappel en cas de succès.
     * @param {function} errorCallback - Fonction de rappel en cas d'erreur.
     * @returns {Promise} - Une promesse représentant la demande de déconnexion.
     */
    disconnectUser(successCallback, errorCallback) {
        return AppCtrl.serviceHttp.disconnectUser(successCallback, errorCallback);
    }

    /**
     * Définit le statut de l'utilisateur.
     * @param {string} status - Le statut de l'utilisateur.
     * @returns {string} - Le statut de l'utilisateur.
     */
    setStatut(status) {
        this.statusOfUser = status;
        return this.statusOfUser;
    }

    /**
     * Récupère le statut de l'utilisateur.
     * @returns {string} - Le statut de l'utilisateur.
     */
    getStatut() {
        return this.statusOfUser;
    }

    /**
     * Récupère tous les utilisateurs.
     * @param {function} successCallback - Fonction de rappel en cas de succès.
     * @param {function} errorCallback - Fonction de rappel en cas d'erreur.
     * @returns {Promise} - Une promesse représentant la demande de récupération des utilisateurs.
     */
    getUsers(successCallback, errorCallback) {
        return AppCtrl.serviceHttp.getAllUser(successCallback, errorCallback)
    }

    /**
     * Ajoute un utilisateur.
     * @param {string} username - Le nom d'utilisateur.
     * @param {string} mdp - Le mot de passe de l'utilisateur.
     * @param {function} successCallback - Fonction de rappel en cas de succès.
     * @param {function} errorCallback - Fonction de rappel en cas d'erreur.
     * @returns {Promise} - Une promesse représentant la demande d'ajout d'utilisateur.
     */
    addUserCtrl(username, mdp, successCallback, errorCallback) {
        return AppCtrl.serviceHttp.addUser(username, mdp, successCallback, errorCallback)
    }

    /**
     * Supprime un utilisateur.
     * @param {number} pk_user - L'ID de l'utilisateur à supprimer.
     * @param {function} successCallback - Fonction de rappel en cas de succès.
     * @param {function} errorCallback - Fonction de rappel en cas d'erreur.
     * @returns {Promise} - Une promesse représentant la demande de suppression d'utilisateur.
     */
    popUserCtrl(pk_user, successCallback, errorCallback) {
        return AppCtrl.serviceHttp.popUser(pk_user, successCallback, errorCallback);
    }

    /**
     * Récupère tous les muscles disponibles.
     * @param {function} successCallback - Fonction de rappel en cas de succès.
     * @param {function} errorCallback - Fonction de rappel en cas d'erreur.
     * @returns {Promise} - Une promesse représentant la demande de récupération des muscles.
     */
    getAllMuscles(successCallback, errorCallback) {
        return AppCtrl.serviceHttp.getAllMuscles(successCallback, errorCallback);
    }

    /**
     * Récupère les exercices pour un muscle cible.
     * @param {string} target - Le muscle cible.
     * @param {function} successCallback - Fonction de rappel en cas de succès.
     * @param {function} errorCallback - Fonction de rappel en cas d'erreur.
     * @returns {Promise} - Une promesse représentant la demande de récupération des exercices.
     */
    getExerciceByTaget(target, successCallback, errorCallback) {
        return AppCtrl.serviceHttp.getExerciceByTaget(target, successCallback, errorCallback)
    }

    /**
     * Envoie une nouvelle session à créer.
     * @param {string} name - Le nom de la session.
     * @param {number} tempsW - Le temps de travail pour chaque exercice.
     * @param {number} tempsP - Le temps de pause entre les exercices.
     * @param {number} nbreExercice - Le nombre d'exercices dans la session.
     * @param {Array<number>} userIds - Les IDs des utilisateurs pour cette session.
     * @param {Array<number>} exerciceIds - Les IDs des exercices dans cette session.
     * @param {function} successCallback - Fonction de rappel en cas de succès.
     * @param {function} errorCallback - Fonction de rappel en cas d'erreur.
     * @returns {Promise} - Une promesse représentant la demande de création de session.
     */
    sendNewSession(name, tempsW, tempsP, nbreExercice, userIds, exerciceIds, successCallback, errorCallback) {
        return AppCtrl.serviceHttp.createSession(name, tempsW, tempsP, nbreExercice, userIds, exerciceIds, successCallback, errorCallback)
    }

    /**
     * Récupère toutes les sessions d'un utilisateur par son ID.
     * @param {number} userId - L'ID de l'utilisateur.
     * @param {function} successCallback - Fonction de rappel en cas de succès.
     * @param {function} errorCallback - Fonction de rappel en cas d'erreur.
     * @returns {Promise} - Une promesse représentant la demande de récupération des sessions d'un utilisateur.
     */
    getUserById(userId, successCallback, errorCallback) {
        return AppCtrl.serviceHttp.getAllSessionOfUser(userId, successCallback, errorCallback);
    }

    /**
     * Copie une session existante pour un autre utilisateur.
     * @param {number} userId - L'ID de l'utilisateur cible.
     * @param {number} sessionId - L'ID de la session à copier.
     * @param {function} successCallback - Fonction de rappel en cas de succès.
     * @param {function} errorCallback - Fonction de rappel en cas d'erreur.
     * @returns {Promise} - Une promesse représentant la demande de copie de session.
     */
    copySession(userId, sessionId, successCallback, errorCallback) {
        return AppCtrl.serviceHttp.copySession(userId, sessionId, successCallback, errorCallback)
    }

    /**
     * Met à jour le statut d'un utilisateur.
     * @param {string} pseudo - Le pseudo de l'utilisateur.
     * @param {string} newstatus - Le nouveau statut de l'utilisateur.
     * @param {number} userId - L'ID de l'utilisateur.
     * @param {function} successCallback - Fonction de rappel en cas de succès.
     * @param {function} errorCallback - Fonction de rappel en cas d'erreur.
     * @returns {Promise} - Une promesse représentant la demande de mise à jour du statut d'utilisateur.
     */
    updateUserStatus(pseudo, newstatus, userId, successCallback, errorCallback) {
        return AppCtrl.serviceHttp.updateUserStatus(pseudo, newstatus, userId, successCallback, errorCallback);
    }

    /**
     * Récupère une session par son ID.
     * @param {number} sessionId - L'ID de la session.
     * @param {function} successCallback - Fonction de rappel en cas de succès.
     * @param {function} errorCallback - Fonction de rappel en cas d'erreur.
     * @returns {Promise} - Une promesse représentant la demande de récupération d'une session.
     */
    getSessionById(sessionId, successCallback, errorCallback) {
        return AppCtrl.serviceHttp.getSessionById(sessionId, successCallback, errorCallback);
    }

    /**
     * Met à jour une session existante.
     * @param {number} sessionId - L'ID de la session.
     * @param {number} totalWorkTime - Le temps total de travail.
     * @param {number} totalRestTime - Le temps total de repos.
     * @param {number} nbrExercises - Le nombre d'exercices dans la session.
     * @param {Array<number>} exercises - Les IDs des exercices dans la session.
     * @param {function} successCallback - Fonction de rappel en cas de succès.
     * @param {function} errorCallback - Fonction de rappel en cas d'erreur.
     * @returns {Promise} - Une promesse représentant la demande de mise à jour de session.
     */
    updateSession(sessionId, totalWorkTime, totalRestTime, nbrExercises, exercises, successCallback, errorCallback) {
        return AppCtrl.serviceHttp.updateSession(sessionId, totalWorkTime, totalRestTime, nbrExercises, exercises, successCallback, errorCallback)
    }

    /**
     * Supprime une session existante.
     * @param {number} sessionId - L'ID de la session.
     * @param {function} successCallback - Fonction de rappel en cas de succès.
     * @param {function} errorCallback - Fonction de rappel en cas d'erreur.
     * @returns {Promise} - Une promesse représentant la demande de suppression de session.
     */
    popSession(sessionId, successCallback, errorCallback) {
        return AppCtrl.serviceHttp.popSession(sessionId, successCallback, errorCallback)
    }

    /**
     * Active ou désactive les notifications pour un utilisateur.
     * @param {number} userId - L'ID de l'utilisateur.
     * @param {number} litreByDay - La quantité d'eau à boire par jour.
     * @param {boolean} activeN - Indique si les notifications sont activées.
     * @param {function} successCallback - Fonction de rappel en cas de succès.
     * @param {function} errorCallback - Fonction de rappel en cas d'erreur.
     * @returns {Promise} - Une promesse représentant la demande d'activation des notifications.
     */
    notificationActive(userId, litreByDay, activeN, successCallback, errorCallback) {
        return AppCtrl.serviceHttp.notificationActive(userId, litreByDay, activeN, successCallback, errorCallback)
    }

    /**
     * Démarre une session par son ID.
     * @param {number} sessionId - L'ID de la session.
     * @param {function} successCallback - Fonction de rappel en cas de succès.
     * @param {function} errorCallback - Fonction de rappel en cas d'erreur.
     * @returns {Promise} - Une promesse représentant la demande de démarrage de session.
     */
    getStartSession(sessionId, successCallback, errorCallback) {
        return AppCtrl.serviceHttp.getStartSession(sessionId, successCallback, errorCallback);
    }

    /**
     * Marque une session comme terminée.
     * @param {number} sessionId - L'ID de la session.
     * @param {number} userId - L'ID de l'utilisateur.
     * @param {function} successCallback - Fonction de rappel en cas de succès.
     * @param {function} errorCallback - Fonction de rappel en cas d'erreur.
     * @returns {Promise} - Une promesse représentant la demande de marquage de session comme terminée.
     */
    sessionGetFinish(sessionId, userId, successCallback, errorCallback) {
        return AppCtrl.serviceHttp.sessionGetFinish(sessionId, userId, successCallback, errorCallback)
    }
    /**
     * Récupère la valeur de haveDrinked pour l'utilisateur actuel via le service HTTP.
     * @param {Function} successCallback - Callback en cas de succès.
     * @param {Function} errorCallback - Callback en cas d'erreur.
     * @returns {Promise} - Retourne une promesse de la requête HTTP.
     */
    getHaveDrinked(userId,successCallback, errorCallback){
        let id=this.getUserId();
        return AppCtrl.serviceHttp. getHaveDrinked(id,successCallback, errorCallback);
    }
    /**
     * Enregistre la consommation d'eau pour l'utilisateur actuel via le service HTTP.
     * @param {number} haveDrink - Quantité d'eau consommée.
     * @param {Function} successCallback - Callback en cas de succès.
     * @param {Function} errorCallback - Callback en cas d'erreur.
     * @returns {Promise} - Retourne une promesse de la requête HTTP.
     */
    drinke(haveDrink, userId, successCallback, errorCallback){
        let id=this.getUserId();
        return AppCtrl.serviceHttp.drinke(haveDrink, id, successCallback, errorCallback);
    }

    /**
     * Réinitialise la consommation d'eau journalière pour l'utilisateur actuel via le service HTTP.
     * @param {Function} successCallback - Callback en cas de succès.
     * @param {Function} errorCallback - Callback en cas d'erreur.
     * @returns {Promise} - Retourne une promesse de la requête HTTP.
     */
    restDayiledrink(successCallback, errorCallback){
        return AppCtrl.serviceHttp.restDayiledrink(successCallback, errorCallback);
    }
    /**
     * Définit l'ID de l'utilisateur.
     * @param {number} id - L'ID de l'utilisateur.
     */
    setUserId(id) {
        this.userId = id;

    }

    /**
     * Récupère l'ID de l'utilisateur.
     * @returns {number} - L'ID de l'utilisateur.
     */
    getUserId() {
        return this.userId;
    }

    /**
     * Définit les paramètres de notification de l'utilisateur.
     * @param {number} userLiterByDay - La quantité d'eau à boire par jour.
     * @param {boolean} userNotfiyActive - Indique si les notifications sont activées.
     */
    setUserNotify(userLiterByDay, userNotfiyActive) {
        this.userLiterByDay = userLiterByDay;
        this.userNotfiyActive = userNotfiyActive;
    }

    /**
     * Récupère l'état des notifications de l'utilisateur.
     * @returns {boolean} - Indique si les notifications sont activées.
     */
    getUserNotify() {
        return this.userNotfiyActive;

    }

    /**
     * Récupère la quantité d'eau à boire par jour pour l'utilisateur.
     * @returns {number} - La quantité d'eau à boire par jour.
     */
    getUserliterByDay() {
        return this.userLiterByDay;
    }

    /**
     * Récupère une instance de Toast pour afficher des messages.
     * @returns {Object} - Instance de Toast.
     */
    getToast() {
        return Swal.mixin({
            toast: true,
            position: 'top-right',
            customClass: {
                popup: 'colored-toast',
            },
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
        })
    }

}
