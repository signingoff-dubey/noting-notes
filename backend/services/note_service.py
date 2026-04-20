"""Business logic for Notes."""

from uuid import uuid4
from datetime import datetime, timezone
from fastapi import HTTPException

from backend.storage import store
from backend.models.note import NoteCreate, NoteUpdate


async def list_notes() -> list[dict]:
    return await store.read_all_notes()


async def get_note(note_id: str) -> dict:
    note = await store.read_note(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


async def create_note(data: NoteCreate) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    note = {
        "id": str(uuid4()),
        "title": data.title,
        "content": data.content,
        "folder_id": data.folder_id,
        "tags": data.tags,
        "pinned": data.pinned,
        "starred": data.starred,
        "is_vault": data.is_vault,
        "archived": data.archived,
        "vault_content": None,
        "word_count": 0,
        "attachments": [],
        "created_at": now,
        "updated_at": now,
    }
    return await store.write_note(note)


async def update_note(note_id: str, data: NoteUpdate) -> dict:
    existing = await store.read_note(note_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Note not found")

    updates = data.model_dump(exclude_unset=True)
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    updates["id"] = note_id

    result = await store.write_note(updates)

    # Save version snapshot if content changed
    if "content" in updates and updates["content"] is not None:
        await store.save_version(note_id, updates["content"])

    return result


async def delete_note(note_id: str):
    deleted = await store.delete_note(note_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Note not found")
