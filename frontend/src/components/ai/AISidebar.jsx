import { useEffect, useRef, useState, useMemo } from 'react'
import {
  X, ChevronLeft, ChevronRight, Send, Sparkles, Trash2,
  FileText, ChevronDown, AlertTriangle, Download, Check,
  KeyRound, Server, Plus, ImagePlus, PenLine, ShieldCheck, ShieldX,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAIStore } from '@/store/aiStore'
import { useNotesStore } from '@/store/notesStore'
import { toast } from '@/store/uiStore'
import { Spinner } from '@/components/ui/Spinner'
import { Select } from '@/components/ui/Dropdown'
import { formatDistanceToNow } from 'date-fns'

// No Ollama catalog — models come from Groq (all pre-available)
const POPULAR_CATALOG = []

const WRITE_INTENT_RE = /\b(add|write|insert|append|put|delete|clear|remove|replace|rewrite|improve|make.{0,20}better|fix)\b/i

/* ── No LLM banner ── */
function NoLLMBanner({ onInstall, onAddKey }) {
  return (
    <div
      className="mx-3 mt-3 mb-1 flex items-center gap-3 px-3 py-2.5 rounded-lg"
      style={{
        background: 'var(--color-accent-dim)',
        border: '1px solid color-mix(in oklch, var(--color-accent) 25%, transparent)',
      }}
    >
      <AlertTriangle size={14} strokeWidth={1.5} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
      <div className="flex-1 min-w-0">
        <p className="font-mono font-medium" style={{ fontSize: 11, color: 'var(--color-accent)' }}>
          No LLM detected
        </p>
        <p className="font-mono" style={{ fontSize: 10, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
          Install Ollama and pull a model, or connect a cloud API key.
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onInstall}
          className="flex items-center gap-1 px-2 h-6 rounded-md font-mono transition-colors hover:opacity-80"
          style={{
            fontSize: 10,
            background: 'oklch(72% 0.17 65 / 0.15)',
            border: '1px solid oklch(72% 0.17 65 / 0.3)',
            color: 'var(--color-accent)',
          }}
        >
          <Server size={10} strokeWidth={1.5} />
          Install model
        </button>
        <button
          onClick={onAddKey}
          className="flex items-center gap-1 px-2 h-6 rounded-md font-mono transition-colors hover:opacity-80"
          style={{
            fontSize: 10,
            background: 'var(--color-accent)',
            color: 'var(--color-bg)',
          }}
        >
          <KeyRound size={10} strokeWidth={1.5} />
          Add API key
        </button>
      </div>
    </div>
  )
}

/* ── Custom API modal ── */
function CustomAPIModal({ open, onClose, initial, onSave }) {
  const [baseUrl, setBaseUrl] = useState(initial?.base_url || 'https://api.openai.com/v1')
  const [apiKey, setApiKey] = useState(initial?.api_key || '')
  const [model, setModel] = useState(initial?.model || 'gpt-4o-mini')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setBaseUrl(initial?.base_url || 'https://api.openai.com/v1')
      setApiKey(initial?.api_key || '')
      setModel(initial?.model || 'gpt-4o-mini')
    }
  }, [open])

  if (!open) return null

  const handleSave = async () => {
    if (!apiKey.trim()) { toast.error('API key is required'); return }
    if (!model.trim()) { toast.error('Model name is required'); return }
    setSaving(true)
    const ok = await onSave({ type: 'custom', base_url: baseUrl, api_key: apiKey, model })
    setSaving(false)
    if (ok) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="flex flex-col rounded-xl"
        style={{
          width: 380,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-2">
            <KeyRound size={15} strokeWidth={1.5} style={{ color: 'var(--color-accent)' }} />
            <span className="font-medium" style={{ fontSize: 15, color: 'var(--color-text-primary)' }}>
              Custom API
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-surface-hover)]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 px-5 py-4">
          <p className="font-mono" style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            Connect any OpenAI-compatible API (OpenAI, Together, Groq, etc.)
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono" style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              Base URL
            </label>
            <input
              value={baseUrl}
              onChange={e => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="w-full px-3 py-2 rounded-lg font-mono"
              style={{
                fontSize: 12,
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                outline: 'none',
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono" style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 rounded-lg font-mono"
              style={{
                fontSize: 12,
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                outline: 'none',
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono" style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              Model name
            </label>
            <input
              value={model}
              onChange={e => setModel(e.target.value)}
              placeholder="gpt-4o-mini"
              className="w-full px-3 py-2 rounded-lg font-mono"
              style={{
                fontSize: 12,
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-2 px-5 py-4"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <button
            onClick={onClose}
            className="flex-1 h-9 rounded-lg font-mono transition-colors hover:bg-[var(--color-surface-hover)]"
            style={{ fontSize: 13, color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-9 rounded-lg font-mono font-medium transition-opacity disabled:opacity-50"
            style={{ fontSize: 13, background: 'var(--color-accent)', color: 'var(--color-bg)' }}
          >
            {saving ? 'Saving...' : 'Save & use'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Install Ollama modal ── */
function InstallOllamaModal({ open, onClose }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="flex flex-col rounded-xl"
        style={{
          width: 360,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        }}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-2">
            <Server size={15} strokeWidth={1.5} style={{ color: 'var(--color-accent)' }} />
            <span className="font-medium" style={{ fontSize: 15, color: 'var(--color-text-primary)' }}>
              Install a local model
            </span>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-surface-hover)]" style={{ color: 'var(--color-text-muted)' }}>
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex flex-col gap-3 px-5 py-4">
          <p className="font-mono" style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            1. Install Ollama from <span style={{ color: 'var(--color-accent)' }}>ollama.com</span>
          </p>
          <p className="font-mono" style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            2. Open a terminal and run one of these:
          </p>
          {['ollama pull mistral:7b', 'ollama pull llama3.2:3b', 'ollama pull qwen2.5-coder:7b'].map(cmd => (
            <div
              key={cmd}
              className="px-3 py-2 rounded-lg font-mono"
              style={{ fontSize: 11, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              {cmd}
            </div>
          ))}
          <p className="font-mono" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
            3. Restart NOTING — the model will appear automatically.
          </p>
        </div>
        <div className="px-5 py-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={onClose}
            className="w-full h-9 rounded-lg font-mono transition-colors hover:bg-[var(--color-surface-hover)]"
            style={{ fontSize: 13, color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Model dropdown ── */
function ModelDropdown({ models, activeModel, apiConfig, onSelectModel, onCustomAPI }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const installedIds = new Set(models.map(m => m.id))
  const notInstalled = POPULAR_CATALOG.filter(m => !installedIds.has(m.id))

  const isCustomActive = apiConfig.type === 'custom' && apiConfig.api_key
  const displayLabel = apiConfig.model || activeModel || 'Select model'

  return (
    <div ref={ref} className="relative w-full min-w-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 w-full px-2.5 h-7 rounded-md transition-colors hover:bg-[var(--color-surface-hover)]"
        style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-secondary)',
          outline: 'none',
        }}
      >
        {isCustomActive
          ? <KeyRound size={11} strokeWidth={1.5} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
          : <Sparkles size={11} strokeWidth={1.5} style={{ flexShrink: 0 }} />
        }
        <span className="flex-1 text-left truncate" style={{ fontSize: 11 }}>{displayLabel}</span>
        <ChevronDown size={10} strokeWidth={1.5} style={{ flexShrink: 0 }} />
      </button>

      {open && (
        <div
          className="absolute top-full mt-1 left-0 z-50 overflow-hidden"
          style={{
            width: 260,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          }}
        >
          {/* Cloud models (Groq) */}
          {models.length > 0 && (
            <>
              <div
                className="px-3 pt-2.5 pb-1 font-mono uppercase tracking-widest"
                style={{ fontSize: 9, color: 'var(--color-text-muted)', letterSpacing: '0.12em' }}
              >
                Cloud Models (Groq)
              </div>
              {models.map(m => {
                const selected = !isCustomActive && activeModel === m.id
                return (
                  <button
                    key={m.id}
                    onClick={() => { onSelectModel(m.id); setOpen(false) }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 transition-colors hover:bg-[var(--color-surface-hover)]"
                    style={{ outline: 'none' }}
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: selected ? 'var(--color-accent)' : 'var(--color-border)' }}
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <p style={{ fontSize: 12, color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}>
                        {m.id.split(':')[0].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </p>
                      <p className="font-mono truncate" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                        {m.id}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {m.size_label && (
                        <span
                          className="font-mono"
                          style={{
                            fontSize: 10,
                            color: 'var(--color-text-muted)',
                            background: 'var(--color-surface-2)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 4,
                            padding: '1px 5px',
                          }}
                        >
                          {m.size_label}
                        </span>
                      )}
                      {selected && <Check size={11} strokeWidth={2} style={{ color: 'var(--color-accent)' }} />}
                    </div>
                  </button>
                )
              })}
            </>
          )}

          {/* Catalog — not installed */}
          {notInstalled.length > 0 && (
            <>
              <div
                className="px-3 pt-2.5 pb-1 font-mono uppercase tracking-widest"
                style={{
                  fontSize: 9,
                  color: 'var(--color-text-muted)',
                  letterSpacing: '0.12em',
                  borderTop: models.length > 0 ? '1px solid var(--color-border)' : 'none',
                  marginTop: models.length > 0 ? 4 : 0,
                }}
              >
                {models.length > 0 ? 'More models' : 'Cloud Models (Groq)'}
              </div>
              {notInstalled.map(m => (
                <div
                  key={m.id}
                  className="flex items-center gap-2.5 w-full px-3 py-2"
                  style={{ opacity: 0.5 }}
                >
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--color-border)' }} />
                  <div className="flex-1 min-w-0 text-left">
                    <p style={{ fontSize: 12, color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}>
                      {m.name}
                    </p>
                    <p className="font-mono truncate" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                      {m.id}
                    </p>
                  </div>
                  <span
                    className="font-mono shrink-0 flex items-center gap-0.5"
                    style={{
                      fontSize: 10,
                      color: 'var(--color-text-muted)',
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 4,
                      padding: '1px 5px',
                    }}
                  >
                    <Download size={9} strokeWidth={1.5} />
                    {m.size}
                  </span>
                </div>
              ))}
            </>
          )}

          {/* Custom API option */}
          <div style={{ borderTop: '1px solid var(--color-border)', padding: '4px 0' }}>
            <button
              onClick={() => { onCustomAPI(); setOpen(false) }}
              className="flex items-center gap-2 w-full px-3 py-2 transition-colors hover:bg-[var(--color-surface-hover)]"
              style={{ outline: 'none' }}
            >
              <KeyRound
                size={12}
                strokeWidth={1.5}
                style={{ color: isCustomActive ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontFamily: 'var(--font-body)',
                  color: isCustomActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                }}
              >
                {isCustomActive ? `Custom API (${apiConfig.model})` : 'Custom API key...'}
              </span>
              {isCustomActive && (
                <Check size={11} strokeWidth={2} style={{ color: 'var(--color-accent)', marginLeft: 'auto' }} />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Chat bubble ── */
function ChatBubble({ msg, streaming, onAddToNote }) {
  const isUser = msg.role === 'user'
  const textContent = msg.displayContent || (typeof msg.content === 'string' ? msg.content : '')
  return (
    <div className={cn('flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
      {isUser && msg.images?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-end max-w-[85%]">
          {msg.images.map((url, i) => (
            <img key={i} src={url} alt="" className="h-20 w-auto rounded-sm object-cover" style={{ maxWidth: 120 }} />
          ))}
        </div>
      )}
      <div
        className={cn(
          'max-w-[85%] px-3 py-2 rounded-sm font-body text-sm leading-relaxed',
          isUser ? 'bg-accent-dim text-text-primary' : 'bg-transparent text-text-secondary',
          streaming && !isUser && 'streaming-cursor',
        )}
      >
        <p className="whitespace-pre-wrap">{textContent}</p>
      </div>
      <div className={cn('flex items-center gap-2 px-1', isUser ? 'flex-row-reverse' : 'flex-row')}>
        {msg.timestamp && (
          <span className="font-mono text-xs text-text-muted">
            {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
          </span>
        )}
        {!isUser && !streaming && onAddToNote && textContent && (
          <button
            onClick={() => onAddToNote(textContent)}
            title="Add this to current note"
            className="flex items-center gap-1 font-mono transition-opacity opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
            style={{ fontSize: 9, color: 'var(--color-text-muted)' }}
          >
            <PenLine size={9} strokeWidth={1.5} />
            add to note
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Quick actions ── */
function QuickActions({ onAction }) {
  const actions = [
    { label: 'Summarize note', prompt: 'Summarize this note in 3-5 bullet points.' },
    { label: 'Find action items', prompt: 'List all action items and tasks mentioned in this note.' },
    { label: 'Generate tags', prompt: 'Suggest 5 relevant tags for this note.' },
    { label: 'Improve writing', prompt: 'Review this note and suggest improvements to clarity and structure.' },
    { label: 'Brainstorm ideas', prompt: 'Based on this note, brainstorm 5 related ideas I could explore.' },
    { label: 'Convert to outline', prompt: 'Convert this note into a structured outline.' },
  ]
  return (
    <div className="flex flex-wrap gap-1.5 px-4 py-3 border-b border-border">
      {actions.map(a => (
        <button
          key={a.label}
          onClick={() => onAction(a.prompt)}
          className="h-6 px-2 bg-surface-2 border border-border rounded-sm font-mono text-xs text-text-secondary hover:bg-surface-hover hover:text-text-primary hover:border-border-strong transition-colors"
        >
          {a.label}
        </button>
      ))}
    </div>
  )
}

/* ── Main sidebar ── */
export function AISidebar() {
  const {
    isOpen, close, activeModel, setModel, contextNoteId,
    messages, isStreaming, streamingMessage, models, ollamaAvailable,
    fetchModels, sendMessage, clearMemory, error, clearError,
    apiConfig, saveApiConfig,
    pendingNoteWrite, confirmNoteWrite, denyNoteWrite, requestNoteWrite,
  } = useAIStore()
  const notes = useNotesStore(s => s.notes)
  const setContextNote = useAIStore(s => s.setContextNote)
  const [input, setInput] = useState('')
  const [attachedImages, setAttachedImages] = useState([])
  const [customAPIOpen, setCustomAPIOpen] = useState(false)
  const [installOpen, setInstallOpen] = useState(false)
  const messagesEndRef = useRef(null)
  const imageInputRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => { if (isOpen) fetchModels() }, [isOpen, fetchModels])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages?.length, streamingMessage])

  useEffect(() => {
    if (error) { toast.error(error); clearError() }
  }, [error])

  const handleImageAttach = (e) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setAttachedImages(prev => [...prev, ev.target.result])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeImage = (index) => {
    setAttachedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleAddToNote = (content) => {
    if (!contextNoteId) {
      toast.error('Select a note first to add content to it')
      return
    }
    requestNoteWrite(content)
  }

  const handleSend = () => {
    const msg = input.trim()
    if ((!msg && attachedImages.length === 0) || isStreaming) return
    setInput('')
    const images = [...attachedImages]
    setAttachedImages([])
    const note = notes.find(n => n.id === contextNoteId)
    const noteContent = note
      ? `Note title: ${note.title}\n\nNote content: ${typeof note.content === 'string' ? note.content : JSON.stringify(note.content)}`
      : ''
    const userRequestedWrite = WRITE_INTENT_RE.test(msg)
    sendMessage(msg || 'What do you see in this image?', noteContent, images, userRequestedWrite)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleClear = async () => {
    await clearMemory()
    toast.info('Conversation cleared')
  }

  const handleSaveConfig = async (config) => {
    const ok = await saveApiConfig(config)
    if (ok) {
      toast.success('API configured')
      fetchModels()
    }
    return ok
  }

  const noteOptions = useMemo(() => [
    { value: '', label: 'No context' },
    ...notes.map(n => ({ value: n.id, label: n.title || 'Untitled' })),
  ], [notes])
  const contextNote = notes.find(n => n.id === contextNoteId)

  const noLLM = models.length === 0

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={isOpen ? close : () => useAIStore.getState().open()}
        className={cn(
          'fixed top-1/2 -translate-y-1/2 z-40 flex items-center justify-center w-6 h-16',
          'bg-surface border border-border rounded-l-sm transition-all duration-[250ms]',
          'text-text-muted hover:text-text-secondary hover:bg-surface-hover',
          isOpen ? 'right-[340px]' : 'right-0',
        )}
      >
        {isOpen ? <ChevronRight size={12} strokeWidth={1.5} /> : <ChevronLeft size={12} strokeWidth={1.5} />}
      </button>

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed top-0 right-0 h-full z-30 flex flex-col',
          'bg-surface border-l border-border',
          'transition-transform duration-[250ms] ease',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        style={{ width: 'var(--ai-sidebar-width)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 h-12 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={14} strokeWidth={1.5} className="text-text-secondary" />
            <span className="font-mono text-sm text-text-primary">AI Assistant</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleClear}
              title="Clear conversation"
              className="p-1.5 text-text-muted hover:text-text-secondary transition-colors rounded-sm hover:bg-surface-hover"
            >
              <Trash2 size={13} strokeWidth={1.5} />
            </button>
            <button
              onClick={close}
              className="p-1.5 text-text-muted hover:text-text-secondary transition-colors rounded-sm hover:bg-surface-hover"
            >
              <X size={13} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* No LLM banner */}
        {noLLM && (
          <NoLLMBanner
            onInstall={() => setInstallOpen(true)}
            onAddKey={() => setCustomAPIOpen(true)}
          />
        )}

        {/* Model + Context selectors */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border shrink-0">
          <div className="flex-1 min-w-0">
            <ModelDropdown
              models={models}
              activeModel={activeModel}
              apiConfig={apiConfig}
              onSelectModel={(id) => { setModel(id) }}
              onCustomAPI={() => setCustomAPIOpen(true)}
            />
          </div>
          <div className="flex-1 min-w-0">
            <Select
              value={contextNoteId || ''}
              onChange={(v) => setContextNote(v || null)}
              options={noteOptions}
              placeholder="No context"
              className="w-full"
            />
          </div>
        </div>

        {/* Quick actions */}
        <QuickActions onAction={(prompt) => setInput(prompt)} />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 min-h-0">
          {messages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <Sparkles size={24} strokeWidth={1} className="text-text-muted" />
              <p className="font-mono text-xs text-text-muted">
                {contextNote
                  ? `Chatting about: ${contextNote.title}`
                  : 'Select a note for context, or ask anything'}
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className="group">
              <ChatBubble msg={msg} onAddToNote={handleAddToNote} />
            </div>
          ))}
          {isStreaming && streamingMessage && (
            <ChatBubble msg={{ role: 'assistant', content: streamingMessage }} streaming />
          )}
          {isStreaming && !streamingMessage && (
            <div className="flex items-center gap-2 text-text-muted">
              <Spinner size="sm" />
              <span className="font-mono text-xs">Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Context indicator */}
        {contextNote && (
          <div className="flex items-center gap-2 px-3 py-1.5 border-t border-border bg-surface-2 shrink-0">
            <FileText size={11} strokeWidth={1.5} className="text-text-muted shrink-0" />
            <span className="font-mono text-xs text-text-muted truncate">{contextNote.title || 'Untitled'}</span>
          </div>
        )}

        {/* ── Write-permission popup ── */}
        {pendingNoteWrite && (
          <div
            className="mx-3 mb-2 rounded-lg overflow-hidden shrink-0"
            style={{
              border: '1px solid var(--color-accent)',
              background: 'var(--color-accent-dim)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-2 px-3 py-2"
              style={{ borderBottom: '1px solid var(--color-accent)33' }}
            >
              <PenLine size={12} strokeWidth={1.5} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
              <span
                className="font-mono font-medium flex-1"
                style={{ fontSize: 11, color: 'var(--color-accent)' }}
              >
                AI wants to write to your note
              </span>
            </div>
            {/* Preview */}
            <div className="px-3 py-2">
              <p
                className="font-mono line-clamp-4 whitespace-pre-wrap"
                style={{
                  fontSize: 10,
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                  maxHeight: 80,
                  overflow: 'hidden',
                }}
              >
                {pendingNoteWrite.content}
              </p>
            </div>
            {/* Actions */}
            <div
              className="flex items-center gap-2 px-3 pb-2.5"
            >
              <button
                onClick={() => { denyNoteWrite(); toast.info('Write denied') }}
                className="flex items-center gap-1.5 px-3 h-7 rounded-md font-mono transition-colors hover:opacity-80"
                style={{
                  fontSize: 11,
                  color: 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                }}
              >
                <ShieldX size={11} strokeWidth={1.5} />
                Deny
              </button>
              <button
                onClick={() => { confirmNoteWrite(); toast.success('Added to note') }}
                className="flex items-center gap-1.5 px-3 h-7 rounded-md font-mono font-medium transition-colors hover:opacity-90"
                style={{
                  fontSize: 11,
                  background: 'var(--color-accent)',
                  color: 'var(--color-bg)',
                }}
              >
                <ShieldCheck size={11} strokeWidth={1.5} />
                Allow
              </button>
            </div>
          </div>
        )}

        {/* Image previews */}
        {attachedImages.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-3 pt-2 border-t border-border shrink-0">
            {attachedImages.map((url, i) => (
              <div key={i} className="relative group">
                <img src={url} alt="" className="h-14 w-auto rounded-sm object-cover" style={{ maxWidth: 80 }} />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-surface border border-border rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <X size={8} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex items-end gap-2 px-3 py-3 border-t border-border shrink-0">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageAttach}
          />
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={isStreaming}
            title="Attach image"
            className={cn(
              'flex items-center justify-center w-7 h-7 rounded-sm transition-colors',
              'hover:bg-[var(--color-surface-hover)]',
              isStreaming && 'opacity-40 cursor-not-allowed',
            )}
            style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}
          >
            <ImagePlus size={13} strokeWidth={1.5} />
          </button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            rows={1}
            disabled={isStreaming}
            className={cn(
              'flex-1 resize-none bg-surface-2 border border-border rounded-sm px-3 py-2',
              'font-body text-sm text-text-primary placeholder:text-text-muted',
              'outline-none focus:border-border-strong transition-colors',
              'max-h-24 overflow-y-auto',
              isStreaming && 'opacity-50',
            )}
            style={{ minHeight: '36px' }}
          />
          <button
            onClick={handleSend}
            disabled={(!input.trim() && attachedImages.length === 0) || isStreaming}
            className={cn(
              'flex items-center justify-center w-7 h-7 bg-accent text-bg rounded-sm',
              'transition-all duration-[150ms]',
              ((!input.trim() && attachedImages.length === 0) || isStreaming) ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-85',
            )}
          >
            {isStreaming ? <Spinner size="sm" /> : <Send size={13} strokeWidth={1.5} />}
          </button>
        </div>
      </aside>

      {/* Modals */}
      <CustomAPIModal
        open={customAPIOpen}
        onClose={() => setCustomAPIOpen(false)}
        initial={apiConfig}
        onSave={handleSaveConfig}
      />
      <InstallOllamaModal
        open={installOpen}
        onClose={() => setInstallOpen(false)}
      />
    </>
  )
}
