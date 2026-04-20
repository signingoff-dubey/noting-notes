import { create } from 'zustand'
import { api } from '@/lib/api'

export const useVaultStore = create((set) => ({
  isUnlocked: false,
  sessionToken: null,
  error: null,

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
    try {
      await api.vault.lock()
    } catch {}
    set({ isUnlocked: false, sessionToken: null })
  },

  clearError: () => set({ error: null }),
}))
