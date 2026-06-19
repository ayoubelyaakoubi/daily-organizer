import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, get, onValue } from 'firebase/database'
import { getAuth, signInAnonymously } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
export const auth = getAuth(app)

export const signInAnon = async () => {
  try {
    await signInAnonymously(auth)
  } catch (err) {
    console.error('Auth error:', err)
  }
}

export const syncToFirebase = async (userId, data) => {
  try {
    await set(ref(db, `users/${userId}`), data)
  } catch (err) {
    console.error('Firebase sync error:', err)
  }
}

export const getFirebaseData = async (userId) => {
  try {
    const snapshot = await get(ref(db, `users/${userId}`))
    return snapshot.exists() ? snapshot.val() : null
  } catch (err) {
    console.error('Firebase fetch error:', err)
    return null
  }
}

export const subscribeToFirebaseData = (userId, callback) => {
  const unsubscribe = onValue(ref(db, `users/${userId}`), (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null)
  })
  return unsubscribe
}
