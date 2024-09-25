/**
 * startSeesion.js
 *
 * Description :
 * Cette classe va gérer le démarrage de session
 *
 * Auteur : Shendar Ali
 * Version : 1.2
 *
 * Modifications :
 *
 */
/**
 * Classe StartSession
 *
 * Cette classe gère le démarrage et le suivi d'une session d'exercice.
 * @class
 */
class StartSession {
    /**
     * Constructeur de la classe StartSession.
     * @param {AppCtrl} appCtrlInstance - Instance du contrôleur de l'application.
     * @param {number} sessionId - ID de la session à démarrer.
     */
    constructor(appCtrlInstance, sessionId) {
        // Initialisation des propriétés de l'instance
        this.appCtrlInstance = appCtrlInstance;
        this.sessionId = sessionId;
        this.synth = window.speechSynthesis;// Initialisation de la synthèse vocale
        this.voices = [];
        this.currentExerciseIndex = 0;
        this.stopStart = true;
        this.interval = 1000;// Intervalle en millisecondes pour les minuteurs
        this.intervalTotal = null; // Référence au minuteur total
        this.intervalWP = null;// Référence au minuteur de travail/pause
        this.valueMMT = 0;// Minutes du minuteur total
        this.valueSST = 0;// Secondes du total
        this.valueWPMMT = 0; // Minutes du minuteur de travail/pause
        this.valueWPSST = 0;// Secondes du minuteur de travail/pause
        this.type = null;// Type de minuteur en cours ('work' ou 'rest')
        this.btntextP = "Pause"; // Texte du bouton pour la pause
        this.btntextRe = "Recommence";// Texte du bouton pour la reprise
        this.remainingTotalTime = 0; // Pour mémoriser le temps total restant
        this.remainingWorkPauseTime = 0; // Pour mémoriser le temps de travail/pause restant
        // Associer les gestionnaires d'événements pour le bouton de pause/reprise
        $('#pause').click(() => {
            if (this.stopStart) {
                // Arrête les minuteurs en cours
                this.stopTimer();
                this.stopTotalTimeTimer();
                this.stopStart = false;// Change l'état pour indiquer que le minuteur est arrêté
            } else {
                // Redémarre les minuteurs avec le temps restant
                this.startTotalTimeTimer(this.remainingTotalTime);
                this.startTimer(this.remainingWorkPauseTime, this.type);
                this.stopStart = true;// Change l'état pour indiquer que le minuteur est en cours
            }
            // Met à jour le texte du bouton de pause/reprise
            document.querySelector("#pause").textContent = this.stopStart ? this.btntextP : this.btntextRe;
        });
        // Si un sessionId est fourni, récupère les données de la session
        if (sessionId) {
            this.getSessionData(sessionId);
        } else {
            // Affiche une erreur si aucun sessionId n'est fourni
            this.toastError("La session n'est pas trouvée");
        }
        // Initialise les voix disponibles pour la synthèse vocale
        this.populateVoices();
    }
    /**
     * Récupère les données de la session depuis le serveur.
     * @param {number} sessionId - ID de la session.
     */
    getSessionData(sessionId) {
        this.appCtrlInstance.getStartSession(sessionId, this.getstartSuccess.bind(this), this.gestartSessionCallbackError.bind(this));
    }
    /**
     * Gère la réussite de l'initialisation de la session.
     *
     * Cette méthode est appelée lorsque les données de la session sont récupérées avec succès.
     * Elle initialise les données de la session, démarre le minuteur total et affiche le premier exercice.
     *
     * @param {Array} data - Les données de la session récupérées.
     */
    getstartSuccess(data) {
        // Vérifie si les données récupérées ne sont pas vides
        if (data.length > 0) {
            // Stocke les données de la session
            this.data = data;
            // Récupère et convertit le temps total de la session en entier
            this.totalTime = parseInt(this.data[0].total_time, 10);
            // Démarre le minuteur pour le temps total de la session
            this.startTotalTimeTimer(this.totalTime);
            // Affiche le premier exercice de la session
            this.displayExercise(this.currentExerciseIndex);
        }
    }
    /**
     * Affiche les détails de l'exercice actuel et prépare le suivant.
     *
     * Cette méthode met à jour l'affichage de l'interface utilisateur pour montrer les informations
     * de l'exercice actuel, y compris le temps de travail restant et les GIFs associés. Elle prépare
     * également les informations pour l'exercice suivant.
     *
     * @param {number} index - L'index de l'exercice actuel dans la liste des exercices.
     */
    async displayExercise(index) {
        // Récupère les détails de l'exercice actuel et du prochain exercice
        const exercise = this.data[index];
        this.nextExercise = this.data[index + 1] || {};
        // Met à jour l'affichage du temps de travail pour l'exercice actuel
        document.getElementById('worktimespan').innerText = this.formatTime(exercise.time_of_work);
        // Récupère et met à jour l'affichage du GIF pour l'exercice actuel
        const gifUrl = await this.getGifFromCacheOrNetwork(exercise.gifUrl);
        document.getElementById('gifFirest').src = gifUrl;
        // Récupère et met à jour l'affichage du GIF pour le prochain exercice (si disponible)
        const nextGifUrl = this.nextExercise.gifUrl ? await this.getGifFromCacheOrNetwork(this.nextExercise.gifUrl) : '';
        document.getElementById('gifTow').src = nextGifUrl;
        // Met à jour l'affichage des noms de l'exercice actuel et du prochain exercice
        document.getElementById('firstExercice').innerText = exercise.name;
        document.getElementById('nextExercice').innerText = this.nextExercise.name || 'Fin de la session';
        // Démarre le minuteur pour l'exercice actuel
        this.startTimer(exercise.time_of_work, 'work');
    }
    /**
     * Récupère un GIF à partir du cache ou du réseau.
     *
     * Cette méthode tente d'abord de trouver le GIF dans le cache. Si le GIF n'est pas
     * trouvé dans le cache, elle essaie de le récupérer depuis le réseau et de le mettre
     * en cache pour les futures requêtes.
     *
     * @param {string} url - L'URL du GIF à récupérer.
     *
     * @return {Promise<string>} - Une promesse qui se résout avec l'URL du GIF.
     *
     * @throws {Error} - Si la récupération du GIF échoue.
     */
    async getGifFromCacheOrNetwork(url) {
        // Ouvre le cache nommé 'my-gif-cache'
        const cache = await caches.open('my-gif-cache');
        // Tente de trouver une réponse en cache pour l'URL donnée
        const cachedResponse = await cache.match(url);
        // Si une réponse en cache est trouvée, la retourne
        if (cachedResponse) {
            console.log(`Found in cache: ${url}`);
            return url;
        }

        try {
            // Tente de récupérer le GIF depuis le réseau
            const networkResponse = await fetch(url, { mode: 'no-cors' });
            // Vérifie si la réponse réseau est de type 'opaque' ou réussie
            if (networkResponse.type === 'opaque' || networkResponse.ok) {
                // Met en cache la réponse réseau
                await cache.put(url, networkResponse.clone());
                console.log(`Fetched and cached (opaque): ${url}`);
                return url; // Return the URL directly since the response is opaque
            } else {
                console.error(`Network request failed for ${url} with status: ${networkResponse.status}`);
            }
        } catch (error) {
            // Log l'erreur si la récupération réseau échoue
            console.error(`Fetch error: ${error.message} for URL: ${url}`);
        }
        // Lance une erreur si la récupération du GIF échoue
        throw new Error('Failed to fetch GIF');
    }


    /**
     * Démarre un minuteur pour le temps total d'une session.
     *
     * Cette méthode configure et démarre un intervalle pour décompter le temps total restant
     * pour une session, affiche le temps restant, et déclenche des actions spécifiques
     * lorsque le minuteur atteint zéro.
     *
     * @param {number} duration - La durée totale du minuteur en secondes.
     */
    startTotalTimeTimer(duration) {
        // Mémorise le temps total restant
        this.remainingTotalTime = duration;
        // Sélectionne l'élément d'affichage pour le minuteur total
        const display = document.getElementById('countdown');
        // Configure l'intervalle pour mettre à jour l'affichage du minuteur chaque seconde
        this.intervalTotal = setInterval(() => {
            // Calcule les minutes et les secondes restantes
            const minutes = parseInt(this.remainingTotalTime / 60, 10);
            const seconds = parseInt(this.remainingTotalTime % 60, 10);
            // Formate les minutes et les secondes pour l'affichage
            this.valueMMT = minutes < 10 ? "0" + minutes : minutes;
            this.valueSST = seconds < 10 ? "0" + seconds : seconds;
            // Met à jour l'affichage du minuteur
            display.textContent = `${this.valueMMT}:${this.valueSST}`;
            // Décrémente le temps restant et vérifie si le minuteur est terminé
            if (--this.remainingTotalTime < 0) {
                // Efface l'intervalle actif pour arrêter le minuteur
                clearInterval(this.intervalTotal);
                // Affiche un message de succès indiquant que la session est terminée
                this.toastSuccess('La session est terminée.');
                // Appelle une fonction pour gérer la fin de la session
                this.sessionGetFinish();
            }
        }, this.interval);// Intervalle de mise à jour (probablement défini ailleurs dans le code)
    }
    /**
     * Arrête le timer pour le temps total de la session.
     */
    stopTotalTimeTimer() {
        clearInterval(this.intervalTotal);
    }
    /**
     * Démarre un minuteur pour une durée spécifiée et un type (travail ou pause).
     *
     * Cette méthode configure et démarre un intervalle pour décompter le temps de travail ou de pause,
     * affiche le temps restant, et appelle des fonctions spécifiques lorsque le minuteur atteint certains points.
     *
     * @param {number} duration - La durée du minuteur en secondes.
     * @param {string} type - Le type de minuteur ('work' pour travail, 'rest' pour pause).
     */
    startTimer(duration, type) {
        // Mémorise le temps de travail/pause restant
        this.remainingWorkPauseTime = duration; // Mémorise le temps de travail/pause restant
        this.type = type;
        // Sélectionne l'élément d'affichage approprié en fonction du type de minuteur
        const display = type === 'work' ? document.getElementById('worktimespan') : document.getElementById('PauseTime');
        // Configure l'intervalle pour mettre à jour l'affichage du minuteur chaque seconde
        this.intervalWP = setInterval(() => {
            // Calcule les minutes et les secondes restantes
            const minutes = parseInt(this.remainingWorkPauseTime / 60, 10);
            const seconds = parseInt(this.remainingWorkPauseTime % 60, 10);
            // Formate les minutes et les secondes pour l'affichage
            this.valueWPMMT = minutes < 10 ? "0" + minutes : minutes;
            this.valueWPSST = seconds < 10 ? "0" + seconds : seconds;
            // Met à jour l'affichage du minuteur
            display.textContent = `${this.valueWPMMT}:${this.valueWPSST}`;
            // Conditions spécifiques pour le type 'work'
            if (type === "work") {
                if (this.valueWPMMT == "00" && this.valueWPSST == "12") {
                    this.speak("Pause dans ");
                } else if (this.valueWPMMT == "00" && this.valueWPSST < "10"&&this.valueWPSST>"00" ) {
                    let nbr=this.valueWPSST
                    this.speak(parseInt(nbr));
                }
            // Conditions spécifiques pour le type 'rest'
            } else if (type === "rest") {
                if (this.valueWPMMT == "00" && this.valueWPSST == "15") {
                    this.speak(`Exercice suivant ${this.nextExercise.name} dans`);

                }else if (this.valueWPMMT == "00" && this.valueWPSST < "10" &&this.valueWPSST>"00" ) {
                    let nbr=this.valueWPSST

                    this.speak(parseInt(nbr));
                }
            }
            // Décrémente le temps restant et vérifie si le minuteur est terminé
            if (--this.remainingWorkPauseTime < 0) {
                clearInterval(this.intervalWP);
                // Appelle des fonctions spécifiques lorsque le minuteur se termine
                if (type === 'work') {
                    this.handleWorkComplete();
                } else if (type === 'rest') {
                    this.handleRestComplete();
                }
            }
        }, this.interval);// Intervalle de mise à jour (probablement défini ailleurs dans le code)
    }
    /**
     * Arrête le minuteur en cours.
     *
     * Cette méthode efface l'intervalle actif utilisé pour le minuteur,
     * ce qui arrête le décompte du temps.
     */
    stopTimer() {
        // Efface l'intervalle actif pour arrêter le minuteur
        clearInterval(this.intervalWP);
    }
    /**
     * Gère la fin d'une période de travail.
     *
     * Cette méthode vérifie s'il y a un exercice suivant dans la session. Si oui,
     * elle lance le minuteur de pause. Sinon, elle affiche un message de succès
     * indiquant que la session est terminée.
     */
    handleWorkComplete() {
        // Récupère l'exercice suivant dans la session
        const nextExercise = this.data[this.currentExerciseIndex + 1];

        if (nextExercise) {
            // Réinitialise l'affichage pour le prochain exercice
            document.getElementById('gifFirest').src = '';
            document.getElementById('firstExercice').innerText = '';
            // Lance le minuteur de pause pour l'exercice actuel
            this.startTimer(this.data[this.currentExerciseIndex].time_of_rest, 'rest');
        } else {
            // Affiche un message de succès si la session est terminée
            this.toastSuccess('La session est terminée.');
        }
    }
    /**
     * Gère la fin d'une période de repos.
     *
     * Cette méthode incrémente l'index de l'exercice actuel et vérifie s'il y a un exercice suivant.
     * Si oui, elle affiche l'exercice suivant. Sinon, elle affiche un message de succès indiquant
     * que la session est terminée.
     */
    handleRestComplete() {
        // Incrémente l'index de l'exercice actuel
        this.currentExerciseIndex++;
        // Vérifie s'il y a un exercice suivant dans la session
        if (this.currentExerciseIndex < this.data.length) {
            // Affiche l'exercice suivant
            this.displayExercise(this.currentExerciseIndex);
        } else {
            // Affiche un message de succès si la session est terminée
            this.toastSuccess('La session est terminée.');
        }
    }
    /**
     * Formate un temps donné en secondes en une chaîne de caractères au format MM:SS.
     *
     * Cette méthode prend un nombre de secondes et le convertit en minutes et secondes,
     * en ajoutant un zéro devant les valeurs inférieures à 10 pour maintenir un format
     * de deux chiffres.
     *
     * @param {number} seconds - Le temps en secondes à formater.
     *
     * @return {string} Le temps formaté en chaîne de caractères au format MM:SS.
     */
    formatTime(seconds) {
        // Calcule le nombre de minutes en divisant les secondes par 60 et en arrondissant vers le bas
        const mins = Math.floor(seconds / 60);
        // Calcule le nombre de secondes restantes après la conversion en minutes
        const secs = seconds % 60;
        // Retourne une chaîne formatée avec deux chiffres pour les minutes et les secondes
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    /**
     * Gère les erreurs lors de la tentative de démarrage d'une session.
     *
     * Cette méthode affiche un message d'erreur en utilisant une fonction de toast
     * pour notifier l'utilisateur de l'erreur qui s'est produite.
     *
     * @param {Error} error - L'objet erreur contenant les détails de l'erreur.
     */
    gestartSessionCallbackError(error) {
        // Affiche un message d'erreur avec le détail de l'erreur
        this.toastError(error.message);
    }
    /**
     * Remplit la liste des voix disponibles pour la synthèse vocale.
     *
     * Cette méthode récupère les voix disponibles à partir de l'objet de synthèse vocale (`synth`).
     * Si aucune voix n'est initialement disponible, elle définit un gestionnaire d'événement pour
     * mettre à jour la liste des voix lorsque les voix deviennent disponibles.
     */
    populateVoices() {
        // Récupère les voix disponibles à partir de l'objet de synthèse vocale
        this.voices = this.synth.getVoices();
        // Vérifie si aucune voix n'est initialement disponible
        if (this.voices.length === 0) {
            // Définit un gestionnaire d'événement pour mettre à jour la liste des voix
            // lorsque les voix deviennent disponibles
            this.synth.onvoiceschanged = () => {
                this.voices = this.synth.getVoices();
            };
        }
    }

    /**
     * Fait prononcer un message par la synthèse vocale en utilisant une voix spécifique.
     *
     * Cette méthode crée une instance de `SpeechSynthesisUtterance` pour le message fourni,
     * sélectionne une voix spécifique parmi les voix disponibles et fait prononcer le message
     * par le moteur de synthèse vocale.
     *
     * @param {string} message - Le message à prononcer.
     */
    speak(message) {
        // Nom de la voix sélectionnée pour la synthèse vocale
        let selectedVoiceName = 'Microsoft Hortense - French (France)';
        // Crée une instance de SpeechSynthesisUtterance pour le message fourni
        let toSpeak = new SpeechSynthesisUtterance(message);
        // Parcourt la liste des voix disponibles et sélectionne la voix spécifiée
        this.voices.forEach((voice) => {
            if (voice.name === selectedVoiceName) {
                toSpeak.voice = voice;
            }
        });
        // Fait prononcer le message par le moteur de synthèse vocale
        this.synth.speak(toSpeak);
    }
    /**
     * Lit un message caractère par caractère à l'aide de la synthèse vocale.
     * @param {string} message - Message à lire.
     */
    speakNbr(message) {
        let selectedVoiceName = 'Microsoft Karsten - German (Switzerland)';
        let characters = message.split(','); // Diviser le message en caractères individuels

        let speakNextCharacter = () => {
            if (characters.length > 0) {
                let char = characters.shift();
                let toSpeak = new SpeechSynthesisUtterance(char);

                toSpeak.rate = 1; // Vous pouvez ajuster cette valeur si nécessaire

                this.voices.forEach((voice) => {
                    if (voice.name === selectedVoiceName) {
                        toSpeak.voice = voice;
                    }
                });

                toSpeak.onend = () => {
                    setTimeout(speakNextCharacter, 0); // Pause de 1 seconde entre chaque caractère
                };

                this.synth.speak(toSpeak);
            }
        };

        speakNextCharacter();
    }
    /**
     * Signale la fin de la session.
     */
    sessionGetFinish() {
        let userId = this.appCtrlInstance.getUserId();
        this.appCtrlInstance.sessionGetFinish(this.sessionId, userId, this.getFinishSuccess.bind(this), this.geFinishSessionCallbackError.bind(this));
    }
    /**
     * Callback de succès pour la fin de la session.
     * @param {Object} data - Réponse du serveur.
     */
    getFinishSuccess(data) {
        this.toastSuccess(data["message"])
        this.appCtrlInstance.loadListSession()
    }
    /**
     * Callback d'erreur pour la fin de la session.
     * @param {Object} error - Objet d'erreur.
     */
    geFinishSessionCallbackError(error) {
        this.toastError(error["message"])
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
