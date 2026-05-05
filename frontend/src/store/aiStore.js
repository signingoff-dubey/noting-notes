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
const REPLACE_RE = /\[NOTEREPLACE\]([\s\S]*?)\[\/NOTEREPLACE\]/i
const CLEAR_RE = /\[NOTECLEAR\]/i

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

/* Strip all action tags from text shown in chat */
function stripWriteTags(text) {
  return text
    .replace(WRITE_RE, '')
    .replace(REPLACE_RE, '')
    .replace(CLEAR_RE, '')
    .replace(/\n{3,}/g, '\n\n').trim()
}

function buildSystemPrompt(noteContent) {
  const noteSection = noteContent
    ? `\n\nThe user is working on this note:\n${noteContent}`
    : ''

  return `You are a helpful AI assistant inside a notes app called INK.${noteSection}

CRITICAL RULES:
- When the user sends greetings, casual messages, or questions NOT about modifying the note — respond normally. Do NOT mention the note, do NOT offer to edit it, do NOT ask permission.
- NEVER proactively offer to "add or modify content". Only act when explicitly told to.
- Only use action tags below when the user EXPLICITLY asks you to change the note.

Note action tags (use ONLY when user asks):
- Append content: ${WRITE_OPEN}text to add${WRITE_CLOSE}
- Replace entire note: [NOTEREPLACE]full new content[/NOTEREPLACE]
- Delete/clear note: [NOTECLEAR]

Rules for note actions:
- Do NOT output raw JSON or TipTap format — plain text and markdown only
- When replacing: write the full improved content, not just a diff
- 1–2 sentence reply describing what you did, then the tag
- If no note context is set and user asks to modify note, tell them to select a note first`
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

  /* ── Note manipulation callbacks (registered by NoteEditor) ── */
  pendingNoteWrite: null,
  writeNoteCallback: null,    // append content
  replaceNoteCallback: null,  // replace entire content
  clearNoteCallback: null,    // clear entire content

  registerWriteCallback: (cb) => set({ writeNoteCallback: cb }),
  registerReplaceCallback: (cb) => set({ replaceNoteCallback: cb }),
  registerClearCallback: (cb) => set({ clearNoteCallback: cb }),

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
    const chatHistory = newMessages.slice(-10).map(m => ({ role: m.role, content: m.content }))

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
        max_tokens: 1024,
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

      const displayContent = stripWriteTags(accumulated)

      const aiMsg = {
        role: 'assistant',
        content: displayContent,
        timestamp: new Date().toISOString(),
      }
      const finalMessages = [...newMessages, aiMsg]
      set({ messages: finalMessages, isStreaming: false, streamingMessage: '' })
      if (contextNoteId) saveMemory(contextNoteId, finalMessages)

      /* Execute note actions directly — no permission popup needed, user asked for it */
      const { writeNoteCallback, replaceNoteCallback, clearNoteCallback } = get()

      const clearMatch = CLEAR_RE.test(accumulated)
      const replaceMatch = REPLACE_RE.exec(accumulated)
      const writeMatch = WRITE_RE.exec(accumulated)

      if (clearMatch && clearNoteCallback) {
        clearNoteCallback()
      } else if (replaceMatch) {
        const content = replaceMatch[1].trim()
        if (content && replaceNoteCallback) replaceNoteCallback(content)
      } else if (writeMatch) {
        const content = writeMatch[1].trim()
        if (content) {
          if (userRequestedWrite && writeNoteCallback) {
            writeNoteCallback(content)
          } else if (!userRequestedWrite) {
            /* AI proactively put NOTEWRITE but user didn't ask — show permission popup */
            get().requestNoteWrite(content)
          }
        }
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
