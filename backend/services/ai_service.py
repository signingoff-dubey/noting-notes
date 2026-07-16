"""Ollama + OpenAI-compatible AI client."""

import os
import json
from typing import AsyncIterator

import httpx
from fastapi import HTTPException

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
_DATA_DIR = os.getenv("DATA_DIR", "data")
_CONFIG_FILE = os.path.join(_DATA_DIR, "ai_config.json")
_CLIENT_TIMEOUT = httpx.Timeout(5.0, read=120.0)

_SYSTEM_PROMPT = (
    "You are a helpful AI assistant embedded in NOTING, a local notes application. "
    "You help the user understand, summarize, and work with their notes. "
    "Be concise and direct. Format code with markdown code blocks."
)

MAX_NOTE_CONTENT_CHARS = 6000
MAX_CONVERSATION_PAIRS = 10

_DEFAULT_CONFIG = {
    "type": "ollama",
    "base_url": "https://api.openai.com/v1",
    "api_key": "",
    "model": "gpt-4o-mini",
}


# ── Config persistence ────────────────────────────────────────────────────────

async def get_ai_config() -> dict:
    try:
        import aiofiles
        async with aiofiles.open(_CONFIG_FILE, "r") as f:
            config = json.loads(await f.read())
    except FileNotFoundError:
        config = dict(_DEFAULT_CONFIG)
    except Exception:
        config = dict(_DEFAULT_CONFIG)

    env_key = os.getenv("GROQ_API_KEY", "").strip()
    if env_key and not config.get("api_key"):
        config["api_key"] = env_key
        config["type"] = "custom"
        config["base_url"] = "https://api.groq.com/openai/v1"

    return config


async def save_ai_config(config: dict) -> None:
    import aiofiles
    os.makedirs(_DATA_DIR, exist_ok=True)
    async with aiofiles.open(_CONFIG_FILE, "w") as f:
        await f.write(json.dumps(config, indent=2))


# ── Ollama helpers ────────────────────────────────────────────────────────────

async def check_ollama() -> bool:
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(f"{OLLAMA_URL}/api/tags")
            return r.status_code == 200
    except Exception:
        return False


async def list_models() -> list[str]:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{OLLAMA_URL}/api/tags")
            r.raise_for_status()
            data = r.json()
            return [m["name"] for m in data.get("models", [])]
    except Exception:
        return []


async def list_models_detailed() -> list[dict]:
    """Return installed models with size info."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{OLLAMA_URL}/api/tags")
            r.raise_for_status()
            data = r.json()
            result = []
            for m in data.get("models", []):
                size_bytes = m.get("size", 0)
                size_gb = round(size_bytes / 1_073_741_824, 1) if size_bytes else 0
                result.append({
                    "id": m["name"],
                    "size_gb": size_gb,
                    "size_label": f"{size_gb} GB" if size_gb else "",
                })
            return result
    except Exception:
        return []


async def _require_ollama() -> None:
    if not await check_ollama():
        raise HTTPException(
            status_code=503,
            detail="Ollama is not running. Start Ollama and try again."
        )


# ── Ollama streaming ──────────────────────────────────────────────────────────

def _build_prompt(message: str, note_content: str, history: list[dict]) -> str:
    parts = [_SYSTEM_PROMPT]
    if note_content:
        parts.append(f"\n\n## Current Note\n{note_content[:MAX_NOTE_CONTENT_CHARS]}")
    if history:
        parts.append("\n\n## Conversation History")
        for msg in history[-MAX_CONVERSATION_PAIRS:]:
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


# ── OpenAI-compatible streaming ───────────────────────────────────────────────

async def chat_stream_openai(
    base_url: str,
    api_key: str,
    model: str,
    message: str,
    note_content: str,
    history: list[dict],
) -> AsyncIterator[str]:
    system = _SYSTEM_PROMPT
    if note_content:
        system += f"\n\n## Current Note\n{note_content[:MAX_NOTE_CONTENT_CHARS]}"

    messages = [{"role": "system", "content": system}]
    for msg in history[-MAX_CONVERSATION_PAIRS:]:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": message})

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {"model": model, "messages": messages, "stream": True}
    url = f"{base_url.rstrip('/')}/chat/completions"

    try:
        async with httpx.AsyncClient(timeout=_CLIENT_TIMEOUT) as client:
            async with client.stream("POST", url, headers=headers, json=payload) as resp:
                if resp.status_code == 401:
                    raise HTTPException(status_code=401, detail="Invalid API key")
                if resp.status_code != 200:
                    raise HTTPException(status_code=502, detail=f"API error {resp.status_code}")
                async for line in resp.aiter_lines():
                    if not line or not line.startswith("data: "):
                        continue
                    data = line[6:].strip()
                    if data == "[DONE]":
                        return
                    try:
                        chunk = json.loads(data)
                        token = chunk["choices"][0]["delta"].get("content", "")
                        if token:
                            yield token
                    except (json.JSONDecodeError, KeyError, IndexError):
                        continue
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"API request failed: {e}")


# ── Non-streaming (summarize/rephrase) ───────────────────────────────────────

async def generate_once(model: str, prompt: str) -> str:
    await _require_ollama()
    payload = {"model": model, "prompt": prompt, "stream": False}
    try:
        async with httpx.AsyncClient(timeout=_CLIENT_TIMEOUT) as client:
            r = await client.post(f"{OLLAMA_URL}/api/generate", json=payload)
            if r.status_code != 200:
                try:
                    detail = r.json().get("error", "Ollama generate failed")
                except Exception:
                    detail = f"Ollama generate failed (status {r.status_code})"
                raise HTTPException(status_code=502, detail=detail)
            return r.json().get("response", "").strip()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Ollama request failed: {e}")
