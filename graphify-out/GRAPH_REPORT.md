# Graph Report - C:/Users/kabir/OneDrive/Desktop/INK  (2026-04-19)

## Corpus Check
- 67 files · ~67,175 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 323 nodes · 311 edges · 66 communities detected
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.72)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Architecture & Security Docs|Architecture & Security Docs]]
- [[_COMMUNITY_AI Data Models|AI Data Models]]
- [[_COMMUNITY_Storage & AI Memory|Storage & AI Memory]]
- [[_COMMUNITY_Backend Data Flows|Backend Data Flows]]
- [[_COMMUNITY_AI Feature Pipeline|AI Feature Pipeline]]
- [[_COMMUNITY_Settings UI|Settings UI]]
- [[_COMMUNITY_AI API Routes|AI API Routes]]
- [[_COMMUNITY_Design Export Center Panel|Design Export: Center Panel]]
- [[_COMMUNITY_Sidebar Component|Sidebar Component]]
- [[_COMMUNITY_Frontend Architecture Standards|Frontend Architecture Standards]]
- [[_COMMUNITY_Note Service Layer|Note Service Layer]]
- [[_COMMUNITY_Task Service Layer|Task Service Layer]]
- [[_COMMUNITY_Note API Routes|Note API Routes]]
- [[_COMMUNITY_Task API Routes|Task API Routes]]
- [[_COMMUNITY_Note List Component|Note List Component]]
- [[_COMMUNITY_Folder API Routes|Folder API Routes]]
- [[_COMMUNITY_Note Grid Component|Note Grid Component]]
- [[_COMMUNITY_AI Sidebar Component|AI Sidebar Component]]
- [[_COMMUNITY_FastAPI Entry & Health|FastAPI Entry & Health]]
- [[_COMMUNITY_Attachment API Routes|Attachment API Routes]]
- [[_COMMUNITY_Root App Component|Root App Component]]
- [[_COMMUNITY_Editor Toolbar|Editor Toolbar]]
- [[_COMMUNITY_Floating Toolbar|Floating Toolbar]]
- [[_COMMUNITY_Note Card Component|Note Card Component]]
- [[_COMMUNITY_Tasks Page|Tasks Page]]
- [[_COMMUNITY_Note Editor|Note Editor]]
- [[_COMMUNITY_Folder Tree Sidebar|Folder Tree Sidebar]]
- [[_COMMUNITY_Dropdown UI|Dropdown UI]]
- [[_COMMUNITY_Modal UI|Modal UI]]
- [[_COMMUNITY_Toast Notifications|Toast Notifications]]
- [[_COMMUNITY_API Client Library|API Client Library]]
- [[_COMMUNITY_UI Theme & Accent Store|UI Theme & Accent Store]]
- [[_COMMUNITY_Tag Chips|Tag Chips]]
- [[_COMMUNITY_Button UI|Button UI]]
- [[_COMMUNITY_Spinner UI|Spinner UI]]
- [[_COMMUNITY_Tailwind Utility|Tailwind Utility]]
- [[_COMMUNITY_Calendar Page|Calendar Page]]
- [[_COMMUNITY_Notes Page|Notes Page]]
- [[_COMMUNITY_Coding Standards Docs|Coding Standards Docs]]
- [[_COMMUNITY_Pydantic & Standards|Pydantic & Standards]]
- [[_COMMUNITY_Backend Init|Backend Init]]
- [[_COMMUNITY_Models Init|Models Init]]
- [[_COMMUNITY_Routes Init|Routes Init]]
- [[_COMMUNITY_Services Init|Services Init]]
- [[_COMMUNITY_Storage Init|Storage Init]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Tailwind Config|Tailwind Config]]
- [[_COMMUNITY_Vite Config|Vite Config]]
- [[_COMMUNITY_React Entry|React Entry]]
- [[_COMMUNITY_AI Store|AI Store]]
- [[_COMMUNITY_Notes Store|Notes Store]]
- [[_COMMUNITY_Tasks Store|Tasks Store]]
- [[_COMMUNITY_Vault Store|Vault Store]]
- [[_COMMUNITY_Target User|Target User]]
- [[_COMMUNITY_Tech Stack|Tech Stack]]
- [[_COMMUNITY_Spacing System|Spacing System]]
- [[_COMMUNITY_Note Card Design Spec|Note Card Design Spec]]
- [[_COMMUNITY_Modal Design Spec|Modal Design Spec]]
- [[_COMMUNITY_Button Design Spec|Button Design Spec]]
- [[_COMMUNITY_Animation Principles|Animation Principles]]
- [[_COMMUNITY_Responsive Design|Responsive Design]]
- [[_COMMUNITY_Accessibility|Accessibility]]
- [[_COMMUNITY_Editor Typography|Editor Typography]]
- [[_COMMUNITY_Env Vars|Env Vars]]
- [[_COMMUNITY_Uvicorn Dep|Uvicorn Dep]]
- [[_COMMUNITY_Dotenv Dep|Dotenv Dep]]

## God Nodes (most connected - your core abstractions)
1. `NOTED App (PRD)` - 21 edges
2. `_get_lock()` - 15 edges
3. `Storage Layer: storage/store.py` - 7 edges
4. `Ollama Integration` - 6 edges
5. `Design Aesthetic: Nothing OS Dark` - 6 edges
6. `Feature: Rich Text Notes` - 5 edges
7. `Milestone 0: Project Scaffolding` - 5 edges
8. `Feature: File Attachments & Viewer` - 4 edges
9. `Feature: Themes (7 themes)` - 4 edges
10. `Feature: Vault (AES-256 Encrypted Section)` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Autosave (2s debounce)` --references--> `Data Flow: Creating a Note`  [INFERRED]
  PRD.md → ARCHITECTURE.md
- `Business logic for Notes.` --uses--> `NoteCreate`  [INFERRED]
  C:\Users\kabir\OneDrive\Desktop\INK\backend\services\note_service.py → C:\Users\kabir\OneDrive\Desktop\INK\backend\models\note.py
- `Business logic for Notes.` --uses--> `NoteUpdate`  [INFERRED]
  C:\Users\kabir\OneDrive\Desktop\INK\backend\services\note_service.py → C:\Users\kabir\OneDrive\Desktop\INK\backend\models\note.py
- `Business logic for Tasks.` --uses--> `TaskCreate`  [INFERRED]
  C:\Users\kabir\OneDrive\Desktop\INK\backend\services\task_service.py → C:\Users\kabir\OneDrive\Desktop\INK\backend\models\task.py
- `Business logic for Tasks.` --uses--> `TaskUpdate`  [INFERRED]
  C:\Users\kabir\OneDrive\Desktop\INK\backend\services\task_service.py → C:\Users\kabir\OneDrive\Desktop\INK\backend\models\task.py

## Hyperedges (group relationships)
- **AI Pipeline: Ollama + embed_service + SSE Streaming** — arch_ollama_integration, claude_semantic_search_impl, arch_sse_streaming, concept_embedding_pipeline, prd_model_mistral, prd_model_nomic [EXTRACTED 0.95]
- **Vault Security: AES-256 + bcrypt PIN + session token** — prd_feature_vault, prd_encryption_aes256, arch_security, claude_vault_impl [EXTRACTED 0.95]
- **Design System: Nothing OS Aesthetic + Typography + Color** — ds_aesthetic_nothing_os, ds_typography, ds_color_nothing_dark, ds_layout_rules, rationale_nothing_os_aesthetic [EXTRACTED 0.90]

## Communities

### Community 0 - "Architecture & Security Docs"
Cohesion: 0.06
Nodes (40): File Viewer Architecture (frontend/components/viewer/), Future Architecture: Web/Multi-provider, Security Considerations (AES-256, bcrypt, CORS), System Architecture Overview, API Client: lib/api.js, Theme Implementation (CSS custom properties), TipTap Editor Setup & Extensions, Vault Implementation (AES-256 + bcrypt PIN) (+32 more)

### Community 1 - "AI Data Models"
Cohesion: 0.09
Nodes (23): ChatRequest, EmbedRequest, Pydantic models for AI endpoints (stubs)., RephraseRequest, SemanticSearchRequest, SummarizeRequest, BaseModel, FolderCreate (+15 more)

### Community 2 - "Storage & AI Memory"
Cohesion: 0.13
Nodes (18): append_ai_memory(), clear_ai_memory(), delete_folder(), delete_note(), delete_task(), _get_lock(), JSON file storage layer for NOTED. All file I/O goes through this module — no ot, read_ai_memory() (+10 more)

### Community 3 - "Backend Data Flows"
Cohesion: 0.09
Nodes (23): asyncio.Lock for File Concurrency Control, Data Flow: Creating a Note, Data Schema: notes.json, Data Schema: tasks.json, Storage Layer: storage/store.py, Error Handling Patterns (HTTPException + Toast), run.bat Startup Script, Service Layer Pattern (Routes call Services) (+15 more)

### Community 4 - "AI Feature Pipeline"
Cohesion: 0.1
Nodes (21): Cosine Similarity for Semantic Search, Data Flow: AI Chat (Streaming), Data Flow: File Attachment + AI Q&A, Data Flow: Semantic Search, Ollama Integration, Data Schema: ai_memory/[note_id].json, SSE Streaming for AI Responses, AI Streaming Implementation (SSE + FastAPI) (+13 more)

### Community 5 - "Settings UI"
Cohesion: 0.15
Nodes (0): 

### Community 6 - "AI API Routes"
Cohesion: 0.22
Nodes (0): 

### Community 7 - "Design Export: Center Panel"
Cohesion: 0.22
Nodes (0): 

### Community 8 - "Sidebar Component"
Cohesion: 0.25
Nodes (1): Sidebar()

### Community 9 - "Frontend Architecture Standards"
Cohesion: 0.25
Nodes (8): Frontend State Architecture (Zustand), Absolute Rules (15 never-violate rules), State: Zustand Stores (notesStore, aiStore, etc.), Concept: Local-first / Offline-first Architecture, Data Storage: Local JSON Files, Product Vision: Local-first AI Notes, Rationale: JSON files over DB for simplicity/portability, Rationale: Zustand over Redux (no boilerplate)

### Community 10 - "Note Service Layer"
Cohesion: 0.33
Nodes (0): 

### Community 11 - "Task Service Layer"
Cohesion: 0.33
Nodes (0): 

### Community 12 - "Note API Routes"
Cohesion: 0.33
Nodes (0): 

### Community 13 - "Task API Routes"
Cohesion: 0.33
Nodes (0): 

### Community 14 - "Note List Component"
Cohesion: 0.4
Nodes (2): NoteList(), sortNotes()

### Community 15 - "Folder API Routes"
Cohesion: 0.4
Nodes (0): 

### Community 16 - "Note Grid Component"
Cohesion: 0.5
Nodes (2): NoteGrid(), sortNotes()

### Community 17 - "AI Sidebar Component"
Cohesion: 0.4
Nodes (1): AISidebar()

### Community 18 - "FastAPI Entry & Health"
Cohesion: 0.5
Nodes (1): NOTED FastAPI Backend - Main Entry Point

### Community 19 - "Attachment API Routes"
Cohesion: 0.5
Nodes (0): 

### Community 20 - "Root App Component"
Cohesion: 0.5
Nodes (1): App()

### Community 21 - "Editor Toolbar"
Cohesion: 0.5
Nodes (0): 

### Community 22 - "Floating Toolbar"
Cohesion: 0.5
Nodes (0): 

### Community 23 - "Note Card Component"
Cohesion: 0.67
Nodes (2): extractPreview(), NoteCard()

### Community 24 - "Tasks Page"
Cohesion: 0.5
Nodes (0): 

### Community 25 - "Note Editor"
Cohesion: 0.67
Nodes (0): 

### Community 26 - "Folder Tree Sidebar"
Cohesion: 0.67
Nodes (0): 

### Community 27 - "Dropdown UI"
Cohesion: 0.67
Nodes (0): 

### Community 28 - "Modal UI"
Cohesion: 0.67
Nodes (0): 

### Community 29 - "Toast Notifications"
Cohesion: 0.67
Nodes (0): 

### Community 30 - "API Client Library"
Cohesion: 0.67
Nodes (0): 

### Community 31 - "UI Theme & Accent Store"
Cohesion: 0.67
Nodes (0): 

### Community 32 - "Tag Chips"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Button UI"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Spinner UI"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Tailwind Utility"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Calendar Page"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Notes Page"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Coding Standards Docs"
Cohesion: 1.0
Nodes (2): AI Prompt Architecture (Context Priority), Prompt Files (backend/prompts/*.txt)

### Community 39 - "Pydantic & Standards"
Cohesion: 1.0
Nodes (2): Coding Standards (Python + React), Dependency: pydantic >=2.6.0

### Community 40 - "Backend Init"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Models Init"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Routes Init"
Cohesion: 1.0
Nodes (0): 

### Community 43 - "Services Init"
Cohesion: 1.0
Nodes (0): 

### Community 44 - "Storage Init"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "PostCSS Config"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Tailwind Config"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "Vite Config"
Cohesion: 1.0
Nodes (0): 

### Community 48 - "React Entry"
Cohesion: 1.0
Nodes (0): 

### Community 49 - "AI Store"
Cohesion: 1.0
Nodes (0): 

### Community 50 - "Notes Store"
Cohesion: 1.0
Nodes (0): 

### Community 51 - "Tasks Store"
Cohesion: 1.0
Nodes (0): 

### Community 52 - "Vault Store"
Cohesion: 1.0
Nodes (0): 

### Community 53 - "Target User"
Cohesion: 1.0
Nodes (1): Target User: Power Users / Privacy-Conscious

### Community 54 - "Tech Stack"
Cohesion: 1.0
Nodes (1): Tech Stack Overview

### Community 55 - "Spacing System"
Cohesion: 1.0
Nodes (1): Spacing System (Tailwind scale)

### Community 56 - "Note Card Design Spec"
Cohesion: 1.0
Nodes (1): Component: Note Cards (List + Grid)

### Community 57 - "Modal Design Spec"
Cohesion: 1.0
Nodes (1): Component: Modal / Dialog

### Community 58 - "Button Design Spec"
Cohesion: 1.0
Nodes (1): Component: Button (Primary/Secondary/Ghost/Destructive)

### Community 59 - "Animation Principles"
Cohesion: 1.0
Nodes (1): Animation Principles (100-400ms ranges)

### Community 60 - "Responsive Design"
Cohesion: 1.0
Nodes (1): Responsive: Desktop-only (min 1024px)

### Community 61 - "Accessibility"
Cohesion: 1.0
Nodes (1): Accessibility (WCAG AA, keyboard nav)

### Community 62 - "Editor Typography"
Cohesion: 1.0
Nodes (1): Editor Typography CSS (.editor-content)

### Community 63 - "Env Vars"
Cohesion: 1.0
Nodes (1): Environment Variables (VITE_API_URL, OLLAMA_URL, etc.)

### Community 64 - "Uvicorn Dep"
Cohesion: 1.0
Nodes (1): Dependency: uvicorn[standard] >=0.29.0

### Community 65 - "Dotenv Dep"
Cohesion: 1.0
Nodes (1): Dependency: python-dotenv >=1.0.0

## Knowledge Gaps
- **55 isolated node(s):** `NOTED FastAPI Backend - Main Entry Point`, `Pydantic models for AI endpoints (stubs).`, `Pydantic models for Folders.`, `Pydantic models for Notes.`, `Pydantic models for Tasks.` (+50 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Tag Chips`** (2 nodes): `TagChips.jsx`, `TagChips()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Button UI`** (2 nodes): `Button()`, `Button.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Spinner UI`** (2 nodes): `Spinner.jsx`, `Spinner()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tailwind Utility`** (2 nodes): `cn.js`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Calendar Page`** (2 nodes): `Calendar.jsx`, `Calendar()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Notes Page`** (2 nodes): `Notes.jsx`, `Notes()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Coding Standards Docs`** (2 nodes): `AI Prompt Architecture (Context Priority)`, `Prompt Files (backend/prompts/*.txt)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Pydantic & Standards`** (2 nodes): `Coding Standards (Python + React)`, `Dependency: pydantic >=2.6.0`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Init`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Models Init`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Routes Init`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Services Init`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Storage Init`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `PostCSS Config`** (1 nodes): `postcss.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tailwind Config`** (1 nodes): `tailwind.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vite Config`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `React Entry`** (1 nodes): `main.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `AI Store`** (1 nodes): `aiStore.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Notes Store`** (1 nodes): `notesStore.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tasks Store`** (1 nodes): `tasksStore.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vault Store`** (1 nodes): `vaultStore.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Target User`** (1 nodes): `Target User: Power Users / Privacy-Conscious`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tech Stack`** (1 nodes): `Tech Stack Overview`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Spacing System`** (1 nodes): `Spacing System (Tailwind scale)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Note Card Design Spec`** (1 nodes): `Component: Note Cards (List + Grid)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Modal Design Spec`** (1 nodes): `Component: Modal / Dialog`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Button Design Spec`** (1 nodes): `Component: Button (Primary/Secondary/Ghost/Destructive)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Animation Principles`** (1 nodes): `Animation Principles (100-400ms ranges)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Responsive Design`** (1 nodes): `Responsive: Desktop-only (min 1024px)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Accessibility`** (1 nodes): `Accessibility (WCAG AA, keyboard nav)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Editor Typography`** (1 nodes): `Editor Typography CSS (.editor-content)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Env Vars`** (1 nodes): `Environment Variables (VITE_API_URL, OLLAMA_URL, etc.)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Uvicorn Dep`** (1 nodes): `Dependency: uvicorn[standard] >=0.29.0`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Dotenv Dep`** (1 nodes): `Dependency: python-dotenv >=1.0.0`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `NOTED App (PRD)` connect `Architecture & Security Docs` to `Frontend Architecture Standards`, `Backend Data Flows`, `AI Feature Pipeline`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `Development Milestones (M0â€“M8)` connect `Backend Data Flows` to `Architecture & Security Docs`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `NOTED FastAPI Backend - Main Entry Point`, `Pydantic models for AI endpoints (stubs).`, `Pydantic models for Folders.` to the rest of the system?**
  _55 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Architecture & Security Docs` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `AI Data Models` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Storage & AI Memory` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
- **Should `Backend Data Flows` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._