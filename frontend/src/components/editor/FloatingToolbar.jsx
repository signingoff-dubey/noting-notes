import { BubbleMenu } from '@tiptap/react'
import { Bold, Italic, Underline, Strikethrough, Highlighter, Code, Link, Zap, AlignLeft, RefreshCw, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAIStore } from '@/store/aiStore'
import { toast } from '@/store/uiStore'
import { api } from '@/lib/api'

function FloatBtn({ onClick, active, title, children, ai }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'flex items-center justify-center gap-1 h-full px-2 font-mono text-xs transition-colors duration-[100ms]',
        'text-text-secondary hover:text-text-primary',
        active && 'text-accent',
        ai && 'bg-accent-dim hover:bg-surface-active',
      )}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-4 bg-border-strong mx-0.5 shrink-0" />
}

export function FloatingToolbar({ editor }) {
  const { open: openAI } = useAIStore()

  if (!editor) return null

  const setLink = () => {
    const prev = editor.getAttributes('link').href
    const url = window.prompt('URL:', prev)
    if (url === null) return
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const handleExplain = () => {
    const text = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      ' '
    )
    useAIStore.getState().sendMessage(`Explain this: "${text}"`)
    openAI()
  }

  const handleSummarize = async () => {
    const text = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      ' '
    )
    try {
      const res = await api.ai.summarize({ text })
      const { from } = editor.state.selection
      editor.chain().focus().insertContentAt(from, `\n\n**Summary:** ${res.summary}`).run()
      toast.success('Summary inserted')
    } catch {
      toast.error('Summarize failed')
    }
  }

  const handleAskAI = () => {
    const text = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      ' '
    )
    useAIStore.getState().sendMessage(`About this text: "${text}" — `)
    openAI()
  }

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100, placement: 'top' }}
      className="float-in"
    >
      <div className="flex items-center h-[34px] border overflow-hidden shadow-2xl" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)', borderRadius: 2 }}>
        {/* Formatting */}
        <FloatBtn title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          <Bold size={12} strokeWidth={1.5} />
        </FloatBtn>
        <FloatBtn title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          <Italic size={12} strokeWidth={1.5} />
        </FloatBtn>
        <FloatBtn title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}>
          <Underline size={12} strokeWidth={1.5} />
        </FloatBtn>
        <FloatBtn title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}>
          <Strikethrough size={12} strokeWidth={1.5} />
        </FloatBtn>
        <FloatBtn title="Highlight" onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')}>
          <Highlighter size={12} strokeWidth={1.5} />
        </FloatBtn>
        <FloatBtn title="Code" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')}>
          <Code size={12} strokeWidth={1.5} />
        </FloatBtn>
        <FloatBtn title="Link" onClick={setLink} active={editor.isActive('link')}>
          <Link size={12} strokeWidth={1.5} />
        </FloatBtn>

        <Divider />

        {/* AI actions */}
        <FloatBtn ai title="Explain with AI" onClick={handleExplain}>
          <Zap size={12} strokeWidth={1.5} />
          <span>Explain</span>
        </FloatBtn>
        <FloatBtn ai title="Summarize" onClick={handleSummarize}>
          <AlignLeft size={12} strokeWidth={1.5} />
          <span>Sum</span>
        </FloatBtn>
        <FloatBtn ai title="Ask AI" onClick={handleAskAI}>
          <MessageSquare size={12} strokeWidth={1.5} />
          <span>Ask</span>
        </FloatBtn>
      </div>
    </BubbleMenu>
  )
}
