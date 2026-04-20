"""AI routing — real Ollama integration."""

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import json

from backend.models.ai import (
    ChatRequest, SummarizeRequest, RephraseRequest,
    EmbedRequest, SemanticSearchRequest,
)
from backend.storage import store

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.get("/models")
async def list_models():
    from backend.services.ai_service import list_models as svc_list
    models = await svc_list()
    if not models:
        return {"models": ["mistral:7b-instruct-q4_K_M", "nomic-embed-text"]}
    return {"models": models}


@router.post("/chat")
async def chat_stream_endpoint(req: ChatRequest):
    from backend.services.ai_service import chat_stream

    history: list[dict] = []
    if req.note_id:
        mem = await store.read_ai_memory(req.note_id)
        history = mem.get("messages", [])

    async def event_generator():
        full_response = ""
        try:
            async for token in chat_stream(
                req.model, req.message, req.note_content, history
            ):
                full_response += token
                yield f"data: {json.dumps({'response': token})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        finally:
            yield "data: [DONE]\n\n"
            if req.note_id and full_response:
                await store.append_ai_memory(req.note_id, req.message, full_response)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.post("/summarize")
async def summarize(req: SummarizeRequest):
    from backend.services.ai_service import generate_once
    prompt = f"Summarize the following text concisely in 2-3 sentences:\n\n{req.text[:6000]}"
    result = await generate_once("mistral:7b-instruct-q4_K_M", prompt)
    return {"summary": result}


@router.post("/rephrase")
async def rephrase(req: RephraseRequest):
    from backend.services.ai_service import generate_once
    style_instructions = {
        "formal": "Rephrase in a formal, professional tone.",
        "casual": "Rephrase in a casual, conversational tone.",
        "concise": "Rephrase more concisely, removing all unnecessary words.",
        "simple": "Rephrase using simpler language that anyone can understand.",
    }
    instruction = style_instructions.get(req.style, "Rephrase the following text.")
    prompt = f"{instruction}\n\nOriginal:\n{req.text[:3000]}\n\nRephrased:"
    result = await generate_once("mistral:7b-instruct-q4_K_M", prompt)
    return {"text": result}


@router.get("/memory/{note_id}")
async def get_memory(note_id: str):
    return await store.read_ai_memory(note_id)


@router.delete("/memory/{note_id}")
async def clear_memory(note_id: str):
    await store.clear_ai_memory(note_id)
    return {"success": True}


@router.post("/embed")
async def embed(req: EmbedRequest):
    from backend.services.embed_service import embed_note
    await embed_note(req.note_id, req.text)
    return {"success": True}


@router.post("/semantic-search")
async def semantic_search(req: SemanticSearchRequest):
    from backend.services.embed_service import semantic_search as svc_search
    results = await svc_search(req.query)
    return {"results": results}
