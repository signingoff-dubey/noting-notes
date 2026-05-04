import { useEffect, useMemo } from 'react'
import { FileText, CheckSquare, Star, ArrowRight, Clock } from 'lucide-react'
import { format, isToday, isTomorrow, isPast, formatDistanceToNow } from 'date-fns'
import { useNotesStore } from '@/store/notesStore'
import { useTasksStore } from '@/store/tasksStore'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/cn'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function StatCard({ label, value, sub, accent, onClick }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      onClick={onClick}
      className={cn(
        'flex-1 flex flex-col justify-between py-4 px-5 [&:not(:last-child)]:border-r text-left',
        onClick && 'transition-colors hover:bg-[var(--color-surface-hover)] cursor-pointer',
      )}
      style={{ borderColor: 'var(--color-border)' }}
    >
      <span
        className="font-mono uppercase tracking-widest"
        style={{ fontSize: 9, color: accent ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
      >
        {label}
      </span>
      <div className="mt-2">
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 36,
            fontWeight: 700,
            color: accent ? 'var(--color-accent)' : 'var(--color-text-primary)',
            lineHeight: 1,
            letterSpacing: '-0.03em',
          }}
        >
          {value}
        </span>
        {sub && (
          <p
            className="font-mono mt-1"
            style={{ fontSize: 10, color: accent ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
          >
            {sub}
          </p>
        )}
      </div>
    </Tag>
  )
}

function SectionHeader({ label, action, onAction }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span
        className="font-mono uppercase tracking-widest"
        style={{ fontSize: 10, color: 'var(--color-text-muted)' }}
      >
        {label}
      </span>
      {action && (
        <button
          onClick={onAction}
          className="flex items-center gap-1 font-mono transition-opacity hover:opacity-70"
          style={{ fontSize: 10, color: 'var(--color-text-muted)' }}
        >
          {action}
          <ArrowRight size={10} strokeWidth={1.5} />
        </button>
      )}
    </div>
  )
}

function RecentNoteCard({ note, onClick }) {
  const timeAgo = note.updated_at
    ? formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })
    : ''

  return (
    <button
      onClick={onClick}
      className="ink-card flex flex-col gap-2 text-left w-full cursor-pointer"
      style={{ padding: '12px 14px' }}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className="font-medium line-clamp-2 flex-1"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-primary)',
            lineHeight: 1.4,
          }}
        >
          {note.title || 'Untitled'}
        </p>
        {note.starred && (
          <Star size={11} strokeWidth={1.5} fill="currentColor" style={{ color: 'var(--color-warning)', shrink: 0 }} />
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <Clock size={10} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)' }} />
        <span className="font-mono" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
          {timeAgo}
        </span>
      </div>
    </button>
  )
}

function UpcomingTaskCard({ task, onClick }) {
  const due = task.due_date ? new Date(task.due_date) : null
  const overdue = due && isPast(due) && task.status !== 'done'
  const dueLabel = due
    ? isToday(due) ? 'Today'
    : isTomorrow(due) ? 'Tomorrow'
    : format(due, 'MMM d')
    : null

  const priorityColor = {
    urgent: 'var(--color-priority-urgent)',
    high:   'var(--color-priority-high)',
    medium: 'var(--color-priority-medium)',
    low:    'var(--color-priority-low)',
    none:   'var(--color-border-strong)',
  }[task.priority] || 'var(--color-border-strong)'

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-2.5 px-3 text-left transition-colors hover:bg-[var(--color-surface-hover)] rounded-lg"
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: priorityColor }}
      />
      <span
        className="flex-1 truncate"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: task.status === 'done' ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
          textDecoration: task.status === 'done' ? 'line-through' : 'none',
        }}
      >
        {task.title}
      </span>
      {dueLabel && (
        <span
          className="font-mono shrink-0"
          style={{
            fontSize: 10,
            color: overdue ? 'var(--color-error)' : 'var(--color-text-muted)',
          }}
        >
          {dueLabel}
        </span>
      )}
    </button>
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
  const setActivePanel = useUIStore(s => s.setActivePanel)

  useEffect(() => {
    fetchNotes()
    fetchTasks()
  }, [])

  const activeNotes   = notes.filter(n => !n.archived && n._source !== 'journal')
  const recentNotes   = getRecentNotes(6)
  const activeTasks   = tasks.filter(t => !t.archived && t.status !== 'done')
  const upcomingTasks = activeTasks
    .slice()
    .sort((a, b) => {
      if (a.due_date && !b.due_date) return -1
      if (!a.due_date && b.due_date) return 1
      if (a.due_date && b.due_date) return new Date(a.due_date) - new Date(b.due_date)
      return new Date(b.created_at) - new Date(a.created_at)
    })
    .slice(0, 6)
  const doneTasks     = tasks.filter(t => t.status === 'done')
  const starredNotes  = getFavouriteNotes()
  const archivedNotes = getArchivedNotes()
  const totalWords    = useMemo(() => notes.reduce((acc, n) => acc + (n.word_count || 0), 0), [notes])

  const handleNoteClick = async (id) => {
    setActivePanel('notes')
    await setActiveNote(id)
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="ink-page-header">
        <div>
          <h1 className="ink-page-title">{getGreeting()}</h1>
          <p className="font-mono mt-0.5" style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="ink-content-area">
        <div className="ink-content-inner">

          {/* Stats strip */}
          <div
            className="flex mb-8 overflow-hidden rounded-xl"
            style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
          >
            <StatCard
              label="Notes"
              value={activeNotes.length}
              sub={`${archivedNotes.length} archived`}
              onClick={() => setActivePanel('notes')}
            />
            <StatCard
              label="Open Tasks"
              value={activeTasks.length}
              sub={`${doneTasks.length} done`}
              onClick={() => setActivePanel('tasks')}
            />
            <StatCard
              label="Favourites"
              value={starredNotes.length}
              sub="starred"
              onClick={() => setActivePanel('favourites')}
            />
            <StatCard
              label="Words"
              value={totalWords > 999 ? `${(totalWords / 1000).toFixed(1)}k` : totalWords}
              sub="total written"
              accent
            />
          </div>

          {/* Recent Notes + Upcoming Tasks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Recent Notes */}
            <div>
              <SectionHeader
                label="Recent Notes"
                action="All notes"
                onAction={() => { setActivePanel('notes') }}
              />
              {recentNotes.length === 0 ? (
                <div
                  className="ink-card flex flex-col items-center justify-center py-8 gap-2"
                  style={{ borderStyle: 'dashed' }}
                >
                  <FileText size={24} strokeWidth={1} style={{ color: 'var(--color-text-muted)' }} />
                  <p className="font-mono" style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                    No notes yet
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {recentNotes.map(n => (
                    <RecentNoteCard key={n.id} note={n} onClick={() => handleNoteClick(n.id)} />
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Tasks */}
            <div>
              <SectionHeader
                label="Upcoming Tasks"
                action={activeTasks.length > 6 ? `All ${activeTasks.length}` : undefined}
                onAction={() => setActivePanel('tasks')}
              />
              {upcomingTasks.length === 0 ? (
                <div
                  className="ink-card flex flex-col items-center justify-center py-8 gap-2"
                  style={{ borderStyle: 'dashed' }}
                >
                  <CheckSquare size={24} strokeWidth={1} style={{ color: 'var(--color-text-muted)' }} />
                  <p className="font-mono" style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                    No tasks yet
                  </p>
                </div>
              ) : (
                <div
                  className="ink-card"
                  style={{ padding: '8px 4px' }}
                >
                  {upcomingTasks.map(t => (
                    <UpcomingTaskCard key={t.id} task={t} onClick={() => setActivePanel('tasks')} />
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
