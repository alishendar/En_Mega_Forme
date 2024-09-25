<?php

/**
 * requestHandler.php
 *
 * Description :
 * ce fichier est le responsable de reçu voir les requêtes, ensuite passé les data nécessaire vers les différentes
 * fonctionnalités du serveur, pour récupérer les data depuis la base de données, et finalement il convertit
 * les data sous format json et les passés aux demandeurs
 *
 * Auteur : shendar ali
 * Date : 27.05.2024
 * Version : 1.2
 *
 *  Modifications :
 *  [Liste des modifications avec dates et descriptions]
 */


// Démarre la session de connexion entre frontend et backend
session_start();


// Inclusion des classes nécessaires
require_once('../wrk/configConnexion.php'); // Configuration de la connexion à la base de données
require_once('../wrk/connexion.php'); // Classe de gestion de la connexion à la base de données
require_once('../wrk/wrkSession.php');  // Classe de gestion des sessions
require_once('../wrk/wrkUtilisateur.php'); // Classe de gestion des utilisateurs
require_once('../wrk/gestionApi.php'); // Classe de gestion des utilisateurs

$gestionOfSession = new GestionOfSession();
$gestionOfUtilisateur = new WrkUtilisateur();
$gestionOfApi = new GestionOfApi();

// Traitement de la requête en fonction de la méthode HTTP
switch ($_SERVER['REQUEST_METHOD']) {
    case "PUT":
        doPut(); // Appel à la fonction doPut() pour les requêtes PUT
        break;

    case "GET":
        doGet(); // Appel à la fonction doGet() pour les requêtes GET
        break;

    case "POST":
        doPost(); // Appel à la fonction doPost() pour les requêtes POST
        break;

    case "DELETE":
        doDelete();  // Appel à la fonction doDelete() pour les requêtes DELETE
        break;

    default:
        sendResponse(['error' => 'Méthode non autorisée'], 405); // Réponse pour les méthodes non autorisées
        break;
}
/**
 * Gère les requêtes HTTP GET.
 *
 * @throws Exception Si une erreur survient lors du traitement de la requête.
 */
function doGet()
{

    global $gestionOfSession, $gestionOfUtilisateur, $gestionOfApi;

    // Vérification de la présence du paramètre "action" dans la requête
    if (!isset($_GET["action"])) {
        sendResponse(['error' => 'aucune action n\'a été définie'], 400);
    }

    // Traitement des différentes actions possibles
    switch ($_GET["action"]) {

        case "getAllUser":
            try {
                sendResponse($gestionOfUtilisateur->getAllUser());
            } catch (Exception $e) {
                sendResponse(['error' => $e->getMessage()], 400);
            }
            break;
        case "getSessionData":
            if (isset($_GET["sessionId"])) {
                $id = $_GET["sessionId"];
                try {
                    $data = $gestionOfSession->getSessionDeta($id);
                    sendResponse($data);
                } catch (Exception $e) {
                    sendResponse(['error' => $e->getMessage()], 400);
                }
            } else {
                sendResponse(['error' => 'sessionId manquant'], 400);
            }
            break;
        case "getAllSessionByUser":

            if (isset($_GET["userId"])) {

                $data = $gestionOfSession->getAllSessionByUser($_GET["userId"]);
                sendResponse($data);
            } else {
                sendResponse(['error' => 'userId manquant'], 400);
            }
            break;
        case "getSession":
            echo json_encode($_SESSION);// Envoie les données de la session en format JSON
            break;
        case"getAllMuscles":
            $data = $gestionOfSession->getAllMuscles();
            sendResponse($data);
            break;
        case "getExerciceByTarget":
            $result = $gestionOfApi->getExerciceByTarget($_GET["target"]);
            sendResponse($result);;
            break;
        case "getStartSession":
            if (isset($_GET["sessionId"])) {
                $id = $_GET["sessionId"];
                try {
                    $data = $gestionOfSession->getExerciceBySessionId($id);
                    $exerciceDatat = $gestionOfApi->getExercicById($data);
                    $dataSession = $gestionOfSession->getSessionDeta($id);
                    combineData($dataSession, $exerciceDatat);
                    // sendResponse($exerciceDatat);
                    //sendResponse($dataSession);
                } catch (Exception $e) {
                    sendResponse(['error' => $e->getMessage()], 400);
                }
            } else {
                sendResponse(['error' => 'sessionId manquant'], 400);
            }
            break;
        case "getFinishSession":
            if (isset($_GET["sessionId"], $_GET["userId"])) {
                $id = $_GET["sessionId"];
                $userId = $_GET["userId"];
                try {
                    $result = $gestionOfSession->finishSession($id, $userId);
                    sendResponse($result);
                } catch (Exception $e) {
                    sendResponse(['error' => $e->getMessage()], 400);
                }
            } else {
                sendResponse(['error' => 'sessionId manquant'], 400);
            }
            break;
        case "haveDrinked":
            // Vérification de la présence des paramètres "pseudo" et "mdp" dans la requête POST
            if (isset($_GET["id"])) {
                $pk_user = $_GET["id"];

                $result = $gestionOfUtilisateur->haveDrinked($pk_user);
                sendResponse($result);
            } else {
                sendResponse(['error' => 'id manquant'], 400);
            }
            break;
        case "restDayiledrink":
            // Vérification de la présence des paramètres "pseudo" et "mdp" dans la requête POST
            $result = $gestionOfUtilisateur->restDayiledrink();
            break;
        default:
            sendResponse(['error' => 'L\'action n\'est pas supportée'], 400);
    }
}

/**
 * Gère les requêtes HTTP PUT.
 *
 * @throws Exception Si une erreur survient lors du traitement de la requête.
 */
function doPut()
{
    global $gestionOfSession;

    // Lire les données PUT
    $data = json_decode(file_get_contents('php://input'), true);

    if (isset($data["action"])) {
        switch ($data["action"]) {
            case "createSession":
                if (isset($data['name'], $data['TempsWork'], $data['TempsPause'], $data['nbreExercice'], $data['userId'], $data['exercises'])) {

                    try {
                        $session_id = $gestionOfSession->createSession($data['name'], $data['TempsWork'], $data['TempsPause'], $data['nbreExercice'], $data['userId'], $data['exercises']);
                        sendResponse(['session_id' => $session_id, 'message' => 'Session created successfully']);
                    } catch (Exception $e) {
                        sendResponse(['error' => $e->getMessage()], 400);
                    }
                } else {
                    sendResponse(['error' => 'Missing parameters'], 400);
                }
                break;

            case "updateSession":
                if (isset($data["sessionId"], $data['totalWorkTime'], $data['totalRestTime'], $data['nbreExercice'], $data['exercises'])) {
                    try {
                        $updated = $gestionOfSession->updateSession($data["sessionId"], $data['totalWorkTime'], $data['totalRestTime'], $data['nbreExercice'], json_encode($data['exercises']));
                        if ($updated) {
                            sendResponse(['message' => 'La session a été mise à jour avec succès']);
                        } else {
                            sendResponse(['error' => 'Échec de la mise à jour de la session'], 400);
                        }
                    } catch (Exception $e) {
                        sendResponse(['error' => $e->getMessage()], 400);
                    }
                } else {
                    sendResponse(['error' => 'Paramètres manquants'], 400);
                }
                break;

            default:
                sendResponse(['error' => 'Action non supportée'], 400);
        }
    } else {
        sendResponse(['error' => 'Paramètre d’action manquant'], 400);
    }

}

/**
 * Gère les requêtes HTTP POST.
 *
 * @throws Exception Si une erreur survient lors du traitement de la requête.
 */
function doPost()
{
    global $gestionOfSession, $gestionOfUtilisateur;
    switch ($_POST["action"]) {

        case "login":
            // Vérification de la présence des paramètres "pseudo" et "mdp" dans la requête POST
            if (isset($_POST["pseudo"]) && isset($_POST["mdp"])) {
                $username = $_POST["pseudo"];
                $mdp = $_POST["mdp"];

                $user = $gestionOfUtilisateur->readUser($username);
                // Vérification du nom d'utilisateur et du mot de passe
                if ($username == $user["username"] && password_verify($mdp, $user["password"])) {
                    $addConnection = $gestionOfUtilisateur->addNewconnetion($user["pk_user"], getTimeForDB());
                    loginSuccess($username, $username, $user["status"], $user["pk_user"], $user["litresByDay"], $user["notificationActive"]);
                    //loginSuccess($username, $username, $user["status"], $user["pk_user"], $user["litresByDay"],$user["notificationActive"]  . " connection " . $addConnection);
                } else {
                    loginError("Login ou mot de passe incorrect -S", 401);
                }
            } else {
                sendResponse(['error' => 'Username ou mdp manquant'], 400);
            }
            break;

        case "disconnect":
            // Destruction de la session
            session_destroy();
            echo json_encode(
                array(
                    "message" => "Vous allez être déconnecté",
                    "href" => "index.html"
                )
            );
            break;
        case "addUser":
            if (isset($_POST["username"], $_POST["password"], $_POST["status"])) {
                try {

                    $added = $gestionOfUtilisateur->addUser($_POST["username"], $_POST["password"], $_POST["status"]);
                    if ($added) {
                        sendResponse(['message' => 'Nouvelle membre a été ajouter ']);
                    } else {
                        sendResponse(['error' => 'Une erreur pour ajouter le memebre' . $_POST["username"]], 400);
                    }
                } catch (Exception $e) {
                    sendResponse(['error' => $e->getMessage()], 400);
                }
            } else {
                sendResponse(['error' => 'Paramètres manquants'], 400);
            }
            break;
        case "updateUserStatus":
            $username = $_POST["username"];
            $pk = $_POST["id"];
            $newStatus = $_POST["newstatus"];
            if (isset($username) && isset($pk) && isset($newStatus)) {
                try {

                    $updated = $gestionOfUtilisateur->updateUserStatus($username, $newStatus, $pk);
                    if ($updated) {
                        sendResponse(['message' => 'Status mis à jour avec succès']);
                    } else {
                        sendResponse(['error' => 'Impossible de mettre à jour status'], 400);
                    }
                } catch (Exception $e) {
                    sendResponse(['error' => $e->getMessage()], 400);
                }
            } else {
                sendResponse(['error' => 'Paramètres manquants'], 400);
            }
            break;
        case "notifcationUser":
            if (isset($_POST['id'], $_POST['litreByDay'], $_POST['activeN'])) {
                try {
                    $updated = $gestionOfUtilisateur->notication($_POST['id'], $_POST['litreByDay'], $_POST['activeN']);
                    if ($updated) {
                        sendResponse(['message' => 'Litres par jours a été modifier']);
                    } else {
                        sendResponse(['error' => 'Erreur à modifier Litres par jour'], 400);
                    }
                } catch (Exception $e) {
                    sendResponse(['error' => $e->getMessage()], 400);
                }

            } else {
                sendResponse(['error' => 'Paramètres manquants'], 400);
            }
            break;

        case "copySession":
            if (isset($_POST["userId"], $_POST["sessionId"])) {
                $result = $gestionOfSession->copySession($_POST["sessionId"], $_POST["userId"]);
                sendResponse($result);
            } else {
                sendResponse(['error' => 'Paramètres manquants'], 400);
            }
            break;
        case "haveDrink":
            if (isset($_POST["haveDrink"], $_POST["userId"])) {
                $result = $gestionOfUtilisateur->drinke($_POST["haveDrink"], $_POST["userId"]);
                sendResponse($result);
            } else {
                sendResponse(['error' => 'Paramètres manquants'], 400);
            }
            break;
        default:
            sendResponse(['error' => "L'action n'est pas supportée"], 400);
            break;
    }
}


/**
 * Gère les requêtes HTTP DELETE.
 *
 * @throws Exception Si une erreur survient lors du traitement de la requête.
 */
function doDelete()
{
    global $gestionOfSession, $gestionOfUtilisateur;

    // Lire les données DELETE de l'URL
    $request = explode('/', trim($_SERVER['REQUEST_URI'], '/'));
    $entity = $request[count($request) - 2];
    $id = end($request);

    if (is_numeric($id)) {
        $id = (int)$id;
        try {
            switch ($entity) {
                case 'session':
                    $resault = $gestionOfSession->deleteSession($id);

                    sendResponse($resault);
                    break;

                case 'user':
                    if ($id) {
                        $deleted = $gestionOfUtilisateur->deleteUserByUsername($id);
                        if ($deleted) {
                            sendResponse(['message' => 'Utilisateur supprimé avec succès']);
                        } else {
                            sendResponse(['error' => 'Échec de la suppression de l’utilisateur'], 400);
                        }
                    } else {
                        sendResponse(['error' => 'Paramètres manquants nom d’utilisateur ou id'], 400);
                    }
                    break;

                default:
                    sendResponse(['error' => 'Entité non supportée'], 400);
            }
        } catch (Exception $e) {
            sendResponse(['error' => $e->getMessage()], 400);
        }
    } else {
        sendResponse(['error' => 'ID manquant ou invalide'], 400);
    }
}

/**
 * Envoie une réponse JSON au client.
 *
 * @param array $data Données à envoyer.
 * @param int $status Code de statut HTTP.
 */
function sendResponse($data, $status = 200)
{
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

/**
 * Gère la connexion réussie d'un utilisateur.
 *
 * @param string $message Message de bienvenue.
 * @param string $pseudo Pseudo de l'utilisateur.
 * @param string $status Statut de l'utilisateur.
 * @param int $pk ID de l'utilisateur.
 * @param int $litresByDay Objectif de litres par jour.
 */
function loginSuccess($message, $pseudo, $status, $pk, $litresByDay, $notificationActive)
{
    $_SESSION["IsConnected"] = true;
    $_SESSION['pseudo'] = $pseudo;
    $_SESSION['status'] = $status;
    $_SESSION['pk_utilisateur'] = $pk;
    echo json_encode(
        array(
            "message" => $message,
            "status" => $status,
            "id" => $pk,
            "litresByDay" => $litresByDay,
            "notificationActive" => $notificationActive
        )
    );
    die();
}

/**
 * Gère une erreur de connexion.
 *
 * @param string $message Message d'erreur.
 * @param int $code Code de statut HTTP.
 */
function loginError($message, $code)
{
    // Générer une erreur PHP avec trigger_error
    trigger_error($message, E_USER_ERROR);

    // Définir le code de réponse HTTP
    http_response_code($code);

    // Terminer le script
    die();
}

/**
 * Obtient l'heure actuelle au format UTC.
 *
 * @return string Heure actuelle au format UTC.
 */
function getTimeForClient()
{
    $timezone = new DateTimeZone('UTC');
    // Créer un objet DateTime avec le fuseau horaire spécifié
    $date = new DateTime('now', $timezone);
    // Obtenir l'heure actuelle au format UTC
    $heure_utc = $date->format('d.m.Y H:i');
    return $heure_utc;
}

/**
 * Obtient l'heure actuelle au format UTC pour la base de données.
 *
 * @return string Heure actuelle au format UTC.
 */
function getTimeForDB()
{
    // Définir le fuseau horaire
    $timezone = new DateTimeZone('UTC');
    // Créer un objet DateTime avec le fuseau horaire spécifié
    $date = new DateTime('now', $timezone);
    // Formater la date et l'heure dans le format Y-m-d H:i:s
    $formatted_date = $date->format('Y-m-d H:i:s');
    return $formatted_date;
}

/**
 * Combine les données de session et les données d'exercice.
 *
 * @param array $sessionData Données de session.
 * @param array $exerciceData Données d'exercice.
 */
function combineData($sessionData, $exerciceData)
{
    // Créer un tableau associatif pour accéder rapidement aux données d'exercice par leur ID
    $exerciceDataById = [];
    foreach ($exerciceData as $exercice) {
        $exerciceDataById[$exercice['id']] = $exercice;
    }

    // Parcourir les données de session et ajouter les informations de l'exercice correspondant
    foreach ($sessionData as &$session) {
        $exerciseId = $session['exercise_id'];
        if (isset($exerciceDataById[$exerciseId])) {
            $session['name'] = $exerciceDataById[$exerciseId]['name'];
            $session['gifUrl'] = $exerciceDataById[$exerciseId]['gifUrl'];
        }
    }

    sendResponse($sessionData);
}

?>
