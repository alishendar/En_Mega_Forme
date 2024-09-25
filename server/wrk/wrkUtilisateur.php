<?php

/**
 * wrkUtilisateur.php
 *
 * Description :
 * Ce fichier définit la classe Wrkutilisateur, représentant le worker traitant les utilisateurs.
 * La classe contient des méthodes pour faire de la gestion de utilisateurs.
 *
 * Auteur : Shendar Ali
 * Date : 27.05.2024
 * Version : 1.2
 *
 * Modifications :
 * [Liste des modifications avec dates et descriptions]
 */

class WrkUtilisateur
{
    /** @var Connexion Instance de la classe de connexion à la base de données. */
    public $pdo;

    /**
     * Constructeur de la classe WrkUtilisateur.
     */
    public function __construct()
    {
        $this->pdo = Connexion::getInstance();
    }

    /**
     * Récupère les informations d'un utilisateur spécifique par nom d'utilisateur.
     *
     * Cette méthode exécute une requête SQL pour récupérer les détails d'un utilisateur
     * en utilisant le nom d'utilisateur fourni.
     *
     * @param string $name Nom d'utilisateur.
     *
     * @return array Informations de l'utilisateur.
     *
     * @throws Exception Si une erreur survient lors de l'exécution de la requête SQL.
     */
    public function readUser($name)
    {
        // Préparation de la requête SQL pour sélectionner un utilisateur par nom d'utilisateur
        $query = "SELECT * FROM T_User WHERE `username`= :username";
        // Définition des paramètres de la requête
        $params = array("username" => $name);
        // Exécution de la requête SQL avec les paramètres fournis
        $result = $this->pdo->selectSingleQuery($query, $params);
        // Retourner le résultat de la requête
        return $result;
    }


    /**
     * Ajoute un nouvel utilisateur.
     *
     * @param string $username Nom de l'utilisateur.
     * @param string $password Mot de passe de l'utilisateur.
     * @param int $status Statut de l'utilisateur.
     *
     * @return bool True en cas de succès, False en cas d'échec.
     */
    public function addUser($username, $password, $status)
    {
        // Hachage du mot de passe
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        // Requête d'insertion
        $query = "INSERT INTO T_User (username, password, status) VALUES (:username, :password, :status)";
        $params = array(
            "username" => $username,
            "password" => $hashedPassword,
            "status" => $status
        );

        // Exécution de la requête
        return $this->pdo->executeQuery($query, $params);
    }

    /**
     * Supprime un utilisateur et ses associations de la base de données en utilisant son ID.
     *
     * Cette méthode exécute plusieurs requêtes SQL pour supprimer un utilisateur
     * et ses relations dans différentes tables en utilisant l'ID de l'utilisateur fourni.
     *
     * @param int $pk ID de l'utilisateur.
     *
     * @return bool Résultat de l'exécution de la requête SQL.
     *
     * @throws Exception Si une erreur survient lors de l'exécution des requêtes SQL.
     */
    public function deleteUserByUsername($pk)
    {
        try {
            // Préparation et exécution de la requête SQL pour supprimer les sessions associées à l'utilisateur
            $query = 'DELETE FROM T_Session WHERE fk_user = :fk_user';
            $params = array('fk_user' => $pk);
            $this->pdo->executeQuery($query, $params);
            // Préparation et exécution de la requête SQL pour supprimer les connexions associées à l'utilisateur
            $query = 'DELETE FROM T_Connection WHERE fk_user = :fk_user';
            $this->pdo->executeQuery($query, $params);
            // Préparation et exécution de la requête SQL pour supprimer l'utilisateur
            $query = "DELETE FROM T_User WHERE pk_user = :pk_user";
            $params = array('pk_user' => $pk);
            return $this->pdo->executeQuery($query, $params);

        } catch (Exception $e) {
            // Annuler la transaction en cas d'erreur
            $this->pdo->rollbackTransaction();
            // Relancer l'exception pour être gérée à un niveau supérieu
            throw $e;
        }
    }
    /**
     * Met à jour le statut d'un utilisateur dans la base de données.
     *
     * Cette méthode exécute une requête SQL pour mettre à jour le statut d'un utilisateur
     * spécifique en utilisant son nom d'utilisateur et son ID.
     *
     * @param string $username Nom d'utilisateur.
     * @param string $status Nouveau statut de l'utilisateur.
     * @param int $pk ID de l'utilisateur.
     *
     * @return bool Résultat de l'exécution de la requête SQL.
     *
     * @throws Exception Si une erreur survient lors de l'exécution de la requête SQL.
     */
    public function updateUserStatus($username, $status, $pk)
    {
        // Préparation de la requête SQL pour mettre à jour le statut de l'utilisateur
        $query = "UPDATE T_User SET status = :status WHERE username = :username AND pk_user = :pk_user";
        // Définition des paramètres de la requête
        $params = array(
            "username" => $username,
            "pk_user" => $pk,
            "status" => $status
        );
        // Exécution de la requête SQL avec les paramètres fournis
        return $this->pdo->executeQuery($query, $params);
    }

    /**
     * Récupère la liste de tous les utilisateurs avec leurs détails et leur dernière connexion.
     *
     * Cette méthode exécute une requête SQL pour récupérer les informations des utilisateurs
     * et leur dernière connexion en utilisant une jointure gauche entre les tables `T_User` et `T_Connection`.
     *
     * @return array Liste de tous les utilisateurs avec leurs détails et leur dernière connexion.
     *
     * @throws Exception Si une erreur survient lors de l'exécution de la requête SQL.
     */
    public function getAllUser()
    {
        // Préparation de la requête SQL pour sélectionner les informations des utilisateurs
        // et leur dernière connexion
        $query = "SELECT 
                        u.pk_user,  
                        u.username, 
                        u.status, 
                        u.litresByDay,  
                        MAX(c.connection_time) AS last_connection_time
                    FROM  
                        T_User u 
                    LEFT JOIN   
                        T_Connection c 
                    ON 
                        u.pk_user = c.fk_user
                    GROUP BY 
                        u.pk_user, 
                        u.username, 
                        u.status, 
                        u.litresByDay;
                     ";
        // Définition des paramètres de la requête (aucun paramètre dans ce cas)
        $params = array();
        // Exécution de la requête SQL avec les paramètres fournis
        $result = $this->pdo->selectQuery($query, $params);
        // Retourner le résultat de la requête
        return $result;
    }
    /**
     * Ajoute une nouvelle connexion pour un utilisateur spécifique.
     *
     * Cette méthode exécute une requête SQL pour insérer un enregistrement de connexion
     * dans la table `T_Connection` en utilisant l'ID de l'utilisateur et le temps de connexion fourni.
     *
     * @param int $pk_user ID de l'utilisateur.
     * @param string $getTime Heure de la connexion.
     *
     * @return bool Résultat de l'exécution de la requête SQL.
     *
     * @throws Exception Si une erreur survient lors de l'exécution de la requête SQL.
     */
    function addNewconnetion($pk_user, $getTime)
    {
        // Préparation de la requête SQL pour insérer une nouvelle connexion
        $query = "INSERT INTO T_Connection (fk_user, connection_time) VALUES (:fk_user, :connection_time)";
        // Définition des paramètres de la requête
        $params = array(
            "fk_user" => $pk_user,
            "connection_time" => $getTime,
        );
        // Exécution de la requête SQL avec les paramètres fournis
        $result = $this->pdo->executeQuery($query, $params);
        // Retourner le résultat de la requête
        return $result;
    }
    /**
     * Met à jour les litres consommés par jour et l'état des notifications pour un utilisateur spécifique.
     *
     * Cette méthode exécute une requête SQL pour mettre à jour les champs `litresByDay` et `notificationActive`
     * dans la table `T_User` en utilisant l'ID de l'utilisateur fourni.
     *
     * @param int $userId ID de l'utilisateur.
     * @param float $literByDay Quantité de litres consommés par jour.
     * @param bool $notification État de la notification (activé ou désactivé).
     *
     * @return bool Résultat de l'exécution de la requête SQL.
     *
     * @throws Exception Si une erreur survient lors de l'exécution de la requête SQL.
     */
    function notication($userId, $literByDay, $notification)
    {
        // Préparation de la requête SQL pour mettre à jour les litres par jour et l'état des notifications de l'utilisateur
        $query = "UPDATE T_User SET litresByDay = :litresByDay, notificationActive=:notificationActive WHERE pk_user = :pk_user AND pk_user = :pk_user";
        // Définition des paramètres de la requête
        $params = array(
            "litresByDay" => $literByDay,
            "notificationActive" => $notification,
            "pk_user" => $userId
        );
        // Exécution de la requête SQL avec les paramètres fournis
        return $this->pdo->executeQuery($query, $params);
    }
    /**
     * Récupère l'état de consommation d'eau d'un utilisateur spécifique.
     *
     * Cette méthode exécute une requête SQL pour récupérer le champ `haveDrinked`
     * de la table `T_User` en utilisant l'ID de l'utilisateur fourni.
     *
     * @param int $pk ID de l'utilisateur.
     *
     * @return int État de consommation d'eau de l'utilisateur.
     *
     * @throws Exception Si une erreur survient lors de l'exécution de la requête SQL.
     */
    public function haveDrinked($pk)
    {
        // Préparation de la requête SQL pour sélectionner un utilisateur par nom d'utilisateur
        $query = "SELECT `haveDrinked` FROM `T_User` WHERE pk_user=:pk_user";
        // Définition des paramètres de la requête
        $params = array("pk_user" => $pk);
        // Exécution de la requête SQL avec les paramètres fournis
        $result = $this->pdo->selectSingleQuery($query, $params);
        // Retourner le résultat de la requête
        return $result;
    }

    /**
     * Met à jour la quantité d'eau consommée par un utilisateur spécifique.
     *
     * Cette méthode exécute une requête SQL pour incrémenter le champ `haveDrinked`
     * de la table `T_User` en utilisant l'ID de l'utilisateur et la quantité consommée.
     *
     * @param float $haveDrink Quantité d'eau consommée.
     * @param int $userId ID de l'utilisateur.
     *
     * @return bool Résultat de l'exécution de la requête SQL.
     *
     * @throws Exception Si une erreur survient lors de l'exécution de la requête SQL.
     */
    public function drinke($haveDrink, $userId)
    {
        $query = "UPDATE T_User SET haveDrinked = haveDrinked+:haveDrinked WHERE pk_user = :pk_user";
        // Définition des paramètres de la requête
        $params = array(
            "haveDrinked" => $haveDrink,
            "pk_user" => $userId
        );
        // Exécution de la requête SQL avec les paramètres fournis
        return $this->pdo->executeQuery($query, $params);
    }
    /**
     * Réinitialise la quantité d'eau consommée par jour pour tous les utilisateurs.
     *
     * Cette méthode exécute une requête SQL pour mettre à jour le champ `haveDrinked`
     * de tous les enregistrements de la table `T_User` à 0.
     *
     * @return bool Résultat de l'exécution de la requête SQL.
     *
     * @throws Exception Si une erreur survient lors de l'exécution de la requête SQL.
     */
    public function restDayiledrink()
    {
        $query = "UPDATE T_User SET haveDrinked = 0";
        // Définition des paramètres de la requête
        $params = array();
        // Exécution de la requête SQL avec les paramètres fournis
        return $this->pdo->executeQuery($query, $params);
    }
}