from app.schemas.api import Citation


def answer_question(question: str, client_id: int | None = None) -> dict:
    scope = f" pour le client #{client_id}" if client_id else ""
    answer = (
        f"Analyse RAG{scope}: la question concerne '{question}'. "
        "La réponse combine recherche lexicale, similarité vectorielle et règles métier. "
        "En production, ce service interroge Qdrant, reranke les passages et retourne des citations vérifiables."
    )
    citations = [
        Citation(title="Conditions générales Auto", source="policy_auto_2026.pdf#p12", score=0.91),
        Citation(title="Guide indemnisation habitation", source="claims_home_guide.md#L42", score=0.86),
        Citation(title="FAQ conformité", source="compliance_faq.md#L18", score=0.79),
    ]
    return {"answer": answer, "citations": citations}

