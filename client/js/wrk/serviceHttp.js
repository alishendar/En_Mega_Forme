/**
 * serviceHttp.js
 *
 * Description :
 * Ce script envoie des requêtes au côté serveur de l'application en fonction de l'URL du constructeur.
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
class ServiceHttp {
    /**
     * Constructeur de la classe ServiceHttp.
     * Initialise l'URL de base pour les requêtes.
     */
    constructor() {
        this.BASE_URL = "server/ctrl/requestHandler.php";
    }
    /**
     * Envoie une requête de connexion pour un administrateur.
     * @param {string} pseudo - Pseudo de l'administrateur.
     * @param {string} mdp - Mot de passe de l'administrateur.
     * @param {Function} successCallback - Callback en cas de succès.
     * @param {Function} errorCallback - Callback en cas d'erreur.
     */
    login(pseudo, mdp, successCallback, errorCallback) {
        $.ajax({
            type: "POST",
            dataType: "json",
            data: {
                action: "login",
                pseudo: pseudo,
                mdp: mdp,
            },
            url: this.BASE_URL,
            success: successCallback,
            error: errorCallback,
        });
    }

    /**
     * Déconnecte l'utilisateur.
     * @param {Function} successCallback - Callback en cas de succès.
     * @param {Function} errorCallback - Callback en cas d'erreur.
     */
    disconnectUser(successCallback, errorCallback) {
        $.ajax({
            type: "POST",
            dataType: "json",
            data: {action: "disconnect"},
            url: this.BASE_URL,
            success: successCallback,
            error: errorCallback,
        });
    }
    /**
     * Ajoute un utilisateur.
     * @param {string} pseudo - Pseudo de l'utilisateur.
     * @param {string} mdp - Mot de passe de l'utilisateur.
     * @param {Function} successCallback - Callback en cas de succès.
     * @param {Function} errorCallback - Callback en cas d'erreur.
     */
    addUser(pseudo, mdp, successCallback, errorCallback) {
        $.ajax({
            type: "POST",
            dataType: "json",
            data: {
                action: "addUser",
                username: pseudo,
                password: mdp,
                status: 0,
            },
            url: this.BASE_URL,
            success: successCallback,
            error: errorCallback,
        });
    }
    /**
     * Récupère tous les utilisateurs.
     * @param {Function} successCallback - Callback en cas de succès.
     * @param {Function} errorCallback - Callback en cas d'erreur.
     */
    getAllUser(successCallback, errorCallback) {
        $.ajax({
            type: "GET",
            data: {action: "getAllUser"},
            contentType: "application/json",
            url: this.BASE_URL,
            success: successCallback,
            error: errorCallback,
        });
    }
    /**
     * Supprime un utilisateur.
     * @param {number} userId - ID de l'utilisateur à supprimer.
     * @param {Function} successCallback - Callback en cas de succès.
     * @param {Function} errorCallback - Callback en cas d'erreur.
     */
    popUser(userId, successCallback, errorCallback) {
        $.ajax({
            type: "DELETE",
            url: `${this.BASE_URL}/user/${userId}`,
            success: successCallback,
            error: errorCallback,
        });
    }

    /**
     * Met à jour le statut d'un utilisateur.
     * @param {string} pseudo - Pseudo de l'utilisateur.
     * @param {boolean} newstatus - Nouveau statut de l'utilisateur (true pour admin, false pour utilisateur normal).
     * @param {number} userId - ID de l'utilisateur.
     * @param {Function} successCallback - Callback en cas de succès.
     * @param {Function} errorCallback - Callback en cas d'erreur.
     */
    updateUserStatus(pseudo, newstatus, userId, successCallback, errorCallback) {
        if (newstatus) {
            newstatus = 1;
        } else {
            newstatus = 0;
        }
        $.ajax({
            type: "POST",
            dataType: "json",
            data: {
                action: "updateUserStatus",
                username: pseudo,
                newstatus: newstatus,
                id: userId,
            },
            url: this.BASE_URL,
            success: successCallback,
            error: errorCallback,
        });
    }
    /**
     * Active ou désactive les notifications pour un utilisateur.
     * @param {number} userId - ID de l'utilisateur.
     * @param {number} litreByDay - Quantité d'eau à boire par jour.
     * @param {boolean} activeN - Indique si les notifications sont activées.
     * @param {Function} successCallback - Callback en cas de succès.
     * @param {Function} errorCallback - Callback en cas d'erreur.
     */
    notificationActive(userId, litreByDay, activeN, successCallback, errorCallback) {
        if (activeN) {
            activeN = 1;
        } else {
            activeN = 0;
        }
        $.ajax({
            type: "POST",
            dataType: "json",
            data: {
                action: "notifcationUser",
                id: userId,
                litreByDay: litreByDay,
                activeN: activeN,
            },
            url: this.BASE_URL,
            success: successCallback,
            error: errorCallback,
        });
    }
    /**
     * Récupère la valeur de haveDrinked pour un utilisateur donné.
     * @param {number} userId - ID de l'utilisateur.
     * @param {Function} successCallback - Callback à appeler en cas de succès.
     * @param {Function} errorCallback - Callback à appeler en cas d'erreur.
     */
    getHaveDrinked(userId,successCallback, errorCallback) {
        $.ajax({
            type: "GET",
            data: {
                action: "haveDrinked",
                id:userId
            },
            contentType: "application/json",
            url: this.BASE_URL,
            success: successCallback,
            error: errorCallback,
        });
    }
    /**
     * Récupère toutes les sessions d'un utilisateur.
     * @param {number} userId - ID de l'utilisateur.
     * @param {Function} successCallback - Callback en cas de succès.
     * @param {Function} errorCallback - Callback en cas d'erreur.
     */
    getAllSessionOfUser(userId, successCallback, errorCallback) {
        $.ajax({
            type: "GET",
            data: {
                action: "getAllSessionByUser",
                userId: userId,
            },
            contentType: "application/json",
            url: this.BASE_URL,
            success: successCallback,
            error: errorCallback,
        });
    }
    /**
     * Récupère une session par son ID.
     * @param {number} sessionId - ID de la session.
     * @param {Function} successCallback - Callback en cas de succès.
     * @param {Function} errorCallback - Callback en cas d'erreur.
     */
    getSessionById(sessionId, successCallback, errorCallback) {
        $.ajax({
            type: "GET",
            data: {
                action: "getSessionData",
                sessionId: sessionId,
            },
            contentType: "application/json",
            url: this.BASE_URL,
            success: successCallback,
            error: errorCallback,
        });
    }
    /**
     * Récupère la session actuelle de l'utilisateur connecté.
     * @param {Function} successCallback - Callback en cas de succès.
     * @param {Function} errorCallback - Callback en cas d'erreur.
     */
    getSessionActuelleLogin(successCallback, errorCallback) {
        $.ajax({
            type: "GET",
            data: {
                action: "getSession",
            },
            contentType: "application/json",
            url: this.BASE_URL,
            success: successCallback,
            error: errorCallback,
        });
    }
    /**
     * Crée une nouvelle session.
     * @param {string} name - Nom de la session.
     * @param {number} tempsW - Temps de travail pour chaque exercice.
     * @param {number} tempsP - Temps de pause entre les exercices.
     * @param {number} nbreExercice - Nombre d'exercices dans la session.
     * @param {Array<number>} userId - IDs des utilisateurs pour cette session.
     * @param {Array<number>} exercises - IDs des exercices dans cette session.
     * @param {Function} successCallback - Callback en cas de succès.
     * @param {Function} errorCallback - Callback en cas d'erreur.
     */
    createSession(name, tempsW, tempsP, nbreExercice, userId, exercises, successCallback, errorCallback) {
        $.ajax({
            type: "PUT",
            data: JSON.stringify({
                action: "createSession",
                name: name,
                TempsWork: tempsW,
                TempsPause: tempsP,
                nbreExercice: nbreExercice,
                userId: userId,
                exercises: exercises,
            }),
            contentType: "application/json",
            url: this.BASE_URL,
            success: successCallback,
            error: errorCallback,
        });
    }

    /**
     * Met à jour une session existante.
     * @param {number} sessionId - ID de la session.
     * @param {number} totalWorkTime - Temps total de travail.
     * @param {number} totalRestTime - Temps total de repos.
     * @param {number} nbrExercises - Nombre d'exercices dans la session.
     * @param {Array<number>} exercises - IDs des exercices dans cette session.
     * @param {Function} successCallback - Callback en cas de succès.
     * @param {Function} errorCallback - Callback en cas d'erreur.
     */
    updateSession(sessionId, totalWorkTime, totalRestTime, nbrExercises, exercises, successCallback, errorCallback) {
        $.ajax({
            type: "PUT",
            data: JSON.stringify({
                action: "updateSession",
                sessionId: sessionId,
                totalWorkTime: totalWorkTime,
                totalRestTime: totalRestTime,
                exercises: exercises,
                nbreExercice: nbrExercises,
            }),
            contentType: "application/json",
            url: this.BASE_URL,
            success: successCallback,
            error: errorCallback,
        });
    }
    /**
     * Copie une session existante pour un autre utilisateur.
     * @param {number} userId - ID de l'utilisateur cible.
     * @param {number} sessionId - ID de la session à copier.
     * @param {Function} successCallback - Callback en cas de succès.
     * @param {Function} errorCallback - Callback en cas d'erreur.
     */
    copySession(userId, sessionId, successCallback, errorCallback) {
        $.ajax({
            type: "POST",
            dataType: "json",
            data: {
                action: "copySession",
                userId: userId,
                sessionId: sessionId
            },
            url: this.BASE_URL,
            success: successCallback,
            error: errorCallback,
        });
    }
    /**
     * Enregistre la consommation d'eau pour un utilisateur via une requête HTTP POST.
     * @param {number} haveDrink - Quantité d'eau consommée.
     * @param {number} userId - ID de l'utilisateur.
     * @param {Function} successCallback - Callback en cas de succès.
     * @param {Function} errorCallback - Callback en cas d'erreur.
     */
    drinke(haveDrink, userId, successCallback, errorCallback) {
        $.ajax({
            type: "POST",
            dataType: "json",
            data: {
                action: "haveDrink",
                haveDrink: haveDrink,
                userId: userId
            },
            url: this.BASE_URL,
            success: successCallback,
            error: errorCallback,
        });
    }
    /**
     * Réinitialise la consommation d'eau journalière via une requête HTTP GET.
     * @param {Function} successCallback - Callback en cas de succès.
     * @param {Function} errorCallback - Callback en cas d'erreur.
     */
    restDayiledrink(successCallback, errorCallback){
        $.ajax({
            type: "GET",
            data: {
                action: "restDayiledrink",
            },
            contentType: "application/json",
            url: this.BASE_URL,
            success: successCallback,
            error: errorCallback,
        });
    }
    /**
     * Supprime une session existante.
     * @param {number} sessionId - ID de la session.
     * @param {Function} successCallback - Callback en cas de succès.
     * @param {Function} errorCallback - Callback en cas d'erreur.
     */
    popSession(sessionId, successCallback, errorCallback) {
        $.ajax({
            type: "DELETE",
            url: `${this.BASE_URL}/session/${sessionId}`,
            success: successCallback,
            error: errorCallback,
        });
    }
    /**
     * Récupère tous les muscles disponibles.
     * @param {Function} successCallback - Callback en cas de succès.
     * @param {Function} errorCallback - Callback en cas d'erreur.
     */
    getAllMuscles(successCallback, errorCallback) {
        $.ajax({
            type: "GET",
            data: {
                action: "getAllMuscles",
            },
            contentType: "application/json",
            url: this.BASE_URL,
            success: successCallback,
            error: errorCallback,
        });
    }

    /**
     * Récupère les exercices pour un muscle cible.
     * @param {string} target - Le muscle cible.
     * @param {Function} successCallback - Callback en cas de succès.
     * @param {Function} errorCallback - Callback en cas d'erreur.
     */
    getExerciceByTaget(target, successCallback, errorCallback) {
        $.ajax({
            type: "GET",
            data: {
                action: "getExerciceByTarget",
                target: target
            },
            url: this.BASE_URL,
            success: successCallback,
            error: errorCallback
        });
    }
    /**
     * Démarre une session par son ID.
     * @param {number} sessionId - ID de la session.
     * @param {Function} successCallback - Callback en cas de succès.
     * @param {Function} errorCallback - Callback en cas d'erreur.
     */
    getStartSession(sessionId, successCallback, errorCallback) {
        $.ajax({
            type: "GET",
            data: {
                action: "getStartSession",
                sessionId: sessionId
            },
            url: this.BASE_URL,
            success: successCallback,
            error: errorCallback
        });
    }
    /**
     * Marque une session comme terminée.
     * @param {number} sessionId - ID de la session.
     * @param {number} userId - ID de l'utilisateur.
     * @param {Function} successCallback - Callback en cas de succès.
     * @param {Function} errorCallback - Callback en cas d'erreur.
     */
    sessionGetFinish(sessionId, userId, successCallback, errorCallback) {
        $.ajax({
            type: "GET",
            data: {
                action: "getFinishSession",
                sessionId: sessionId,
                userId: userId
            },
            url: this.BASE_URL,
            success: successCallback,
            error: errorCallback
        });
    }
}
