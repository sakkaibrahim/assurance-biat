from sqlalchemy.orm import Session

from app.services.rag import answer_question


def chat(question: str, client_id: int | None = None, db: Session | None = None) -> dict:
    return answer_question(question=question, client_id=client_id, db=db)
