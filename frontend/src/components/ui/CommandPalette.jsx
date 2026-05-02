import { useState, useEffect, useRef, useMemo } from 'react'
import { Search, FileText, CheckSquare, Calendar, Settings, Star, Tag, Archive, LayoutDashboard, Sparkles, BookOpen, FolderOpen, Moon, Sun, Palette } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useNotesStore } from '@/store/notesStore'
import { useUIStore } from '@/store/uiStore'
import { useAIStore } from '@/store/aiStore'

function extractText(content, limit = 80) {
  if (!content) return ''
  if (typeof content === 'string') return content.slice(0, limit)
  const texts = []
  const walk = (node) => {
    if (node.type === 'text') texts.push(node.text)
    if (node.content) node.content.forEach(walk)
  }
  walk(content)
  return texts.join(' ').slice(0, limit)
}

function fuzzyMatch(query, text) {
  if (!query) return true
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  if (t.includes(q)) return true
  let qi = 0
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++
  }
  return qi === q.length
}

function fuzzyScore(query, text) {
  if (!query) return 0
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  if (t === q) return 100
  if (t.startsWith(q)) return 90
  if (t.includes(q)) return 80
  let qi = 0
  let consecutive = 0
  let maxConsecutive = 0
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      qi++
      consecutive++
      maxConsecutive = Math.max(maxConsecutive, consecutive)
    } else {
      consecutive = 0
    }
  }
  return qi === q.length ? 50 + maxConsecutive * 5 : 0
}

const NAV_ACTIONS = [
  { id: 'nav-dashboard', label: 'Go to Dashboard', icon: <LayoutDashboard size={14} strokeWidth={1.5} />, panel: 'dashboard', type: 'action' },
  { id: 'nav-notes', label: 'Go to Notes', icon: <FileText size={14} strokeWidth={1.5} />, panel: 'notes', type: 'action' },
  { id: 'nav-tasks', label: 'Go to Tasks', icon: <CheckSquare size={14} strokeWidth={1.5} />, panel: 'tasks', type: 'action' },
  { id: 'nav-calendar', label: 'Go to Calendar', icon: <Calendar size={14} strokeWidth={1.5} />, panel: 'calendar', type: 'action' },
  { id: 'nav-settings', label: 'Go to Settings', icon: <Settings size={14} strokeWidth={1.5} />, panel: 'settings', type: 'action' },
  { id: 'nav-favourites', label: 'Go to Favourites', icon: <Star size={14} strokeWidth={1.5} />, panel: 'favourites', type: 'action' },
  { id: 'nav-tags', label: 'Go to Tags', icon: <Tag size={14} strokeWidth={1.5} />, panel: 'tags', type: 'action' },
  { id: 'nav-archive', label: 'Go to Archive', icon: <Archive size={14} strokeWidth={1.5} />, panel: 'archive', type: 'action' },
  { id: 'nav-journal', label: 'Go to Journal', icon: <BookOpen size={14} strokeWidth={1.5} />, panel: 'journal', type: 'action' },
  { id: 'action-ai', label: 'Toggle AI Sidebar', icon: <Sparkles size={14} strokeWidth={1.5} />, action: 'toggle-ai', type: 'action' },
  { id: 'action-new-note', label: 'Create New Note', icon: <FileText size={14} strokeWidth={1.5} />, action: 'new-note', type: 'action' },
  { id: 'action-theme', label: 'Change Theme', icon: <Palette size={14} strokeWidth={1.5} />, action: 'settings-appearance', type: 'action' },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const notes = useNotesStore(s => s.notes)
  const setActiveNote = useNotesStore(s => s.setActiveNote)
  const createNote = useNotesStore(s => s.createNote)
  const setActivePanel = useUIStore(s => s.setActivePanel)
  const toggleAI = useAIStore(s => s.toggle)

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault()
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const results = useMemo(() => {
    const items = []

    const noteResults = notes
      .filter(n => !n.archived)
      .filter(n => fuzzyMatch(query, n.title || 'Untitled'))
      .map(n => ({
        id: `note-${n.id}`,
        label: n.title || 'Untitled',
        sub: extractText(n.content),
        icon: <FileText size={14} strokeWidth={1.5} />,
        type: 'note',
        noteId: n.id,
        score: fuzzyScore(query, n.title || 'Untitled'),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)

    const actionResults = NAV_ACTIONS
      .filter(a => fuzzyMatch(query, a.label))
      .map(a => ({ ...a, score: fuzzyScore(query, a.label) }))
      .sort((a, b) => b.score - a.score)

    if (query) {
      items.push(...actionResults, ...noteResults)
    } else {
      items.push(...noteResults.slice(0, 5), ...actionResults)
    }

    return items
  }, [query, notes])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const execute = (item) => {
    setOpen(false)
    if (item.type === 'note') {
      setActivePanel('notes')
      setActiveNote(item.noteId)
    } else if (item.panel) {
      setActiveNote(null)
      setActivePanel(item.panel)
    } else if (item.action === 'toggle-ai') {
      toggleAI()
    } else if (item.action === 'new-note') {
      setActivePanel('notes')
      createNote().then(note => { if (note) setActiveNote(note.id) }).catch(() => {})
    } else if (item.action === 'settings-appearance') {
      setActiveNote(null)
      setActivePanel('settings')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault()
      execute(results[selectedIndex])
    }
  }

  useEffect(() => {
    if (listRef.current) {
      const el = listRef.current.children[selectedIndex]
      if (el) el.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[200]"
        style={{ background: 'oklch(0% 0 0 / 0.5)' }}
        onClick={() => setOpen(false)}
      />
      <div
        className="fixed z-[201] w-full max-w-lg dropdown-in"
        style={{
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <div
          className="overflow-hidden border shadow-2xl"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border-strong)',
            borderRadius: 12,
          }}
        >
          <div
            className="flex items-center gap-3 px-4 h-12 border-b"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <Search size={16} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search notes, actions..."
              className="flex-1 bg-transparent outline-none font-mono"
              style={{ fontSize: 14, color: 'var(--color-text-primary)' }}
            />
            <kbd
              className="font-mono shrink-0 px-1.5 py-0.5 rounded"
              style={{
                fontSize: 10,
                color: 'var(--color-text-muted)',
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
              }}
            >
              ESC
            </kbd>
          </div>

          <div
            ref={listRef}
            className="py-1 overflow-y-auto"
            style={{ maxHeight: 320 }}
          >
            {results.length === 0 && (
              <p className="px-4 py-6 text-center font-mono" style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                No results
              </p>
            )}
            {results.map((item, i) => (
              <button
                key={item.id}
                onClick={() => execute(item)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2 text-left transition-colors',
                  i === selectedIndex
                    ? 'bg-[var(--color-surface-active)]'
                    : 'hover:bg-[var(--color-surface-hover)]',
                )}
              >
                <span style={{ color: item.type === 'note' ? 'var(--color-text-muted)' : 'var(--color-accent)', flexShrink: 0 }}>
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className="truncate font-medium"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 13,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {item.label}
                  </p>
                  {item.sub && (
                    <p
                      className="truncate font-mono"
                      style={{ fontSize: 10, color: 'var(--color-text-muted)' }}
                    >
                      {item.sub}
                    </p>
                  )}
                </div>
                <span className="font-mono shrink-0" style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>
                  {item.type === 'note' ? 'Note' : 'Action'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
