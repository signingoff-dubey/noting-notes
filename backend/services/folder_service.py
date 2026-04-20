"""Business logic for Folders."""

from uuid import uuid4
from datetime import datetime, timezone
from fastapi import HTTPException

from backend.storage import store
from backend.models.folder import FolderCreate, FolderUpdate


async def list_folders() -> list[dict]:
    return await store.read_all_folders()


async def create_folder(data: FolderCreate) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    folder = {
        "id": str(uuid4()),
        "name": data.name,
        "parent_id": data.parent_id,
        "created_at": now,
    }
    return await store.write_folder(folder)


async def update_folder(folder_id: str, data: FolderUpdate) -> dict:
    folders = await store.read_all_folders()
    existing = next((f for f in folders if f["id"] == folder_id), None)
    if not existing:
        raise HTTPException(status_code=404, detail="Folder not found")
    updates = data.model_dump(exclude_unset=True)
    updates["id"] = folder_id
    return await store.write_folder(updates)


async def delete_folder(folder_id: str):
    deleted = await store.delete_folder(folder_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Folder not found")
