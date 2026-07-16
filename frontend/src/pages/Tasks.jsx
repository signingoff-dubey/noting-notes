import { useEffect, useState } from 'react'
import { Plus, CheckSquare, Square, Trash2, Calendar as CalIcon, MoreHorizontal } from 'lucide-react'
import { useTasksStore } from '@/store/tasksStore'
import { toast } from '@/store/uiStore'
import { ConfirmModal } from '@/components/ui/Modal'
import { Dropdown } from '@/components/ui/Dropdown'
import { format, isToday, isTomorrow, isPast } from 'date-fns'

const PRIORITY_DOT = {
  urgent: 'var(--color-priority-urgent)',
  high:   'var(--color-priority-high)',
  medium: 'var(--color-priority-medium)',
  low:    'var(--color-priority-low)',
  none:   'var(--color-text-muted)',
}

const STATUS_OPTIONS = ['todo', 'in_progress', 'done']

function TaskCard({ task }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const updateTask = useTasksStore(s => s.updateTask)
  const deleteTask = useTasksStore(s => s.deleteTask)

  const isDone = task.status === 'done'
  const due = task.due_date ? new Date(task.due_date) : null
  const overdue = due && isPast(due) && !isDone

  const dueLabel = due
    ? isToday(due) ? 'Today'
    : isTomorrow(due) ? 'Tomorrow'
    : format(due, 'MMM d')
    : null

  const toggleDone = async () => {
    const next = isDone ? 'todo' : 'done'
    try { await updateTask(task.id, { status: next }) } catch { toast.error('Failed to update task') }
  }

  const handleDelete = async () => {
    try { await deleteTask(task.id); toast.success('Task deleted') } catch { toast.error('Failed to delete') }
    setConfirmDelete(false)
  }

  return (
    <>
      <div
        className="group relative flex flex-col gap-3 p-4 border transition-colors"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          borderRadius: 2,
          opacity: isDone ? 0.65 : 1,
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-border-strong)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
      >
        {/* Title row */}
        <div className="flex items-start gap-3">
          <button
            onClick={toggleDone}
            className="shrink-0 mt-0.5 transition-colors"
            style={{ color: isDone ? 'var(--color-success)' : 'var(--color-text-muted)' }}
          >
            {isDone
              ? <CheckSquare size={15} strokeWidth={1.5} />
              : <Square size={15} strokeWidth={1.5} />
            }
          </button>
          <div className="flex-1 min-w-0">
            <p
              className="font-body text-sm"
              style={{
                color: isDone ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                textDecoration: isDone ? 'line-through' : 'none',
              }}
            >
              {task.title}
            </p>
            {task.description && (
              <p className="font-body mt-1 truncate" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                {task.description}
              </p>
            )}
          </div>

          {/* Hover actions */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
            <Dropdown
              align="right"
              trigger={
                <button className="transition-colors" style={{ color: 'var(--color-text-muted)' }}>
                  <MoreHorizontal size={13} strokeWidth={1.5} />
                </button>
              }
              items={[
                ...STATUS_OPTIONS.map(s => ({
                  label: `Mark as ${s.replace('_', ' ')}`,
                  onClick: () => updateTask(task.id, { status: s }),
                })),
                { separator: true },
                { label: 'Archive', onClick: () => updateTask(task.id, { archived: true }) },
                { separator: true },
                { label: 'Delete', icon: <Trash2 size={12} strokeWidth={1.5} />, destructive: true, onClick: () => setConfirmDelete(true) },
              ]}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 pl-[27px]">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: PRIORITY_DOT[task.priority || 'none'] }} />
          <span className="font-mono capitalize" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
            {task.status?.replace('_', ' ')}
          </span>
          {dueLabel && (
            <span
              className="flex items-center gap-1 font-mono"
              style={{ fontSize: 10, color: overdue ? 'var(--color-error)' : 'var(--color-text-muted)' }}
            >
              <CalIcon size={9} strokeWidth={1.5} />
              {dueLabel}
            </span>
          )}
          {(task.labels || []).map(label => (
            <span
              key={label}
              className="font-mono border"
              style={{
                fontSize: 10,
                padding: '0 5px',
                borderRadius: 2,
                color: 'var(--color-text-muted)',
                borderColor: 'var(--color-border)',
                background: 'var(--color-surface-2)',
              }}
            >
              {label}
            </span>
          ))}
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

function NewTaskInline({ onSave, onCancel }) {
  const [title, setTitle] = useState('')
  const handleSubmit = (e) => {
    e.preventDefault()
    if (title.trim()) onSave(title.trim())
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 p-4 border"
      style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-accent)', borderRadius: 2 }}
    >
      <Square size={15} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
      <input
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Escape') onCancel() }}
        onBlur={() => { if (!title.trim()) onCancel() }}
        placeholder="Task title..."
        className="flex-1 bg-transparent font-body text-sm outline-none"
        style={{ color: 'var(--color-text-primary)' }}
      />
      <button type="submit" className="font-mono transition-opacity hover:opacity-70" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)' }}>
        Save
      </button>
      <button type="button" onClick={onCancel} className="font-mono transition-colors" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
        Cancel
      </button>
    </form>
  )
}

function SkeletonCard() {
  return (
    <div className="p-4 border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: 2 }}>
      <div className="skeleton h-4 w-2/3 mb-2 rounded" />
      <div className="skeleton h-3 w-1/3 rounded" />
    </div>
  )
}

export function Tasks() {
  const { fetchTasks, createTask, getFilteredTasks, isLoading, filter, setFilter } = useTasksStore()
  const [adding, setAdding] = useState(false)

  useEffect(() => { fetchTasks() }, [])

  const tasks = getFilteredTasks()

  const handleCreate = async (title) => {
    try {
      await createTask({ title })
      setAdding(false)
      toast.success('Task created')
    } catch {
      toast.error('Failed to create task')
    }
  }

  const filterOptions = [
    { label: 'All',         value: 'all' },
    { label: 'To Do',       value: 'todo' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Done',        value: 'done' },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 shrink-0 border-b"
        style={{ height: 48, borderColor: 'var(--color-border)' }}
      >
        <h2 className="font-mono" style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
          Tasks
        </h2>
        <div className="flex items-center gap-1 flex-1">
          {filterOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter({ status: opt.value })}
              className="h-6 px-2.5 font-mono transition-colors"
              style={{
                borderRadius: 2,
                fontSize: 'var(--text-xs)',
                background: filter.status === opt.value ? 'var(--color-surface-active)' : 'transparent',
                color: filter.status === opt.value ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 h-[30px] px-3 border font-mono transition-colors"
          style={{
            borderRadius: 2,
            borderColor: 'var(--color-accent)',
            background: 'var(--color-accent-dim)',
            color: 'var(--color-accent)',
            fontSize: 'var(--text-xs)',
          }}
        >
          <Plus size={11} strokeWidth={1.5} />
          New task
        </button>
      </div>

      {/* Card grid */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading && !tasks.length ? (
          <div className="grid grid-cols-2 gap-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 p-4">
            {adding && (
              <div className="col-span-2">
                <NewTaskInline onSave={handleCreate} onCancel={() => setAdding(false)} />
              </div>
            )}
            {tasks.length === 0 && !adding ? (
              <div className="col-span-2 flex flex-col items-center justify-center h-40 gap-3">
                <CheckSquare size={28} strokeWidth={1} style={{ color: 'var(--color-text-muted)' }} />
                <p className="font-mono text-sm" style={{ color: 'var(--color-text-secondary)' }}>No tasks</p>
                <button
                  onClick={() => setAdding(true)}
                  className="font-mono transition-opacity hover:opacity-70"
                  style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)' }}
                >
                  + Create your first task
                </button>
              </div>
            ) : (
              tasks.map(task => <TaskCard key={task.id} task={task} />)
            )}
          </div>
        )}
      </div>
    </div>
  )
}
