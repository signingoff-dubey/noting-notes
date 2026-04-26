# PRD — NOTED (Working Title)
> A local-first, AI-native desktop notes application. Nothing OS-inspired aesthetics. Obsidian-level editing. Notion-level organization. Runs on your machine.

---

## 1. PRODUCT VISION

**One line:** The notes app that thinks with you, not for you.

**Problem:** Every notes app either has no AI, bad AI, or forces you into their cloud. Notion's AI is slow and generic. Obsidian has no AI out of the box. Bear is iOS-only. Nothing exists that combines a beautiful Nothing OS aesthetic, local-first AI, full document viewing, calendar sync, and a rich editor — on desktop.

**Solution:** A locally-hosted web app (React + FastAPI) that runs on localhost via a single `run.bat`. AI is powered by Ollama, runs completely offline. Later wraps into an Electron `.exe`. Later deploys to a paid web platform with API key support.

**Working Title:** NOTED
**Tagline:** Think local. Think deep.

---

## 2. TARGET USER

- Power users, developers, students, researchers
- Privacy-conscious users who don't want their notes in someone else's cloud
- Users frustrated by Notion's complexity and Obsidian's lack of AI
- Windows desktop primary (macOS/Linux later)

---

## 3. DEPLOYMENT LAYERS

### Layer 1 — Localhost (Free, current focus)
- `run.bat` starts everything: installs dependencies, pulls Ollama models, starts FastAPI backend on `localhost:8000`, starts React frontend on `localhost:3000`
- `run.bat` has a **CMD UI with progress stages** — never looks frozen
- Progress stages displayed in CMD:
  - `[1/6] Checking Python...`
  - `[2/6] Installing backend dependencies...`
  - `[3/6] Checking Ollama installation...`
  - `[4/6] Pulling AI models (this may take a while)...`
  - `[5/6] Starting backend server...`
  - `[6/6] Launching app... Opening browser...`
- Data stored in encrypted local JSON files + localStorage
- No account required in prototype. Google login added in v2.

### Layer 2 — Electron `.exe` (Next phase)
- Same React frontend wrapped in Electron
- Same FastAPI backend bundled or run as subprocess
- Installer `.exe` via `electron-builder`
- Desktop notifications, system tray icon

### Layer 3 — Web Deployment (Paid)
- React frontend deployed to web (Vercel/Netlify)
- FastAPI backend deployed (Railway/Render)
- Ollama replaced with OpenAI/Anthropic/Gemini API keys
- Users pay for AI credits or bring their own API key
- Google login mandatory for cloud sync

---

## 4. CORE FEATURES

### 4.1 Notes
- Rich text editor (full Obsidian + MS Word feature parity):
  - Headings H1–H6
  - Bold, italic, underline, strikethrough
  - Highlight (multiple colors)
  - Bullet lists, numbered lists, checklists (todo)
  - Code blocks with syntax highlighting
  - Inline code
  - Blockquotes
  - Horizontal dividers
  - Tables (create, edit, resize columns)
  - Math equations (LaTeX via KaTeX)
  - Embeds (YouTube, Twitter — web version only)
  - Collapsible sections
  - Internal note links (`[[note name]]` style)
  - Word count, reading time (shown in footer)
- **Autosave**: Every 2 seconds of inactivity. No manual save needed. Show "Saved" / "Saving..." status.
- **Note Metadata**: Created date, last edited date, folder, tags, word count
- **Version history**: Last 10 autosave snapshots stored locally, user can restore

### 4.2 Note Organization
- **Folders**: Left sidebar shows folder tree. One note belongs to one folder. Root notes allowed (no folder).
- **Tags**: Each note can have multiple tags. Tags shown as chips on note cards. Tag filtering available.
- **Pinned Notes**: Notes can be pinned, shown at top of list regardless of folder.
- **Favorites**: Star any note, accessible via Favorites section.
- **Vault**: A separate encrypted section. Notes in Vault are AES-256 encrypted at rest. Requires a separate PIN or password to access. Vault is a special folder that appears in sidebar.

### 4.3 Notes List / Grid View
- Toggle between **List View** and **Grid View** (top right of center panel)
- List View: Title + 2 lines of preview + date + tags
- Grid View: Card layout, title + 3 lines of preview + tags
- Sorting: By last edited, created date, alphabetical, manual drag (later)
- Filter by: Tag, folder, date range, has attachment, in vault
- Click folder in left sidebar → center panel shows notes in that folder
- Click note → center panel replaces list with note editor (list goes away, back button returns to list)

### 4.4 Tasks
- Dedicated **Tasks** section (separate from Notes)
- Each task has:
  - Title
  - Description (rich text, small)
  - Due date + time
  - Priority: None / Low / Medium / High / Urgent (color coded)
  - Status: To Do / In Progress / Done / Archived
  - Labels/tags
  - Attachments (same as notes)
  - Subtasks (v2, not in prototype)
- **List View**: Task rows with checkbox, title, due date, priority badge
- **Grid/Kanban**: Cards in columns by status (v2)
- **Reminders**: Desktop notifications at due time (via Electron notifications in Layer 2, browser notifications in Layer 1)
- Tasks can be linked to a Calendar event (creates Google Calendar event if signed in)

### 4.5 Calendar
- Full calendar page: month view, week view, day view (toggle)
- For **signed-out users**: Only shows notes/tasks that have due dates. No Google sync.
- For **signed-in users** (v2): Full Google Calendar sync. Tasks added via app appear in Google Calendar. Events from Google Calendar appear in app.
- Clicking a date: Shows notes + tasks due that day
- Creating event from Calendar: Creates a task automatically in Tasks section

### 4.6 File Attachments & Viewer
- Any note or task can have file attachments (button in editor toolbar: `+` icon → attach file)
- Supported formats for viewing: PDF, DOCX, XLSX, PPTX, images (PNG, JPG, GIF, WEBP), plain text, markdown
- Unsupported formats: Download only
- **Viewer layout**: When attachment is clicked, right panel opens with the file viewer. Left side shows the note, right side shows the file. There is a maximize button (top right of viewer panel) to go fullscreen.
- **Annotation**: Users can highlight text in PDF/DOCX viewer. Annotations saved per attachment.
- **Image attachments**: Shown inline in the note (can be resized, captioned)
- Attachment storage: Files saved to `/data/attachments/[note_id]/` directory

### 4.7 Import / Export
**Import:**
- Markdown files (.md)
- Text files (.txt)
- DOCX files (converted to rich text)
- Notion export (zip of markdown files)
- Obsidian vault (folder of .md files)
- HTML files

**Export:**
- Single note: PDF, Markdown, DOCX, HTML, Plain text
- All notes: ZIP of markdown files, or ZIP of PDFs
- Folder export: Same options
- Export with attachments: Option to bundle attachments

### 4.8 Search
- **Top search bar** (always visible): Plain text search across all notes. Searches title and content. Results shown as note cards with highlighted matches.
- **AI Semantic Search** (in AI sidebar only, when no note is open): User can type "find notes where I talked about project deadlines" and AI returns ranked list of relevant notes with explanations.

### 4.9 Themes
- Theme switcher in Settings
- **Default themes:**
  - Nothing Dark (monochrome, dot-matrix inspired — default)
  - Nothing Light (same but inverted)
  - Midnight (deep navy + soft white)
  - Sakura (warm pinks, Japanese editorial feel)
  - Forest (deep greens, earthy)
  - Terminal (pure green on black, monospace everything)
  - Warm Paper (cream background, ink tones, analog feel)
- All themes defined as CSS variables. Easy to add more.
- Custom theme creator (v2)

### 4.10 Settings
- AI model selection (override sidebar model selector globally)
- Default folder for new notes
- Default editor font size
- Theme
- Autosave interval
- Keyboard shortcuts reference
- Data: Export all data, import backup, clear all data
- About / version info

---

## 5. AI FEATURES

### 5.1 Models
- **Chat + Reasoning model**: `mistral:7b-instruct-q4_K_M` — for summarization, rephrasing, Q&A, explanation. Good at instruction following, fast at Q4 quantization.
- **Embedding model**: `nomic-embed-text` — for semantic search across notes. Lightweight, fast, great quality embeddings.
- Both pulled automatically by `run.bat`

### 5.2 AI Sidebar (Right Panel)
- Collapsible. Hidden by default. Opens via button in top right or keyboard shortcut.
- When open: slides in from right, does not push center content (overlay with backdrop blur)
- **Top of sidebar**: Dropdown 1 — model selector (lists all `ollama list` models, marks uninstalled models with a download icon. Clicking uninstalled shows popup with install command `ollama pull [model]`)
- **Dropdown 2**: Note context selector — lists all notes by title. Defaults to currently open note. User can switch to any other note to ask questions about it.
- **Chat window**: Scrollable conversation history
- **Per-note memory**: Each note's AI conversation is stored separately in `/data/ai_memory/[note_id].json`. When a note's chat is loaded, full conversation history is sent as context to Ollama. Max context: last 20 messages (configurable).
- **Bottom input bar**: Text input + send button + attach file button (to give AI extra context from a file, separate from note attachments)
- **Chat bubble at bottom**: Shows model name + note context name currently active

### 5.3 AI Actions (Sidebar)
- Summarize current note
- Rephrase selected text (with options: formal, casual, concise, detailed)
- Explain concept (selected text or manual input)
- Generate from prompt (write a section about...)
- Brainstorm ideas related to note
- Find action items in note
- Ask about attached document (any file type — text extracted by backend)
- Semantic search (when no note open)
- Translate note or selection (target language selectable)
- Fix grammar/spelling
- Convert note to outline
- Generate tags/keywords for note

### 5.4 Floating Toolbar (Text Selection AI)
- When user selects text anywhere (note editor, PDF viewer, DOCX viewer):
  - Floating toolbar appears above selection
  - Contains: **B** | *I* | U | ~S~ | Highlight | `Code` | Link | ── | **Explain with AI** | **Summarize** | **Rephrase** | **Ask AI**
  - "Explain with AI" → sends ONLY the selected text as context to AI sidebar (opens sidebar if closed)
  - "Summarize" → immediate inline result shown in a tooltip/popover above selection, with option to "Insert below" or "Replace"
  - "Rephrase" → shows 3 rephrase variants in a dropdown, click to replace
  - "Ask AI" → opens AI sidebar with selected text pre-filled as context, input focused for user to type question
  - Formatting actions apply to note editor only (not PDF/DOCX which are read-only)

### 5.5 Document Q&A
- When any attachment is open in viewer and AI sidebar is open:
  - Backend extracts full text from document (PDF via PyMuPDF, DOCX via python-docx, XLSX via openpyxl, PPTX via python-pptx)
  - Extracted text chunked and stored temporarily for the session
  - User can ask questions; AI answers based on document content only
  - Source highlighting: AI response includes page/section reference where possible

---

## 6. LAYOUT — DETAILED

```
┌──────────────────────────────────────────────────────────────────────┐
│  LEFT SIDEBAR (240px, fixed)  │  CENTER (flex)  │  RIGHT AI (340px)  │
│                               │                 │  (collapsible)     │
│  [Logo / App Name]            │  [Search bar]   │                    │
│                               │  [View toggle]  │  [Model dropdown]  │
│  + New Note                   │                 │  [Note dropdown]   │
│  + New Task                   │  [Content Area] │                    │
│                               │  - Note List    │  [Chat history]    │
│  ─────────────────            │  - Note Editor  │                    │
│  📁 Notes                     │  - Tasks List   │                    │
│    > Folder 1                 │  - Calendar     │                    │
│    > Folder 2                 │  - Settings     │  [Input bar]       │
│    > Vault 🔒                 │                 │  [Model + context] │
│                               │                 │                    │
│  ☑ Tasks                      │                 │                    │
│  📅 Calendar                  │                 │                    │
│  ─────────────────            │                 │                    │
│  [at bottom:]                 │                 │                    │
│  ⭐ Subscribe to Pro          │                 │                    │
│  ⚙ Settings                   │                 │                    │
│  👤 Profile / Login           │                 │                    │
└──────────────────────────────────────────────────────────────────────┘
```

### Navigation Rules
- Clicking **Notes** in sidebar → center shows notes grid/list (all notes, root level)
- Clicking a **folder** → center shows notes inside that folder
- Clicking a **note** → center replaces note list with note editor. Back button (← top left of center) returns to list.
- Clicking **Tasks** → center shows tasks list
- Clicking **Calendar** → center shows calendar
- Clicking **Settings** → center shows settings page
- AI sidebar is always on the right, hidden until toggled
- Left sidebar is always visible, never collapses (v1). Collapsible in v2.

### Center Panel — Note Editor
```
┌────────────────────────────────────────────────┐
│ ← Back   [Note Title (editable, large)]        │
│ ─────────────────────────────────────────────  │
│ [Folder chip] [Tag chips] [+ Add tag]          │
│ ─────────────────────────────────────────────  │
│ [Formatting Toolbar: H1 H2 B I U S | List |   │
│  Checklist | Code | Quote | Table | Math |     │
│  Link | Image | Attach File (+)]              │
│ ─────────────────────────────────────────────  │
│                                                │
│  [Rich text editor area — full height]        │
│                                                │
│                                                │
│ ─────────────────────────────────────────────  │
│ [Saved ✓]  [Word count: 342]  [2 min read]    │
│ [Created: Apr 19 2026]  [Modified: now]       │
└────────────────────────────────────────────────┘
```

When attachment panel is open:
```
┌────────────────────────────┬────────────────────────────┐
│  Note Editor (50%)         │  File Viewer (50%)         │
│                            │  [↗ Maximize] [✕ Close]    │
│                            │  [Annotation toolbar]      │
│                            │                            │
│                            │  [File content]            │
└────────────────────────────┴────────────────────────────┘
```

---

## 7. DATA STORAGE

### File Structure (Local)
```
/data/
  notes.json          ← All notes metadata + content (AES encrypted for vault notes)
  tasks.json          ← All tasks
  folders.json        ← Folder structure
  tags.json           ← Tag registry
  settings.json       ← User settings + theme preference
  attachments/
    [note_id]/
      [filename]
  ai_memory/
    [note_id].json    ← Per-note AI conversation history
  embeddings/
    [note_id].json    ← nomic-embed-text embeddings for semantic search
  versions/
    [note_id]/
      [timestamp].json ← Version snapshots
```

### Encryption
- Vault notes: AES-256-CBC, key derived from user PIN via PBKDF2
- PIN stored as salted bcrypt hash, never plain
- Non-vault data: Not encrypted (plain JSON), but stored locally only

---

## 8. KEYBOARD SHORTCUTS

| Action | Shortcut |
|---|---|
| New Note | Ctrl+N |
| New Task | Ctrl+Shift+N |
| Search | Ctrl+F |
| Toggle AI Sidebar | Ctrl+Shift+A |
| Save | Ctrl+S (manual trigger, autosave handles rest) |
| Bold | Ctrl+B |
| Italic | Ctrl+I |
| Underline | Ctrl+U |
| Code block | Ctrl+Shift+C |
| Heading 1 | Ctrl+1 |
| Heading 2 | Ctrl+2 |
| Back to list | Escape |

---

## 9. API ENDPOINTS (FastAPI Backend)

```
# Notes
GET    /api/notes                    → List all notes (metadata only)
GET    /api/notes/:id                → Get full note
POST   /api/notes                    → Create note
PUT    /api/notes/:id                → Update note
DELETE /api/notes/:id                → Delete note

# Folders
GET    /api/folders                  → All folders
POST   /api/folders                  → Create folder
PUT    /api/folders/:id              → Rename folder
DELETE /api/folders/:id              → Delete folder (moves notes to root)

# Tasks
GET    /api/tasks                    → All tasks
POST   /api/tasks                    → Create task
PUT    /api/tasks/:id                → Update task
DELETE /api/tasks/:id                → Delete task

# Attachments
POST   /api/attachments/:note_id     → Upload file
GET    /api/attachments/:note_id     → List attachments for note
DELETE /api/attachments/:id          → Remove attachment
GET    /api/attachments/extract/:id  → Extract text from file (for AI)

# AI
POST   /api/ai/chat                  → Send message (streams response via SSE)
POST   /api/ai/summarize             → Summarize text/note
POST   /api/ai/rephrase              → Rephrase selection
POST   /api/ai/embed                 → Generate embedding for note
POST   /api/ai/semantic-search       → Search notes by meaning
GET    /api/ai/models                → List Ollama models (installed + available)
GET    /api/ai/memory/:note_id       → Get conversation history for note
DELETE /api/ai/memory/:note_id       → Clear conversation history for note

# Import/Export
POST   /api/import                   → Import files/vault
GET    /api/export/note/:id          → Export single note
GET    /api/export/all               → Export all notes as ZIP

# Vault
POST   /api/vault/unlock             → Verify PIN, returns temp session token
POST   /api/vault/lock               → Lock vault
```

---

## 10. TECH STACK

| Layer | Technology | Reason |
|---|---|---|
| Frontend | React 18 + Vite | Fast dev, component model |
| Styling | Tailwind CSS + CSS Variables | Theme system, utility classes |
| Rich Text Editor | TipTap | Best React rich text, extensible, supports everything needed |
| File Viewer (PDF) | react-pdf + PDF.js | Industry standard |
| File Viewer (DOCX/PPTX/XLSX) | mammoth.js (DOCX), SheetJS (XLSX), custom PPTX renderer | |
| State Management | Zustand | Simple, no boilerplate |
| Routing | React Router v6 | |
| Backend | FastAPI (Python 3.11) | Async, fast, matches Kabir's existing stack |
| AI Orchestration | httpx → Ollama REST API | Direct calls, no LangChain overhead |
| Embeddings | nomic-embed-text via Ollama | Semantic search |
| Chat Model | mistral:7b-instruct-q4_K_M | Quality + speed balance for 8GB VRAM |
| File Processing | PyMuPDF, python-docx, openpyxl, python-pptx | Text extraction for AI |
| Storage | JSON files (local) | Simple, portable |
| Encryption | PyCryptodome (AES-256) | Vault encryption |
| Streaming | Server-Sent Events (SSE) | AI response streaming |
| Notifications | Browser Notifications API (Layer 1), Electron (Layer 2) | |

---

## 11. MILESTONES

### Milestone 0 — Setup & Scaffolding
- Repo structure, run.bat, backend skeleton, frontend skeleton
- Ollama check + model pull in run.bat with progress display

### Milestone 1 — Core Notes (MVP)
- Create, edit, delete notes
- Folder creation and assignment
- Tags
- Autosave
- Nothing Dark theme
- List/Grid view

### Milestone 2 — AI Core
- Ollama integration
- AI sidebar (collapsible)
- Chat with per-note memory
- Summarize, rephrase, explain
- Floating toolbar with AI actions

### Milestone 3 — Attachments & Viewers
- File upload and storage
- PDF viewer (right panel)
- DOCX, XLSX, PPTX viewers
- Document Q&A via AI

### Milestone 4 — Tasks & Calendar
- Full tasks page
- Calendar page (local events only)
- Reminders + notifications

### Milestone 5 — Import/Export, Search, Vault
- All import/export formats
- Semantic search
- Vault with PIN encryption

### Milestone 6 — Polish & Themes
- All themes
- Keyboard shortcuts
- Version history
- Settings page complete

### Milestone 7 — Electron Wrapper
- Electron packaging
- .exe installer

### Milestone 8 — Web Deployment
- API key mode
- Google login
- Google Calendar sync
- Payment/Pro tier
