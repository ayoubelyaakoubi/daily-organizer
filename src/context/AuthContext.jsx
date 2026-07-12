import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, subscribeUserPlan } from '../utils/firebase'

const AuthContext = createContext({
  user: null,
  loading: true,
  plan: 'free',
  isPremium: false,
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState('free')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!user) {
      setPlan('free')
      return
    }
    const unsub = subscribeUserPlan(user.uid, setPlan)
    return unsub
  }, [user])

  return (
    <AuthContext.Provider value={{ user, loading, plan, isPremium: plan === 'premium' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
