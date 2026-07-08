from __future__ import annotations

import hashlib
from typing import Optional


def get_embeddings() -> Optional[object]:
    try:
        from app.services.llm_service import get_embeddings as _get_embeddings
        return _get_embeddings()
    except Exception:
        return None


def embed_text(text: str, dimensions: int = 16) -> list[float]:
    embeddings = get_embeddings()
    if embeddings is not None:
        try:
            vector = embeddings.embed_query(text)
            if vector and len(vector) > 0:
                return [float(v) for v in vector]
        except Exception:
            pass

    digest = hashlib.sha256(text.encode("utf-8")).digest()
    values = [byte / 255.0 for byte in digest[:dimensions]]
    if len(values) < dimensions:
        values.extend([0.0] * (dimensions - len(values)))
    return values
