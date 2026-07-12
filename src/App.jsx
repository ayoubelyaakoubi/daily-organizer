import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from './context/AuthContext'
import Landing from './pages/Landing'

// Lazy : la landing charge vite, l'app (recharts, xlsx…) ne se télécharge qu'après login
const AuthPage   = lazy(() => import('./pages/AuthPage'))
const AuthAction = lazy(() => import('./pages/AuthAction'))
const Organizer  = lazy(() => import('./pages/Organizer'))
const SharePage  = lazy(() => import('./pages/SharePage'))

function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <Loader2 size={28} className="text-indigo-500 animate-spin" />
    </div>
  )
}

// Redirige vers /login si non connecté
function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!user) return <Navigate to="/login" replace />
  return children
}

// Redirige vers /app si déjà connecté (landing + pages auth)
function GuestOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (user) return <Navigate to="/app" replace />
  return children
}

export default function App() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        <Route path="/" element={<GuestOnly><Landing /></GuestOnly>} />
        <Route path="/login" element={<GuestOnly><AuthPage /></GuestOnly>} />
        <Route path="/signup" element={<GuestOnly><AuthPage /></GuestOnly>} />
        <Route path="/reset" element={<GuestOnly><AuthPage /></GuestOnly>} />
        <Route path="/auth/action" element={<AuthAction />} />
        <Route path="/app" element={<Protected><Organizer /></Protected>} />
        <Route path="/share/:uid" element={<SharePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
