import { create } from 'zustand'
import { api } from '@/lib/api'

const DEFAULT_MODEL = 'llama-3.3-70b-versatile'

const GROQ_MODELS = [
  { id: 'llama-3.3-70b-versatile',                 name: 'Llama 3.3 70B' },
  { id: 'llama-3.1-8b-instant',                    name: 'Llama 3.1 8B (Fast)' },
  { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout 17B' },
  { id: 'qwen/qwen3-32b',                          name: 'Qwen 3 32B' },
  { id: 'qwen/qwen3.6-27b',                        name: 'Qwen 3.6 27B' },
  { id: 'groq/compound',                           name: 'Groq Compound' },
  { id: 'groq/compound-mini',                      name: 'Groq Compound Mini (Fast)' },
]

const WRITE_RE = /\[NOTEWRITE\]([\s\S]*?)\[\/NOTEWRITE\]/i
const REPLACE_RE = /\[NOTEREPLACE\]([\s\S]*?)\[\/NOTEREPLACE\]/i
const CLEAR_RE = /\[NOTECLEAR\]/i

function stripWriteTags(text) {
  return text
    .replace(WRITE_RE, '')
    .replace(REPLACE_RE, '')
    .replace(CLEAR_RE, '')
    .replace(/\n{3,}/g, '\n\n').trim()
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
  error: null,

  pendingNoteWrite: null,
  writeNoteCallback: null,
  replaceNoteCallback: null,
  clearNoteCallback: null,

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

  toggle: () => set(state => ({ isOpen: !state.isOpen })),
  open:   () => set({ isOpen: true }),
  close:  () => set({ isOpen: false }),

  setModel: (model) => set({ activeModel: model }),

  setContextNote: async (noteId) => {
    set({ contextNoteId: noteId, messages: [], error: null })
  },

  fetchModels: async () => {
    set({ models: GROQ_MODELS, ollamaAvailable: false, isLoadingModels: false })
  },

  sendMessage: (content, noteContent = '', images = [], userRequestedWrite = false) => {
    const { activeModel, contextNoteId, messages } = get()

    const model = activeModel

    const userMsg = {
      role: 'user',
      content: content,
      displayContent: content,
      images: images.length > 0 ? images : undefined,
      timestamp: new Date().toISOString(),
    }
    const newMessages = [...messages, userMsg]
    set({ messages: newMessages, isStreaming: true, streamingMessage: '' })

    let accumulated = ''

    const cleanup = api.ai.chatStream(
      {
        model,
        note_id: contextNoteId,
        message: content,
        note_content: noteContent,
      },
      (token) => {
        accumulated += token
        set({ streamingMessage: stripWriteTags(accumulated) })
      },
      () => {
        const displayContent = stripWriteTags(accumulated)
        const aiMsg = {
          role: 'assistant',
          content: displayContent,
          timestamp: new Date().toISOString(),
        }
        const finalMessages = [...newMessages, aiMsg]
        set({ messages: finalMessages, isStreaming: false, streamingMessage: '' })

        const { writeNoteCallback, replaceNoteCallback, clearNoteCallback } = get()

        const clearMatch = CLEAR_RE.test(accumulated)
        const replaceMatch = REPLACE_RE.exec(accumulated)
        const writeMatch = WRITE_RE.exec(accumulated)

        if (clearMatch && clearNoteCallback) {
          clearNoteCallback()
        } else if (replaceMatch) {
          const replaceContent = replaceMatch[1].trim()
          if (replaceContent && replaceNoteCallback) replaceNoteCallback(replaceContent)
        } else if (writeMatch) {
          const writeContent = writeMatch[1].trim()
          if (writeContent) {
            if (userRequestedWrite && writeNoteCallback) {
              writeNoteCallback(writeContent)
            } else if (!userRequestedWrite) {
              get().requestNoteWrite(writeContent)
            }
          }
        }
      },
      (err) => {
        set({ isStreaming: false, streamingMessage: '', error: err.message })
      }
    )

    return cleanup
  },

  clearMemory: async () => {
    const { contextNoteId } = get()
    if (contextNoteId) {
      try { await api.ai.clearMemory(contextNoteId) } catch {}
    }
    set({ messages: [] })
  },

  apiConfig: {},
  saveApiConfig: async (config) => {
    try {
      localStorage.setItem('ink_ai_config', JSON.stringify(config))
      set({ apiConfig: config })
      return true
    } catch { return false }
  },

  clearError: () => set({ error: null }),
}))
