import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalIcon, FileText, Plus } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay, addMonths, subMonths,
} from 'date-fns'
import { useTasksStore } from '@/store/tasksStore'
import { useNotesStore } from '@/store/notesStore'
import { useRipple } from '@/lib/useRipple'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const PRIORITY_COLOR = {
  urgent: 'var(--color-priority-urgent)',
  high:   'var(--color-priority-high)',
  medium: 'var(--color-priority-medium)',
  low:    'var(--color-priority-low)',
  none:   'var(--color-text-muted)',
}

function DayCell({ day, isCurrentMonth, isCurrentDay, isSelected, tasks, notes, onClick }) {
  const ripple = useRipple()
  const hasItems = tasks.length > 0 || notes.length > 0
  return (
    <button
      onClick={onClick}
      {...ripple}
      onMouseDown={ripple.onMouseDown}
      className={`${ripple.className} flex flex-col p-1.5 border-b border-r border-border text-left transition-colors min-h-[80px]`}
      style={{
        borderColor: 'var(--color-border)',
        background: isSelected ? 'var(--color-surface-active)' : 'transparent',
        opacity: isCurrentMonth ? 1 : 0.3,
      }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--color-surface-hover)' }}
      onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'var(--color-surface-active)' : 'transparent' }}
    >
      <span
        className="font-mono w-6 h-6 flex items-center justify-center shrink-0"
        style={{
          fontSize: 'var(--text-xs)',
          borderRadius: 2,
          background: isCurrentDay ? 'var(--color-accent)' : 'transparent',
          color: isCurrentDay ? 'var(--color-bg)' : 'var(--color-text-secondary)',
          fontWeight: isCurrentDay ? 700 : 400,
        }}
      >
        {format(day, 'd')}
      </span>
      <div className="flex flex-col gap-0.5 mt-1 w-full overflow-hidden">
        {tasks.slice(0, 2).map(task => (
          <span
            key={task.id}
            className="flex items-center gap-1 truncate font-mono px-1 py-0.5"
            style={{
              fontSize: 10,
              background: 'var(--color-surface-2)',
              borderRadius: 3,
              color: 'var(--color-text-secondary)',
            }}
          >
            <span
              className="shrink-0 w-1 h-1 rounded-full"
              style={{ background: PRIORITY_COLOR[task.priority] || 'var(--color-border)' }}
            />
            {task.title}
          </span>
        ))}
        {notes.slice(0, tasks.length >= 2 ? 0 : 1).map(note => (
          <span
            key={note.id}
            className="flex items-center gap-1 truncate font-mono px-1 py-0.5"
            style={{
              fontSize: 10,
              background: 'var(--color-accent-dim)',
              borderRadius: 3,
              color: 'var(--color-text-muted)',
            }}
          >
            <FileText size={8} strokeWidth={1.5} style={{ flexShrink: 0 }} />
            {note.title || 'Untitled'}
          </span>
        ))}
        {(tasks.length + notes.length) > 2 && (
          <span className="font-mono" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
            +{tasks.length + notes.length - 2} more
          </span>
        )}
      </div>
    </button>
  )
}

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const tasks = useTasksStore(s => s.tasks)
  const notes = useNotesStore(s => s.notes)
  const fetchTasks = useTasksStore(s => s.fetchTasks)
  const fetchNotes = useNotesStore(s => s.fetchNotes)

  useEffect(() => { fetchTasks(); fetchNotes() }, [])

  const monthStart = startOfMonth(currentDate)
  const monthEnd   = endOfMonth(currentDate)
  const calStart   = startOfWeek(monthStart)
  const calEnd     = endOfWeek(monthEnd)
  const days       = eachDayOfInterval({ start: calStart, end: calEnd })

  const getTasksForDay  = (day) => tasks.filter(t => !t.archived && t.due_date && isSameDay(new Date(t.due_date), day))
  const getNotesForDay  = (day) => notes.filter(n => !n.archived && n.created_at && isSameDay(new Date(n.created_at), day))

  const selectedDayTasks = selectedDate ? getTasksForDay(selectedDate) : []
  const selectedDayNotes = selectedDate ? getNotesForDay(selectedDate) : []

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 shrink-0 border-b"
        style={{ height: 48, borderColor: 'var(--color-border)' }}
      >
        <h2 className="font-mono" style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-1">
          {[
            { icon: <ChevronLeft size={14} strokeWidth={1.5} />, action: () => setCurrentDate(d => subMonths(d, 1)) },
            { label: 'Today', action: () => { setCurrentDate(new Date()); setSelectedDate(new Date()) } },
            { icon: <ChevronRight size={14} strokeWidth={1.5} />, action: () => setCurrentDate(d => addMonths(d, 1)) },
          ].map((btn, i) => (
            <button
              key={i}
              onClick={btn.action}
              className="ripple-root flex items-center justify-center h-7 font-mono transition-colors"
              style={{
                width: btn.label ? 'auto' : 28,
                padding: btn.label ? '0 8px' : 0,
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                borderRadius: 2,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
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
              {btn.icon || btn.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        {selectedDate && (
          <button
            onClick={() => setSelectedDate(null)}
            className="font-mono transition-colors"
            style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
          >
            Clear selection
          </button>
        )}
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Calendar grid */}
        <div className="flex-1 flex flex-col p-4 min-h-0">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center font-mono py-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                {d}
              </div>
            ))}
          </div>
          {/* Day cells */}
          <div
            className="grid grid-cols-7 flex-1 border overflow-hidden"
            style={{ borderColor: 'var(--color-border)', borderRadius: 2 }}
          >
            {days.map((day, i) => (
              <DayCell
                key={i}
                day={day}
                isCurrentMonth={isSameMonth(day, currentDate)}
                isCurrentDay={isToday(day)}
                isSelected={selectedDate ? isSameDay(day, selectedDate) : false}
                tasks={getTasksForDay(day)}
                notes={getNotesForDay(day)}
                onClick={() => setSelectedDate(prev => prev && isSameDay(day, prev) ? null : day)}
              />
            ))}
          </div>
        </div>

        {/* Selected day detail panel */}
        {selectedDate && (
          <div
            className="flex flex-col shrink-0 border-l"
            style={{ width: 280, borderColor: 'var(--color-border)' }}
          >
            {/* Panel header */}
            <div className="px-4 py-3 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
              <p className="font-mono" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                {format(selectedDate, 'EEEE')}
              </p>
              <p className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                {format(selectedDate, 'MMMM d, yyyy')}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              {/* Tasks section */}
              {selectedDayTasks.length > 0 && (
                <div>
                  <div
                    className="px-4 py-2 font-mono uppercase tracking-widest"
                    style={{ fontSize: 10, color: 'var(--color-text-muted)', background: 'var(--color-surface)' }}
                  >
                    Tasks
                  </div>
                  {selectedDayTasks.map(task => (
                    <div
                      key={task.id}
                      className="px-4 py-3 border-b flex items-start gap-2"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                        style={{ background: PRIORITY_COLOR[task.priority] || 'var(--color-text-muted)' }}
                      />
                      <div>
                        <p
                          className="font-body text-sm"
                          style={{
                            color: task.status === 'done' ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                            textDecoration: task.status === 'done' ? 'line-through' : 'none',
                          }}
                        >
                          {task.title}
                        </p>
                        <p className="font-mono capitalize" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          {task.priority !== 'none' ? task.priority : ''}{task.priority !== 'none' ? ' · ' : ''}{task.status?.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Notes section */}
              {selectedDayNotes.length > 0 && (
                <div>
                  <div
                    className="px-4 py-2 font-mono uppercase tracking-widest"
                    style={{ fontSize: 10, color: 'var(--color-text-muted)', background: 'var(--color-surface)' }}
                  >
                    Notes created
                  </div>
                  {selectedDayNotes.map(note => (
                    <div
                      key={note.id}
                      className="px-4 py-3 border-b flex items-center gap-2"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <FileText size={13} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                      <p className="font-body text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {note.title || 'Untitled'}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty */}
              {selectedDayTasks.length === 0 && selectedDayNotes.length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 gap-2">
                  <CalIcon size={20} strokeWidth={1} style={{ color: 'var(--color-text-muted)' }} />
                  <p className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    Nothing on this day
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
