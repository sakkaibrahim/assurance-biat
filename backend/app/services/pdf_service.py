from __future__ import annotations

from pathlib import Path

import fitz


def extract_text_from_pdf(file_path: str | Path) -> str:
    pdf_path = Path(file_path)
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    document = fitz.open(pdf_path)
    pages: list[str] = []
    for page in document:
        pages.append(page.get_text())
    return "\n".join(pages).strip()
