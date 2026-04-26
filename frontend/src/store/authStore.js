import { create } from 'zustand'
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth, firebaseConfigured } from '@/lib/firebase'

export const useAuthStore = create((set) => ({
  user: null,
  loading: firebaseConfigured,

  init: () => {
    if (!auth) { set({ loading: false }); return }
    onAuthStateChanged(auth, (user) => {
      set({ user, loading: false })
    })
  },

  signIn: async () => {
    if (!auth) return
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  },

  signOut: async () => {
    if (!auth) return
    await signOut(auth)
    set({ user: null })
  },
}))
