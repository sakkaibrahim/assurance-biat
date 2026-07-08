from pydantic import BaseModel


class ChatMessage(BaseModel):
    id: int | None = None
    question: str
    answer: str
    sources: list[str] = []
