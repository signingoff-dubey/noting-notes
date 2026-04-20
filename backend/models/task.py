"""Pydantic models for Tasks."""

from pydantic import BaseModel, Field
from typing import Optional


class TaskCreate(BaseModel):
    title: str = "New Task"
    description: Optional[str] = None
    due_date: Optional[str] = None
    priority: str = "none"
    status: str = "todo"
    labels: list[str] = Field(default_factory=list)
    note_id: Optional[str] = None
    archived: bool = False


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    labels: Optional[list[str]] = None
    note_id: Optional[str] = None
    archived: Optional[bool] = None


class TaskResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    due_date: Optional[str] = None
    priority: str = "none"
    status: str = "todo"
    labels: list[str] = Field(default_factory=list)
    attachments: list[str] = Field(default_factory=list)
    note_id: Optional[str] = None
    calendar_event_id: Optional[str] = None
    archived: bool = False
    created_at: str = ""
    updated_at: str = ""
