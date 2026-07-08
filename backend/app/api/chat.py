from fastapi import APIRouter

from app.schemas.chat import ChatHistoryItem, ChatRequest, ChatResponse, SourceChunk
from app.services.rag_service import answer_question, list_chat_history

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def ask_question(payload: ChatRequest):
    result = answer_question(payload.question)
    return ChatResponse(
        answer=result["answer"],
        sources=[SourceChunk(**source) for source in result["sources"]],
    )


@router.get("/history")
def history(limit: int = 20):
    items = list_chat_history(limit=limit)
    return {
        "items": [
            ChatHistoryItem(
                id=item["id"],
                question=item["question"],
                answer=item["answer"],
                sources=[SourceChunk(**source) for source in item["sources"]],
                created_at=item["created_at"],
            )
            for item in items
        ]
    }
