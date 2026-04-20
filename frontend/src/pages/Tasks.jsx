import { useEffect, useState } from 'react'
import { Plus, CheckSquare, Square, Trash2, Calendar, Flag, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useTasksStore } from '@/store/tasksStore'
import { toast } from '@/store/uiStore'
import { ConfirmModal } from '@/components/ui/Modal'
import { Dropdown } from '@/components/ui/Dropdown'
import { format } from 'date-fns'

const PRIORITY_COLORS = {
  urgent: 'text-[var(--color-priority-urgent)]',
  high:   'text-[var(--color-priority-high)]',
  medium: 'text-[var(--color-priority-medium)]',
  low:    'text-[var(--color-priority-low)]',
  none:   'text-text-muted',
}

const STATUS_OPTIONS = ['todo', 'in_progress', 'done', 'archived']
const PRIORITY_OPTIONS = ['none', 'low', 'medium', 'high', 'urgent']

function TaskRow({ task }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const updateTask = useTasksStore(s => s.updateTask)
  const deleteTask = useTasksStore(s => s.deleteTask)

  const toggleDone = async () => {
    const next = task.status === 'done' ? 'todo' : 'done'
    try { await updateTask(task.id, { status: next }) } catch { toast.error('Failed to update task') }
  }

  const handleDelete = async () => {
    try { await deleteTask(task.id); toast.success('Task deleted') } catch { toast.error('Failed to delete') }
    setConfirmDelete(false)
  }

  const isDone = task.status === 'done'

  return (
    <>
      <div className={cn(
        'group flex items-center gap-3 px-4 py-3 border-b border-border transition-colors hover:bg-surface',
        isDone && 'opacity-60',
      )}>
        <button onClick={toggleDone} className="shrink-0 text-text-muted hover:text-text-secondary transition-colors">
          {isDone
            ? <CheckSquare size={16} strokeWidth={1.5} className="text-success" />
            : <Square size={16} strokeWidth={1.5} />
          }
        </button>

        <div className="flex-1 min-w-0">
          <p className={cn('font-body text-base text-text-primary', isDone && 'line-through text-text-muted')}>
            {task.title}
          </p>
          {task.description && (
            <p className="font-body text-sm text-text-muted truncate">{task.description}</p>
          )}
          <div className="flex items-center gap-3 mt-1">
            {task.due_date && (
              <span className="flex items-center gap-1 font-mono text-xs text-text-muted">
                <Calendar size={10} strokeWidth={1.5} />
                {format(new Date(task.due_date), 'MMM d, yyyy')}
              </span>
            )}
            {(task.labels || []).map(label => (
              <span key={label} className="h-4 px-1.5 border border-border rounded-sm font-mono text-xs text-text-muted bg-surface-2">
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Flag size={13} strokeWidth={1.5} className={PRIORITY_COLORS[task.priority || 'none']} />
          <span className="font-mono text-xs text-text-muted capitalize hidden group-hover:inline">
            {task.status?.replace('_', ' ')}
          </span>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Dropdown
              align="right"
              trigger={
                <button className="text-text-muted hover:text-text-secondary transition-colors">
                  <MoreHorizontal size={14} strokeWidth={1.5} />
                </button>
              }
              items={[
                ...STATUS_OPTIONS.map(s => ({
                  label: `Mark as ${s.replace('_', ' ')}`,
                  onClick: () => updateTask(task.id, { status: s }),
                })),
                { separator: true },
                { label: 'Delete', icon: <Trash2 size={12} strokeWidth={1.5} />, destructive: true, onClick: () => setConfirmDelete(true) },
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

function NewTaskRow({ onSave, onCancel }) {
  const [title, setTitle] = useState('')
  const handleSubmit = (e) => {
    e.preventDefault()
    if (title.trim()) onSave(title.trim())
  }
  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface-2">
      <Square size={16} strokeWidth={1.5} className="shrink-0 text-text-muted" />
      <input
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Escape') onCancel() }}
        onBlur={() => { if (!title.trim()) onCancel() }}
        placeholder="Task title..."
        className="flex-1 bg-transparent font-body text-base text-text-primary placeholder:text-text-muted outline-none"
      />
      <button type="submit" className="font-mono text-xs text-accent hover:opacity-80 transition-opacity">Save</button>
      <button type="button" onClick={onCancel} className="font-mono text-xs text-text-muted hover:text-text-secondary transition-colors">Cancel</button>
    </form>
  )
}

export function Tasks() {
  const { fetchTasks, createTask, getFilteredTasks, filter, setFilter } = useTasksStore()
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
    { label: 'All', value: 'all' },
    { label: 'To Do', value: 'todo' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Done', value: 'done' },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-12 border-b border-border shrink-0">
        <h2 className="font-mono text-base text-text-primary">Tasks</h2>
        <div className="flex items-center gap-1 flex-1">
          {filterOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter({ status: opt.value })}
              className={cn(
                'h-6 px-2.5 rounded-sm font-mono text-xs transition-colors',
                filter.status === opt.value
                  ? 'bg-surface-active text-text-primary'
                  : 'text-text-muted hover:text-text-secondary',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 h-7 px-3 border border-border rounded-sm font-mono text-xs text-text-secondary hover:border-border-strong hover:bg-surface-hover hover:text-text-primary transition-all"
        >
          <Plus size={12} strokeWidth={1.5} />
          New task
        </button>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {adding && <NewTaskRow onSave={handleCreate} onCancel={() => setAdding(false)} />}
        {tasks.length === 0 && !adding ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <CheckSquare size={32} strokeWidth={1} className="text-text-muted" />
            <p className="font-mono text-sm text-text-secondary">No tasks</p>
            <button
              onClick={() => setAdding(true)}
              className="font-mono text-xs text-accent hover:opacity-80 transition-opacity"
            >
              + Create your first task
            </button>
          </div>
        ) : (
          tasks.map(task => <TaskRow key={task.id} task={task} />)
        )}
      </div>
    </div>
  )
}
