import { useEffect, useRef, useCallback, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItemBase from '@tiptap/extension-task-item'
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
import { ArrowLeft, Lock, Unlock, Trash2, History, RotateCcw, Download, Upload, FileText, FileDown, Paperclip, X as XIcon, FolderOpen, Eye, EyeOff } from 'lucide-react'
import { FileViewer } from '@/components/viewer/FileViewer'
import { nanoid } from 'nanoid'
import { useNotesStore } from '@/store/notesStore'
import { useAIStore } from '@/store/aiStore'
import { useVaultStore } from '@/store/vaultStore'
import { useUIStore, toast } from '@/store/uiStore'
import { EditorToolbar } from './EditorToolbar'
import { FloatingToolbar } from './FloatingToolbar'
import { NoteLinkPreview } from './NoteLinkPreview'
import { createNoteLinkPlugin } from './NoteLinkExtension'
import { TagChips } from '@/components/notes/TagChips'
import { VoiceRecorder } from '@/components/media/VoiceRecorder'
import { MediaAttachments } from '@/components/media/MediaAttachments'
import { format } from 'date-fns'
import { cn } from '@/lib/cn'

const lowlight = createLowlight(common)

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

            if (taskItemPos === -1) {
              const container = event.target.closest?.('[data-type="taskItem"]')
              if (container) {
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
            try { tr.setSelection(savedSelection.map(tr.doc, tr.mapping)) } catch (_) {}
            view.dispatch(tr)
            return true
          },
        },
      }),
    ]
  },
})

const AutoCapitalize = Extension.create({
  name: 'autoCapitalize',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('autoCapitalize'),
        appendTransaction(transactions, _oldState, newState) {
          if (!transactions.some(tr => tr.docChanged)) return null
          const { $from } = newState.selection
          const parent = $from.parent
          if (!['paragraph', 'heading'].includes(parent.type.name)) return null

          // First char of block
          if ($from.parentOffset === 1) {
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
          }

          // After sentence-ending punctuation (". " / "! " / "? ")
          const textBefore = parent.textContent.slice(0, $from.parentOffset)
          if (textBefore.length >= 3) {
            const last3 = textBefore.slice(-3)
            const last2 = textBefore.slice(-2)
            const justTyped = textBefore.slice(-1)
            if (
              /[a-z]/.test(justTyped) &&
              (/[.!?] $/.test(last3) || /[.!?] $/.test(last2))
            ) {
              const pos = $from.pos - 1
              const upper = justTyped.toUpperCase()
              const tr = newState.tr
              tr.replaceWith(pos, pos + 1, newState.schema.text(upper))
              return tr
            }
          }

          return null
        },
      }),
    ]
  },
})

const AUTOCORRECT_MAP = {
  teh: 'the', hte: 'the', thier: 'their', recieve: 'receive',
  beleive: 'believe', definately: 'definitely', occured: 'occurred',
  seperate: 'separate', wierd: 'weird', alot: 'a lot',
  dont: "don't", cant: "can't", wont: "won't", didnt: "didn't",
  doesnt: "doesn't", isnt: "isn't", wasnt: "wasn't", shouldnt: "shouldn't",
  wouldnt: "wouldn't", couldnt: "couldn't",
}

const AutoCorrect = Extension.create({
  name: 'autoCorrect',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('autoCorrect'),
        appendTransaction(transactions, _oldState, newState) {
          if (!transactions.some(tr => tr.docChanged)) return null
          const { $from } = newState.selection
          const parent = $from.parent
          if (!parent.isTextblock) return null

          const textBefore = parent.textContent.slice(0, $from.parentOffset)
          const lastChar = textBefore.slice(-1)

          // Only trigger on space or common punctuation after a word
          if (lastChar !== ' ' && lastChar !== ',' && lastChar !== '.' && lastChar !== '!' && lastChar !== '?') return null

          const textBeforeTrigger = textBefore.slice(0, -1)
          const wordMatch = textBeforeTrigger.match(/(\S+)$/)
          if (!wordMatch) return null

          const word = wordMatch[1]
          // Strip trailing punctuation from word for lookup
          const clean = word.replace(/[.,!?]+$/, '').toLowerCase()

          // Standalone "i" → "I"
          if (clean === 'i' && !/[A-Z]/.test(word)) {
            const wordEnd = $from.pos - 1
            const wordStart = wordEnd - word.length
            const replacement = word.replace(/^i/, 'I')
            const tr = newState.tr
            tr.replaceWith(wordStart, wordEnd, newState.schema.text(replacement))
            return tr
          }

          // Common typo corrections
          const correction = AUTOCORRECT_MAP[clean]
          if (correction) {
            // Preserve leading caps if original word was capitalized
            const final = /^[A-Z]/.test(word)
              ? correction[0].toUpperCase() + correction.slice(1)
              : correction
            const wordEnd = $from.pos - 1
            const wordStart = wordEnd - word.length
            const tr = newState.tr
            tr.replaceWith(wordStart, wordEnd, newState.schema.text(final))
            return tr
          }

          return null
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

const NoteLinkHighlight = Extension.create({
  name: 'noteLinkHighlight',
  addProseMirrorPlugins() {
    const findNote = (title) => {
      const notes = useNotesStore.getState().notes
      const t = title.toLowerCase()
      return notes.find(n => !n.archived && (n.title || '').toLowerCase() === t)
    }
    return [createNoteLinkPlugin(findNote)]
  },
})

export function NoteEditor({ note, onBack }) {
  const updateNote = useNotesStore(s => s.updateNote)
  const deleteNote = useNotesStore(s => s.deleteNote)
  const getVersions = useNotesStore(s => s.getVersions)
  const restoreVersion = useNotesStore(s => s.restoreVersion)
  const createNote = useNotesStore(s => s.createNote)
  const folders = useNotesStore(s => s.folders)
  const isSaving = useNotesStore(s => s.isSaving)
  const setContextNote = useAIStore(s => s.setContextNote)
  const { isUnlocked: vaultUnlocked } = useVaultStore()
  const {
    editorFontSize, editorLineHeight, autosaveDelay,
    spellcheck, typewriterMode, focusMode,
  } = useUIStore(s => ({
    editorFontSize:   s.editorFontSize,
    editorLineHeight: s.editorLineHeight,
    autosaveDelay:    s.autosaveDelay,
    spellcheck:       s.spellcheck,
    typewriterMode:   s.typewriterMode,
    focusMode:        s.focusMode,
  }))
  const [title, setTitle] = useState(note?.title || '')
  const [lastSaved, setLastSaved] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [historyVersions, setHistoryVersions] = useState([])
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showMoveFolder, setShowMoveFolder] = useState(false)
  const [activeFileViewer, setActiveFileViewer] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const importRef = useRef(null)
  const autosaveTimer = useRef(null)
  const fileInputRef = useRef(null)
  const videoInputRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const editorRef = useRef(null)
  const titleRef = useRef(null)

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
      Highlight.configure({ multicolor: true }),
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
      AutoCorrect,
      NoteLinkHighlight,
    ],
    content: note?.content || '',
    editorProps: {
      attributes: {
        class: 'editor-content focus:outline-none',
        spellcheck: spellcheck ? 'true' : 'false',
      },
    },
    onUpdate: ({ editor }) => {
      triggerAutosave(editor.getJSON())
    },
  }, [note?.id])

  useEffect(() => {
    if (editor) {
      editor.view.dom.setAttribute('spellcheck', spellcheck ? 'true' : 'false')
    }
  }, [editor, spellcheck])

  /* Keep editorRef current so autosave timer always has the live editor instance */
  useEffect(() => { editorRef.current = editor }, [editor])

  /* Register AI note-manipulation callbacks */
  useEffect(() => {
    if (!editor) return

    const writeToNote = (content) => {
      const blocks = content.split(/\n\n+/).filter(b => b.trim())
      const nodes = blocks.map(block => ({
        type: 'paragraph',
        content: block.split('\n').filter(l => l).flatMap((line, i, arr) => [
          { type: 'text', text: line, marks: [{ type: 'highlight', attrs: { color: null } }] },
          ...(i < arr.length - 1 ? [{ type: 'hardBreak' }] : []),
        ]),
      }))
      editor.chain().focus().insertContentAt(editor.state.doc.content.size, nodes).run()
    }

    const replaceNote = (content) => {
      const blocks = content.split(/\n\n+/).filter(b => b.trim())
      const nodes = blocks.map(block => ({
        type: 'paragraph',
        content: block.split('\n').filter(l => l).flatMap((line, i, arr) => [
          { type: 'text', text: line },
          ...(i < arr.length - 1 ? [{ type: 'hardBreak' }] : []),
        ]),
      }))
      editor.chain().focus().setContent({ type: 'doc', content: nodes }).run()
    }

    const clearNote = () => {
      editor.chain().focus().clearContent().run()
    }

    const store = useAIStore.getState()
    store.registerWriteCallback(writeToNote)
    store.registerReplaceCallback(replaceNote)
    store.registerClearCallback(clearNote)
    return () => {
      const s = useAIStore.getState()
      s.registerWriteCallback(null)
      s.registerReplaceCallback(null)
      s.registerClearCallback(null)
    }
  }, [editor])

  /* Typewriter mode: keep cursor vertically centred */
  useEffect(() => {
    if (!editor || !typewriterMode) return
    const handler = () => {
      requestAnimationFrame(() => {
        try {
          const { from } = editor.state.selection
          const coords = editor.view.coordsAtPos(from)
          const container = scrollContainerRef.current
          if (!container) return
          const rect = container.getBoundingClientRect()
          const cursorY = coords.top - rect.top
          const target = rect.height / 2
          container.scrollTop += cursorY - target
        } catch {}
      })
    }
    editor.on('selectionUpdate', handler)
    // Run once immediately to centre cursor when mode is enabled
    handler()
    return () => editor.off('selectionUpdate', handler)
  }, [editor, typewriterMode])

  /* Focus mode: dim all blocks except the one with the cursor */
  useEffect(() => {
    if (!editor) return
    const dom = editor.view.dom
    const handler = () => {
      Array.from(dom.children).forEach(el => el.removeAttribute('data-is-focused'))
      if (!focusMode) return
      try {
        const { from } = editor.state.selection
        const $from = editor.state.doc.resolve(from)
        if ($from.depth < 1) return
        const el = editor.view.nodeDOM($from.before(1))
        if (el instanceof HTMLElement && el.parentElement === dom) {
          el.setAttribute('data-is-focused', 'true')
        }
      } catch {}
    }
    editor.on('selectionUpdate', handler)
    editor.on('focus', handler)
    // Apply immediately so mode activates without needing a click
    handler()
    return () => {
      editor.off('selectionUpdate', handler)
      editor.off('focus', handler)
      Array.from(dom.children).forEach(el => el.removeAttribute('data-is-focused'))
    }
  }, [editor, focusMode])

  const triggerAutosave = useCallback((content) => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(async () => {
      if (!note?.id) return
      try {
        await updateNote(note.id, { content, word_count: editorRef.current?.storage?.characterCount?.words() ?? 0 })
        setLastSaved(true)
      } catch {
        toast.error('Autosave failed')
      }
    }, autosaveDelay * 1000)
  }, [note?.id, updateNote, autosaveDelay])

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

  const exportMarkdown = () => {
    if (!editor) return
    const lines = []
    const doc = editor.getJSON()
    const nodeToMd = (node) => {
      if (!node) return ''
      if (node.type === 'text') {
        let t = node.text || ''
        if (node.marks) {
          const ms = node.marks.map(m => m.type)
          if (ms.includes('bold')) t = `**${t}**`
          if (ms.includes('italic')) t = `*${t}*`
          if (ms.includes('code')) t = `\`${t}\``
          if (ms.includes('strike')) t = `~~${t}~~`
        }
        return t
      }
      const children = () => (node.content || []).map(nodeToMd).join('')
      switch (node.type) {
        case 'heading': return `${'#'.repeat(node.attrs?.level || 1)} ${children()}\n`
        case 'paragraph': return `${children()}\n`
        case 'bulletList': return (node.content || []).map(li => `- ${(li.content || []).map(nodeToMd).join('')}`).join('\n') + '\n'
        case 'orderedList': return (node.content || []).map((li, i) => `${i+1}. ${(li.content || []).map(nodeToMd).join('')}`).join('\n') + '\n'
        case 'blockquote': return `> ${children()}\n`
        case 'codeBlock': return `\`\`\`\n${children()}\`\`\`\n`
        case 'horizontalRule': return `---\n`
        case 'hardBreak': return '\n'
        default: return children()
      }
    }
    const md = `# ${title || 'Untitled'}\n\n` + (doc.content || []).map(nodeToMd).join('\n')
    const blob = new Blob([md], { type: 'text/markdown' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `${title || 'untitled'}.md`; a.click()
  }

  const exportPlainText = () => {
    if (!editor) return
    const text = editor.state.doc.textContent
    const blob = new Blob([`${title || 'Untitled'}\n\n${text}`], { type: 'text/plain' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `${title || 'untitled'}.txt`; a.click()
  }

  const exportPDF = () => {
    window.print()
  }

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const imported = await createNote({ title: file.name.replace(/\.(md|txt)$/, ''), content: text })
    toast.success(`Imported "${imported.title}"`)
    e.target.value = ''
  }

  const handleVideoAttach = (e) => {
    const file = e.target.files?.[0]
    if (!file || !note?.id) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (!ev.target?.result) return
      const attachment = { id: nanoid(), name: file.name, type: 'video', dataUrl: ev.target.result }
      const existing = note.attachments || []
      updateNote(note.id, { attachments: [...existing, attachment] })
      toast.success(`Attached: ${file.name}`)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleVoiceSave = ({ dataUrl, duration, name }) => {
    if (!note?.id) return
    const attachment = { id: nanoid(), name, type: 'voice', dataUrl, duration }
    const existing = note.attachments || []
    updateNote(note.id, { attachments: [...existing, attachment] })
    setShowVoiceRecorder(false)
    toast.success('Voice note saved')
  }

  const handleRemoveMedia = (attachmentId) => {
    if (!note?.id) return
    const attachments = (note.attachments || []).filter(a => a.id !== attachmentId)
    updateNote(note.id, { attachments })
  }

  const handleEditorDrop = useCallback((e) => {
    const files = e.dataTransfer?.files
    if (!files?.length) return
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!imageFiles.length) return
    e.preventDefault()
    for (const file of imageFiles) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result && editor) {
          editor.chain().focus().setImage({ src: ev.target.result }).run()
        }
      }
      reader.readAsDataURL(file)
    }
  }, [editor])

  const wordCount = editor?.storage?.characterCount?.words() ?? 0
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
        >
          <FileText size={20} strokeWidth={1} style={{ color: 'var(--color-text-muted)' }} />
        </div>
        <p className="font-mono text-center" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          Select a note or create a new one
        </p>
        <div className="flex flex-col gap-1.5 items-center">
          {[
            { keys: 'Ctrl+N', label: 'New note' },
            { keys: 'Ctrl+F', label: 'Search notes' },
            { keys: 'Ctrl+Shift+F', label: 'Toggle focus mode' },
          ].map(item => (
            <div key={item.keys} className="flex items-center gap-2">
              <kbd
                className="font-mono px-1.5 py-0.5 rounded text-xs"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
              >
                {item.keys}
              </kbd>
              <span className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
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
          aria-label="Back to notes"
          className="transition-colors shrink-0 text-text-muted hover:text-text-secondary"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
        </button>
        <input
          ref={titleRef}
          value={title}
          onChange={handleTitleChange}
          onFocus={(e) => {
            if (!e.target.value || e.target.value === 'Untitled') {
              e.target.select()
            }
          }}
          placeholder="Untitled"
          className="flex-1 bg-transparent font-body outline-none font-medium"
          style={{
            fontSize: 'var(--text-xl)',
            color: 'var(--color-text-primary)',
          }}
        />
        <SaveStatus saving={isSaving} lastSaved={lastSaved} />

        {/* Markdown preview toggle */}
        <button
          onClick={() => setShowPreview(v => !v)}
          title={showPreview ? 'Back to editor' : 'Markdown preview'}
          aria-label={showPreview ? 'Back to editor' : 'Markdown preview'}
          className={cn(
            'w-7 h-7 flex items-center justify-center rounded-lg transition-all',
            showPreview ? 'text-accent bg-accent-dim' : 'text-text-muted hover:text-text-secondary',
          )}
        >
          {showPreview ? <EyeOff size={14} strokeWidth={1.5} /> : <Eye size={14} strokeWidth={1.5} />}
        </button>

        {/* Import button */}
        <button
          onClick={() => importRef.current?.click()}
          title="Import .md or .txt file"
          aria-label="Import file"
          className="w-7 h-7 flex items-center justify-center rounded-lg transition-all text-text-muted hover:text-text-secondary"
        >
          <Upload size={14} strokeWidth={1.5} />
        </button>
        <input ref={importRef} type="file" accept=".md,.txt" className="hidden" onChange={handleImport} />

        {/* Export button */}
        <div className="relative">
        <button
          onClick={() => setShowExportMenu(v => !v)}
          title="Export"
          aria-label="Export"
          className="w-7 h-7 flex items-center justify-center rounded-lg transition-all text-text-muted hover:text-text-secondary"
        >
          <Download size={14} strokeWidth={1.5} />
        </button>
          {showExportMenu && (
            <div
              className="absolute right-0 top-full mt-1 z-50 flex flex-col overflow-hidden rounded-lg"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 8px 24px var(--color-shadow)',
                minWidth: 160,
              }}
              onMouseLeave={() => setShowExportMenu(false)}
            >
              {[
                { label: 'Markdown (.md)', icon: <FileText size={12} strokeWidth={1.5} />, action: exportMarkdown },
                { label: 'Plain text (.txt)', icon: <FileText size={12} strokeWidth={1.5} />, action: exportPlainText },
                { label: 'Print / PDF', icon: <FileDown size={12} strokeWidth={1.5} />, action: exportPDF },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => { item.action(); setShowExportMenu(false) }}
                  className="flex items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-surface-hover"
                  style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Version history button */}
        <button
          onClick={() => { setHistoryVersions(getVersions(note.id)); setShowHistory(true) }}
          title="Version history"
          aria-label="Version history"
          className="w-7 h-7 flex items-center justify-center rounded-lg transition-all text-text-muted hover:text-text-secondary"
        >
          <History size={14} strokeWidth={1.5} />
        </button>

        {/* Move to folder */}
        <div className="relative">
          <button
            onClick={() => setShowMoveFolder(v => !v)}
            title="Move to folder"
            aria-label="Move to folder"
            className={cn(
              'w-7 h-7 flex items-center justify-center rounded-lg transition-all',
              note.folder_id ? 'text-accent' : 'text-text-muted hover:text-text-secondary',
            )}
          >
            <FolderOpen size={14} strokeWidth={1.5} />
          </button>
          {showMoveFolder && (
            <div
              className="dropdown-in absolute right-0 top-full mt-1 z-50 flex flex-col overflow-hidden rounded-lg py-1"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 8px 24px var(--color-shadow)',
                minWidth: 160,
              }}
              onMouseLeave={() => setShowMoveFolder(false)}
            >
              <button
                onClick={async () => { await updateNote(note.id, { folder_id: null }); setShowMoveFolder(false); toast.info('Removed from folder') }}
                className="flex items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-surface-hover"
                style={{ fontSize: 'var(--text-sm)', color: !note.folder_id ? 'var(--color-accent)' : 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}
              >
                No folder
              </button>
              {folders.map(f => (
                <button
                  key={f.id}
                  onClick={async () => { await updateNote(note.id, { folder_id: f.id }); setShowMoveFolder(false); toast.success(`Moved to "${f.name}"`) }}
                  className="flex items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-surface-hover"
                  style={{ fontSize: 'var(--text-sm)', color: note.folder_id === f.id ? 'var(--color-accent)' : 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}
                >
                  <FolderOpen size={11} strokeWidth={1.5} />
                  {f.name}
                </button>
              ))}
              {folders.length === 0 && (
                <p className="px-3 py-2 font-mono" style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-muted)' }}>
                  Create folders in sidebar first
                </p>
              )}
            </div>
          )}
        </div>

        {/* Delete note button */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          title="Delete note"
          aria-label="Delete note"
          className="w-7 h-7 flex items-center justify-center rounded-lg transition-all text-text-muted hover:text-error"
        >
          <Trash2 size={14} strokeWidth={1.5} />
        </button>

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
          aria-label={note.is_vault ? 'Remove from vault' : 'Move to vault'}
          className={cn(
            'w-7 h-7 flex items-center justify-center rounded-lg transition-all',
            note.is_vault ? 'text-accent bg-accent-dim' : 'text-text-muted hover:text-text-secondary',
          )}
        >
          {note.is_vault
            ? <Unlock size={14} strokeWidth={1.5} />
            : <Lock size={14} strokeWidth={1.5} />
          }
        </button>
      </div>

      {/* ── Tags + Attachments ── */}
      <div
        className="flex items-center gap-2 px-6 py-2 border-b shrink-0 flex-wrap"
        style={{ borderColor: 'var(--color-border)', minHeight: 40 }}
      >
        <TagChips note={note} />
        {(note.attachments || []).filter(a => a.type !== 'video' && a.type !== 'voice').map(att => (
          <button
            key={att.id}
            onClick={() => setActiveFileViewer(att)}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors hover:bg-surface-hover group"
            style={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-body)',
              maxWidth: 180,
            }}
          >
            <Paperclip size={10} strokeWidth={1.5} style={{ flexShrink: 0 }} />
            <span className="truncate">{att.name}</span>
            <span
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 flex items-center justify-center rounded-sm hover:bg-surface-hover"
              style={{ flexShrink: 0 }}
              onClick={async (e) => {
                e.stopPropagation()
                const attachments = (note.attachments || []).filter(a => a.id !== att.id)
                await updateNote(note.id, { attachments })
                if (activeFileViewer?.id === att.id) setActiveFileViewer(null)
              }}
            >
              <XIcon size={9} strokeWidth={1.5} />
            </span>
          </button>
        ))}
      </div>

      {/* ── Toolbar ── */}
      {!showPreview && (
        <EditorToolbar
          editor={editor}
          onAttach={() => fileInputRef.current?.click()}
          onAttachVideo={() => videoInputRef.current?.click()}
          onVoiceNote={() => setShowVoiceRecorder(v => !v)}
        />
      )}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        accept="image/*,.pdf,.docx,.xlsx,.pptx,.txt,.csv,audio/*"
        onChange={async (e) => {
          const files = Array.from(e.target.files || [])
          if (!files.length) return
          for (const file of files) {
            const reader = new FileReader()
            reader.onload = async (ev) => {
              const dataUrl = ev.target?.result
              if (!dataUrl) return
              if (file.type.startsWith('image/')) {
                editor?.chain().focus().setImage({ src: dataUrl }).run()
              } else {
                const attType = file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'voice' : file.type
                const attachment = { id: nanoid(), name: file.name, type: attType, dataUrl }
                const existing = note.attachments || []
                await updateNote(note.id, { attachments: [...existing, attachment] })
                toast.success(`Attached: ${file.name}`)
              }
            }
            reader.readAsDataURL(file)
          }
          e.target.value = ''
        }}
      />
      <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoAttach} />

      {/* ── Voice Recorder ── */}
      {showVoiceRecorder && (
        <div className="px-6 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <VoiceRecorder
            onSave={handleVoiceSave}
            onCancel={() => setShowVoiceRecorder(false)}
          />
        </div>
      )}

      {/* ── Media Attachments ── */}
      <MediaAttachments attachments={note.attachments} onRemove={handleRemoveMedia} />

      {/* ── Editor + File Viewer ── */}
      <div className="flex flex-1 min-h-0">
        <div
          ref={scrollContainerRef}
          className={`flex-1 overflow-y-auto min-h-0${focusMode ? ' focus-mode' : ''}`}
          onDragOver={(e) => { if (e.dataTransfer?.types.includes('Files')) e.preventDefault() }}
          onDrop={handleEditorDrop}
          style={{
            '--editor-font-size': `${editorFontSize}px`,
            '--editor-line-height': editorLineHeight,
          }}
        >
          {showPreview && (
            <div
              className="prose-preview editor-content"
              style={{
                maxWidth: 720,
                margin: '0 auto',
                padding: '32px 40px 80px',
                fontSize: `${editorFontSize}px`,
                lineHeight: editorLineHeight,
                color: 'var(--color-text-primary)',
              }}
              dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '' }}
            />
          )}
          <div style={{ display: showPreview ? 'none' : undefined }}>
            {editor && <FloatingToolbar editor={editor} />}
            <EditorContent
              editor={editor}
              style={{
                maxWidth: 720,
                margin: '0 auto',
                padding: '32px 40px 80px',
              }}
            />
            <NoteLinkPreview editorContainer={scrollContainerRef} />
          </div>
        </div>
        {activeFileViewer && (
          <FileViewer
            attachment={activeFileViewer}
            onClose={() => setActiveFileViewer(null)}
          />
        )}
      </div>

      {/* ── Version history drawer ── */}
      {showHistory && (
        <div
          className="fixed inset-0 z-50 flex"
          style={{ background: 'var(--color-overlay)' }}
          onClick={() => setShowHistory(false)}
        >
          <div
            className="ml-auto flex flex-col"
            style={{
              width: 320,
              height: '100%',
              background: 'var(--color-surface)',
              borderLeft: '1px solid var(--color-border)',
              boxShadow: '-16px 0 48px var(--color-shadow)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div
              className="flex items-center gap-2 px-4 border-b shrink-0"
              style={{ height: 48, borderColor: 'var(--color-border)' }}
            >
              <History size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)' }} />
              <span className="flex-1 font-mono uppercase tracking-widest" style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-muted)' }}>
                Version History
              </span>
              <button
                onClick={() => setShowHistory(false)}
                className="w-6 h-6 flex items-center justify-center rounded-md transition-colors hover:bg-surface-hover"
                style={{ color: 'var(--color-text-muted)' }}
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 p-3 flex flex-col gap-2">
              {historyVersions.length === 0 ? (
                <div className="flex items-center justify-center h-20">
                  <p className="font-mono text-center" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    No snapshots yet.<br />Autosave creates one every 2s.
                  </p>
                </div>
              ) : historyVersions.map((v, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-mono truncate" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                      {v.title || 'Untitled'}
                    </div>
                    <div className="font-mono" style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-muted)' }}>
                      {format(new Date(v.ts), 'MMM d, h:mm:ss a')}
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      await restoreVersion(note.id, v.content)
                      editor?.commands.setContent(v.content || '')
                      toast.success('Version restored')
                      setShowHistory(false)
                    }}
                    title="Restore this version"
                    className="w-7 h-7 flex items-center justify-center rounded-md transition-colors hover:bg-surface-hover shrink-0"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    <RotateCcw size={12} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
            <div
              className="px-4 py-3 border-t shrink-0"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <p className="font-mono" style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-muted)' }}>
                Last 10 autosave snapshots stored locally.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ── */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'var(--color-overlay)' }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
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
              <span className="font-mono font-medium" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                Delete this note?
              </span>
            </div>
            <p className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              "{title || 'Untitled'}" will be permanently deleted. Cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 h-7 rounded-md font-mono transition-colors hover:bg-surface-hover"
                style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteNote(note.id)
                    toast.success('Note deleted')
                    onBack()
                  } catch {
                    toast.error('Failed to delete note')
                  }
                  setShowDeleteConfirm(false)
                }}
                className="px-3 h-7 rounded-md font-mono transition-colors"
                style={{ fontSize: 'var(--text-sm)', background: 'var(--color-error, #ef4444)', color: 'var(--color-bg)', border: 'none' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
