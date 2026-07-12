import json
import urllib.request
import urllib.error
from typing import Any


class OllamaClient:
    def __init__(self, base_url: str, model: str):
        self.base_url = base_url.rstrip("/")
        self.model = model

    def _post_json(self, path: str, payload: dict[str, Any]) -> dict[str, Any]:
        url = f"{self.base_url}{path}"
        data = json.dumps(payload).encode("utf-8")

        req = urllib.request.Request(
            url=url,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                raw = resp.read().decode("utf-8")
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace") if hasattr(e, "read") else ""
            raise RuntimeError(f"Ollama HTTPError: {e.code} {e.reason}. Body: {body}") from e
        except Exception as e:
            raise RuntimeError(f"Ollama connection failed: {e}") from e

        try:
            return json.loads(raw)
        except json.JSONDecodeError as e:
            raise RuntimeError(f"Ollama returned non-JSON response: {raw[:500]}") from e

    def generate(self, prompt: str) -> str:
        """
        Uses Ollama /api/generate endpoint.
        """
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
        }
        res = self._post_json("/api/generate", payload)
        return res.get("response", "")

    def chat(self, messages: list[dict[str, str]], system: str | None = None) -> str:
        """
        Uses Ollama /api/chat endpoint.
        """
        payload: dict[str, Any] = {
            "model": self.model,
            "stream": False,
            "messages": messages,
        }
        if system:
            payload["system"] = system

        res = self._post_json("/api/chat", payload)

        # Ollama returns something like:
        # { "message": { "role": "...", "content": "..." }, ... }
        msg = res.get("message") or {}
        return msg.get("content", "")

    def embeddings(self, text: str) -> list[float]:
        """
        Uses Ollama /api/embeddings endpoint to create embeddings for Qdrant.
        """
        payload: dict[str, Any] = {
            "model": self.model,
            "prompt": text,
        }
        res = self._post_json("/api/embeddings", payload)

        # Expected shape:
        # { "embedding": [float, ...], ... }
        emb = res.get("embedding")
        if not isinstance(emb, list) or not all(isinstance(x, (int, float)) for x in emb):
            raise RuntimeError(f"Ollama embeddings returned unexpected payload: {res}")
        return [float(x) for x in emb]
