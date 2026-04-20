"""Pydantic models for AI endpoints (stubs)."""

from pydantic import BaseModel
from typing import Optional, Any


class ChatRequest(BaseModel):
    model: str = "mistral:7b-instruct-q4_K_M"
    note_id: Optional[str] = None
    message: str = ""
    note_content: str = ""
    attachment_id: Optional[str] = None


class SummarizeRequest(BaseModel):
    text: str


class RephraseRequest(BaseModel):
    text: str
    style: str = "formal"


class EmbedRequest(BaseModel):
    note_id: str
    text: str = ""


class SemanticSearchRequest(BaseModel):
    query: str
