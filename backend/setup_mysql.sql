-- Script SQL pour initialiser la base de données assurance_biat
-- Exécuter ce script dans phpMyAdmin ou via la ligne de commande MySQL

CREATE DATABASE IF NOT EXISTS assurance_biat
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'assurance_user'@'localhost' IDENTIFIED BY 'assurance_password';
GRANT ALL PRIVILEGES ON assurance_biat.* TO 'assurance_user'@'localhost';
FLUSH PRIVILEGES;

-- Si tu préfères utiliser root sans mot de passe (développement local XAMPP) :
-- GRANT ALL PRIVILEGES ON assurance_biat.* TO 'root'@'localhost';
