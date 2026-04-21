import { useEffect, useRef, useCallback, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { common, createLowlight } from 'lowlight'
import { ArrowLeft } from 'lucide-react'
import { useNotesStore } from '@/store/notesStore'
import { useAIStore } from '@/store/aiStore'
import { toast } from '@/store/uiStore'
import { EditorToolbar } from './EditorToolbar'
import { FloatingToolbar } from './FloatingToolbar'
import { TagChips } from '@/components/notes/TagChips'
import { format } from 'date-fns'

const lowlight = createLowlight(common)

const AUTOSAVE_DELAY = 2000

function SaveStatus({ saving, lastSaved }) {
  if (saving) return (
    <span className="flex items-center gap-1.5 font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
        style={{ background: 'var(--color-warning)' }}
      />
      Saving
    </span>
  )
  if (lastSaved) return (
    <span className="flex items-center gap-1.5 font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: 'var(--color-success)' }}
      />
      Saved
    </span>
  )
  return null
}

export function NoteEditor({ note, onBack }) {
  const updateNote = useNotesStore(s => s.updateNote)
  const isSaving = useNotesStore(s => s.isSaving)
  const setContextNote = useAIStore(s => s.setContextNote)
  const [title, setTitle] = useState(note?.title || '')
  const [lastSaved, setLastSaved] = useState(false)
  const autosaveTimer = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (note) {
      setTitle(note.title || '')
      setContextNote(note.id)
    }
    return () => setContextNote(null)
  }, [note?.id])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Highlight,
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({ lowlight }),
      Link.configure({ openOnClick: false }),
      Image,
      CharacterCount,
      Placeholder.configure({ placeholder: 'Start writing...' }),
    ],
    content: note?.content || '',
    editorProps: {
      attributes: { class: 'editor-content focus:outline-none' },
    },
    onUpdate: ({ editor }) => {
      triggerAutosave(editor.getJSON())
    },
  }, [note?.id])

  const triggerAutosave = useCallback((content) => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(async () => {
      if (!note?.id) return
      try {
        await updateNote(note.id, { content, word_count: editor?.storage?.characterCount?.words() ?? 0 })
        setLastSaved(true)
      } catch {
        toast.error('Autosave failed')
      }
    }, AUTOSAVE_DELAY)
  }, [note?.id, updateNote])

  const handleTitleChange = (e) => {
    const val = e.target.value
    setTitle(val)
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(async () => {
      if (!note?.id) return
      try {
        await updateNote(note.id, { title: val })
        setLastSaved(true)
      } catch {
        toast.error('Autosave failed')
      }
    }, AUTOSAVE_DELAY)
  }

  useEffect(() => () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current) }, [])

  const wordCount = editor?.storage?.characterCount?.words() ?? 0
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  if (!note) return null

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div
        className="flex items-center gap-3 px-6 shrink-0 border-b"
        style={{ height: 48, borderColor: 'var(--color-border)' }}
      >
        <button
          onClick={onBack}
          title="Back to notes (Esc)"
          className="transition-colors shrink-0"
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
        </button>
        <input
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled"
          className="flex-1 bg-transparent font-body outline-none font-medium"
          style={{
            fontSize: 'var(--text-xl)',
            color: 'var(--color-text-primary)',
          }}
        />
        <SaveStatus saving={isSaving} lastSaved={lastSaved} />
      </div>

      {/* ── Tags ── */}
      <div
        className="flex items-center gap-2 px-6 py-2 border-b shrink-0"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <TagChips note={note} />
      </div>

      {/* ── Toolbar ── */}
      <EditorToolbar editor={editor} onAttach={() => fileInputRef.current?.click()} />
      <input ref={fileInputRef} type="file" className="hidden" multiple />

      {/* ── Editor ── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {editor && <FloatingToolbar editor={editor} />}
        <EditorContent
          editor={editor}
          style={{
            maxWidth: 720,
            margin: '0 auto',
            padding: '32px 40px 80px',
          }}
        />
      </div>

      {/* ── Footer ── */}
      <div
        className="flex items-center gap-4 px-6 border-t shrink-0"
        style={{
          height: 32,
          borderColor: 'var(--color-border)',
          background: 'var(--color-surface)',
        }}
      >
        <span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {wordCount} words
        </span>
        <span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {readingTime} min read
        </span>
        <span className="flex-1" />
        {note.created_at && (
          <span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            {format(new Date(note.created_at), 'MMM d, yyyy')}
          </span>
        )}
        {note.updated_at && (
          <span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            · {format(new Date(note.updated_at), 'MMM d')}
          </span>
        )}
      </div>
    </div>
  )
}
