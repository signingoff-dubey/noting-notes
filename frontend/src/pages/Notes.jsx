import { useEffect, useState, useCallback } from 'react'
import { Search, LayoutGrid, List, X, Plus, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useNotesStore } from '@/store/notesStore'
import { NoteList } from '@/components/notes/NoteList'
import { NoteGrid } from '@/components/notes/NoteGrid'
import { toast } from '@/store/uiStore'

const SORT_OPTIONS = [
  { value: 'updated', label: 'Last edited' },
  { value: 'created', label: 'Date created' },
  { value: 'title',   label: 'Title A–Z' },
]

export function Notes() {
  const {
    fetchNotes, fetchFolders, setActiveNote,
    viewMode, setViewMode, searchQuery, setSearchQuery,
    activeFolderId, folders, notes, createNote,
  } = useNotesStore()

  const [sortBy, setSortBy] = useState('updated')
  const [sortOpen, setSortOpen] = useState(false)

  useEffect(() => {
    fetchNotes()
    fetchFolders()
  }, [])

  useEffect(() => {
    if (!sortOpen) return
    const close = () => setSortOpen(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [sortOpen])

  const handleSelect = useCallback(async (id) => {
    try { await setActiveNote(id) }
    catch { toast.error('Failed to open note') }
  }, [setActiveNote])

  const handleNewNote = useCallback(async () => {
    try {
      await createNote()
    } catch (err) {
      toast.error('Failed to create note: ' + err.message)
    }
  }, [createNote])

  const activeFolder = folders.find(f => f.id === activeFolderId)
  const visibleNotes = activeFolderId
    ? notes.filter(n => n.folder_id === activeFolderId && !n.archived && n._source !== 'journal')
    : notes.filter(n => !n.archived && n._source !== 'journal')
  const noteCount = visibleNotes.length
  const sortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Last edited'

  return (
    <div className="flex flex-col h-full">
      {/* ── Page header ── */}
      <div className="ink-page-header">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h1 className="ink-page-title">
            {activeFolder ? activeFolder.name : 'Notes'}
          </h1>
          <span className="ink-count">{noteCount}</span>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search
            size={13}
            strokeWidth={1.5}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="ink-search w-full"
            style={{ height: 34, paddingLeft: 34, paddingRight: searchQuery ? 32 : 12 }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <X size={12} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <button
            onClick={e => { e.stopPropagation(); setSortOpen(o => !o) }}
            className="ink-btn-ghost"
            style={{ height: 34, paddingLeft: 10, paddingRight: 10, gap: 6, fontSize: 'var(--text-xs)' }}
          >
            {sortLabel}
            <ChevronDown size={11} strokeWidth={1.5} />
          </button>
          {sortOpen && (
            <div
              className="absolute right-0 top-full mt-1 border py-1 z-50"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                borderRadius: 10,
                minWidth: 140,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
            >
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setSortBy(opt.value); setSortOpen(false) }}
                  className="flex items-center w-full px-3 h-8 text-left"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    color: sortBy === opt.value ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    background: sortBy === opt.value ? 'var(--color-surface-2)' : 'transparent',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View toggle */}
        <div
          className="flex items-center overflow-hidden border"
          style={{ borderRadius: 8, borderColor: 'var(--color-border)' }}
        >
          <button
            onClick={() => setViewMode('list')}
            className="flex items-center justify-center w-8 h-[34px]"
            style={{
              background: viewMode === 'list' ? 'var(--color-surface-active)' : 'transparent',
              color: viewMode === 'list' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            }}
            title="List view"
          >
            <List size={13} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className="flex items-center justify-center w-8 h-[34px] border-l"
            style={{
              borderColor: 'var(--color-border)',
              background: viewMode === 'grid' ? 'var(--color-surface-active)' : 'transparent',
              color: viewMode === 'grid' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            }}
            title="Grid view"
          >
            <LayoutGrid size={13} strokeWidth={1.5} />
          </button>
        </div>

        {/* New Note */}
        <button onClick={handleNewNote} className="ink-btn-primary" style={{ height: 34 }}>
          <Plus size={14} strokeWidth={2} />
          New Note
        </button>
      </div>

      {/* ── Note list / grid ── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {viewMode === 'list'
          ? <NoteList onSelect={handleSelect} activeId={null} sortBy={sortBy} />
          : <NoteGrid onSelect={handleSelect} activeId={null} sortBy={sortBy} />
        }
      </div>
    </div>
  )
}
