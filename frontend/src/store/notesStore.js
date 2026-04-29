import { create } from 'zustand'
import { nanoid } from 'nanoid'

const NOTES_KEY = 'ink_notes'
const FOLDERS_KEY = 'ink_folders'
const VERSIONS_KEY = 'ink_versions'
const MAX_VERSIONS = 10

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

function loadNotes() {
  try { return JSON.parse(localStorage.getItem(NOTES_KEY) || '[]') } catch { return [] }
}

function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
}

function loadFolders() {
  try { return JSON.parse(localStorage.getItem(FOLDERS_KEY) || '[]') } catch { return [] }
}

function saveFolders(folders) {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders))
}

function loadVersions(noteId) {
  try {
    const all = JSON.parse(localStorage.getItem(VERSIONS_KEY) || '{}')
    return all[noteId] || []
  } catch { return [] }
}

function saveVersion(noteId, content, title) {
  try {
    const all = JSON.parse(localStorage.getItem(VERSIONS_KEY) || '{}')
    const versions = all[noteId] || []
    versions.unshift({ ts: new Date().toISOString(), content, title })
    all[noteId] = versions.slice(0, MAX_VERSIONS)
    localStorage.setItem(VERSIONS_KEY, JSON.stringify(all))
  } catch {}
}

function deleteVersions(noteId) {
  try {
    const all = JSON.parse(localStorage.getItem(VERSIONS_KEY) || '{}')
    delete all[noteId]
    localStorage.setItem(VERSIONS_KEY, JSON.stringify(all))
  } catch {}
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
    const notes = loadNotes()
    const allTags = [...new Set(notes.flatMap(n => n.tags || []))]
    set({ notes, tags: allTags, isLoading: false })
  },

  fetchFolders: async () => {
    set({ folders: loadFolders() })
  },

  setActiveNote: async (noteId) => {
    if (!noteId) { set({ activeNote: null }); return }
    const note = get().notes.find(n => n.id === noteId) || loadNotes().find(n => n.id === noteId)
    set({ activeNote: note || null })
  },

  createNote: async (data = {}) => {
    const now = new Date().toISOString()
    const note = {
      id: nanoid(),
      title: 'Untitled',
      content: null,
      folder_id: get().activeFolderId,
      tags: [],
      starred: false,
      pinned: false,
      archived: false,
      created_at: now,
      updated_at: now,
      word_count: 0,
      ...data,
    }
    const notes = [note, ...get().notes]
    saveNotes(notes)
    set({ notes, activeNote: note })
    return note
  },

  updateNote: async (id, data) => {
    set({ isSaving: true })
    const existing = get().notes.find(n => n.id === id)
    if (data.content !== undefined && existing) {
      saveVersion(id, existing.content, existing.title)
    }
    const updated = { ...data, updated_at: new Date().toISOString() }
    const notes = get().notes.map(n => n.id === id ? { ...n, ...updated } : n)
    saveNotes(notes)
    const updatedNote = notes.find(n => n.id === id)
    set(state => ({
      notes,
      activeNote: state.activeNote?.id === id ? updatedNote : state.activeNote,
      isSaving: false,
    }))
    return updatedNote
  },

  deleteNote: async (id) => {
    deleteVersions(id)
    const notes = get().notes.filter(n => n.id !== id)
    saveNotes(notes)
    set(state => ({
      notes,
      activeNote: state.activeNote?.id === id ? null : state.activeNote,
    }))
  },

  getVersions: (noteId) => loadVersions(noteId),

  restoreVersion: async (noteId, content) => {
    await get().updateNote(noteId, { content })
  },

  createFolder: async (name, parentId = null) => {
    const folder = {
      id: nanoid(),
      name,
      parent_id: parentId,
      created_at: new Date().toISOString(),
    }
    const folders = [...get().folders, folder]
    saveFolders(folders)
    set({ folders })
    return folder
  },

  updateFolder: async (id, data) => {
    const folders = get().folders.map(f => f.id === id ? { ...f, ...data } : f)
    saveFolders(folders)
    set({ folders })
  },

  deleteFolder: async (id) => {
    const folders = get().folders.filter(f => f.id !== id)
    saveFolders(folders)
    set(state => ({
      folders,
      activeFolderId: state.activeFolderId === id ? null : state.activeFolderId,
    }))
  },

  archiveNote: async (id, archived = true) => {
    await get().updateNote(id, { archived })
  },

  toggleStar: async (id) => {
    const note = get().notes.find(n => n.id === id)
    if (!note) return
    await get().updateNote(id, { starred: !note.starred })
  },

  setActiveFolderId: (id) => set({ activeFolderId: id }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setViewMode: (mode) => {
    localStorage.setItem('noted_view_mode', mode)
    set({ viewMode: mode })
  },
  reorderNotes: (fromIndex, toIndex) => {
    set(state => {
      const active = state.notes.filter(n => !n.archived)
      const archived = state.notes.filter(n => n.archived)
      const reordered = [...active]
      const [moved] = reordered.splice(fromIndex, 1)
      reordered.splice(toIndex, 0, moved)
      return { notes: [...reordered, ...archived] }
    })
  },

  clearError: () => set({ error: null }),

  getFilteredNotes: () => {
    const { notes, activeFolderId, searchQuery } = get()
    let filtered = notes.filter(n => !n.archived)
    if (activeFolderId) filtered = filtered.filter(n => n.folder_id === activeFolderId)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(n =>
        n.title?.toLowerCase().includes(q) ||
        extractText(n.content).toLowerCase().includes(q)
      )
    }
    return [...filtered.filter(n => n.pinned), ...filtered.filter(n => !n.pinned)]
  },

  getArchivedNotes: () => get().notes.filter(n => n.archived),
  getFavouriteNotes: () => get().notes.filter(n => !n.archived && n.starred),
  getRecentNotes: (limit = 5) => get().notes
    .filter(n => !n.archived)
    .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
    .slice(0, limit),
}))
