"""Pydantic models for Settings."""

from pydantic import BaseModel
from typing import Any, Optional


class SettingsUpdate(BaseModel):
    theme: Optional[str] = None
    accent: Optional[str] = None
    font_size: Optional[str] = None
    line_height: Optional[str] = None
    editor_width: Optional[str] = None
    spell_check: Optional[bool] = None
    ai_model: Optional[str] = None
    ai_memory_enabled: Optional[bool] = None
    extra: Optional[dict[str, Any]] = None


class SettingsResponse(BaseModel):
    theme: str = "nothing-dark"
    accent: str = "white"
    font_size: str = "base"
    line_height: str = "relaxed"
    editor_width: str = "comfortable"
    spell_check: bool = True
    ai_model: str = "mistral:7b-instruct-q4_K_M"
    ai_memory_enabled: bool = True
    extra: dict[str, Any] = {}
