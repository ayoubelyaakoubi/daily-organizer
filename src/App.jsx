import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Header from './components/Header'
import YearView from './components/YearView'
import MonthView from './components/MonthView'
import DayView from './components/DayView'
import ProgressChart from './components/ProgressChart'
import StatsView from './components/StatsView'
import useStore from './store/useStore'

const CURRENT_YEAR = new Date().getFullYear()

const pageVariants = {
  initial: { opacity: 0, scale: 0.96, y: 16 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
  exit   : { opacity: 0, scale: 1.02, y: -10, transition: { duration: 0.25, ease: 'easeIn' } },
}

export default function App() {
  const theme = useStore((s) => s.theme)

  const [view, setView]   = useState('year')
  const [year, setYear]   = useState(CURRENT_YEAR)
  const [month, setMonth] = useState(null)
  const [day,   setDay  ] = useState(null)

  const selectMonth = (m) => { setMonth(m); setView('month') }
  const selectDay   = (d) => { setDay(d);   setView('day')   }

  const goBack = () => {
    if      (view === 'day')   { setDay(null);   setView('month') }
    else if (view === 'month') { setMonth(null); setView('year')  }
    else if (view === 'stats') { setView('year') }
  }

  const prevYear = () => setYear((y) => y - 1)
  const nextYear = () => setYear((y) => y + 1)

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col ${theme === 'light' ? 'light-theme' : ''}`}>
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-600/6 rounded-full blur-3xl" />
      </div>

      {/* ── Arabic Quote Banner — home only ── */}
      {view === 'year' && <div className="relative overflow-hidden border-b border-amber-700/20" style={{ background: 'linear-gradient(90deg, rgba(120,53,15,0.0) 0%, rgba(120,53,15,0.18) 50%, rgba(120,53,15,0.0) 100%)' }}>
        {/* decorative lines */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative z-10 py-3 text-center"
        >
          {/* small ornament */}
          <span className="block text-amber-600/40 text-xs tracking-[0.3em] uppercase mb-1 font-light select-none">✦ ✦ ✦</span>
          <p
            style={{
              fontFamily  : "'Amiri', serif",
              direction   : 'rtl',
              fontSize    : 'clamp(1rem, 2.5vw, 1.4rem)',
              lineHeight  : 1.6,
              fontWeight  : 700,
              background  : 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 40%, #d97706 70%, #fbbf24 100%)',
              WebkitBackgroundClip : 'text',
              WebkitTextFillColor  : 'transparent',
              backgroundClip       : 'text',
              letterSpacing        : '0.04em',
              textShadow           : 'none',
            }}
          >
            أَتعِبْ قدماكَ، فإن تَعِبا قَدَّماكَ
          </p>
        </motion.div>
      </div>}

      {/* ── Header ── */}
      <Header
        view={view}
        selectedYear={year}
        selectedMonth={month}
        selectedDay={day}
        onBack={goBack}
        onStats={() => setView('stats')}
      />

      {/* ── Main content ── */}
      <main className="relative z-10 flex-1">
        <AnimatePresence mode="wait">
          {view === 'year' && (
            <motion.div key="year" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <YearView year={year} onSelectMonth={selectMonth} onPrevYear={prevYear} onNextYear={nextYear} onStats={() => setView('stats')} />
              <ProgressChart year={year} />
            </motion.div>
          )}

          {view === 'month' && month && (
            <motion.div key={`month-${month}`} variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <MonthView year={year} month={month} onSelectDay={selectDay} />
            </motion.div>
          )}

          {view === 'day' && day && (
            <motion.div key={`day-${month}-${day}`} variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <DayView year={year} month={month} day={day} />
            </motion.div>
          )}
          {view === 'stats' && (
            <motion.div key="stats" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <StatsView year={year} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 mt-auto border-t border-white/5 py-5">
        <p
          className="text-center text-slate-500 text-sm tracking-wide"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          © 2026{' '}
          <span className="text-slate-400 font-medium">Ayoub El Yaakoubi</span>
          {' '}— Tous droits réservés.
        </p>
      </footer>
    </div>
  )
}
