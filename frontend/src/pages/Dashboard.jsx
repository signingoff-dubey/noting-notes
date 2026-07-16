import { useEffect } from 'react'
import { FileText, CheckSquare, Star, Archive, Clock, TrendingUp } from 'lucide-react'
import { format, isToday, isTomorrow, isPast } from 'date-fns'
import { useNotesStore } from '@/store/notesStore'
import { useTasksStore } from '@/store/tasksStore'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/cn'

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div
      className="flex flex-col gap-2 p-4 border"
      style={{
        borderRadius: 2,
        borderColor: accent ? 'var(--color-accent)' : 'var(--color-border)',
        background: accent ? 'var(--color-accent-dim)' : 'var(--color-surface)',
      }}
    >
      <div className="flex items-center justify-between">
        <span style={{ color: accent ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
          {icon}
        </span>
        <span
          className="font-display"
          style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1, fontFamily: 'var(--font-display)' }}
        >
          {value}
        </span>
      </div>
      <div>
        <p className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)' }}>{label}</p>
        {sub && <p className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{sub}</p>}
      </div>
    </div>
  )
}

function SectionHeader({ label }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="font-mono uppercase tracking-widest" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
    </div>
  )
}

function RecentNoteRow({ note, onClick }) {
  const timeStr = note.updated_at ? format(new Date(note.updated_at), 'MMM d') : ''
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors group ripple-root"
      style={{ borderRadius: 2 }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      onMouseDown={e => {
        // ripple
        const el = e.currentTarget
        const rect = el.getBoundingClientRect()
        const size = Math.max(rect.width, rect.height)
        const wave = document.createElement('span')
        wave.className = 'ripple-wave'
        wave.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`
        el.appendChild(wave)
        wave.addEventListener('animationend', () => wave.remove(), { once: true })
      }}
    >
      <FileText size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)', shrink: 0 }} />
      <span className="flex-1 font-body text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
        {note.title || 'Untitled'}
      </span>
      <span className="font-mono shrink-0" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
        {timeStr}
      </span>
    </button>
  )
}

function UpcomingTaskRow({ task }) {
  const due = task.due_date ? new Date(task.due_date) : null
  const overdue = due && isPast(due) && task.status !== 'done'
  const dueLabel = due
    ? isToday(due) ? 'Today' : isTomorrow(due) ? 'Tomorrow' : format(due, 'MMM d')
    : null

  const priorityColor = {
    urgent: 'var(--color-priority-urgent)',
    high:   'var(--color-priority-high)',
    medium: 'var(--color-priority-medium)',
    low:    'var(--color-priority-low)',
    none:   'var(--color-text-muted)',
  }[task.priority] || 'var(--color-text-muted)'

  return (
    <div className="flex items-center gap-3 px-3 py-2.5" style={{ borderRadius: 2 }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: priorityColor }} />
      <span className="flex-1 font-body text-sm truncate" style={{
        color: task.status === 'done' ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
        textDecoration: task.status === 'done' ? 'line-through' : 'none',
      }}>
        {task.title}
      </span>
      {dueLabel && (
        <span className="font-mono shrink-0" style={{
          fontSize: 'var(--text-xs)',
          color: overdue ? 'var(--color-error)' : 'var(--color-text-muted)',
        }}>
          {dueLabel}
        </span>
      )}
    </div>
  )
}

function MiniCalendar() {
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = now.getDate()
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  return (
    <div>
      <p className="font-mono text-center mb-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
        {format(now, 'MMMM yyyy')}
      </p>
      <div className="grid grid-cols-7 gap-0.5">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} className="text-center font-mono" style={{ fontSize: 10, color: 'var(--color-text-muted)', padding: '2px 0' }}>{d}</div>
        ))}
        {cells.map((d, i) => (
          <div
            key={i}
            className="text-center font-mono"
            style={{
              fontSize: 11,
              padding: '3px 0',
              borderRadius: 2,
              background: d === today ? 'var(--color-accent)' : 'transparent',
              color: d === today ? 'var(--color-bg)' : d ? 'var(--color-text-secondary)' : 'transparent',
              fontWeight: d === today ? 700 : 400,
            }}
          >
            {d || ''}
          </div>
        ))}
      </div>
    </div>
  )
}

export function Dashboard() {
  const notes = useNotesStore(s => s.notes)
  const getRecentNotes = useNotesStore(s => s.getRecentNotes)
  const getFavouriteNotes = useNotesStore(s => s.getFavouriteNotes)
  const getArchivedNotes = useNotesStore(s => s.getArchivedNotes)
  const fetchNotes = useNotesStore(s => s.fetchNotes)
  const setActiveNote = useNotesStore(s => s.setActiveNote)
  const tasks = useTasksStore(s => s.tasks)
  const fetchTasks = useTasksStore(s => s.fetchTasks)
  const getUpcomingTasks = useTasksStore(s => s.getUpcomingTasks)
  const setActivePanel = useUIStore(s => s.setActivePanel)

  useEffect(() => {
    fetchNotes()
    fetchTasks()
  }, [])

  const activeNotes    = notes.filter(n => !n.archived)
  const recentNotes    = getRecentNotes(6)
  const upcomingTasks  = getUpcomingTasks(5)
  const activeTasks    = tasks.filter(t => !t.archived && t.status !== 'done')
  const doneTasks      = tasks.filter(t => t.status === 'done')
  const starredNotes   = getFavouriteNotes()
  const archivedNotes  = getArchivedNotes()

  const totalWords = notes.reduce((acc, n) => acc + (n.word_count || 0), 0)

  const handleNoteClick = async (id) => {
    setActivePanel('notes')
    await setActiveNote(id)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center px-6 shrink-0 border-b"
        style={{ height: 48, borderColor: 'var(--color-border)' }}
      >
        <h2 className="font-mono" style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
          Dashboard
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-4xl mx-auto p-6 flex flex-col gap-8">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            <StatCard icon={<FileText size={16} strokeWidth={1.5} />} label="Notes" value={activeNotes.length} sub={`${archivedNotes.length} archived`} />
            <StatCard icon={<CheckSquare size={16} strokeWidth={1.5} />} label="Open Tasks" value={activeTasks.length} sub={`${doneTasks.length} done`} />
            <StatCard icon={<Star size={16} strokeWidth={1.5} />} label="Favourites" value={starredNotes.length} sub="starred notes" />
            <StatCard icon={<TrendingUp size={16} strokeWidth={1.5} />} label="Words written" value={totalWords > 999 ? `${(totalWords/1000).toFixed(1)}k` : totalWords} accent />
          </div>

          {/* Recent + Upcoming */}
          <div className="grid grid-cols-2 gap-6">
            {/* Recent Notes */}
            <div>
              <SectionHeader label="Recent Notes" />
              {recentNotes.length === 0 ? (
                <p className="font-mono px-3" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>No notes yet</p>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {recentNotes.map(n => (
                    <RecentNoteRow key={n.id} note={n} onClick={() => handleNoteClick(n.id)} />
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Tasks */}
            <div>
              <SectionHeader label="Upcoming Tasks" />
              {upcomingTasks.length === 0 ? (
                <p className="font-mono px-3" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>No upcoming tasks</p>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {upcomingTasks.map(t => <UpcomingTaskRow key={t.id} task={t} />)}
                </div>
              )}
              {activeTasks.length > 5 && (
                <button
                  className="font-mono px-3 mt-2 transition-colors ripple-root"
                  style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)' }}
                  onClick={() => setActivePanel('tasks')}
                >
                  View all {activeTasks.length} tasks →
                </button>
              )}
            </div>
          </div>

          {/* Mini Calendar */}
          <div>
            <SectionHeader label="This Month" />
            <div
              className="p-4 border"
              style={{
                borderRadius: 2,
                borderColor: 'var(--color-border)',
                background: 'var(--color-surface)',
                maxWidth: 280,
              }}
            >
              <MiniCalendar />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
