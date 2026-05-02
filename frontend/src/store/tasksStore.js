import { create } from 'zustand'
import { nanoid } from 'nanoid'

const TASKS_KEY = 'ink_tasks'

function loadTasks() {
  try { return JSON.parse(localStorage.getItem(TASKS_KEY) || '[]') } catch { return [] }
}

function saveTasks(tasks) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
}

export const useTasksStore = create((set, get) => ({
  tasks: [],
  activeTaskId: null,
  filter: { status: 'all', priority: 'all', label: 'all' },
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null })
    set({ tasks: loadTasks(), isLoading: false })
  },

  createTask: async (data) => {
    const now = new Date().toISOString()
    const task = {
      id: nanoid(),
      title: 'New Task',
      priority: 'none',
      status: 'todo',
      labels: [],
      subtasks: [],
      recurrence: null,
      created_at: now,
      updated_at: now,
      ...data,
    }
    const tasks = [task, ...get().tasks]
    saveTasks(tasks)
    set({ tasks })
    return task
  },

  updateTask: async (id, data) => {
    const updated = { ...data, updated_at: new Date().toISOString() }
    const tasks = get().tasks.map(t => t.id === id ? { ...t, ...updated } : t)
    saveTasks(tasks)
    set({ tasks })
    return tasks.find(t => t.id === id)
  },

  deleteTask: async (id) => {
    const tasks = get().tasks.filter(t => t.id !== id)
    saveTasks(tasks)
    set(state => ({
      tasks,
      activeTaskId: state.activeTaskId === id ? null : state.activeTaskId,
    }))
  },

  reorderTasks: (fromId, toId) => {
    set(state => {
      const tasks = [...state.tasks]
      const fromIdx = tasks.findIndex(t => t.id === fromId)
      const toIdx = tasks.findIndex(t => t.id === toId)
      if (fromIdx === -1 || toIdx === -1) return state
      const [moved] = tasks.splice(fromIdx, 1)
      tasks.splice(toIdx, 0, moved)
      saveTasks(tasks)
      return { tasks }
    })
  },

  setActiveTaskId: (id) => set({ activeTaskId: id }),
  setFilter: (filter) => set(state => ({ filter: { ...state.filter, ...filter } })),

  getFilteredTasks: () => {
    const { tasks, filter } = get()
    return tasks.filter(t => {
      if (t.archived) return false
      if (filter.status !== 'all' && t.status !== filter.status) return false
      if (filter.priority !== 'all' && t.priority !== filter.priority) return false
      if (filter.label !== 'all' && !t.labels?.includes(filter.label)) return false
      return true
    })
  },

  addSubtask: async (taskId, title) => {
    const task = get().tasks.find(t => t.id === taskId)
    if (!task) return
    const subtask = { id: nanoid(), title, done: false }
    const subtasks = [...(task.subtasks || []), subtask]
    await get().updateTask(taskId, { subtasks })
    return subtask
  },

  toggleSubtask: async (taskId, subtaskId) => {
    const task = get().tasks.find(t => t.id === taskId)
    if (!task) return
    const subtasks = (task.subtasks || []).map(s =>
      s.id === subtaskId ? { ...s, done: !s.done } : s
    )
    await get().updateTask(taskId, { subtasks })
  },

  deleteSubtask: async (taskId, subtaskId) => {
    const task = get().tasks.find(t => t.id === taskId)
    if (!task) return
    const subtasks = (task.subtasks || []).filter(s => s.id !== subtaskId)
    await get().updateTask(taskId, { subtasks })
  },

  getArchivedTasks: () => get().tasks.filter(t => t.archived),

  getUpcomingTasks: (limit = 5) => get().tasks
    .filter(t => !t.archived && t.status !== 'done' && t.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, limit),
}))
