from datetime import datetime

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    question: str = Field(min_length=1)


class SourceChunk(BaseModel):
    document_id: int | None = None
    filename: str
    excerpt: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceChunk] = Field(default_factory=list)


class ChatHistoryItem(BaseModel):
    id: int
    question: str
    answer: str
    sources: list[SourceChunk] = Field(default_factory=list)
    created_at: datetime | None = None

    class Config:
        from_attributes = True
