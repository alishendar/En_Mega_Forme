<?php

/**
 * gestionAPI.php
 *
 * Description :
 * Ce fichier définit la classe GestionOfApi.
 * La classe contient les outils pour préparer les requêtes API et effectuer des transactions.
 *
 * Auteur : Shendar Ali
 * Date : 24.05.2024
 * Version : 1.2
 *
 * Modifications :
 * [Liste des modifications avec dates et descriptions]
 */
class GestionOfApi
{
    // Hôte et clé API pour accéder à l'API ExerciseDB
    private $api_host = "exercisedb.p.rapidapi.com";
    private $api_key = "8e3440ee5amsh1528ec70109208ep1f5579jsnd1f352af3f9e";

    /**
     * Constructeur de la classe GestionOfApi.
     * Initialise la connexion à la base de données.
     */
    public function __construct()
    {
        $this->pdo = Connexion::getInstance();
    }

    /**
     * Récupère des exercices ciblant une partie spécifique du corps.
     *
     * @param string $target - La partie du corps cible.
     * @return array|string - Les exercices au format JSON décodé ou un message d'erreur.
     */
    function getExerciceByTarget($target)
    {
        // Encodage de la cible pour l'URL
        $encodedTarget = rawurlencode($target);
        if (isset($target)) {
            // Initialisation de cURL
            $curl = curl_init();
            curl_setopt_array($curl, [
                CURLOPT_URL => "https://exercisedb.p.rapidapi.com/exercises/target/" . $encodedTarget,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => "",
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 30,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => "GET",
                CURLOPT_HTTPHEADER => [
                    "X-RapidAPI-Host: exercisedb.p.rapidapi.com",
                    "x-rapidapi-key: 9246de8d66mshb78afcc115bc4d8p1ca286jsn75ade07af8d8"
                ],
            ]);
            // Exécution de la requête cURL
            $response = curl_exec($curl);
            $err = curl_error($curl);
            // Fermeture de cURL
            curl_close($curl);
            // Gestion des erreurs et retour des données
            if ($err) {
                return "cURL Error #:" . $err;
            } else {
                return json_decode($response, true);
            }
        }
    }
    /**
     * Récupère les détails des exercices par leur ID.
     *
     * @param array $ids - Liste des IDs des exercices.
     * @return array - Détails des exercices.
     */
    public function getExercicById($ids)
    {
        $exercises = [];
        if (isset($ids)) {
            foreach ($ids as $id) {
                // Initialisation de cURL pour chaque ID
                $curl = curl_init();
                curl_setopt_array($curl, [
                    CURLOPT_URL => "https://exercisedb.p.rapidapi.com/exercises/exercise/" . $id[0],
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_ENCODING => "",
                    CURLOPT_MAXREDIRS => 10,
                    CURLOPT_TIMEOUT => 30,
                    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                    CURLOPT_CUSTOMREQUEST => "GET",
                    CURLOPT_HTTPHEADER => [
                        "x-rapidapi-host: exercisedb.p.rapidapi.com",
                        "x-rapidapi-key: 9246de8d66mshb78afcc115bc4d8p1ca286jsn75ade07af8d8"
                    ],
                ]);
                // Exécution de la requête cURL
                $response = curl_exec($curl);
                $err = curl_error($curl);
                // Fermeture de cURL
                curl_close($curl);
                // Gestion des erreurs et ajout des données à la liste des exercices
                if ($err) {
                    echo "cURL Error #:" . $err;
                } else {
                    $exerciseData = json_decode($response, true);

                    if (isset($exerciseData['name']) && isset($exerciseData['gifUrl'])) {
                        $exercises[] = [
                            'name' => $exerciseData['name'],
                            'gifUrl' => $exerciseData['gifUrl'],
                            'id' => $exerciseData['id']
                        ];
                    }
                }
            }
        }

        return $exercises;
    }

}