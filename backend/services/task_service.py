"""Business logic for Tasks."""

from uuid import uuid4
from datetime import datetime, timezone
from fastapi import HTTPException

from backend.storage import store
from backend.models.task import TaskCreate, TaskUpdate


async def list_tasks(vault_token: str | None = None) -> list[dict]:
    tasks = await store.read_all_tasks()
    if vault_token is None:
        filtered = []
        for task in tasks:
            if task.get("note_id"):
                note = await store.read_note(task["note_id"])
                if not note or not note.get("is_vault"):
                    filtered.append(task)
            else:
                filtered.append(task)
        return filtered
    return tasks


async def get_task(task_id: str) -> dict:
    task = await store.read_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


async def create_task(data: TaskCreate) -> dict:
    if data.note_id and data.note_id.strip():
        note = await store.read_note(data.note_id)
        if not note:
            raise HTTPException(status_code=400, detail="Linked note not found")
    
    now = datetime.now(timezone.utc).isoformat()
    task = {
        "id": str(uuid4()),
        "title": data.title,
        "description": data.description,
        "due_date": data.due_date,
        "priority": data.priority,
        "status": data.status,
        "labels": data.labels,
        "attachments": [],
        "note_id": data.note_id,
        "calendar_event_id": None,
        "archived": data.archived,
        "created_at": now,
        "updated_at": now,
    }
    return await store.write_task(task)


async def update_task(task_id: str, data: TaskUpdate) -> dict:
    existing = await store.read_task(task_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Task not found")

    updates = data.model_dump(exclude_unset=True)
    
    if updates.get("note_id") and str(updates["note_id"]).strip():
        note = await store.read_note(updates["note_id"])
        if not note:
            raise HTTPException(status_code=400, detail="Linked note not found")
    
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    updates["id"] = task_id
    return await store.write_task(updates)


async def delete_task(task_id: str):
    deleted = await store.delete_task(task_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found")
