@echo off
setlocal
cd /d C:\Users\brahim\Desktop\stage biat assurance\insurance-ai-assistant\backend

if not exist .venv (
    echo Création de l'environnement virtuel...
    python -m venv .venv
)

call .venv\Scripts\activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

echo Démarrage du backend FastAPI...
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
