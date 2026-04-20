"""
JSON file storage layer for NOTED.
All file I/O goes through this module — no other module reads/writes files directly.
Uses asyncio.to_thread for non-blocking I/O and per-file locks for safety.
"""

import asyncio
import json
import os
from pathlib import Path
from dotenv import load_dotenv

_ROOT = Path(__file__).resolve().parent.parent.parent
load_dotenv(_ROOT / "backend" / ".env")

_env_data_dir = os.getenv("DATA_DIR", "data")
DATA_DIR = (_ROOT / _env_data_dir).resolve()

# Ensure all directories exist
DIRS = [
    DATA_DIR,
    DATA_DIR / "attachments",
    DATA_DIR / "ai_memory",
    DATA_DIR / "embeddings",
    DATA_DIR / "versions",
]
for d in DIRS:
    d.mkdir(parents=True, exist_ok=True)

# File paths
NOTES_FILE = DATA_DIR / "notes.json"
TASKS_FILE = DATA_DIR / "tasks.json"
FOLDERS_FILE = DATA_DIR / "folders.json"
TAGS_FILE = DATA_DIR / "tags.json"
SETTINGS_FILE = DATA_DIR / "settings.json"

# Per-file locks
_locks: dict[str, asyncio.Lock] = {}


def _get_lock(path: str) -> asyncio.Lock:
    if path not in _locks:
        _locks[path] = asyncio.Lock()
    return _locks[path]


_MISSING = object()  # sentinel — distinguishes "no default given" from None


def _read_json_sync(path: Path, default=_MISSING):
    if not path.exists():
        return [] if default is _MISSING else default
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return [] if default is _MISSING else default


def _write_json_sync(path: Path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False, default=str)


# ──────────────── Notes ────────────────

async def read_all_notes() -> list[dict]:
    async with _get_lock(str(NOTES_FILE)):
        return await asyncio.to_thread(_read_json_sync, NOTES_FILE, [])


async def read_note(note_id: str) -> dict | None:
    notes = await read_all_notes()
    return next((n for n in notes if n["id"] == note_id), None)


async def write_note(note: dict) -> dict:
    async with _get_lock(str(NOTES_FILE)):
        notes = await asyncio.to_thread(_read_json_sync, NOTES_FILE, [])
        existing = next((i for i, n in enumerate(notes) if n["id"] == note["id"]), None)
        if existing is not None:
            notes[existing] = {**notes[existing], **note}
            result = notes[existing]
        else:
            notes.insert(0, note)
            result = note
        await asyncio.to_thread(_write_json_sync, NOTES_FILE, notes)
        return result


async def delete_note(note_id: str) -> bool:
    async with _get_lock(str(NOTES_FILE)):
        notes = await asyncio.to_thread(_read_json_sync, NOTES_FILE, [])
        filtered = [n for n in notes if n["id"] != note_id]
        if len(filtered) == len(notes):
            return False
        await asyncio.to_thread(_write_json_sync, NOTES_FILE, filtered)
        return True


# ──────────────── Folders ────────────────

async def read_all_folders() -> list[dict]:
    async with _get_lock(str(FOLDERS_FILE)):
        return await asyncio.to_thread(_read_json_sync, FOLDERS_FILE, [])


async def write_folder(folder: dict) -> dict:
    async with _get_lock(str(FOLDERS_FILE)):
        folders = await asyncio.to_thread(_read_json_sync, FOLDERS_FILE, [])
        existing = next((i for i, f in enumerate(folders) if f["id"] == folder["id"]), None)
        if existing is not None:
            folders[existing] = {**folders[existing], **folder}
            result = folders[existing]
        else:
            folders.append(folder)
            result = folder
        await asyncio.to_thread(_write_json_sync, FOLDERS_FILE, folders)
        return result


async def delete_folder(folder_id: str) -> bool:
    async with _get_lock(str(FOLDERS_FILE)):
        folders = await asyncio.to_thread(_read_json_sync, FOLDERS_FILE, [])
        filtered = [f for f in folders if f["id"] != folder_id]
        if len(filtered) == len(folders):
            return False
        await asyncio.to_thread(_write_json_sync, FOLDERS_FILE, filtered)
        return True


# ──────────────── Tasks ────────────────

async def read_all_tasks() -> list[dict]:
    async with _get_lock(str(TASKS_FILE)):
        return await asyncio.to_thread(_read_json_sync, TASKS_FILE, [])


async def read_task(task_id: str) -> dict | None:
    tasks = await read_all_tasks()
    return next((t for t in tasks if t["id"] == task_id), None)


async def write_task(task: dict) -> dict:
    async with _get_lock(str(TASKS_FILE)):
        tasks = await asyncio.to_thread(_read_json_sync, TASKS_FILE, [])
        existing = next((i for i, t in enumerate(tasks) if t["id"] == task["id"]), None)
        if existing is not None:
            tasks[existing] = {**tasks[existing], **task}
            result = tasks[existing]
        else:
            tasks.insert(0, task)
            result = task
        await asyncio.to_thread(_write_json_sync, TASKS_FILE, tasks)
        return result


async def delete_task(task_id: str) -> bool:
    async with _get_lock(str(TASKS_FILE)):
        tasks = await asyncio.to_thread(_read_json_sync, TASKS_FILE, [])
        filtered = [t for t in tasks if t["id"] != task_id]
        if len(filtered) == len(tasks):
            return False
        await asyncio.to_thread(_write_json_sync, TASKS_FILE, filtered)
        return True


# ──────────────── AI Memory ────────────────

async def read_ai_memory(note_id: str) -> dict:
    path = DATA_DIR / "ai_memory" / f"{note_id}.json"
    async with _get_lock(str(path)):
        data = await asyncio.to_thread(_read_json_sync, path, None)
        if data is None:
            return {"note_id": note_id, "model": "", "messages": []}
        return data


async def append_ai_memory(note_id: str, user_msg: str, ai_msg: str):
    path = DATA_DIR / "ai_memory" / f"{note_id}.json"
    async with _get_lock(str(path)):
        data = await asyncio.to_thread(_read_json_sync, path, None)
        if data is None:
            data = {"note_id": note_id, "model": "", "messages": []}
        from datetime import datetime, timezone
        ts = datetime.now(timezone.utc).isoformat()
        data["messages"].append({"role": "user", "content": user_msg, "timestamp": ts})
        data["messages"].append({"role": "assistant", "content": ai_msg, "timestamp": ts})
        # Keep last 20 pairs (40 messages)
        if len(data["messages"]) > 40:
            data["messages"] = data["messages"][-40:]
        await asyncio.to_thread(_write_json_sync, path, data)


async def clear_ai_memory(note_id: str):
    path = DATA_DIR / "ai_memory" / f"{note_id}.json"
    async with _get_lock(str(path)):
        data = {"note_id": note_id, "model": "", "messages": []}
        await asyncio.to_thread(_write_json_sync, path, data)


# ──────────────── Settings ────────────────

async def read_settings() -> dict:
    async with _get_lock(str(SETTINGS_FILE)):
        return await asyncio.to_thread(_read_json_sync, SETTINGS_FILE, {})


async def write_settings(settings: dict):
    async with _get_lock(str(SETTINGS_FILE)):
        await asyncio.to_thread(_write_json_sync, SETTINGS_FILE, settings)


# ──────────────── Embeddings ────────────────

async def read_embedding(note_id: str) -> list[float] | None:
    path = DATA_DIR / "embeddings" / f"{note_id}.json"
    data = await asyncio.to_thread(_read_json_sync, path, None)
    if data and "vector" in data:
        return data["vector"]
    return None


async def write_embedding(note_id: str, vector: list[float]):
    path = DATA_DIR / "embeddings" / f"{note_id}.json"
    await asyncio.to_thread(_write_json_sync, path, {"note_id": note_id, "vector": vector})


async def read_all_embeddings() -> dict[str, list[float]]:
    embed_dir = DATA_DIR / "embeddings"
    result = {}
    if embed_dir.exists():
        for f in embed_dir.iterdir():
            if f.suffix == ".json":
                data = await asyncio.to_thread(_read_json_sync, f, None)
                if data and "note_id" in data and "vector" in data:
                    result[data["note_id"]] = data["vector"]
    return result


# ──────────────── Versions ────────────────

async def save_version(note_id: str, content: dict):
    from datetime import datetime, timezone
    version_dir = DATA_DIR / "versions" / note_id
    version_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S%f")
    path = version_dir / f"{ts}.json"
    await asyncio.to_thread(_write_json_sync, path, {"timestamp": ts, "content": content})
    # Keep only last 10 versions
    versions = sorted(version_dir.iterdir(), key=lambda p: p.name)
    while len(versions) > 10:
        versions[0].unlink()
        versions.pop(0)


async def get_versions(note_id: str) -> list[dict]:
    version_dir = DATA_DIR / "versions" / note_id
    if not version_dir.exists():
        return []
    result = []
    for f in sorted(version_dir.iterdir(), key=lambda p: p.name, reverse=True):
        if f.suffix == ".json":
            data = await asyncio.to_thread(_read_json_sync, f, None)
            if data:
                result.append(data)
    return result
