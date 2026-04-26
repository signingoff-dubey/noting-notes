# FEATURES.md — Competitive Intelligence
> What made the top 7 note-taking apps worth using — and what NOTED must do better.

This file is research, not implementation spec. Every feature listed here has been evaluated for:
- Whether no one else has done it well (steal it)
- Whether everyone has it but does it badly (do it better)
- Whether it only works in their ecosystem (adapt it)

Read this before every milestone. It is a checklist of "have we beaten them yet?"

---

## THE 7 APPS — WHAT THEY ACTUALLY DO WELL

---

### 1. MICROSOFT ONENOTE
**Why it's in the top 7:** Infinite canvas, best-in-class inking, deep Microsoft 365 ecosystem.
**What no one else does as well:**

- **Infinite freeform canvas** — You don't write in a linear document. You drop text boxes, images, drawings anywhere on a 2D canvas. No other app in this list does this. *(Not in NOTED scope for v1 — but worth a Canvas mode in v2)*
- **Section + Page + Notebook hierarchy** — Three levels of depth. Notebooks contain sections, sections contain pages. Most apps only do folders + notes. OneNote adds one more layer.
- **PDF annotation as background layer** — Import a PDF, it becomes the page background. You annotate directly on top. The annotation and the PDF are separate layers. OneNote's approach here is still unmatched.
- **Ink Replay** — Watch your handwriting animate in real-time, stroke by stroke. Incredible for studying math derivations.
- **Math Assistant** — Write an equation by hand, tap Solve, get every algebraic step plus a graph. No notes app does this.
- **Meeting transcript auto-sync** — Pull meeting recordings, transcripts, agendas directly into a note from Teams/Outlook.
- **Sticky Notes widget** — Floating sticky notes on desktop with reminders, color-coded. Separate from main notes.
- **Text search inside images and handwriting** — OCR built in. Search "revenue" and it finds it inside a photo of a whiteboard.

**What OneNote does BADLY (NOTED must exploit):**
- No AI summarization or semantic search
- Complex UI, steep learning curve for basic use
- No local-first option — everything goes to OneDrive
- Section/notebook metaphor is confusing for new users
- No markdown support
- Terrible on non-Microsoft devices

**Features to steal for NOTED:**
- [ ] **OCR search in images** — When a user uploads an image, run OCR (via pytesseract). Make the extracted text searchable.
- [ ] **Note tabs** — Instead of going back to the list, allow multiple notes to be open as tabs in the center panel (v2)
- [ ] **Floating quick-note widget** — A small always-on-top window for capturing thoughts without opening the full app (v2, Electron only)

---

### 2. APPLE NOTES
**Why it's in the top 7:** Zero friction, best sync on Apple, end-to-end encrypted by default.
**What no one else does as well:**

- **Zero setup, zero account friction** — Opens instantly, no login required, syncs silently. The "just works" bar is extremely high.
- **Quick Note** — Swipe from bottom-right corner of iPad/Mac and a note appears. One gesture. Done. No app switching.
- **Smart Folders** — Automatically organize notes based on rules (notes with checklists, notes with attachments, notes created this week). Dynamic folders that update themselves.
- **Collaboration with shared iCloud links** — Send a link, anyone with Apple ID can co-edit in real-time.
- **Hashtag-based auto-tagging** — Type `#projectname` anywhere in a note body and it becomes a tag automatically. No separate tag UI needed.
- **End-to-end encryption by default** — Every note is encrypted on device before it leaves. Not even Apple can read them.
- **Pinch-to-zoom on text** — On iPad, the note reflows dynamically as you zoom.
- **Scan documents with camera** — Point camera at paper, auto-crop and add to note as clean PDF.

**What Apple Notes does BADLY (NOTED must exploit):**
- Apple ecosystem only — zero Windows/Android support
- No markdown
- No AI features
- No rich formatting beyond basic (no code blocks, no tables until recently)
- No version history
- Extremely limited export options

**Features to steal for NOTED:**
- [ ] **Smart Folders** — Automatically generate folders based on rules: "All notes tagged #work", "Notes modified this week", "Notes with attachments", "Untagged notes". These live alongside regular folders in the sidebar and update dynamically. Rule builder in Settings.
- [ ] **Auto-tag from body text** — If user types `#tagname` anywhere in the note content, automatically add that tag to the note metadata. No separate tag input needed.
- [ ] **Quick Capture mode** — Keyboard shortcut (Ctrl+Shift+Space) opens a minimal floating window for capturing a thought. On save, it becomes a new note in the Inbox folder.

---

### 3. GOOGLE KEEP
**Why it's in the top 7:** Fastest capture, Google ecosystem, sticky-note visual grid.
**What no one else does as well:**

- **Location-based reminders** — "Remind me about this note when I arrive at the office." Uses device GPS. No other app in this list does location reminders.
- **Color-coded note cards** — Each note has a background color. The grid view becomes a visual color map of your brain. Simple but powerful for quick scanning.
- **Voice memo → transcription** — Record audio, Google transcribes it automatically and adds text to the note. The audio and transcript are saved together.
- **Pinch-zoom grid density** — Swipe to make note cards larger or smaller. Adjust visual density on the fly.
- **Google Lens integration** — Point camera at text, Keep extracts it directly into a new note. Fastest text capture on mobile.
- **Label-only organization** — No folders at all. Every note is labeled (tagged). The sidebar shows labels. Radical simplicity — and it works for quick notes.
- **Archived notes** — Notes don't get deleted, they get archived. A separate archive view shows all archived notes, searchable.

**What Google Keep does BADLY (NOTED must exploit):**
- No folders, just labels — terrible for large note collections
- No rich text formatting whatsoever
- No markdown
- No attachments beyond images
- No desktop app (web only)
- No AI beyond Google Assistant integration
- Notes can't be sorted

**Features to steal for NOTED:**
- [ ] **Color-coded notes** — Each note can have an optional background color (7 choices, same muted palette as themes). Shown in grid view and list view. Not just themes — per-note color accent.
- [ ] **Archive instead of delete** — Deleting a note moves it to Archive first. Permanent delete requires going to Archive and deleting from there. No note lost accidentally.
- [ ] **Location-based reminders** — In Electron version (v2): remind me when I'm at a specific location. Stored in task/reminder metadata.
- [ ] **Voice-to-note** — Hold a button, speak, transcription appears as new note content (using whisper.cpp locally via Ollama or standalone). This is a killer feature for local-first.

---

### 4. NOTION
**Why it's in the top 7:** Most flexible workspace ever built. Replaces 5 other apps.
**What no one else does as well:**

- **Database views** — Same data, multiple views: Table, Board (Kanban), Calendar, Gallery, List, Timeline (Gantt). One database, six ways to look at it.
- **Relational databases** — A note/page can have a property that links to another database. Example: a Task has a "Project" property that links to a Projects database. Bidirectional.
- **Block-based everything** — Every element (paragraph, image, callout, embed, table) is a draggable block. Rearrange anything, nest anything inside anything.
- **Inline databases** — Drop a filtered view of any database inline in any note. Your meeting note can show only the tasks related to that meeting.
- **Callout blocks** — Highlighted information boxes with emoji icons. Better than blockquotes for highlighting key info.
- **Toggle blocks** — Collapsible sections. Click to reveal content. Perfect for FAQs, summaries, spoilers.
- **Suggested edits** — Propose changes to shared documents without altering the original. Like tracked changes in Word but cleaner.
- **AI fill for databases** — Auto-fill a database column based on a prompt. "For each company in this CRM, fill the 'industry' field."
- **Templates** — Full-page templates with pre-filled blocks, databases, properties.
- **Notion Sites** — Publish any page as a public website with SEO settings, custom nav, analytics.

**What Notion does BADLY (NOTED must exploit):**
- Slow. Every action requires a server round-trip. Notes don't open instantly.
- AI is generic. Doesn't know your notes unless you explicitly share context.
- Learning curve is brutal. New users are overwhelmed.
- Offline is broken — requires connection for most operations.
- No local storage option.
- Export is painful and lossy.
- Databases are overkill for personal notes.

**Features to steal for NOTED:**
- [ ] **Callout blocks** — Add a "Callout" block type to the TipTap editor. Has an emoji/icon picker + colored background strip. Great for tips, warnings, key takeaways.
- [ ] **Toggle/collapsible blocks** — A heading that collapses its children. Essential for long notes.
- [ ] **Inline database view inside notes** — Advanced v2 feature. Show a filtered task list or note list inside a note body.
- [ ] **Note templates** — User can save any note as a template. "New note from template" option in the + New Note menu. Pre-fills content, tags, folder.
- [ ] **Multiple views for tasks** — Table (current), Kanban (v2), Timeline/Gantt (v3).

---

### 5. OBSIDIAN
**Why it's in the top 7:** Most powerful local-first knowledge system ever built. The gold standard for privacy and data ownership.
**What no one else does as well:**

- **Graph View** — A visual constellation map of all your notes. Each note is a node. Each `[[link]]` is an edge. You see your knowledge web. Filter by tags, folders, depth.
- **Bidirectional linking** — Type `[[note name]]` to link to another note. That other note automatically shows "backlinks" — every note that links to it. The knowledge graph builds itself.
- **Unlinked mentions** — Shows you every note that *mentions* a note by name, even without a formal link. Helps find connections you didn't know existed.
- **Canvas** — An infinite 2D board. Drag notes, web pages, images, text cards. Connect them with arrows. Build mind maps, system diagrams, storyboards.
- **Daily Notes** — A dedicated journal note auto-created every day. One click. Useful for meeting notes, journal entries, todos.
- **Properties (YAML front matter)** — Structured metadata on every note. Custom fields: status, priority, author, due date — anything. Queryable via Dataview plugin.
- **Dataview plugin** — Query your entire vault like a database. "Show me all notes tagged #book where status = unread, sorted by date." Rendered as a live table inside another note.
- **Plugin ecosystem** — 1,000+ community plugins. The app is infinitely extensible.
- **File Recovery** — Automatic snapshots every 5 minutes. Restore any version.
- **Aliases** — A note titled "Artificial Intelligence" can have the alias "AI". Links to either name resolve to the same note.
- **Embedded search queries** — Drop a search query into any note. It renders as a live, updating list of matching notes.
- **Map view** — Show notes as pins on an interactive map (via community plugin).

**What Obsidian does BADLY (NOTED must exploit):**
- No AI built in. Every AI feature requires finding, installing, configuring a community plugin.
- Terrible for non-technical users. YAML, Markdown, plugins — all require learning.
- No collaboration whatsoever.
- Mobile app is buggy.
- No file viewer for PDFs, DOCX, XLSX.
- No tasks page, no calendar page built in.
- The graph view looks cool but becomes unnavigable with 500+ notes.

**Features to steal for NOTED (these are the most powerful):**
- [ ] **Bidirectional note linking** — Type `[[` in the editor and get an autocomplete dropdown of all notes. Creates a link. The linked note gets a "Backlinks" section in its sidebar showing all notes that link to it. This is the single most powerful knowledge feature in any notes app.
- [ ] **Graph View** — A visual page showing the network of all notes and their links. Filter by folder, tag, date. Click a node to open the note. This is v2 but plan for it now in the data model (store links as explicit relationships in JSON).
- [ ] **Daily Notes** — One click creates a note titled with today's date in a "Daily Notes" folder. Keyboard shortcut. Optional template for daily notes.
- [ ] **Backlinks panel** — At the bottom of every note, show a collapsible "Linked by" section listing all notes that link to this one.
- [ ] **Unlinked mentions** — AI feature: "Find notes that mention this topic but aren't formally linked." Uses semantic search.

---

### 6. JOPLIN
**Why it's in the top 7:** Best open-source Evernote alternative. Privacy-first, self-hostable.
**What no one else does as well:**

- **Full end-to-end encryption with any sync target** — Encrypt everything, then sync to Dropbox, OneDrive, WebDAV, S3, or your own server. The server never sees unencrypted data.
- **Evernote import** — Import `.enex` files with full fidelity: formatting, attachments, tags, metadata, even geolocation. Nothing is lost.
- **External editor support** — Set any text editor (VS Code, Vim, Notepad++) as the editor. Joplin watches the file, syncs changes live.
- **Web Clipper browser extension** — Save entire webpages, simplified articles, or screenshots directly into Joplin from the browser.
- **Conflict detection** — When the same note is edited on two devices before syncing, Joplin creates a "conflict note" instead of silently overwriting.
- **Note history** — Every version of every note stored and restorable. Not just the last 10 — every change.
- **Custom CSS** — Full control over how notes look by writing CSS.
- **Portable** — Can run from a USB drive. No installation needed.

**What Joplin does BADLY (NOTED must exploit):**
- Ugly interface. Looks like a developer built it for developers.
- No AI whatsoever.
- No calendar, no tasks beyond basic checkboxes.
- No file viewer — attachments are download-only.
- Complex sync setup for non-technical users.
- No graph view or note linking.

**Features to steal for NOTED:**
- [ ] **Web Clipper** — A browser extension (Chrome/Firefox) that saves any webpage to NOTED. Saves title, content (reader mode), URL, screenshot. Creates a new note. *(v2 feature)*
- [ ] **Conflict notes** — If the same note.json is modified by two processes simultaneously (race condition), create a "conflict copy" instead of silently overwriting.
- [ ] **Note geolocation** — When creating a note, optionally save the GPS coordinates (if browser geolocation available). Show on a map in note metadata.

---

### 7. EVERNOTE
**Why it's in the top 7 (barely):** Invented the category. Still has the best web clipper and OCR.
**What no one else does as well:**

- **Web Clipper** — The gold standard. Save web pages in five modes: Full page, Simplified article, Screenshot, Bookmark, Email. Strips ads, formats cleanly. Older than every competitor but still the best.
- **Document scanning + OCR** — Scan receipts, business cards, whiteboards. OCR makes everything searchable. Evernote's handwriting recognition is excellent.
- **Related Notes** — When you open a note, Evernote shows "Related Notes" — other notes in your vault that are similar in content. No explicit linking required.
- **Note history** — Full version history for all notes, restorable to any point.
- **Tasks inside notes** — Evernote tasks are embedded inside note content, not a separate page. A task lives inside the context of the note that spawned it.
- **"Second Brain" home screen** — Dashboard showing recent notes, tasks due, reminders, upcoming calendar events, suggested notes to review.

**What Evernote does BADLY (NOTED must exploit):**
- Expensive and restrictive free plan
- Bloated, slow app
- No local-first option
- No markdown
- No AI worth talking about
- No graph view or linking
- Paid tier required for basic features like offline access

**Features to steal for NOTED:**
- [ ] **Related Notes panel** — Using embeddings, show "Related Notes" at the bottom of every note. Computed automatically on note open. Shows top 5 semantically similar notes with a 1-line preview. This replaces Evernote's dumb keyword matching with actual AI.
- [ ] **Tasks inside notes** — In the editor, any checklist item can be "promoted to a Task" with one click. It appears both inside the note AND in the Tasks page. Bidirectional — check it in Tasks, it's checked in the note.
- [ ] **Dashboard/Home** — A home page (default view on app open) showing: recent notes, tasks due today/tomorrow, notes you haven't opened in 30+ days ("resurfacing"), calendar summary. This is the second brain view.

---

## MASTER FEATURES LIST — WHAT NOTED WILL DO THAT NONE OF THEM DO TOGETHER

This is the synthesis. Every item below represents something at least one top app does, but no single app does all of them. NOTED will.

### Already in PRD (confirmed)
- ✅ Local-first AI (Ollama) — none of them have this
- ✅ Per-note AI memory — none of them have this
- ✅ Document Q&A (ask AI about any attachment) — none of them have this
- ✅ Full rich text editor (Obsidian level)
- ✅ File viewer (PDF, DOCX, XLSX, PPTX) built in
- ✅ Semantic search
- ✅ Encrypted vault
- ✅ Nothing OS aesthetic with themes
- ✅ Tasks + Calendar integrated
- ✅ Import/Export all formats

### NEW — Add to PRD from this research
- [ ] **#hashtag auto-tagging** (Apple Notes) — Type `#tag` in note body, auto-adds tag
- [ ] **Smart Folders** (Apple Notes) — Dynamic folders based on rules
- [ ] **Quick Capture widget** (Apple Notes) — Ctrl+Shift+Space floating mini-window
- [ ] **Archive instead of delete** (Google Keep) — Notes go to archive first
- [ ] **Per-note color accent** (Google Keep) — Optional background color for note card
- [ ] **Voice-to-note** (Google Keep) — Whisper.cpp local transcription → new note
- [ ] **Callout blocks** (Notion) — Emoji + colored info box block type
- [ ] **Toggle/collapsible blocks** (Notion) — Collapsible heading sections
- [ ] **Note templates** (Notion) — Save note as template, create from template
- [ ] **Bidirectional note linking** (Obsidian) — `[[note name]]` autocomplete linking ← HIGHEST PRIORITY
- [ ] **Backlinks panel** (Obsidian) — "Linked by" section at bottom of every note
- [ ] **Daily Notes** (Obsidian) — One-click today's journal note
- [ ] **Graph View** (Obsidian) — Visual knowledge map (v2, plan data model now)
- [ ] **Related Notes panel** (Evernote) — AI-powered similar notes at bottom of note ← HIGH PRIORITY
- [ ] **Tasks-inside-notes** (Evernote) — Promote checklist item to full Task
- [ ] **Home/Dashboard page** (Evernote) — Second brain home with recent, due, resurface
- [ ] **OCR in images** (OneNote) — Search text inside uploaded images
- [ ] **Web Clipper extension** (Evernote/Joplin) — Browser extension to save pages (v2)

---

## PRIORITY ADDITIONS FOR MILESTONE PLANNING

These are not in the original PRD. Ranked by impact vs effort:

### Add to Milestone 1 (low effort, high impact)
1. **#hashtag auto-tagging** — 2 hours. Parse note content on save, extract #tags, add to tag list
2. **Archive instead of delete** — 2 hours. Add `archived: true` field, Archive section in sidebar
3. **Per-note color accent** — 2 hours. Color picker on note card, stored in metadata
4. **Daily Notes button** — 1 hour. Button in sidebar, creates note with today's date title
5. **Toggle/collapsible blocks** — Built into TipTap with Details extension

### Add to Milestone 2 (medium effort, very high impact)
6. **Related Notes panel** — 4 hours. Uses existing embeddings. Compute cosine similarity on note open, show top 5.
7. **Bidirectional note linking** — 6 hours. `[[` trigger in editor + autocomplete + backlinks storage in note JSON + Backlinks panel

### Add to Milestone 5 (higher effort)
8. **Note templates** — 4 hours. Save as template, list in New Note menu
9. **Smart Folders** — 6 hours. Rule builder UI + dynamic folder queries
10. **Home/Dashboard page** — 8 hours. Home page component with sections

### Add to Milestone 6 / Electron only
11. **Quick Capture floating window** — Electron only, global hotkey
12. **Voice-to-note** — Requires whisper.cpp integration

### V2 only (don't plan for now, just preserve in data model)
13. **Graph View** — Store links as explicit edges in `notes.json` (already in bidirectional linking data model)
14. **Web Clipper** — Browser extension is a separate project
15. **OCR in images** — Requires pytesseract, good but deprioritized

---

## GAPS THAT ALL 7 APPS HAVE — NOTED'S REAL DIFFERENTIATION

Every single one of the top 7 apps fails at one or more of:

| Gap | Who Fails | NOTED Solution |
|---|---|---|
| Local AI that runs offline | All 7 | Ollama + Mistral 7B, fully local |
| AI with per-note memory | All 7 | Separate ai_memory/[note_id].json per note |
| Ask AI about any file type | All 7 | File extraction + document Q&A |
| Beautiful UI that's also local | All 7 (Obsidian is ugly, Notion is cloud) | Nothing OS aesthetic + local-first |
| File viewer built in (PDF/DOCX/XLSX/PPTX) | All 7 | Full viewer with annotation |
| Desktop app + web deployment from same codebase | All 7 | React + FastAPI, Layer 1→2→3 |
| Free AI with option to pay for better AI | All 7 | Ollama free, API keys for paid tier |
| Graph of notes without being Obsidian complex | Obsidian is complex | Simple graph view in v2 |
