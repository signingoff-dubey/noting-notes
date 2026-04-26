"""Constants for INK application."""

import os
from urllib.parse import urlparse

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")

_parsed = urlparse(OLLAMA_URL)
if _parsed.hostname:
    _host = _parsed.hostname.lower()
    _allowed_hosts = {"localhost", "127.0.0.1", "::1", "0.0.0.0"}
    if _host not in _allowed_hosts and not _host.endswith(".local"):
        raise ValueError(f"OLLAMA_URL must point to localhost or local addresses, got: {OLLAMA_URL}")

CHAT_MODEL = os.getenv("CHAT_MODEL", "mistral:7b-instruct-q4_K_M")
EMBED_MODEL = "nomic-embed-text"

MAX_NOTE_CONTENT_CHARS = 6000
MAX_EMBED_CHARS = 8000
MAX_QUERY_CHARS = 500
MAX_CONVERSATION_PAIRS = 10

MAX_VERSION_COUNT = 10
MAX_AI_MEMORY_MESSAGES = 40
