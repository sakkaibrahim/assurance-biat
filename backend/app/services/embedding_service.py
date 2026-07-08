from __future__ import annotations

import hashlib


def embed_text(text: str, dimensions: int = 16) -> list[float]:
    digest = hashlib.sha256(text.encode("utf-8")).digest()
    values = [byte / 255.0 for byte in digest[:dimensions]]
    if len(values) < dimensions:
        values.extend([0.0] * (dimensions - len(values)))
    return values
