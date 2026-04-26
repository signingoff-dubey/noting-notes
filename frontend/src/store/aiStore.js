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

function loadMemory(noteId) {
  if (!noteId) return []
  try {
    return JSON.parse(localStorage.getItem(`ink_ai_memory_${noteId}`) || '[]')
  } catch { return [] }
}

function saveMemory(noteId, messages) {
  if (!noteId) return
  try {
    localStorage.setItem(`ink_ai_memory_${noteId}`, JSON.stringify(messages))
  } catch {}
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

  sendMessage: (content, noteContent = '', images = []) => {
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

    const systemPrompt = noteContent
      ? `You are a helpful AI assistant for a notes app. The user is working on a note:\n\n${noteContent}`
      : 'You are a helpful AI assistant for a notes app called INK.'

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
              set({ streamingMessage: accumulated })
            }
          } catch {}
        }
      }

      const aiMsg = { role: 'assistant', content: accumulated, timestamp: new Date().toISOString() }
      const finalMessages = [...newMessages, aiMsg]
      set({ messages: finalMessages, isStreaming: false, streamingMessage: '' })
      if (contextNoteId) saveMemory(contextNoteId, finalMessages)
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
