import { create } from 'zustand'
import { api } from '@/lib/api'

// Extract plain text from TipTap JSON content for search
function extractText(content) {
  if (!content) return ''
  if (typeof content === 'string') return content
  const texts = []
  const walk = (node) => {
    if (!node) return
    if (node.type === 'text' && node.text) texts.push(node.text)
    if (Array.isArray(node.content)) node.content.forEach(walk)
  }
  walk(content)
  return texts.join(' ')
}

export const useNotesStore = create((set, get) => ({
  notes: [],
  activeNote: null,
  folders: [],
  tags: [],
  activeFolderId: null,
  searchQuery: '',
  viewMode: localStorage.getItem('noted_view_mode') || 'list',
  isLoading: false,
  isSaving: false,
  error: null,

  fetchNotes: async () => {
    set({ isLoading: true, error: null })
    try {
      const notes = await api.notes.list()
      const allTags = [...new Set(notes.flatMap(n => n.tags || []))]
      set({ notes, tags: allTags, isLoading: false })
    } catch (err) {
      set({ error: err.message, isLoading: false })
    }
  },

  fetchFolders: async () => {
    try {
      const folders = await api.folders.list()
      set({ folders })
    } catch (err) {
      console.error('Failed to fetch folders:', err)
    }
  },

  setActiveNote: async (noteId) => {
    if (!noteId) { set({ activeNote: null }); return }
    set({ isLoading: true })
    try {
      const note = await api.notes.get(noteId)
      set({ activeNote: note, isLoading: false })
    } catch (err) {
      set({ error: err.message, isLoading: false })
    }
  },

  createNote: async (data = {}) => {
    try {
      const note = await api.notes.create({
        title: 'Untitled',
        folder_id: get().activeFolderId,
        tags: [],
        ...data,
      })
      set(state => ({ notes: [note, ...state.notes], activeNote: note }))
      return note
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  updateNote: async (id, data) => {
    set({ isSaving: true })
    try {
      const updated = await api.notes.update(id, data)
      set(state => ({
        notes: state.notes.map(n => n.id === id ? { ...n, ...updated } : n),
        activeNote: state.activeNote?.id === id ? { ...state.activeNote, ...updated } : state.activeNote,
        isSaving: false,
      }))
      return updated
    } catch (err) {
      set({ error: err.message, isSaving: false })
      throw err
    }
  },

  deleteNote: async (id) => {
    try {
      await api.notes.delete(id)
      set(state => ({
        notes: state.notes.filter(n => n.id !== id),
        activeNote: state.activeNote?.id === id ? null : state.activeNote,
      }))
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  createFolder: async (name, parentId = null) => {
    try {
      const folder = await api.folders.create({ name, parent_id: parentId })
      set(state => ({ folders: [...state.folders, folder] }))
      return folder
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  deleteFolder: async (id) => {
    try {
      await api.folders.delete(id)
      set(state => ({
        folders: state.folders.filter(f => f.id !== id),
        activeFolderId: state.activeFolderId === id ? null : state.activeFolderId,
      }))
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  archiveNote: async (id, archived = true) => {
    const { updateNote } = get()
    await updateNote(id, { archived })
  },

  toggleStar: async (id) => {
    const note = get().notes.find(n => n.id === id)
    if (!note) return
    const { updateNote } = get()
    await updateNote(id, { starred: !note.starred })
  },

  setActiveFolderId: (id) => set({ activeFolderId: id }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setViewMode: (mode) => {
    localStorage.setItem('noted_view_mode', mode)
    set({ viewMode: mode })
  },
  clearError: () => set({ error: null }),

  getFilteredNotes: () => {
    const { notes, activeFolderId, searchQuery } = get()
    let filtered = notes.filter(n => !n.archived)
    if (activeFolderId) {
      filtered = filtered.filter(n => n.folder_id === activeFolderId)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(n =>
        n.title?.toLowerCase().includes(q) ||
        extractText(n.content).toLowerCase().includes(q)
      )
    }
    const pinned = filtered.filter(n => n.pinned)
    const rest   = filtered.filter(n => !n.pinned)
    return [...pinned, ...rest]
  },

  getArchivedNotes: () => {
    return get().notes.filter(n => n.archived)
  },

  getFavouriteNotes: () => {
    return get().notes.filter(n => !n.archived && n.starred)
  },

  getRecentNotes: (limit = 5) => {
    return get().notes
      .filter(n => !n.archived)
      .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
      .slice(0, limit)
  },
}))
