import { create } from 'zustand'
import { api } from '@/lib/api'

let _idleTimer = null
let _activityListeners = []

function _clearIdleTimer() {
  if (_idleTimer) { clearTimeout(_idleTimer); _idleTimer = null }
}

function _removeActivityListeners() {
  const listeners = _activityListeners.slice()
  listeners.forEach(([evt, fn]) => document.removeEventListener(evt, fn))
  _activityListeners = []
}

export const useVaultStore = create((set, get) => ({
  isUnlocked: false,
  hasPIN: false,
  sessionToken: null,
  error: null,
  autoLockEnabled: localStorage.getItem('ink_vault_autolock') === 'true',
  autoLockMinutes: parseInt(localStorage.getItem('ink_vault_autolock_min')) || 5,

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
      get()._startAutoLock()
      return true
    } catch (err) {
      set({ error: err.message })
      return false
    }
  },

  lock: async () => {
    _clearIdleTimer()
    _removeActivityListeners()
    try { await api.vault.lock() } catch {}
    set({ isUnlocked: false, sessionToken: null })
  },

  setAutoLockEnabled: (v) => {
    localStorage.setItem('ink_vault_autolock', v)
    set({ autoLockEnabled: v })
    if (v && get().isUnlocked) get()._startAutoLock()
    if (!v) { _clearIdleTimer(); _removeActivityListeners() }
  },

  setAutoLockMinutes: (v) => {
    localStorage.setItem('ink_vault_autolock_min', v)
    set({ autoLockMinutes: v })
    if (get().autoLockEnabled && get().isUnlocked) get()._startAutoLock()
  },

  _startAutoLock: () => {
    _clearIdleTimer()
    _removeActivityListeners()
    const { autoLockEnabled, autoLockMinutes } = get()
    if (!autoLockEnabled) return

    const ms = autoLockMinutes * 60 * 1000

    const resetTimer = () => {
      _clearIdleTimer()
      _idleTimer = setTimeout(() => {
        get().lock()
      }, ms)
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(evt => {
      const fn = resetTimer
      document.addEventListener(evt, fn, { passive: true })
      _activityListeners.push([evt, fn])
    })

    resetTimer()
  },

  clearError: () => set({ error: null }),
}))
