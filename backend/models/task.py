"""Pydantic models for Tasks."""

from pydantic import BaseModel, Field, field_validator
from typing import Optional
from enum import Enum


class TaskPriority(str, Enum):
    NONE = "none"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"


class TaskCreate(BaseModel):
    title: str = "New Task"
    description: Optional[str] = None
    due_date: Optional[str] = None
    priority: TaskPriority = TaskPriority.NONE
    status: TaskStatus = TaskStatus.TODO
    labels: list[str] = Field(default_factory=list)
    note_id: Optional[str] = None
    archived: bool = False

    @field_validator('title')
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            return "New Task"
        return v[:200]


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    labels: Optional[list[str]] = None
    note_id: Optional[str] = None
    archived: Optional[bool] = None

    @field_validator('title')
    @classmethod
    def title_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            return "New Task"
        return v[:200] if v else v


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
