from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.schemas.document import DocumentActionResponse, DocumentRead, DocumentUploadResponse
from app.services.rag_service import delete_document, ingest_pdf, list_documents, reindex_document
from app.utils.config import get_settings
from app.utils.helpers import ensure_directory

router = APIRouter(prefix="/documents", tags=["documents"])
settings = get_settings()


@router.get("", response_model=list[DocumentRead])
def get_documents():
    return [
        DocumentRead(
            id=document.id,
            filename=document.filename,
            source_path=document.source_path,
            created_at=document.created_at,
        )
        for document in list_documents()
    ]


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    upload_dir = ensure_directory(settings.upload_dir)
    target_path = upload_dir / file.filename
    contents = await file.read()
    target_path.write_bytes(contents)
    record = ingest_pdf(target_path, settings.upload_dir)
    return DocumentUploadResponse(message="Document importé avec succès", document_id=record.id, filename=record.filename)


@router.delete("/{document_id}", response_model=DocumentActionResponse)
def remove_document(document_id: int):
    try:
        delete_document(document_id)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error

    return DocumentActionResponse(message="Document supprimé avec succès", document_id=document_id)


@router.post("/{document_id}/reindex", response_model=DocumentActionResponse)
def reindex_document_route(document_id: int):
    try:
        reindex_document(document_id)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except FileNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error

    return DocumentActionResponse(message="Document réindexé avec succès", document_id=document_id)
