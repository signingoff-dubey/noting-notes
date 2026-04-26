import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useNotesStore } from '@/store/notesStore'
import { toast } from '@/store/uiStore'

export function TagChips({ note }) {
  const [adding, setAdding] = useState(false)
  const [input, setInput] = useState('')
  const updateNote = useNotesStore(s => s.updateNote)

  const addTag = async (tag) => {
    const trimmed = tag.trim().toLowerCase()
    if (!trimmed || note.tags?.includes(trimmed)) return
    const tags = [...(note.tags || []), trimmed]
    try {
      await updateNote(note.id, { tags })
    } catch {
      toast.error('Failed to add tag')
    }
  }

  const removeTag = async (tag) => {
    const tags = (note.tags || []).filter(t => t !== tag)
    try {
      await updateNote(note.id, { tags })
    } catch {
      toast.error('Failed to remove tag')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
      setInput('')
    }
    if (e.key === 'Escape') {
      setAdding(false)
      setInput('')
    }
  }

  return (
    <div className="flex items-center flex-wrap gap-1.5">
      {(note.tags || []).map(tag => (
        <span
          key={tag}
          className="group flex items-center gap-1 h-5 px-2 border border-border rounded-sm font-mono text-xs text-text-secondary hover:border-border-strong hover:text-text-primary transition-colors"
        >
          {tag}
          <button
            onClick={() => removeTag(tag)}
            className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-text-secondary transition-opacity"
          >
            <X size={10} strokeWidth={1.5} />
          </button>
        </span>
      ))}
      {adding ? (
        <input
          autoFocus
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (!input.trim()) setAdding(false) }}
          placeholder="tag name"
          className="h-5 px-2 bg-surface-2 border border-border rounded-sm font-mono text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong w-24"
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 h-5 px-2 border border-dashed border-border rounded-sm font-mono text-xs text-text-muted hover:border-border-strong hover:text-text-secondary transition-colors"
        >
          <Plus size={10} strokeWidth={1.5} />
          Add tag
        </button>
      )}
    </div>
  )
}
