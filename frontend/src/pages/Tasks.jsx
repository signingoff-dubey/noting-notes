import { useEffect, useState, useRef } from 'react'
import {
  Plus, CheckSquare, Square, Trash2, Calendar, Flag,
  MoreHorizontal, CheckCheck, LayoutList, LayoutGrid,
  ChevronDown, ChevronRight, FolderOpen, GripVertical,
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

/* ── Centered add-task bar ── */
function AddTaskBar({ onSave, folders }) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('none')
  const [dueDate, setDueDate] = useState('')
  const [folder, setFolder] = useState('')
  const [priorityOpen, setPriorityOpen] = useState(false)
  const [folderOpen, setFolderOpen] = useState(false)
  const dateRef = useRef(null)

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
  }

  return (
    <div className="max-w-2xl mx-auto px-5 pt-4 pb-3">
      <div
        className="flex flex-col rounded-xl"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Title input */}
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
          placeholder="What needs to be done?"
          className="bg-transparent outline-none w-full"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-primary)',
            padding: '12px 14px 10px',
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
              onClick={() => { setPriorityOpen(o => !o); setFolderOpen(false) }}
              className="flex items-center gap-1.5 px-2 h-7 rounded-md transition-colors hover:bg-[var(--color-surface-hover)]"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: priority !== 'none' ? PRIORITY_COLORS[priority] : 'var(--color-text-muted)',
              }}
            >
              <Flag size={12} strokeWidth={1.5} />
              {priority !== 'none' ? PRIORITY_LABELS[priority] : 'Priority'}
            </button>
            {priorityOpen && (
              <div
                className="absolute bottom-full mb-1 left-0 border py-1 z-50"
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
                    onClick={() => { setPriority(p); setPriorityOpen(false) }}
                    className="flex items-center gap-2 w-full px-3 h-7 transition-colors"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-xs)',
                      color: p !== 'none' ? PRIORITY_COLORS[p] : 'var(--color-text-muted)',
                      background: priority === p ? 'var(--color-surface-2)' : 'transparent',
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
          <div className="relative">
            <button
              onClick={() => dateRef.current?.showPicker?.()}
              className="flex items-center gap-1.5 px-2 h-7 rounded-md transition-colors hover:bg-[var(--color-surface-hover)]"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: dueDate ? 'var(--color-text-secondary)' : 'var(--color-text-muted)',
              }}
            >
              <Calendar size={12} strokeWidth={1.5} />
              {dueDate ? format(new Date(dueDate + 'T00:00:00'), 'MMM d') : 'Due date'}
            </button>
            <input
              ref={dateRef}
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              tabIndex={-1}
            />
          </div>

          {/* Folder selector */}
          <div className="relative">
            <button
              onClick={() => { setFolderOpen(o => !o); setPriorityOpen(false) }}
              className="flex items-center gap-1.5 px-2 h-7 rounded-md transition-colors hover:bg-[var(--color-surface-hover)]"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: folder ? 'var(--color-text-secondary)' : 'var(--color-text-muted)',
              }}
            >
              <FolderOpen size={12} strokeWidth={1.5} />
              {folder || 'Folder'}
            </button>
            {folderOpen && (
              <div
                className="absolute bottom-full mb-1 left-0 border z-50"
                style={{
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  borderRadius: 8,
                  minWidth: 168,
                  padding: 8,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}
              >
                <input
                  autoFocus
                  value={folder}
                  onChange={e => setFolder(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === 'Escape') setFolderOpen(false)
                  }}
                  placeholder="Folder name..."
                  className="w-full bg-transparent outline-none pb-2 mb-2"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-primary)',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                />
                {folders.length > 0 && (
                  <div className="flex flex-col gap-0.5">
                    {folders.map(f => (
                      <button
                        key={f}
                        onClick={() => { setFolder(f); setFolderOpen(false) }}
                        className="text-left px-2 h-7 rounded-md transition-colors hover:bg-[var(--color-surface-hover)]"
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--text-xs)',
                          color: folder === f ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex-1" />

          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="flex items-center gap-1 px-3 h-7 rounded-md transition-opacity disabled:opacity-30"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              fontWeight: 500,
              background: 'var(--color-accent)',
              color: 'var(--color-bg)',
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
function TaskRow({ task }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const updateTask = useTasksStore(s => s.updateTask)
  const deleteTask = useTasksStore(s => s.deleteTask)
  const isDone = task.status === 'done'

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
          <PriorityBadge priority={task.priority} />
          {task.due_date && (
            <span
              className="flex items-center gap-1 font-mono"
              style={{ fontSize: 10, color: 'var(--color-text-muted)' }}
            >
              <Calendar size={9} strokeWidth={1.5} />
              {format(new Date(task.due_date), 'MMM d')}
            </span>
          )}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Dropdown
              align="right"
              trigger={
                <button
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--color-surface-hover)]"
                  style={{ color: 'var(--color-text-muted)' }}
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

/* ── Task mini-row inside folder card ── */
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
            {format(new Date(task.due_date), 'MMM d')}
          </span>
        )}
      </div>
    </div>
  )
}

/* ── Folder accordion card (grid view) ── */
function FolderCard({ label, tasks }) {
  const [expanded, setExpanded] = useState(true)
  const doneCount = tasks.filter(t => t.status === 'done').length
  const isUnlabeled = label === 'Unlabeled'

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
    >
      <button
        onClick={() => setExpanded(v => !v)}
        className="flex items-center gap-3 w-full px-4 py-3 transition-colors hover:bg-[var(--color-surface-hover)]"
        style={{
          background: 'none',
          borderBottom: expanded ? '1px solid var(--color-border)' : 'none',
        }}
      >
        <FolderOpen
          size={14}
          strokeWidth={1.5}
          style={{ color: isUnlabeled ? 'var(--color-text-muted)' : 'var(--color-accent)', flexShrink: 0 }}
        />
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
        <span className="font-mono mr-1" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
          {doneCount}/{tasks.length}
        </span>
        {expanded
          ? <ChevronDown size={13} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          : <ChevronRight size={13} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
        }
      </button>

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

  // Reset local order when filter changes
  useEffect(() => { setLocalOrder(null) }, [filter])

  const totalCount = tasks.filter(t => !t.archived).length
  const doneCount = tasks.filter(t => t.status === 'done' && !t.archived).length

  // Derive folders from task labels
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

  // Group by folder for grid view
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

  const isEmpty = filteredTasks.length === 0

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="ink-page-header">
        <div className="flex items-center gap-2 flex-1">
          <h1 className="ink-page-title">Tasks</h1>
          <span className="ink-count">{totalCount}</span>
          {doneCount > 0 && (
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              · {doneCount} done
            </span>
          )}
        </div>

        {/* View toggles — list + grid only */}
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
              }}
            >
              {v.icon}
            </button>
          ))}
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div
        className="flex items-center gap-1.5 px-5 py-2.5 border-b shrink-0"
        style={{ borderColor: 'var(--color-border)' }}
      >
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

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Add task bar — always visible */}
        <AddTaskBar onSave={handleCreate} folders={folders} />

        {isEmpty ? (
          <EmptyState filter={filter} />
        ) : (
          <>
            {/* LIST VIEW */}
            {viewMode === 'list' && (
              <div className="max-w-2xl mx-auto px-5 pb-5 flex flex-col gap-1.5">
                {displayTasks.map((task, i) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={e => handleDragOver(e, i)}
                    onDrop={handleDrop}
                    style={{ opacity: dragIndex === i ? 0.5 : 1, cursor: 'grab' }}
                  >
                    <TaskRow task={task} />
                  </div>
                ))}
              </div>
            )}

            {/* GRID VIEW — folder accordion cards */}
            {viewMode === 'grid' && (
              <div className="max-w-2xl mx-auto px-5 pb-5 flex flex-col gap-3">
                {grouped.length === 0 ? (
                  <EmptyState filter={filter} />
                ) : (
                  grouped.map(([label, groupTasks]) => (
                    <FolderCard key={label} label={label} tasks={groupTasks} />
                  ))
                )}
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
