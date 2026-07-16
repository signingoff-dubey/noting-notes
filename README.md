# INK — Think local. Think deep.

> A locally-hosted, AI-native notes application. No cloud. No subscriptions. Your notes, your AI, your machine.

## Latest Release: v0.5.0

## Features

- **Rich text editor** — TipTap with H1–H6, tables, math, code blocks, checklists, links, images
- **Autosave** — 2-second debounce, version history (10 snapshots per note)
- **Folders + Tags** — organize notes, tag cloud view
- **Pinned + Starred + Archive** — full note lifecycle
- **Tasks** — priorities, due dates, status (To Do / In Progress / Done), labels
- **Calendar** — month view with notes and tasks per day
- **File attachments** — upload PDF, DOCX, XLSX, PPTX, images; extract text for AI context
- **Import / Export** — import Markdown/HTML, export notes as Markdown, HTML, or JSON bundle
- **Semantic search** — embed notes with `nomic-embed-text`, search by meaning
- **AI sidebar** — streaming chat powered by local Ollama (Mistral 7B)
- **AI actions** — Summarize, Rephrase, Explain, Brainstorm, floating text toolbar
- **Vault** — PIN-protected encrypted folder (bcrypt PIN, session token)
- **7 themes** — Nothing Dark, Nothing Light, Midnight, Sakura, Forest, Terminal, Warm Paper
- **Accent colors** — 6 accent colors, persisted per session

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, TipTap |
| Backend | FastAPI, Python 3.11, uvicorn |
| AI | Ollama (Mistral 7B, nomic-embed-text) |
| Storage | Local JSON files in `/data/` |
| Fonts | Geist, Dot Gothic 16, Space Mono |
| File parsing | PyMuPDF, python-docx, openpyxl, python-pptx |
| Security | bcrypt (vault PIN), AES-256 (vault notes, planned) |

## File Structure

```
ink/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/           ← AISidebar
│   │   │   ├── editor/       ← TipTap NoteEditor, toolbars
│   │   │   ├── notes/        ← NoteCard, NoteList, NoteGrid
│   │   │   ├── sidebar/      ← Sidebar, FolderTree
│   │   │   └── ui/           ← Button, Modal, Toast, Spinner, Dropdown
│   │   ├── pages/            ← Notes, Tasks, Calendar, Dashboard, Settings, etc.
│   │   ├── store/            ← Zustand stores (notes, tasks, ai, ui, vault)
│   │   ├── lib/              ← api.js, cn.js, useRipple.js
│   │   └── index.css         ← All themes + design tokens
│   └── package.json
├── backend/
│   ├── main.py               ← FastAPI app, router registration
│   ├── routes/               ← notes, tasks, folders, ai, vault, attachments, importexport
│   ├── services/             ← note, task, folder, ai, embed, file, vault services
│   ├── models/               ← Pydantic request/response schemas
│   ├── storage/store.py      ← JSON read/write layer (async, file locks)
│   └── requirements.txt
├── data/                     ← Created at runtime, gitignored
│   ├── notes.json
│   ├── tasks.json
│   ├── folders.json
│   ├── settings.json
│   ├── attachments/
│   ├── ai_memory/
│   ├── embeddings/
│   └── versions/
├── run.bat                   ← Windows one-click startup
├── PRD.md
├── ARCHITECTURE.md
└── DESIGN_SYSTEM.md
```

## Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- [Ollama](https://ollama.com) installed

### Windows (one click)
```bat
run.bat
```

The script:
1. Checks Python installation
2. Installs backend dependencies (`pip install -r backend/requirements.txt`)
3. Checks Ollama installation
4. Pulls AI models (`mistral:7b-instruct-q4_K_M`, `nomic-embed-text`)
5. Starts backend (`uvicorn` on port 8000)
6. Installs frontend deps and starts dev server (port 3000)

### Manual
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |
| `HOST` | Backend bind host | `0.0.0.0` |
| `PORT` | Backend port | `8000` |
| `OLLAMA_URL` | Ollama API URL | `http://localhost:11434` |
| `CORS_ORIGINS` | Allowed frontend origins | `http://localhost:3000` |
| `VAULT_BCRYPT_ROUNDS` | bcrypt rounds for vault PIN | `12` |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Ollama + server health check |
| GET/POST | `/api/notes` | List / create notes |
| GET/PUT/DELETE | `/api/notes/{id}` | Get / update / delete note |
| GET/POST | `/api/folders` | List / create folders |
| GET/POST | `/api/tasks` | List / create tasks |
| GET/PUT/DELETE | `/api/tasks/{id}` | Get / update / delete task |
| GET/POST | `/api/attachments/{note_id}` | List / upload attachments |
| GET | `/api/attachments/{note_id}/{id}/download` | Download attachment |
| DELETE | `/api/attachments/{note_id}/{id}` | Delete attachment |
| POST | `/api/attachments/{note_id}/{id}/extract` | Extract text from file |
| POST | `/api/ai/chat` | Streaming AI chat (SSE) |
| POST | `/api/ai/summarize` | Summarize note |
| POST | `/api/ai/rephrase` | Rephrase text |
| POST | `/api/ai/embed` | Embed note for semantic search |
| POST | `/api/ai/semantic-search` | Search notes by meaning |
| GET | `/api/ai/models` | List available Ollama models |
| GET/PUT | `/api/settings` | Get / update app settings |
| POST | `/api/vault/setup` | Set vault PIN |
| POST | `/api/vault/unlock` | Unlock vault |
| POST | `/api/vault/lock` | Lock vault |
| POST | `/api/import` | Import note from file |
| GET | `/api/export/{id}` | Export note (markdown/html) |
| GET | `/api/export` | Export all notes (JSON) |

## Changelog

### v0.5.0 — 2026-04-20
- Real file attachments (upload, download, delete, text extraction)
- Semantic search via Ollama nomic-embed-text embeddings
- Import/Export (Markdown, HTML, JSON bundle)
- Complete UI redesign: card-based layout, Geist font, centered content

### v0.4.0 — 2026-04-20
- `run.bat` Windows startup script
- TipTap JSON content search fixed
- AI streaming tokens fixed
- Full navigation routing

### v0.3.0 — 2026-04-19
- Dashboard, Favourites, Tags, Archive views
- Button ripple animations
- Calendar detail panel

### v0.2.0 — 2026-04-19
- INK rebrand, Nothing OS deep black theme
- Dot Gothic 16 font, accent color system
- Sidebar + Settings rewrite

### v0.1.0 — 2026-04-19
- Initial scaffolding (FastAPI backend + React frontend)

## License

Private project.
