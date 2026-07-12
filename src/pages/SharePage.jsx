import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Flame, Trophy, TrendingUp, ArrowRight, Loader2, EyeOff } from 'lucide-react'
import { fetchProfile } from '../utils/firebase'

export default function SharePage() {
  const { uid } = useParams()
  const [profile, setProfile] = useState(undefined) // undefined = loading, null = introuvable

  useEffect(() => {
    let cancelled = false
    fetchProfile(uid)
      .then((p) => { if (!cancelled) setProfile(p) })
      .catch(() => { if (!cancelled) setProfile(null) })
    return () => { cancelled = true }
  }, [uid])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Calendar size={16} className="text-white" />
            </div>
            <span className="font-bold text-white">Daily Organizer</span>
          </Link>
          <Link to="/signup" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-all">
            Commencer
          </Link>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        {profile === undefined ? (
          <Loader2 size={28} className="text-indigo-500 animate-spin" />
        ) : profile === null ? (
          <div className="text-center">
            <EyeOff size={40} className="mx-auto text-slate-600 mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">Profil privé ou introuvable</h1>
            <p className="text-slate-400 text-sm mb-6">Cette personne n'a pas activé le partage de sa progression.</p>
            <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold transition-colors">
              Découvrir Daily Organizer <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            {/* Card profil */}
            <div className="relative bg-slate-900/90 border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden text-center">
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-40 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-extrabold text-white mb-4 shadow-lg shadow-indigo-500/25">
                  {(profile.name || '?').charAt(0).toUpperCase()}
                </div>
                <h1 className="text-2xl font-extrabold text-white">{profile.name}</h1>
                <p className="text-xs text-slate-500 mt-1 mb-8">suit ses objectifs sur Daily Organizer</p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-orange-500/25 bg-orange-500/10 p-4">
                    <Flame size={18} className="mx-auto text-orange-400 mb-1.5" fill="#fb923c40" />
                    <p className="text-2xl font-extrabold text-orange-400">{profile.streak || 0}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">jours de suite</p>
                  </div>
                  <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/10 p-4">
                    <TrendingUp size={18} className="mx-auto text-indigo-400 mb-1.5" />
                    <p className="text-2xl font-extrabold text-indigo-400">{profile.weekPct || 0}%</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">cette semaine</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4">
                    <Trophy size={18} className="mx-auto text-emerald-400 mb-1.5" />
                    <p className="text-2xl font-extrabold text-emerald-400">{profile.days100 || 0}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">journées 100%</p>
                  </div>
                </div>

                {profile.code && (
                  <p className="text-xs text-slate-500 mt-6">
                    Code ami : <span className="font-mono font-bold text-indigo-300 tracking-[0.2em]">{profile.code}</span>
                  </p>
                )}
              </div>
            </div>

            {/* CTA viral */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center mt-6"
            >
              <p className="text-sm text-slate-400 mb-3">Envie de te lancer aussi ?</p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/25"
              >
                Créer mon compte gratuit
                <ArrowRight size={15} />
              </Link>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
