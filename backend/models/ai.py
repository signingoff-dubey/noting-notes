"""Pydantic models for AI endpoints."""

from pydantic import BaseModel
from typing import Optional


class ChatRequest(BaseModel):
    model: str = "mistral:7b-instruct-q4_K_M"
    note_id: Optional[str] = None
    message: str = ""
    note_content: str = ""
    attachment_id: Optional[str] = None


class AIConfigModel(BaseModel):
    type: str = "ollama"        # "ollama" | "custom"
    base_url: str = "https://api.openai.com/v1"
    api_key: str = ""
    model: str = "gpt-4o-mini"


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
