import { useEffect, useRef, useState } from 'react'
import useStore from '../store/useStore'
import { saveUserData, fetchUserData, subscribeUserData, publishProfile } from './firebase'

const LOCAL_STAMP_KEY = 'daily-organizer-last-local-change'

function pickSyncData(state) {
  return {
    objectives: state.objectives || [],
    dayData: state.dayData || {},
    dayNotes: state.dayNotes || {},
    dayMoods: state.dayMoods || {},
    closedMonths: state.closedMonths || [],
    theme: state.theme || 'dark',
    reminder: state.reminder || { enabled: false, time: '20:00', lastSent: null },
    social: state.social || { sharingEnabled: false, code: null },
  }
}

// Fusion locale/cloud : union par clé de date, le plus récent gagne les conflits.
// Corrige l'ancien comportement qui écrasait le cloud avec le local au démarrage
// (perte de données garantie sur un nouvel appareil).
function mergeData(local, cloud, localStamp) {
  if (!cloud) return local
  const cloudStamp = cloud.lastSync ? Date.parse(cloud.lastSync) : 0
  const localNewer = localStamp > cloudStamp
  const newer = localNewer ? local : cloud
  const older = localNewer ? cloud : local

  return {
    objectives: newer.objectives?.length ? newer.objectives : older.objectives || [],
    dayData: { ...older.dayData, ...newer.dayData },
    dayNotes: { ...older.dayNotes, ...newer.dayNotes },
    dayMoods: { ...older.dayMoods, ...newer.dayMoods },
    closedMonths: [...new Set([...(older.closedMonths || []), ...(newer.closedMonths || [])])],
    theme: newer.theme || older.theme || 'dark',
    reminder: newer.reminder || older.reminder,
    social: newer.social || older.social,
  }
}

function buildPublicProfile(user, state) {
  const { count } = state.getStreak()
  return {
    name: user.displayName || user.email?.split('@')[0] || 'Utilisateur',
    streak: count,
    weekPct: state.getWeekPct(),
    days100: state.getStats(new Date().getFullYear())?.totalDays100 ?? 0,
    code: state.social?.code || null,
    updatedAt: new Date().toISOString(),
  }
}

export function useFirebaseSync(user) {
  const [ready, setReady] = useState(false)
  // JSON de la dernière donnée envoyée/reçue — coupe la boucle onValue → set → push → onValue
  const lastSyncedJson = useRef(null)
  const setStoreFromFirebase = useStore((s) => s.setStoreFromFirebase)

  // Init : lire le cloud d'abord, fusionner, puis s'abonner
  useEffect(() => {
    if (!user) {
      setReady(false)
      return
    }
    let cancelled = false
    let dataUnsub = null

    const init = async () => {
      const cloud = await fetchUserData(user.uid).catch(() => null)
      if (cancelled) return

      const local = pickSyncData(useStore.getState())
      const localStamp = Number(localStorage.getItem(LOCAL_STAMP_KEY) || 0)
      const merged = mergeData(local, cloud, localStamp)

      lastSyncedJson.current = JSON.stringify(merged)
      setStoreFromFirebase(merged)
      await saveUserData(user.uid, { ...merged, lastSync: new Date().toISOString() }).catch(console.error)

      dataUnsub = subscribeUserData(user.uid, (remote) => {
        if (!remote) return
        const json = JSON.stringify(pickSyncData(remote))
        if (json === lastSyncedJson.current) return // écho de notre propre écriture
        lastSyncedJson.current = json
        setStoreFromFirebase(remote)
      })

      if (!cancelled) setReady(true)
    }

    init()
    return () => {
      cancelled = true
      dataUnsub?.()
    }
  }, [user?.uid]) // eslint-disable-line react-hooks/exhaustive-deps

  // Push des changements locaux (debounce) + publication du profil public
  useEffect(() => {
    if (!user || !ready) return
    let timer = null

    const unsub = useStore.subscribe(() => {
      const json = JSON.stringify(pickSyncData(useStore.getState()))
      if (json === lastSyncedJson.current) return

      localStorage.setItem(LOCAL_STAMP_KEY, String(Date.now()))
      clearTimeout(timer)
      timer = setTimeout(() => {
        const state = useStore.getState()
        const data = pickSyncData(state)
        const payload = JSON.stringify(data)
        if (payload === lastSyncedJson.current) return
        lastSyncedJson.current = payload

        saveUserData(user.uid, { ...data, lastSync: new Date().toISOString() }).catch(console.error)

        if (data.social?.sharingEnabled) {
          publishProfile(user.uid, buildPublicProfile(user, state)).catch(console.error)
        }
      }, 800)
    })

    return () => {
      clearTimeout(timer)
      unsub()
    }
  }, [user?.uid, ready]) // eslint-disable-line react-hooks/exhaustive-deps

  return ready
}
