import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY

const firebaseConfig = {
  apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId:     import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseApp = apiKey ? initializeApp(firebaseConfig) : null
export const auth        = firebaseApp ? getAuth(firebaseApp) : null
export const firebaseConfigured = !!apiKey
