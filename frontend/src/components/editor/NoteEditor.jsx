import { useEffect, useRef, useCallback, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItemBase from '@tiptap/extension-task-item'

/* Custom TaskItem: preserves cursor position when checkbox is clicked */
const TaskItem = TaskItemBase.extend({
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('customTaskItemPlugin'),
        props: {
          handleClick(view, pos, event) {
            if (!(event.target instanceof HTMLInputElement) || event.target.type !== 'checkbox') return false
            if (!view.editable) return false

            const { state } = view
            const savedSelection = state.selection

            // Walk up from click pos to find the taskItem node
            const safePos = Math.min(Math.max(pos, 0), state.doc.content.size - 1)
            const $pos = state.doc.resolve(safePos)
            let taskItemPos = -1
            let taskItemNode = null
            for (let d = $pos.depth; d >= 0; d--) {
              const n = $pos.node(d)
              if (n.type.name === 'taskItem') {
                taskItemPos = $pos.before(d)
                taskItemNode = n
                break
              }
            }

            // Fallback: check via DOM container
            if (taskItemPos === -1) {
              const container = event.target.closest?.('[data-type="taskItem"]')
              if (container) {
                const isChecked = container.getAttribute('data-checked') === 'true'
                const resolvedPos = state.doc.resolve(Math.min(pos, state.doc.content.size - 1))
                const nodeAtBefore = state.doc.nodeAt(resolvedPos.before())
                if (nodeAtBefore?.type.name === 'taskItem') {
                  taskItemPos = resolvedPos.before()
                  taskItemNode = nodeAtBefore
                }
              }
            }

            if (taskItemPos === -1 || !taskItemNode) return false

            const tr = state.tr.setNodeMarkup(taskItemPos, undefined, {
              ...taskItemNode.attrs,
              checked: !taskItemNode.attrs.checked,
            })
            // Restore cursor position
            try { tr.setSelection(savedSelection.map(tr.doc, tr.mapping)) } catch (_) {}
            view.dispatch(tr)
            return true
          },
        },
      }),
    ]
  },
})
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
import { ArrowLeft, Lock, Unlock } from 'lucide-react'
import { useNotesStore } from '@/store/notesStore'
import { useAIStore } from '@/store/aiStore'
import { useVaultStore } from '@/store/vaultStore'
import { toast } from '@/store/uiStore'
import { EditorToolbar } from './EditorToolbar'
import { FloatingToolbar } from './FloatingToolbar'
import { TagChips } from '@/components/notes/TagChips'
import { format } from 'date-fns'

const lowlight = createLowlight(common)

const AutoCapitalize = Extension.create({
  name: 'autoCapitalize',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('autoCapitalize'),
        appendTransaction(transactions, _oldState, newState) {
          if (!transactions.some(tr => tr.docChanged)) return null
          const { $from } = newState.selection
          if ($from.parentOffset !== 1) return null
          const parent = $from.parent
          if (!['paragraph', 'heading'].includes(parent.type.name)) return null
          const firstChild = parent.firstChild
          if (!firstChild || firstChild.type.name !== 'text') return null
          const text = firstChild.text || ''
          if (!text.length) return null
          const first = text[0]
          const upper = first.toUpperCase()
          if (first === upper) return null
          const tr = newState.tr
          tr.replaceWith($from.start(), $from.start() + 1, newState.schema.text(upper))
          return tr
        },
      }),
    ]
  },
})

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
  const { isUnlocked: vaultUnlocked } = useVaultStore()
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
      AutoCapitalize,
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

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full">
        <p style={{ color: 'var(--color-text-muted)' }}>Loading note...</p>
      </div>
    )
  }

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

        {/* Vault lock button */}
        <button
          onClick={async () => {
            if (note.is_vault) {
              await updateNote(note.id, { is_vault: false })
              toast.info('Removed from vault')
            } else if (!vaultUnlocked) {
              toast.error('Unlock vault first to move notes into it')
            } else {
              await updateNote(note.id, { is_vault: true })
              toast.success('Note moved to vault')
            }
          }}
          title={note.is_vault ? 'Remove from vault' : 'Move to vault'}
          className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
          style={{
            color: note.is_vault ? 'var(--color-accent)' : 'var(--color-text-muted)',
            background: note.is_vault ? 'var(--color-accent-dim)' : 'transparent',
          }}
          onMouseEnter={e => { if (!note.is_vault) e.currentTarget.style.color = 'var(--color-text-secondary)' }}
          onMouseLeave={e => { if (!note.is_vault) e.currentTarget.style.color = 'var(--color-text-muted)' }}
        >
          {note.is_vault
            ? <Unlock size={14} strokeWidth={1.5} />
            : <Lock size={14} strokeWidth={1.5} />
          }
        </button>
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
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        accept="image/*,.pdf,.docx,.xlsx,.pptx,.txt,.csv"
        onChange={async (e) => {
          const files = Array.from(e.target.files || [])
          if (!files.length) return
          for (const file of files) {
            if (file.type.startsWith('image/')) {
              const reader = new FileReader()
              reader.onload = (ev) => {
                if (ev.target?.result && editor) {
                  editor.chain().focus().setImage({ src: ev.target.result }).run()
                }
              }
              reader.readAsDataURL(file)
            } else {
              toast.error('File attachments coming soon — images only for now')
            }
          }
          e.target.value = ''
        }}
      />

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
