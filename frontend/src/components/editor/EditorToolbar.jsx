import { useState, useRef, useEffect } from 'react'
import {
  Bold, Italic, Underline, Strikethrough, Highlighter, Code, List, ListOrdered,
  CheckSquare, Quote, Minus, Table, Link, Image, Paperclip, Heading1, Heading2, Heading3,
  X, Upload, Globe, Undo2, Redo2, Loader2, Video, Mic,
} from 'lucide-react'
import { cn } from '@/lib/cn'

function ToolBtn({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={title}
      aria-pressed={active}
      className={cn(
        'flex items-center justify-center w-11 h-11 transition-colors duration-[100ms] shrink-0',
        'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
        active && 'bg-surface-active text-accent',
        disabled && 'opacity-30 cursor-not-allowed',
      )}
      style={{ borderRadius: 5 }}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div role="separator" className="w-px h-5 bg-border mx-0.5 shrink-0" />
}

/* ── Table grid picker ── */
function TablePicker({ onInsert, onClose }) {
  const [hovered, setHovered] = useState({ rows: 0, cols: 0 })
  const MAX = 8
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute top-full right-0 mt-1 z-50 p-3 rounded-lg shadow-2xl"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-strong)' }}
    >
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${MAX}, 1fr)` }}
        onMouseLeave={() => setHovered({ rows: 0, cols: 0 })}
      >
        {Array.from({ length: MAX * MAX }, (_, i) => {
          const row = Math.floor(i / MAX) + 1
          const col = (i % MAX) + 1
          const active = row <= hovered.rows && col <= hovered.cols
          return (
            <div
              key={i}
              onMouseEnter={() => setHovered({ rows: row, cols: col })}
              onClick={() => {
                if (hovered.rows > 0 && hovered.cols > 0) {
                  onInsert(hovered.rows, hovered.cols)
                  onClose()
                }
              }}
              className="w-5 h-5 rounded-sm cursor-pointer transition-all"
              style={{
                border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: active ? 'var(--color-accent-dim)' : 'transparent',
              }}
            />
          )
        })}
      </div>
      <p
        className="text-center font-mono mt-2"
        style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-muted)' }}
      >
        {hovered.rows > 0 ? `${hovered.rows} × ${hovered.cols} table` : 'Hover to select size'}
      </p>
    </div>
  )
}

/* ── Link modal ── */
function LinkModal({ open, initialUrl, onSet, onRemove, onClose }) {
  const [url, setUrl] = useState(initialUrl || '')

  useEffect(() => {
    if (open) setUrl(initialUrl || '')
  }, [open, initialUrl])

  if (!open) return null

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && url.trim()) { onSet(url.trim()); onClose() }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'var(--color-overlay)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="flex flex-col rounded-xl overflow-hidden"
        style={{
          width: 380,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 24px 80px var(--color-shadow)',
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <span className="font-medium" style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
            {initialUrl ? 'Edit Link' : 'Add Link'}
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-surface-hover"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>
        <div className="px-5 py-5 flex flex-col gap-3">
          <input
            autoFocus
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com"
            className="w-full px-3 py-2 rounded-lg font-mono"
            style={{
              fontSize: 'var(--text-sm)',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              outline: 'none',
            }}
          />
          <div className="flex gap-2">
            {initialUrl && (
              <button
                onClick={() => { onRemove(); onClose() }}
                className="flex-1 h-9 rounded-lg font-mono font-medium transition-opacity"
                style={{ fontSize: 'var(--text-sm)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
              >
                Remove
              </button>
            )}
            <button
              onClick={() => { if (url.trim()) onSet(url.trim()); onClose() }}
              disabled={!url.trim()}
              className="flex-1 h-9 rounded-lg font-mono font-medium transition-opacity disabled:opacity-40"
              style={{ fontSize: 'var(--text-sm)', background: 'var(--color-accent)', color: 'var(--color-bg)' }}
            >
              {initialUrl ? 'Update' : 'Insert'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Image modal ── */
function ImageModal({ open, onInsertUrl, onInsertFile, onClose }) {
  const [tab, setTab] = useState('url')
  const [url, setUrl] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    if (open) { setUrl(''); setTab('url') }
  }, [open])

  if (!open) return null

  const handleUrl = () => {
    if (!url.trim()) return
    onInsertUrl(url.trim())
    onClose()
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    onInsertFile(file)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'var(--color-overlay)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="flex flex-col rounded-xl overflow-hidden"
        style={{
          width: 380,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 24px 80px var(--color-shadow)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <span className="font-medium" style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
            Insert Image
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-surface-hover"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex"
          style={{ borderBottom: '1px solid var(--color-border)', padding: '0 20px' }}
        >
          {[
            { key: 'url', icon: <Globe size={12} strokeWidth={1.5} />, label: 'From URL' },
            { key: 'upload', icon: <Upload size={12} strokeWidth={1.5} />, label: 'From Device' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-3 py-3 font-mono transition-colors"
                style={{
                  fontSize: 'var(--text-xs)',
                  color: tab === t.key ? 'var(--color-accent)' : 'var(--color-text-muted)',
                borderBottom: tab === t.key ? '2px solid var(--color-accent)' : '2px solid transparent',
                marginBottom: -1,
                outline: 'none',
                background: 'none',
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          {tab === 'url' ? (
            <div className="flex flex-col gap-3">
              <input
                autoFocus
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleUrl() }}
                placeholder="https://example.com/image.png"
                className="w-full px-3 py-2 rounded-lg font-mono"
                style={{
                  fontSize: 'var(--text-sm)',
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleUrl}
                disabled={!url.trim()}
                className="h-9 rounded-lg font-mono font-medium transition-opacity disabled:opacity-40"
                style={{ fontSize: 'var(--text-sm)', background: 'var(--color-accent)', color: 'var(--color-bg)' }}
              >
                Insert
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 h-28 rounded-lg border-dashed transition-colors hover:bg-surface-hover"
                style={{ border: '2px dashed var(--color-border)' }}
              >
                <Upload size={22} strokeWidth={1} style={{ color: 'var(--color-text-muted)' }} />
<span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    Click to choose image from device
                </span>
              </button>
              <p className="font-mono text-center" style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-muted)' }}>
                PNG, JPG, GIF, WebP supported
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function EditorToolbar({ editor, onAttach, onAttachVideo, onVoiceNote }) {
  const [tablePicker, setTablePicker] = useState(false)
  const [imageModal, setImageModal] = useState(false)
  const [linkModal, setLinkModal] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const tableRef = useRef(null)

  if (!editor) return null

  /* ── Heading: smart insert logic ── */
  const handleHeading = (level) => {
    const { empty } = editor.state.selection
    if (!empty) {
      // Text selected → apply heading to selection
      editor.chain().focus().setHeading({ level }).run()
      return
    }
    const { $from } = editor.state.selection
    const blockEmpty = $from.parent.textContent === ''
    if (blockEmpty) {
      editor.chain().focus().setHeading({ level }).run()
    } else {
      // Block has content → split and start new heading below
      editor.chain()
        .focus()
        .setTextSelection($from.end())
        .splitBlock()
        .setHeading({ level })
        .run()
    }
  }

  const setLink = () => {
    setLinkModal(true)
  }

  const handleSetLink = (url) => {
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const handleRemoveLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
  }

  const insertTable = (rows, cols) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
  }

  const insertImageUrl = (url) => {
    editor.chain().focus().setImage({ src: url }).run()
  }

  const insertImageFile = (file) => {
    setUploadingImage(true)
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (ev.target?.result) editor.chain().focus().setImage({ src: ev.target.result }).run()
      setUploadingImage(false)
    }
    reader.onerror = () => setUploadingImage(false)
    reader.readAsDataURL(file)
  }

  return (
    <>
      <div className="flex items-center gap-0.5 px-2 h-10 border-b border-border bg-surface sticky top-0 z-10 overflow-x-auto shrink-0">
        {/* Undo / Redo */}
        <ToolBtn title="Undo (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo2 size={14} strokeWidth={1.5} />
        </ToolBtn>
        <ToolBtn title="Redo (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo2 size={14} strokeWidth={1.5} />
        </ToolBtn>

        <Divider />

        {/* Headings */}
        <ToolBtn title="Heading 1" onClick={() => handleHeading(1)} active={editor.isActive('heading', { level: 1 })}>
          <Heading1 size={14} strokeWidth={1.5} />
        </ToolBtn>
        <ToolBtn title="Heading 2" onClick={() => handleHeading(2)} active={editor.isActive('heading', { level: 2 })}>
          <Heading2 size={14} strokeWidth={1.5} />
        </ToolBtn>
        <ToolBtn title="Heading 3" onClick={() => handleHeading(3)} active={editor.isActive('heading', { level: 3 })}>
          <Heading3 size={14} strokeWidth={1.5} />
        </ToolBtn>

        <Divider />

        {/* Formatting */}
        <ToolBtn title="Bold (Ctrl+B)" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          <Bold size={14} strokeWidth={1.5} />
        </ToolBtn>
        <ToolBtn title="Italic (Ctrl+I)" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          <Italic size={14} strokeWidth={1.5} />
        </ToolBtn>
        <ToolBtn title="Underline (Ctrl+U)" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}>
          <Underline size={14} strokeWidth={1.5} />
        </ToolBtn>
        <ToolBtn title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}>
          <Strikethrough size={14} strokeWidth={1.5} />
        </ToolBtn>
        <ToolBtn title="Highlight" onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')}>
          <Highlighter size={14} strokeWidth={1.5} />
        </ToolBtn>
        <ToolBtn title="Inline code" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')}>
          <Code size={14} strokeWidth={1.5} />
        </ToolBtn>

        <Divider />

        {/* Lists */}
        <ToolBtn title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
          <List size={14} strokeWidth={1.5} />
        </ToolBtn>
        <ToolBtn title="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
          <ListOrdered size={14} strokeWidth={1.5} />
        </ToolBtn>
        <ToolBtn title="Task list" onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')}>
          <CheckSquare size={14} strokeWidth={1.5} />
        </ToolBtn>

        <Divider />

        {/* Block elements */}
        <ToolBtn title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>
          <Quote size={14} strokeWidth={1.5} />
        </ToolBtn>
        <ToolBtn title="Code block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')}>
          <span className="font-mono text-xs shrink-0" style={{ fontSize: 'var(--text-xs)' }}>{'<>'}</span>
        </ToolBtn>
        <ToolBtn title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus size={14} strokeWidth={1.5} />
        </ToolBtn>

        {/* Table with picker */}
        <div ref={tableRef} className="relative">
          <ToolBtn title="Insert table" onClick={() => setTablePicker(v => !v)} active={tablePicker}>
            <Table size={14} strokeWidth={1.5} />
          </ToolBtn>
          {tablePicker && (
            <TablePicker
              onInsert={insertTable}
              onClose={() => setTablePicker(false)}
            />
          )}
        </div>

        <Divider />

        {/* Links & media */}
        <ToolBtn title="Link" onClick={setLink} active={editor.isActive('link')}>
          <Link size={14} strokeWidth={1.5} />
        </ToolBtn>
        <ToolBtn title="Insert image" onClick={() => setImageModal(true)} disabled={uploadingImage}>
          {uploadingImage ? <Loader2 size={14} strokeWidth={1.5} className="animate-spin" /> : <Image size={14} strokeWidth={1.5} />}
        </ToolBtn>
        <ToolBtn title="Attach video" onClick={onAttachVideo}>
          <Video size={14} strokeWidth={1.5} />
        </ToolBtn>
        <ToolBtn title="Record voice note" onClick={onVoiceNote}>
          <Mic size={14} strokeWidth={1.5} />
        </ToolBtn>

        <div className="flex-1 shrink-0 min-w-2" />

        {onAttach && (
          <ToolBtn title="Attach file" onClick={onAttach}>
            <Paperclip size={14} strokeWidth={1.5} />
          </ToolBtn>
        )}
      </div>

      <ImageModal
        open={imageModal}
        onInsertUrl={insertImageUrl}
        onInsertFile={insertImageFile}
        onClose={() => setImageModal(false)}
      />
      <LinkModal
        open={linkModal}
        initialUrl={editor.getAttributes('link').href || ''}
        onSet={handleSetLink}
        onRemove={handleRemoveLink}
        onClose={() => setLinkModal(false)}
      />
    </>
  )
}
