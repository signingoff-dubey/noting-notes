import { create } from 'zustand'

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || ''
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1'
const DEFAULT_MODEL = 'llama-3.3-70b-versatile'
const VISION_MODEL = 'llama-3.2-11b-vision-preview'

const GROQ_MODELS = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
  { id: 'llama-3.1-8b-instant',    name: 'Llama 3.1 8B (Fast)' },
  { id: 'mixtral-8x7b-32768',      name: 'Mixtral 8x7B' },
  { id: 'gemma2-9b-it',            name: 'Gemma 2 9B' },
  { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 70B' },
  { id: VISION_MODEL,              name: 'Llama 3.2 Vision 11B' },
]

/* Sentinel tags — model uses these when it wants to write into the note */
const WRITE_OPEN = '[NOTEWRITE]'
const WRITE_CLOSE = '[/NOTEWRITE]'
const WRITE_RE = /\[NOTEWRITE\]([\s\S]*?)\[\/NOTEWRITE\]/i

function loadMemory(noteId) {
  if (!noteId) return []
  try { return JSON.parse(localStorage.getItem(`ink_ai_memory_${noteId}`) || '[]') }
  catch { return [] }
}

function saveMemory(noteId, messages) {
  if (!noteId) return
  try { localStorage.setItem(`ink_ai_memory_${noteId}`, JSON.stringify(messages)) }
  catch {}
}

/* Strip NOTEWRITE tags from text shown in chat */
function stripWriteTags(text) {
  return text.replace(WRITE_RE, '').replace(/\n{3,}/g, '\n\n').trim()
}

function buildSystemPrompt(noteContent) {
  const writeInstructions = `
When the user asks you to add, write, insert, append, or modify content in their note:
- Reply naturally (1–2 sentences explaining what you're adding)
- Wrap ONLY the content to insert inside ${WRITE_OPEN}...${WRITE_CLOSE} tags
- Do NOT output raw JSON, TipTap document format, or code blocks unless the actual content is code
- Example: "Added a haiku to your note. ${WRITE_OPEN}Silent pond at dusk\nA frog leaps into the water\nRipples fade away${WRITE_CLOSE}"
- Never show internal document structures to the user`.trim()

  if (noteContent) {
    return `You are a helpful AI assistant inside a notes app called INK. The user is working on a note:

${noteContent}

${writeInstructions}`
  }
  return `You are a helpful AI assistant inside a notes app called INK.

${writeInstructions}

If the user asks to write to a note but no note context is set, tell them to select a note first.`
}

export const useAIStore = create((set, get) => ({
  isOpen: false,
  activeModel: DEFAULT_MODEL,
  contextNoteId: null,
  messages: [],
  isStreaming: false,
  streamingMessage: '',
  models: GROQ_MODELS,
  ollamaAvailable: false,
  isLoadingModels: false,
  apiConfig: {
    type: 'custom',
    base_url: GROQ_BASE_URL,
    api_key: GROQ_API_KEY,
    model: DEFAULT_MODEL,
  },
  error: null,

  /* ── Note-write permission ── */
  pendingNoteWrite: null,   // { content: string } | null
  writeNoteCallback: null,  // (content: string) => void — registered by NoteEditor

  registerWriteCallback: (cb) => set({ writeNoteCallback: cb }),

  requestNoteWrite: (content) => set({ pendingNoteWrite: { content } }),

  confirmNoteWrite: () => {
    const { pendingNoteWrite, writeNoteCallback } = get()
    if (pendingNoteWrite && writeNoteCallback) {
      writeNoteCallback(pendingNoteWrite.content)
    }
    set({ pendingNoteWrite: null })
  },

  denyNoteWrite: () => set({ pendingNoteWrite: null }),

  /* ── Core ── */
  toggle: () => set(state => ({ isOpen: !state.isOpen })),
  open:   () => set({ isOpen: true }),
  close:  () => set({ isOpen: false }),

  setModel: (model) => set(state => ({
    activeModel: model,
    apiConfig: { ...state.apiConfig, model },
  })),

  setContextNote: async (noteId) => {
    if (noteId === get().contextNoteId) return
    const messages = noteId ? loadMemory(noteId) : []
    set({ contextNoteId: noteId, messages, error: null })
  },

  fetchModels: async () => {
    set({ models: GROQ_MODELS, ollamaAvailable: false, isLoadingModels: false })
  },

  saveApiConfig: async (config) => {
    set({ apiConfig: config })
    return true
  },

  sendMessage: (content, noteContent = '', images = [], userRequestedWrite = false) => {
    const { activeModel, contextNoteId, messages, apiConfig } = get()

    const apiKey = apiConfig.api_key || GROQ_API_KEY
    const baseUrl = apiConfig.base_url || GROQ_BASE_URL
    const hasImages = images && images.length > 0
    const model = hasImages ? VISION_MODEL : (apiConfig.model || activeModel)

    const userMsg = {
      role: 'user',
      content: hasImages
        ? [
            ...images.map(url => ({ type: 'image_url', image_url: { url } })),
            { type: 'text', text: content },
          ]
        : content,
      displayContent: content,
      images: hasImages ? images : undefined,
      timestamp: new Date().toISOString(),
    }
    const newMessages = [...messages, userMsg]
    set({ messages: newMessages, isStreaming: true, streamingMessage: '' })

    const systemPrompt = buildSystemPrompt(noteContent)
    const chatHistory = newMessages.slice(-20).map(m => ({ role: m.role, content: m.content }))

    const ctrl = new AbortController()

    fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: systemPrompt }, ...chatHistory],
        stream: true,
        max_tokens: 2048,
      }),
      signal: ctrl.signal,
    })
    .then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error?.message || `AI request failed (${res.status})`)
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            const token = parsed.choices?.[0]?.delta?.content || ''
            if (token) {
              accumulated += token
              /* Stream the clean version to avoid showing tags in real-time */
              set({ streamingMessage: stripWriteTags(accumulated) })
            }
          } catch {}
        }
      }

      /* Check for NOTEWRITE marker in final response */
      const writeMatch = WRITE_RE.exec(accumulated)
      const displayContent = stripWriteTags(accumulated)

      const aiMsg = {
        role: 'assistant',
        content: displayContent,
        timestamp: new Date().toISOString(),
      }
      const finalMessages = [...newMessages, aiMsg]
      set({ messages: finalMessages, isStreaming: false, streamingMessage: '' })
      if (contextNoteId) saveMemory(contextNoteId, finalMessages)

      /* Trigger write-permission popup only if user explicitly requested it */
      if (writeMatch && userRequestedWrite) {
        const writeContent = writeMatch[1].trim()
        if (writeContent) get().requestNoteWrite(writeContent)
      }
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        set({ isStreaming: false, streamingMessage: '', error: err.message })
      }
    })

    return () => ctrl.abort()
  },

  clearMemory: async () => {
    const { contextNoteId } = get()
    if (contextNoteId) localStorage.removeItem(`ink_ai_memory_${contextNoteId}`)
    set({ messages: [] })
  },

  clearError: () => set({ error: null }),
}))
