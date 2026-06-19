import { useEffect, useState, useRef } from 'react'
import useStore from '../store/useStore'
import { auth, db, signInAnon, syncToFirebase, getFirebaseData, subscribeToFirebaseData } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'

export function useFirebaseSync() {
  const [firebaseReady, setFirebaseReady] = useState(false)
  const unsubscribeRef = useRef(null)
  const { objectives, dayData, dayNotes, dayMoods, closedMonths, theme, reminder } = useStore()
  const setStoreFromFirebase = useStore((s) => s.setStoreFromFirebase)

  // Auth & sync setup
  useEffect(() => {
    let authUnsub = null
    let dataUnsub = null

    const initFirebase = async () => {
      if (!auth.currentUser) {
        await signInAnon()
      }

      authUnsub = onAuthStateChanged(auth, async (user) => {
        if (!user) return

        const userId = user.uid
        const localData = {
          objectives, dayData, dayNotes, dayMoods, closedMonths, theme, reminder,
          lastSync: new Date().toISOString(),
        }

        // Sync local → Firebase
        await syncToFirebase(userId, localData)

        // Listen Firebase → local
        dataUnsub = subscribeToFirebaseData(userId, (firebaseData) => {
          if (firebaseData) {
            setStoreFromFirebase(firebaseData)
          }
        })

        setFirebaseReady(true)
      })
    }

    initFirebase()

    return () => {
      authUnsub?.()
      dataUnsub?.()
    }
  }, [])

  // Sync on every store change (debounced)
  useEffect(() => {
    if (!firebaseReady || !auth.currentUser) return

    const timer = setTimeout(() => {
      const data = {
        objectives, dayData, dayNotes, dayMoods, closedMonths, theme, reminder,
        lastSync: new Date().toISOString(),
      }
      syncToFirebase(auth.currentUser.uid, data).catch(console.error)
    }, 1000) // Debounce 1s

    return () => clearTimeout(timer)
  }, [objectives, dayData, dayNotes, dayMoods, closedMonths, theme, reminder, firebaseReady])

  return firebaseReady
}
