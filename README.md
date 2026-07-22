# INK

> An AI-native notes app with a Nothing OS aesthetic. Rich editing. Fast AI. No backend required.

![React](https://img.shields.io/badge/React-18-61dafb?style=flat&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat&logo=tailwindcss)
![Groq](https://img.shields.io/badge/AI-Groq-f55036?style=flat)
![Netlify](https://img.shields.io/badge/Deploy-Netlify-00c7b7?style=flat&logo=netlify)

---

## What is INK?

INK is a minimal, AI-powered notes app inspired by Nothing OS. It combines a rich markdown editor, task management, and a streaming AI assistant — with optional FastAPI backend for extended features.

**Notes** — TipTap editor with H1–H6, tables, code blocks, task lists, math, highlights, links  
**Tasks** — priorities, labels, folders, due dates, drag-to-reorder  
**AI Assistant** — right-side panel powered by Groq (Llama 3.3 70B by default), streams token by token, remembers note context  
**Themes** — 8 built-in themes: Nothing Dark, Nothing Light, Midnight, Terminal, Sakura, Forest, Warm Paper, WIN95  
**Tags & Archive** — tag notes, filter by tag, archive old notes  
**Calendar** — month view with tasks by due date  
**Vault** — PIN-protected encrypted notes  
**File Viewer** — inline PDF, DOCX, XLSX, PPTX preview  

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS + CSS Variables (theme system) |
| Editor | TipTap 2 |
| State | Zustand |
| AI | Groq API (via FastAPI proxy — API key never leaves backend) |
| Backend | FastAPI + Python 3.11 (optional — local JSON storage, Ollama, embeddings) |
| Storage | Browser `localStorage` (Firebase / Supabase coming) |
| Fonts | Geist, Dot Gothic 16, Space Mono |
| Deploy | Netlify |

---

## Getting Started

### Run locally (frontend only)

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:3000`. No backend required for basic usage.

### Run locally (full stack)

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# Edit backend/.env — set GROQ_API_KEY or OLLAMA_URL
npm install --prefix frontend
pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --port 8000 &
npm run dev --prefix frontend
```

Requires Python 3.11+ and optionally Ollama for local AI inference.

### Deploy to Netlify

1. Push repo to GitHub
2. Connect repo in [app.netlify.com](https://app.netlify.com)
3. Netlify reads `netlify.toml` — build config is pre-set
4. Click **Deploy site**

---

## AI Models

Powered by [Groq](https://groq.com) for fast inference. Switch models from the AI sidebar dropdown.

| Model | Speed | Best for |
|-------|-------|----------|
| Llama 3.3 70B | Fast | Default — best quality |
| Llama 3.1 8B | Fastest | Quick questions |
| Llama 4 Scout 17B | Fast | Newest Llama |
| Qwen 3 32B | Fast | General purpose |
| Qwen 3.6 27B | Fast | Latest Qwen |
| Groq Compound | Fast | Groq's flagship |
| Groq Compound Mini | Fastest | Lightweight |

AI calls proxy through the FastAPI backend — your API key stays server-side, never exposed to the browser.

---

## Themes

| Theme | Vibe |
|-------|------|
| Nothing Dark | Default — monochrome, dotted font |
| Nothing Light | Clean light variant |
| Midnight | Dark blue, GitHub-inspired |
| Terminal | Green on black |
| Warm Paper | Warm beige, low eye strain |
| Sakura | Dark pink, neon accents |
| Forest | Deep green |
| WIN95 | Windows 95 nostalgia |

---

## Environment Variables

Create `backend/.env` and `frontend/.env.local` from the `.example` files.

| Variable | Where | Required | Default |
|----------|-------|----------|---------|
| `VITE_API_URL` | `frontend/.env.local` | Yes | `http://localhost:8000` |
| `GROQ_API_KEY` | `backend/.env` | For AI | — |
| `OLLAMA_URL` | `backend/.env` | For local AI | `http://localhost:11434` |
| `CORS_ORIGINS` | `backend/.env` | For backend | `http://localhost:3000` |

> **Security**: Frontend never holds the API key. All AI requests go through the FastAPI backend proxy.

## Project Structure

```
ink/
├── frontend/                ← React 18 + Vite + Tailwind
│   ├── src/
│   │   ├── components/     
│   │   │   ├── ai/          ← AI sidebar, model picker
│   │   │   ├── editor/      ← TipTap editor, floating toolbar, link extension
│   │   │   ├── media/       ← Audio/Video players, voice recorder, media attachments
│   │   │   ├── notes/       ← NoteCard, NoteGrid, NoteList, TagChips
│   │   │   ├── sidebar/     ← Left nav, notes panel, folder tree
│   │   │   ├── ui/          ← Button, Modal, Toast, Spinner, Dropdown, CommandPalette
│   │   │   └── viewer/      ← FileViewer (PDF, DOCX, XLSX, PPTX inline)
│   │   ├── pages/           ← Notes, Tasks, Calendar, Settings, Dashboard,
│   │   │                      Archive, Tags, Favourites, Journal
│   │   ├── store/           ← 6 Zustand stores (notes, tasks, ai, ui, vault, auth)
│   │   ├── lib/             ← api.js, cn.js, firebase.js, useRipple
│   │   └── index.css        ← All 8 themes + design tokens
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                 ← FastAPI + Python 3.11
│   ├── main.py             ← Entry point, CORS, route registration
│   ├── routes/             ← notes, folders, tasks, attachments, ai, vault, settings
│   ├── services/           ← Business logic (note, ai, embed, file, folder, task, vault)
│   ├── models/             ← Pydantic v2 request/response schemas
│   └── storage/            ← JSON read/write layer (store.py)
│
├── AGENTS.md               ← Single source of truth for AI coding agents
├── ARCHITECTURE.md          ← Technical decisions & architecture
├── DESIGN_SYSTEM.md         ← UI design tokens & component specs
├── PRD.md                   ← Product requirements & milestones
├── netlify.toml             ← Netlify build config + SPA redirect
├── run.bat                  ← Windows startup script
├── run.sh                   ← macOS/Linux startup script
└── .gitignore
```

---

## Storage

Data currently lives in `localStorage` — no server, no account, instant setup.

**Upcoming:** Firebase / Supabase integration for cross-device sync. The swap will be isolated to `notesStore.js` and `tasksStore.js` — no UI changes needed.

---

## Roadmap

- [x] Firebase / Supabase sync (Google OAuth, Firebase auth)
- [x] File attachments (PDF, DOCX viewer in-app)
- [x] Vault (PIN-protected encrypted notes)
- [ ] Semantic search across notes
- [ ] Export to Markdown / PDF
- [ ] Mobile-responsive layout
- [ ] Electron desktop wrapper

---

## Changelog

### v2.0.5 — 2026-07-21
- **Multimedia editor**: Inline video player with play/pause, seekbar, scrubber, volume, fullscreen
- **Voice notes**: Record audio directly in the editor via MediaRecorder API, playback with seekbar
- **Audio file support**: Attach audio files — rendered as inline AudioPlayer with seekbar
- **Drag-drop images**: Drop image files anywhere in the editor to insert inline
- **Video/voice attachments**: Dedicated MediaAttachments section below editor toolbar, separate from document attachments
- **Animated waveform**: Voice recorder now shows real-time animated bars during recording
- **Improved empty state**: Helpful getting-started view with keyboard shortcut hints when no note is selected
- **Polish pass**: Focus-visible rings + active states on Button; removed 60+ inline hover style mutations across 13 files; replaced unused imports; Calendar errors now use toast
- **Typography overhaul**: Font hierarchy (Space Mono for display, Geist for body), added `--text-2xs` token, fixed line-height and heading spacing across 18 files
- **Audit batch 2**: ARIA roles (`dialog`, `switch`, `aria-pressed`, `aria-modal`); theming fixes (25 rgba → CSS variables); responsive layout; anti-pattern cleanup across 15 files
- **Fixed crash on load**: Missing apiConfig, jszip, and Firebase guard — app no longer crashes on cold start

### v2.0.0 — 2026-07-16
- **Security**: All AI calls now proxy through FastAPI backend — API key never exposed to the browser
- **Groq API key**: Updated to new key, auto-fallback from `GROQ_API_KEY` env var
- **Model list**: Removed 4 discontinued models, added 5 new active models (Llama 4 Scout, Qwen 3, Groq Compound)
- **Fixed backend**: Uncommented all deps, added asyncio locks around file I/O, asyncified blocking iterators
- **Fixed AI model routing**: Backend now respects the model selected in the frontend sidebar
- **Bug fixes**: 30+ fixes across useEffect deps, error handling, loading states, unused imports, selector performance
- **Fixed editor**: Spellcheck toggle now works without destroying/recreating the editor
- **Fixed pages**: Sort dropdown listener leaks, missing toast errors, Calendar/Journal/Dashboard stability
- **Removed dead code**: Non-functional drag reorder, unused imports, stale CLAUDE.md artifacts

### v0.7.0 — 2026-04-29
- Accessibility pass: focus rings restored on all interactive elements, ARIA labels added to nav/sidebar
- Removed global `*` CSS transition override — per-component transitions only
- Added `prefers-reduced-motion` support
- Active note indicator: replaced banned left-border stripe with inset box-shadow
- Editor blockquote: replaced left-border stripe with tinted background
- Dashboard stats: replaced hero-metric card grid with horizontal strip layout
- `nothing-light` muted text contrast improved to 4.5:1 (WCAG AA)
- AI no-LLM banner uses design tokens instead of hard-coded oklch values
- `aria-current="page"` on sidebar nav items, `aria-expanded` on collapsible sections
- Delete-confirm dialog: added `role="dialog"` and `aria-modal`
- Fixed broken hover state on "Upgrade to Pro" button

### v0.6.0 — 2026-04-26
- Switched to Groq API — no Ollama or backend required
- Notes and tasks migrated to `localStorage`
- Added `netlify.toml` for one-click Netlify deployment
- AI sidebar updated: Groq cloud model picker, removed Ollama install flow

### v0.5.0 — 2026-04-20
- Real file attachments (upload, download, delete, text extraction)
- Semantic search via Ollama embeddings
- Import / Export (Markdown, HTML, JSON bundle)
- Complete UI redesign: card layout, Geist font

### v0.4.0 — 2026-04-20
- `run.bat` Windows startup script
- TipTap JSON content search fixed
- AI streaming tokens fixed

### v0.3.0 — 2026-04-19
- Dashboard, Favourites, Tags, Archive views
- Calendar detail panel
- Button ripple animations

### v0.2.0 — 2026-04-19
- INK rebrand, Nothing OS deep black theme
- Dot Gothic 16 font, accent color system

### v0.1.0 — 2026-04-19
- Initial scaffolding (FastAPI + React)

---

## License

MIT
