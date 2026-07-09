# Insurance AI Copilot

Application professionnelle de démonstration pour assurance: assistant RAG, copilot commercial, churn prediction, risk exposure, Client 360, alertes intelligentes et dashboard dynamique.

## Stack

- Frontend: React 19, Vite, Tailwind CSS, Recharts
- Backend: FastAPI, SQLAlchemy, PostgreSQL compatible SQLite en demo
- IA: LangChain/LangGraph ready, Qdrant ready, services mockables
- Async: Redis/Celery ready
- Data: Faker, NumPy, Pandas

## Lancer en local

Prerequis recommandes:

- Python 3.12 pour le backend
- Node.js 22 pour le frontend
- Docker Desktop si vous voulez lancer PostgreSQL, Redis et Qdrant

Backend:

```powershell
cd insurance-ai-copilot\backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python scripts\init_xampp_database.py
python scripts\seed_demo_data.py --rows 5000
uvicorn app.main:app --reload
```

Pour XAMPP, demarrez MySQL depuis le panneau XAMPP avant `init_xampp_database.py`.
La base utilise par defaut:

```text
mysql+pymysql://root:@127.0.0.1:3306/insurance_ai_copilot?charset=utf8mb4
```

Frontend:

```powershell
cd insurance-ai-copilot\frontend
npm install
npm run dev
```

Docker:

```powershell
cd insurance-ai-copilot
docker compose up --build
```

## Modules

- `Assistant RAG`: recherche hybride simulée avec citations et contrats de service prêts pour Qdrant.
- `Sales Copilot`: recommandations de ventes croisées avec scoring métier.
- `Churn Engine`: score de résiliation et explications des facteurs.
- `Risk Exposure`: simulation inondation, tempête, séisme.
- `Client 360`: profil client, contrats, sinistres, paiements, interactions.
- `Alerts`: alertes intelligentes sur risque, retard, churn et opportunités.
- `Analytics`: KPIs et séries dynamiques alimentés par la base.

## Architecture

Voir [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
