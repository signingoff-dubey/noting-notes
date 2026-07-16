"""Business logic for Notes."""

from uuid import uuid4
from datetime import datetime, timezone
from fastapi import HTTPException

from backend.storage import store
from backend.models.note import NoteCreate, NoteUpdate


async def list_notes(vault_token: str | None = None) -> list[dict]:
    """List notes, filtering vault notes unless token is provided."""
    notes = await store.read_all_notes()
    if vault_token is None:
        return [n for n in notes if not n.get("is_vault")]
    return notes


async def get_note(note_id: str) -> dict | None:
    note = await store.read_note(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


async def create_note(data: NoteCreate) -> dict:
    if data.folder_id and data.folder_id.strip():
        folders = await store.read_all_folders()
        folder_exists = any(f["id"] == data.folder_id for f in folders)
        if not folder_exists:
            raise HTTPException(status_code=400, detail="Folder not found")
    
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
    result = await store.write_note(note)
    return result


async def update_note(note_id: str, data: NoteUpdate | dict) -> dict:
    """Update a note. Accepts either a NoteUpdate model or a plain dict."""
    existing = await store.read_note(note_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Note not found")

    if isinstance(data, dict):
        updates = data
    else:
        updates = data.model_dump(exclude_unset=True)
    
    if updates.get("folder_id") and str(updates["folder_id"]).strip():
        folders = await store.read_all_folders()
        folder_exists = any(f["id"] == updates["folder_id"] for f in folders)
        if not folder_exists:
            raise HTTPException(status_code=400, detail="Folder not found")
    
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
