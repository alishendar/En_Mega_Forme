<?php
/**
 * requestHandler.php
 *
 * Description :
 * ce fichier il contient les informations nécessaires pour que l'application puisse se connecter à la base de données.
 *
 * Auteur : shendar ali
 * Date : 24.05.2024
 * Version : 1.2
 *
 *  Modifications :
 *  [Liste des modifications avec dates et descriptions]
 */

//type de base de données
define('DB_TYPE', 'mysql');
//le line vers la base de données dans cette cas comme le backend et le frontend ses sont sur
// le même  serveur on peut laisser local host
define('DB_HOST', 'localhost');
// le nom de la base de données
define('DB_NAME', 'alis_en_Mega_forme');
//le username pour ce connecter
define('DB_USER', 'alis_admin_EMF');
// password de utilisateur
define('DB_PASS', '750379$Ziro');