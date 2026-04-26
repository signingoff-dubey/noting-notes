"""Business logic for Folders."""

from uuid import uuid4
from datetime import datetime, timezone
from fastapi import HTTPException

from backend.storage import store
from backend.models.folder import FolderCreate, FolderUpdate


async def list_folders() -> list[dict]:
    return await store.read_all_folders()


async def create_folder(data: FolderCreate) -> dict:
    if not data.name or not data.name.strip():
        raise HTTPException(status_code=400, detail="Folder name cannot be empty")
    
    if data.parent_id and data.parent_id.strip():
        folders = await store.read_all_folders()
        parent_exists = any(f["id"] == data.parent_id for f in folders)
        if not parent_exists:
            raise HTTPException(status_code=400, detail="Parent folder not found")
        cycles = _would_create_cycle(folders, data.parent_id, None)
        if cycles:
            raise HTTPException(status_code=400, detail="Cannot create circular folder reference")
    
    now = datetime.now(timezone.utc).isoformat()
    folder = {
        "id": str(uuid4()),
        "name": data.name.strip()[:100],
        "parent_id": data.parent_id,
        "created_at": now,
    }
    return await store.write_folder(folder)


def _would_create_cycle(folders: list[dict], proposed_parent_id: str, current_id: str | None) -> bool:
    """Check if setting proposed_parent_id would create a cycle."""
    visited = set()
    while proposed_parent_id:
        if proposed_parent_id == current_id or proposed_parent_id in visited:
            return True
        visited.add(proposed_parent_id)
        parent = next((f for f in folders if f["id"] == proposed_parent_id), None)
        proposed_parent_id = parent.get("parent_id") if parent else None
    return False


async def update_folder(folder_id: str, data: FolderUpdate) -> dict:
    folders = await store.read_all_folders()
    existing = next((f for f in folders if f["id"] == folder_id), None)
    if not existing:
        raise HTTPException(status_code=404, detail="Folder not found")
    updates = data.model_dump(exclude_unset=True)
    if updates.get("name"):
        updates["name"] = updates["name"].strip()[:100]
    
    new_parent_id = updates.get("parent_id")
    if new_parent_id and str(new_parent_id).strip():
        parent_exists = any(f["id"] == new_parent_id for f in folders)
        if not parent_exists:
            raise HTTPException(status_code=400, detail="Parent folder not found")
        if _would_create_cycle(folders, new_parent_id, folder_id):
            raise HTTPException(status_code=400, detail="Cannot create circular folder reference")
    
    updates["id"] = folder_id
    return await store.write_folder(updates)


async def delete_folder(folder_id: str):
    deleted = await store.delete_folder(folder_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Folder not found")
    await _reassign_orphaned_notes(folder_id)


async def _reassign_orphaned_notes(deleted_folder_id: str):
    notes = await store.read_all_notes()
    updated = False
    for note in notes:
        if note.get("folder_id") == deleted_folder_id:
            note["folder_id"] = None
            await store.write_note(note)
            updated = True
    return updated
