"""Vault PIN verification with bcrypt + in-memory session token."""

import os
import secrets
import time
import bcrypt
from fastapi import HTTPException

from backend.storage import store

# WARNING: _session_token is in-memory and not shared across uvicorn workers.
# Run with a single worker only (default). Do NOT use --workers > 1.
_session_token: str | None = None

_BCRYPT_ROUNDS = int(os.getenv("VAULT_BCRYPT_ROUNDS", "12"))
_SETTINGS_KEY = "vault_pin_hash"

_MAX_FAILED_ATTEMPTS = 5
_LOCKOUT_DURATION_SECONDS = 300

_failed_attempts: dict[str, tuple[int, float]] = {}


async def setup_pin(pin: str) -> None:
    """Hash and store a new vault PIN."""
    global _session_token
    if len(pin) < 4:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    hashed = bcrypt.hashpw(pin.encode(), bcrypt.gensalt(rounds=_BCRYPT_ROUNDS)).decode()
    settings = await store.read_settings()
    settings[_SETTINGS_KEY] = hashed
    await store.write_settings(settings)
    _failed_attempts.clear()
    _session_token = None


async def unlock(pin: str) -> str:
    """Verify PIN against stored hash. Returns session token on success."""
    global _session_token
    key = "unlock"
    now = time.time()
    if key in _failed_attempts:
        attempts, last_attempt = _failed_attempts[key]
        if attempts >= _MAX_FAILED_ATTEMPTS:
            if now - last_attempt < _LOCKOUT_DURATION_SECONDS:
                raise HTTPException(status_code=429, detail="Too many failed attempts. Try again later.")
            else:
                _failed_attempts[key] = (0, now)
    settings = await store.read_settings()
    stored_hash = settings.get(_SETTINGS_KEY)
    if not stored_hash:
        raise HTTPException(status_code=401, detail="Authentication failed")
    if not bcrypt.checkpw(pin.encode(), stored_hash.encode()):
        _failed_attempts[key] = (_failed_attempts.get(key, (0, now))[0] + 1, now)
        raise HTTPException(status_code=401, detail="Authentication failed")
    _failed_attempts[key] = (0, now)
    _session_token = secrets.token_hex(32)
    return _session_token


async def lock() -> None:
    """Invalidate the session token."""
    global _session_token
    _session_token = None


def verify_token(token: str) -> bool:
    """Check if a session token is valid."""
    return _session_token is not None and secrets.compare_digest(_session_token, token)


def is_unlocked() -> bool:
    return _session_token is not None
