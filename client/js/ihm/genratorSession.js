/**
 * genratorSession.js
 *
 * Description :
 * Cette classe va gérer la création et les interactions entre l'utilisateur et ses sessions.
 *
 * Auteur : Shendar Ali
 * Version : 1.2
 *
 * Modifications :
 *
 */
/**
 * Classe GenratorSession
 * @class
 */
class GenratorSession {
    appCtrlInstance;
    listOfUser;
    listOfMuscle;
    nbrOfMemebre = 0;
    nbrOfMuscles = 0;
    nbreExercice = 0;
    exerciceId = [];
    exerciceIdFinl = [];
    userIds = [];
    listOfUserSelected = [];
    listOfrMuscleSelected = [];
    muscle;
    userStat;

    /**
     * Constructeur de la classe GenratorSession.
     * @param {AppCtrl} appCtrlInstance - Instance du contrôleur de l'application.
     * @param {number} userStat - Statut de l'utilisateur.
     * @param {number} idSession - ID de la session (optionnel).
     */
    constructor(appCtrlInstance, userStat, idSession) {
        // Initialise les variables de la classe avec les valeurs passées en paramètres
        this.userStat = userStat;
        this.appCtrlInstance = appCtrlInstance;
        // Associe les événements aux boutons correspondants
        $('#addUserToSession').click(() => {
            this.addMemberDropdown();
        });
        $('#addMuscleToSession').click(() => {
            this.addMuscleDropdown();
        });
        $('#generate').click(() => {
            this.generateSession()
        });
        // Cache le bouton de mise à jour de la session par défaut
        $('#updateSession').hide();
        this.time();
        // Exécute les actions spécifiques à l'utilisateur en fonction de son statut
        if (userStat == 1) {
            this.getmembre();

        } else {
            $('#addUserToSession').hide();
        }
        // Récupère la liste des muscles
        this.getMuscle();
    }

    /**
     * Ajoute un dropdown pour les membres.
     */
    addMemberDropdown() {
        // Incrémente le compteur de membres
        this.nbrOfMemebre++;
        // Génère le code HTML pour le menu déroulant
        let dropdownHTML = this.generateDropdown(this.listOfUser, "Membre", `dropdownContainerUser-${this.nbrOfMemebre}`);
        // Ajoute le menu déroulant au conteneur correspondant dans le DOM
        $('#dropdownContainerUser').append(dropdownHTML);
        // Associe les événements au nouveau menu déroulant
        this.attachDropdownEvents(`dropdownContainerUser-${this.nbrOfMemebre}`);
    }

    /**
     * Ajoute un nouveau menu déroulant pour sélectionner un muscle.
     * @param {string} muscle - Le nom du muscle à ajouter au menu déroulant.
     */
    addMuscleDropdown(muscle) {
        // Incrémente le compteur de muscles
        this.nbrOfMuscles++;
        // Génère le code HTML pour le menu déroulant avec le muscle spécifié
        let dropdownHTML = this.generateDropdown(this.listOfMuscle, "Muscle", `dropdownContainerMuscle-${this.nbrOfMuscles}`);
        // Ajoute le menu déroulant au conteneur correspondant dans le DOM
        $('#dropdownContainerMuscle').append(dropdownHTML);
        // Associe les événements au nouveau menu déroulant
        this.attachDropdownEvents(`dropdownContainerMuscle-${this.nbrOfMuscles}`);
    }

    /**
     * Récupère les membres depuis le serveur.
     * @param {number} userStat - Statut de l'utilisateur.
     */
    getmembre(userStat) {
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
     * Associe les événements de clic aux éléments du menu déroulant.
     * @param {string} id - L'identifiant de l'élément du menu déroulant.
     */
    attachDropdownEvents(id) {
        // Récupère le bouton du menu déroulant
        let dropdownButton = document.getElementById(`button-${id}`);
        // Récupère le menu déroulant lui-même
        let dropdownMenu = document.getElementById(id);
        // Vérifie si le menu déroulant existe
        if (dropdownMenu) {
            // Ajoute un écouteur d'événements au menu déroulant
            dropdownMenu.addEventListener('click', (e) => {
                // Vérifie si l'élément cliqué est un lien dans le menu déroulant
                if (e.target.tagName === 'A') {
                    // Récupère le texte de l'élément cliqué
                    let selectedText = e.target.textContent;
                    // Met à jour le texte du bouton du menu déroulant avec le texte sélectionné
                    dropdownButton.textContent = selectedText;
                    // Ajoute le texte sélectionné à la liste appropriée en fonction de l'identifiant
                    if (id.startsWith("dropdownContainerUser")) {
                        this.listOfUserSelected.push(selectedText)
                        console.log("dropdownContainerUser");
                    } else if (id.startsWith("dropdownContainerMuscle")) {
                        this.listOfrMuscleSelected.push(selectedText)
                        console.log("dropdownContainerMuscle");
                    }
                }
            });
        }
    }

    /**
     * Génère le code HTML d'un menu déroulant à partir des données fournies.
     * @param {Array} data - Les données à afficher dans le menu déroulant.
     * @param {string} nameOfList - Le nom du menu déroulant.
     * @param {string} id - L'identifiant unique du menu déroulant.
     * @returns {string} Le code HTML du menu déroulant généré.
     */
    generateDropdown(data, nameOfList, id) {
        // Convertit les données en une chaîne HTML représentant les éléments du menu déroulant
        let dropdownItems = data.map(item => `<li><a class="dropdown-item" href="#">${item["username"] || item["name"]}</a></li>`).join('');
        // Retourne le code HTML complet du menu déroulant
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
     * Callback d'erreur pour la récupération des membres.
     * @param {Object} error - Objet d'erreur.
     */
    getUserCallbackError(error) {
        console.error("Failed to fetch user data:", error);
    }

    /**
     * Récupère la liste des muscles depuis le serveur.
     */
    getMuscle() {
        this.appCtrlInstance.getAllMuscles(this.getMusclesSuccess.bind(this), this.getMusclesCallbackError.bind(this));
    }

    /**
     * Callback de succès pour la récupération des muscles.
     * @param {Array} data - Liste des muscles.
     */
    getMusclesSuccess(data) {
        this.listOfMuscle = data;
        this.addMuscleDropdown(); // Add initial muscle dropdown
    }

    /**
     * Callback d'erreur pour la récupération des muscles.
     * @param {Object} error - Objet d'erreur.
     */
    getMusclesCallbackError(error) {
        console.log(error + error);
    }

    /**
     * Initialise les menus déroulants de sélection du temps de travail et de repos.
     */
    time() {
        // Récupère les éléments des menus déroulants
        const minutesSelect = document.getElementById('workMinutes');
        const secondsSelect = document.getElementById('workSeconds');
        const restMinutesSelect = document.getElementById('restMinutes');
        const restSecondsSelect = document.getElementById('restSeconds');
        // Remplit les menus déroulants avec les options de minutes et de secondes
        for (let i = 0; i < 60; i++) {
            // Ajoute les options "MM" et "SS" pour les minutes et les secondes respectivement
            if (i === 0) {
                this.addOption(minutesSelect, "MM");
                this.addOption(restMinutesSelect, "MM");
                this.addOption(secondsSelect, "SS");
                this.addOption(restSecondsSelect, "SS");
            }
            // Ajoute les options numériques pour les minutes et les secondes
            let item = String(i).padStart(2, '0');
            this.addOption(minutesSelect, item);
            this.addOption(restMinutesSelect, item)
            this.addOption(secondsSelect, item)
            this.addOption(restSecondsSelect, item)
        }
        // Ajoute des écouteurs d'événements aux menus déroulants pour mettre à jour les valeurs sélectionnées
        this.addDropdownEventListener(minutesSelect, 'selectedWorkMinutes');
        this.addDropdownEventListener(secondsSelect, 'selectedWorkSeconds');
        this.addDropdownEventListener(restMinutesSelect, 'selectedRestMinutes');
        this.addDropdownEventListener(restSecondsSelect, 'selecteRestSeconds');
    }

    /**
     * Ajoute une option à un élément dropdown.
     * @param {HTMLElement} element - Élément dropdown.
     * @param {string} value - Valeur de l'option.
     */
    addOption(element, valu) {
        const minuteOptionWork = document.createElement('option');
        minuteOptionWork.value = valu;
        minuteOptionWork.textContent = valu;
        element.appendChild(minuteOptionWork);

    }

    /**
     * Ajoute un gestionnaire d'événements pour les dropdowns.
     * @param {HTMLElement} element - Élément dropdown.
     * @param {string} displayElementId - ID de l'élément d'affichage.
     */
    addDropdownEventListener(element, displayElementId) {
        element.addEventListener('change', (event) => {
            let selectedValue = event.target.value;
            document.getElementById(displayElementId).textContent = selectedValue;
        });
    }

    /**
     * Génère une nouvelle session en récupérant les informations nécessaires et en les envoyant au contrôleur de l'application.
     */
    generateSession() {
        // Vérifie les valeurs sélectionnées pour le temps de travail et de pause
        let tempsW = this.verfyTimerSelectede('#workMinutes', '#workSeconds');
        let tempsP = this.verfyTimerSelectede('#restMinutes', '#restSeconds');
        // Récupère le nombre d'exercices saisi par l'utilisateur
        this.nbreExercice = parseInt($('#nbrExercises').val());
        // Récupère les exercices correspondant aux muscles sélectionnés
        this.getExercice(this.listOfrMuscleSelected).then(() => {
            // Vérifie si le temps de travail a été spécifié
            if (tempsW) {
                // Vérifie si le temps de pause a été spécifié
                if (tempsP) {
                    // Vérifie si le nombre d'exercices a été spécifié
                    if (this.nbreExercice) {
                        // Si l'utilisateur est un administrateur
                        if (this.userStat === "1") {
                            // Récupère les identifiants des membres sélectionnés
                            this.getUserId(this.listOfUserSelected);
                            // Vérifie si au moins un membre a été sélectionné
                            if (this.userIds.length >= 1) {
                                // Vérifie si au moins un exercice a été sélectionné pour chaque muscle
                                if (this.exerciceIdFinl.length >= 1) {
                                    // Crée un nom de session
                                    let name = this.creatSessionName();
                                    // Envoie les informations de la nouvelle session au contrôleur de l'application
                                    this.appCtrlInstance.sendNewSession(name, tempsW, tempsP, this.nbreExercice, this.userIds, this.exerciceIdFinl, this.getCreatSessionSuccess.bind(this), this.getCreatSessionCallbackError.bind(this));
                                } else {
                                    this.toastError("Merci de selectioné une muscle");
                                }
                            } else {
                                this.toastError("Merci de selectioné une membre");
                            }
                        } else {
                            // Si l'utilisateur n'est pas un administrateur
                            // Vérifie si au moins un exercice a été sélectionné pour chaque muscle
                            if (this.exerciceIdFinl.length >= 1) {
                                // Crée un nom de session
                                let name = this.creatSessionName();
                                // Envoie les informations de la nouvelle session au contrôleur de l'application
                                this.appCtrlInstance.sendNewSession(name, tempsW, tempsP, this.nbreExercice, this.appCtrlInstance.getUserId(), this.exerciceIdFinl, this.getCreatSessionSuccess.bind(this), this.getCreatSessionCallbackError.bind(this));
                            } else {
                                this.toastError("Merci de selectioné une muscle");
                            }
                        }
                    } else {
                        this.toastError("Merci de remplir le nombre d'exercices");
                    }
                } else {
                    this.toastError("Merci de remplir le temps de pause");
                }
            } else {
                this.toastError("Merci de remplir le temps de travail");
            }
        }).catch(error => {
            console.error("Error getting exercises: ", error);
        });
    }

    /**
     * Récupère les exercices correspondant à une liste de muscles donnée.
     * @param {Array} muscles - Liste des muscles pour lesquels récupérer les exercices.
     * @returns {Promise} - Une promesse qui se résout une fois que toutes les requêtes sont terminées.
     */
    getExercice(muscles) {
        // Définir une fonction de délai pour espacer les appels
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        // Créer un tableau de promesses pour chaque muscle

        const promises = muscles.map((target, index) => {
            return new Promise(async (resolve, reject) => {
                try {
                    // Attendre index * 1 seconde avant chaque appel pour espacer les requêtes
                    await delay(index * 1000);
                    this.appCtrlInstance.getExerciceByTaget(target, (data) => {
                        // En cas de succès, appeler la fonction getExerciceSuccess pour traiter les données
                        this.getExerciceSuccess(data);
                        resolve();
                    }, (error) => {
                        // En cas d'erreur, appeler la fonction getExerciceCallbackError pour gérer l'erreur
                        this.getExerciceCallbackError(error);
                        reject(error);
                    });
                } catch (error) {
                    // Rejeter la promesse en cas d'erreur
                    reject(error);
                }
            });
        });
        // Renvoyer une promesse qui se résout lorsque toutes les requêtes sont terminées
        return Promise.all(promises);
    }

    /**
     * Fonction appelée en cas de succès de la récupération des exercices.
     * @param {Array} data - Les données des exercices récupérés.
     */
    getExerciceSuccess(data) {
        // Assurez-vous d'initialiser this.exerciceId à un tableau vide à chaque appel
        this.exerciceId = [];
        // Parcourir les données des exercices
        data.forEach(item => {
            // Ajouter chaque exercice à this.exerciceId sous la forme d'un objet avec les clés 'id' et 'muscle'
            this.exerciceId.push({id: item['id'], muscle: item['target']});
        });
        // Vérifier si le nombre d'exercices choisi est inférieur au nombre total d'exercices disponibles
        if (this.nbreExercice < this.exerciceId.length) {
            // Si oui, sélectionner un nombre aléatoire d'exercices parmi ceux disponibles
            const randomElements = this.getRandomElements(this.exerciceId, this.nbreExercice);
            // Ajouter les exercices sélectionnés à this.exerciceIdFinl
            this.exerciceIdFinl.push(randomElements.map(element => ({
                "exercice_id": element.id,
                "muscle": element.muscle
            })));
        } else {
            // Si le nombre d'exercices choisi est supérieur ou égal au nombre total d'exercices disponibles
            // Afficher un message d'erreur et limiter le nombre d'exercices à la valeur maximale disponible
            this.toastError("Le nombre d'exercice que vous avez choisi est plus grand que ce qui se trouve dans notre base de données, donc nous allons limiter par le max");
            const randomElements = this.getRandomElements(this.exerciceId, this.exerciceId.length);
            this.exerciceIdFinl.push(randomElements.map(element => ({
                "exercise_id": element.id,
                "muscle": element.muscle
            })));
        }

        //console.log("exercice Id Finl ", this.exerciceIdFinl);
    }

    /**
     * Retourne un tableau contenant un nombre spécifié d'éléments aléatoires
     * sélectionnés à partir d'un tableau donné.
     * @param {Array} arr - Le tableau à partir duquel sélectionner les éléments.
     * @param {number} n - Le nombre d'éléments à sélectionner.
     * @returns {Array} - Un tableau contenant les éléments sélectionnés.
     */
    getRandomElements(arr, n) {
        // Tableau pour stocker les éléments sélectionnés
        let result = new Array(n),
            len = arr.length,
            taken = new Array(len);
        // Vérifie si le nombre d'éléments à sélectionner est supérieur à la longueur du tableau initial
        if (n > len)
            throw new RangeError("getRandomElements: more elements taken than available");
        // Boucle pour sélectionner n éléments aléatoires
        while (n--) {
            let x = Math.floor(Math.random() * len);
            result[n] = arr[x in taken ? taken[x] : x];
            taken[x] = --len in taken ? taken[len] : len;
        }
        return result;
    }

    /**
     * Callback d'erreur pour la récupération des exercices.
     * @param {Object} error - Objet d'erreur.
     */
    getExerciceCallbackError(error) {
        this.toastError(error["message"]);
        console.log(error);
    }

    /**
     * Vérifie si des valeurs de minute et de seconde ont été sélectionnées
     * et calcule la durée totale en secondes.
     * @param {string} idM - ID de l'élément HTML pour les minutes.
     * @param {string} idS - ID de l'élément HTML pour les secondes.
     * @returns {number|boolean} - La durée totale en secondes ou false si aucune valeur n'est sélectionnée.
     */
    verfyTimerSelectede(idM, idS) {
        // Variable pour stocker la valeur de la durée totale
        let valeur;
        // Vérifie si une valeur de minute est sélectionnée
        if ($(idM).val() != "MM") {
            // Si oui, vérifie si une valeur de seconde est également sélectionnée
            console.log($(idM).val())
            if ($(idS).val() != "SS") {
                // Si oui, calcule la durée totale en secondes en convertissant les minutes en secondes et en ajoutant les secondes
                console.log($(idS).val())
                valeur = parseInt($(idM).val()) * 60 + parseInt($(idS).val())
            } else {
                // Si seule une valeur de minute est sélectionnée, convertit les minutes en secondes
                valeur = parseInt($(idM).val()) * 60
            }
        } else {
            // Si aucune valeur de minute n'est sélectionnée
            if ($(idS).val() != "SS") {
                // Vérifie si une valeur de seconde est sélectionnée
                // Si oui, utilise simplement la valeur de seconde
                valeur = parseInt($(idS).val())
            } else {
                // Si aucune valeur n'est sélectionnée pour les minutes et les secondes, retourne false
                valeur = false;
            }
        }
        // Vérifie si la valeur calculée est supérieure à zéro
        if (valeur > 0) {
            // Retourne la durée totale en secondes
            return valeur
        } else {
            // Retourne false si aucune valeur n'est sélectionnée ou si la valeur est inférieure ou égale à zéro
            return false
        }
    }

    /**
     * Récupère les IDs des utilisateurs sélectionnés.
     * @param {Array} usernames - Liste des noms d'utilisateur.
     */
    getUserId(usernames) {
        usernames.forEach((username) =>
            this.userIds.push(this.listOfUser.find(user => user.username === username)['pk_user'])
        )
        console.log("userIds" + this.userIds)
    }

    /**
     * Callback de succès pour la création de la session.
     * @param {Object} data - Réponse du serveur.
     */
    getCreatSessionSuccess(data) {
        this.toastSuccess(data["message"]);
        this.appCtrlInstance.loadGeneratorSession();
        console.log(data)
    }

    /**
     * Callback d'erreur pour la création de la session.
     * @param {Object} error - Objet d'erreur.
     */
    getCreatSessionCallbackError(error) {
        this.toastError(error["message"])
        console.log(error)
    }

    /**
     * Crée un nom pour la session en fonction des muscles sélectionnés.
     * @returns {string} - Nom de la session.
     */
    creatSessionName() {
        let name = "Session";
        this.listOfrMuscleSelected.forEach((muscle) =>
            name += "-" + muscle
        )
        return name;
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
