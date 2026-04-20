import { useEffect, useCallback } from 'react'
import { useUIStore } from '@/store/uiStore'
import { useNotesStore } from '@/store/notesStore'
import { useAIStore } from '@/store/aiStore'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { AISidebar } from '@/components/ai/AISidebar'
import { ToastContainer } from '@/components/ui/Toast'
import { Notes } from '@/pages/Notes'
import { Tasks } from '@/pages/Tasks'
import { Calendar } from '@/pages/Calendar'
import { Settings } from '@/pages/Settings'
import { Dashboard } from '@/pages/Dashboard'
import { FavouritesView } from '@/pages/FavouritesView'
import { TagsView } from '@/pages/TagsView'
import { ArchivedView } from '@/pages/ArchivedView'

function CenterPanel({ panel }) {
  switch (panel) {
    case 'dashboard': return <Dashboard />
    case 'notes':
    case 'recent':    return <Notes />
    case 'tasks':     return <Tasks />
    case 'calendar':  return <Calendar />
    case 'settings':  return <Settings />
    case 'favourites':return <FavouritesView />
    case 'tags':      return <TagsView />
    case 'archive':   return <ArchivedView />
    default:          return <Notes />
  }
}

export default function App() {
  const { initTheme, activePanel, setActivePanel } = useUIStore()
  const { createNote, setActiveNote } = useNotesStore()
  const { toggle: toggleAI } = useAIStore()

  useEffect(() => { initTheme() }, [])

  const handleKeydown = useCallback((e) => {
    // Ignore when typing in inputs
    const tag = document.activeElement?.tagName
    const isEditing = tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.contentEditable === 'true'

    if (e.ctrlKey && e.key === 'n' && !e.shiftKey) {
      e.preventDefault()
      setActivePanel('notes')
      createNote().catch(() => {})
    }
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      e.preventDefault()
      toggleAI()
    }
    if (e.ctrlKey && e.key === '1' && !isEditing) {
      e.preventDefault()
    }
    if (e.key === 'Escape' && !isEditing) {
      setActiveNote(null)
    }
  }, [createNote, setActivePanel, toggleAI, setActiveNote])

  useEffect(() => {
    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [handleKeydown])

  return (
    <div className="flex h-full w-full overflow-hidden bg-bg">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Center Panel */}
      <main className="flex-1 flex flex-col min-w-0 bg-bg border-r border-border">
        <CenterPanel panel={activePanel} />
      </main>

      {/* Right AI Sidebar (overlay) */}
      <AISidebar />

      {/* Toasts */}
      <ToastContainer />
    </div>
  )
}
