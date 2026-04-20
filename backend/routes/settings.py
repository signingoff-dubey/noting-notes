"""Settings routing."""

from fastapi import APIRouter
from backend.models.settings import SettingsUpdate, SettingsResponse
from backend.storage import store

router = APIRouter(prefix="/api/settings", tags=["settings"])

_DEFAULTS: dict = {
    "theme": "nothing-dark",
    "accent": "white",
    "font_size": "base",
    "line_height": "relaxed",
    "editor_width": "comfortable",
    "spell_check": True,
    "ai_model": "mistral:7b-instruct-q4_K_M",
    "ai_memory_enabled": True,
    "extra": {},
}


@router.get("", response_model=SettingsResponse)
async def get_settings():
    stored = await store.read_settings()
    return {**_DEFAULTS, **stored}


@router.put("", response_model=SettingsResponse)
async def update_settings(data: SettingsUpdate):
    stored = await store.read_settings()
    updates = data.model_dump(exclude_none=True)
    merged = {**_DEFAULTS, **stored, **updates}
    await store.write_settings(merged)
    return merged
