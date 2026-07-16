# Progress Log — INK

## Current Version: v0.5.0
## Status: In Progress — M1 complete, M2 complete (real Ollama + embeddings), M3 partial (attachments real, no viewer yet), Import/Export added

---

## [v0.5.0] — 2026-04-20
### What's New
- **`embed_service.py`** — real Ollama embeddings via `nomic-embed-text`; `embed_note()` stores vector; `semantic_search()` cosine similarity across all notes
- **`file_service.py`** — text extraction for PDF (PyMuPDF), DOCX (python-docx), XLSX (openpyxl), PPTX (python-pptx); async via `asyncio.to_thread`
- **`attachments.py` rewritten** — real file upload/download/delete; manifest.json per note; `extract` endpoint calls file_service
- **`importexport.py` added** — `POST /api/import` (md/html → TipTap JSON → note), `GET /api/export/{id}?format=markdown|html`, `GET /api/export?format=json` (full dump); TipTap ↔ markdown/html converters built in
- **Frontend UI redesign** — card-based layout everywhere; Geist font; centered max-width content; ink-card component system; Notes grid, Tasks cards, Dashboard stat cards all redesigned
- **Sidebar redesigned** — cleaner pill nav, less clutter
- **NoteCard redesigned** — no side-stripe, hover actions, 12px rounded cards with elevation

### Files Changed
- `backend/services/embed_service.py` — created
- `backend/services/file_service.py` — created
- `backend/routes/attachments.py` — rewritten (real impl)
- `backend/routes/importexport.py` — created
- `backend/main.py` — importexport router registered
- `frontend/src/index.css` — Geist font, ink-card system, new design tokens
- `frontend/src/components/notes/NoteCard.jsx` — redesigned
- `frontend/src/components/sidebar/Sidebar.jsx` — redesigned
- `frontend/src/pages/Notes.jsx` — redesigned (card grid)
- `frontend/src/pages/Tasks.jsx` — redesigned (task cards)
- `frontend/src/pages/Dashboard.jsx` — redesigned (stat cards + greeting)

### Known Issues
- File viewer components (PDF, DOCX preview in-app) not yet built
- Vault encryption (AES-256) not yet wired to note content
- Calendar week/day views not yet built

### Future Scope
- M3: In-app file viewer (PDF iframe, DOCX rendered HTML, image gallery)
- M4: Calendar week/day views; Google Calendar sync
- Vault: AES-256 encrypt note content on save
- Electron wrapper (Layer 2)

---

## [v0.4.0] — 2026-04-20
### What's New
- **`run.bat` created** — full 6-stage Windows startup script: Python check → pip install → Ollama check → model pull (skip if Ollama absent) → uvicorn backend (polls `/api/health` before continuing) → npm install + `npm run dev --open`
- **TipTap JSON content search** — added `extractText()` helper in `notesStore.js` that walks the TipTap node tree; `getFilteredNotes()` now searches note body content correctly instead of skipping JSON objects
- **AI streaming stub fixed** — `backend/routes/ai.py` now emits `{"response": " word"}` JSON tokens instead of bare characters; frontend `api.js` correctly reads `parsed.response`, so the AI sidebar shows placeholder text word-by-word
- **Full nav routing wired** — `App.jsx` imports and routes all four new panels (Dashboard, FavouritesView, TagsView, ArchivedView); `Sidebar.jsx` maps each to its panel key
- **Gap audit completed** — full cross-reference of PRD.md, ARCHITECTURE.md, DESIGN_SYSTEM.md, MILESTONES.md against codebase; documented all missing features

### Files Changed
- `run.bat` — created from scratch
- `frontend/src/store/notesStore.js` — added `extractText()`, fixed `getFilteredNotes()` search
- `backend/routes/ai.py` — added `import json`, fixed streaming to emit JSON tokens
- `frontend/src/App.jsx` — imported and routed Dashboard, FavouritesView, TagsView, ArchivedView
- `frontend/src/components/sidebar/Sidebar.jsx` — added Dashboard + Archive nav items, renamed Starred → Favourites

### Known Issues
- All AI routes are stubs (no real Ollama integration yet)
- Settings changes not persisted to backend (localStorage only)
- No file viewer components exist yet

### Future Scope (next up)
- M2: Real Ollama integration (`ai_service.py`, `embed_service.py`, streaming chat)
- M4: Calendar week/day views; create-task-from-calendar; browser notifications
- M3: File viewer components (PDF, DOCX, XLSX, PPTX, image)
- Missing keyboard shortcuts: Ctrl+Shift+N, Ctrl+F, Ctrl+S, Ctrl+1/2

---

## [v0.3.0] — 2026-04-19
### What's New
- **Button ripple system** — `useRipple()` hook in `frontend/src/lib/useRipple.js` injects `<span class="ripple-wave">` on `mousedown`; CSS `@keyframes ripple-expand` animates it; `Button.jsx` and all custom buttons updated; `ripple-root` / `ripple-wave` classes in `index.css`
- **Dashboard view** — `src/pages/Dashboard.jsx`: stat cards (active notes, tasks, starred, total words), recent 6 notes, upcoming 5 tasks with priority colors and due labels (Today/Tomorrow/date), mini calendar grid with today highlight
- **Favourites view** — `src/pages/FavouritesView.jsx`: starred non-archived notes via `getFavouriteNotes()`; opens `NoteEditor` inline; empty state
- **Tags view** — `src/pages/TagsView.jsx`: tag cloud sorted by count; click tag → filtered note list; back arrow returns to tag list; accent-color tag pills
- **Archived view** — `src/pages/ArchivedView.jsx`: two-tab UI (Notes / Tasks); `ArchivedNoteRow` and `ArchivedTaskRow` with Restore (green) + Delete (red) hover actions; restore calls `archiveNote(id, false)` / `updateTask(id, {archived:false})`
- **NoteCard archive + star** — `NoteCard.jsx` dropdown menu now has Archive/Restore and Star/Unstar actions; filled star icon shown when `note.starred`; `useRipple()` applied to both list and grid variants
- **Calendar detail panel** — `Calendar.jsx` refactored: `DayCell` extracted as component with ripple; right panel (280px) shows tasks (priority dot + status) and notes created on selected day; "Nothing on this day" empty state; nav buttons have ripple
- **notesStore additions** — `archiveNote(id, archived)`, `toggleStar(id)`, `getArchivedNotes()`, `getFavouriteNotes()`, `getRecentNotes(limit)`
- **Sidebar nav updated** — Dashboard (LayoutDashboard icon) added to main nav; LIBRARY section: Starred renamed Favourites, Archive added (Archive icon); all onClick handlers call `setActiveNote(null)` on panel switch

### Files Changed
- `frontend/src/lib/useRipple.js` — created
- `frontend/src/index.css` — ripple CSS keyframe + classes added
- `frontend/src/components/ui/Button.jsx` — useRipple integrated
- `frontend/src/store/notesStore.js` — archiveNote, toggleStar, getArchivedNotes, getFavouriteNotes, getRecentNotes
- `frontend/src/pages/Dashboard.jsx` — created
- `frontend/src/pages/FavouritesView.jsx` — created
- `frontend/src/pages/TagsView.jsx` — created
- `frontend/src/pages/ArchivedView.jsx` — created
- `frontend/src/components/notes/NoteCard.jsx` — archive/star actions, ripple
- `frontend/src/pages/Calendar.jsx` — DayCell component, notes on calendar, detail panel

### Known Issues
- Sidebar nav items for Dashboard/Archive/Favourites exist but App.jsx not yet routed (fixed in v0.4.0)

---

## [v0.2.0] — 2026-04-19
### What's New
- **Nothing OS Dark theme overhaul** — deeper blacks: `--color-bg: #080808`, `--color-surface: #101010`, `--color-surface-2: #161616`, `--color-border: #1e1e1e`, `--color-sidebar-bg: #060606`; Nothing Light + Midnight + Terminal + Warm Paper + Sakura themes all defined in `index.css`
- **Dot Gothic 16 font** — added to Google Fonts URL in `index.html`; `--font-display` CSS variable; Tailwind `fontFamily.display` configured; used in INK logo and display contexts
- **App renamed INK** — `index.html` title updated to "INK — Think local. Think deep."
- **Accent color system** — `ACCENT_MAP` in `uiStore.js` (White, Red, Green, Blue, Amber, Purple); `setAccent()` writes `--color-accent` + `--color-accent-dim` CSS vars; `initTheme()` restores saved accent on load; persisted to `localStorage`
- **Sidebar full rewrite** — INK logo in Dot Gothic 16, "NOTES" subtext in Space Mono; v0.1 version badge (8px border-radius); `SectionLabel` component for "LIBRARY" / "FOLDERS" headers; LIBRARY section: Starred, Recent, All Tags nav items; rounded new-note (solid) and new-task (dashed) quick-action buttons; "Upgrade to Pro" accent button at bottom
- **Settings full rewrite** — 5 tabs: Appearance (theme swatches + accent swatch picker with ring indicator), Editor (font size/line height sliders, spellcheck/typewriter/focus mode toggles), AI (model dropdown, temperature slider, streaming/memory toggles), Data (storage paths, export buttons, about), Shortcuts (key→action table with `<kbd>` tags)
- **Tailwind config** — `borderRadius` defaults updated: `DEFAULT: 8px`, sm: 4px, md: 8px, lg: 12px, xl: 16px; `fontFamily.display` added

### Files Changed
- `frontend/index.html` — Dot Gothic 16 font, title updated
- `frontend/src/index.css` — all 6 theme definitions, deeper Nothing Dark tokens, ripple stub
- `frontend/tailwind.config.js` — fontFamily.display, borderRadius scale
- `frontend/src/store/uiStore.js` — ACCENT_MAP, applyAccent, setAccent, initTheme updated
- `frontend/src/components/sidebar/Sidebar.jsx` — full rewrite (INK logo, LIBRARY section, Pro button)
- `frontend/src/pages/Settings.jsx` — full rewrite (5 tabs, theme/accent pickers)

### Known Issues
- Forest theme not yet implemented (6 of 7 PRD themes exist)
- Settings not persisted to backend (no `/api/settings` endpoint)

---

## [v0.1.0] — 2026-04-19
### What's New
**Backend:**
- FastAPI app (`backend/main.py`) with CORS middleware, lifespan handler, health check `GET /api/health`
- Storage layer (`backend/storage/store.py`) — async JSON read/write with `asyncio.Lock` per file, `asyncio.to_thread` for non-blocking I/O; handles notes, folders, tasks, AI memory, embeddings, settings, version snapshots
- Note CRUD service (`backend/services/note_service.py`) — create/read/update/delete with version snapshot on content change
- Task CRUD service (`backend/services/task_service.py`) — full CRUD
- Routes: `notes.py`, `tasks.py`, `folders.py`, `ai.py` (stubs), `vault.py` (stub), `attachments.py` (stub)
- Pydantic models: `note.py` (NoteCreate, NoteUpdate, NoteResponse), `task.py` (TaskCreate, TaskUpdate, TaskResponse), `folder.py` (FolderCreate, FolderUpdate, FolderResponse), `ai.py` (ChatRequest etc.)
- `backend/requirements.txt` — fastapi, uvicorn, httpx, python-multipart, pydantic, python-dotenv

**Frontend:**
- Vite + React 18 app, Tailwind CSS, `@` path alias configured
- `frontend/.env.local` — `VITE_API_URL=http://localhost:8000`
- API client (`src/lib/api.js`) — typed wrappers for notes, folders, tasks, attachments, AI, vault, import/export; SSE streaming handler for AI chat
- `cn()` utility (`src/lib/cn.js`) — clsx + tailwind-merge
- **Stores:** `notesStore.js` (notes, folders, activeNote, search, viewMode, getFilteredNotes), `tasksStore.js` (tasks, filters, getFilteredTasks, getUpcomingTasks), `aiStore.js` (isOpen, model, contextNote, messages, streaming, sendMessage), `uiStore.js` (theme, accent, activePanel, toasts), `vaultStore.js` (isUnlocked, unlock, lock)
- **UI components:** `Button.jsx` (primary/secondary/ghost/destructive variants, loading spinner), `Spinner.jsx`, `Toast.jsx` + `ToastContainer`, `Modal.jsx` + `ConfirmModal`, `Dropdown.jsx` + `Select`
- **Sidebar:** `Sidebar.jsx` (Notes/Tasks/Calendar nav, folder tree, vault lock/unlock modal), `FolderTree.jsx` (nested folders, expand/collapse, create/delete, note count)
- **Notes:** `NoteCard.jsx` (list + grid variants, pin/star/archive/delete dropdown), `NoteList.jsx` (skeleton loading, pinned group, sort), `NoteGrid.jsx` (2-col grid, sort)
- **Editor:** `NoteEditor.jsx` (TipTap editor, 2s autosave, SaveStatus dot, word count footer, dates), `EditorToolbar.jsx` (H1-H3, B/I/U/S, highlight, code, lists, checklist, blockquote, code block, hr, table, link, attach), `FloatingToolbar.jsx` (BubbleMenu: B/I/U/S/highlight/code/link + Explain/Summarize/Ask AI)
- **Notes features:** `TagChips.jsx` (inline tag editing, add/remove tags)
- **AI:** `AISidebar.jsx` (slide-in panel, model selector, note context selector, quick action buttons, streaming chat bubbles, clear memory)
- **Pages:** `Notes.jsx` (search bar, sort dropdown, list/grid toggle, folder breadcrumb), `Tasks.jsx` (filter tabs, inline task creation, TaskRow with status/priority/labels/delete), `Calendar.jsx` (month grid, day cell, today highlight), `Settings.jsx` (initial version)
- **App:** `App.jsx` — keyboard shortcuts (Ctrl+N, Ctrl+Shift+A, Escape), theme init on mount

### Known Issues
- All AI routes are stubs (placeholder responses)
- Vault is UI-only (no real encryption)
- File attachments are stubs (no upload/viewer)
- No import/export functionality
- run.bat did not exist yet

---

## Git History
| Version | Date | Description |
|---------|------|-------------|
| v0.1.0 | 2026-04-19 | Initial scaffolding — backend (FastAPI, storage, services, routes) + full frontend shell (stores, editor, sidebar, all pages, AI sidebar) |
| v0.2.0 | 2026-04-19 | UI design overhaul — INK rebrand, Dot Gothic 16, Nothing Dark deep blacks, all 6 themes, accent color system, Sidebar + Settings rewrite |
| v0.3.0 | 2026-04-19 | New views + interactions — Dashboard, Favourites, Tags, Archive pages; button ripples; NoteCard archive/star; Calendar detail panel; notesStore additions |
| v0.4.0 | 2026-04-20 | App startup + search fixes — run.bat, TipTap JSON content search, AI streaming stub fixed, App/Sidebar routing for all panels |
| v0.5.0 | 2026-04-20 | Backend completion + UI redesign — embed_service, file_service, real attachments, import/export, card-based UI redesign with Geist font |
