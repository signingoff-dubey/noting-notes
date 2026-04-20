"""Folders routing."""

from fastapi import APIRouter
from backend.models.folder import FolderCreate, FolderUpdate, FolderResponse
from backend.services import folder_service

router = APIRouter(prefix="/api/folders", tags=["folders"])


@router.get("", response_model=list[FolderResponse])
async def list_folders():
    return await folder_service.list_folders()


@router.post("", response_model=FolderResponse)
async def create_folder(data: FolderCreate):
    return await folder_service.create_folder(data)


@router.put("/{folder_id}", response_model=FolderResponse)
async def update_folder(folder_id: str, data: FolderUpdate):
    return await folder_service.update_folder(folder_id, data)


@router.delete("/{folder_id}")
async def delete_folder(folder_id: str):
    await folder_service.delete_folder(folder_id)
    return {"success": True}
