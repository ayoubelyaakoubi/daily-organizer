import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, Trophy, Target, NotebookPen, Save, Pencil, Quote, Star } from 'lucide-react'
import useStore from '../store/useStore'
import CircularProgress from './CircularProgress'
import { formatDate, toDateKey } from '../utils/dateUtils'
import { playCheckSound, playCompletionSound } from '../utils/sounds'
import confetti from 'canvas-confetti'
import { CATEGORIES } from './ObjectivesModal'

function fireConfetti() {
  const defaults = { startVelocity: 30, spread: 360, ticks: 80, zIndex: 9999 }
  const burst = (opts) => confetti({ ...defaults, ...opts })

  // Left burst
  burst({ particleCount: 60, origin: { x: 0.2, y: 0.6 } })
  // Right burst
  setTimeout(() => burst({ particleCount: 60, origin: { x: 0.8, y: 0.6 } }), 150)
  // Center shower
  setTimeout(() => burst({ particleCount: 80, origin: { x: 0.5, y: 0.4 }, startVelocity: 20, spread: 180 }), 300)
}

export default function DayView({ year, month, day }) {
  const { objectives, dayData, dayNotes, dayMoods, toggleObjective, getDayCompletion, setDayNote, setDayMood } = useStore()
  const dateKey    = toDateKey(year, month, day)
  const checks     = dayData[dateKey] || {}
  const completion = getDayCompletion(dateKey)
  const doneCount  = objectives.filter((o) => checks[o.id]).length

  const currentMood = dayMoods?.[dateKey] || null
  const savedNote   = dayNotes?.[dateKey] || ''
  const [note, setNote]           = useState(savedNote)
  const [noteSaved, setNoteSaved] = useState(false)
  const [isEditing, setIsEditing] = useState(!savedNote)
  const saveTimerRef = useRef(null)
  const textareaRef  = useRef(null)

  // Auto-save with debounce
  useEffect(() => {
    if (note === savedNote) return
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      setDayNote(dateKey, note)
      setNoteSaved(true)
      setTimeout(() => setNoteSaved(false), 1800)
    }, 600)
    return () => clearTimeout(saveTimerRef.current)
  }, [note])

  const handleBlur = () => {
    if (note.trim()) setIsEditing(false)
  }

  const startEditing = () => {
    setIsEditing(true)
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  const completionColor =
    completion >= 75 ? '#10b981' :
    completion >= 40 ? '#f59e0b' : '#6366f1'

  const getMessage = () => {
    if (completion === 100) return { text: 'Journée parfaite ! 🏆', color: '#10b981' }
    if (completion >= 75)  return { text: 'Excellent travail !',    color: '#10b981' }
    if (completion >= 50)  return { text: 'Bonne progression !',    color: '#f59e0b' }
    if (completion >= 25)  return { text: 'Continue comme ça !',    color: '#6366f1' }
    return { text: 'Commence ta journée !', color: '#94a3b8' }
  }
  const msg = getMessage()

  return (
    <motion.div
      layoutId={`day-${year}-${month}-${day}`}
      className="max-w-5xl mx-auto px-4 py-8"
    >
      {/* ── Header centré ── */}
      <div className="text-center mb-10">
        <p className="text-sm text-slate-400 mb-3 capitalize">{formatDate(year, month, day)}</p>
        <div className="flex justify-center mb-4">
          <CircularProgress value={completion} size={110} strokeWidth={7} color={completionColor} done={completion === 100} />
        </div>
        <motion.p key={msg.text} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
          className="text-sm font-semibold" style={{ color: msg.color }}>
          {msg.text}
        </motion.p>
        <p className="text-xs text-slate-500 mt-1">
          {doneCount} / {objectives.length} objectif{objectives.length !== 1 ? 's' : ''} accompli{doneCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── Sélecteur d'humeur ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center mb-8"
      >
        <div className="flex items-center gap-1 p-1.5 rounded-2xl border border-white/10 bg-white/3">
          {[
            { emoji: '🥳', label: 'Euphorique' },
            { emoji: '😊', label: 'Heureux'    },
            { emoji: '💪', label: 'Motivé'     },
            { emoji: '😐', label: 'Neutre'     },
            { emoji: '😴', label: 'Fatigué'    },
            { emoji: '😔', label: 'Triste'     },
            { emoji: '😤', label: 'Stressé'    },
            { emoji: '🤒', label: 'Malade'     },
          ].map(({ emoji, label }) => (
            <motion.button
              key={emoji}
              onClick={() => setDayMood(dateKey, currentMood === emoji ? null : emoji)}
              whileHover={{ scale: 1.35, y: -4 }}
              whileTap={{ scale: 0.9 }}
              title={label}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xl transition-all"
              style={{
                backgroundColor: currentMood === emoji ? 'rgba(99,102,241,0.2)' : 'transparent',
                outline        : currentMood === emoji ? '2px solid rgba(99,102,241,0.5)' : '2px solid transparent',
                outlineOffset  : '1px',
              }}
            >
              {emoji}
            </motion.button>
          ))}
        </div>
        {currentMood && (
          <motion.span
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            className="ml-3 self-center text-sm text-slate-400"
          >
            {{
              '🥳': 'Euphorique', '😊': 'Heureux', '💪': 'Motivé',
              '😐': 'Neutre',    '😴': 'Fatigué',  '😔': 'Triste',
              '😤': 'Stressé',   '🤒': 'Malade',
            }[currentMood]}
          </motion.span>
        )}
      </motion.div>

      {/* ── Layout : [spacer] [objectifs centrés] [note] ── */}
      <div className="flex gap-6 items-start">

        {/* Spacer gauche = même largeur que la note → objectifs visuellement centrés */}
        <div className="w-72 shrink-0 hidden lg:block" />

        {/* CENTRE : objectifs */}
        <div className="flex-1 flex flex-col items-center">
          <div className="w-full max-w-xl">
            {objectives.length === 0 ? (
              <div className="text-center py-12">
                <Target size={40} className="mx-auto text-slate-600 mb-3" />
                <p className="text-slate-400 text-sm">Aucun objectif défini</p>
                <p className="text-slate-500 text-xs mt-1">Clique sur "Définir mes objectifs" en haut</p>
              </div>
            ) : (() => {
              // Group by category
              const grouped = {}
              objectives.forEach((obj) => {
                const c = obj.category || 'personnel'
                if (!grouped[c]) grouped[c] = []
                grouped[c].push(obj)
              })
              const catOrder = CATEGORIES.map((c) => c.id)
              const sortedCats = Object.keys(grouped).sort((a, b) => catOrder.indexOf(a) - catOrder.indexOf(b))
              const multiCat = sortedCats.length > 1
              let globalIdx = 0

              return sortedCats.map((catId) => {
                const catInfo = CATEGORIES.find((c) => c.id === catId)
                const catObjs = grouped[catId]
                const catDone = catObjs.filter((o) => checks[o.id]).length

                return (
                  <div key={catId} className="mb-5 last:mb-0">
                    {/* Category header */}
                    {multiCat && (
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <span className="text-sm">{catInfo?.icon || '📌'}</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{catInfo?.label || catId}</span>
                        <span className="text-xs text-slate-600 ml-auto">{catDone}/{catObjs.length}</span>
                        <div className="w-10 h-1 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${catObjs.length ? (catDone / catObjs.length) * 100 : 0}%`, backgroundColor: catObjs[0]?.color || '#6366f1' }} />
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {catObjs.map((obj) => {
                        const i    = globalIdx++
                        const done = !!checks[obj.id]
                        return (
                          <motion.button
                            key={obj.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            onClick={() => {
                              const wasDone = !!checks[obj.id]
                              toggleObjective(dateKey, obj.id)
                              if (!wasDone) {
                                const willComplete = objectives.filter((o) => o.id === obj.id || checks[o.id]).length === objectives.length
                                if (willComplete) { playCompletionSound(); fireConfetti() }
                                else playCheckSound()
                              }
                            }}
                            whileHover={{ scale: 1.01, x: 2 }}
                            whileTap={{ scale: 0.99 }}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                              done ? 'border-transparent' : 'border-white/10 bg-white/3 hover:bg-white/7 hover:border-white/20'
                            }`}
                            style={done ? { backgroundColor: `${obj.color}18`, borderColor: `${obj.color}40`, boxShadow: `0 0 20px ${obj.color}12` } : {}}
                          >
                            <AnimatePresence mode="wait">
                              {done ? (
                                <motion.div key="checked" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', bounce: 0.5 }}>
                                  <CheckCircle2 size={26} style={{ color: obj.color }} className="shrink-0" />
                                </motion.div>
                              ) : (
                                <motion.div key="unchecked"><Circle size={26} className="text-slate-600 shrink-0" /></motion.div>
                              )}
                            </AnimatePresence>

                            <span className="text-2xl shrink-0">{obj.emoji}</span>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`font-semibold text-sm transition-all truncate ${done ? 'line-through opacity-60' : 'text-slate-100'}`}
                                  style={done ? { color: obj.color } : {}}>
                                  {obj.title}
                                </p>
                                {obj.priority && (
                                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded-md shrink-0">
                                    <Star size={8} fill="currentColor" />×2
                                  </span>
                                )}
                              </div>
                              {done && (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs mt-0.5 opacity-60" style={{ color: obj.color }}>
                                  Accompli ✓
                                </motion.p>
                              )}
                            </div>

                            <div className="w-2.5 h-2.5 rounded-full shrink-0 opacity-60" style={{ backgroundColor: obj.color }} />
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            })()}

            {/* Celebration */}
            <AnimatePresence>
              {completion === 100 && objectives.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', bounce: 0.4, delay: 0.2 }}
                  className="mt-2 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-center"
                >
                  <Trophy size={28} className="mx-auto text-yellow-400 mb-2" />
                  <p className="font-bold text-white">Journée parfaite !</p>
                  <p className="text-emerald-400 text-xs mt-1">Tous tes objectifs accomplis. Bravo ! 🎉</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* DROITE : note du jour */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="w-72 shrink-0 sticky top-24"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-slate-400">
              <NotebookPen size={14} />
              <span className="text-sm font-medium">Note du jour</span>
            </div>
            <AnimatePresence>
              {noteSaved && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1 text-xs text-emerald-400">
                  <Save size={10} /><span>Enregistré</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {/* MODE AFFICHAGE — note écrite, non en édition */}
            {!isEditing && note.trim() ? (
              <motion.div
                key="display"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                onClick={startEditing}
                className="relative group cursor-pointer rounded-2xl border border-white/10 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(30,41,59,0.6) 100%)' }}
              >
                {/* Decorative top bar */}
                <div className="h-1 w-full bg-gradient-to-r from-indigo-500/60 via-purple-500/40 to-indigo-500/60" />

                <div className="p-4">
                  {/* Quote icon */}
                  <Quote size={16} className="text-indigo-400/40 mb-2" />

                  {/* Note text */}
                  <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                    {note}
                  </p>

                  {/* Edit hint */}
                  <div className="mt-4 flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Pencil size={11} className="text-slate-500" />
                    <span className="text-xs text-slate-500">Modifier</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* MODE ÉDITION */
              <motion.div key="editing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <textarea
                  ref={textareaRef}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Écris tes pensées ou réflexions du jour…"
                  className="w-full rounded-2xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none resize-none transition-all"
                  style={{
                    fontFamily      : 'Inter, sans-serif',
                    lineHeight      : 1.7,
                    minHeight       : '180px',
                    backgroundColor : 'rgba(15, 23, 42, 0.8)',
                    border          : '1px solid rgba(255,255,255,0.1)',
                    color           : '#e2e8f0',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.backgroundColor = 'rgba(15,23,42,0.95)' }}
                  onBlur={(e)  => { e.target.style.borderColor = 'rgba(255,255,255,0.1)';  e.target.style.backgroundColor = 'rgba(15,23,42,0.8)'; handleBlur() }}
                />
                {note.trim() && (
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs text-slate-600">{note.length} caractère{note.length !== 1 ? 's' : ''}</p>
                    <button onClick={() => note.trim() && setIsEditing(false)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                      <Save size={10} /> Terminer
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </motion.div>
  )
}
