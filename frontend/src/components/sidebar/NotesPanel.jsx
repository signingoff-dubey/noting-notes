import { useState, useEffect, useRef } from 'react'
import { Search, Plus, X, PanelLeftClose, ChevronsRight, Pin, Star, Lock, Trash2, Sparkles, Folder } from 'lucide-react'
import { api } from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/cn'
import { useNotesStore } from '@/store/notesStore'
import { toast } from '@/store/uiStore'

function extractText(content, limit = 120) {
  if (!content) return ''
  if (typeof content === 'string') return content.slice(0, limit)
  if (content?.content) {
    const texts = []
    const walk = (node) => {
      if (node.type === 'text') texts.push(node.text)
      if (node.content) node.content.forEach(walk)
    }
    walk(content)
    return texts.join(' ').slice(0, limit)
  }
  return ''
}

function extractFullText(content) {
  if (!content) return ''
  if (typeof content === 'string') return content
  if (content?.content) {
    const texts = []
    const walk = (node) => {
      if (node.type === 'text') texts.push(node.text)
      if (node.content) node.content.forEach(walk)
    }
    walk(content)
    return texts.join(' ')
  }
  return ''
}

function NoteRow({ note, active, onClick, folderName }) {
  const timeAgo = note.updated_at
    ? formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })
        .replace(' ago', '')
        .replace('about ', '~')
    : ''
  const preview = extractText(note.content)
  const indent = (note.pinned || note.starred || note.is_vault) ? 14 : 0

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col gap-0.5 w-full px-3 py-2.5 text-left border-b transition-colors group',
        active
          ? 'bg-[var(--color-surface-active)]'
          : 'hover:bg-[var(--color-surface-hover)]',
      )}
      style={{
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Title row */}
      <div className="flex items-center gap-1.5 min-w-0">
        {note.pinned && <Pin size={9} strokeWidth={1.5} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />}
        {note.starred && <Star size={9} strokeWidth={1.5} fill="currentColor" style={{ color: 'var(--color-warning)', flexShrink: 0 }} />}
        {note.is_vault && <Lock size={9} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />}
        <span
          className="font-medium truncate flex-1"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
          }}
        >
          {note.title || 'Untitled'}
        </span>
        <span
          className="font-mono shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-muted)' }}
        >
          {timeAgo}
        </span>
      </div>
      {/* Preview */}
      <span
        className="truncate block"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          paddingLeft: indent,
        }}
      >
        {preview || 'Empty note'}
      </span>
      {/* Folder + Tags */}
      <div className="flex items-center gap-1 mt-0.5 flex-wrap" style={{ paddingLeft: indent }}>
        {folderName && (
          <span
            className="inline-flex items-center gap-0.5 font-mono px-1 rounded"
            style={{
              fontSize: 'var(--text-2xs)',
              height: 14,
              color: 'var(--color-accent)',
              background: 'var(--color-accent-dim)',
            }}
          >
            <Folder size={7} strokeWidth={1.5} />
            {folderName}
          </span>
        )}
        {(note.tags || []).slice(0, 2).map(tag => (
          <span key={tag} className="ink-tag" style={{ fontSize: 'var(--text-2xs)', height: 14 }}>
            {tag}
          </span>
        ))}
      </div>
    </button>
  )
}

export function NotesPanel({ collapsed, onToggle }) {
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [semanticMode, setSemanticMode] = useState(false)
  const [semanticResults, setSemanticResults] = useState(null)
  const [semanticLoading, setSemanticLoading] = useState(false)
  const semanticTimer = useRef(null)
  const searchRef = useRef(null)
  const notes = useNotesStore(s => s.notes)
  const folders = useNotesStore(s => s.folders)
  const activeNote = useNotesStore(s => s.activeNote)
  const setActiveNote = useNotesStore(s => s.setActiveNote)
  const createNote = useNotesStore(s => s.createNote)
  const fetchNotes = useNotesStore(s => s.fetchNotes)
  const deleteNote = useNotesStore(s => s.deleteNote)
  const fetchFolders = useNotesStore(s => s.fetchFolders)

  useEffect(() => { fetchNotes(); fetchFolders() }, [])

  /* Ctrl+F focuses search */
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault()
        searchRef.current?.focus()
        searchRef.current?.select()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (!semanticMode || !search.trim()) {
      setSemanticResults(null)
      return
    }
    if (semanticTimer.current) clearTimeout(semanticTimer.current)
    semanticTimer.current = setTimeout(async () => {
      setSemanticLoading(true)
      try {
        const res = await api.ai.semanticSearch({ query: search, top_n: 10 })
        setSemanticResults(res.results?.map(r => r.note_id) || [])
      } catch {
        setSemanticResults(null)
        toast.error('Semantic search unavailable')
        setSemanticMode(false)
      } finally {
        setSemanticLoading(false)
      }
    }, 500)
    return () => { if (semanticTimer.current) clearTimeout(semanticTimer.current) }
  }, [search, semanticMode])

  const filtered = (() => {
    let result = notes.filter(n => !n.archived && n._source !== 'journal')
    if (semanticMode && semanticResults) {
      const order = new Map(semanticResults.map((id, i) => [id, i]))
      result = result.filter(n => order.has(n.id)).sort((a, b) => order.get(a.id) - order.get(b.id))
    } else {
      result = result.filter(n => {
        if (!search) return true
        const q = search.toLowerCase()
        return (n.title || '').toLowerCase().includes(q) ||
          extractFullText(n.content).toLowerCase().includes(q)
      }).sort((a, b) => {
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
      })
    }
    return result
  })()

  const handleNewNote = async () => {
    try { await createNote() }
    catch { toast.error('Failed to create note') }
  }

  const handleDeleteAll = async () => {
    const toDelete = filtered.filter(n => !n.archived && n._source !== 'journal')
    try {
      for (const n of toDelete) {
        await deleteNote(n.id)
      }
      setActiveNote(null)
      toast.success(`Deleted ${toDelete.length} note${toDelete.length !== 1 ? 's' : ''}`)
    } catch {
      toast.error('Failed to delete all notes')
    }
    setConfirmDelete(false)
  }

  const handleSelect = async (id) => {
    try { await setActiveNote(id) }
    catch { toast.error('Failed to open note') }
  }

  /* ── Collapsed strip ── */
  if (collapsed) {
    return (
      <div
        className="flex flex-col items-center pt-3 border-r shrink-0"
        style={{
          width: 36,
          borderColor: 'var(--color-border)',
          background: 'var(--color-sidebar-bg)',
        }}
      >
        <button
          onClick={onToggle}
          title="Expand notes panel"
          aria-label="Expand notes panel"
          className="w-7 h-7 flex items-center justify-center rounded-md transition-colors hover:bg-[var(--color-surface-hover)]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ChevronsRight size={13} strokeWidth={1.5} />
        </button>
      </div>
    )
  }

  /* ── Expanded panel ── */
  return (
    <div
      className="flex flex-col shrink-0 border-r"
      style={{
        width: 260,
        borderColor: 'var(--color-border)',
        background: 'var(--color-sidebar-bg)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-1.5 px-3 shrink-0 border-b"
        style={{ height: 48, borderColor: 'var(--color-border)' }}
      >
        <span
          className="flex-1 font-mono uppercase tracking-widest"
          style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-muted)' }}
        >
          Notes
        </span>
        <span
          className="font-mono px-1.5 py-0.5 rounded"
          style={{ fontSize: 'var(--text-2xs)', background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}
        >
          {filtered.length}
        </span>
        {notes.filter(n => !n.archived && n._source !== 'journal').length > 0 && (
          <button
            onClick={() => setConfirmDelete(true)}
            title="Delete all notes"
            aria-label="Delete all notes"
            className="w-6 h-6 flex items-center justify-center rounded-md transition-colors hover:bg-[var(--color-surface-hover)]"
            style={{ color: 'var(--color-error, #ef4444)' }}
          >
            <Trash2 size={12} strokeWidth={1.5} />
          </button>
        )}
        <button
          onClick={handleNewNote}
          title="New note (Ctrl+N)"
          aria-label="New note"
          className="w-6 h-6 flex items-center justify-center rounded-md transition-colors hover:bg-[var(--color-surface-hover)]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Plus size={13} strokeWidth={1.5} />
        </button>
        <button
          onClick={onToggle}
          title="Collapse notes panel"
          aria-label="Collapse notes panel"
          className="w-6 h-6 flex items-center justify-center rounded-md transition-colors hover:bg-[var(--color-surface-hover)]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <PanelLeftClose size={13} strokeWidth={1.5} />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search
              size={11}
              strokeWidth={1.5}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: semanticLoading ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
            />
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={semanticMode ? 'AI search...' : 'Search notes... (Ctrl+F)'}
              className="ink-search w-full"
              style={{ height: 28, paddingLeft: 26, paddingRight: search ? 26 : 8, fontSize: 'var(--text-xs)' }}
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setSemanticResults(null) }}
                className="absolute right-2 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <X size={10} strokeWidth={1.5} />
              </button>
            )}
          </div>
          <button
            onClick={() => setSemanticMode(v => !v)}
            title={semanticMode ? 'Switch to text search' : 'Switch to AI semantic search'}
            className="w-6 h-6 flex items-center justify-center rounded-md transition-colors shrink-0"
            style={{
              color: semanticMode ? 'var(--color-accent)' : 'var(--color-text-muted)',
              background: semanticMode ? 'var(--color-accent-dim)' : 'transparent',
            }}
          >
            <Sparkles size={11} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Note rows */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-20">
            <p className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              {search ? 'No matches' : 'No notes yet'}
            </p>
          </div>
        ) : (
          filtered.map(note => (
            <NoteRow
              key={note.id}
              note={note}
              active={note.id === activeNote?.id}
              onClick={() => handleSelect(note.id)}
              folderName={note.folder_id ? folders.find(f => f.id === note.folder_id)?.name : null}
            />
          ))
        )}
      </div>

      {/* Delete all confirmation */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'var(--color-overlay)' }}
          onClick={() => setConfirmDelete(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-title"
            className="flex flex-col gap-4 p-5 rounded-xl"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              width: 300,
              boxShadow: '0 16px 48px var(--color-shadow)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <Trash2 size={16} strokeWidth={1.5} style={{ color: 'var(--color-error, #ef4444)', flexShrink: 0 }} />
              <span id="delete-confirm-title" className="font-mono font-medium" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                Delete all notes?
              </span>
            </div>
            <p className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              This will permanently delete {notes.filter(n => !n.archived && n._source !== 'journal').length} note{notes.filter(n => !n.archived && n._source !== 'journal').length !== 1 ? 's' : ''}. Cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 h-7 rounded-md font-mono transition-colors hover:bg-[var(--color-surface-hover)]"
                style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                className="px-3 h-7 rounded-md font-mono transition-colors"
                style={{
                  fontSize: 'var(--text-sm)',
                  background: 'var(--color-error, #ef4444)',
                  color: 'var(--color-bg)',
                  border: 'none',
                }}
              >
                Delete all
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
