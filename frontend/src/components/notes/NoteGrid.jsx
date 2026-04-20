import { useNotesStore } from '@/store/notesStore'
import { NoteCard } from './NoteCard'
import { FileText } from 'lucide-react'

function SkeletonCard() {
  return (
    <div
      className="p-4 border"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRadius: 10,
      }}
    >
      <div className="skeleton h-4 w-32 mb-3 rounded" />
      <div className="skeleton h-3 w-full mb-1 rounded" />
      <div className="skeleton h-3 w-full mb-1 rounded" />
      <div className="skeleton h-3 w-2/3 mb-4 rounded" />
      <div className="skeleton h-3 w-16 rounded" />
    </div>
  )
}

function EmptyState({ query }) {
  return (
    <div className="col-span-2 flex flex-col items-center justify-center h-40 gap-3">
      <FileText size={28} strokeWidth={1} style={{ color: 'var(--color-text-muted)' }} />
      {query ? (
        <p className="font-mono text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          No notes match "{query}"
        </p>
      ) : (
        <p className="font-mono text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          No notes yet
        </p>
      )}
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

export function NoteGrid({ onSelect, activeId, sortBy = 'updated' }) {
  const isLoading = useNotesStore(s => s.isLoading)
  const searchQuery = useNotesStore(s => s.searchQuery)
  const getFilteredNotes = useNotesStore(s => s.getFilteredNotes)
  const notes = getFilteredNotes()

  const sorted = sortNotes(notes, sortBy)

  if (isLoading && !notes.length) {
    return (
      <div className="grid grid-cols-2 gap-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (!notes.length) {
    return (
      <div className="grid grid-cols-2 gap-3 p-4">
        <EmptyState query={searchQuery} />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {sorted.map(note => (
        <NoteCard
          key={note.id}
          note={note}
          grid
          active={note.id === activeId}
          onClick={() => onSelect(note.id)}
        />
      ))}
    </div>
  )
}
