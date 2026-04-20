# ARCHITECTURE.md — NOTED

Technical architecture decisions and data flow documentation.

---

## 1. SYSTEM OVERVIEW

```
┌─────────────────────────────────────────────────────────┐
│                    USER'S MACHINE                        │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────┐  │
│  │   Browser    │◄──►│   FastAPI    │◄──►│  Ollama  │  │
│  │  :3000       │    │   :8000      │    │  :11434  │  │
│  │  React/Vite  │    │  Python 3.11 │    │  Local   │  │
│  └──────────────┘    └──────┬───────┘    │  LLMs    │  │
│                             │            └──────────┘  │
│                      ┌──────▼───────┐                  │
│                      │  /data/      │                  │
│                      │  JSON files  │                  │
│                      └──────────────┘                  │
└─────────────────────────────────────────────────────────┘
```

---

## 2. DATA FLOW — KEY SCENARIOS

### 2.1 Creating a Note
```
User types → TipTap editor onChange → debounce 2s →
→ PUT /api/notes/:id (note JSON content) →
→ note_service.update() →
→ store.write_note() → notes.json updated →
→ embed_service.update_embedding() → embeddings/[id].json updated →
→ Response 200 → Frontend shows "Saved ✓"
```

### 2.2 AI Chat (Streaming)
```
User sends message →
→ POST /api/ai/chat { note_id, message, model } →
→ ai_service.chat() →
→ store.read_ai_memory(note_id) → load conversation history →
→ Build prompt with system context + note content + history + message →
→ httpx.stream → Ollama /api/chat →
→ StreamingResponse (SSE) → Frontend EventSource →
→ Tokens appended to UI in real-time →
→ On complete: store.append_ai_memory(note_id, message, response)
```

### 2.3 File Attachment + AI Q&A
```
User uploads file →
→ POST /api/attachments/:note_id (multipart) →
→ file saved to /data/attachments/[note_id]/[filename] →
→ Response: attachment metadata

User asks question about file →
→ POST /api/ai/chat { note_id, message, attachment_id, model } →
→ file_service.extract_text(attachment_id) → (cached in memory) →
→ Text chunked (max 4000 tokens per chunk) →
→ Relevant chunks selected by embedding similarity to question →
→ Chunks added to prompt context →
→ StreamingResponse → Ollama → Frontend
```

### 2.4 Semantic Search
```
User types query in AI sidebar →
→ POST /api/ai/semantic-search { query } →
→ embed_service.embed_query(query) → nomic-embed-text →
→ Load all embeddings from /data/embeddings/ →
→ Compute cosine similarity: query_vec · note_vec →
→ Sort by similarity, take top 10 →
→ Return note_ids + similarity scores →
→ Frontend fetches note metadata for those IDs →
→ Display ranked results
```

---

## 3. AI PROMPT ARCHITECTURE

All system prompts stored in `backend/prompts/` as `.txt` files, never hardcoded.

```
backend/prompts/
  chat_system.txt          ← Base system prompt for chat
  summarize.txt            ← Summarization prompt
  rephrase_formal.txt
  rephrase_casual.txt
  rephrase_concise.txt
  explain.txt
  find_actions.txt
  generate_tags.txt
  doc_qa_system.txt        ← System prompt for document Q&A
  semantic_search.txt
```

### Context Priority (what goes into the prompt)
```
1. System prompt (from .txt file)
2. Note metadata (title, tags, folder, created date)
3. Note content (full text, stripped of markdown for context)
4. Relevant attachment text (if attachment_id provided)
5. Selected text (if selection context provided)
6. Conversation history (last 20 exchanges)
7. User's current message
```

Total context budget: ~8000 tokens (safe for Mistral 7B at Q4)

---

## 4. DATA SCHEMAS

### notes.json
```json
{
  "notes": [
    {
      "id": "abc123",
      "title": "My Note",
      "content": { "type": "doc", "content": [...] },
      "folder_id": "folder_xyz",
      "tags": ["tag1", "tag2"],
      "pinned": false,
      "starred": false,
      "is_vault": false,
      "vault_content": null,
      "created_at": "2026-04-19T10:00:00Z",
      "updated_at": "2026-04-19T11:00:00Z",
      "word_count": 342,
      "attachments": ["att_id1", "att_id2"]
    }
  ]
}
```

For vault notes: `content` is null, `vault_content` is AES-256 encrypted base64 string.

### tasks.json
```json
{
  "tasks": [
    {
      "id": "task_abc",
      "title": "Review project",
      "description": "...",
      "due_date": "2026-04-25T09:00:00Z",
      "priority": "high",
      "status": "todo",
      "labels": ["work"],
      "attachments": [],
      "note_id": null,
      "calendar_event_id": null,
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}
```

### ai_memory/[note_id].json
```json
{
  "note_id": "abc123",
  "model": "mistral:7b-instruct-q4_K_M",
  "messages": [
    { "role": "user", "content": "Summarize this note", "timestamp": "..." },
    { "role": "assistant", "content": "This note discusses...", "timestamp": "..." }
  ]
}
```

---

## 5. STORAGE LAYER INTERFACE

`backend/storage/store.py` exposes these async functions.
No file I/O happens outside this module.

```python
# Notes
async def read_all_notes() -> list[dict]
async def read_note(note_id: str) -> dict | None
async def write_note(note: dict) -> dict
async def delete_note(note_id: str) -> bool

# Folders
async def read_all_folders() -> list[dict]
async def write_folder(folder: dict) -> dict

# Tasks
async def read_all_tasks() -> list[dict]
async def write_task(task: dict) -> dict
async def delete_task(task_id: str) -> bool

# AI Memory
async def read_ai_memory(note_id: str) -> dict
async def append_ai_memory(note_id: str, user_msg: str, ai_msg: str)
async def clear_ai_memory(note_id: str)

# Embeddings
async def read_embedding(note_id: str) -> list[float] | None
async def write_embedding(note_id: str, vector: list[float])
async def read_all_embeddings() -> dict[str, list[float]]

# Settings
async def read_settings() -> dict
async def write_settings(settings: dict)

# Versions
async def save_version(note_id: str, content: dict)
async def get_versions(note_id: str) -> list[dict]
```

All functions use `asyncio.to_thread` for file I/O (JSON read/write) to avoid blocking the event loop.
File locking via `asyncio.Lock` per file to prevent race conditions.

---

## 6. FRONTEND STATE ARCHITECTURE

```
App State (Zustand)
├── notesStore
│   ├── notes[]           ← Full list (metadata only)
│   ├── activeNote        ← Full note object (content included)
│   ├── folders[]
│   ├── tags[]
│   ├── activeFolderId
│   ├── viewMode          ← 'list' | 'grid'
│   └── isLoading
│
├── tasksStore
│   ├── tasks[]
│   └── activeTaskId
│
├── aiStore
│   ├── isOpen            ← AI sidebar open/closed
│   ├── activeModel       ← Selected Ollama model
│   ├── contextNoteId     ← Which note AI is focused on
│   ├── isStreaming
│   └── streamingMessage  ← Current streaming token accumulation
│
├── uiStore
│   ├── theme
│   ├── activePanel       ← 'notes' | 'tasks' | 'calendar' | 'settings'
│   ├── viewerAttachment  ← Currently open attachment in viewer
│   └── toasts[]
│
└── vaultStore
    └── isUnlocked
```

---

## 7. OLLAMA INTEGRATION

### Models Used
| Model | Purpose | VRAM | Speed |
|---|---|---|---|
| `mistral:7b-instruct-q4_K_M` | Chat, summarize, rephrase, explain | ~4.5GB | Fast |
| `nomic-embed-text` | Semantic search embeddings | ~270MB | Very fast |

**Total VRAM**: ~4.8GB — fits comfortably in 8GB VRAM (RTX 5060)

### Ollama API Calls
- Chat: `POST http://localhost:11434/api/chat` (streaming)
- Embeddings: `POST http://localhost:11434/api/embeddings`
- Model list: `GET http://localhost:11434/api/tags`

### Health Check
```python
# Called on backend startup and via GET /api/health
async def check_ollama() -> dict:
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get("http://localhost:11434/api/tags")
            models = r.json()["models"]
            return { "status": "ok", "models": [m["name"] for m in models] }
    except:
        return { "status": "error", "message": "Ollama not running" }
```

---

## 8. FILE VIEWER ARCHITECTURE

File viewers live in `frontend/src/components/viewer/`.

```
viewer/
  FileViewer.jsx        ← Container, decides which viewer to render
  PDFViewer.jsx         ← react-pdf based viewer with page nav + annotation
  DocxViewer.jsx        ← mammoth.js converts DOCX → HTML, rendered in sandboxed div
  XlsxViewer.jsx        ← SheetJS reads XLSX, rendered as HTML table with sheet tabs
  PptxViewer.jsx        ← Custom: each slide rendered as a div (text only in v1)
  ImageViewer.jsx       ← Native img tag with zoom controls
  TextViewer.jsx        ← Syntax-highlighted text/code viewer
  ViewerToolbar.jsx     ← Maximize, close, annotation toggle, page nav
```

Viewer panel behavior:
- Opens when user clicks attachment chip in note
- Slides in from right (CSS transition), note editor shifts left to 50% width
- Maximize button: viewer takes full width, note editor hidden, back button returns to split view
- Text selection in viewer fires same FloatingToolbar as note editor (same component, same behavior)

---

## 9. SECURITY CONSIDERATIONS

- All data stays local — no network calls except to localhost Ollama
- Vault uses AES-256-CBC with PBKDF2 key derivation (100,000 iterations)
- PIN hash stored as bcrypt — never the PIN itself
- No telemetry, no analytics, no external API calls in Layer 1
- File uploads validated: file extension + MIME type checked on backend
- Max file size: 50MB per attachment
- CORS locked to `http://localhost:3000` in development

---

## 10. FUTURE ARCHITECTURE (Layer 3 — Web Deployment)

When deploying to web:
- Replace Ollama calls with provider-agnostic `ai_provider.py` that supports:
  - OpenAI (`gpt-4o-mini` for cost efficiency)
  - Anthropic (`claude-haiku-4-5-20251001`)
  - Google (`gemini-flash`)
  - User-provided API key (stored encrypted in their account)
- Replace local JSON storage with PostgreSQL (via SQLAlchemy async)
- Replace local file storage with user's Google Drive (OAuth) or S3-compatible storage
- Add Google OAuth for authentication
- Add Stripe for payments
- FastAPI stays the same — only the storage and AI provider layers change
