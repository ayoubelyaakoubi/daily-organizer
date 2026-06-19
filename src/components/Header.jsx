import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, ChevronLeft, Calendar, Flame, BarChart2, Sun, Moon, Bell, BellRing, BellOff, Download } from 'lucide-react'
import ObjectivesModal from './ObjectivesModal'
import ReminderModal from './ReminderModal'
import useStore from '../store/useStore'
import { MONTHS_FR } from '../utils/dateUtils'

function InstallButton() {
  const [prompt, setPrompt] = useState(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setPrompt(e) }
    const doneHandler = () => { setInstalled(true); setPrompt(null) }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', doneHandler)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', doneHandler)
    }
  }, [])

  if (installed || !prompt) return null

  return (
    <motion.button
      onClick={async () => {
        prompt.prompt()
        const { outcome } = await prompt.userChoice
        if (outcome === 'accepted') setPrompt(null)
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all border border-indigo-500/40 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20"
      title="Installer l'application"
    >
      <Download size={14} />
      <span className="hidden sm:inline">Installer</span>
    </motion.button>
  )
}

function ThemeToggle() {
  const theme       = useStore((s) => s.theme)
  const toggleTheme = useStore((s) => s.toggleTheme)
  const isDark = theme === 'dark'

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all"
      style={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        borderColor    : isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
        color          : isDark ? '#fbbf24' : '#6366f1',
      }}
      title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
            <Sun size={16} />
          </motion.div>
        ) : (
          <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
            <Moon size={16} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

function StreakBadge() {
  const getStreak = useStore((s) => s.getStreak)
  const { count, todayDone } = getStreak()

  if (count === 0) return null

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', bounce: 0.5 }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border"
      style={{
        backgroundColor: todayDone ? 'rgba(249,115,22,0.15)' : 'rgba(249,115,22,0.07)',
        borderColor    : todayDone ? 'rgba(249,115,22,0.4)' : 'rgba(249,115,22,0.2)',
      }}
      title={todayDone ? `${count} jours consécutifs à 100% !` : `Série en cours — complète aujourd'hui !`}
    >
      {/* Flame icon — animate when today is done */}
      <motion.div
        animate={todayDone ? { scale: [1, 1.2, 1], rotate: [-5, 5, -3, 3, 0] } : {}}
        transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 4 }}
      >
        <Flame
          size={15}
          style={{ color: todayDone ? '#fb923c' : '#fb923c99' }}
          fill={todayDone ? '#fb923c55' : 'none'}
        />
      </motion.div>

      {/* Count */}
      <span
        className="text-sm font-bold tabular-nums"
        style={{ color: todayDone ? '#fb923c' : '#fb923c70' }}
      >
        {count}
      </span>

      {/* Label */}
      <span
        className="text-xs hidden sm:inline"
        style={{ color: todayDone ? '#fb923c99' : '#fb923c50' }}
      >
        {count === 1 ? 'jour' : 'jours'}
      </span>

      {/* Pending dot if today not done */}
      {!todayDone && (
        <span className="text-[10px]" style={{ color: '#fb923c50' }}>⏳</span>
      )}
    </motion.div>
  )
}

export default function Header({ view, selectedMonth, selectedYear, selectedDay, onBack, onStats }) {
  const [showModal,    setShowModal]    = useState(false)
  const [showReminder, setShowReminder] = useState(false)
  const reminderEnabled = useStore((s) => s.reminder.enabled)

  const getTitle = () => {
    if (view === 'year') return `${selectedYear}`
    if (view === 'month') return `${MONTHS_FR[selectedMonth - 1]} ${selectedYear}`
    if (view === 'day') {
      const d = new Date(selectedYear, selectedMonth - 1, selectedDay)
      return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    }
    return ''
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-3 grid items-center gap-4"
          style={{ gridTemplateColumns: '1fr auto 1fr' }}
        >
          {/* LEFT: back button + title */}
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {view !== 'year' && (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={onBack}
                  className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronLeft size={20} />
                </motion.button>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2">
              {view === 'year' && (
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                  <Calendar size={16} className="text-white" />
                </div>
              )}
              <div>
                {view === 'year' && (
                  <p className="text-xs text-slate-400 leading-none mb-0.5">Daily Organizer</p>
                )}
                <h1 className="text-lg font-bold text-white leading-tight capitalize">{getTitle()}</h1>
              </div>
            </div>
          </div>

          {/* CENTER: streak badge */}
          <div className="flex justify-center">
            <StreakBadge />
          </div>

          {/* RIGHT: install + theme + stats + define objectives */}
          <div className="flex justify-end items-center gap-2">
            <InstallButton />
            {/* Reminder bell */}
            <motion.button
              onClick={() => setShowReminder(true)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all"
              style={{
                backgroundColor: reminderEnabled ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.06)',
                borderColor    : reminderEnabled ? 'rgba(99,102,241,0.4)'  : 'rgba(255,255,255,0.12)',
                color          : reminderEnabled ? '#818cf8' : '#64748b',
              }}
              title={reminderEnabled ? 'Rappel actif' : 'Configurer un rappel'}
            >
              {reminderEnabled ? (
                <motion.div
                  animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 3 }}
                >
                  <BellRing size={15} fill="currentColor" />
                </motion.div>
              ) : (
                <Bell size={15} />
              )}
            </motion.button>
            <ThemeToggle />
            {view === 'year' && onStats && (
              <motion.button
                onClick={onStats}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium transition-all"
              >
                <BarChart2 size={15} />
                <span className="hidden sm:inline">Statistiques</span>
              </motion.button>
            )}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95"
            >
              <Target size={15} />
              <span className="hidden sm:inline">Définir mes objectifs</span>
              <span className="sm:hidden">Objectifs</span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showModal    && <ObjectivesModal onClose={() => setShowModal(false)} />}
        {showReminder && <ReminderModal  onClose={() => setShowReminder(false)} />}
      </AnimatePresence>
    </>
  )
}
