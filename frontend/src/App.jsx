import { useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import { useUIStore } from '@/store/uiStore'
import { useNotesStore } from '@/store/notesStore'
import { useAIStore } from '@/store/aiStore'
import { useAuthStore } from '@/store/authStore'
import { useTasksStore } from '@/store/tasksStore'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { NotesPanel } from '@/components/sidebar/NotesPanel'
import { ToastContainer } from '@/components/ui/Toast'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { Notes } from '@/pages/Notes'
import { Dashboard } from '@/pages/Dashboard'

const NoteEditor    = lazy(() => import('@/components/editor/NoteEditor').then(m => ({ default: m.NoteEditor })))
const AISidebar     = lazy(() => import('@/components/ai/AISidebar').then(m => ({ default: m.AISidebar })))
const Tasks         = lazy(() => import('@/pages/Tasks').then(m => ({ default: m.Tasks })))
const Calendar      = lazy(() => import('@/pages/Calendar').then(m => ({ default: m.Calendar })))
const Settings      = lazy(() => import('@/pages/Settings').then(m => ({ default: m.Settings })))
const FavouritesView = lazy(() => import('@/pages/FavouritesView').then(m => ({ default: m.FavouritesView })))
const TagsView      = lazy(() => import('@/pages/TagsView').then(m => ({ default: m.TagsView })))
const ArchivedView  = lazy(() => import('@/pages/ArchivedView').then(m => ({ default: m.ArchivedView })))
const Journal       = lazy(() => import('@/pages/Journal').then(m => ({ default: m.Journal })))

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
    case 'journal':   return <Journal />
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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-3 focus:py-1.5 focus:rounded"
        style={{ background: 'var(--color-accent)', color: 'var(--color-bg)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}
      >
        Skip to content
      </a>

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
      <main id="main-content" className="flex-1 flex flex-col min-w-0 bg-bg">
        <ErrorBoundary key={activePanel}>
          <Suspense fallback={null}>
            <div key={activeNote?.id ?? activePanel} className="panel-enter flex-1 flex flex-col min-h-0">
              {activeNote
                ? <NoteEditor note={activeNote} onBack={() => setActiveNote(null)} />
                : <CenterPanel panel={activePanel} />
              }
            </div>
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Right AI Sidebar (overlay) */}
      <ErrorBoundary>
        <Suspense fallback={null}>
          <AISidebar />
        </Suspense>
      </ErrorBoundary>

      <ToastContainer />
      <CommandPalette />
    </div>
  )
}
