# INK

> An AI-native notes app with a Nothing OS aesthetic. Rich editing. Fast AI. No backend required.

![React](https://img.shields.io/badge/React-18-61dafb?style=flat&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat&logo=tailwindcss)
![Groq](https://img.shields.io/badge/AI-Groq-f55036?style=flat)
![Netlify](https://img.shields.io/badge/Deploy-Netlify-00c7b7?style=flat&logo=netlify)

---

## What is INK?

INK is a minimal, AI-powered notes app inspired by Nothing OS. It combines a rich markdown editor, task management, and a streaming AI assistant — all running in the browser with zero backend setup.

**Notes** — TipTap editor with H1–H6, tables, code blocks, task lists, math, highlights, links  
**Tasks** — priorities, labels, folders, due dates, drag-to-reorder  
**AI Assistant** — right-side panel powered by Groq (Llama 3.3 70B by default), streams token by token, remembers note context  
**Themes** — 8 built-in themes: Nothing Dark, Nothing Light, Midnight, Terminal, Sakura, Forest, Warm Paper, WIN95  
**Tags & Archive** — tag notes, filter by tag, archive old notes  
**Calendar** — month view with tasks by due date  

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS + CSS Variables (theme system) |
| Editor | TipTap 2 |
| State | Zustand |
| AI | Groq API — OpenAI-compatible SSE streaming |
| Storage | Browser `localStorage` (Firebase / Supabase coming) |
| Fonts | Geist, Dot Gothic 16, Space Mono |
| Deploy | Netlify |

---

## Getting Started

### Run locally

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:3000`. No Python, no Ollama, no backend needed.

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
| Mixtral 8x7B | Fast | Long context |
| Gemma 2 9B | Fast | General use |
| DeepSeek R1 70B | Moderate | Reasoning tasks |

You can also plug in any OpenAI-compatible API (OpenAI, Together AI, etc.) via the **Custom API** option in the dropdown.

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

## Project Structure

```
ink/
├── frontend/              ← React app (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/        ← AI sidebar, model picker
│   │   │   ├── editor/    ← TipTap editor, floating toolbar
│   │   │   ├── notes/     ← NoteCard, tag chips
│   │   │   ├── sidebar/   ← Left nav, notes panel, folder tree
│   │   │   ├── viewer/    ← FileViewer (PDF, DOCX, XLSX, PPTX)
│   │   │   └── ui/        ← Button, Modal, Toast, Spinner, Dropdown
│   │   ├── pages/         ← Notes, Tasks, Calendar, Settings, Archive, Tags, Dashboard
│   │   ├── store/         ← Zustand stores (notes, tasks, ai, ui, vault, auth)
│   │   ├── lib/           ← api.js, cn.js, firebase.js utilities
│   │   └── index.css      ← All themes + design tokens
│   └── package.json
├── backend/               ← FastAPI (disabled — future use)
│   └── requirements.txt
├── netlify.toml           ← Netlify build config + SPA redirect
└── PRD.md
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
