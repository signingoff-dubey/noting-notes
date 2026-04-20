"""Vault routing."""

from fastapi import APIRouter

from backend.models.vault import VaultSetupRequest, VaultUnlockRequest, VaultTokenResponse
from backend.services import vault_service

router = APIRouter(prefix="/api/vault", tags=["vault"])


@router.put("/pin")
async def setup_pin(req: VaultSetupRequest):
    """Set or change the vault PIN (hashed with bcrypt)."""
    await vault_service.setup_pin(req.pin)
    return {"success": True}


@router.post("/unlock", response_model=VaultTokenResponse)
async def unlock_vault(req: VaultUnlockRequest):
    token = await vault_service.unlock(req.pin)
    return {"success": True, "token": token}


@router.post("/lock")
async def lock_vault():
    await vault_service.lock()
    return {"success": True}


@router.get("/status")
async def vault_status():
    return {"unlocked": vault_service.is_unlocked()}
