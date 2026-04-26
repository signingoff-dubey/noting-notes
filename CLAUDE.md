# OpenWolf

@.wolf/OPENWOLF.md

This project uses OpenWolf for context management. Read and follow .wolf/OPENWOLF.md every session. Check .wolf/cerebrum.md before generating code. Check .wolf/anatomy.md before reading files.


# CLAUDE.md — Instructions for Claude Code

This file is the single source of truth for AI coding agents working on NOTED.
Read this entire file before writing a single line of code.

---

## 0. PROJECT OVERVIEW

NOTED is a locally-hosted AI-native notes application.
- **Frontend**: React 18 + Vite + Tailwind CSS (port 3000)
- **Backend**: FastAPI Python 3.11 (port 8000)
- **AI**: Ollama running locally (port 11434)
- **Storage**: Local JSON files in `/data/` directory
- **Entry point**: `run.bat` (Windows) / `run.sh` (macOS/Linux)

Full product spec lives in `PRD.md`. Full architecture lives in `ARCHITECTURE.md`. Design system lives in `DESIGN_SYSTEM.md`.
Read all three before coding any feature.

---

## 1. REPO STRUCTURE

```
noted/
├── frontend/               ← React app (Vite)
│   ├── src/
│   │   ├── components/     ← Reusable UI components
│   │   │   ├── editor/     ← TipTap editor components
│   │   │   ├── sidebar/    ← Left sidebar components
│   │   │   ├── ai/         ← AI sidebar components
│   │   │   ├── viewer/     ← File viewer components
│   │   │   └── ui/         ← Generic UI (Button, Modal, Dropdown etc.)
│   │   ├── pages/          ← Page-level components (Notes, Tasks, Calendar, Settings)
│   │   ├── store/          ← Zustand stores
│   │   ├── hooks/          ← Custom React hooks
│   │   ├── lib/            ← Utility functions, API client
│   │   ├── themes/         ← CSS theme files
│   │   └── App.jsx
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                ← FastAPI app
│   ├── main.py             ← FastAPI app entry point, route registration
│   ├── routes/             ← One file per route group
│   │   ├── notes.py
│   │   ├── folders.py
│   │   ├── tasks.py
│   │   ├── attachments.py
│   │   ├── ai.py
│   │   ├── vault.py
│   │   └── importexport.py
│   ├── services/           ← Business logic
│   │   ├── note_service.py
│   │   ├── ai_service.py
│   │   ├── embed_service.py
│   │   ├── file_service.py
│   │   └── vault_service.py
│   ├── models/             ← Pydantic models (request/response schemas)
│   │   ├── note.py
│   │   ├── task.py
│   │   └── ai.py
│   ├── storage/            ← JSON read/write layer
│   │   └── store.py
│   └── requirements.txt
│
├── data/                   ← Created at runtime, gitignored
│   ├── notes.json
│   ├── tasks.json
│   ├── folders.json
│   ├── tags.json
│   ├── settings.json
│   ├── attachments/
│   ├── ai_memory/
│   ├── embeddings/
│   └── versions/
│
├── run.bat                 ← Windows startup script
├── run.sh                  ← macOS/Linux startup script
├── PRD.md
├── CLAUDE.md               ← This file
├── ARCHITECTURE.md
├── DESIGN_SYSTEM.md
└── .gitignore
```

---

## 2. ABSOLUTE RULES — NEVER VIOLATE THESE

1. **Never use `create-react-app`**. Always use Vite.
2. **Never use `localStorage` for notes or tasks data**. All persistent data goes through FastAPI → JSON files. localStorage is only for UI preferences (last open note ID, sidebar state, etc.).
3. **Never hardcode ports**. Always use environment variables. Frontend uses `VITE_API_URL`, backend uses `HOST` and `PORT` env vars.
4. **Never store secrets in code**. API keys (for Layer 3) go in `.env` files, never committed.
5. **Never write a route handler that contains business logic**. Routes call services. Services contain logic.
6. **Never skip loading states**. Every async operation must show a loading indicator.
7. **Never skip error states**. Every async operation must handle errors and show user-facing error messages (not console.log only).
8. **Never import CSS in component files**. All styling via Tailwind utility classes or CSS variables defined in the theme files.
9. **Never use inline styles** except for dynamic values (e.g., computed width for a resize handle).
10. **Never create a Pydantic model inline inside a route**. All models live in `/backend/models/`.
11. **Always use async/await** for all Python I/O operations.
12. **Always add CORS middleware** in FastAPI for localhost development.
13. **Never delete data permanently without a confirmation modal**.
14. **Never commit the `/data/` directory**. It's gitignored.
15. **Always add the note_id to every AI request** so per-note memory works correctly.

---

## 3. CODING STANDARDS

### 3.1 Python (Backend)

```python
# ✅ CORRECT — Service layer pattern
# routes/notes.py
@router.get("/{note_id}")
async def get_note(note_id: str):
    return await note_service.get_by_id(note_id)

# services/note_service.py
async def get_by_id(note_id: str) -> NoteResponse:
    note = await store.read_note(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return NoteResponse(**note)

# ❌ WRONG — Business logic in route
@router.get("/{note_id}")
async def get_note(note_id: str):
    with open("data/notes.json") as f:
        notes = json.load(f)
    note = next((n for n in notes if n["id"] == note_id), None)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note
```

- Use `uuid4()` for all IDs, never sequential integers
- Use `datetime.utcnow().isoformat()` for all timestamps
- All JSON reads/writes go through `storage/store.py` — never open files directly in services
- Use Pydantic v2 syntax (`model_validator`, not `validator`)
- Type-hint everything. No bare `dict` returns.

### 3.2 React (Frontend)

```jsx
// ✅ CORRECT — Component structure
// components/ui/Button.jsx
export function Button({ children, variant = "primary", onClick, disabled, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(buttonVariants[variant], disabled && "opacity-50 cursor-not-allowed")}
    >
      {loading ? <Spinner size="sm" /> : children}
    </button>
  )
}

// ❌ WRONG — Logic in JSX, no loading state, inline styles
export function Button({ children, onClick }) {
  return <button onClick={onClick} style={{backgroundColor: "black"}}>{children}</button>
}
```

- **Component naming**: PascalCase for components, camelCase for hooks and utils
- **File naming**: Same as component name. `NoteCard.jsx`, not `note-card.jsx`
- **One component per file**. Exception: small sub-components used only in that file.
- **Custom hooks** for all data fetching. Never fetch inside a component directly.
- **Zustand stores** for all global state. React `useState` only for local UI state (dropdown open/closed, etc.)
- Always use `cn()` utility (clsx + tailwind-merge) for conditional classnames
- Never use `useEffect` for data fetching. Use custom hooks with the API client.
- All API calls go through `/lib/api.js` — never use `fetch` directly in components.

### 3.3 State Management (Zustand)

```js
// store/notesStore.js
import { create } from 'zustand'
import { api } from '@/lib/api'

export const useNotesStore = create((set, get) => ({
  notes: [],
  activeNoteId: null,
  isLoading: false,
  error: null,

  fetchNotes: async () => {
    set({ isLoading: true, error: null })
    try {
      const notes = await api.notes.list()
      set({ notes, isLoading: false })
    } catch (err) {
      set({ error: err.message, isLoading: false })
    }
  },

  setActiveNote: (id) => set({ activeNoteId: id }),
}))
```

Stores to create:
- `notesStore` — notes list, active note, folders, tags
- `tasksStore` — tasks list
- `aiStore` — sidebar open/closed, active model, chat history per note
- `uiStore` — theme, view mode (list/grid), sidebar states
- `vaultStore` — vault locked/unlocked state

### 3.4 API Client

```js
// lib/api.js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(method, path, body = null) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : null,
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail || 'Request failed')
  }
  return res.json()
}

export const api = {
  notes: {
    list: () => request('GET', '/api/notes'),
    get: (id) => request('GET', `/api/notes/${id}`),
    create: (data) => request('POST', '/api/notes', data),
    update: (id, data) => request('PUT', `/api/notes/${id}`, data),
    delete: (id) => request('DELETE', `/api/notes/${id}`),
  },
  // ... etc
}
```

---

## 4. FEATURE-SPECIFIC INSTRUCTIONS

### 4.1 TipTap Editor Setup
- Install extensions: `@tiptap/starter-kit`, `@tiptap/extension-highlight`, `@tiptap/extension-task-list`, `@tiptap/extension-task-item`, `@tiptap/extension-table`, `@tiptap/extension-code-block-lowlight`, `@tiptap/extension-mathematics`, `@tiptap/extension-link`, `@tiptap/extension-image`, `@tiptap/extension-character-count`
- Custom extension needed: `FloatingToolbar` — fires on text selection using TipTap's `BubbleMenu`
- Editor content stored as TipTap JSON, not HTML (easier to serialize/deserialize, more portable)
- Convert to HTML only for export

### 4.2 AI Streaming
- Use Server-Sent Events (SSE) for streaming AI responses
- Backend: `StreamingResponse` with `text/event-stream` content type
- Frontend: `EventSource` or `fetch` with `ReadableStream`
- Each token appended to the chat message in real-time

```python
# backend — streaming AI response
from fastapi.responses import StreamingResponse

async def stream_ollama(prompt, model):
    async with httpx.AsyncClient() as client:
        async with client.stream("POST", "http://localhost:11434/api/generate",
                                 json={"model": model, "prompt": prompt}) as r:
            async for chunk in r.aiter_text():
                yield f"data: {chunk}\n\n"

@router.post("/chat")
async def chat(req: ChatRequest):
    return StreamingResponse(stream_ollama(req.prompt, req.model),
                             media_type="text/event-stream")
```

### 4.3 File Text Extraction
- PDF: Use `PyMuPDF` (`import fitz`). Extract page by page.
- DOCX: Use `python-docx`. Extract paragraphs and tables.
- XLSX: Use `openpyxl`. Extract cell values, sheet names.
- PPTX: Use `python-pptx`. Extract text from each slide's shapes.
- All extraction happens in `services/file_service.py`
- Extracted text cached in memory per session (not persisted), keyed by attachment ID

### 4.4 Semantic Search
- On note save: generate embedding via `nomic-embed-text` through Ollama `/api/embeddings`
- Store embedding in `data/embeddings/[note_id].json`
- On semantic search: embed the query, compute cosine similarity against all stored embeddings, return top-N note IDs sorted by similarity
- All done in `services/embed_service.py`

```python
import numpy as np

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
```

### 4.5 Vault
- Vault is a special folder with `id: "vault"` and `encrypted: true`
- Notes in vault have their `content` field AES-256 encrypted before writing to JSON
- Vault unlock: user enters PIN → backend verifies bcrypt hash → returns a short-lived session token (stored in memory, not persisted)
- All vault note operations require this session token in the request header
- On app close / backend restart: vault automatically locks

### 4.6 Themes
- All themes defined as CSS custom properties on `:root` or `[data-theme="name"]`
- Theme applied by setting `data-theme` attribute on `<html>` element
- Tailwind configured to use CSS variables: `colors: { bg: 'var(--color-bg)', ... }`

```css
/* themes/nothing-dark.css */
[data-theme="nothing-dark"] {
  --color-bg: #0a0a0a;
  --color-surface: #141414;
  --color-surface-hover: #1e1e1e;
  --color-border: #2a2a2a;
  --color-text-primary: #f0f0f0;
  --color-text-secondary: #888888;
  --color-text-muted: #555555;
  --color-accent: #ffffff;
  --color-accent-dim: #333333;
  --font-primary: 'Ndot-55', 'Space Mono', monospace;
  --font-body: 'Space Mono', monospace;
}
```

### 4.7 run.bat Requirements
```batch
@echo off
echo ============================================
echo   NOTED - Starting up...
echo ============================================
echo.
echo [1/6] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 ( echo ERROR: Python not found. Install Python 3.11+ && pause && exit )

echo [2/6] Installing backend dependencies...
pip install -r backend/requirements.txt --quiet

echo [3/6] Checking Ollama installation...
ollama --version >nul 2>&1
if errorlevel 1 ( echo Ollama not found. Downloading... && ... )

echo [4/6] Pulling AI models (first run takes 5-10 minutes)...
ollama pull mistral:7b-instruct-q4_K_M
ollama pull nomic-embed-text

echo [5/6] Starting backend server...
start /B python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000

echo [6/6] Installing frontend dependencies and starting...
cd frontend && npm install --silent && npm run dev -- --open

echo.
echo NOTED is running at http://localhost:3000
echo Press Ctrl+C to stop.
```

---

## 5. DO'S AND DON'TS

### DO:
- ✅ Build milestone by milestone (see PRD Section 11)
- ✅ Test each API endpoint manually (or with pytest) before building the frontend for it
- ✅ Use TipTap's built-in JSON serialization for note content
- ✅ Keep AI prompts in separate constant files (not hardcoded in service functions)
- ✅ Add `try/except` around every Ollama call — if Ollama is down, show a friendly error, don't crash
- ✅ Use React Error Boundaries around the editor and AI sidebar
- ✅ Debounce the autosave (2 second debounce on editor onChange)
- ✅ Use `nanoid` for short IDs (more readable than uuid4 for filenames)
- ✅ Add a health check endpoint: `GET /api/health` → returns Ollama status, model availability

### DON'T:
- ❌ Don't start on the Calendar before Tasks is working
- ❌ Don't implement Vault before core notes work
- ❌ Don't add animations until functional code is working
- ❌ Don't use Redux, MobX, or Context API for global state — Zustand only
- ❌ Don't use Axios — native `fetch` is fine and keeps bundle smaller
- ❌ Don't write Python 2 style code. F-strings only, no `.format()` or `%`
- ❌ Don't call Ollama directly from the frontend — always go through FastAPI
- ❌ Don't store embeddings in the notes JSON — separate files only
- ❌ Don't block the FastAPI event loop — use `asyncio` and `httpx` for all I/O

---

## 6. ENVIRONMENT VARIABLES

```env
# frontend/.env.local
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=NOTED
VITE_VERSION=0.1.0

# backend/.env
HOST=0.0.0.0
PORT=8000
DATA_DIR=../data
OLLAMA_URL=http://localhost:11434
CORS_ORIGINS=http://localhost:3000
VAULT_BCRYPT_ROUNDS=12
```

---

## 7. DEPENDENCIES

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.x",
    "zustand": "^4.x",
    "@tiptap/react": "^2.x",
    "@tiptap/starter-kit": "^2.x",
    "@tiptap/extension-highlight": "^2.x",
    "@tiptap/extension-task-list": "^2.x",
    "@tiptap/extension-task-item": "^2.x",
    "@tiptap/extension-table": "^2.x",
    "@tiptap/extension-code-block-lowlight": "^2.x",
    "@tiptap/extension-mathematics": "^2.x",
    "@tiptap/extension-link": "^2.x",
    "@tiptap/extension-image": "^2.x",
    "@tiptap/extension-character-count": "^2.x",
    "react-pdf": "^7.x",
    "mammoth": "^1.x",
    "xlsx": "^0.18.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "nanoid": "^5.x",
    "date-fns": "^3.x",
    "lucide-react": "^0.x",
    "lowlight": "^3.x"
  }
}
```

### Backend (requirements.txt)
```
fastapi>=0.110.0
uvicorn[standard]>=0.29.0
httpx>=0.27.0
python-multipart>=0.0.9
pydantic>=2.6.0
PyMuPDF>=1.24.0
python-docx>=1.1.0
openpyxl>=3.1.0
python-pptx>=0.6.23
pycryptodome>=3.20.0
bcrypt>=4.1.0
numpy>=1.26.0
python-dotenv>=1.0.0
```

---

## 8. ERROR HANDLING PATTERNS

```python
# backend — standard error response
from fastapi import HTTPException

# Always raise with detail message
raise HTTPException(status_code=404, detail="Note not found")
raise HTTPException(status_code=400, detail="Invalid folder ID")
raise HTTPException(status_code=503, detail="Ollama is not running. Start Ollama and try again.")
```

```jsx
// frontend — standard error display
import { toast } from '@/components/ui/Toast'

try {
  await api.notes.delete(id)
  toast.success("Note deleted")
} catch (err) {
  toast.error(err.message || "Something went wrong")
}
```

Build a simple `Toast` notification component early — it's used everywhere.

---

## 9. TESTING APPROACH

- Backend: `pytest` + `httpx.AsyncClient` for route testing
- Frontend: No formal tests in v1. Manual testing is fine. Add Vitest in v2.
- Always test: note CRUD, file upload/extract, Ollama streaming, vault lock/unlock, semantic search results

---

## 10. GIT PRACTICES

- Branch naming: `feature/note-editor`, `fix/autosave-bug`, `milestone/m1-core-notes`
- Commit messages: `feat: add TipTap editor with autosave`, `fix: correct embedding storage path`
- Never commit: `/data/`, `.env`, `node_modules/`, `__pycache__/`, `*.pyc`
- `.gitignore` must include all of the above from day one
- Tag milestones: `git tag m1-complete`, `git tag m2-complete`

---

## 11. WHEN IN DOUBT

1. Check `PRD.md` for feature requirements
2. Check `ARCHITECTURE.md` for technical decisions
3. Check `DESIGN_SYSTEM.md` for UI decisions
4. If it's not in any of these files, ask before implementing
5. Default to simplicity — the simplest implementation that works is always preferred over the cleverly optimized one in v1
