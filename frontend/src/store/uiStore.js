import { create } from 'zustand'

const THEMES = ['nothing-dark', 'nothing-light', 'midnight', 'terminal', 'warm-paper', 'sakura', 'forest', 'win95']

export const ACCENT_MAP = {
  amber:  { color: 'oklch(72% 0.17 65)',  dim: 'oklch(72% 0.10 65 / 0.15)', label: 'Amber' },
  white:  { color: '#f0f0f0',             dim: '#f0f0f018',                  label: 'White' },
  red:    { color: '#eb0029',             dim: '#eb002918',                  label: 'Red' },
  green:  { color: '#00d26a',             dim: '#00d26a18',                  label: 'Green' },
  blue:   { color: '#58a6ff',             dim: '#58a6ff18',                  label: 'Blue' },
  purple: { color: '#a78bfa',             dim: '#a78bfa18',                  label: 'Purple' },
}

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('ink_theme', theme)
}

const applyAccent = (accent) => {
  const entry = ACCENT_MAP[accent]
  if (!entry) return
  document.documentElement.style.setProperty('--color-accent', entry.color)
  document.documentElement.style.setProperty('--color-accent-dim', entry.dim)
  localStorage.setItem('ink_accent', accent)
}

export const useUIStore = create((set, get) => ({
  theme: localStorage.getItem('ink_theme') || localStorage.getItem('noted_theme') || 'nothing-dark',
  accent: localStorage.getItem('ink_accent') || 'amber',
  userName: localStorage.getItem('ink_user_name') || '',
  activePanel: 'notes',
  viewerAttachment: null,
  toasts: [],
  themes: THEMES,
  sidebarCollapsed: localStorage.getItem('ink_sidebar_collapsed') === 'true',
  notesPanelCollapsed: localStorage.getItem('ink_notes_panel_collapsed') === 'true',

  deepContrast: localStorage.getItem('ink_deep_contrast') === 'true',

  // Editor settings
  editorFontSize:  parseInt(localStorage.getItem('ink_editor_font_size'))   || 16,
  editorLineHeight: parseFloat(localStorage.getItem('ink_editor_line_height')) || 1.8,
  autosaveDelay:   parseInt(localStorage.getItem('ink_autosave_delay'))     || 2,
  spellcheck:      localStorage.getItem('ink_spellcheck') !== 'false',
  typewriterMode:  localStorage.getItem('ink_typewriter_mode') === 'true',
  focusMode:       localStorage.getItem('ink_focus_mode') === 'true',

  setEditorFontSize:  (v) => { localStorage.setItem('ink_editor_font_size', v);   set({ editorFontSize: v }) },
  setEditorLineHeight:(v) => { localStorage.setItem('ink_editor_line_height', v); set({ editorLineHeight: v }) },
  setAutosaveDelay:   (v) => { localStorage.setItem('ink_autosave_delay', v);     set({ autosaveDelay: v }) },
  setSpellcheck:      (v) => { localStorage.setItem('ink_spellcheck', v);         set({ spellcheck: v }) },
  setDeepContrast:    (v) => {
    localStorage.setItem('ink_deep_contrast', v)
    document.documentElement.setAttribute('data-deep-contrast', v)
    set({ deepContrast: v })
  },
  setTypewriterMode:  (v) => { localStorage.setItem('ink_typewriter_mode', v);    set({ typewriterMode: v }) },
  setFocusMode:       (v) => { localStorage.setItem('ink_focus_mode', v);         set({ focusMode: v }) },

  initTheme: () => {
    const saved = localStorage.getItem('ink_theme') || localStorage.getItem('noted_theme') || 'nothing-dark'
    const savedAccent = localStorage.getItem('ink_accent') || 'amber'
    const savedDeepContrast = localStorage.getItem('ink_deep_contrast') === 'true'
    applyTheme(saved)
    applyAccent(savedAccent)
    document.documentElement.setAttribute('data-deep-contrast', savedDeepContrast)
    set({ theme: saved, accent: savedAccent, deepContrast: savedDeepContrast })
  },

  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },

  setAccent: (accent) => {
    applyAccent(accent)
    set({ accent })
  },

  setUserName: (name) => {
    localStorage.setItem('ink_user_name', name)
    set({ userName: name })
  },

  setActivePanel: (panel) => set({ activePanel: panel }),
  setViewerAttachment: (att) => set({ viewerAttachment: att }),

  toggleSidebar: () => set(s => {
    const next = !s.sidebarCollapsed
    localStorage.setItem('ink_sidebar_collapsed', next)
    return { sidebarCollapsed: next }
  }),
  toggleNotesPanel: () => set(s => {
    const next = !s.notesPanelCollapsed
    localStorage.setItem('ink_notes_panel_collapsed', next)
    return { notesPanelCollapsed: next }
  }),

  addToast: (toast) => {
    const id = Date.now().toString()
    const newToast = { id, type: 'info', duration: 3000, ...toast }
    set(state => ({ toasts: [...state.toasts, newToast] }))
    if (newToast.duration > 0) {
      setTimeout(() => get().removeToast(id), newToast.duration)
    }
    return id
  },

  removeToast: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),

}))

export const toast = {
  success: (message) => useUIStore.getState().addToast({ type: 'success', message }),
  error:   (message) => useUIStore.getState().addToast({ type: 'error', message, duration: 5000 }),
  info:    (message) => useUIStore.getState().addToast({ type: 'info', message }),
  warning: (message) => useUIStore.getState().addToast({ type: 'warning', message }),
}
