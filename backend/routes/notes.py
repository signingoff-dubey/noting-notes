"""Notes routing."""

from fastapi import APIRouter
from backend.models.note import NoteCreate, NoteUpdate, NoteResponse
from backend.services import note_service

router = APIRouter(prefix="/api/notes", tags=["notes"])


@router.get("", response_model=list[NoteResponse])
async def list_notes():
    return await note_service.list_notes()


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(note_id: str):
    return await note_service.get_note(note_id)


@router.post("", response_model=NoteResponse)
async def create_note(data: NoteCreate):
    return await note_service.create_note(data)


@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(note_id: str, data: NoteUpdate):
    return await note_service.update_note(note_id, data)


@router.delete("/{note_id}")
async def delete_note(note_id: str):
    await note_service.delete_note(note_id)
    return {"success": True}
