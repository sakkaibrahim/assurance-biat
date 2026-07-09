from pydantic import BaseModel


class ChatRequest(BaseModel):
    question: str
    client_id: int | None = None


class Citation(BaseModel):
    title: str
    source: str
    score: float


class ChatResponse(BaseModel):
    answer: str
    citations: list[Citation]


class RiskSimulationRequest(BaseModel):
    event_type: str
    severity: float = 0.5
    region: str | None = None

