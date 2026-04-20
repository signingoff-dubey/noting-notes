import { create } from 'zustand'
import { api } from '@/lib/api'

export const useTasksStore = create((set, get) => ({
  tasks: [],
  activeTaskId: null,
  filter: { status: 'all', priority: 'all', label: 'all' },
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null })
    try {
      const tasks = await api.tasks.list()
      set({ tasks, isLoading: false })
    } catch (err) {
      set({ error: err.message, isLoading: false })
    }
  },

  createTask: async (data) => {
    try {
      const task = await api.tasks.create({
        title: 'New Task',
        priority: 'none',
        status: 'todo',
        labels: [],
        ...data,
      })
      set(state => ({ tasks: [task, ...state.tasks] }))
      return task
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  updateTask: async (id, data) => {
    try {
      const updated = await api.tasks.update(id, data)
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, ...updated } : t),
      }))
      return updated
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  deleteTask: async (id) => {
    try {
      await api.tasks.delete(id)
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== id),
        activeTaskId: state.activeTaskId === id ? null : state.activeTaskId,
      }))
    } catch (err) {
      set({ error: err.message })
      throw err
    }
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

  getArchivedTasks: () => {
    return get().tasks.filter(t => t.archived)
  },

  getUpcomingTasks: (limit = 5) => {
    return get().tasks
      .filter(t => !t.archived && t.status !== 'done' && t.due_date)
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, limit)
  },
}))
