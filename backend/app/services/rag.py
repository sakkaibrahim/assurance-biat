import logging
from typing import Any

from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels

from app.core.config import settings
from app.schemas.api import Citation
from app.services.llm import OllamaClient
from app.services.copilot import client_360

logger = logging.getLogger(__name__)

DEMO_CITATIONS = [
    Citation(title="Conditions générales Auto", source="policy_auto_2026.pdf#p12", score=0.82),
    Citation(title="Guide indemnisation habitation", source="claims_home_guide.md#L42", score=0.74),
    Citation(title="FAQ conformité", source="compliance_faq.md#L18", score=0.61),
]


def _ensure_demo_collection(qdrant: QdrantClient, llm: OllamaClient, collection_name: str) -> int:
    """
    Ensures Qdrant collection exists and contains at least demo documents
    so /api/rag/chat works before real ingestion is implemented.
    """
    # Create collection if missing
    try:
        existing = qdrant.get_collection(collection_name)
        points_count = existing.points_count or 0
    except Exception:
        existing = None
        points_count = 0

    if existing is None:
        # Determine vector size from a single embedding
        vec = llm.embeddings("document de test")
        vector_size = len(vec)
        logger.info("Creating Qdrant collection %s with vector_size=%s", collection_name, vector_size)

        qdrant.create_collection(
            collection_name=collection_name,
            vectors_config=qmodels.VectorParams(size=vector_size, distance=qmodels.Distance.COSINE),
        )
        points_count = 0

    if points_count == 0:
        demo_docs: list[dict[str, Any]] = [
            {
                "id": 1,
                "title": "Conditions générales Auto",
                "source": "policy_auto_2026.pdf#p12",
                "text": "Les garanties, exclusions et modalités de prise en charge sont détaillées dans les conditions générales. "
                        "Pour toute demande d'indemnisation, les pièces justificatives doivent être transmises dans les délais.",
            },
            {
                "id": 2,
                "title": "Guide indemnisation habitation",
                "source": "claims_home_guide.md#L42",
                "text": "En cas de sinistre habitation, la procédure suit : déclaration, expertise, évaluation du dommage et paiement "
                        "selon les garanties souscrites. Les montants dépendent du niveau de couverture et des justificatifs.",
            },
            {
                "id": 3,
                "title": "FAQ conformité",
                "source": "compliance_faq.md#L18",
                "text": "La conformité et la validité des contrats dépendent du respect des conditions, "
                        "des mises à jour et des exigences réglementaires applicables.",
            },
        ]

        logger.info("Upserting %s demo docs into Qdrant collection %s", len(demo_docs), collection_name)

        # Embed and upsert
        ids = []
        vectors = []
        payloads = []
        for doc in demo_docs:
            emb = llm.embeddings(doc["text"])
            ids.append(doc["id"])
            vectors.append(emb)
            payloads.append(
                {
                    "title": doc["title"],
                    "source": doc["source"],
                    "text": doc["text"],
                }
            )

        qdrant.upsert(
            collection_name=collection_name,
            points=qmodels.Batch(ids=ids, vectors=vectors, payloads=payloads),
        )

    return qdrant.count(collection_name=collection_name).count


def answer_question(question: str, client_id: int | None = None, db=None) -> dict:
    scope = f" pour le client #{client_id}" if client_id else ""
    collection_name = "rag_docs"

    llm = OllamaClient(base_url=settings.ollama_url, model=settings.ollama_model)

    # Try the real RAG pipeline (Ollama + Qdrant). If either is unavailable,
    # degrade gracefully to a grounded mock so the copilot stays usable.
    try:
        qdrant = QdrantClient(url=settings.qdrant_url)
        _ensure_demo_collection(qdrant=qdrant, llm=llm, collection_name=collection_name)

        query_vec = llm.embeddings(question)
        search_res = qdrant.search(
            collection_name=collection_name,
            query_vector=query_vec,
            limit=3,
            with_payload=True,
        )

        citations: list[Citation] = []
        context_passages: list[str] = []
        for hit in search_res:
            payload = hit.payload or {}
            title = payload.get("title") or "Document"
            source = payload.get("source") or "source_unknown"
            text = payload.get("text") or ""
            score = float(hit.score or 0.0)
            citations.append(Citation(title=title, source=source, score=score))
            context_passages.append(f"- {title} ({source})\n{text}".strip())

        citations_text = "\n".join(
            [f"- {c.title} ({c.source}) [score={c.score:.2f}]" for c in citations]
        )
        context_block = "\n\n".join(context_passages)
        prompt = (
            f"Contexte RAG{scope}:\n{context_block}\n\n"
            f"Question: {question}\n\n"
            f"Citations disponibles:\n{citations_text}\n\n"
            "Rédige la réponse finale ci-dessous (style professionnel, concis, orienté action conseiller)."
        )
        answer = llm.generate(prompt=prompt)
        return {"answer": answer, "citations": citations}

    except Exception:
        logger.warning("RAG real pipeline unavailable (Ollama/Qdrant), using mock mode")
        return mock_answer(question, client_id, db)


def mock_answer(question: str, client_id: int | None, db) -> dict:
    """Deterministic, grounded answer used when the LLM/vector store is offline."""
    q = (question or "").lower()
    parts: list[str] = []

    if client_id and db:
        try:
            c360 = client_360(db, client_id)
            if c360 and c360.get("client"):
                churn = c360.get("churn", {})
                recs = c360.get("recommendations", [])
                name = c360["client"]["full_name"]
                parts.append(
                    f"Pour le client {name} (#{client_id}), le score de résiliation estimé est de "
                    f"{round((churn.get('score') or 0) * 100)}% (niveau {churn.get('level') or 'n/a'})."
                )
                factors = churn.get("factors") or []
                if factors:
                    parts.append("Facteurs principaux : " + ", ".join(f["factor"] for f in factors[:3]) + ".")
                if recs:
                    parts.append("Opportunités de vente croisée : " + ", ".join(r["product"] for r in recs[:3]) + ".")
        except Exception:
            logger.exception("mock_answer client lookup failed")

    if "churn" in q or "résiliation" in q or "fidel" in q:
        guidance = (
            "Recommandation : planifier un appel de fidélisation sous 48h, revoir le niveau de couverture "
            "et déclencher une offre de vente croisée ciblée selon le profil."
        )
    elif "sinistre" in q:
        guidance = (
            "Recommandation : vérifier le niveau de couverture, planifier l'expertise et accompagner le client "
            "sur les pièces justificatives dans les délais."
        )
    elif "vente" in q or "cross" in q or "recommand" in q:
        guidance = (
            "Recommandation : cibler les produits non détenus (vie, habitation, voyage) en fonction du profil "
            "et du revenu du client."
        )
    else:
        guidance = (
            "Recommandation : analyser le signal, préparer une proposition claire et planifier la prochaine "
            "action concrète avec le client."
        )

    parts.append(guidance)
    parts.append(
        "Références : s'appuyer sur les conditions générales et le guide d'indemnisation pour cadrer la réponse "
        "(moteur RAG en mode démonstration, sans LLM externe)."
    )

    return {"answer": " ".join(parts), "citations": DEMO_CITATIONS}


