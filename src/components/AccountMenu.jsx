import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Crown, ChevronDown, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { logOut } from '../utils/auth'

export default function AccountMenu({ onUpgrade }) {
  const { user, isPremium } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!menuRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  if (!user) return null

  const initial = (user.displayName || user.email || '?').charAt(0).toUpperCase()

  const handleLogout = async () => {
    await logOut()
    navigate('/')
  }

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
          style={{
            background: isPremium
              ? 'linear-gradient(135deg, #f59e0b, #d97706)'
              : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          }}
        >
          {initial}
        </div>
        {isPremium && <Crown size={11} className="text-amber-400" fill="currentColor" />}
        <ChevronDown size={12} className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {/* Identity */}
            <div className="p-4 border-b border-white/5">
              <p className="text-sm font-semibold text-white truncate">
                {user.displayName || 'Utilisateur'}
              </p>
              <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
              <div className="mt-2">
                {isPremium ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 rounded-md">
                    <Crown size={9} fill="currentColor" /> PREMIUM
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                    PLAN GRATUIT
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-2">
              {!isPremium && (
                <button
                  onClick={() => { setOpen(false); onUpgrade?.() }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-amber-300 hover:bg-amber-500/10 transition-colors text-left"
                >
                  <Sparkles size={15} />
                  Passer Premium
                </button>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors text-left"
              >
                <LogOut size={15} />
                Se déconnecter
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
