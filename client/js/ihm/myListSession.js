/**
 * myListSession.js
 *
 * Description :
 * Cette classe va gérer l'affichage et les interactions entre l'utilisateur et ses sessions.
 *
 * Auteur : Shendar Ali
 * Version : 1.2
 *
 * Modifications :
 *
 */

/**
 * MyListSession est une classe qui gère les interactions entre l'utilisateur et ses sessions.
 * @class
 */
class MyListSession {
    appCtrlInstance;
    userId;

    /**
     * Constructeur de la classe MyListSession
     * @param {Object} appCtrlInstance - Instance du contrôleur de l'application
     */
    constructor(appCtrlInstance) {
        this.appCtrlInstance = appCtrlInstance;
        this.getMySessions(); //chercher tous les session de utilisateur connecter
        $('#addSessionButton').click(() => {
            this.appCtrlInstance.loadGeneratorSession()
        });

        this.inputEvent();
        this.getUserNotify();
        this.checkboxEvent();
    }

    /**
     * Ajoute un gestionnaire d'événements pour l'événement de changement à la case à cocher de notification.
     * Vérifie si le litre par jour est supérieur à zéro avant d'activer le système de notification.
     */
    checkboxEvent() {
        document.getElementById(`notifyCheckbox`).addEventListener('change', (event) => {
            // Récupère la valeur du litre par jour depuis le champ de saisie
            let litreByDay = document.getElementById('dailyWaterIntake').value;
            // Vérifie si le litre par jour est supérieur à zéro
            if (litreByDay > 0) {
                // Appelle la méthode pour mettre à jour la valeur (activer la notification)
                this.updateValue()
            } else {
                // Affiche un message d'erreur si le litre par jour n'est pas renseigné
                this.toastError("Merci de remplir le litre journalier avant d'activé le système de notification")
            }
        });
    }

    /**
     * Récupère l'état des notifications de l'utilisateur et met à jour l'interface en conséquence
     */
    getUserNotify() {
        // Récupère le statut de notification de l'utilisateur depuis le contrôleur d'application
        let check = this.appCtrlInstance.getUserNotify();
        // Convertit le statut de notification en un booléen
        if (check == 1) {
            check = true
        } else {
            check = false
        }
        // Met à jour la valeur du litre quotidien dans le champ de saisie
        document.getElementById('dailyWaterIntake').value = this.appCtrlInstance.getUserliterByDay();
        // Coche ou décoche la case à cocher en fonction du statut de notification de l'utilisateur
        document.getElementById('notifyCheckbox').checked = check;

    }

    /**
     * Ajoute des événements aux champs d'entrée pour la gestion des notifications
     */
    inputEvent() {
        // Récupère l'élément d'entrée pour le litre quotidien
        const input = document.getElementById('dailyWaterIntake');
        // Récupère l'élément d'entrée pour litre déjà bu
        const inputdrinked = document.getElementById('haveDrinkTody');
        // Ajoute un gestionnaire d'événements pour l'événement "input" afin de valider les entrées en temps réel
        input.addEventListener('input', () => this.validatePositiveNumber(input));
        // Ajoute un gestionnaire d'événements pour l'événement "inputdrinked" afin de valider les entrées en temps réel
        inputdrinked.addEventListener('inputdrinked', () => this.validatePositiveNumber(inputdrinked));
        // Ajoute un gestionnaire d'événements pour l'événement "change" afin de valider et mettre à jour la valeur lorsque l'utilisateur a terminé la saisie
        input.addEventListener('change', () => {
            // Vérifie si la valeur saisie est un nombre positif
            if (this.validatePositiveNumber(input)) {
                // Met à jour la valeur
                this.updateValue();
            }
        });
        // Ajoute un gestionnaire d'événements pour l'événement "change" afin de valider et mettre à jour la valeur lorsque l'utilisateur a terminé la saisie
        inputdrinked.addEventListener('change', () => {
            // Vérifie si la valeur saisie est un nombre positif
            if (this.validatePositiveNumber(input)) {
                // Met à jour la valeur
                this.dirinked(inputdrinked);
            }
        });
    }
    dirinked(inputdrinked){
        inputdrinked.value
        this.appCtrlInstance.drinke(inputdrinked.value,"", this.dirinkedSucsses.bind(this),this.dirinkedError.bind(this))
    }
    dirinkedSucsses(data){
        this.toastSuccess("Bravo!!! ")
    }
    dirinkedError(error){
        this.toastError("Une erreur, lorsque l'ajoutement ")
    }
    /**
     * Vérifie si la valeur saisie dans l'élément d'entrée est un nombre positif.
     * @param {HTMLInputElement} input - L'élément d'entrée HTML.
     * @returns {boolean} - True si la valeur est un nombre positif, sinon False.
     */
    validatePositiveNumber(input) {
        // Vérifie si la valeur saisie est inférieure à zéro
        if (input.value < 0) {
            // Efface la valeur saisie et affiche un message d'erreur
            input.value = '';
            this.toastError("Veuillez entrer un nombre positif");
            return false;
        }
        // Retourne true si la valeur est un nombre positif
        return true;
    }

    /**
     * Met à jour les valeurs de notification pour l'utilisateur
     */
    updateValue() {
        // Récupère la valeur du litre journalier et l'état de la case à cocher de notification
        let litreByDay = document.getElementById('dailyWaterIntake').value;
        let notifyCheckbox = document.getElementById('notifyCheckbox').checked;
        // Récupère l'identifiant de l'utilisateur connecté
        let userId = this.appCtrlInstance.getUserId()
        // Appelle la méthode de mise à jour de la notification active
        this.appCtrlInstance.notificationActive(userId, litreByDay, notifyCheckbox, this.getUpdateNotifySuccess.bind(this), this.getUpdateNotifyCallbackError.bind(this))
    }

    /**
     * Affiche un message de succès après la mise à jour des notifications
     * @param {Object} data - Données de réponse du serveur
     */
    getUpdateNotifySuccess(data) {
        this.toastSuccess(data['message'])
    }

    /**
     * Affiche un message d'erreur en cas de problème lors de la mise à jour des notifications
     * @param {Object} error - Erreur retournée par le serveur
     */
    getUpdateNotifyCallbackError(error) {
        this.toastError(error['message'])
    }

    /**
     * Récupère les sessions de l'utilisateur et les affiche
     */
    getMySessions() {
        this.userId = this.appCtrlInstance.getUserId();//chercher le Id d'utilisateur
        this.appCtrlInstance.getUserById(this.userId, this.getSessionByUserIDSuccess.bind(this), this.getSessionByUserIDCallbackError.bind(this));
    }

    /**
     * Met à jour l'affichage des sessions dans le tableau lorsque les données de session sont récupérées avec succès.
     * @param {Array} data - Les données de session récupérées pour l'utilisateur.
     */
    getSessionByUserIDSuccess(data) {
        // Récupère le corps du tableau des sessions
        const sessionsTableBody = document.querySelector('#sessionsTable tbody');
        // Vide le tableau avant d'ajouter de nouvelles sessions
        sessionsTableBody.innerHTML = '';
        // Parcourt les données de session et rend chaque session dans le tableau
        data.forEach(session => {
            // Rend la session dans le tableau
            this.renderSession({
                session_name: session.session_name,
                total_time: session.total_time,
                doneNbr: session.doneNbr,
                id: session.session_id
            });
        });
    }

    /**
     * Rend une session dans une ligne du tableau des sessions.
     * @param {Object} session - Les détails de la session à rendre.
     * @param {string} session.session_name - Le nom de la session.
     * @param {number} session.total_time - Le temps total de la session en secondes.
     * @param {number} session.doneNbr - Le nombre de fois que la session a été exécutée.
     * @param {number} session.id - L'identifiant de la session.
     */
    renderSession(session) {
        // Récupère le corps du tableau des sessions
        const sessionsTableBody = document.querySelector('#sessionsTable tbody');
        // Crée une nouvelle ligne pour la session
        const row = document.createElement('tr');
        // Cellule pour le nom de la session
        const nameCell = document.createElement('td');
        nameCell.textContent = session.session_name;
        row.appendChild(nameCell);
        // Cellule pour le temps total de la session
        const totalTimeCell = document.createElement('td');
        let parmin = Math.round(session.total_time / 60);// Convertit le temps total en minutes arrondies
        totalTimeCell.textContent = parmin + ` min`;
        row.appendChild(totalTimeCell);
        // Cellule pour le nombre de fois que la session a été exécutée
        const executedCell = document.createElement('td');
        executedCell.textContent = session.doneNbr ? `${session.doneNbr} fois` : '0 fois';// Affiche le nombre de fois ou '0 fois' si null
        row.appendChild(executedCell);
        // Cellule pour les actions (démarrer, modifier, supprimer)
        const actionsCell = document.createElement('td');
        // Bouton pour démarrer la session
        const startButton = document.createElement('button');
        startButton.textContent = 'Démarrer';
        startButton.className = 'btn btn-primary btn-sm btnStart';
        startButton.addEventListener('click', () => this.startSession(session.id));
        actionsCell.appendChild(startButton);
        // Bouton pour modifier la session
        const editButton = document.createElement('button');
        editButton.textContent = 'Modifier';
        editButton.className = 'btn btn-secondary btn-sm btnModify';
        editButton.addEventListener('click', () => this.modifySession(session.id));
        actionsCell.appendChild(editButton);
        // Bouton pour supprimer la session
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Supprimer';
        deleteButton.className = 'btn btn-danger btn-sm btnDelete';
        deleteButton.addEventListener('click', () => this.deleteSession(session.id));
        actionsCell.appendChild(deleteButton);
        // Ajoute la cellule des actions à la ligne
        row.appendChild(actionsCell);
        // Ajoute la ligne au corps du tableau
        sessionsTableBody.appendChild(row);
    }

    /**
     * Affiche un message d'erreur en cas de problème lors de la récupération des sessions
     * @param {Object} error - Erreur retournée par le serveur
     */
    getSessionByUserIDCallbackError(error) {
        this.toastError(error["message"])

    }

    /**
     * Démarre une session d'entraînement
     * @param {number} id - Identifiant de la session à démarrer
     */
    startSession(id) {
        console.log(`Start session ${id}`);
        this.appCtrlInstance.loadStartSession(id)
    }

    /**
     * Modifie une session d'entraînement
     * @param {number} id - Identifiant de la session à modifier
     */
    modifySession(id) {
        console.log(`Modify session ${id}`);
        this.appCtrlInstance.loadGeneratorSession(id)
    }

    /**
     * Supprime une session d'entraînement
     * @param {number} id - Identifiant de la session à supprimer
     */
    deleteSession(id) {
        console.log(`Delete session ${id}`);
        this.appCtrlInstance.popSession(id, this.getPopSessionSuccess.bind(this), this.gePopSessionCallbackError.bind(this))

    }

    /**
     * Affiche un message de succès après la suppression d'une session
     * @param {Object} data - Données de réponse du serveur
     */
    getPopSessionSuccess(data) {
        this.toastSuccess(data["message"])
        this.getMySessions()
        this.appCtrlInstance.loadListSession()
    }

    /**
     * Affiche un message d'erreur en cas de problème lors de la suppression d'une session
     * @param {Object} error - Erreur retournée par le serveur
     */
    gePopSessionCallbackError(error) {
        this.toastError(error["message"])
    }

    /**
     * Affiche un message d'erreur avec Toast
     * @param {string} message - Message d'erreur à afficher
     */
    toastError(message) {
        this.appCtrlInstance.getToast().fire({
            icon: "error",
            title: "Error",
            text: message,
            allowOutsideClick: false,
        });
    }

    /**
     * Affiche un message de succès avec Toast
     * @param {string} message - Message de succès à afficher
     */
    toastSuccess(message) {
        this.appCtrlInstance.getToast().fire({
            icon: "success",
            title: 'Success',
            text: message,
            timer: 2000,
            timerProgressBar: true,
            allowOutsideClick: false,
            showConfirmButton: false,
        });
    }
}