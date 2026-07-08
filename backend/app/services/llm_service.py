from __future__ import annotations

from typing import Optional

from app.utils.config import get_settings

settings = get_settings()


def get_llm() -> Optional[object]:
    try:
        from langchain_ollama import OllamaLLM
        return OllamaLLM(
            base_url=settings.ollama_base_url,
            model=settings.ollama_model,
            temperature=0.3,
        )
    except Exception:
        return None


def get_embeddings() -> Optional[object]:
    try:
        from langchain_ollama import OllamaEmbeddings
        return OllamaEmbeddings(
            base_url=settings.ollama_base_url,
            model=settings.ollama_model,
        )
    except Exception:
        return None


def generate_answer(question: str, context: str) -> str:
    llm = get_llm()
    if llm is None:
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

    try:
        prompt = (
            "Tu es un assistant pour agents d'assurance. "
            "Réponds UNIQUEMENT à partir du contexte fourni. "
            "Si le contexte ne contient pas la réponse, dis-le clairement.\n\n"
            f"Contexte:\n{context}\n\n"
            f"Question: {question}\n\n"
            "Réponse:"
        )
        return llm.invoke(prompt)
    except Exception:
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
