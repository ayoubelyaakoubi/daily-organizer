import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { X, Users, Copy, Check, UserPlus, Trash2, Flame, Trophy, Share2, Loader2, Link as LinkIcon } from 'lucide-react'
import useStore from '../store/useStore'
import { useAuth } from '../context/AuthContext'
import {
  claimFriendCode, lookupFriendCode, addFriend, removeFriend,
  fetchFriends, fetchProfile, publishProfile, unpublishProfile,
} from '../utils/firebase'

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const randomCode = () =>
  Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('')

function MedalRank({ rank }) {
  const medals = ['🥇', '🥈', '🥉']
  if (rank < 3) return <span className="text-lg w-7 text-center">{medals[rank]}</span>
  return <span className="text-xs font-bold text-slate-500 w-7 text-center">#{rank + 1}</span>
}

export default function FriendsModal({ onClose }) {
  const { user } = useAuth()
  const social = useStore((s) => s.social)
  const setSocial = useStore((s) => s.setSocial)
  const getStreak = useStore((s) => s.getStreak)
  const getWeekPct = useStore((s) => s.getWeekPct)

  const [codeInput, setCodeInput] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState(null)
  const [copied, setCopied] = useState(null) // 'code' | 'link'
  const [board, setBoard] = useState(null)   // null = loading

  const myName = user?.displayName || user?.email?.split('@')[0] || 'Moi'

  // ── Génère et réserve un code ami à la première ouverture ──
  useEffect(() => {
    if (!user || social.code) return
    let cancelled = false
    const gen = async () => {
      for (let i = 0; i < 5; i++) {
        const code = randomCode()
        const ok = await claimFriendCode(code, user.uid).catch(() => false)
        if (ok && !cancelled) {
          setSocial({ code })
          return
        }
      }
    }
    gen()
    return () => { cancelled = true }
  }, [user, social.code]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Publie le profil dès l'ouverture si le partage est actif ──
  const publishMyProfile = useCallback(async () => {
    if (!user) return
    const state = useStore.getState()
    await publishProfile(user.uid, {
      name: myName,
      streak: getStreak().count,
      weekPct: getWeekPct(),
      days100: state.getStats(new Date().getFullYear())?.totalDays100 ?? 0,
      code: state.social.code || null,
      updatedAt: new Date().toISOString(),
    })
  }, [user, myName, getStreak, getWeekPct])

  // ── Charge le leaderboard ──
  const loadBoard = useCallback(async () => {
    if (!user) return
    const friendUids = await fetchFriends(user.uid).catch(() => [])
    const profiles = await Promise.all(
      friendUids.map(async (fuid) => {
        const p = await fetchProfile(fuid).catch(() => null)
        return p ? { ...p, uid: fuid } : null
      })
    )
    const me = { uid: user.uid, name: myName, streak: getStreak().count, weekPct: getWeekPct(), isMe: true }
    const rows = [me, ...profiles.filter(Boolean)]
      .sort((a, b) => (b.weekPct || 0) - (a.weekPct || 0) || (b.streak || 0) - (a.streak || 0))
    setBoard(rows)
  }, [user, myName, getStreak, getWeekPct])

  useEffect(() => { loadBoard() }, [loadBoard])

  // ── Toggle partage ──
  const toggleSharing = async () => {
    const enabled = !social.sharingEnabled
    setSocial({ sharingEnabled: enabled })
    try {
      if (enabled) await publishMyProfile()
      else await unpublishProfile(user.uid)
    } catch { /* offline: sera resynchronisé */ }
  }

  // ── Ajout d'un ami par code ──
  const handleAddFriend = async (e) => {
    e.preventDefault()
    const code = codeInput.trim().toUpperCase()
    if (!code) return
    setAdding(true)
    setAddError(null)
    try {
      if (code === social.code) {
        setAddError("C'est ton propre code 😄")
        return
      }
      const friendUid = await lookupFriendCode(code)
      if (!friendUid) {
        setAddError('Code introuvable. Vérifie avec ton ami.')
        return
      }
      await addFriend(user.uid, friendUid)
      setCodeInput('')
      await loadBoard()
    } catch {
      setAddError("Impossible d'ajouter cet ami. Réessaie.")
    } finally {
      setAdding(false)
    }
  }

  const handleRemove = async (fuid) => {
    await removeFriend(user.uid, fuid).catch(() => {})
    setBoard((b) => b?.filter((r) => r.uid !== fuid))
  }

  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    } catch { /* clipboard indisponible */ }
  }

  const shareLink = `${window.location.origin}/share/${user?.uid}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', bounce: 0.3 }}
        className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-500/15 flex items-center justify-center">
              <Users size={17} className="text-pink-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Amis & Classement</h2>
              <p className="text-xs text-slate-500">Défiez-vous chaque semaine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 max-h-[65vh] overflow-y-auto space-y-5">
          {/* ── Partage ── */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Share2 size={14} className="text-indigo-400" />
                <span className="text-sm font-semibold text-white">Partager ma progression</span>
              </div>
              {/* Toggle */}
              <button
                onClick={toggleSharing}
                className="relative w-10 h-5.5 rounded-full transition-colors"
                style={{ backgroundColor: social.sharingEnabled ? '#6366f1' : 'rgba(255,255,255,0.1)', height: 22 }}
              >
                <motion.div
                  animate={{ x: social.sharingEnabled ? 20 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-0.5 w-[18px] h-[18px] bg-white rounded-full shadow"
                />
              </button>
            </div>

            {social.sharingEnabled ? (
              <div className="space-y-2">
                {/* Code ami */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                    <span className="text-xs text-slate-500">Ton code ami</span>
                    <span className="text-sm font-mono font-bold text-indigo-300 tracking-[0.2em]">
                      {social.code || '······'}
                    </span>
                  </div>
                  <button
                    onClick={() => copy(social.code, 'code')}
                    disabled={!social.code}
                    className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title="Copier le code"
                  >
                    {copied === 'code' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
                {/* Lien public */}
                <button
                  onClick={() => copy(shareLink, 'link')}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 text-xs font-medium transition-colors"
                >
                  {copied === 'link' ? <Check size={12} className="text-emerald-400" /> : <LinkIcon size={12} />}
                  {copied === 'link' ? 'Lien copié !' : 'Copier mon lien de partage public'}
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Active le partage pour obtenir ton code ami et ton lien public.
              </p>
            )}
          </div>

          {/* ── Ajouter un ami ── */}
          <form onSubmit={handleAddFriend}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ajouter un ami</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={codeInput}
                onChange={(e) => { setCodeInput(e.target.value.toUpperCase()); setAddError(null) }}
                placeholder="CODE AMI (ex: K7KX2P)"
                maxLength={6}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono tracking-[0.15em] text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition-colors uppercase"
              />
              <button
                type="submit"
                disabled={adding || codeInput.length < 6}
                className="px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors"
              >
                {adding ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
              </button>
            </div>
            {addError && <p className="text-xs text-red-400 mt-1.5">{addError}</p>}
          </form>

          {/* ── Leaderboard ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={13} className="text-amber-400" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Classement de la semaine</p>
            </div>

            {board === null ? (
              <div className="flex justify-center py-6">
                <Loader2 size={18} className="text-slate-600 animate-spin" />
              </div>
            ) : (
              <div className="space-y-1.5">
                {board.map((row, i) => (
                  <motion.div
                    key={row.uid}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border group ${
                      row.isMe
                        ? 'border-indigo-500/40 bg-indigo-500/10'
                        : 'border-white/8 bg-white/[0.03]'
                    }`}
                  >
                    <MedalRank rank={i} />
                    <span className={`flex-1 text-sm font-medium truncate ${row.isMe ? 'text-indigo-200' : 'text-slate-300'}`}>
                      {row.name}{row.isMe && <span className="text-slate-500 text-xs"> (toi)</span>}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-orange-400 font-semibold">
                      <Flame size={11} fill="#fb923c40" />
                      {row.streak || 0}
                    </span>
                    <span className="text-sm font-bold tabular-nums w-11 text-right"
                      style={{ color: (row.weekPct || 0) >= 75 ? '#10b981' : (row.weekPct || 0) >= 40 ? '#f59e0b' : '#818cf8' }}>
                      {row.weekPct || 0}%
                    </span>
                    {!row.isMe && (
                      <button
                        onClick={() => handleRemove(row.uid)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/20 text-slate-600 hover:text-red-400 transition-all"
                        title="Retirer cet ami"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </motion.div>
                ))}
                {board.length === 1 && (
                  <p className="text-center text-xs text-slate-600 py-3">
                    Ajoute des amis avec leur code pour lancer le défi ! 🔥
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
