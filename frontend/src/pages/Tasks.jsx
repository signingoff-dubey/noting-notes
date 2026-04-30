import { useEffect, useState, useRef } from 'react'
import {
  Plus, CheckSquare, Square, Trash2, Calendar, Flag,
  MoreHorizontal, CheckCheck, LayoutList, LayoutGrid,
  ChevronDown, ChevronRight, FolderOpen, GripVertical, Pencil,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useTasksStore } from '@/store/tasksStore'
import { toast } from '@/store/uiStore'
import { ConfirmModal } from '@/components/ui/Modal'
import { Dropdown } from '@/components/ui/Dropdown'
import { format } from 'date-fns'

const PRIORITY_COLORS = {
  urgent: 'var(--color-priority-urgent)',
  high:   'var(--color-priority-high)',
  medium: 'var(--color-priority-medium)',
  low:    'var(--color-priority-low)',
  none:   'var(--color-text-muted)',
}
const PRIORITY_LABELS = { urgent: 'Urgent', high: 'High', medium: 'Medium', low: 'Low', none: 'None' }
const PRIORITY_OPTIONS = ['none', 'low', 'medium', 'high', 'urgent']
const STATUS_OPTIONS = ['todo', 'in_progress', 'done', 'archived']

function PriorityBadge({ priority }) {
  if (!priority || priority === 'none') return null
  return (
    <span
      className="inline-flex items-center gap-1 font-mono"
      style={{
        fontSize: 10,
        color: PRIORITY_COLORS[priority],
        background: PRIORITY_COLORS[priority] + '18',
        border: `1px solid ${PRIORITY_COLORS[priority]}44`,
        borderRadius: 4,
        padding: '1px 6px',
      }}
    >
      <Flag size={9} strokeWidth={2} />
      {PRIORITY_LABELS[priority]}
    </span>
  )
}

/* ── Centered add-task bubble ── */
function AddTaskBar({ onSave, folders }) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('none')
  const [dueDate, setDueDate] = useState('')
  const [folder, setFolder] = useState('')
  const [priorityOpen, setPriorityOpen] = useState(false)
  const [folderOpen, setFolderOpen] = useState(false)
  const [bubbleFocused, setBubbleFocused] = useState(false)
  const [folderSearch, setFolderSearch] = useState('')
  const bubbleRef = useRef(null)
  const dateInputRef = useRef(null)

  const handleSubmit = () => {
    if (!title.trim()) return
    const task = { title: title.trim(), priority }
    if (dueDate) task.due_date = dueDate
    if (folder.trim()) task.labels = [folder.trim()]
    onSave(task)
    setTitle('')
    setPriority('none')
    setDueDate('')
    setFolder('')
    setFolderSearch('')
  }

  const handleBubbleBlur = (e) => {
    if (!bubbleRef.current?.contains(e.relatedTarget)) {
      setBubbleFocused(false)
      setPriorityOpen(false)
      setFolderOpen(false)
    }
  }

  const filteredFolders = folders.filter(f =>
    f.toLowerCase().includes(folderSearch.toLowerCase())
  )

  return (
    <div className="max-w-2xl mx-auto px-5 pt-4 pb-3">
      <div
        ref={bubbleRef}
        className="flex flex-col rounded-xl"
        onFocusCapture={() => setBubbleFocused(true)}
        onBlurCapture={handleBubbleBlur}
        style={{
          background: 'var(--color-surface)',
          border: `1px solid ${bubbleFocused ? 'var(--color-accent)' : 'var(--color-border)'}`,
          boxShadow: bubbleFocused
            ? '0 0 0 3px var(--color-accent-dim), 0 0 28px var(--color-accent-dim)'
            : 'none',
          transition: 'border-color 180ms, box-shadow 180ms',
        }}
      >
        {/* Title input */}
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
          placeholder="What needs to be done?"
          className="bg-transparent w-full"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-primary)',
            padding: '12px 14px 10px',
            outline: 'none',
            border: 'none',
          }}
        />

        {/* Action row */}
        <div
          className="flex items-center gap-1 px-2 pb-2"
          style={{ borderTop: '1px solid var(--color-border)', paddingTop: 8 }}
        >
          {/* Priority */}
          <div className="relative">
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => { setPriorityOpen(o => !o); setFolderOpen(false) }}
              className="flex items-center gap-1.5 px-2 h-7 rounded-md transition-colors hover:bg-[var(--color-surface-hover)]"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: priority !== 'none' ? PRIORITY_COLORS[priority] : 'var(--color-text-muted)',
                outline: 'none',
              }}
            >
              <Flag size={12} strokeWidth={1.5} />
              {priority !== 'none' ? PRIORITY_LABELS[priority] : 'Priority'}
            </button>
            {priorityOpen && (
              <div
                className="absolute top-full mt-1 left-0 border py-1 z-50"
                style={{
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  borderRadius: 8,
                  minWidth: 120,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}
              >
                {PRIORITY_OPTIONS.map(p => (
                  <button
                    key={p}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => { setPriority(p); setPriorityOpen(false) }}
                    className="flex items-center gap-2 w-full px-3 h-7 transition-colors hover:bg-[var(--color-surface-hover)]"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-xs)',
                      color: p !== 'none' ? PRIORITY_COLORS[p] : 'var(--color-text-muted)',
                      background: priority === p ? 'var(--color-surface-2)' : 'transparent',
                      outline: 'none',
                    }}
                  >
                    <Flag size={10} strokeWidth={1.5} />
                    {PRIORITY_LABELS[p]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Due date */}
          <button
            onMouseDown={e => e.preventDefault()}
            onClick={() => dateInputRef.current?.showPicker()}
            className="flex items-center gap-1.5 px-2 h-7 rounded-md transition-colors hover:bg-[var(--color-surface-hover)]"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: dueDate ? 'var(--color-text-secondary)' : 'var(--color-text-muted)',
              outline: 'none',
            }}
          >
            <Calendar size={12} strokeWidth={1.5} />
            {dueDate ? format(new Date(dueDate + 'T00:00:00'), 'MMM d') : 'Due date'}
          </button>
          <input
            ref={dateInputRef}
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
          />

          {/* Folder selector */}
          <div className="relative">
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => { setFolderOpen(o => !o); setPriorityOpen(false); setFolderSearch('') }}
              className="flex items-center gap-1.5 px-2 h-7 rounded-md transition-colors hover:bg-[var(--color-surface-hover)]"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: folder ? 'var(--color-text-secondary)' : 'var(--color-text-muted)',
                outline: 'none',
              }}
            >
              <FolderOpen size={12} strokeWidth={1.5} />
              {folder || 'Folder'}
            </button>

            {folderOpen && (
              <div
                className="absolute top-full mt-1 left-0 border z-50"
                style={{
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  borderRadius: 8,
                  minWidth: 180,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  overflow: 'hidden',
                }}
              >
                {/* Search / create input */}
                <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--color-border)' }}>
                  <input
                    autoFocus
                    value={folderSearch}
                    onChange={e => setFolderSearch(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const val = folderSearch.trim()
                        if (val) { setFolder(val); setFolderOpen(false) }
                      }
                      if (e.key === 'Escape') setFolderOpen(false)
                    }}
                    placeholder="Search or create..."
                    className="w-full bg-transparent"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-primary)',
                      outline: 'none',
                      border: 'none',
                    }}
                  />
                </div>

                {/* Clear option */}
                {folder && (
                  <button
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => { setFolder(''); setFolderOpen(false) }}
                    className="flex items-center gap-2 w-full px-3 h-7 transition-colors hover:bg-[var(--color-surface-hover)]"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                      outline: 'none',
                    }}
                  >
                    Clear folder
                  </button>
                )}

                {/* Existing folders */}
                {filteredFolders.length > 0 && (
                  <div className="py-1">
                    {filteredFolders.map(f => (
                      <button
                        key={f}
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => { setFolder(f); setFolderOpen(false) }}
                        className="flex items-center gap-2 w-full px-3 h-7 transition-colors hover:bg-[var(--color-surface-hover)]"
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--text-xs)',
                          color: folder === f ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                          outline: 'none',
                        }}
                      >
                        <FolderOpen size={11} strokeWidth={1.5} />
                        {f}
                      </button>
                    ))}
                  </div>
                )}

                {/* Create new option */}
                {folderSearch.trim() && !folders.includes(folderSearch.trim()) && (
                  <button
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => { setFolder(folderSearch.trim()); setFolderOpen(false) }}
                    className="flex items-center gap-2 w-full px-3 h-7 transition-colors hover:bg-[var(--color-surface-hover)]"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-accent)',
                      borderTop: filteredFolders.length > 0 ? '1px solid var(--color-border)' : 'none',
                      outline: 'none',
                    }}
                  >
                    <Plus size={11} strokeWidth={2} />
                    Create "{folderSearch.trim()}"
                  </button>
                )}

                {filteredFolders.length === 0 && !folderSearch.trim() && (
                  <p
                    className="py-3 text-center font-mono"
                    style={{ fontSize: 10, color: 'var(--color-text-muted)' }}
                  >
                    Type to create a folder
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex-1" />

          <button
            onMouseDown={e => e.preventDefault()}
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="flex items-center gap-1 px-3 h-7 rounded-md transition-opacity disabled:opacity-30"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              fontWeight: 500,
              background: 'var(--color-accent)',
              color: 'var(--color-bg)',
              outline: 'none',
            }}
          >
            <Plus size={12} strokeWidth={2} />
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Task row (list view) ── */
function TaskRow({ task, showFolder }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const updateTask = useTasksStore(s => s.updateTask)
  const deleteTask = useTasksStore(s => s.deleteTask)
  const isDone = task.status === 'done'
  const folderLabel = task.labels?.[0]

  const toggleDone = async () => {
    try { await updateTask(task.id, { status: isDone ? 'todo' : 'done' }) }
    catch { toast.error('Failed to update task') }
  }

  const handleDelete = async () => {
    try { await deleteTask(task.id); toast.success('Task deleted') }
    catch { toast.error('Failed to delete') }
    setConfirmDelete(false)
  }

  return (
    <>
      <div className={cn('ink-task-card group flex items-center gap-2', isDone && 'done')}>
        <div
          className="shrink-0 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <GripVertical size={14} strokeWidth={1.5} />
        </div>

        <button
          onClick={toggleDone}
          className="shrink-0 transition-colors"
          style={{ color: isDone ? 'var(--color-success)' : 'var(--color-text-muted)' }}
        >
          {isDone
            ? <CheckSquare size={16} strokeWidth={1.5} />
            : <Square size={16} strokeWidth={1.5} />}
        </button>

        <span
          className="flex-1 font-medium truncate"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: isDone ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
            textDecoration: isDone ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </span>

        <div className="flex items-center gap-2 shrink-0">
          {showFolder && folderLabel && (
            <span
              className="flex items-center gap-1 font-mono"
              style={{
                fontSize: 10,
                color: 'var(--color-text-muted)',
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                borderRadius: 4,
                padding: '1px 5px',
              }}
            >
              <FolderOpen size={9} strokeWidth={1.5} />
              {folderLabel}
            </span>
          )}
          <PriorityBadge priority={task.priority} />
          {task.due_date && (
            <span
              className="flex items-center gap-1 font-mono"
              style={{ fontSize: 10, color: 'var(--color-text-muted)' }}
            >
              <Calendar size={9} strokeWidth={1.5} />
              {format(new Date(task.due_date + 'T00:00:00'), 'MMM d')}
            </span>
          )}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Dropdown
              align="right"
              trigger={
                <button
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--color-surface-hover)]"
                  style={{ color: 'var(--color-text-muted)', outline: 'none' }}
                >
                  <MoreHorizontal size={13} strokeWidth={1.5} />
                </button>
              }
              items={[
                ...STATUS_OPTIONS.map(s => ({
                  label: `Mark as ${s.replace('_', ' ')}`,
                  onClick: () => updateTask(task.id, { status: s }),
                })),
                { separator: true },
                {
                  label: 'Delete',
                  icon: <Trash2 size={12} strokeWidth={1.5} />,
                  destructive: true,
                  onClick: () => setConfirmDelete(true),
                },
              ]}
            />
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete task"
        message={`Delete "${task.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </>
  )
}

/* ── Folder section header (list view) ── */
function ListFolderHeader({ label, count }) {
  const isUnlabeled = label === 'Unlabeled'
  return (
    <div
      className="flex items-center gap-2 px-1 pt-3 pb-1"
    >
      <FolderOpen
        size={12}
        strokeWidth={1.5}
        style={{ color: isUnlabeled ? 'var(--color-text-muted)' : 'var(--color-accent)' }}
      />
      <span
        className="font-mono uppercase tracking-widest"
        style={{
          fontSize: 10,
          color: isUnlabeled ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
          letterSpacing: '0.1em',
        }}
      >
        {label}
      </span>
      <span className="font-mono" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
        {count}
      </span>
      <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
    </div>
  )
}

/* ── Task mini-row inside folder card (grid view) ── */
function FolderTaskRow({ task }) {
  const updateTask = useTasksStore(s => s.updateTask)
  const isDone = task.status === 'done'

  const toggleDone = async () => {
    try { await updateTask(task.id, { status: isDone ? 'todo' : 'done' }) }
    catch { toast.error('Failed to update task') }
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors hover:bg-[var(--color-surface-hover)]',
        isDone && 'opacity-50',
      )}
    >
      <button
        onClick={toggleDone}
        className="shrink-0 transition-colors"
        style={{ color: isDone ? 'var(--color-success)' : 'var(--color-text-muted)' }}
      >
        {isDone
          ? <CheckSquare size={14} strokeWidth={1.5} />
          : <Square size={14} strokeWidth={1.5} />}
      </button>
      <span
        className="flex-1 truncate"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: isDone ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
          textDecoration: isDone ? 'line-through' : 'none',
        }}
      >
        {task.title}
      </span>
      <div className="flex items-center gap-2 shrink-0">
        <PriorityBadge priority={task.priority} />
        {task.due_date && (
          <span className="font-mono" style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>
            {format(new Date(task.due_date + 'T00:00:00'), 'MMM d')}
          </span>
        )}
      </div>
    </div>
  )
}

/* ── Folder accordion card (grid view) with editable name ── */
function FolderCard({ label, tasks }) {
  const [expanded, setExpanded] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(label)
  const updateTask = useTasksStore(s => s.updateTask)
  const doneCount = tasks.filter(t => t.status === 'done').length
  const isUnlabeled = label === 'Unlabeled'

  const handleRename = async () => {
    const newName = editValue.trim()
    setEditing(false)
    if (!newName || newName === label) { setEditValue(label); return }
    try {
      await Promise.all(
        tasks.map(t =>
          updateTask(t.id, { labels: (t.labels || []).map(l => l === label ? newName : l) })
        )
      )
      toast.success(`Renamed to "${newName}"`)
    } catch {
      toast.error('Failed to rename folder')
      setEditValue(label)
    }
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
    >
      <div
        className="flex items-center gap-3 w-full px-4 py-3"
        style={{ borderBottom: expanded ? '1px solid var(--color-border)' : 'none' }}
      >
        <button
          onClick={() => setExpanded(v => !v)}
          className="shrink-0 transition-colors"
          style={{ color: 'var(--color-text-muted)', outline: 'none' }}
        >
          {expanded
            ? <ChevronDown size={13} strokeWidth={1.5} />
            : <ChevronRight size={13} strokeWidth={1.5} />
          }
        </button>

        <FolderOpen
          size={14}
          strokeWidth={1.5}
          style={{ color: isUnlabeled ? 'var(--color-text-muted)' : 'var(--color-accent)', flexShrink: 0 }}
        />

        {editing ? (
          <input
            autoFocus
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => {
              if (e.key === 'Enter') handleRename()
              if (e.key === 'Escape') { setEditValue(label); setEditing(false) }
            }}
            className="flex-1 bg-transparent font-medium"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-primary)',
              outline: 'none',
              border: 'none',
              borderBottom: '1px solid var(--color-accent)',
            }}
          />
        ) : (
          <span
            className="flex-1 text-left font-medium"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: isUnlabeled ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
            }}
          >
            {label}
          </span>
        )}

        <span className="font-mono mr-1" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
          {doneCount}/{tasks.length}
        </span>

        {!isUnlabeled && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="w-6 h-6 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-colors hover:bg-[var(--color-surface-hover)]"
            style={{ color: 'var(--color-text-muted)', outline: 'none' }}
            title="Rename folder"
          >
            <Pencil size={11} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {expanded && (
        <div className="py-1">
          {tasks.length === 0 ? (
            <p className="font-mono py-3 text-center" style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              No tasks
            </p>
          ) : (
            tasks.map(task => <FolderTaskRow key={task.id} task={task} />)
          )}
        </div>
      )}
    </div>
  )
}

const FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
]

const VIEW_OPTIONS = [
  { icon: <LayoutList size={14} strokeWidth={1.5} />, value: 'list', title: 'List view' },
  { icon: <LayoutGrid size={14} strokeWidth={1.5} />, value: 'grid', title: 'Grid view' },
]

export function Tasks() {
  const { fetchTasks, createTask, getFilteredTasks, filter, setFilter, tasks } = useTasksStore()

  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('ink_tasks_view')
    return (saved === 'list' || saved === 'grid') ? saved : 'list'
  })

  const [dragIndex, setDragIndex] = useState(null)
  const [localOrder, setLocalOrder] = useState(null)

  useEffect(() => { fetchTasks() }, [])

  const filteredTasks = getFilteredTasks()
  const displayTasks = localOrder || filteredTasks

  useEffect(() => { setLocalOrder(null) }, [filter])

  const totalCount = tasks.filter(t => !t.archived).length
  const doneCount = tasks.filter(t => t.status === 'done' && !t.archived).length

  const folders = [...new Set(tasks.flatMap(t => t.labels || []))].filter(Boolean).sort()

  const handleCreate = async (taskData) => {
    try {
      await createTask(taskData)
      toast.success('Task created')
    } catch {
      toast.error('Failed to create task')
    }
  }

  const switchView = (v) => {
    setViewMode(v)
    localStorage.setItem('ink_tasks_view', v)
  }

  const handleDragStart = (i) => setDragIndex(i)
  const handleDragOver = (e, i) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === i) return
    const next = [...displayTasks]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(i, 0, moved)
    setLocalOrder(next)
    setDragIndex(i)
  }
  const handleDrop = () => setDragIndex(null)

  // Group by folder
  const grouped = (() => {
    const map = {}
    for (const t of displayTasks) {
      const key = (t.labels && t.labels.length > 0) ? t.labels[0] : 'Unlabeled'
      if (!map[key]) map[key] = []
      map[key].push(t)
    }
    return Object.entries(map).sort(([a], [b]) => {
      if (a === 'Unlabeled') return 1
      if (b === 'Unlabeled') return -1
      return a.localeCompare(b)
    })
  })()

  const hasFolders = folders.length > 0
  const isEmpty = filteredTasks.length === 0

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="ink-page-header">
        <div className="flex items-center gap-2 flex-1">
          <h1 className="ink-page-title">Tasks</h1>
          {(() => {
            const pending = totalCount - doneCount
            return pending > 0 ? (
              <span className="font-mono" style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                {pending} left
              </span>
            ) : totalCount > 0 ? (
              <span className="font-mono" style={{ fontSize: 11, color: 'var(--color-success)' }}>
                all done
              </span>
            ) : null
          })()}
        </div>

        <div
          className="flex items-center rounded-lg p-0.5"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          {VIEW_OPTIONS.map(v => (
            <button
              key={v.value}
              onClick={() => switchView(v.value)}
              title={v.title}
              className="w-7 h-7 flex items-center justify-center rounded-md transition-all"
              style={{
                color: viewMode === v.value ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                background: viewMode === v.value ? 'var(--color-surface-hover)' : 'transparent',
                outline: 'none',
              }}
            >
              {v.icon}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <AddTaskBar onSave={handleCreate} folders={folders} />

        {/* Filter tabs */}
        <div className="max-w-2xl mx-auto flex items-center gap-1.5 px-5 pb-2">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter({ status: opt.value })}
              className={cn('ink-pill', filter.status === opt.value && 'ink-pill-active')}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {isEmpty ? (
          <EmptyState filter={filter} />
        ) : (
          <>
            {/* LIST VIEW */}
            {viewMode === 'list' && (
              <div className="max-w-2xl mx-auto px-5 pb-5">
                {hasFolders ? (
                  /* Grouped by folder */
                  grouped.map(([label, groupTasks]) => (
                    <div key={label}>
                      <ListFolderHeader label={label} count={groupTasks.length} />
                      <div className="flex flex-col gap-1.5 mb-2">
                        {groupTasks.map((task, i) => (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={() => handleDragStart(i)}
                            onDragOver={e => handleDragOver(e, i)}
                            onDrop={handleDrop}
                            className="panel-enter"
                            style={{ opacity: dragIndex === i ? 0.5 : 1, cursor: 'grab', animationDelay: `${i * 30}ms` }}
                          >
                            <TaskRow task={task} showFolder={false} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  /* Flat list (no folders) */
                  <div className="flex flex-col gap-1.5 pt-2">
                    {displayTasks.map((task, i) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(i)}
                        onDragOver={e => handleDragOver(e, i)}
                        onDrop={handleDrop}
                        className="panel-enter"
                        style={{ opacity: dragIndex === i ? 0.5 : 1, cursor: 'grab', animationDelay: `${i * 30}ms` }}
                      >
                        <TaskRow task={task} showFolder={false} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* GRID VIEW — folder accordion cards */}
            {viewMode === 'grid' && (
              <div className="max-w-2xl mx-auto px-5 pb-5 flex flex-col gap-3 pt-2">
                {grouped.map(([label, groupTasks]) => (
                  <div key={label} className="group">
                    <FolderCard label={label} tasks={groupTasks} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function EmptyState({ filter }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <CheckCheck size={32} strokeWidth={1} style={{ color: 'var(--color-text-muted)' }} />
      <div className="text-center">
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)' }}>
          {filter.status === 'all' ? 'No tasks yet' : `No ${filter.status.replace('_', ' ')} tasks`}
        </p>
        <p className="mt-1 font-mono" style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
          {filter.status === 'all' ? 'Add a task above to get started' : 'Try a different filter'}
        </p>
      </div>
    </div>
  )
}
