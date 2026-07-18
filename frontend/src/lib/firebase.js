import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY

let firebaseApp = null
let auth = null
let firebaseConfigured = false

if (apiKey) {
  try {
    firebaseApp = initializeApp({
      apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      appId:     import.meta.env.VITE_FIREBASE_APP_ID,
    })
    auth = getAuth(firebaseApp)
    firebaseConfigured = true
  } catch {}
}

export { firebaseApp, auth, firebaseConfigured }
