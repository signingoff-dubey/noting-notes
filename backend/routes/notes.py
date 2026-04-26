"""Notes routing."""

from fastapi import APIRouter, Header, HTTPException
from backend.models.note import NoteCreate, NoteUpdate, NoteResponse
from backend.services import note_service
from backend.services import vault_service

router = APIRouter(prefix="/api/notes", tags=["notes"])


async def _require_vault_access(note_id: str, x_vault_token: str | None) -> None:
    """Check vault access if note is vault-protected."""
    note = await note_service.get_note(note_id)
    if note.get("is_vault"):
        if not x_vault_token or not vault_service.verify_token(x_vault_token):
            raise HTTPException(status_code=403, detail="Vault access required")


@router.get("", response_model=list[NoteResponse])
async def list_notes(x_vault_token: str | None = Header(None)):
    token = x_vault_token if x_vault_token and vault_service.verify_token(x_vault_token) else None
    return await note_service.list_notes(token)


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(note_id: str, x_vault_token: str | None = Header(None)):
    await _require_vault_access(note_id, x_vault_token)
    return await note_service.get_note(note_id)


@router.post("", response_model=NoteResponse)
async def create_note(data: NoteCreate):
    return await note_service.create_note(data)


@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(note_id: str, data: NoteUpdate, x_vault_token: str | None = Header(None)):
    await _require_vault_access(note_id, x_vault_token)
    return await note_service.update_note(note_id, data)


@router.delete("/{note_id}")
async def delete_note(note_id: str, x_vault_token: str | None = Header(None)):
    await _require_vault_access(note_id, x_vault_token)
    await note_service.delete_note(note_id)
    return {"success": True}
