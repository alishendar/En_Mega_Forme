/**
 * serviceHttp.js
 *
 * Description :
 * gestion de la list d'utilisateur pour l'admin et pour ajouter ou supprimé les utilisateur
 *
 * Auteur : Shendar Ali
 * Version : 1.2
 *
 * Modifications :
 *
 */
/**
 * Classe UserList
 *
 * Cette classe gère l'interface utilisateur pour la liste des utilisateurs.
 * @class
 */
class UserList {
    listOfUser = null;

    /**
     * Constructeur de la classe UserList.
     * @param {AppCtrl} appCtrlInstance - Instance du contrôleur de l'application.
     */
    constructor(appCtrlInstance) {
        this.appCtrlInstance = appCtrlInstance;

        // Associer les gestionnaires d'événements
        $("#addUser").click(this.addUserIhm.bind(this));
        $("#deleteUser").click(this.deleteUser.bind(this));

        // Récupérer initialement la liste des utilisateurs
        this.getListUser();
    }

    /**
     * Récupère la liste des utilisateurs depuis le serveur.
     */
    getListUser() {
        this.appCtrlInstance.getUsers(this.getUserSuccess.bind(this), this.getUserCallbackError.bind(this));
    }

    /**
     * Callback de succès pour la récupération des utilisateurs.
     * @param {Array} data - Liste des utilisateurs.
     */
    getUserSuccess(data) {
        this.listOfUser = data;
        console.log("User data fetched successfully");
        const table = this.renderTable(data);
        $('#tableUser').html(table);  // Assuming there's a container with this ID
    }

    /**
     * Callback d'erreur pour la récupération des utilisateurs.
     * @param {Object} error - Objet d'erreur.
     */
    getUserCallbackError(error) {
        console.error("Failed to fetch user data:", error);
        $('#tableUser').html('<p>Erreur de trouver les utilisateur</p>');
    }

    /**
     * Rendu du tableau des utilisateurs.
     * @param {Array} data - Liste des utilisateurs.
     * @returns {string} - HTML du tableau.
     */
    renderTable(data) {
        const tableHeaders = `
        <tr>
            <th>Membre</th>
            <th>administrateur?</th>
            <th>Dernière connexion</th>
        </tr>
    `;
        const tableRows = data.map(item => {
            // Convertir l'heure UTC en heure locale suisse
            const lastConnection = item.last_connection_time ? new Date(item.last_connection_time).toLocaleString('sv-CH', {timeZone: 'Europe/Zurich'}) : 'Jamais';

            return `
            <tr>
               <td>${item.username}</td>
               <td>
                   <input type="checkbox" id="id-${item.pk_user}" name="status_${item.pk_user}" ${item.status === '1' ? 'checked' : ''}>
               </td>
               <td>${lastConnection}</td>
            </tr>
        `;
        }).join('');

        setTimeout(() => {
            data.forEach(item => {
                document.getElementById(`id-${item.pk_user}`).addEventListener('change', (event) => {
                    this.changeStatus(item.username, event.target.checked, item.pk_user);
                });
            });
        }, 0);

        return `
        <table class="table table-striped">
            <thead>${tableHeaders}</thead>
            <tbody>${tableRows}</tbody>
        </table>
    `;
    }

    /**
     * Modifie le statut de l'utilisateur.
     * @param {string} username - Nom d'utilisateur.
     * @param {boolean} newStatus - Nouveau statut (vrai pour administrateur, faux pour utilisateur normal).
     * @param {number} userId - ID de l'utilisateur.
     */
    changeStatus(username, newStatus, userId) {
        this.appCtrlInstance.updateUserStatus(username, newStatus, userId, this.getUserStatusSuccess.bind(this), this.getUserStatusCallbackError.bind(this))
        console.log(userId)
    }

    /**
     * Callback de succès pour la mise à jour du statut de l'utilisateur.
     * @param {Object} data - Réponse du serveur.
     */
    getUserStatusSuccess(data) {
        this.appCtrlInstance.getToast().fire({
            icon: "success",
            title: 'Success',
            text: data["message"],
            timer: 2000,
            timerProgressBar: true,
            allowOutsideClick: false,
            showConfirmButton: false,
        });
        this.getListUser()
    }

    /**
     * Callback d'erreur pour la mise à jour du statut de l'utilisateur.
     * @param {Object} error - Objet d'erreur.
     */
    getUserStatusCallbackError(error) {
        this.appCtrlInstance.getToast().fire({
            icon: "error",
            title: "Error",
            text: error["message"],
            allowOutsideClick: false,
        });
    }

    /**
     * Ajoute un utilisateur à l'interface.
     */
    addUserIhm() {
        let userName = document.getElementById("nomDuMembre").value
        let userMdp = document.getElementById("mdpDuMembre").value
        this.appCtrlInstance.addUserCtrl(userName, userMdp, this.addUserSuccess.bind(this), this.addUserCallbackError.bind(this));
    }

    /**
     * Callback de succès pour l'ajout d'un utilisateur.
     * @param {Object} data - Réponse du serveur.
     */
    addUserSuccess(data) {
        console.log(data)
        this.appCtrlInstance.getToast().fire({
            icon: "success",
            title: 'Success',
            text: data["message"],
            timer: 2000,
            timerProgressBar: true,
            allowOutsideClick: false,
            showConfirmButton: false,
        });
        this.getListUser();
    }

    /**
     * Callback d'erreur pour l'ajout d'un utilisateur.
     * @param {Object} error - Objet d'erreur.
     */
    addUserCallbackError(error) {
        this.appCtrlInstance.getToast().fire({
            icon: "error",
            title: "Error",
            text: error["message"],
            allowOutsideClick: false,
        });
    }

    /**
     * Supprime un utilisateur.
     */
    deleteUser() {
        let userName = document.getElementById("nomDuMembre").value.trim();
        let userB = this.listOfUser.find(user => user.username.trim() === userName);
        this.appCtrlInstance.popUserCtrl(userB.pk_user, this.popUserSuccess.bind(this), this.popUserCallbackError.bind(this));
    }

    /**
     * Callback de succès pour la suppression d'un utilisateur.
     * @param {Object} data - Réponse du serveur.
     */
    popUserSuccess(data) {
        this.appCtrlInstance.getToast().fire({
            icon: "success",
            title: 'Success',
            text: data["message"],
            timer: 2000,
            timerProgressBar: true,
            allowOutsideClick: false,
            showConfirmButton: false,
        });
        this.getListUser();
    }

    /**
     * Callback d'erreur pour la suppression d'un utilisateur.
     * @param {Object} error - Objet d'erreur.
     */
    popUserCallbackError(error) {
        this.appCtrlInstance.getToast().fire({
            icon: "error",
            title: "Error",
            text: error["message"],
            allowOutsideClick: false,
        });
    }
}
