"""AI routing (stubs)."""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import asyncio
import json

from backend.models.ai import ChatRequest, SummarizeRequest, RephraseRequest, EmbedRequest, SemanticSearchRequest
from backend.storage import store

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.get("/models")
async def list_models():
    # Stub: Return placeholder models
    return {"models": ["mistral:7b-instruct-q4_K_M", "llama3:8b", "phi3:mini"]}


@router.post("/chat")
async def chat_stream(req: ChatRequest):
    # Stub: streams a placeholder response token by token
    async def event_generator():
        message = (
            "AI integration is coming soon! "
            "This is a placeholder response — connect Ollama in the next milestone to enable real AI chat."
        )
        # Emit word by word for a natural feel
        words = message.split(" ")
        for i, word in enumerate(words):
            token = word if i == 0 else " " + word
            yield f"data: {json.dumps({'response': token})}\n\n"
            await asyncio.sleep(0.04)

        yield "data: [DONE]\n\n"

        if req.note_id:
            await store.append_ai_memory(req.note_id, req.message, message)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.post("/summarize")
async def summarize(req: SummarizeRequest):
    return {"summary": "This is a placeholder summary. AI integration coming soon."}


@router.post("/rephrase")
async def rephrase(req: RephraseRequest):
    return {"text": f"[Placeholder {req.style} rephrase]: {req.text}"}


@router.get("/memory/{note_id}")
async def get_memory(note_id: str):
    return await store.read_ai_memory(note_id)


@router.delete("/memory/{note_id}")
async def clear_memory(note_id: str):
    await store.clear_ai_memory(note_id)
    return {"success": True}


@router.post("/embed")
async def embed(req: EmbedRequest):
    return {"success": True, "vector": []}


@router.post("/semantic-search")
async def semantic_search(req: SemanticSearchRequest):
    return {"results": []}
