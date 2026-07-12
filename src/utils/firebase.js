import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, get, onValue, remove } from 'firebase/database'
import { getAuth } from 'firebase/auth'

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

// ── User data (privé) ────────────────────────────────────────────
// Layout : users/{uid}/data = payload du store
//          plans/{uid}      = 'premium' (absent → free, écrit côté admin)

export const saveUserData = async (userId, data) => {
  await set(ref(db, `users/${userId}/data`), data)
}

export const fetchUserData = async (userId) => {
  const snapshot = await get(ref(db, `users/${userId}`))
  if (!snapshot.exists()) return null
  const node = snapshot.val()
  // Nouveau layout : users/{uid}/data — ancien layout : payload à la racine
  if (node.data) return node.data
  if (node.objectives || node.dayData) return node
  return null
}

export const subscribeUserData = (userId, callback) =>
  onValue(ref(db, `users/${userId}/data`), (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null)
  })

// ── Plan (free / premium) ────────────────────────────────────────

export const subscribeUserPlan = (userId, callback) =>
  onValue(
    ref(db, `plans/${userId}`),
    (snapshot) => callback(snapshot.exists() ? snapshot.val() : 'free'),
    () => callback('free') // règles refusées / hors-ligne → free
  )

// ── Profils publics (partage & leaderboard) ──────────────────────

export const publishProfile = async (userId, profile) => {
  await set(ref(db, `profiles/${userId}`), profile)
}

export const unpublishProfile = async (userId) => {
  await remove(ref(db, `profiles/${userId}`))
}

export const fetchProfile = async (userId) => {
  const snapshot = await get(ref(db, `profiles/${userId}`))
  return snapshot.exists() ? snapshot.val() : null
}

// ── Codes ami ────────────────────────────────────────────────────

export const lookupFriendCode = async (code) => {
  const snapshot = await get(ref(db, `codes/${code}`))
  return snapshot.exists() ? snapshot.val() : null
}

export const claimFriendCode = async (code, userId) => {
  const existing = await lookupFriendCode(code)
  if (existing && existing !== userId) return false
  await set(ref(db, `codes/${code}`), userId)
  return true
}

export const addFriend = async (userId, friendUid) => {
  await set(ref(db, `users/${userId}/friends/${friendUid}`), true)
}

export const removeFriend = async (userId, friendUid) => {
  await remove(ref(db, `users/${userId}/friends/${friendUid}`))
}

export const fetchFriends = async (userId) => {
  const snapshot = await get(ref(db, `users/${userId}/friends`))
  return snapshot.exists() ? Object.keys(snapshot.val()) : []
}
