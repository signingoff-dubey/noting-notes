import { create } from 'zustand'
import { api } from '@/lib/api'

export const useAIStore = create((set, get) => ({
  isOpen: false,
  activeModel: 'mistral:7b-instruct-q4_K_M',
  contextNoteId: null,
  messages: [],
  isStreaming: false,
  streamingMessage: '',
  models: [],
  isLoadingModels: false,
  error: null,

  toggle: () => set(state => ({ isOpen: !state.isOpen })),
  open:   () => set({ isOpen: true }),
  close:  () => set({ isOpen: false }),

  setModel: (model) => set({ activeModel: model }),

  setContextNote: async (noteId) => {
    if (noteId === get().contextNoteId) return
    set({ contextNoteId: noteId, messages: [] })
    if (noteId) {
      try {
        const memory = await api.ai.memory(noteId)
        set({ messages: memory.messages || [] })
      } catch {}
    }
  },

  fetchModels: async () => {
    set({ isLoadingModels: true })
    try {
      const data = await api.ai.models()
      set({ models: data.models || [], isLoadingModels: false })
    } catch {
      set({ isLoadingModels: false })
    }
  },

  sendMessage: (content, noteContent = '') => {
    const { activeModel, contextNoteId, messages } = get()
    const userMsg = { role: 'user', content, timestamp: new Date().toISOString() }
    set(state => ({
      messages: [...state.messages, userMsg],
      isStreaming: true,
      streamingMessage: '',
    }))

    let accumulated = ''
    const cancelStream = api.ai.chatStream(
      { model: activeModel, note_id: contextNoteId, message: content, note_content: noteContent },
      (token) => {
        accumulated += token
        set({ streamingMessage: accumulated })
      },
      () => {
        const aiMsg = { role: 'assistant', content: accumulated, timestamp: new Date().toISOString() }
        set(state => ({
          messages: [...state.messages, aiMsg],
          isStreaming: false,
          streamingMessage: '',
        }))
      },
      (err) => {
        set({ isStreaming: false, streamingMessage: '', error: err.message })
      }
    )
    return cancelStream
  },

  clearMemory: async () => {
    const { contextNoteId } = get()
    if (!contextNoteId) return
    try {
      await api.ai.clearMemory(contextNoteId)
      set({ messages: [] })
    } catch (err) {
      set({ error: err.message })
    }
  },

  clearError: () => set({ error: null }),
}))
