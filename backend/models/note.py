"""Pydantic models for Notes."""

from pydantic import BaseModel, Field
from typing import Any, Optional
from datetime import datetime


class NoteCreate(BaseModel):
    title: str = "Untitled"
    content: Any = None
    folder_id: Optional[str] = None
    tags: list[str] = Field(default_factory=list)
    pinned: bool = False
    starred: bool = False
    is_vault: bool = False
    archived: bool = False


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Any = None
    folder_id: Optional[str] = None
    tags: Optional[list[str]] = None
    pinned: Optional[bool] = None
    starred: Optional[bool] = None
    is_vault: Optional[bool] = None
    archived: Optional[bool] = None
    word_count: Optional[int] = None


class NoteResponse(BaseModel):
    id: str
    title: str
    content: Any = None
    folder_id: Optional[str] = None
    tags: list[str] = Field(default_factory=list)
    pinned: bool = False
    starred: bool = False
    is_vault: bool = False
    archived: bool = False
    vault_content: Optional[str] = None
    word_count: int = 0
    attachments: list[str] = Field(default_factory=list)
    created_at: str = ""
    updated_at: str = ""
