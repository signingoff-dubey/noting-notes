"""Ollama AI client — health check, chat streaming, summarize, rephrase."""

import os
import json
from typing import AsyncIterator

import httpx
from fastapi import HTTPException

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
_CLIENT_TIMEOUT = httpx.Timeout(5.0, read=120.0)

_SYSTEM_PROMPT = (
    "You are a helpful AI assistant embedded in INK, a local notes application. "
    "You help the user understand, summarize, and work with their notes. "
    "Be concise and direct. Format code with markdown code blocks."
)


async def check_ollama() -> bool:
    """Return True if Ollama is reachable."""
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(f"{OLLAMA_URL}/api/tags")
            return r.status_code == 200
    except Exception:
        return False


async def list_models() -> list[str]:
    """Return installed Ollama model names."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{OLLAMA_URL}/api/tags")
            r.raise_for_status()
            data = r.json()
            return [m["name"] for m in data.get("models", [])]
    except Exception:
        return []


async def _require_ollama() -> None:
    if not await check_ollama():
        raise HTTPException(
            status_code=503,
            detail="Ollama is not running. Start Ollama and try again."
        )


def _build_prompt(message: str, note_content: str, history: list[dict]) -> str:
    parts = [_SYSTEM_PROMPT]
    if note_content:
        parts.append(f"\n\n## Current Note\n{note_content[:4000]}")
    if history:
        parts.append("\n\n## Conversation History")
        for msg in history[-10:]:
            role = "User" if msg["role"] == "user" else "Assistant"
            parts.append(f"{role}: {msg['content']}")
    parts.append(f"\n\nUser: {message}\nAssistant:")
    return "\n".join(parts)


async def chat_stream(
    model: str,
    message: str,
    note_content: str,
    history: list[dict],
) -> AsyncIterator[str]:
    """Stream tokens from Ollama generate endpoint."""
    await _require_ollama()
    prompt = _build_prompt(message, note_content, history)
    payload = {"model": model, "prompt": prompt, "stream": True}

    async with httpx.AsyncClient(timeout=_CLIENT_TIMEOUT) as client:
        async with client.stream(
            "POST", f"{OLLAMA_URL}/api/generate", json=payload
        ) as resp:
            if resp.status_code != 200:
                raise HTTPException(status_code=502, detail="Ollama generate failed")
            async for line in resp.aiter_lines():
                if not line:
                    continue
                try:
                    chunk = json.loads(line)
                    token = chunk.get("response", "")
                    if token:
                        yield token
                    if chunk.get("done"):
                        return
                except json.JSONDecodeError:
                    continue


async def generate_once(model: str, prompt: str) -> str:
    """Single non-streaming Ollama generate call. Returns full response."""
    await _require_ollama()
    payload = {"model": model, "prompt": prompt, "stream": False}
    async with httpx.AsyncClient(timeout=_CLIENT_TIMEOUT) as client:
        r = await client.post(f"{OLLAMA_URL}/api/generate", json=payload)
        if r.status_code != 200:
            try:
                detail = r.json().get("error", "Ollama generate failed")
            except Exception:
                detail = f"Ollama generate failed (status {r.status_code})"
            raise HTTPException(status_code=502, detail=detail)
        return r.json().get("response", "").strip()
