"""Folders routing."""

from fastapi import APIRouter, HTTPException
from uuid import uuid4
from datetime import datetime, timezone
from backend.storage import store
from backend.models.folder import FolderCreate, FolderUpdate, FolderResponse

router = APIRouter(prefix="/api/folders", tags=["folders"])


@router.get("", response_model=list[FolderResponse])
async def list_folders():
    return await store.read_all_folders()


@router.post("", response_model=FolderResponse)
async def create_folder(data: FolderCreate):
    now = datetime.now(timezone.utc).isoformat()
    folder = {
        "id": str(uuid4()),
        "name": data.name,
        "parent_id": data.parent_id,
        "created_at": now,
    }
    return await store.write_folder(folder)


@router.put("/{folder_id}", response_model=FolderResponse)
async def update_folder(folder_id: str, data: FolderUpdate):
    folders = await store.read_all_folders()
    existing = next((f for f in folders if f["id"] == folder_id), None)
    if not existing:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    updates = data.model_dump(exclude_unset=True)
    updates["id"] = folder_id
    return await store.write_folder(updates)


@router.delete("/{folder_id}")
async def delete_folder(folder_id: str):
    deleted = await store.delete_folder(folder_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Folder not found")
    return {"success": True}
