/**
 * copySession.js
 *
 * Description :
 * Cette classe gère la copie des sessions d'un utilisateur à un autre.
 *
 * Auteur : Shendar Ali
 * Version : 1.2
 *
 * Modifications :
 *
 */
/**
 * Classe CopySession
 * @class
 */
class CopySession {
    appCtrlInstance;
    listOfUser;
    listOfUserFromSelected = [];
    listOfUserToSelected;
    listTo = true;
    nbrOfMemebre;
    nbrOfSession;
    userSession;
    sessionToCopy;

    /**
     * Constructeur de la classe CopySession.
     * @param {AppCtrl} appCtrlInstance - Instance du contrôleur de l'application.
     */
    constructor(appCtrlInstance) {
        this.appCtrlInstance = appCtrlInstance;
        this.getmembre();

        $('#copySessionbtn').click(() => {
            this.copySessionIhm()
        });
    }

    /**
     * Récupère la liste des membres depuis le serveur.
     */
    getmembre() {
        this.appCtrlInstance.getUsers(this.getUserSuccess.bind(this), this.getUserCallbackError.bind(this));
    }

    /**
     * Callback de succès pour la récupération des membres.
     * @param {Array} data - Liste des membres.
     */
    getUserSuccess(data) {
        this.listOfUser = data;
        this.addMemberDropdown(); // Add initial member dropdown
    }

    /**
     * Ajoute un dropdown pour sélectionner les membres.
     */
    addMemberDropdown() {
        this.nbrOfMemebre++; // Increment counter
        let dropdownHTMLFrom = this.generateDropdown(this.listOfUser, "Membre", `dropdownContainerUserFrom`);
        $('#dropdownContainerUserFrom').append(dropdownHTMLFrom);
        this.attachDropdownEvents(`dropdownContainerUserFrom`);
    }

    /**
     * Génère le HTML pour un dropdown.
     * @param {Array} data - Liste des items du dropdown.
     * @param {string} nameOfList - Nom de la liste.
     * @param {string} id - ID du dropdown.
     * @returns {string} - HTML du dropdown.
     */
    generateDropdown(data, nameOfList, id) {
        let dropdownItems = data.map(item => `<li><a class="dropdown-item" href="#">${item["username"] || item["name"]}</a></li>`).join('');
        return `
            <div class="btn-group droplist">
                <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" id="button-${id}">
                    ${nameOfList}
                </button>
                <ul id="${id}" class="dropdown-menu btn-lg">
                    ${dropdownItems}
                </ul>
            </div>
        `;
    }

    /**
     * Attache des événements aux dropdowns.
     * @param {string} id - ID du dropdown.
     */
    attachDropdownEvents(id) {
        // Récupérer le bouton et le menu déroulant en fonction de l'ID fourni
        let dropdownButton = document.getElementById(`button-${id}`);
        let dropdownMenu = document.getElementById(id);
        // Vérifier si les éléments existent
        if (!dropdownButton || !dropdownMenu) {
            console.error(`Cannot find elements with IDs button-${id} or ${id}`);
            return;
        }
        // Ajouter un gestionnaire d'événements au menu déroulant
        if (dropdownMenu) {
            dropdownMenu.addEventListener('click', (e) => {
                // Vérifier si l'élément cliqué est une ancre dans le menu déroulant
                if (e.target.tagName === 'A') {
                    // Récupérer le texte de l'élément sélectionné
                    let selectedText = e.target.textContent;
                    // Mettre à jour le texte du bouton avec le texte sélectionné
                    dropdownButton.textContent = selectedText;
                    // Identifier le type de menu déroulant en fonction de son ID
                    if (id.startsWith("dropdownContainerUserFrom")) {
                        // Ajouter le texte sélectionné à la liste des utilisateurs de départ
                        if (this.listTo) {
                            this.listOfUserFromSelected.push(selectedText);
                            this.dropDownCopyTo();
                        }
                        // Récupérer les sessions associées à l'utilisateur sélectionné
                        this.getSessionByUser(selectedText);
                    } else if (id.startsWith("dropdownContainerUserTo")) {
                        // Mettre à jour la variable avec le texte de l'utilisateur de destination sélectionné
                        this.listOfUserToSelected = (selectedText);
                    } else if (id.startsWith("dropdownContainerSession")) {
                        // Afficher le nom de la session sélectionnée dans la console
                        console.log(`Session selected: ${selectedText}`);
                        // Stocker le nom de la session sélectionnée
                        this.sessionToCopy = (selectedText);
                    }
                }
            });
        }
    }

    /**
     * Ajoute un dropdown pour sélectionner l'utilisateur cible.
     */
    dropDownCopyTo() {
        this.nbrOfMemebre++;
        let dropdownHTMLTo = this.generateDropdown(this.listOfUser, "Membre", `dropdownContainerUserTo`);
        $('#dropdownContainerUserTo').append(dropdownHTMLTo);
        this.attachDropdownEvents(`dropdownContainerUserTo`);
        this.listTo = false;
    }

    /**
     * Récupère les sessions d'un utilisateur par son nom d'utilisateur.
     * @param {string} username - Nom d'utilisateur.
     */
    getSessionByUser(username) {
        let userId = this.listOfUser.find(user => user.username === username)['pk_user'];
        this.appCtrlInstance.getUserById(userId, this.getSessionByUserIDSuccess.bind(this), this.getSessionByUserIDCallbackError.bind(this));
    }

    /**
     * Callback de succès pour la récupération des sessions d'un utilisateur.
     * @param {Array} data - Liste des sessions.
     */
    getSessionByUserIDSuccess(data) {
        // Incrémenter le nombre de sessions récupérées
        this.nbrOfSession++;
        // Stocker les données de session dans la propriété userSession
        this.userSession = data;
        // Générer le HTML pour le dropdown de session
        let dropdownHTMLFrom = this.generateDropdownSession(data, "Session", `dropdownContainerSession`);
        // Récupérer le conteneur du dropdown de session à copier
        let container = document.getElementById('dropdownContainerSessionToCopy');
        // Vérifier si le conteneur existe
        if (!container) {
            console.error('Cannot find element with ID dropdownContainerSessionToCopy');
            return;
        }
        // Effacer les dropdowns existants
        container.innerHTML = '';
        // Ajouter le HTML du dropdown de session au conteneur
        container.innerHTML = dropdownHTMLFrom;
        // Attacher les événements au dropdown de session
        this.attachDropdownEvents(`dropdownContainerSession`);
    }

    /**
     * Génère le HTML pour un dropdown de sessions.
     * @param {Array} data - Liste des sessions.
     * @param {string} nameOfList - Nom de la liste.
     * @param {string} id - ID du dropdown.
     * @returns {string} - HTML du dropdown.
     */
    generateDropdownSession(data, nameOfList, id) {
        let dropdownItems = data.map(item => `<li><a class="dropdown-item" href="#">${item["session_name"] || item["name"]}</a></li>`).join('');
        return `
            <div class="btn-group droplist">
                <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" id="button-${id}">
                    ${nameOfList}
                </button>
                <ul id="${id}" class="dropdown-menu btn-lg">
                    ${dropdownItems}
                </ul>
            </div>
        `;
    }

    /**
     * Copie une session d'un utilisateur à un autre.
     */
    copySessionIhm() {
        // Rechercher l'identifiant de l'utilisateur sélectionné
        let userId = this.listOfUser.find(user => user.username === this.listOfUserToSelected)['pk_user'];
        // Rechercher l'identifiant de la session à copier
        let sessionId = this.userSession.find(user => user.session_name === this.sessionToCopy)['session_id'];
        // Vérifier si l'identifiant de l'utilisateur existe
        if (userId) {
            // Vérifier si l'identifiant de la session existe
            if (sessionId) {
                // Appeler la méthode pour copier la session
                this.appCtrlInstance.copySession(userId, sessionId, this.getSessioncopiedSuccess.bind(this), this.getSessioncopiedCallbackError.bind(this))
            } else {
                // Afficher un message d'erreur si aucune session n'est sélectionnée pour la copie
                this.toastError("Selectioné une session à copyé")
            }
        } else {
            // Afficher un message d'erreur si aucun utilisateur n'est sélectionné pour la copie de session
            this.toastError("Selectioné un membre à qui copyé la session")
        }
    }

    /**
     * Callback de succès pour la copie de session.
     * @param {Object} data - Réponse du serveur.
     */
    getSessioncopiedSuccess(data) {
        this.toastSuccess(data["message"])
    }

    /**
     * Callback d'erreur pour la copie de session.
     * @param {Object} error - Objet d'erreur.
     */
    getSessioncopiedCallbackError(error) {
        this.toastError(error["message"])
    }

    /**
     * Callback d'erreur pour la récupération des sessions d'un utilisateur.
     * @param {Object} error - Objet d'erreur.
     */
    getSessionByUserIDCallbackError(error) {
        this.toastError(error["message"])
    }

    /**
     * Callback d'erreur pour la récupération des membres.
     * @param {Object} error - Objet d'erreur.
     */
    getUserCallbackError(error) {
        this.toastError(error["message"])
    }

    /**
     * Affiche un message d'erreur.
     * @param {string} message - Message d'erreur.
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
     * Affiche un message de succès.
     * @param {string} message - Message de succès.
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
