<?php

/**
 * connexion.php
 *
 * Description :
 * Ce fichier définit la classe Connexion.
 * La classe contient les outil pour pouvoir prepare les requête sql et effectuer des transactions.
 *
 * Auteur : shendar ali
 * Date : 24.05.2024
 * Version : 1.2
 *
 * Modifications :
 * [Liste des modifications avec dates et descriptions]
 */

require_once('configConnexion.php');

class Connexion
{

    /** @var Connexion|null Instance unique de la classe Connexion. */
    private static $_instance = null;

    /** @var PDO Instance de PDO pour la connexion à la base de données. */
    private $pdo;

    /**
     * Obtient une instance unique de la classe Connexion (Singleton).
     *
     * @return Connexion Instance unique de la classe Connexion.
     */
    public static function getInstance()
    {
        if (is_null(self::$_instance)) {
            self::$_instance = new connexion();
        }
        return self::$_instance;
    }

    /**
     * Constructeur de la classe Connexion.
     */
    private function __construct()
    {
        try {
            $this->pdo = new PDO(
                DB_TYPE . ':host=' . DB_HOST . ';dbname=' . DB_NAME,
                DB_USER,
                DB_PASS,
                array(
                    PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8',
                    PDO::ATTR_PERSISTENT => true
                )
            );
        } catch (PDOException $e) {
            print "Erreur !: " . $e->getMessage() . "<br/>";
            die();
        }
    }

    /**
     * Destructeur de la classe Connexion.
     */
    public function __destruct()
    {
        $this->pdo = null;
    }

    /**
     * Exécute une requête SELECT et retourne le résultat.
     *
     * @param string $query Requête SQL SELECT.
     * @param array $params Paramètres de la requête.
     *
     * @return array Résultat de la requête sous forme de tableau.
     */
    public function selectQuery($query, $params)
    {
        try {
            $queryPrepared = $this->pdo->prepare($query);
            $queryPrepared->execute($params);
            return $queryPrepared->fetchAll();
        } catch (PDOException $e) {
            print "Erreur !: " . $e->getMessage() . "<br/>";
            die();
        }
    }

    /**
     * Exécute une requête SELECT et retourne la première ligne du résultat.
     *
     * @param string $query Requête SQL SELECT.
     * @param array $params Paramètres de la requête.
     *
     * @return mixed Résultat de la requête sous forme d'un tableau associatif.
     */
    public function selectSingleQuery($query, $params)
    {
        try {
            $queryPrepared = $this->pdo->prepare($query);
            $queryPrepared->execute($params);
            return $queryPrepared->fetch();
        } catch (PDOException $e) {
            print "Erreur !: " . $e->getMessage() . "<br/>";
            die();
        }
    }

    /**
     * Exécute une requête non SELECT (INSERT, UPDATE, DELETE) et retourne le résultat.
     *
     * @param string $query Requête SQL non SELECT.
     * @param array $params Paramètres de la requête.
     *
     * @return bool Résultat de l'exécution de la requête (true si réussie, false sinon).
     */
    public function executeQuery($query, $params)
    {
        try {
            $queryPrepared = $this->pdo->prepare($query);
            $queryRes = $queryPrepared->execute($params);
            return $queryRes;
        } catch (PDOException $e) {
            print "Erreur !: " . $e->getMessage() . "<br/>";
            die();
        }
    }

    /**
     * Obtient l'identifiant généré lors de la dernière opération INSERT.
     *
     * @param string $table Nom de la table concernée.
     *
     * @return string L'identifiant généré.
     */
    public function getLastId($table)
    {
        try {
            $lastId = $this->pdo->lastInsertId($table);
            return $lastId;
        } catch (PDOException $e) {
            print "Erreur !: " . $e->getMessage() . "<br/>";
            die();
        }
    }

    /**
     * Démarre une transaction.
     *
     * @return bool Résultat de l'opération (true si réussie, false sinon).
     */
    public function startTransaction()
    {
        return $this->pdo->beginTransaction();
    }

    /**
     * Ajoute une requête à la transaction en cours.
     *
     * @param string $query Requête SQL.
     * @param array $params Paramètres de la requête.
     *
     * @return bool Résultat de l'opération (true si réussie, false sinon).
     */
    public function addQueryToTransaction($query, $params)
    {
        $res = false;
        if ($this->pdo->inTransaction()) {
            $maQuery = $this->pdo->prepare($query);
            $res = $maQuery->execute($params);
        }
        return $res;
    }

    /**
     * Valide la transaction en cours.
     *
     * @return bool Résultat de l'opération (true si réussie, false sinon).
     */
    public function commitTransaction()
    {
        $res = false;
        if ($this->pdo->inTransaction()) {
            $res = $this->pdo->commit();
        }
        return $res;
    }

    /**
     * Annule la transaction en cours.
     *
     * @return bool Résultat de l'opération (true si réussie, false sinon).
     */
    public function rollbackTransaction()
    {
        $res = false;
        if ($this->pdo->inTransaction()) {
            $res = $this->pdo->rollBack();
        }
        return $res;
    }

}