"""AI routing — Ollama + OpenAI-compatible."""

from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import StreamingResponse
import json

from backend.models.ai import (
    ChatRequest, SummarizeRequest, RephraseRequest,
    EmbedRequest, SemanticSearchRequest, AIConfigModel,
)
from backend.storage import store
from backend.services import vault_service
from backend.services import note_service

router = APIRouter(prefix="/api/ai", tags=["ai"])


async def _require_vault_access(note_id: str, x_vault_token: str | None) -> None:
    try:
        note = await note_service.get_note(note_id)
    except HTTPException:
        return
    if note and note.get("is_vault"):
        if not x_vault_token or not vault_service.verify_token(x_vault_token):
            raise HTTPException(status_code=403, detail="Vault access required")


# ── Config ────────────────────────────────────────────────────────────────────

@router.get("/config")
async def get_config():
    from backend.services.ai_service import get_ai_config
    config = await get_ai_config()
    # Mask key: return has_key bool, not the actual key (for display)
    return {
        "type": config.get("type", "ollama"),
        "base_url": config.get("base_url", "https://api.openai.com/v1"),
        "api_key": config.get("api_key", ""),
        "model": config.get("model", "gpt-4o-mini"),
        "has_key": bool(config.get("api_key")),
    }


@router.post("/config")
async def save_config(body: AIConfigModel):
    from backend.services.ai_service import save_ai_config
    await save_ai_config(body.model_dump())
    return {"success": True}


# ── Models ────────────────────────────────────────────────────────────────────

@router.get("/models")
async def list_models():
    from backend.services.ai_service import list_models_detailed, check_ollama
    ollama_ok = await check_ollama()
    models = await list_models_detailed() if ollama_ok else []
    return {
        "ollama_available": ollama_ok,
        "models": models,
    }


# ── Chat ──────────────────────────────────────────────────────────────────────

@router.post("/chat")
async def chat_stream_endpoint(req: ChatRequest):
    from backend.services.ai_service import (
        chat_stream, chat_stream_openai, get_ai_config,
    )

    config = await get_ai_config()
    history: list[dict] = []
    if req.note_id:
        mem = await store.read_ai_memory(req.note_id)
        history = mem.get("messages", [])

    async def event_generator():
        full_response = ""
        try:
            use_custom = (
                config.get("type") == "custom"
                and config.get("api_key", "").strip()
            )
            if use_custom:
                stream_fn = chat_stream_openai(
                    config["base_url"],
                    config["api_key"],
                    req.model or config.get("model", "gpt-4o-mini"),
                    req.message,
                    req.note_content,
                    history,
                )
            else:
                stream_fn = chat_stream(
                    req.model, req.message, req.note_content, history
                )

            async for token in stream_fn:
                full_response += token
                yield f"data: {json.dumps({'response': token})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        finally:
            yield "data: [DONE]\n\n"
            if req.note_id and full_response:
                await store.append_ai_memory(req.note_id, req.message, full_response)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


# ── Summarize / Rephrase ──────────────────────────────────────────────────────

@router.post("/summarize")
async def summarize(req: SummarizeRequest):
    from backend.services.ai_service import generate_once, get_ai_config
    config = await get_ai_config()
    prompt = f"Summarize the following text concisely in 2-3 sentences:\n\n{req.text[:6000]}"
    model = config.get("model", "mistral:7b-instruct-q4_K_M")
    result = await generate_once(model, prompt)
    return {"summary": result}


@router.post("/rephrase")
async def rephrase(req: RephraseRequest):
    from backend.services.ai_service import generate_once, get_ai_config
    config = await get_ai_config()
    style_instructions = {
        "formal": "Rephrase in a formal, professional tone.",
        "casual": "Rephrase in a casual, conversational tone.",
        "concise": "Rephrase more concisely, removing all unnecessary words.",
        "simple": "Rephrase using simpler language that anyone can understand.",
    }
    instruction = style_instructions.get(req.style, "Rephrase the following text.")
    prompt = f"{instruction}\n\nOriginal:\n{req.text[:3000]}\n\nRephrased:"
    model = config.get("model", "mistral:7b-instruct-q4_K_M")
    result = await generate_once(model, prompt)
    return {"text": result}


# ── Memory ────────────────────────────────────────────────────────────────────

@router.get("/memory/{note_id}")
async def get_memory(note_id: str, x_vault_token: str | None = Header(None)):
    await _require_vault_access(note_id, x_vault_token)
    return await store.read_ai_memory(note_id)


@router.delete("/memory/{note_id}")
async def clear_memory(note_id: str, x_vault_token: str | None = Header(None)):
    await _require_vault_access(note_id, x_vault_token)
    await store.clear_ai_memory(note_id)
    return {"success": True}


# ── Embeddings ────────────────────────────────────────────────────────────────

@router.post("/embed")
async def embed(req: EmbedRequest, x_vault_token: str | None = Header(None)):
    await _require_vault_access(req.note_id, x_vault_token)
    from backend.services.embed_service import embed_note
    await embed_note(req.note_id, req.text)
    return {"success": True}


@router.post("/semantic-search")
async def semantic_search(req: SemanticSearchRequest):
    from backend.services.embed_service import semantic_search as svc_search
    results = await svc_search(req.query)
    return {"results": results}
