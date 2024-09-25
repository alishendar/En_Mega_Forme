/**
 * updateSession.js
 *
 * Description :
 * Cette classe gère la mise à jour des sessions existantes de l'utilisateur.
 *
 * Auteur : Shendar Ali
 * Version : 1.2
 *
 * Modifications :
 *
 */
/**
 * Classe UpdateSession
 *
 * Cette classe gère la mise à jour des sessions existantes de l'utilisateur.
 * @class
 */
class UpdateSession {
    appCtrlInstance;
    listOfrMuscleSelected = [];
    exerciceIdFinl = [];
    nbreExercice = 0;
    nbrOfMuscles = 0;
    exerciceId = [];

    /**
     * Constructeur de la classe UpdateSession.
     *
     * @param {AppCtrl} appCtrlInstance - Instance du contrôleur de l'application.
     * @param {number} sessionId - ID de la session à mettre à jour.
     */
    constructor(appCtrlInstance, sessionId) {
        // Initialise l'instance du contrôleur de l'application
        this.appCtrlInstance = appCtrlInstance;
        // Masque certains éléments de l'interface utilisateur
        $('#addUserToSession').hide();
        $('#generate').hide();
        // Récupère les données de la session en fonction de l'ID de la session
        this.getSessionById(sessionId);
        // Associer les gestionnaires d'événements
        $('#updateSession').click(() => this.updateMySession(sessionId));
        $('#addMuscleToSession').click(() => this.addMuscleDropdown());
        // Récupère les données des muscles disponibles
        this.getMuscle();
    }

    /**
     * Récupère les données de la session par ID.
     *
     * @param {number} sessionId - ID de la session à récupérer.
     */
    getSessionById(sessionId) {
        // Logique pour récupérer les données de la session
        this.appCtrlInstance.getSessionById(sessionId, this.getSessionByIdSuccess.bind(this), this.geSessionByIdCallbackError.bind(this));
    }

    /**
     * Gère la réussite de la récupération des données de la session par ID.
     *
     * Cette méthode met à jour les différentes sections du formulaire avec les données
     * de la session récupérées et affiche des informations pour le débogage.
     *
     * @param {object} data - Les données de la session récupérées.
     */
    getSessionByIdSuccess(data) {
        // console.log(data);
        // Met à jour le nom de la session
        this.setSessionName(data[0].session_name);
        // Met à jour les muscles et les exercices associés
        this.setMusclesAndExercises(data);
        // Met à jour les temps de travail et de repos
        this.setWorkAndRestTime(data);
        // Met à jour le nombre d'exercices
        this.setNumberOfExercises(data);

        // console.log("exercice Id Finl ", this.exerciceIdFinl);
    }

    /**
     * Met à jour le nom de la session dans le formulaire.
     *
     * @param {string} sessionName - Le nom de la session à afficher.
     */
    setSessionName(sessionName) {
        document.getElementById('sessionName').innerHTML = sessionName;
    }

    /**
     * Met à jour les listes des muscles et des exercices et génère les éléments HTML correspondants.
     *
     * Cette méthode construit les listes des muscles et des exercices à partir des données fournies,
     * et génère le HTML pour les dropdowns de muscles dans le formulaire.
     *
     * @param {Array} exercises - La liste des exercices avec leurs détails.
     */
    setMusclesAndExercises(exercises) {
        // Réinitialise les listes des muscles sélectionnés et des exercices finaux
        this.listOfrMuscleSelected = [];
        this.exerciceIdFinl = [];

        // Parcourt les exercices pour construire les listes des muscles et des exercices
        exercises.forEach(exercise => {
            // Ajoute le muscle à la liste s'il n'est pas déjà inclus
            if (!this.listOfrMuscleSelected.includes(exercise.muscle_name)) {
                this.listOfrMuscleSelected.push(exercise.muscle_name);
            }
            // Ajoute l'ID de l'exercice et le muscle associé à la liste des exercices finaux
            this.exerciceIdFinl.push({
                exercice_id: exercise.exercise_id,
                muscle: exercise.muscle_name
            });

        });

        // Générer le HTML pour les dropdowns de muscles
        const muscleDropdownContainer = document.getElementById('dropdownContainerMuscle');
        muscleDropdownContainer.innerHTML = ''; // Clear existing dropdowns
        // Parcourt la liste des muscles sélectionnés pour générer les dropdowns
        this.listOfrMuscleSelected.forEach((muscle, index) => {
            this.nbrOfMuscles++
            const dropdownHTML = this.generateDropdown([{name: muscle}], "Muscle", `dropdownContainerMuscle-${index + 1}`);
            muscleDropdownContainer.insertAdjacentHTML('beforeend', dropdownHTML);
            document.getElementById(`button-dropdownContainerMuscle-${index + 1}`).textContent = muscle;
            this.attachDropdownEvents(`dropdownContainerMuscle-${index + 1}`);
        });
    }

    /**
     * Ajoute un menu déroulant pour sélectionner un muscle.
     *
     * Cette méthode incrémente le nombre de muscles, génère le HTML pour un nouveau dropdown,
     * attache les événements nécessaires et récupère les muscles pour peupler le nouveau dropdown.
     */
    addMuscleDropdown() {
        // Incrémente le compteur de muscles
        this.nbrOfMuscles++;
        // Génère le HTML pour un nouveau dropdown sans options initiales
        const dropdownHTML = this.generateDropdown([], "Muscle", `dropdownContainerMuscle-${this.nbrOfMuscles}`);
        // Ajoute le nouveau dropdown à l'élément container
        $('#dropdownContainerMuscle').append(dropdownHTML);
        // Attache les événements nécessaires au nouveau dropdown
        this.attachDropdownEvents(`dropdownContainerMuscle-${this.nbrOfMuscles}`);
        // Récupère et peuple les muscles pour le nouveau dropdown
        this.getMuscle();
    }

    /**
     * Attache les événements nécessaires au menu déroulant pour la sélection de muscles.
     *
     * Cette méthode ajoute un écouteur d'événements au menu déroulant spécifié par son identifiant.
     * Lorsque l'utilisateur sélectionne un muscle, le texte du bouton associé est mis à jour
     * et la liste des muscles sélectionnés est mise à jour en conséquence.
     *
     * @param {string} id - L'identifiant de l'élément de menu déroulant.
     */
    attachDropdownEvents(id) {
        // Sélectionne l'élément de menu déroulant par son identifiant
        const dropdownMenu = document.getElementById(id);
        // Ajoute un écouteur d'événements 'click' au menu déroulant
        dropdownMenu.addEventListener('click', (event) => {
          //  console.log("here")
            // Vérifie si l'élément cliqué est un lien (balise 'A')
            if (event.target.tagName === 'A') {
                // Récupère le texte du muscle sélectionné
                const selectedMuscle = event.target.textContent;
                // Récupère l'identifiant du bouton associé au menu déroulant
                const buttonId = dropdownMenu.previousElementSibling.id;
                // Met à jour le texte du bouton avec le muscle sélectionné
                document.getElementById(buttonId).textContent = selectedMuscle;
                // Met à jour la liste des muscles sélectionnés
                let idsplite = buttonId.split('-')[2]
                this.listOfrMuscleSelected[idsplite - 1] = selectedMuscle;
            }
        });
    }

    /**
     * Génère le HTML pour un menu déroulant.
     *
     * Cette méthode prend une liste de données et génère le HTML pour un menu déroulant
     * en utilisant les éléments de la liste. Le menu déroulant est identifié par un ID unique.
     *
     * @param {Array} data - La liste des éléments à afficher dans le menu déroulant.
     * @param {string} nameOfList - Le nom de la liste à afficher comme texte du bouton.
     * @param {string} id - L'identifiant unique pour le menu déroulant.
     *
     * @return {string} Le HTML généré pour le menu déroulant.
     */
    generateDropdown(data, nameOfList, id) {
        // Génère les éléments de la liste déroulante
        let dropdownItems = data.map(item => `<li><a class="dropdown-item" href="#">${item["name"]}</a></li>`).join('');
        // Retourne le HTML complet pour le menu déroulant
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
     * Met à jour le nombre d'exercices dans le formulaire.
     *
     * Cette méthode met à jour le champ de formulaire affichant le nombre d'exercices par muscle
     * et met à jour la propriété `nbreExercice` de l'instance avec la valeur récupérée.
     *
     * @param {Array} data - Les données de la session récupérées.
     */
    setNumberOfExercises(data) {
        // Met à jour le champ de formulaire avec le nombre d'exercices par muscle
        $('#nbrExercises').val(data[0]["nbrExerciceByMuscle"]);
        // Met à jour la propriété `nbreExercice` de l'instance avec la valeur récupérée
        this.nbreExercice = data[0]["nbrExerciceByMuscle"];
    }

    /**
     * Met à jour les temps de travail et de repos dans le formulaire.
     *
     * Cette méthode extrait les temps de travail et de repos des exercices fournis,
     * met à jour les éléments HTML correspondants et peuple les listes déroulantes pour
     * la sélection des minutes et des secondes.
     *
     * @param {Array} exercises - La liste des exercices avec leurs détails.
     */
    setWorkAndRestTime(exercises) {
        // Extrait les temps de travail et de repos du premier exercice
        const totalWorkTime = exercises[0]['time_of_work'];
        const totalRestTime = exercises[0]['time_of_rest'];
        // Calcule les minutes et les secondes pour le temps de travail
        const workMinutes = Math.floor(totalWorkTime / 60);
        const workSeconds = totalWorkTime % 60;
        document.getElementById('selectedWorkMinutes').textContent = workMinutes.toString().padStart(2, '0');
        document.getElementById('selectedWorkSeconds').textContent = workSeconds.toString().padStart(2, '0');
        // Calcule les minutes et les secondes pour le temps de repos
        const restMinutes = Math.floor(totalRestTime / 60);
        const restSeconds = totalRestTime % 60;
        document.getElementById('selectedRestMinutes').textContent = restMinutes.toString().padStart(2, '0');
        document.getElementById('selecteRestSeconds').textContent = restSeconds.toString().padStart(2, '0');
        // Sélectionne les éléments de liste déroulante pour le travail et le repos
        const minutesSelect = document.getElementById('workMinutes');
        const secondsSelect = document.getElementById('workSeconds');
        const restMinutesSelect = document.getElementById('restMinutes');
        const restSecondsSelect = document.getElementById('restSeconds');


        // Remplit les listes déroulantes avec les valeurs de 00 à 59
        for (let i = 0; i < 60; i++) {
            if (i === 0) {
                this.addOption(minutesSelect, "MM");
                this.addOption(restMinutesSelect, "MM");
                this.addOption(secondsSelect, "SS");
                this.addOption(restSecondsSelect, "SS");
            }
            let item = String(i).padStart(2, '0');
            this.addOption(minutesSelect, item);
            this.addOption(restMinutesSelect, item)
            this.addOption(secondsSelect, item)
            this.addOption(restSecondsSelect, item)
        }
        // Ajoute des écouteurs d'événements pour les listes déroulantes
        this.addDropdownEventListener(minutesSelect, 'selectedWorkMinutes');
        this.addDropdownEventListener(secondsSelect, 'selectedWorkSeconds');
        this.addDropdownEventListener(restMinutesSelect, 'selectedRestMinutes');
        this.addDropdownEventListener(restSecondsSelect, 'selecteRestSeconds');
    }

    /**
     * Ajoute un écouteur d'événements à une liste déroulante pour mettre à jour un élément d'affichage.
     *
     * Cette méthode ajoute un écouteur d'événements 'change' à un élément de liste déroulante.
     * Lorsque la valeur de la liste déroulante change, le texte de l'élément d'affichage correspondant
     * est mis à jour avec la nouvelle valeur sélectionnée.
     *
     * @param {HTMLElement} element - L'élément de la liste déroulante.
     * @param {string} displayElementId - L'identifiant de l'élément HTML à mettre à jour.
     */
    addDropdownEventListener(element, displayElementId) {
        element.addEventListener('change', (event) => {
            // Récupère la valeur sélectionnée dans la liste déroulante
            let selectedValue = event.target.value;
            // Met à jour le texte de l'élément d'affichage avec la valeur sélectionnée
            document.getElementById(displayElementId).textContent = selectedValue;
        });
    }

    /**
     * Ajoute une option à une liste déroulante.
     *
     * Cette méthode crée un nouvel élément d'option avec une valeur et un texte spécifiques,
     * puis l'ajoute à l'élément de liste déroulante spécifié.
     *
     * @param {HTMLElement} element - L'élément de la liste déroulante à laquelle ajouter l'option.
     * @param {string} value - La valeur de l'option à ajouter.
     */
    addOption(element, valu) {
        // Crée un nouvel élément d'option
        const minuteOptionWork = document.createElement('option');
        // Définit la valeur et le texte de l'option
        minuteOptionWork.value = valu;
        minuteOptionWork.textContent = valu;
        // Ajoute l'option à l'élément de liste déroulante
        element.appendChild(minuteOptionWork);

    }

    /**
     * Met à jour la session avec les nouvelles données.
     *
     * Cette méthode récupère les temps de travail et de repos, le nombre d'exercices,
     * et les exercices sélectionnés. Elle calcule les temps totaux, obtient les exercices
     * associés aux muscles sélectionnés, puis appelle la méthode pour mettre à jour la session
     * via le contrôleur de l'application.
     *
     * @param {number} sessionId - ID de la session à mettre à jour.
     */
    updateMySession(sessionId) {
        // Récupère les temps de travail et de repos à partir du formulaire
        const workMinutes = parseInt(document.getElementById('selectedWorkMinutes').textContent);
        const workSeconds = parseInt(document.getElementById('selectedWorkSeconds').textContent);
        const restMinutes = parseInt(document.getElementById('selectedRestMinutes').textContent);
        const restSeconds = parseInt(document.getElementById('selecteRestSeconds').textContent);
        // Récupère le nombre d'exercices à partir du formulaire
        const nbrExercises = document.getElementById('nbrExercises').value;
        // Calcule les temps totaux de travail et de repos en secondes
        const totalWorkTime = (workMinutes * 60) + workSeconds;
        const totalRestTime = (restMinutes * 60) + restSeconds;
        // Réinitialise la liste des IDs d'exercice finaux
        this.exerciceIdFinl = []
        // Obtient les exercices associés aux muscles sélectionnés
        this.getExercice(this.listOfrMuscleSelected).then(() => {
            // Met à jour la session via le contrôleur de l'application
            this.appCtrlInstance.updateSession(sessionId, totalWorkTime, totalRestTime, nbrExercises, this.exerciceIdFinl, this.updateSessionSuccess.bind(this), this.updateSessionError.bind(this));
        }).catch(error => {
            // Gère les erreurs de récupération des exercices
            console.error("Error getting exercises: ", error);
        });
    }

    /**
     * Récupère les exercices associés à chaque muscle sélectionné.
     *
     * Cette méthode crée une série de promesses pour récupérer les exercices associés à chaque muscle,
     * en introduisant un délai entre chaque appel pour éviter les problèmes de surcharge.
     *
     * @param {Array} muscles - La liste des muscles sélectionnés.
     * @return {Promise} - Une promesse qui se résout lorsque tous les exercices ont été récupérés.
     */
    getExercice(muscles) {
        // Fonction de délai pour introduire une pause entre les appels
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        // Crée une série de promesses pour récupérer les exercices associés à chaque muscle
        const promises = muscles.map((target, index) => {
            return new Promise(async (resolve, reject) => {
                try {
                    // Introduit un délai basé sur l'index pour espacer les appels
                    await delay(index * 1000);
                    // Appelle la méthode pour récupérer les exercices par muscle
                    this.appCtrlInstance.getExerciceByTaget(target, (data) => {
                        // En cas de succès, traite les données récupérées
                        this.getExerciceSuccess(data);
                        resolve();
                    }, (error) => {
                        // En cas d'erreur, traite l'erreur et rejette la promesse
                        this.getExerciceCallbackError(error);
                        reject(error);
                    });
                } catch (error) {
                    // Gère toute autre erreur et rejette la promesse
                    reject(error);
                }
            });
        });
        // Retourne une promesse qui se résout lorsque toutes les promesses sont complétées
        return Promise.all(promises);
    }

    /**
     * Traitement des données récupérées avec succès des exercices associés aux muscles sélectionnés.
     * Cette méthode initialise la liste des identifiants d'exercices (`this.exerciceId`) avec les données récupérées.
     * Ensuite, elle sélectionne aléatoirement un nombre d'exercices égal au nombre d'exercices souhaités,
     * en vérifiant d'abord si le nombre d'exercices souhaité est inférieur au nombre total d'exercices disponibles.
     * Si c'est le cas, elle sélectionne un sous-ensemble aléatoire d'exercices.
     * Sinon, elle affiche un message d'erreur et limite le nombre d'exercices sélectionnés au maximum disponible.
     *
     * @param {Array} data - Les données des exercices associés aux muscles sélectionnés.
     */
    getExerciceSuccess(data) {
        // Initialiser this.exerciceId avec les données récupérées
        data.forEach(item => {
            this.exerciceId.push({id: item['id'], muscle: item['target']});
        });
        // Vérifier si le nombre d'exercices souhaité est inférieur au nombre total d'exercices disponibles
        if (this.nbreExercice < this.exerciceId.length) {
            // Sélectionner aléatoirement un sous-ensemble d'exercices égal au nombre d'exercices souhaité
            const randomElements = this.getRandomElements(this.exerciceId, this.nbreExercice);
            // Ajouter les exercices sélectionnés à la liste finale des exercices
            this.exerciceIdFinl.push(randomElements.map(element => ({
                "exercice_id": element.id,
                "muscle": element.muscle
            })));
        } else {
            // Afficher un message d'erreur si le nombre d'exercices souhaité est supérieur au nombre total disponible
            this.toastError("Le nombre d'exercice que vous avez choisi est plus grand que ce qui se trouve dans notre base de données, donc nous allons limiter par le max");
            // Limiter le nombre d'exercices sélectionnés au maximum disponible
            const randomElements = this.getRandomElements(this.exerciceId, this.exerciceId.length);
            // Ajouter les exercices sélectionnés à la liste finale des exercices
            this.exerciceIdFinl.push(randomElements.map(element => ({
                "exercice_id": element.id,
                "muscle": element.muscle
            })));
        }

       // console.log("exercice Id Finl ", this.exerciceIdFinl);
    }

    /**
     * Sélectionne aléatoirement un sous-ensemble d'éléments d'un tableau.
     *
     * @param {Array} arr - Le tableau source.
     * @param {number} n - Le nombre d'éléments à sélectionner.
     * @returns {Array} - Un tableau contenant les éléments sélectionnés aléatoirement.
     * @throws {RangeError} - Si le nombre d'éléments à sélectionner est supérieur au nombre d'éléments disponibles dans le tableau.
     */
    getRandomElements(arr, n) {
        // Initialiser un tableau pour stocker les éléments sélectionnés
        let result = new Array(n),
            // Obtenir la longueur du tableau source
            len = arr.length,
            // Initialiser un tableau pour suivre les indices des éléments déjà sélectionnés
            taken = new Array(len);
        // Vérifier si le nombre d'éléments à sélectionner est supérieur à la longueur du tableau source
        if (n > len)
            // Lever une erreur si le nombre d'éléments à sélectionner est supérieur au nombre d'éléments disponibles
            throw new RangeError("getRandomElements: more elements taken than available");
        // Boucler pour sélectionner n éléments aléatoires
        while (n--) {
            // Générer un index aléatoire
            let x = Math.floor(Math.random() * len);
            // Sélectionner un élément du tableau source à l'index généré, en évitant les indices déjà pris
            result[n] = arr[x in taken ? taken[x] : x];
            // Marquer l'index sélectionné comme pris
            taken[x] = --len in taken ? taken[len] : len;
        }
        // Retourner le tableau contenant les éléments sélectionnés aléatoirement
        return result;
    }

    /**
     * Callback d'erreur pour la récupération des exercices.
     * @param {Object} error - Objet d'erreur.
     */
    getExerciceCallbackError(error) {
        this.toastError(error["message"])
      //  console.log(error)
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
        document.querySelectorAll('.dropdown-menu').forEach((dropdown) => {
            dropdown.innerHTML = data.map(item => `<li><a class="dropdown-item" href="#">${item.name}</a></li>`).join('');
        });
    }

    /**
     * Callback d'erreur pour la récupération des muscles.
     * @param {Object} error - Objet d'erreur.
     */
    getMusclesCallbackError(error) {
        this.toastError(error["message"]);
    }

    /**
     * Callback de succès pour la mise à jour de la session.
     * @param {Object} response - Réponse du serveur.
     */
    updateSessionSuccess(response) {
        this.appCtrlInstance.getToast().fire({
            icon: "success",
            title: "Success",
            text: "Session updated successfully",
            timer: 2000,
            timerProgressBar: true,
            allowOutsideClick: false,
            showConfirmButton: false,
        });
    }

    /**
     * Callback d'erreur pour la mise à jour de la session.
     * @param {Object} error - Objet d'erreur.
     */
    updateSessionError(error) {
        this.toastError(error["message"]);
    }

    /**
     * Callback d'erreur pour la récupération des informations de la session.
     * @param {Object} error - Objet d'erreur.
     */
    geSessionByIdCallbackError(error) {
        this.toastError(error["message"]);
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
}
