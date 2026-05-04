import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useNotesStore } from '@/store/notesStore'
import { useUIStore } from '@/store/uiStore'
import { toast } from '@/store/uiStore'
import { format, subDays, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, getDay } from 'date-fns'
import { ChevronLeft, ChevronRight, Flame, BookOpen, Sun, Moon, CloudRain, Zap, Heart, Frown, Meh, Smile, SmilePlus } from 'lucide-react'
import { cn } from '@/lib/cn'

const MOOD_OPTIONS = [
  { value: 'great',   icon: SmilePlus, label: 'Great',   color: 'var(--color-accent)' },
  { value: 'good',    icon: Smile,     label: 'Good',    color: '#00d26a' },
  { value: 'neutral', icon: Meh,       label: 'Neutral', color: 'var(--color-text-muted)' },
  { value: 'bad',     icon: Frown,     label: 'Bad',     color: '#eb0029' },
]

const JOURNAL_TEMPLATE = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Mood' }] },
    { type: 'paragraph', content: [{ type: 'text', text: '' }] },
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Gratitude' }] },
    { type: 'bulletList', content: [
      { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'I am grateful for...' }] }] },
    ]},
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Goals for today' }] },
    { type: 'taskList', content: [
      { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] },
    ]},
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Reflections' }] },
    { type: 'paragraph', content: [{ type: 'text', text: '' }] },
  ],
}

function getJournalTitle(date) {
  return `Journal — ${format(date, 'EEEE, MMMM d, yyyy')}`
}

function getJournalDateKey(date) {
  return format(date, 'yyyy-MM-dd')
}

/* ── Mini calendar ── */
function MiniCalendar({ selectedDate, onSelect, journalDates }) {
  const [viewMonth, setViewMonth] = useState(startOfMonth(selectedDate))

  const days = useMemo(() => {
    const start = startOfMonth(viewMonth)
    const end = endOfMonth(viewMonth)
    return eachDayOfInterval({ start, end })
  }, [viewMonth])

  const startDay = getDay(days[0])
  const blanks = Array.from({ length: startDay })

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setViewMonth(d => startOfMonth(subDays(d, 1)))}
          className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-[var(--color-surface-hover)]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ChevronLeft size={13} strokeWidth={1.5} />
        </button>
        <span className="font-mono" style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
          {format(viewMonth, 'MMMM yyyy')}
        </span>
        <button
          onClick={() => setViewMonth(d => startOfMonth(addDays(endOfMonth(d), 1)))}
          className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-[var(--color-surface-hover)]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ChevronRight size={13} strokeWidth={1.5} />
        </button>
      </div>
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <span key={d} className="font-mono" style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>{d}</span>
        ))}
      </div>
      {/* Days */}
      <div className="grid grid-cols-7 gap-0.5">
        {blanks.map((_, i) => <div key={`b-${i}`} />)}
        {days.map(day => {
          const key = getJournalDateKey(day)
          const hasEntry = journalDates.has(key)
          const selected = isSameDay(day, selectedDate)
          const today = isToday(day)
          const future = !isBefore(day, new Date()) && !today

          return (
            <button
              key={key}
              onClick={() => !future && onSelect(day)}
              disabled={future}
              className="w-7 h-7 flex items-center justify-center rounded-md font-mono transition-colors"
              style={{
                fontSize: 10,
                color: future
                  ? 'var(--color-text-muted)'
                  : selected
                    ? 'var(--color-bg)'
                    : today
                      ? 'var(--color-accent)'
                      : hasEntry
                        ? 'var(--color-text-primary)'
                        : 'var(--color-text-muted)',
                background: selected
                  ? 'var(--color-accent)'
                  : 'transparent',
                opacity: future ? 0.3 : 1,
                cursor: future ? 'default' : 'pointer',
              }}
            >
              {format(day, 'd')}
              {hasEntry && !selected && (
                <span
                  className="absolute bottom-0.5 w-1 h-1 rounded-full"
                  style={{ background: 'var(--color-accent)' }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Streak counter ── */
function StreakDisplay({ journalDates }) {
  const streak = useMemo(() => {
    let count = 0
    let day = new Date()
    // If no entry today, start from yesterday
    if (!journalDates.has(getJournalDateKey(day))) {
      day = subDays(day, 1)
    }
    while (journalDates.has(getJournalDateKey(day))) {
      count++
      day = subDays(day, 1)
    }
    return count
  }, [journalDates])

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--color-accent-dim)' }}>
      <Flame size={14} strokeWidth={1.5} style={{ color: 'var(--color-accent)' }} />
      <span className="font-mono" style={{ fontSize: 11, color: 'var(--color-text-primary)' }}>
        {streak} day streak
      </span>
    </div>
  )
}

/* ── Mood picker ── */
function MoodPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      {MOOD_OPTIONS.map(opt => {
        const Icon = opt.icon
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            title={opt.label}
            className="flex flex-col items-center gap-1 transition-all"
            style={{ opacity: active ? 1 : 0.4 }}
          >
            <div
              className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
              style={{
                background: active ? `color-mix(in oklch, ${opt.color} 15%, transparent)` : 'transparent',
                border: active ? `1px solid ${opt.color}44` : '1px solid transparent',
              }}
            >
              <Icon size={18} strokeWidth={1.5} style={{ color: opt.color }} />
            </div>
            <span className="font-mono" style={{ fontSize: 9, color: opt.color }}>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ── Main Journal page ── */
export function Journal() {
  const notes = useNotesStore(s => s.notes)
  const createNote = useNotesStore(s => s.createNote)
  const updateNote = useNotesStore(s => s.updateNote)
  const setActiveNote = useNotesStore(s => s.setActiveNote)
  const [selectedDate, setSelectedDate] = useState(new Date())

  // All journal entries indexed by date key
  const journalMap = useMemo(() => {
    const map = new Map()
    notes.filter(n => n._source === 'journal' && !n.archived).forEach(n => {
      // Extract date from title "Journal — Weekday, Month Day, Year"
      const match = n.title?.match(/Journal — .+, (\w+ \d+, \d{4})/)
      if (match) {
        try {
          const d = new Date(match[1])
          if (!isNaN(d)) map.set(getJournalDateKey(d), n)
        } catch {}
      }
      // Also try created_at date as fallback
      if (n.created_at) {
        const key = getJournalDateKey(new Date(n.created_at))
        if (!map.has(key)) map.set(key, n)
      }
    })
    return map
  }, [notes])

  const journalDates = useMemo(() => new Set(journalMap.keys()), [journalMap])

  const todayEntry = journalMap.get(getJournalDateKey(selectedDate))

  // Journal metadata stored in note itself
  const mood = todayEntry?.journal_mood || null

  const handleOpenEntry = async () => {
    const key = getJournalDateKey(selectedDate)
    let entry = journalMap.get(key)

    if (!entry) {
      // Create new journal entry
      try {
        entry = await createNote({
          title: getJournalTitle(selectedDate),
          content: JOURNAL_TEMPLATE,
          tags: [],
          _source: 'journal',
          journal_mood: null,
        })
        toast.success('Journal entry created')
      } catch {
        toast.error('Failed to create journal entry')
        return
      }
    }

    setActiveNote(entry.id)
  }

  const handleMoodChange = async (newMood) => {
    if (!todayEntry) {
      // Create entry first
      try {
        await createNote({
          title: getJournalTitle(selectedDate),
          content: JOURNAL_TEMPLATE,
          tags: [],
          _source: 'journal',
          journal_mood: newMood,
        })
      } catch {
        toast.error('Failed to create journal entry')
        return
      }
    } else {
      await updateNote(todayEntry.id, { journal_mood: newMood })
    }
  }

  // Recent entries for sidebar list
  const recentEntries = useMemo(() => {
    return notes
      .filter(n => n._source === 'journal' && !n.archived)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 7)
  }, [notes])

  const extractPreview = (content, limit = 80) => {
    if (!content) return ''
    if (typeof content === 'string') return content.slice(0, limit)
    const texts = []
    const walk = (node) => {
      if (node?.type === 'text' && node.text) texts.push(node.text)
      if (Array.isArray(node?.content)) node.content.forEach(walk)
    }
    walk(content)
    return texts.join(' ').slice(0, limit)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-6 shrink-0 border-b"
        style={{ height: 48, borderColor: 'var(--color-border)' }}
      >
        <BookOpen size={16} strokeWidth={1.5} style={{ color: 'var(--color-accent)' }} />
        <h2 className="font-mono" style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
          Journal
        </h2>
        <div className="flex-1" />
        <StreakDisplay journalDates={journalDates} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        <div className="max-w-3xl mx-auto flex gap-8">
          {/* Left: Calendar + mood */}
          <div className="flex flex-col gap-5 w-64 shrink-0">
            <div className="border p-4" style={{ borderRadius: 10, borderColor: 'var(--color-border)' }}>
              <MiniCalendar
                selectedDate={selectedDate}
                onSelect={setSelectedDate}
                journalDates={journalDates}
              />
            </div>

            {/* Today's mood */}
            <div className="border p-4 flex flex-col gap-3" style={{ borderRadius: 10, borderColor: 'var(--color-border)' }}>
              <span className="font-mono" style={{ fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {isToday(selectedDate) ? "Today's mood" : format(selectedDate, 'MMM d') + ' mood'}
              </span>
              <MoodPicker value={mood} onChange={handleMoodChange} />
            </div>

            {/* Quick stats */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <span className="font-mono" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Total entries</span>
                <span className="font-mono" style={{ fontSize: 11, color: 'var(--color-text-primary)' }}>{journalDates.size}</span>
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="font-mono" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>This month</span>
                <span className="font-mono" style={{ fontSize: 11, color: 'var(--color-text-primary)' }}>
                  {[...journalDates].filter(d => d.startsWith(format(selectedDate, 'yyyy-MM'))).length}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Entry view */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Date header */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <h3 className="font-mono" style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>
                  {format(selectedDate, 'EEEE')}
                </h3>
                <span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  {format(selectedDate, 'MMMM d, yyyy')}
                </span>
              </div>
              <button
                onClick={handleOpenEntry}
                className="flex items-center gap-2 px-4 h-9 rounded-lg font-mono transition-colors"
                style={{
                  fontSize: 12,
                  background: 'var(--color-accent)',
                  color: 'var(--color-bg)',
                  fontWeight: 600,
                }}
              >
                {todayEntry ? 'Open entry' : 'Write entry'}
              </button>
            </div>

            {/* Entry preview or empty state */}
            {todayEntry ? (
              <button
                onClick={handleOpenEntry}
                className="border p-5 text-left transition-colors hover:bg-[var(--color-surface-hover)]"
                style={{ borderRadius: 10, borderColor: 'var(--color-border)' }}
              >
                <p className="font-body" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                  {extractPreview(todayEntry.content, 300) || 'Entry started — click to continue writing'}
                </p>
                {todayEntry.journal_mood && (
                  <div className="flex items-center gap-1.5 mt-3">
                    {(() => {
                      const m = MOOD_OPTIONS.find(o => o.value === todayEntry.journal_mood)
                      if (!m) return null
                      const Icon = m.icon
                      return <>
                        <Icon size={12} strokeWidth={1.5} style={{ color: m.color }} />
                        <span className="font-mono" style={{ fontSize: 10, color: m.color }}>{m.label}</span>
                      </>
                    })()}
                  </div>
                )}
              </button>
            ) : (
              <div
                className="border border-dashed flex flex-col items-center justify-center py-12 gap-3"
                style={{ borderRadius: 10, borderColor: 'var(--color-border)' }}
              >
                <BookOpen size={24} strokeWidth={1} style={{ color: 'var(--color-text-muted)' }} />
                <p className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  No entry for this day
                </p>
                <button
                  onClick={handleOpenEntry}
                  className="font-mono px-4 h-8 rounded-md transition-colors"
                  style={{
                    fontSize: 11,
                    color: 'var(--color-accent)',
                    background: 'var(--color-accent-dim)',
                  }}
                >
                  Start writing
                </button>
              </div>
            )}

            {/* Recent entries */}
            <div className="flex flex-col gap-2 mt-4">
              <span className="font-mono" style={{ fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Recent entries
              </span>
              {recentEntries.length === 0 ? (
                <p className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  No journal entries yet
                </p>
              ) : (
                recentEntries.map(entry => (
                  <button
                    key={entry.id}
                    onClick={() => setActiveNote(entry.id)}
                    className="flex items-center gap-3 px-3 py-2.5 border text-left transition-colors hover:bg-[var(--color-surface-hover)]"
                    style={{ borderRadius: 8, borderColor: 'var(--color-border)' }}
                  >
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="font-mono truncate" style={{ fontSize: 11, color: 'var(--color-text-primary)' }}>
                        {entry.title?.replace('Journal — ', '') || 'Untitled'}
                      </span>
                      <span className="font-mono truncate" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                        {extractPreview(entry.content, 60) || 'Empty entry'}
                      </span>
                    </div>
                    {entry.journal_mood && (() => {
                      const m = MOOD_OPTIONS.find(o => o.value === entry.journal_mood)
                      if (!m) return null
                      const Icon = m.icon
                      return <Icon size={13} strokeWidth={1.5} style={{ color: m.color }} />
                    })()}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
