"""Attachments routing — real implementation."""

import json
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, Header, HTTPException, UploadFile
from fastapi.responses import FileResponse

from backend.models.note import NoteUpdate
from backend.services import note_service, vault_service
from backend.storage import store

router = APIRouter(prefix="/api/attachments", tags=["attachments"])

_ATTACH_DIR = store.DATA_DIR / "attachments"
_INDEX_FILE = _ATTACH_DIR / "_index.json"


def _read_index() -> dict:
    if not _INDEX_FILE.exists():
        return {}
    try:
        return json.loads(_INDEX_FILE.read_text(encoding="utf-8"))
    except Exception:
        return {}


def _write_index(index: dict) -> None:
    _INDEX_FILE.write_text(json.dumps(index, indent=2), encoding="utf-8")


@router.get("/file/{attachment_id}/{ext}")
async def get_attachment_file(
    attachment_id: str,
    ext: str,
    x_vault_token: str = Header(default=None),
):
    index = _read_index()
    meta = index.get(attachment_id)

    if meta and meta.get("is_vault"):
        if not vault_service.verify_token(x_vault_token or ""):
            raise HTTPException(status_code=403, detail="Vault is locked")

    file_path = _ATTACH_DIR / f"{attachment_id}.{ext}"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(file_path)


@router.get("/{note_id}", response_model=list[dict])
async def list_attachments(note_id: str):
    note = await store.read_note(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note.get("attachments", [])


@router.post("/{note_id}")
async def upload_attachment(
    note_id: str,
    file: UploadFile = File(...),
    x_vault_token: str = Header(default=None),
):
    note = await store.read_note(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    if note.get("is_vault") and not vault_service.verify_token(x_vault_token or ""):
        raise HTTPException(status_code=403, detail="Vault is locked")

    content = await file.read()
    suffix = Path(file.filename or "upload").suffix.lower() or ".bin"
    attachment_id = str(uuid4()).replace("-", "")[:20]
    file_path = _ATTACH_DIR / f"{attachment_id}{suffix}"
    file_path.write_bytes(content)

    ext_no_dot = suffix.lstrip(".")
    attachment = {
        "id": attachment_id,
        "filename": file.filename,
        "size": len(content),
        "type": suffix,
        "url": f"/api/attachments/file/{attachment_id}/{ext_no_dot}",
    }

    index = _read_index()
    index[attachment_id] = {
        "note_id": note_id,
        "is_vault": note.get("is_vault", False),
        "ext": suffix,
    }
    _write_index(index)

    current = note.get("attachments", [])
    current.append(attachment)
    await note_service.update_note(note_id, NoteUpdate(attachments=current))

    return attachment


@router.delete("/{attachment_id}")
async def delete_attachment(
    attachment_id: str,
    x_vault_token: str = Header(default=None),
):
    index = _read_index()
    meta = index.get(attachment_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Attachment not found")

    note_id = meta["note_id"]
    note = await store.read_note(note_id)

    if note and note.get("is_vault") and not vault_service.verify_token(x_vault_token or ""):
        raise HTTPException(status_code=403, detail="Vault is locked")

    file_path = _ATTACH_DIR / f"{attachment_id}{meta.get('ext', '')}"
    if file_path.exists():
        file_path.unlink()

    del index[attachment_id]
    _write_index(index)

    if note:
        attachments = [a for a in note.get("attachments", []) if a.get("id") != attachment_id]
        await note_service.update_note(note_id, NoteUpdate(attachments=attachments))

    return {"success": True}
