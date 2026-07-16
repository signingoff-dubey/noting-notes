import { create } from 'zustand'
import { api } from '@/lib/api'

export const useVaultStore = create((set, get) => ({
  isUnlocked: false,
  hasPIN: false,
  sessionToken: null,
  error: null,

  checkStatus: async () => {
    try {
      const res = await api.vault.status()
      set({ hasPIN: res.has_pin, isUnlocked: res.unlocked })
    } catch {}
  },

  setup: async (pin) => {
    try {
      await api.vault.setup({ pin })
      set({ hasPIN: true, error: null })
      return true
    } catch (err) {
      set({ error: err.message })
      return false
    }
  },

  unlock: async (pin) => {
    try {
      const res = await api.vault.unlock({ pin })
      set({ isUnlocked: true, sessionToken: res.token, error: null })
      return true
    } catch (err) {
      set({ error: err.message })
      return false
    }
  },

  lock: async () => {
    try { await api.vault.lock() } catch {}
    set({ isUnlocked: false, sessionToken: null })
  },

  clearError: () => set({ error: null }),
}))
