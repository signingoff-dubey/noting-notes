"""Vault routing (stubs)."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/vault", tags=["vault"])


class UnlockRequest(BaseModel):
    pin: str


@router.post("/unlock")
async def unlock_vault(req: UnlockRequest):
    # Stub: Accept any PIN for now, or require '123456'
    if req.pin == "000000":
        raise HTTPException(status_code=401, detail="Invalid PIN")
    return {"success": True}


@router.post("/lock")
async def lock_vault():
    return {"success": True}
