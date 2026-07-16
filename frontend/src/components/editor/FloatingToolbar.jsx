import { useState, useRef } from 'react'
import { BubbleMenu } from '@tiptap/react'
import { Bold, Italic, Underline, Strikethrough, Highlighter, Code, Link, Zap, AlignLeft, MessageSquare, RefreshCw, Loader2, Check, Languages } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAIStore } from '@/store/aiStore'
import { api } from '@/lib/api'
import { toast } from '@/store/uiStore'

async function backendOnce(prompt) {
  return new Promise((resolve, reject) => {
    let full = ''
    const { activeModel } = useAIStore.getState()
    const cleanup = api.ai.chatStream(
      { model: activeModel, message: prompt, note_content: '', note_id: null },
      (token) => { full += token },
      () => resolve(full),
      (err) => reject(err),
    )
  })
}

function FloatBtn({ onClick, active, title, children, ai, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={loading}
      className={cn(
        'flex items-center justify-center gap-1 h-full px-2 font-mono text-xs transition-colors duration-[100ms]',
        'text-text-secondary hover:text-text-primary',
        active && 'text-accent',
        ai && 'bg-accent-dim hover:bg-surface-active',
        loading && 'opacity-50 cursor-wait',
      )}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-4 bg-border-strong mx-0.5 shrink-0" />
}

/* ── Inline result popover ── */
function ResultPanel({ mode, result, onInsert, onReplace, onClose }) {
  if (!result) return null
  const isRephrase = mode === 'rephrase'
  const variants = isRephrase ? result.split(/\n+/).filter(l => l.trim().match(/^\d+\.?\s+/)).map(l => l.replace(/^\d+\.?\s+/, '').trim()).filter(Boolean) : []
  const hasVariants = variants.length >= 2

  return (
    <div
      className="flex flex-col"
      style={{
        maxWidth: 400,
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
      }}
    >
      <div className="px-3 pt-2 pb-1 whitespace-normal" style={{ maxHeight: 200, overflowY: 'auto', minWidth: 280, maxWidth: 400 }}>
        {isRephrase && hasVariants ? (
          <div className="flex flex-col gap-1">
            {variants.map((v, i) => (
              <button
                key={i}
                onClick={() => onReplace(v)}
                className="text-left px-2 py-1.5 rounded font-mono transition-colors hover:bg-[var(--color-surface-hover)]"
                style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}
              >
                <span style={{ color: 'var(--color-text-muted)', marginRight: 6 }}>{i + 1}.</span>
                {v}
              </button>
            ))}
          </div>
        ) : (
          <p className="font-mono" style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            {isRephrase ? result : result}
          </p>
        )}
      </div>
      {!isRephrase && (
        <div className="flex items-center gap-1 px-2 pb-2">
          <button
            onClick={() => onInsert(result)}
            className="flex items-center gap-1 px-2 h-6 rounded font-mono transition-colors hover:bg-[var(--color-surface-hover)]"
            style={{ fontSize: 10, color: 'var(--color-accent)' }}
          >
            <Check size={10} strokeWidth={1.5} />
            Insert below
          </button>
          <button
            onClick={() => onReplace(result)}
            className="flex items-center gap-1 px-2 h-6 rounded font-mono transition-colors hover:bg-[var(--color-surface-hover)]"
            style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}
          >
            <RefreshCw size={10} strokeWidth={1.5} />
            Replace
          </button>
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="flex items-center justify-center w-5 h-5 rounded font-mono transition-colors hover:bg-[var(--color-surface-hover)]"
            style={{ fontSize: 11, color: 'var(--color-text-muted)' }}
          >
            ×
          </button>
        </div>
      )}
      {isRephrase && (
        <div className="flex justify-end px-2 pb-2">
          <button
            onClick={onClose}
            className="flex items-center justify-center w-5 h-5 rounded font-mono transition-colors hover:bg-[var(--color-surface-hover)]"
            style={{ fontSize: 11, color: 'var(--color-text-muted)' }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

export function FloatingToolbar({ editor }) {
  const { open: openAI } = useAIStore()
  const [aiMode, setAiMode] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const savedRange = useRef(null)
  const savedText = useRef('')

  if (!editor) return null

  const setLink = () => {
    const prev = editor.getAttributes('link').href
    const url = window.prompt('URL:', prev)
    if (url === null) return
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const getSelected = () => {
    const { from, to } = editor.state.selection
    const text = editor.state.doc.textBetween(from, to, ' ')
    return { from, to, text }
  }

  const handleExplain = () => {
    const { text } = getSelected()
    useAIStore.getState().sendMessage(`Explain this: "${text}"`)
    openAI()
  }

  const handleSummarize = async () => {
    const { from, to, text } = getSelected()
    if (!text.trim()) return
    savedRange.current = { from, to }
    savedText.current = text
    setAiMode('summarize')
    setAiLoading(true)
    setAiResult(null)
    try {
      const result = await backendOnce(`Summarize the following text in 2-4 concise bullet points. Return only the bullet points, no preamble:\n\n"${text}"`)
      setAiResult(result)
    } catch {
      toast.error('AI unavailable — check API key in Settings')
      setAiMode(null)
    } finally {
      setAiLoading(false)
    }
  }

  const handleRephrase = async () => {
    const { from, to, text } = getSelected()
    if (!text.trim()) return
    savedRange.current = { from, to }
    savedText.current = text
    setAiMode('rephrase')
    setAiLoading(true)
    setAiResult(null)
    try {
      const result = await backendOnce(`Rephrase the following text in exactly 3 different ways. Number each variant (1. 2. 3.). Return only the 3 numbered variants, nothing else:\n\n"${text}"`)
      setAiResult(result)
    } catch {
      toast.error('AI unavailable — check API key in Settings')
      setAiMode(null)
    } finally {
      setAiLoading(false)
    }
  }

  const handleTranslate = async (targetLang = null) => {
    const { from, to, text } = getSelected()
    if (!text.trim()) return
    const lang = targetLang || window.prompt('Translate to which language?', 'Spanish')
    if (!lang) return
    savedRange.current = { from, to }
    savedText.current = text
    setAiMode('translate')
    setAiLoading(true)
    setAiResult(null)
    try {
      const result = await backendOnce(`Translate the following text to ${lang}. Return ONLY the translated text, no explanations or preamble:\n\n"${text}"`)
      setAiResult(result)
    } catch {
      toast.error('AI unavailable — check API key in Settings')
      setAiMode(null)
    } finally {
      setAiLoading(false)
    }
  }

  const handleAskAI = () => {
    const { text } = getSelected()
    useAIStore.getState().sendMessage(`About this text: "${text}" — `)
    openAI()
  }

  const handleInsert = (content) => {
    if (savedRange.current) {
      editor.chain().focus().insertContentAt(savedRange.current.to, '\n' + content).run()
    }
    resetAI()
  }

  const handleReplace = (content) => {
    if (savedRange.current) {
      const { from, to } = savedRange.current
      editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, content).run()
    }
    resetAI()
  }

  const resetAI = () => {
    setAiMode(null)
    setAiResult(null)
    savedRange.current = null
    savedText.current = ''
  }

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 100,
        placement: 'top',
        maxWidth: 'none',
        onMount(instance) { instance.popper.firstChild.style.maxWidth = 'none' },
        onHide() { resetAI() },
      }}
      className="float-in"
    >
      <div
        className="flex flex-col border shadow-2xl overflow-hidden"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)', borderRadius: 8 }}
      >
        {/* Toolbar row */}
        <div className="flex items-center h-[34px] whitespace-nowrap">
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
          <FloatBtn
            ai
            title="Summarize with AI"
            onClick={handleSummarize}
            active={aiMode === 'summarize'}
            loading={aiLoading && aiMode === 'summarize'}
          >
            {aiLoading && aiMode === 'summarize'
              ? <Loader2 size={12} strokeWidth={1.5} className="animate-spin" />
              : <AlignLeft size={12} strokeWidth={1.5} />
            }
            <span>Summary</span>
          </FloatBtn>
          <FloatBtn
            ai
            title="Rephrase (3 variants)"
            onClick={handleRephrase}
            active={aiMode === 'rephrase'}
            loading={aiLoading && aiMode === 'rephrase'}
          >
            {aiLoading && aiMode === 'rephrase'
              ? <Loader2 size={12} strokeWidth={1.5} className="animate-spin" />
              : <RefreshCw size={12} strokeWidth={1.5} />
            }
            <span>Rephrase</span>
          </FloatBtn>
          <FloatBtn
            ai
            title="Translate"
            onClick={() => handleTranslate()}
            active={aiMode === 'translate'}
            loading={aiLoading && aiMode === 'translate'}
          >
            {aiLoading && aiMode === 'translate'
              ? <Loader2 size={12} strokeWidth={1.5} className="animate-spin" />
              : <Languages size={12} strokeWidth={1.5} />
            }
            <span>Translate</span>
          </FloatBtn>
          <FloatBtn ai title="Ask AI" onClick={handleAskAI}>
            <MessageSquare size={12} strokeWidth={1.5} />
            <span>Ask AI</span>
          </FloatBtn>
        </div>

        {/* Result panel */}
        {(aiResult || (aiLoading && aiMode)) && (
          <ResultPanel
            mode={aiMode}
            result={aiResult}
            onInsert={handleInsert}
            onReplace={handleReplace}
            onClose={resetAI}
          />
        )}
        {aiLoading && !aiResult && (
          <div className="flex items-center gap-2 px-3 py-2" style={{ borderTop: '1px solid var(--color-border)' }}>
            <Loader2 size={11} strokeWidth={1.5} className="animate-spin" style={{ color: 'var(--color-text-muted)' }} />
            <span className="font-mono" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
              {aiMode === 'summarize' ? 'Summarizing...' : aiMode === 'translate' ? 'Translating...' : 'Generating variants...'}
            </span>
          </div>
        )}
      </div>
    </BubbleMenu>
  )
}
