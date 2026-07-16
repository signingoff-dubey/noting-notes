import {
  Bold, Italic, Underline, Strikethrough, Highlighter, Code, List, ListOrdered,
  CheckSquare, Quote, Minus, Table, Link, Image, Paperclip, Heading1, Heading2, Heading3,
} from 'lucide-react'
import { cn } from '@/lib/cn'

function ToolBtn({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'flex items-center justify-center w-7 h-7 transition-colors duration-[100ms]',
        'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
        active && 'bg-surface-active text-accent',
        disabled && 'opacity-30 cursor-not-allowed',
      )}
      style={{ borderRadius: 2 }}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-border mx-1 shrink-0" />
}

export function EditorToolbar({ editor, onAttach }) {
  if (!editor) return null

  const setLink = () => {
    const prev = editor.getAttributes('link').href
    const url = window.prompt('URL:', prev)
    if (url === null) return
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  return (
    <div className="flex items-center gap-0.5 px-2 h-10 border-b border-border bg-surface sticky top-0 z-10 overflow-x-auto scrollbar-hide shrink-0 flex-wrap">
      {/* Headings */}
      <ToolBtn title="Heading 1 (Ctrl+1)" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}>
        <Heading1 size={14} strokeWidth={1.5} />
      </ToolBtn>
      <ToolBtn title="Heading 2 (Ctrl+2)" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
        <Heading2 size={14} strokeWidth={1.5} />
      </ToolBtn>
      <ToolBtn title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
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
      <ToolBtn title="Code block (Ctrl+Shift+C)" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')}>
        <span className="font-mono text-xs">{'<>'}</span>
      </ToolBtn>
      <ToolBtn title="Horizontal divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus size={14} strokeWidth={1.5} />
      </ToolBtn>
      <ToolBtn title="Table" onClick={insertTable}>
        <Table size={14} strokeWidth={1.5} />
      </ToolBtn>

      <Divider />

      {/* Links & media */}
      <ToolBtn title="Link" onClick={setLink} active={editor.isActive('link')}>
        <Link size={14} strokeWidth={1.5} />
      </ToolBtn>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Attach */}
      {onAttach && (
        <ToolBtn title="Attach file" onClick={onAttach}>
          <Paperclip size={14} strokeWidth={1.5} />
        </ToolBtn>
      )}
    </div>
  )
}
