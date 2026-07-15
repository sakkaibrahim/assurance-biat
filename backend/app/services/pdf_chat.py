from __future__ import annotations

import io
import logging
import tempfile
from pathlib import Path

from fastapi import UploadFile
from pypdf import PdfReader

from app.core.config import settings
from app.services.llm import OllamaClient

logger = logging.getLogger(__name__)

MAX_PDF_CHARS = 12000
MAX_PDF_PAGES = 20


def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        pages = reader.pages[:MAX_PDF_PAGES]
        chunks = []
        for i, page in enumerate(pages):
            text = page.extract_text() or ""
            chunks.append(f"[Page {i + 1}]\n{text.strip()}")
        full = "\n\n".join(chunks)
        return full[:MAX_PDF_CHARS]
    except Exception as exc:
        logger.exception("PDF extraction failed")
        raise RuntimeError(f"Impossible de lire le PDF: {exc}") from exc


def answer_pdf_question(question: str, pdf_text: str) -> dict:
    if not pdf_text.strip():
        return {"answer": "Le PDF est vide ou n'a pas pu être lu.", "citations": []}

    llm = OllamaClient(base_url=settings.ollama_url, model=settings.ollama_model)

    prompt = (
        "Tu es un assistant qui répond à des questions sur un document PDF.\n"
        "Utilise UNIQUEMENT le contexte ci-dessous pour répondre. "
        "Si l'information n'est pas dans le contexte, dis-le clairement.\n\n"
        f"Contexte du PDF:\n{pdf_text}\n\n"
        f"Question: {question}\n\n"
        "Réponse (en français, style professionnel, concis):"
    )

    try:
        answer = llm.generate(prompt=prompt)
        return {"answer": answer, "citations": [{"title": "PDF uploadé", "source": "user_pdf", "score": 1.0}]}
    except Exception:
        logger.warning("Ollama unavailable for PDF chat, using local fallback")
        return {
            "answer": f"[Mode démo] Réponse basée sur l'extrait du PDF ({len(pdf_text)} caractères). "
                       f"Le service LLM n'est pas disponible. Activez Ollama pour une vraie réponse.\n\n"
                       f"Question: {question}",
            "citations": [{"title": "PDF uploadé (démo)", "source": "user_pdf", "score": 0.5}],
        }
