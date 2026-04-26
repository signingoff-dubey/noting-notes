"""
Embedding service — nomic-embed-text via Ollama.
Stores and retrieves per-note embedding vectors, and performs cosine-similarity
semantic search across all stored embeddings.
"""

import os
import asyncio
import logging
import httpx
import numpy as np

from backend.storage import store

logger = logging.getLogger(__name__)

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
EMBED_MODEL = "nomic-embed-text"
_TIMEOUT = httpx.Timeout(60.0)


async def _get_embedding(text: str) -> list[float]:
    """Call Ollama /api/embeddings and return the embedding vector."""
    payload = {"model": EMBED_MODEL, "prompt": text}
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        try:
            resp = await client.post(f"{OLLAMA_URL}/api/embeddings", json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data["embedding"]
        except httpx.HTTPStatusError as exc:
            raise RuntimeError(
                f"Ollama embedding request failed ({exc.response.status_code}): {exc.response.text}"
            ) from exc
        except httpx.RequestError as exc:
            raise RuntimeError(
                f"Cannot reach Ollama at {OLLAMA_URL}. Is Ollama running? ({exc})"
            ) from exc


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    va = np.array(a, dtype=np.float32)
    vb = np.array(b, dtype=np.float32)
    norm_a = np.linalg.norm(va)
    norm_b = np.linalg.norm(vb)
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return float(np.dot(va, vb) / (norm_a * norm_b))


async def embed_note(note_id: str, text: str) -> None:
    """
    Generate an embedding for *text* and persist it under *note_id*.
    Called by POST /api/ai/embed.
    """
    if not text or not text.strip():
        logger.warning("embed_note: empty text for note_id=%s — skipping", note_id)
        return

    vector = await _get_embedding(text)
    await store.write_embedding(note_id, vector)
    logger.debug("embed_note: stored %d-dim vector for note_id=%s", len(vector), note_id)


async def semantic_search(query: str, top_n: int = 5) -> list[dict]:
    """
    Embed *query* and return the top-N most similar notes.
    Returns a list of dicts: [{note_id: str, score: float}, ...]
    sorted by score descending.
    """
    if not query or not query.strip():
        return []

    query_vector = await _get_embedding(query)
    all_embeddings = await store.read_all_embeddings()

    if not all_embeddings:
        return []

    scored = [
        {"note_id": note_id, "score": _cosine_similarity(query_vector, vec)}
        for note_id, vec in all_embeddings.items()
    ]
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_n]
