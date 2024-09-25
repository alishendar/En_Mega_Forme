<?php
/**
 * wrkSession.php
 *
 * Description :
 * Ce fichier est responsable de recevoir les requêtes, de transmettre les données nécessaires aux différentes
 * fonctionnalités du serveur pour récupérer les données depuis la base de données, et de convertir les données
 * au format JSON pour les renvoyer aux demandeurs.
 *
 * Auteur : Shendar Ali
 * Date : 27.05.2024
 * Version : 1.2
 *
 * Modifications :
 *  [Liste des modifications avec dates et descriptions]
 */

class GestionOfSession
{
    public $pdo;

    public function __construct()
    {
        $this->pdo = Connexion::getInstance();
    }

    /**
     * Valide les paramètres nécessaires à la création ou à la mise à jour d'une session.
     *
     * @param string $name Nom de la session.
     * @param int $t_temps_total Temps total de la session.
     * @param int $user_id ID de l'utilisateur.
     * @param array $exercices Liste des exercices.
     *
     * @throws Exception Si un des paramètres est invalide.
     */
    private function validateParameters($name, $t_temps_total, $user_id, $exercices)
    {

        if (empty($name) || empty($t_temps_total) || empty($user_id) || empty($exercices)) {
            throw new Exception('Tous les paramètres sont obligatoires.');
        }
        if (!is_array($exercices) || count($exercices) == 0) {
            throw new Exception('La liste des exercices doit être un tableau non vide.');
        }
    }

    /**
     * Crée une nouvelle session et associe des exercices à celle-ci.
     *
     * @param string $name Nom de la session.
     * @param int $tempsW Temps de travail par exercice.
     * @param int $tempsP Temps de pause par exercice.
     * @param int $nbreExercice Nombre d'exercices.
     * @param array $user_ids Liste des IDs des utilisateurs.
     * @param array $exercices Liste des exercices.
     *
     * @return int ID de la session créée.
     *
     * @throws Exception Si une erreur survient lors de la création de la session.
     */
    public function createSession($name, $tempsW, $tempsP, $nbreExercice, $user_ids, $exercices)
    {
        $t_temps_total = ((int)$tempsW * ($nbreExercice)) * count($exercices) + (((int)$tempsP * ($nbreExercice) * count($exercices)) - $tempsP);
        // Vérifier si $user_ids est un tableau, sinon le convertir en un tableau
        if (!is_array($user_ids)) {
            $user_ids = [$user_ids];
        }
        try {
            // Insérer la session pour chaque utilisateur
            foreach ($user_ids as $user_id) {
                $query = 'INSERT INTO T_Session (name, t_temps_total, fk_user) VALUES (:name, :t_temps_total, :fk_user)';
                $params = array('name' => $name, 't_temps_total' => $t_temps_total, 'fk_user' => $user_id);
                $this->pdo->executeQuery($query, $params);
                $session_id = $this->pdo->getLastId("T_Session");

                // Préparer les valeurs pour l'insertion des exercices
                foreach ($exercices as $exerciseGroup) {
                    foreach ($exerciseGroup as $exercice) {
                        // Vérifier si l'exercice existe
                        $query = 'SELECT COUNT(*) AS count FROM T_Exercice WHERE exercice_id = :exercice_id';
                        $exerciceParams = array('exercice_id' => $exercice['exercice_id']);
                        $exists = $this->pdo->selectQuery($query, $exerciceParams);

                        // Si l'exercice n'existe pas, l'insérer
                        if ($exists[0]['count'] == 0) {
                            $query = 'SELECT pk_muscle FROM T_Muscle WHERE name = :muscle';
                            $exerciceParams = array('muscle' => $exercice['muscle']);
                            $muscle = $this->pdo->selectQuery($query, $exerciceParams);

                            if (empty($muscle)) {
                                throw new Exception('Muscle non trouvé : ' . $exercice['muscle']);
                            }

                            $query = 'INSERT INTO T_Exercice (exercice_id, fk_muscle) VALUES (:exercice_id, :fk_muscle)';
                            $exerciceInsertParams = array('exercice_id' => $exercice['exercice_id'], 'fk_muscle' => $muscle[0]['pk_muscle']);
                            $this->pdo->executeQuery($query, $exerciceInsertParams);
                        }

                        // Obtenir l'ID de l'exercice
                        $query = 'SELECT pk_exercice FROM T_Exercice WHERE exercice_id = :exercice_id';
                        $exerciceParams = array('exercice_id' => $exercice['exercice_id']);
                        $exerciceData = $this->pdo->selectSingleQuery($query, $exerciceParams);

                        // Insérer la relation session-exercice
                        $query = 'INSERT INTO TR_Exercise_Session (fk_exercice, fk_session, exercice_id, time_of_work, time_of_rest, nbrExerciceByMuscle) VALUES (:fk_exercice, :fk_session, :exercice_id, :time_of_work, :time_of_rest, :nbrExerciceByMuscle)';
                        $params = array(
                            'fk_exercice' => $exerciceData['pk_exercice'],
                            'fk_session' => $session_id,
                            'exercice_id' => $exercice['exercice_id'],
                            'time_of_work' => $tempsW,
                            'time_of_rest' => $tempsP,
                            'nbrExerciceByMuscle' => $nbreExercice
                        );
                        $this->pdo->executeQuery($query, $params);
                    }
                }
            }

            // Valider la transaction
            $this->pdo->commitTransaction();

            return $session_id;
        } catch (\Exception $e) {
            // Annuler la transaction en cas d'erreur
            $this->pdo->rollbackTransaction();
            throw $e;
        }
    }


    /**
     * Met à jour une session existante et ses exercices associés.
     *
     * @param int $session_id ID de la session.
     * @param int $t_temps_total Temps total de la session.
     * @param string $exercices Liste des exercices au format JSON.
     *
     * @return bool True en cas de succès, False en cas d'échec.
     *
     * @throws Exception Si une erreur survient lors de la mise à jour de la session.
     */
    public function updateSession($session_id, $totalWorkTime, $totalRestTime, $nbreExercice, $exercices)
    {
        // Convertir la chaîne JSON en tableau PHP
        $exercices = json_decode($exercices, true);
        $t_temps_total = ((int)$totalWorkTime * ($nbreExercice)) * count($exercices) + (((int)$totalRestTime * ($nbreExercice) * count($exercices)) - $totalRestTime);

        if ($exercices === null) {
            throw new Exception('Le paramètre exercises doit être un JSON valide.');
        }
        try {
            // Vérifier les paramètres
            $this->validateParameters('test', $t_temps_total, 1, $exercices);

            // Commencer une transaction

            // Mettre à jour la session
            $query = 'UPDATE T_Session SET t_temps_total = :t_temps_total WHERE pk_session = :session_id';
            $params = array('session_id' => $session_id, 't_temps_total' => $t_temps_total);
            $this->pdo->executeQuery($query, $params);

            // Supprimer les exercices existants de la session
            $query = 'DELETE FROM TR_Exercise_Session WHERE fk_session = :fk_session';
            $params = array('fk_session' => $session_id);
            $this->pdo->executeQuery($query, $params);

            // Préparer les valeurs pour l'insertion des exercices
            foreach ($exercices as $exerciseGroup) {
                foreach ($exerciseGroup as $exercice) {
                    // Vérifier si l'exercice existe
                    $query = 'SELECT COUNT(*) AS count FROM T_Exercice WHERE exercice_id = :exercice_id';
                    $exerciceParams = array('exercice_id' => $exercice['exercice_id']);
                    $exists = $this->pdo->selectQuery($query, $exerciceParams);

                    // Si l'exercice n'existe pas, l'insérer
                    if ($exists[0]['count'] == 0) {
                        $query = 'SELECT pk_muscle FROM T_Muscle WHERE name = :muscle';
                        $exerciceParams = array('muscle' => $exercice['muscle']);
                        $muscle = $this->pdo->selectQuery($query, $exerciceParams);

                        if (empty($muscle)) {
                            throw new Exception('Muscle non trouvé : ' . $exercice['muscle']);
                        }

                        $query = 'INSERT INTO T_Exercice (exercice_id, fk_muscle) VALUES (:exercice_id, :fk_muscle)';
                        $exerciceInsertParams = array('exercice_id' => $exercice['exercice_id'], 'fk_muscle' => $muscle[0]['pk_muscle']);
                        $this->pdo->executeQuery($query, $exerciceInsertParams);
                    }

                    // Obtenir l'ID de l'exercice
                    $query = 'SELECT pk_exercice FROM T_Exercice WHERE exercice_id = :exercice_id';
                    $exerciceParams = array('exercice_id' => $exercice['exercice_id']);
                    $exerciceData = $this->pdo->selectSingleQuery($query, $exerciceParams);

                    // Insérer la relation session-exercice
                    $query = 'INSERT INTO TR_Exercise_Session (fk_exercice, fk_session, exercice_id, time_of_work, time_of_rest, nbrExerciceByMuscle) VALUES (:fk_exercice, :fk_session, :exercice_id, :time_of_work, :time_of_rest, :nbrExerciceByMuscle)';
                    $params = array(
                        'fk_exercice' => $exerciceData['pk_exercice'],
                        'fk_session' => $session_id,
                        'exercice_id' => $exercice['exercice_id'],
                        'time_of_work' => $totalWorkTime,
                        'time_of_rest' => $totalRestTime,
                        'nbrExerciceByMuscle' => $nbreExercice
                    );
                    $this->pdo->executeQuery($query, $params);
                }
            }

            // Valider la transaction
            $this->pdo->commitTransaction();

            return true;
        } catch (\Exception $e) {
            // Annuler la transaction en cas d'erreur
            $this->pdo->rollbackTransaction();
            throw $e;
        }
    }


    /**
     * Supprime une session et ses exercices associés.
     *
     * @param int $session_id ID de la session.
     *
     * @return bool True en cas de succès, False en cas d'échec.
     *
     * @throws Exception Si une erreur survient lors de la suppression de la session.
     */
    public function deleteSession($session_id)
    {
        try {
            // Commencer une transaction

            // Supprimer les exercices de la session
            $query = 'DELETE FROM TR_Exercise_Session WHERE fk_session = :session_id';
            $params = array('session_id' => $session_id);
            $this->pdo->executeQuery($query, $params);

            // Supprimer la session
            $query = 'DELETE FROM T_Session WHERE pk_session = :session_id';
            $result = $this->pdo->executeQuery($query, $params);

            // Valider la transaction
            $this->pdo->commitTransaction();

            return $result;
        } catch (Exception $e) {
            // Annuler la transaction en cas d'erreur
            $this->pdo->rollbackTransaction();
            throw $e;
        }
    }


    /**
     * Récupère les détails d'une session.
     *
     * @param int $session_id ID de la session.
     *
     * @return array Détails de la session.
     *
     * @throws Exception Si une erreur survient lors de la récupération des détails de la session.
     */
    public function getSessionDetails($session_id)
    {
        try {
            $query = '
            SELECT
                s.pk_session AS session_id,
                s.name AS session_name,
                s.t_temps_total AS total_time,
                es.exercice_id AS exercise_id,
                es.time_of_work,
                es.time_of_rest,
                es.nbrExerciceByMuscle,
                m.pk_muscle AS pk_muscle,
                m.name AS muscle_name
            FROM
                T_Session s
            JOIN
                TR_Exercise_Session es ON s.pk_session = es.fk_session
            JOIN
                T_Exercice e ON es.fk_exercice = e.pk_exercice
            JOIN
                T_Muscle m ON e.fk_muscle = m.pk_muscle
            WHERE
                s.pk_session = :session_id
        ';
            $params = array('session_id' => $session_id);
            $result = $this->pdo->selectQuery($query, $params);

            if ($result === false) {
                throw new Exception("Erreur lors de l'exécution de la requête SQL.");
            }

            return $result;
        } catch (Exception $e) {
            // Il n'est pas nécessaire d'annuler une transaction ici car il n'y en a pas
            throw $e;
        }
    }

    /**
     * Récupère les IDs des exercices associés à une session donnée.
     *
     * Cette méthode exécute une requête SQL pour récupérer les IDs des exercices
     * associés à une session spécifique en utilisant l'ID de la session fourni.
     *
     * @param int $sessionId ID de la session.
     *
     * @return array Liste des IDs des exercices associés à la session.
     *
     * @throws Exception Si une erreur survient lors de l'exécution de la requête SQL.
     */
    public function getExerciceBySessionId($sessionId)
    {
        try {
            // Préparation de la requête SQL pour sélectionner les IDs des exercices
            // associés à une session donnée
            $query = '
                        SELECT
                            es.exercice_id AS exercise_id
                        FROM
                            T_Session s
                        JOIN
                            TR_Exercise_Session es ON s.pk_session = es.fk_session
                        JOIN
                            T_Exercice e ON es.fk_exercice = e.pk_exercice
                        JOIN
                            T_Muscle m ON e.fk_muscle = m.pk_muscle
                        WHERE
                            s.pk_session = :session_id
                     ';
            // Définition des paramètres de la requête
            $params = array('session_id' => $sessionId);
            // Exécution de la requête SQL avec les paramètres fournis
            $result = $this->pdo->selectQuery($query, $params);
            // Vérification si le résultat de la requête est faux (échec de l'exécution)
            if ($result === false) {
                // Lever une exception si la requête a échoué
                throw new Exception("Erreur lors de l'exécution de la requête SQL.");
            }
            // Retourner le résultat de la requête
            return $result;
        } catch (Exception $e) {
            // Annuler la transaction en cas d'erreur
            $this->pdo->rollbackTransaction();
            // Relancer l'exception pour être gérée à un niveau supérieur
            throw $e;
        }
    }

    /**
     * Copie une session d'un utilisateur à un autre.
     *
     * @param int $sessionId ID de la session.
     * @param int $pkUser ID de l'utilisateur.
     *
     * @return bool True en cas de succès, False en cas d'échec.
     *
     * @throws Exception Si une erreur survient lors de la copie de la session.
     */
    public function copySession($sessionId, $pkUser)
    {
        try {

            // Récupérer les détails de la session existante
            $query = 'SELECT * FROM T_Session WHERE pk_session = :session_id';
            $params = array('session_id' => $sessionId);
            $sessionDetails = $this->pdo->selectSingleQuery($query, $params);

            if (!$sessionDetails) {
                throw new Exception('Session non trouvée.');
            }

            // Copier la session
            $query = 'INSERT INTO T_Session (name, t_temps_total, fk_user) VALUES (:name, :t_temps_total, :fk_user)';
            $params = array(
                'name' => $sessionDetails['name'],
                't_temps_total' => $sessionDetails['t_temps_total'],
                'fk_user' => $pkUser
            );
            $this->pdo->executeQuery($query, $params);
            $newSessionId = $this->pdo->getLastId('T_Session');

            // Récupérer les exercices de la session existante
            $query = '
            SELECT
                fk_exercice,
                exercice_id,
                time_of_work,
                time_of_rest,
                nbrExerciceByMuscle
            FROM
                TR_Exercise_Session
            WHERE
                fk_session = :session_id
        ';
            $params = array('session_id' => $sessionId);
            $exercises = $this->pdo->selectQuery($query, $params);

            if (!$exercises) {
                throw new Exception('Aucun exercice trouvé pour cette session.');
            }

            // Copier les exercices dans la nouvelle session
            foreach ($exercises as $exercise) {
                $query = 'INSERT INTO TR_Exercise_Session (fk_exercice, fk_session, exercice_id, time_of_work, time_of_rest, nbrExerciceByMuscle) VALUES (:fk_exercice, :fk_session, :exercice_id, :time_of_work, :time_of_rest, :nbrExerciceByMuscle)';
                $params = array(
                    'fk_exercice' => $exercise['fk_exercice'],
                    'fk_session' => $newSessionId,
                    'exercice_id' => $exercise['exercice_id'],
                    'time_of_work' => $exercise['time_of_work'],
                    'time_of_rest' => $exercise['time_of_rest'],
                    'nbrExerciceByMuscle' => $exercise['nbrExerciceByMuscle']
                );
                $this->pdo->executeQuery($query, $params);
            }

            // Valider la transaction
            $this->pdo->commitTransaction();

            return $newSessionId;
        } catch (Exception $e) {
            // Annuler la transaction en cas d'erreur
            $this->pdo->rollbackTransaction();
            throw $e;
        }
    }


    /**
     * Récupère toutes les sessions associées à un utilisateur.
     *
     * @param int $userId ID de l'utilisateur.
     *
     * @return array Liste des sessions de l'utilisateur.
     *
     * @throws Exception Si une erreur survient lors de la récupération des sessions de l'utilisateur.
     */
    public function getAllSessionByUser($userId)
    {
        try {
            $query = '
            SELECT 
                s.pk_session AS session_id,
                s.name AS session_name,
                s.t_temps_total AS total_time,
                s.fk_user AS user_id,
                u.username AS username,
                s.doneNbr
            FROM 
                T_Session s
            JOIN 
                T_User u ON s.fk_user = u.pk_user
            WHERE 
                s.fk_user = :user_id
        ';
            $params = ['user_id' => $userId];
            $result = $this->pdo->selectQuery($query, $params);

            if ($result === false) {
                throw new Exception("Erreur lors de l'exécution de la requête SQL.");
            }

            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * Récupère tous les muscles de la base de données.
     *
     * Cette méthode exécute une requête SQL pour récupérer tous les enregistrements
     * de la table `T_Muscle`.
     *
     * @return array Liste de tous les muscles.
     *
     * @throws Exception Si une erreur survient lors de l'exécution de la requête SQL.
     */
    public function getAllMuscles()
    {
        try {
            // Préparation de la requête SQL pour sélectionner tous les muscles
            $query = 'SELECT * FROM `T_Muscle`;';
            // Définition des paramètres de la requête (aucun paramètre dans ce cas)
            $params = array();
            // Exécution de la requête SQL avec les paramètres fournis
            return $this->pdo->selectQuery($query, $params);
        } catch (\Exception $e) {
            // Annuler la transaction en cas d'erreur
            $this->pdo->rollbackTransaction();
            // Relancer l'exception pour être gérée à un niveau supérieur
            throw $e;
        }
    }

    /**
     * Marque une session comme terminée pour un utilisateur spécifique.
     *
     * Cette méthode met à jour le nombre de sessions terminées pour une session
     * donnée et un utilisateur spécifique en incrémentant le champ `doneNbr`.
     *
     * @param int $sessionId ID de la session.
     * @param int $userId ID de l'utilisateur.
     *
     * @return bool Résultat de l'exécution de la requête SQL.
     *
     * @throws Exception Si une erreur survient lors de l'exécution de la requête SQL.
     */
    public function finishSession($sessionId, $userId)
    {
        try {
            // Préparation de la requête SQL pour mettre à jour le nombre de sessions terminées
            $query = 'UPDATE T_Session SET doneNbr = doneNbr + 1 WHERE pk_session = :session_id AND fk_user = :user_id';
            // Définition des paramètres de la requête
            $params = array('user_id' => $userId, 'session_id' => $sessionId);
            // Exécution de la requête SQL avec les paramètres fournis
            $result = $this->pdo->executeQuery($query, $params);
            // Vérification si le résultat de la requête est faux (échec de l'exécution)
            if ($result === false) {
                // Lever une exception si la requête a échoué
                throw new Exception("Erreur lors de l'exécution de la requête SQL.");
            }
            // Retourner le résultat de l'exécution de la requête
            return $result;
        } catch (Exception $e) {
            // Relancer l'exception pour être gérée à un niveau supérieur
            throw $e;
        }
    }

    /**
     * Récupère les détails d'une session spécifique.
     *
     * Cette méthode exécute une requête SQL pour récupérer les détails d'une session
     * donnée en utilisant l'ID de la session fourni. Les détails incluent les informations
     * sur la session, les exercices associés et les muscles impliqués.
     *
     * @param int $session_id ID de la session.
     *
     * @return array Détails de la session.
     *
     * @throws Exception Si une erreur survient lors de l'exécution de la requête SQL.
     */
    public function getSessionDeta($session_id)
    {
        try {
            // Préparation de la requête SQL pour sélectionner les détails d'une session
            $query = '
                       SELECT
                            s.pk_session AS session_id,
                            s.name AS session_name,
                            s.t_temps_total AS total_time,
                            es.exercice_id AS exercise_id,
                            es.time_of_work,
                            es.time_of_rest,
                            es.nbrExerciceByMuscle,
                            m.pk_muscle AS pk_muscle,
                            m.name AS muscle_name
                        FROM
                            T_Session s
                        JOIN
                            TR_Exercise_Session es ON s.pk_session = es.fk_session
                        JOIN
                            T_Exercice e ON es.fk_exercice = e.pk_exercice
                        JOIN
                            T_Muscle m ON e.fk_muscle = m.pk_muscle
                        WHERE
                            s.pk_session = :session_id
                     ';
            // Définition des paramètres de la requête
            $params = array('session_id' => $session_id);
            // Exécution de la requête SQL avec les paramètres fournis
            $result = $this->pdo->selectQuery($query, $params);
            // Vérification si le résultat de la requête est faux (échec de l'exécution
            if ($result === false) {
                throw new Exception("Erreur lors de l'exécution de la requête SQL.");
            }
            return $result;
        } catch (Exception $e) {
            // Annuler la transaction en cas d'erreur
            $this->pdo->rollbackTransaction();
            throw $e;
        }
    }
}
