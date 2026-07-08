from datetime import datetime
from pydantic import BaseModel


class DocumentRead(BaseModel):
    id: int
    filename: str
    source_path: str
    created_at: datetime | None = None

    class Config:
        from_attributes = True


class DocumentUploadResponse(BaseModel):
    message: str
    document_id: int | None = None
    filename: str


class DocumentActionResponse(BaseModel):
    message: str
    document_id: int
