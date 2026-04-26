"""
Attachments routing — upload, download, list, delete, extract text.

Storage layout:
  data/attachments/{note_id}/{attachment_id}_{filename}   ← actual file
  data/attachments/{note_id}/manifest.json                ← list of attachment records

Each record:
  { id, filename, mime_type, size, created_at, note_id }
"""

import asyncio
import os
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse

from backend.storage.store import DATA_DIR

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/attachments", tags=["attachments"])

ATTACHMENTS_DIR = DATA_DIR / "attachments"
_CHUNK = 1 << 20  # 1 MiB write chunks

# ──────────────── Helpers ────────────────

def _short_id() -> str:
    """12-char hex id (nanoid-style, collision-resistant enough for local use)."""
    return uuid4().hex[:12]


def _note_dir(note_id: str) -> Path:
    d = ATTACHMENTS_DIR / note_id
    d.mkdir(parents=True, exist_ok=True)
    return d


def _manifest_path(note_id: str) -> Path:
    return _note_dir(note_id) / "manifest.json"


def _read_manifest_sync(note_id: str) -> list[dict]:
    path = _manifest_path(note_id)
    if not path.exists():
        return []
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return []


def _write_manifest_sync(note_id: str, records: list[dict]) -> None:
    path = _manifest_path(note_id)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)


async def _read_manifest(note_id: str) -> list[dict]:
    return await asyncio.to_thread(_read_manifest_sync, note_id)


async def _write_manifest(note_id: str, records: list[dict]) -> None:
    await asyncio.to_thread(_write_manifest_sync, note_id, records)


def _infer_mime(filename: str, provided: str) -> str:
    """Best-effort MIME type — prefer what the client sent, fall back on extension."""
    if provided and provided != "application/octet-stream":
        return provided
    ext = Path(filename).suffix.lower()
    _MAP = {
        ".pdf":  "application/pdf",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".doc":  "application/msword",
        ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".xls":  "application/vnd.ms-excel",
        ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ".ppt":  "application/vnd.ms-powerpoint",
        ".txt":  "text/plain",
        ".md":   "text/markdown",
        ".csv":  "text/csv",
        ".png":  "image/png",
        ".jpg":  "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif":  "image/gif",
        ".webp": "image/webp",
    }
    return _MAP.get(ext, "application/octet-stream")


# ──────────────── Routes ────────────────

@router.get("/{note_id}")
async def list_attachments(note_id: str) -> list[dict]:
    """Return all attachment metadata for a note."""
    return await _read_manifest(note_id)


@router.post("/{note_id}")
async def upload_attachment(note_id: str, file: UploadFile = File(...)) -> dict:
    """
    Upload a file and attach it to a note.
    Saves the file under data/attachments/{note_id}/{id}_{filename}
    and appends a record to the manifest.
    """
    attachment_id = _short_id()
    filename = file.filename or "upload"
    # Sanitise filename to prevent path traversal
    safe_filename = Path(filename).name
    mime_type = _infer_mime(safe_filename, file.content_type or "")
    dest_path = _note_dir(note_id) / f"{attachment_id}_{safe_filename}"

    # Stream the upload to disk
    def _write_file(data: bytes) -> None:
        with open(dest_path, "wb") as f:
            f.write(data)

    content = await file.read()
    await asyncio.to_thread(_write_file, content)

    size = len(content)
    now = datetime.now(timezone.utc).isoformat()
    record = {
        "id": attachment_id,
        "filename": safe_filename,
        "mime_type": mime_type,
        "size": size,
        "created_at": now,
        "note_id": note_id,
        "stored_path": str(dest_path),
    }

    records = await _read_manifest(note_id)
    records.append(record)
    await _write_manifest(note_id, records)

    logger.info("Uploaded attachment %s for note %s (%d bytes)", attachment_id, note_id, size)
    return record


@router.get("/{note_id}/{attachment_id}/download")
async def download_attachment(note_id: str, attachment_id: str) -> FileResponse:
    """Stream the raw file back to the caller."""
    records = await _read_manifest(note_id)
    record = next((r for r in records if r["id"] == attachment_id), None)
    if not record:
        raise HTTPException(status_code=404, detail="Attachment not found")

    stored_path = Path(record["stored_path"])
    if not stored_path.exists():
        raise HTTPException(status_code=404, detail="Attachment file missing from disk")

    return FileResponse(
        path=str(stored_path),
        media_type=record["mime_type"],
        filename=record["filename"],
    )


@router.delete("/{note_id}/{attachment_id}")
async def delete_attachment(note_id: str, attachment_id: str) -> dict:
    """Delete an attachment file and remove its record from the manifest."""
    records = await _read_manifest(note_id)
    record = next((r for r in records if r["id"] == attachment_id), None)
    if not record:
        raise HTTPException(status_code=404, detail="Attachment not found")

    # Remove from disk
    stored_path = Path(record["stored_path"])
    if stored_path.exists():
        await asyncio.to_thread(stored_path.unlink)

    updated = [r for r in records if r["id"] != attachment_id]
    await _write_manifest(note_id, updated)
    logger.info("Deleted attachment %s for note %s", attachment_id, note_id)
    return {"success": True}


@router.post("/{note_id}/{attachment_id}/extract")
async def extract_attachment_text(note_id: str, attachment_id: str) -> dict:
    """
    Extract plain text from an attachment and return it.
    Supports PDF, DOCX, XLSX, PPTX. Returns "" for images or unsupported types.
    """
    records = await _read_manifest(note_id)
    record = next((r for r in records if r["id"] == attachment_id), None)
    if not record:
        raise HTTPException(status_code=404, detail="Attachment not found")

    stored_path = Path(record["stored_path"])
    if not stored_path.exists():
        raise HTTPException(status_code=404, detail="Attachment file missing from disk")

    from backend.services.file_service import extract_text
    text = await extract_text(str(stored_path), record["mime_type"])
    return {"attachment_id": attachment_id, "text": text}
