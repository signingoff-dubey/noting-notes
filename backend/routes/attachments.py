"""Attachments routing."""

from fastapi import APIRouter
from typing import List

router = APIRouter(prefix="/api/attachments", tags=["attachments"])


@router.get("/{note_id}", response_model=List[dict])
async def list_attachments(note_id: str):
    return []


@router.post("/{note_id}")
async def upload_attachment(note_id: str):
    return {"success": True, "id": "placeholder_attachment_id", "filename": "test.txt", "url": "#"}


@router.delete("/{attachment_id}")
async def delete_attachment(attachment_id: str):
    return {"success": True}
