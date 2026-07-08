# Architecture du projet

## Backend (FastAPI)

- `app/api/` : Routes REST (auth, chat, documents, users)
- `app/services/` : Logique métier (RAG, PDF, LLM, embeddings)
- `app/database/` : SQLAlchemy models et connexion
- `app/schemas/` : Pydantic schemas pour validation
- `app/utils/` : Configuration, helpers, logger
- `app/models/` : Domain models (Pydantic)

## Frontend (React + Vite)

- `src/pages/` : Pages principales (Dashboard, Chat, Documents, etc.)
- `src/components/` : Composants réutilisables (Sidebar, Chat, Upload)
- `src/context/` : Contextes React (Auth)
- `src/services/` : Appels API
- `src/utils/` : Utilitaires

## Stockage

- SQLite (MVP) / MySQL (XAMPP) pour les métadonnées
- ChromaDB pour les embeddings vectoriels
- Système de fichiers pour les PDF uploadés

## IA

- Ollama pour le LLM (Llama 3.1 / Mistral)
- LangChain pour l'orchestration du pipeline RAG
- PyMuPDF pour l'extraction de texte
