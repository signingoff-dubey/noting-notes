import { useEffect, useState } from 'react'
import { Tag, X, ArrowLeft } from 'lucide-react'
import { useNotesStore } from '@/store/notesStore'
import { NoteCard } from '@/components/notes/NoteCard'
import { NoteEditor } from '@/components/editor/NoteEditor'
import { toast } from '@/store/uiStore'

export function TagsView() {
  const fetchNotes    = useNotesStore(s => s.fetchNotes)
  const notes         = useNotesStore(s => s.notes)
  const setActiveNote = useNotesStore(s => s.setActiveNote)
  const activeNote    = useNotesStore(s => s.activeNote)
  const [selectedTag, setSelectedTag] = useState(null)

  useEffect(() => { fetchNotes() }, [])

  // Build tag → count map
  const tagMap = {}
  notes.filter(n => !n.archived).forEach(n => {
    ;(n.tags || []).forEach(tag => {
      tagMap[tag] = (tagMap[tag] || 0) + 1
    })
  })
  const tags = Object.entries(tagMap).sort((a, b) => b[1] - a[1])

  const filteredNotes = selectedTag
    ? notes.filter(n => !n.archived && (n.tags || []).includes(selectedTag))
    : []

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
        {selectedTag ? (
          <>
            <button
              onClick={() => { setSelectedTag(null); setActiveNote(null) }}
              style={{ color: 'var(--color-text-muted)' }}
              className="transition-colors"
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
            >
              <ArrowLeft size={15} strokeWidth={1.5} />
            </button>
            <Tag size={13} strokeWidth={1.5} style={{ color: 'var(--color-accent)' }} />
            <h2 className="font-mono" style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
              {selectedTag}
            </h2>
            <span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              · {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
            </span>
          </>
        ) : (
          <>
            <Tag size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)' }} />
            <h2 className="font-mono" style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
              All Tags
            </h2>
            <span className="font-mono ml-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              · {tags.length} tags
            </span>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-4">
        {/* Tag cards */}
        {!selectedTag && (
          tags.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Tag size={28} strokeWidth={1} style={{ color: 'var(--color-text-muted)' }} />
              <p className="font-mono text-sm" style={{ color: 'var(--color-text-secondary)' }}>No tags yet</p>
              <p className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                Add tags to your notes to see them here
              </p>
            </div>
          ) : (
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
              {tags.map(([tag, count]) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className="ink-card flex flex-col items-start gap-2 p-3 cursor-pointer transition-colors"
                  style={{ minHeight: 80 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--color-surface)'}
                >
                  <span
                    className="font-mono px-2 py-1"
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-accent)',
                      background: 'var(--color-accent-dim)',
                      borderRadius: 6,
                    }}
                  >
                    # {tag}
                  </span>
                  <span className="font-mono mt-auto" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    {count} {count === 1 ? 'note' : 'notes'}
                  </span>
                </button>
              ))}
            </div>
          )
        )}

        {/* Filtered notes for selected tag — grid */}
        {selectedTag && (
          filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <p className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>No notes with this tag</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredNotes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  grid
                  active={note.id === activeNote?.id}
                  onClick={() => handleSelect(note.id)}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
