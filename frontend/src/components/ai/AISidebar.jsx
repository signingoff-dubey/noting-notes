import { useEffect, useRef, useState } from 'react'
import {
  X, ChevronLeft, ChevronRight, Send, Sparkles, Trash2, RefreshCw,
  FileText, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAIStore } from '@/store/aiStore'
import { useNotesStore } from '@/store/notesStore'
import { toast } from '@/store/uiStore'
import { Spinner } from '@/components/ui/Spinner'
import { Select } from '@/components/ui/Dropdown'
import { formatDistanceToNow } from 'date-fns'

function ChatBubble({ msg, streaming }) {
  const isUser = msg.role === 'user'
  return (
    <div className={cn('flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'max-w-[85%] px-3 py-2 rounded-sm font-body text-sm leading-relaxed',
          isUser
            ? 'bg-accent-dim text-text-primary'
            : 'bg-transparent text-text-secondary',
          streaming && !isUser && 'streaming-cursor',
        )}
      >
        <p className="whitespace-pre-wrap">{msg.content}</p>
      </div>
      {msg.timestamp && (
        <span className="font-mono text-xs text-text-muted px-1">
          {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
        </span>
      )}
    </div>
  )
}

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

export function AISidebar() {
  const { isOpen, close, activeModel, setModel, contextNoteId, messages, isStreaming, streamingMessage, models, fetchModels, sendMessage, clearMemory } = useAIStore()
  const notes = useNotesStore(s => s.notes)
  const setContextNote = useAIStore(s => s.setContextNote)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => { if (isOpen) fetchModels() }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingMessage])

  const handleSend = () => {
    const msg = input.trim()
    if (!msg || isStreaming) return
    setInput('')
    const note = notes.find(n => n.id === contextNoteId)
    const noteContent = note ? `Note title: ${note.title}\n\nNote content: ${typeof note.content === 'string' ? note.content : JSON.stringify(note.content)}` : ''
    sendMessage(msg, noteContent)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleClear = async () => {
    await clearMemory()
    toast.info('Conversation cleared')
  }

  const modelOptions = models.length
    ? models.map(m => ({ value: m, label: m }))
    : [{ value: activeModel, label: activeModel }]

  const noteOptions = [
    { value: '', label: 'No context' },
    ...notes.map(n => ({ value: n.id, label: n.title || 'Untitled' })),
  ]

  const contextNote = notes.find(n => n.id === contextNoteId)

  return (
    <>
      {/* ── Toggle button ── */}
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

      {/* ── Sidebar panel ── */}
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

        {/* Model + Context selectors */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border shrink-0">
          <Select
            value={activeModel}
            onChange={setModel}
            options={modelOptions}
            placeholder="Select model"
            className="flex-1"
          />
          <Select
            value={contextNoteId || ''}
            onChange={(v) => setContextNote(v || null)}
            options={noteOptions}
            placeholder="No context"
            className="flex-1"
          />
        </div>

        {/* Quick actions */}
        <QuickActions onAction={(prompt) => { setInput(prompt) }} />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 min-h-0">
          {messages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <Sparkles size={24} strokeWidth={1} className="text-text-muted" />
              <p className="font-mono text-xs text-text-muted">
                {contextNote ? `Chatting about: ${contextNote.title}` : 'Select a note for context, or ask anything'}
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <ChatBubble key={i} msg={msg} />
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

        {/* Input */}
        <div className="flex items-end gap-2 px-3 py-3 border-t border-border shrink-0">
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
            disabled={!input.trim() || isStreaming}
            className={cn(
              'flex items-center justify-center w-7 h-7 bg-accent text-bg rounded-sm',
              'transition-all duration-[150ms]',
              (!input.trim() || isStreaming) ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-85',
            )}
          >
            {isStreaming ? <Spinner size="sm" /> : <Send size={13} strokeWidth={1.5} />}
          </button>
        </div>
      </aside>
    </>
  )
}
