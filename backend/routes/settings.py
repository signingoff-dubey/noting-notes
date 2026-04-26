"""Settings routing."""

from fastapi import APIRouter
from backend.models.settings import SettingsUpdate, SettingsResponse
from backend.storage import store

router = APIRouter(prefix="/api/settings", tags=["settings"])

# Derive defaults from the model — single source of truth
_DEFAULTS: dict = SettingsResponse().model_dump()

# Keys stored in settings.json that must never be exposed via this endpoint
_PRIVATE_KEYS = {"vault_pin_hash"}


@router.get("", response_model=SettingsResponse)
async def get_settings():
    stored = await store.read_settings()
    for key in _PRIVATE_KEYS:
        stored.pop(key, None)
    return {**_DEFAULTS, **stored}


@router.put("", response_model=SettingsResponse)
async def update_settings(data: SettingsUpdate):
    stored = await store.read_settings()
    for key in _PRIVATE_KEYS:
        stored.pop(key, None)
    updates = data.model_dump(exclude_none=True)
    merged = {**_DEFAULTS, **stored, **updates}
    # Preserve private keys in the stored file but never expose them
    full_stored = await store.read_settings()
    private = {k: full_stored[k] for k in _PRIVATE_KEYS if k in full_stored}
    await store.write_settings({**merged, **private})
    return merged
