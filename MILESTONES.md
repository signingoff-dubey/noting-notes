# MILESTONES.md — Build Order for Claude Code

This is the execution sequence. Do not skip milestones. Do not work on M2 until M1 is complete and tested.

---

## MILESTONE 0 — Project Scaffolding

**Goal**: Everything boots. Nothing crashes.

Tasks:
- [ ] Initialize frontend with Vite + React + Tailwind
- [ ] Initialize backend with FastAPI
- [ ] Create `/data/` directory structure
- [ ] Create `run.bat` with progress display (all 6 stages)
- [ ] Create `run.sh` for macOS/Linux
- [ ] Setup `.gitignore` (data/, .env, node_modules, __pycache__)
- [ ] Create `.env.example` files for frontend and backend
- [ ] FastAPI: CORS middleware, health check endpoint `GET /api/health`
- [ ] FastAPI: Check Ollama availability on startup, log warning if down
- [ ] React: Basic app shell (left sidebar layout, center panel, right panel placeholder)
- [ ] React: Nothing Dark theme applied via CSS variables
- [ ] React: Space Mono + Geist fonts loaded
- [ ] Implement `storage/store.py` with all async functions
- [ ] Implement `cn()` utility in frontend
- [ ] Implement Toast notification component
- [ ] Implement basic Spinner component

**Done when**: `run.bat` starts both servers, browser opens, sidebar renders with correct Nothing Dark theme, `/api/health` returns JSON.

---

## MILESTONE 1 — Core Notes (No AI)

**Goal**: Create, view, edit, delete notes. Folders. Tags. Autosave.

Tasks:
- [ ] Backend: All note CRUD endpoints
- [ ] Backend: Folder CRUD endpoints
- [ ] Backend: Tag management
- [ ] Frontend: Left sidebar — folder tree, nav items
- [ ] Frontend: Note list (list view) with cards
- [ ] Frontend: Note grid view
- [ ] Frontend: View toggle (list ↔ grid)
- [ ] Frontend: Click folder → show notes in that folder
- [ ] Frontend: Click note → replace list with editor
- [ ] Frontend: Back button → return to list
- [ ] Frontend: TipTap editor with full toolbar (all formatting options per PRD)
- [ ] Frontend: Autosave (2s debounce, "Saved ✓" status)
- [ ] Frontend: Note title editing (large, inline editable)
- [ ] Frontend: Tag chips on note, + Add tag
- [ ] Frontend: Folder assignment
- [ ] Frontend: Note metadata footer (word count, dates)
- [ ] Frontend: + New Note button creates note, opens editor
- [ ] Frontend: Delete note (with confirmation modal)
- [ ] Frontend: Pin note, star note
- [ ] Frontend: Pinned notes shown at top of list
- [ ] Frontend: Plain text search (Ctrl+F, top search bar)
- [ ] Frontend: Version snapshots saved on each autosave

**Done when**: Full note lifecycle works without AI. Folders work. Tags work. Autosave works. Search works.

---

## MILESTONE 2 — AI Core

**Goal**: AI sidebar works. Chat with notes. Summarize, rephrase, explain.

Tasks:
- [ ] Backend: `GET /api/ai/models` — lists installed Ollama models
- [ ] Backend: `POST /api/ai/chat` — streaming SSE endpoint
- [ ] Backend: `POST /api/ai/summarize`
- [ ] Backend: `POST /api/ai/rephrase`
- [ ] Backend: AI memory read/write per note
- [ ] Backend: System prompts loaded from `/backend/prompts/` files
- [ ] Frontend: AI sidebar component (collapsible, slides from right)
- [ ] Frontend: Model selector dropdown (installed vs uninstalled, install popup)
- [ ] Frontend: Note context selector dropdown
- [ ] Frontend: Chat UI with streaming token display
- [ ] Frontend: Per-note conversation history loaded when note opens
- [ ] Frontend: Floating toolbar on text selection (BubbleMenu)
- [ ] Frontend: Floating toolbar — formatting buttons + AI buttons
- [ ] Frontend: "Explain with AI" → sends selection to sidebar
- [ ] Frontend: "Summarize" → inline popover with result + insert/replace
- [ ] Frontend: "Rephrase" → 3 variants dropdown
- [ ] Frontend: AI sidebar toggle (Ctrl+Shift+A)
- [ ] Frontend: Semantic search in AI sidebar (when no note open)
- [ ] Backend: `POST /api/ai/embed` — generate embedding for note
- [ ] Backend: `POST /api/ai/semantic-search`
- [ ] Backend: `embed_service.py` with cosine similarity

**Done when**: Full AI chat works with streaming. Selection toolbar works. Per-note memory persists across app restarts. Semantic search returns relevant notes.

---

## MILESTONE 3 — File Attachments & Viewers

**Goal**: Attach files to notes. View PDFs, DOCX, XLSX, PPTX. Ask AI about them.

Tasks:
- [ ] Backend: `POST /api/attachments/:note_id` — file upload
- [ ] Backend: `GET /api/attachments/:note_id` — list attachments
- [ ] Backend: `DELETE /api/attachments/:id`
- [ ] Backend: `GET /api/attachments/extract/:id` — text extraction
- [ ] Backend: `file_service.py` — PDF, DOCX, XLSX, PPTX extraction
- [ ] Frontend: Attach file button in editor toolbar
- [ ] Frontend: Attachment chips shown below note title
- [ ] Frontend: Click attachment → open viewer panel (50% split)
- [ ] Frontend: PDFViewer component
- [ ] Frontend: DocxViewer component (mammoth.js)
- [ ] Frontend: XlsxViewer component (SheetJS, sheet tabs)
- [ ] Frontend: PptxViewer component (slide list)
- [ ] Frontend: ImageViewer with zoom
- [ ] Frontend: ViewerToolbar (maximize, close, page nav)
- [ ] Frontend: Maximize button → full width viewer
- [ ] Frontend: Text selection in viewer → FloatingToolbar
- [ ] Frontend: AI Q&A with attachment context (attachment_id in chat request)
- [ ] Frontend: Annotation highlight in PDF viewer
- [ ] Frontend: Annotation storage per attachment

**Done when**: All file types open in split-panel viewer. Text selection works in viewer. AI can answer questions about uploaded files.

---

## MILESTONE 4 — Tasks & Calendar

**Goal**: Full tasks page. Calendar page. Reminders via browser notifications.

Tasks:
- [ ] Backend: All task CRUD endpoints
- [ ] Frontend: Tasks page — list view
- [ ] Frontend: Task creation (modal or inline)
- [ ] Frontend: Task fields: title, description, due date/time, priority, status, labels
- [ ] Frontend: Task card with priority color indicator
- [ ] Frontend: Status update (click status → dropdown)
- [ ] Frontend: Mark complete (checkbox)
- [ ] Frontend: Filter tasks by status, priority, label, due date
- [ ] Frontend: Calendar page — month view
- [ ] Frontend: Calendar page — week view
- [ ] Frontend: Calendar page — day view
- [ ] Frontend: View toggle for calendar (month/week/day)
- [ ] Frontend: Tasks with due dates shown on calendar
- [ ] Frontend: Click date on calendar → show tasks for that day
- [ ] Frontend: Create task from calendar (click empty date)
- [ ] Frontend: Browser Notification API for reminders
- [ ] Frontend: Request notification permission on first run
- [ ] Frontend: Schedule notification at task due time

**Done when**: Tasks full lifecycle works. Calendar shows tasks. Notifications fire at due time.

---

## MILESTONE 5 — Import, Export, Vault, Polish

**Goal**: Import from Notion/Obsidian. Export all formats. Vault works.

Tasks:
- [ ] Backend: Import endpoints (markdown, DOCX, Notion zip, Obsidian vault)
- [ ] Backend: Export endpoints (PDF, Markdown, DOCX, HTML, ZIP)
- [ ] Backend: Vault encrypt/decrypt (AES-256-CBC via PyCryptodome)
- [ ] Backend: Vault lock/unlock endpoints (PIN + bcrypt)
- [ ] Frontend: Import modal (drag and drop or file picker, format auto-detect)
- [ ] Frontend: Export menu (single note or all notes, format select)
- [ ] Frontend: Vault section in sidebar (locked by default)
- [ ] Frontend: Vault unlock modal (PIN input)
- [ ] Frontend: Creating note in Vault → note encrypted
- [ ] Frontend: Vault auto-locks after 10 mins inactivity (configurable)
- [ ] Frontend: Settings page — all settings working
- [ ] Frontend: Keyboard shortcuts — all from PRD implemented
- [ ] Frontend: All themes working (7 themes)
- [ ] Frontend: Version history UI (restore previous version)
- [ ] Frontend: Loading skeletons for note list, editor
- [ ] Frontend: Empty states (no notes, no tasks, no results)

**Done when**: Import/export all work. Vault locks and unlocks. All themes apply instantly. All keyboard shortcuts work.

---

## MILESTONE 6 — Electron Packaging

**Goal**: App ships as a `.exe` installer for Windows.

Tasks:
- [ ] Add Electron wrapper (`/electron/main.js`, `preload.js`)
- [ ] FastAPI backend launched as subprocess by Electron
- [ ] Wait for backend health before loading React app
- [ ] System tray icon with Open / Quit
- [ ] Desktop notifications via Electron instead of browser API
- [ ] `electron-builder` config for Windows `.exe` installer
- [ ] Auto-updater (electron-updater) — optional
- [ ] Build script: `npm run build:electron`
- [ ] Test installer on clean Windows machine

**Done when**: Double-click installer installs app. App opens to Nothing Dark theme. All M1–M5 features work inside Electron.

---

## NOT IN SCOPE (v1)

- Google login
- Google Calendar sync
- Web deployment
- Payment / Pro tier
- Mobile support
- Subtasks
- Drag-to-reorder notes
- Kanban board for tasks
- Custom theme creator
- Collaborative notes
- Plugin system
