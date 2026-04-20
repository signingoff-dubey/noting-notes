import { useEffect } from 'react'
import { Star } from 'lucide-react'
import { useNotesStore } from '@/store/notesStore'
import { NoteCard } from '@/components/notes/NoteCard'
import { NoteEditor } from '@/components/editor/NoteEditor'
import { toast } from '@/store/uiStore'

export function FavouritesView() {
  const fetchNotes       = useNotesStore(s => s.fetchNotes)
  const getFavouriteNotes = useNotesStore(s => s.getFavouriteNotes)
  const setActiveNote    = useNotesStore(s => s.setActiveNote)
  const activeNote       = useNotesStore(s => s.activeNote)

  useEffect(() => { fetchNotes() }, [])

  const notes = getFavouriteNotes()

  const handleBack = () => setActiveNote(null)
  const handleSelect = async (id) => {
    try { await setActiveNote(id) } catch { toast.error('Failed to open note') }
  }

  if (activeNote) {
    return <NoteEditor note={activeNote} onBack={handleBack} />
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 shrink-0 border-b"
        style={{ height: 48, borderColor: 'var(--color-border)' }}
      >
        <Star size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)' }} />
        <h2 className="font-mono" style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
          Favourites
        </h2>
        <span className="font-mono ml-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          · {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Star size={28} strokeWidth={1} style={{ color: 'var(--color-text-muted)' }} />
            <p className="font-mono text-sm" style={{ color: 'var(--color-text-secondary)' }}>No favourites yet</p>
            <p className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Star a note to add it here
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                active={note.id === activeNote?.id}
                onClick={() => handleSelect(note.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
