from pydantic import BaseModel


class Document(BaseModel):
    id: int | None = None
    filename: str
    source_path: str
    extracted_text: str
