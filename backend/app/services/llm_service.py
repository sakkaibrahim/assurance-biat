from __future__ import annotations

from app.utils.config import get_settings

settings = get_settings()


def generate_answer(question: str, context: str) -> str:
    if context.strip():
        return (
            f"Réponse basée sur la documentation disponible pour: {question}\n\n"
            f"Extraits pertinents:\n{context}\n\n"
            f"Modèle cible: {settings.ollama_model}."
        )
    return (
        f"Je n'ai pas trouvé de passage pertinent pour répondre à: {question}. "
        "Importe davantage de documents ou enrichis l'index vectoriel."
    )
