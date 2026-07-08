# Configuration XAMPP

Ce projet utilise FastAPI pour le backend et React pour le frontend.
XAMPP sert le frontend React compilé via Apache et utilise le proxy pour rediriger les requêtes API vers le backend Python.

## Prérequis

- XAMPP installé avec Apache et MySQL
- Python 3.12+ installé
- Node.js 18+ installé
- Ollama installé avec Llama 3.1 ou Mistral

## Installation

### 1. Base de données MySQL

Démarrer XAMPP et activer MySQL. Puis exécuter le script SQL :

```bash
# Option 1: Via phpMyAdmin
# Importer le fichier backend/setup_mysql.sql

# Option 2: Via ligne de commande
mysql -u root -p < backend/setup_mysql.sql
```

Ou créer manuellement la base dans phpMyAdmin :
- Nom: `assurance_biat`
- Collation: `utf8mb4_unicode_ci`

### 2. Backend

```bash
cd backend
copy .env.example .env
# Modifier DATABASE_URL dans .env si nécessaire

# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Ou utiliser le script Windows :
```bash
xampp\start-backend.bat
```

### 3. Frontend

```bash
cd frontend
npm install
npm run build
```

Copier le contenu de `frontend/dist` vers `C:\xampp\htdocs\assurance-biat\`

### 4. Apache Virtual Host

Ajouter dans `C:\xampp\apache\conf\extra\httpd-vhosts.conf` :

```apache
<VirtualHost *:80>
    ServerName assurance-biat.local
    DocumentRoot "C:/xampp/htdocs/assurance-biat"

    <Directory "C:/xampp/htdocs/assurance-biat">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ProxyPreserveHost On
    ProxyPass /api http://localhost:8000/api
    ProxyPassReverse /api http://localhost:8000/api

    ErrorLog "logs/assurance-biat-error.log"
    CustomLog "logs/assurance-biat-access.log" common
</VirtualHost>
```

Ajouter dans `C:\Windows\System32\drivers\etc\hosts` :
```
127.0.0.1 assurance-biat.local
```

Redémarrer Apache dans XAMPP.

### 5. Ollama

```bash
ollama serve
ollama pull llama3.1
```

## Accès

- Frontend: http://assurance-biat.local
- Backend API: http://localhost:8000
- Documentation API: http://localhost:8000/docs

## Identifiants par défaut

- Email: admin@example.com
- Mot de passe: admin123
