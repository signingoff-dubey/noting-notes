import { useState, useEffect } from 'react'
import { useNotesStore } from '@/store/notesStore'
import { NoteCard } from './NoteCard'
import { FileText } from 'lucide-react'

function SkeletonCard() {
  return (
    <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="skeleton h-4 w-48 rounded" />
        <div className="skeleton h-3 w-16 rounded" />
      </div>
      <div className="skeleton h-3 w-full rounded mb-1" />
      <div className="skeleton h-3 w-3/4 rounded" />
    </div>
  )
}

function EmptyState({ query }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
      <FileText size={28} strokeWidth={1} style={{ color: 'var(--color-text-muted)' }} />
      {query ? (
        <>
          <p className="font-mono text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            No notes match "{query}"
          </p>
          <p className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Try a different search term
          </p>
        </>
      ) : (
        <>
          <p className="font-mono text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            No notes yet
          </p>
          <p className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Click + New Note to get started
          </p>
        </>
      )}
    </div>
  )
}

function GroupLabel({ label }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-2"
      style={{ background: 'var(--color-surface)' }}
    >
      <span
        className="font-mono uppercase tracking-widest"
        style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}
      >
        ◆ {label}
      </span>
      <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
    </div>
  )
}

function sortNotes(notes, sortBy) {
  return [...notes].sort((a, b) => {
    if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '')
    if (sortBy === 'created') return new Date(b.created_at) - new Date(a.created_at)
    return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
  })
}

export function NoteList({ onSelect, activeId, sortBy = 'updated' }) {
  const isLoading = useNotesStore(s => s.isLoading)
  const searchQuery = useNotesStore(s => s.searchQuery)
  const getFilteredNotes = useNotesStore(s => s.getFilteredNotes)
  const notes = getFilteredNotes()

  const [dragIndex, setDragIndex] = useState(null)
  const [localOrder, setLocalOrder] = useState(null)

  // Reset local order when notes change from outside (new note, fetch, etc.)
  useEffect(() => { setLocalOrder(null) }, [notes.length])

  if (isLoading && !notes.length) {
    return (
      <div className="flex flex-col">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (!notes.length) return <EmptyState query={searchQuery} />

  const pinned = sortNotes(notes.filter(n => n.pinned), sortBy)
  const rest   = sortNotes(notes.filter(n => !n.pinned), sortBy)
  const hasPinned = pinned.length > 0

  // Apply local reorder only to unpinned notes
  const displayRest = localOrder || rest

  const handleDragStart = (i) => setDragIndex(i)
  const handleDragOver = (e, i) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === i) return
    const next = [...displayRest]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(i, 0, moved)
    setLocalOrder(next)
    setDragIndex(i)
  }
  const handleDrop = () => setDragIndex(null)

  return (
    <div className="flex flex-col gap-2 p-4">
      {hasPinned && (
        <>
          <GroupLabel label="Pinned" />
          {pinned.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              active={note.id === activeId}
              onClick={() => onSelect(note.id)}
            />
          ))}
          {displayRest.length > 0 && <GroupLabel label="Notes" />}
        </>
      )}
      {displayRest.map((note, i) => (
        <div
          key={note.id}
          draggable
          onDragStart={() => handleDragStart(i)}
          onDragOver={e => handleDragOver(e, i)}
          onDrop={handleDrop}
          style={{ opacity: dragIndex === i ? 0.5 : 1 }}
        >
          <NoteCard
            note={note}
            active={note.id === activeId}
            onClick={() => onSelect(note.id)}
          />
        </div>
      ))}
    </div>
  )
}
