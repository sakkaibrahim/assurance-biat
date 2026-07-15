from fastapi import APIRouter, UploadFile, File, HTTPException

from app.schemas.api import ChatResponse
from app.services.pdf_chat import extract_text_from_pdf, answer_pdf_question

router = APIRouter()


@router.post("/pdf/chat", response_model=ChatResponse)
async def pdf_chat(file: UploadFile = File(...), question: str = "Résume ce document"):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Seuls les fichiers PDF sont acceptés.")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Fichier PDF vide.")

    try:
        pdf_text = extract_text_from_pdf(file_bytes)
    except RuntimeError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    result = answer_pdf_question(question=question, pdf_text=pdf_text)
    return ChatResponse(answer=result["answer"], citations=result["citations"])
