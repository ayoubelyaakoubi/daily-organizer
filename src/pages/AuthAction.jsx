import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Lock, CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react'
import {
  applyEmailVerification,
  checkPasswordResetCode,
  completePasswordReset,
  authErrorMessage,
} from '../utils/auth'

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl text-center"
      >
        <div className="flex items-center justify-center gap-2.5 mb-7">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Calendar size={17} className="text-white" />
          </div>
          <span className="font-bold text-white">Daily Organizer</span>
        </div>
        {children}
      </motion.div>
    </div>
  )
}

// ── Vérification d'email ─────────────────────────────────────────
function VerifyEmail({ oobCode }) {
  const [status, setStatus] = useState('loading') // loading | success | error
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    applyEmailVerification(oobCode)
      .then(() => { if (!cancelled) setStatus('success') })
      .catch((err) => { if (!cancelled) { setError(authErrorMessage(err)); setStatus('error') } })
    return () => { cancelled = true }
  }, [oobCode])

  if (status === 'loading') {
    return (
      <>
        <Loader2 size={40} className="mx-auto text-indigo-400 animate-spin mb-4" />
        <p className="text-white font-semibold">Vérification en cours…</p>
      </>
    )
  }

  if (status === 'error') {
    return (
      <>
        <XCircle size={44} className="mx-auto text-red-400 mb-4" />
        <h1 className="text-xl font-bold text-white mb-2">Lien invalide</h1>
        <p className="text-slate-400 text-sm mb-6">{error}</p>
        <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-colors">
          Aller à la connexion <ArrowRight size={14} />
        </Link>
      </>
    )
  }

  return (
    <>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
        <CheckCircle2 size={48} className="mx-auto text-emerald-400 mb-4" />
      </motion.div>
      <h1 className="text-xl font-bold text-white mb-2">Adresse vérifiée ! 🎉</h1>
      <p className="text-slate-400 text-sm mb-6">Ton compte est confirmé. Tu peux maintenant profiter de Daily Organizer.</p>
      <Link to="/app" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-colors">
        Accéder à mon espace <ArrowRight size={14} />
      </Link>
    </>
  )
}

// ── Réinitialisation du mot de passe ─────────────────────────────
function ResetPassword({ oobCode }) {
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading') // loading | form | done | error
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    checkPasswordResetCode(oobCode)
      .then((mail) => { if (!cancelled) { setEmail(mail); setStatus('form') } })
      .catch((err) => { if (!cancelled) { setError(authErrorMessage(err)); setStatus('error') } })
    return () => { cancelled = true }
  }, [oobCode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (password.length < 6) return setError('Mot de passe trop faible (6 caractères minimum).')
    if (password !== confirm) return setError('Les mots de passe ne correspondent pas.')
    setSubmitting(true)
    try {
      await completePasswordReset(oobCode, password)
      setStatus('done')
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <>
        <Loader2 size={40} className="mx-auto text-indigo-400 animate-spin mb-4" />
        <p className="text-white font-semibold">Vérification du lien…</p>
      </>
    )
  }

  if (status === 'error') {
    return (
      <>
        <XCircle size={44} className="mx-auto text-red-400 mb-4" />
        <h1 className="text-xl font-bold text-white mb-2">Lien invalide</h1>
        <p className="text-slate-400 text-sm mb-6">{error}</p>
        <Link to="/reset" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-colors">
          Demander un nouveau lien <ArrowRight size={14} />
        </Link>
      </>
    )
  }

  if (status === 'done') {
    return (
      <>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
          <CheckCircle2 size={48} className="mx-auto text-emerald-400 mb-4" />
        </motion.div>
        <h1 className="text-xl font-bold text-white mb-2">Mot de passe modifié !</h1>
        <p className="text-slate-400 text-sm">Redirection vers la connexion…</p>
      </>
    )
  }

  // status === 'form'
  return (
    <>
      <h1 className="text-xl font-bold text-white mb-1">Nouveau mot de passe</h1>
      <p className="text-slate-400 text-sm mb-6">Pour le compte <span className="text-slate-300">{email}</span></p>
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nouveau mot de passe"
            autoComplete="new-password"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
            required
          />
        </div>
        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirmer le mot de passe"
            autoComplete="new-password"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
            required
          />
        </div>
        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
          Enregistrer le nouveau mot de passe
        </button>
      </form>
    </>
  )
}

// ── Routeur d'action ─────────────────────────────────────────────
export default function AuthAction() {
  const [params] = useSearchParams()
  const mode = params.get('mode')
  const oobCode = params.get('oobCode')

  if (!oobCode) {
    return (
      <Shell>
        <XCircle size={44} className="mx-auto text-red-400 mb-4" />
        <h1 className="text-xl font-bold text-white mb-2">Lien incomplet</h1>
        <p className="text-slate-400 text-sm mb-6">Ce lien ne contient pas les informations nécessaires.</p>
        <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-colors">
          Aller à la connexion <ArrowRight size={14} />
        </Link>
      </Shell>
    )
  }

  return (
    <Shell>
      {mode === 'verifyEmail' && <VerifyEmail oobCode={oobCode} />}
      {mode === 'resetPassword' && <ResetPassword oobCode={oobCode} />}
      {mode !== 'verifyEmail' && mode !== 'resetPassword' && (
        <>
          <XCircle size={44} className="mx-auto text-amber-400 mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Action non reconnue</h1>
          <p className="text-slate-400 text-sm mb-6">Ce type de lien n'est pas géré ici.</p>
          <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-colors">
            Aller à la connexion <ArrowRight size={14} />
          </Link>
        </>
      )}
    </Shell>
  )
}
