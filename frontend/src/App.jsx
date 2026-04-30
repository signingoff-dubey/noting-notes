import { useEffect, useCallback, useRef } from 'react'
import { useUIStore } from '@/store/uiStore'
import { useNotesStore } from '@/store/notesStore'
import { useAIStore } from '@/store/aiStore'
import { useAuthStore } from '@/store/authStore'
import { useTasksStore } from '@/store/tasksStore'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { NotesPanel } from '@/components/sidebar/NotesPanel'
import { NoteEditor } from '@/components/editor/NoteEditor'
import { AISidebar } from '@/components/ai/AISidebar'
import { ToastContainer } from '@/components/ui/Toast'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
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
  const { initTheme, activePanel, setActivePanel, notesPanelCollapsed, toggleNotesPanel } = useUIStore()
  const { createNote, setActiveNote, activeNote } = useNotesStore()
  const { toggle: toggleAI } = useAIStore()
  const { init: initAuth } = useAuthStore()
  const tasks = useTasksStore(s => s.tasks)
  const notifiedRef = useRef(new Set())

  useEffect(() => { initTheme() }, [])
  useEffect(() => { initAuth() }, [])

  /* Browser notifications for tasks due within the next minute */
  useEffect(() => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'default') Notification.requestPermission()

    const check = () => {
      if (Notification.permission !== 'granted') return
      const now = Date.now()
      tasks.forEach(task => {
        if (!task.due_date || task.status === 'done' || task.archived) return
        const due = new Date(task.due_date).getTime()
        const diff = due - now
        if (diff > 0 && diff <= 60_000 && !notifiedRef.current.has(task.id)) {
          notifiedRef.current.add(task.id)
          new Notification('Task due soon', {
            body: task.title,
            icon: '/favicon.ico',
            tag: task.id,
          })
        }
        /* Clean up expired task IDs once overdue by > 5 min */
        if (diff < -300_000) notifiedRef.current.delete(task.id)
      })
    }

    check()
    const interval = setInterval(check, 60_000)
    return () => clearInterval(interval)
  }, [tasks])

  const handleKeydown = useCallback((e) => {
    const tag = document.activeElement?.tagName
    const isEditing = tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.contentEditable === 'true'

    if (e.ctrlKey && e.key === 'n' && !e.shiftKey) {
      e.preventDefault()
      setActivePanel('notes')
      createNote().then(note => {
        if (note) setActiveNote(note.id)
      }).catch(() => {})
    }
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      e.preventDefault()
      toggleAI()
    }
    if (e.key === 'Escape' && !isEditing) {
      setActiveNote(null)
    }
  }, [createNote, setActivePanel, toggleAI, setActiveNote])

  useEffect(() => {
    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [handleKeydown])

  const showNotesPanel = ['notes', 'recent'].includes(activePanel)

  return (
    <div className="flex h-full w-full overflow-hidden bg-bg">
      {/* Left nav sidebar */}
      <Sidebar />

      {/* Middle notes list panel — only for notes/recent */}
      {showNotesPanel && (
        <NotesPanel
          collapsed={notesPanelCollapsed}
          onToggle={toggleNotesPanel}
        />
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 bg-bg">
        <ErrorBoundary key={activePanel}>
          <div key={activeNote?.id ?? activePanel} className="panel-enter flex-1 flex flex-col min-h-0">
            {activeNote
              ? <NoteEditor note={activeNote} onBack={() => setActiveNote(null)} />
              : <CenterPanel panel={activePanel} />
            }
          </div>
        </ErrorBoundary>
      </main>

      {/* Right AI Sidebar (overlay) */}
      <ErrorBoundary>
        <AISidebar />
      </ErrorBoundary>

      <ToastContainer />
    </div>
  )
}
