from __future__ import annotations

import json
from datetime import datetime
from dataclasses import dataclass, field
from pathlib import Path

from app.database.db import SessionLocal
from app.database.models import ChatTable, DocumentTable
from app.services.embedding_service import get_embeddings
from app.services.llm_service import generate_answer
from app.services.pdf_service import extract_text_from_pdf
from app.utils.config import get_settings
from app.utils.helpers import chunk_text, ensure_directory

settings = get_settings()


@dataclass
class ChunkRecord:
    document_id: int
    filename: str
    excerpt: str
    embedding: list[float] = field(default_factory=list)


@dataclass
class DocumentRecord:
    id: int
    filename: str
    source_path: str
    extracted_text: str
    created_at: datetime | None = None
    chunks: list[ChunkRecord] = field(default_factory=list)


_DOCUMENTS: list[DocumentRecord] = []
_NEXT_DOCUMENT_ID = 1
_chroma_client = None
_chroma_collection = None


def _get_chroma_collection():
    global _chroma_client, _chroma_collection
    if _chroma_collection is not None:
        return _chroma_collection

    try:
        import chromadb
        from chromadb.config import Settings as ChromaSettings

        _chroma_client = chromadb.PersistentClient(
            path=settings.chroma_dir,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
        _chroma_collection = _chroma_client.get_or_create_collection(
            name="insurance_documents",
            metadata={"hnsw:space": "cosine"},
        )
        return _chroma_collection
    except Exception:
        return None


def _sync_from_database() -> None:
    global _NEXT_DOCUMENT_ID

    _DOCUMENTS.clear()
    with SessionLocal() as session:
        rows = session.query(DocumentTable).order_by(DocumentTable.id.asc()).all()
        for row in rows:
            _DOCUMENTS.append(_rebuild_document_record(row))
        _NEXT_DOCUMENT_ID = rows[-1].id + 1 if rows else 1


def _rebuild_document_record(document_row: DocumentTable) -> DocumentRecord:
    chunks = [
        ChunkRecord(
            document_id=document_row.id,
            filename=document_row.filename,
            excerpt=chunk,
            embedding=[],
        )
        for chunk in chunk_text(document_row.extracted_text)
    ]
    return DocumentRecord(
        id=document_row.id,
        filename=document_row.filename,
        source_path=document_row.source_path,
        extracted_text=document_row.extracted_text,
        created_at=document_row.created_at,
        chunks=chunks,
    )


def _bootstrap_documents() -> None:
    if not _DOCUMENTS:
        _sync_from_database()


def ingest_pdf(file_path: str | Path, upload_dir: str = "uploads") -> DocumentRecord:
    _bootstrap_documents()
    ensure_directory(upload_dir)
    extracted_text = extract_text_from_pdf(file_path)
    filename = Path(file_path).name

    with SessionLocal() as session:
        document_row = DocumentTable(
            filename=filename,
            source_path=str(file_path),
            extracted_text=extracted_text,
        )
        session.add(document_row)
        session.commit()
        session.refresh(document_row)

    record = _rebuild_document_record(document_row)
    _DOCUMENTS.append(record)

    collection = _get_chroma_collection()
    if collection is not None:
        try:
            from app.services.embedding_service import embed_text
            texts = chunk_text(extracted_text)
            embeddings = [embed_text(t) for t in texts]
            ids = [f"doc_{document_row.id}_chunk_{i}" for i in range(len(texts))]
            metadatas = [{"document_id": document_row.id, "filename": filename} for _ in texts]
            collection.add(documents=texts, embeddings=embeddings, ids=ids, metadatas=metadatas)
        except Exception:
            pass

    return record


def delete_document(document_id: int) -> None:
    _bootstrap_documents()
    with SessionLocal() as session:
        document_row = session.query(DocumentTable).filter(DocumentTable.id == document_id).first()
        if document_row is None:
            raise ValueError("Document introuvable")

        source_path = Path(document_row.source_path)
        if source_path.exists():
            source_path.unlink()

        session.delete(document_row)
        session.commit()

    collection = _get_chroma_collection()
    if collection is not None:
        try:
            collection.delete(where={"document_id": document_id})
        except Exception:
            pass

    _sync_from_database()


def reindex_document(document_id: int) -> DocumentRecord:
    _bootstrap_documents()

    with SessionLocal() as session:
        document_row = session.query(DocumentTable).filter(DocumentTable.id == document_id).first()
        if document_row is None:
            raise ValueError("Document introuvable")

        source_path = Path(document_row.source_path)
        if not source_path.exists():
            raise FileNotFoundError(f"Fichier source introuvable: {source_path}")

        extracted_text = extract_text_from_pdf(source_path)
        document_row.extracted_text = extracted_text
        document_row.filename = source_path.name
        session.commit()
        session.refresh(document_row)

    collection = _get_chroma_collection()
    if collection is not None:
        try:
            collection.delete(where={"document_id": document_id})
            from app.services.embedding_service import embed_text
            texts = chunk_text(extracted_text)
            embeddings = [embed_text(t) for t in texts]
            ids = [f"doc_{document_id}_chunk_{i}" for i in range(len(texts))]
            metadatas = [{"document_id": document_id, "filename": source_path.name} for _ in texts]
            collection.add(documents=texts, embeddings=embeddings, ids=ids, metadatas=metadatas)
        except Exception:
            pass

    _sync_from_database()
    for document in _DOCUMENTS:
        if document.id == document_id:
            return document

    raise ValueError("Document introuvable")


def list_documents() -> list[DocumentRecord]:
    _bootstrap_documents()
    return list(_DOCUMENTS)


def _score(question: str, chunk: ChunkRecord) -> int:
    question_terms = {term.lower() for term in question.split() if len(term) > 2}
    excerpt_terms = {term.lower() for term in chunk.excerpt.split()}
    return len(question_terms.intersection(excerpt_terms))


def search(question: str, limit: int = 4) -> list[ChunkRecord]:
    collection = _get_chroma_collection()
    if collection is not None:
        try:
            from app.services.embedding_service import embed_text
            query_embedding = embed_text(question)
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=min(limit, 10),
                include=["documents", "metadatas", "distances"],
            )
            chunks: list[ChunkRecord] = []
            if results and results.get("documents"):
                for doc_text, metadata in zip(results["documents"][0], results["metadatas"][0]):
                    chunks.append(ChunkRecord(
                        document_id=metadata.get("document_id", 0),
                        filename=metadata.get("filename", ""),
                        excerpt=doc_text,
                        embedding=[],
                    ))
            if chunks:
                return chunks
        except Exception:
            pass

    _bootstrap_documents()
    scored: list[tuple[int, ChunkRecord]] = []
    for document in _DOCUMENTS:
        for chunk in document.chunks:
            scored.append((_score(question, chunk), chunk))
    scored.sort(key=lambda item: item[0], reverse=True)
    return [chunk for score, chunk in scored[:limit] if score > 0] or [chunk for _, chunk in scored[:limit]]


def answer_question(question: str) -> dict[str, object]:
    relevant_chunks = search(question)
    context = "\n\n".join(chunk.excerpt for chunk in relevant_chunks)
    answer = generate_answer(question, context)
    sources = [
        {
            "document_id": chunk.document_id,
            "filename": chunk.filename,
            "excerpt": chunk.excerpt[:300],
        }
        for chunk in relevant_chunks
    ]

    with SessionLocal() as session:
        chat_row = ChatTable(
            user_question=question,
            assistant_answer=answer,
            sources=json.dumps(sources, ensure_ascii=False),
        )
        session.add(chat_row)
        session.commit()

    return {"answer": answer, "sources": sources}


def list_chat_history(limit: int = 20) -> list[dict[str, object]]:
    with SessionLocal() as session:
        rows = session.query(ChatTable).order_by(ChatTable.id.desc()).limit(limit).all()
        history: list[dict[str, object]] = []
        for row in rows:
            try:
                parsed_sources = json.loads(row.sources)
            except json.JSONDecodeError:
                parsed_sources = []
            history.append(
                {
                    "id": row.id,
                    "question": row.user_question,
                    "answer": row.assistant_answer,
                    "sources": parsed_sources,
                    "created_at": row.created_at,
                }
            )
        return history
