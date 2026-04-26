"""Pydantic models for Vault."""

from pydantic import BaseModel


class VaultSetupRequest(BaseModel):
    pin: str


class VaultUnlockRequest(BaseModel):
    pin: str


class VaultTokenResponse(BaseModel):
    success: bool
    token: str = ""
