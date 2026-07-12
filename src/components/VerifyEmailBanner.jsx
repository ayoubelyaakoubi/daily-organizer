import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MailWarning, RefreshCw, Send } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { resendVerification } from '../utils/auth'

export default function VerifyEmailBanner() {
  const { user } = useAuth()
  const [sent, setSent] = useState(false)
  const [checking, setChecking] = useState(false)
  const [verified, setVerified] = useState(false)

  if (!user || user.emailVerified || verified) return null

  const handleResend = async () => {
    try {
      await resendVerification()
      setSent(true)
      setTimeout(() => setSent(false), 5000)
    } catch { /* rate-limited: ignore */ }
  }

  const handleCheck = async () => {
    setChecking(true)
    try {
      await user.reload()
      if (user.emailVerified) setVerified(true)
    } finally {
      setChecking(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-30 bg-amber-500/10 border-b border-amber-500/20"
      >
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-3 flex-wrap">
          <MailWarning size={15} className="text-amber-400 shrink-0" />
          <p className="text-xs text-amber-200/90 flex-1 min-w-[200px]">
            Vérifie ton adresse email — un lien a été envoyé à{' '}
            <span className="font-semibold text-amber-100">{user.email}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResend}
              disabled={sent}
              className="flex items-center gap-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 disabled:opacity-60 transition-colors"
            >
              <Send size={11} />
              {sent ? 'Envoyé !' : 'Renvoyer'}
            </button>
            <span className="text-amber-500/30">·</span>
            <button
              onClick={handleCheck}
              disabled={checking}
              className="flex items-center gap-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 disabled:opacity-60 transition-colors"
            >
              <RefreshCw size={11} className={checking ? 'animate-spin' : ''} />
              J'ai vérifié
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
