import { useEffect, useState } from 'react'
import { Archive, RotateCcw, Trash2, FileText, CheckSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useNotesStore } from '@/store/notesStore'
import { useTasksStore } from '@/store/tasksStore'
import { toast } from '@/store/uiStore'
import { cn } from '@/lib/cn'

function TabButton({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className="ripple-root flex items-center gap-1.5 px-4 h-full font-mono relative transition-colors"
      style={{
        fontSize: 'var(--text-xs)',
        color: active ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
      }}
      onMouseDown={e => {
        const el = e.currentTarget, rect = el.getBoundingClientRect()
        const size = Math.max(rect.width, rect.height)
        const wave = document.createElement('span')
        wave.className = 'ripple-wave'
        wave.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`
        el.appendChild(wave)
        wave.addEventListener('animationend', () => wave.remove(), { once: true })
      }}
    >
      {label}
      {count > 0 && (
        <span
          className="font-mono px-1.5"
          style={{
            fontSize: 10,
            background: 'var(--color-surface-2)',
            borderRadius: 2,
            color: 'var(--color-text-muted)',
          }}
        >
          {count}
        </span>
      )}
      {active && (
        <span
          className="absolute bottom-0 left-0 right-0"
          style={{ height: 2, background: 'var(--color-accent)', borderRadius: '2px 2px 0 0' }}
        />
      )}
    </button>
  )
}

function ArchivedNoteRow({ note, onRestore, onDelete }) {
  const timeAgo = note.updated_at
    ? formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })
    : ''
  return (
    <div
      className="flex items-center gap-3 px-4 border-b group"
      style={{ borderColor: 'var(--color-border)', paddingTop: 12, paddingBottom: 12 }}
    >
      <FileText size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm truncate" style={{ color: 'var(--color-text-secondary)' }}>
          {note.title || 'Untitled'}
        </p>
        <p className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {timeAgo}
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onRestore}
          title="Restore"
          className="ripple-root flex items-center gap-1.5 px-2.5 h-7 font-mono border transition-colors"
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-success)',
            borderColor: 'var(--color-success)',
            background: 'transparent',
            borderRadius: 2,
          }}
          onMouseDown={e => {
            const el = e.currentTarget, rect = el.getBoundingClientRect()
            const size = Math.max(rect.width, rect.height)
            const wave = document.createElement('span')
            wave.className = 'ripple-wave'
            wave.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`
            el.appendChild(wave)
            wave.addEventListener('animationend', () => wave.remove(), { once: true })
          }}
        >
          <RotateCcw size={11} strokeWidth={1.5} />
          Restore
        </button>
        <button
          onClick={onDelete}
          title="Delete permanently"
          className="ripple-root flex items-center justify-center w-7 h-7 border transition-colors"
          style={{
            color: 'var(--color-error)',
            borderColor: 'var(--color-border)',
            background: 'transparent',
            borderRadius: 2,
          }}
          onMouseDown={e => {
            const el = e.currentTarget, rect = el.getBoundingClientRect()
            const size = Math.max(rect.width, rect.height)
            const wave = document.createElement('span')
            wave.className = 'ripple-wave'
            wave.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`
            el.appendChild(wave)
            wave.addEventListener('animationend', () => wave.remove(), { once: true })
          }}
        >
          <Trash2 size={12} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}

function ArchivedTaskRow({ task, onRestore, onDelete }) {
  const timeAgo = task.updated_at
    ? formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })
    : ''
  const priorityColor = {
    urgent: 'var(--color-priority-urgent)',
    high:   'var(--color-priority-high)',
    medium: 'var(--color-priority-medium)',
    low:    'var(--color-priority-low)',
    none:   'var(--color-border)',
  }[task.priority] || 'var(--color-border)'

  return (
    <div
      className="flex items-center gap-3 px-4 border-b group"
      style={{ borderColor: 'var(--color-border)', paddingTop: 12, paddingBottom: 12 }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: priorityColor }} />
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm truncate" style={{ color: 'var(--color-text-secondary)' }}>
          {task.title}
        </p>
        <p className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {task.status?.replace('_', ' ')} · {timeAgo}
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onRestore}
          title="Restore"
          className="ripple-root flex items-center gap-1.5 px-2.5 h-7 font-mono border transition-colors"
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-success)',
            borderColor: 'var(--color-success)',
            background: 'transparent',
            borderRadius: 2,
          }}
          onMouseDown={e => {
            const el = e.currentTarget, rect = el.getBoundingClientRect()
            const size = Math.max(rect.width, rect.height)
            const wave = document.createElement('span')
            wave.className = 'ripple-wave'
            wave.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`
            el.appendChild(wave)
            wave.addEventListener('animationend', () => wave.remove(), { once: true })
          }}
        >
          <RotateCcw size={11} strokeWidth={1.5} />
          Restore
        </button>
        <button
          onClick={onDelete}
          title="Delete permanently"
          className="ripple-root flex items-center justify-center w-7 h-7 border transition-colors"
          style={{
            color: 'var(--color-error)',
            borderColor: 'var(--color-border)',
            background: 'transparent',
            borderRadius: 2,
          }}
          onMouseDown={e => {
            const el = e.currentTarget, rect = el.getBoundingClientRect()
            const size = Math.max(rect.width, rect.height)
            const wave = document.createElement('span')
            wave.className = 'ripple-wave'
            wave.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`
            el.appendChild(wave)
            wave.addEventListener('animationend', () => wave.remove(), { once: true })
          }}
        >
          <Trash2 size={12} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}

export function ArchivedView() {
  const [tab, setTab] = useState('notes')

  const fetchNotes      = useNotesStore(s => s.fetchNotes)
  const getArchivedNotes = useNotesStore(s => s.getArchivedNotes)
  const archiveNote     = useNotesStore(s => s.archiveNote)
  const deleteNote      = useNotesStore(s => s.deleteNote)

  const fetchTasks      = useTasksStore(s => s.fetchTasks)
  const getArchivedTasks = useTasksStore(s => s.getArchivedTasks)
  const updateTask      = useTasksStore(s => s.updateTask)
  const deleteTask      = useTasksStore(s => s.deleteTask)

  useEffect(() => { fetchNotes(); fetchTasks() }, [])

  const archivedNotes = getArchivedNotes()
  const archivedTasks = getArchivedTasks()

  const handleRestoreNote = async (id) => {
    try { await archiveNote(id, false); toast.success('Note restored') }
    catch { toast.error('Failed to restore') }
  }
  const handleDeleteNote = async (id) => {
    try { await deleteNote(id); toast.success('Note deleted permanently') }
    catch { toast.error('Failed to delete') }
  }
  const handleRestoreTask = async (id) => {
    try { await updateTask(id, { archived: false }); toast.success('Task restored') }
    catch { toast.error('Failed to restore') }
  }
  const handleDeleteTask = async (id) => {
    try { await deleteTask(id); toast.success('Task deleted permanently') }
    catch { toast.error('Failed to delete') }
  }

  const isEmpty = tab === 'notes' ? archivedNotes.length === 0 : archivedTasks.length === 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 shrink-0 border-b"
        style={{ height: 48, borderColor: 'var(--color-border)' }}
      >
        <Archive size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)' }} />
        <h2 className="font-mono" style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
          Archive
        </h2>
      </div>

      {/* Tabs */}
      <div
        className="flex items-center px-2 border-b shrink-0"
        style={{ height: 40, borderColor: 'var(--color-border)' }}
      >
        <TabButton label="Notes" count={archivedNotes.length} active={tab === 'notes'} onClick={() => setTab('notes')} />
        <TabButton label="Tasks" count={archivedTasks.length} active={tab === 'tasks'} onClick={() => setTab('tasks')} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Archive size={28} strokeWidth={1} style={{ color: 'var(--color-text-muted)' }} />
            <p className="font-mono text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Nothing archived yet
            </p>
            <p className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Archive {tab === 'notes' ? 'notes' : 'tasks'} to keep things tidy
            </p>
          </div>
        ) : tab === 'notes' ? (
          <div className="flex flex-col">
            {archivedNotes.map(note => (
              <ArchivedNoteRow
                key={note.id}
                note={note}
                onRestore={() => handleRestoreNote(note.id)}
                onDelete={() => handleDeleteNote(note.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col">
            {archivedTasks.map(task => (
              <ArchivedTaskRow
                key={task.id}
                task={task}
                onRestore={() => handleRestoreTask(task.id)}
                onDelete={() => handleDeleteTask(task.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
