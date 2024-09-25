/**
 * loginCtrl.js
 *
 * Description :
 * Cette classe gère la gestion de connexion et authentification d'utilisateur.
 *
 * Auteur : Shendar Ali
 * Version : 1.2
 *
 * Modifications :
 *
 */
/**
 * Classe Login
 * @class
 */
class Login {
	appCtrlInstance
	/**
	 * Constructeur de la classe Login.
	 * @param {AppCtrl} appCtrlInstance - Instance du contrôleur de l'application.
	 */
	constructor(appCtrlInstance) {
		this.initialize(appCtrlInstance);
		this.appCtrlInstance = appCtrlInstance;
	}
	/**
	 * Initialise les gestionnaires d'événements pour la connexion.
	 * @param {AppCtrl} appCtrlInstance - Instance du contrôleur de l'application.
	 */
	initialize(appCtrlInstance) {
		$("#connexion").click(() => { this.login(appCtrlInstance) });
	}
	/**
	 * Effectue la connexion de l'utilisateur.
	 * @param {AppCtrl} appCtrlInstance - Instance du contrôleur de l'application.
	 */
	login(appCtrlInstance) {
		let $username = $("#username").val();
		let $mdp = $("#mdp").val();
		appCtrlInstance.loginAdmin($username, $mdp, this.loginSuccess.bind(this), this.loginCallbackError.bind(this));
		console.log("Login");
	}
	/**
	 * Callback de succès pour la connexion.
	 * @param {AppCtrl} appCtrlInstance - Instance du contrôleur de l'application.
	 * @param {Object} request - Objet de la requête.
	 * @param {string} status - Statut de la requête.
	 * @param {Object} error - Objet d'erreur éventuel.
	 */
	loginSuccess(appCtrlInstance, request, status, error) {
		// Affichage d'un message de succès avec un toast
		this.appCtrlInstance.getToast().fire({
			icon: "success",
			title: 'Success',
			text: "Bienvenue admin",
			timer: 2000,
			timerProgressBar: true,
			allowOutsideClick: false,
			showConfirmButton: false,
		});
		// Chargement du menu après la connexion réussie
		this.appCtrlInstance.loadMenu();
		// Définition du statut de l'utilisateur et de son identifiant
		this.appCtrlInstance.setStatut(status["responseJSON"]["status"]);
		this.appCtrlInstance.setUserId(status["responseJSON"]["id"]);
		// Mise à jour des informations de notification de l'utilisateur
		this.appCtrlInstance.setUserNotify(status["responseJSON"]["litresByDay"],status["responseJSON"]["notificationActive"]);
		// Si l'utilisateur est un administrateur, charge la liste des utilisateurs,
		// sinon charge la liste des sessions
		if (status["responseJSON"]["status"]==1){
			this.appCtrlInstance.loadListUser();
		}else{
			this.appCtrlInstance.loadListSession();
		}
	}
	/**
	 * Callback d'erreur pour la connexion.
	 * @param {Object} request - Objet de la requête.
	 * @param {string} status - Statut de la requête.
	 * @param {Object} error - Objet d'erreur.
	 */
	loginCallbackError(request, status, error) {
		console.log("Status:", status);
		console.log("Error:", error);
		this.appCtrlInstance.getToast().fire({
			icon: "error",
			title: "Error",
			text: "Login ou mot de passe incorrect",
			allowOutsideClick: false,
		});
	}
}