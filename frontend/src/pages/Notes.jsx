import { useEffect, useState, useCallback } from 'react'
import { Search, LayoutGrid, List, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useNotesStore } from '@/store/notesStore'
import { NoteList } from '@/components/notes/NoteList'
import { NoteGrid } from '@/components/notes/NoteGrid'
import { NoteEditor } from '@/components/editor/NoteEditor'
import { toast } from '@/store/uiStore'

const SORT_OPTIONS = [
  { value: 'updated', label: 'Last edited' },
  { value: 'created', label: 'Date created' },
  { value: 'title',   label: 'Title A–Z' },
]

export function Notes() {
  const {
    fetchNotes, fetchFolders, setActiveNote, activeNote,
    viewMode, setViewMode, searchQuery, setSearchQuery,
    activeFolderId, folders, notes,
  } = useNotesStore()

  const [sortBy, setSortBy] = useState('updated')
  const [sortOpen, setSortOpen] = useState(false)

  useEffect(() => {
    fetchNotes()
    fetchFolders()
  }, [])

  // Close sort dropdown on outside click
  useEffect(() => {
    if (!sortOpen) return
    const close = () => setSortOpen(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [sortOpen])

  const handleSelect = useCallback(async (id) => {
    try {
      await setActiveNote(id)
    } catch {
      toast.error('Failed to open note')
    }
  }, [setActiveNote])

  const handleBack = useCallback(() => setActiveNote(null), [setActiveNote])

  const activeFolder = folders.find(f => f.id === activeFolderId)
  const folderNoteCount = activeFolderId
    ? notes.filter(n => n.folder_id === activeFolderId).length
    : notes.length

  const sortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Last edited'

  return (
    <div className="flex flex-col h-full">
      {activeNote ? (
        <NoteEditor note={activeNote} onBack={handleBack} />
      ) : (
        <>
          {/* ── Breadcrumb + count ── */}
          <div
            className="flex items-center gap-2 px-4 shrink-0 border-b"
            style={{ height: 36, borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
          >
            <span
              className="font-mono uppercase tracking-widest"
              style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}
            >
              {activeFolder ? activeFolder.name : 'All Notes'}
            </span>
            <span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              ·
            </span>
            <span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              {folderNoteCount} {folderNoteCount === 1 ? 'note' : 'notes'}
            </span>
          </div>

          {/* ── Search + controls ── */}
          <div
            className="flex items-center gap-2 px-4 shrink-0 border-b"
            style={{ height: 44, borderColor: 'var(--color-border)' }}
          >
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                size={12}
                strokeWidth={1.5}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--color-text-muted)' }}
              />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="w-full border font-mono outline-none transition-colors"
                style={{
                  height: 30,
                  paddingLeft: 28,
                  paddingRight: searchQuery ? 28 : 10,
                  background: 'var(--color-surface-2)',
                  borderColor: 'var(--color-border)',
                  borderRadius: 6,
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-primary)',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--color-border-strong)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <X size={11} strokeWidth={1.5} />
                </button>
              )}
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={e => { e.stopPropagation(); setSortOpen(o => !o) }}
                className="flex items-center gap-1 h-[30px] px-2.5 border font-mono transition-colors"
                style={{
                  borderRadius: 6,
                  borderColor: 'var(--color-border)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  background: 'transparent',
                  whiteSpace: 'nowrap',
                }}
              >
                {sortLabel}
                <ChevronDown size={10} strokeWidth={1.5} />
              </button>
              {sortOpen && (
                <div
                  className="absolute right-0 top-full mt-1 border py-1 z-50"
                  style={{
                    background: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    borderRadius: 8,
                    minWidth: 130,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  }}
                >
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setSortOpen(false) }}
                      className="flex items-center w-full px-3 h-8 font-mono transition-colors"
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: sortBy === opt.value ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                        background: sortBy === opt.value ? 'var(--color-surface-2)' : 'transparent',
                        textAlign: 'left',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* View mode toggle */}
            <div
              className="flex items-center border overflow-hidden"
              style={{ borderRadius: 6, borderColor: 'var(--color-border)' }}
            >
              <button
                onClick={() => setViewMode('list')}
                className="flex items-center justify-center w-7 h-[30px] transition-colors"
                style={{
                  background: viewMode === 'list' ? 'var(--color-surface-active)' : 'transparent',
                  color: viewMode === 'list' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                }}
                title="List view"
              >
                <List size={12} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className="flex items-center justify-center w-7 h-[30px] border-l transition-colors"
                style={{
                  borderColor: 'var(--color-border)',
                  background: viewMode === 'grid' ? 'var(--color-surface-active)' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                }}
                title="Grid view"
              >
                <LayoutGrid size={12} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* ── Note list ── */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {viewMode === 'list'
              ? <NoteList onSelect={handleSelect} activeId={activeNote?.id} sortBy={sortBy} />
              : <NoteGrid onSelect={handleSelect} activeId={activeNote?.id} sortBy={sortBy} />
            }
          </div>
        </>
      )}
    </div>
  )
}
