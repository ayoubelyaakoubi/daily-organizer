import { motion, AnimatePresence } from 'framer-motion'
import { Lock, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react'
import useStore from '../store/useStore'
import CircularProgress from './CircularProgress'
import { MONTHS_FR, toMonthKey } from '../utils/dateUtils'

const MONTH_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#10b981', '#06b6d4', '#3b82f6',
]

export default function YearView({ year, onSelectMonth, onPrevYear, onNextYear }) {
  const { closedMonths, getMonthCompletion } = useStore()
  const today = new Date()
  const currentMonth = today.getMonth() + 1
  const currentYear = today.getFullYear()

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Year navigation */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={onPrevYear}
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/25 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={18} />
            </motion.button>

            <AnimatePresence mode="wait">
              <motion.h2
                key={year}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="text-3xl font-extrabold text-white tracking-tight w-20 text-center"
              >
                {year}
              </motion.h2>
            </AnimatePresence>

            <motion.button
              onClick={onNextYear}
              whileHover={{ scale: 1.1, x: 2 }}
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/25 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRight size={18} />
            </motion.button>
          </div>

          <p className="text-slate-500 text-sm hidden sm:block">Clique sur un mois pour voir tes journées</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-1">Progression annuelle</p>
          <CircularProgress
            value={Math.round(
              Array.from({ length: 12 }, (_, i) => getMonthCompletion(year, i + 1)).reduce((a, b) => a + b, 0) / 12
            )}
            size={56}
            strokeWidth={4}
            color="#6366f1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {MONTHS_FR.map((name, idx) => {
          const monthNum = idx + 1
          const ym = toMonthKey(year, monthNum)
          const isClosed = closedMonths.includes(ym)
          const completion = getMonthCompletion(year, monthNum)
          const isCurrentMonth = year === currentYear && monthNum === currentMonth
          const isFuture = year > currentYear || (year === currentYear && monthNum > currentMonth)
          const color = MONTH_COLORS[idx]

          return (
            <motion.button
              key={monthNum}
              layoutId={`month-${year}-${monthNum}`}
              onClick={() => onSelectMonth(monthNum)}
              whileHover={{ scale: isFuture ? 1 : 1.03, y: isFuture ? 0 : -2 }}
              whileTap={{ scale: 0.98 }}
              className={`relative text-left rounded-2xl p-5 border transition-all overflow-hidden ${
                isFuture
                  ? 'opacity-40 cursor-not-allowed border-white/5 bg-white/3'
                  : isClosed
                  ? 'border-white/20 bg-slate-800/80 cursor-pointer'
                  : isCurrentMonth
                  ? 'border-indigo-500/50 bg-slate-800/80 cursor-pointer shadow-lg shadow-indigo-500/10'
                  : 'border-white/10 bg-slate-800/50 cursor-pointer hover:border-white/20'
              }`}
              disabled={isFuture}
            >
              {/* Glow accent */}
              <div
                className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 blur-2xl"
                style={{ backgroundColor: color }}
              />

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: `${color}25`, color }}
                  >
                    {String(monthNum).padStart(2, '0')}
                  </div>
                  {isClosed && (
                    <div className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-0.5">
                      <Lock size={9} className="text-slate-400" />
                      <span className="text-xs text-slate-400">Clos</span>
                    </div>
                  )}
                  {isCurrentMonth && !isClosed && (
                    <div className="flex items-center gap-1 bg-indigo-500/20 rounded-full px-2 py-0.5">
                      <TrendingUp size={9} className="text-indigo-400" />
                      <span className="text-xs text-indigo-400">En cours</span>
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-white text-base leading-tight">{name}</h3>

                {!isFuture && (
                  <div className="mt-3 flex items-center justify-between">
                    <div className="h-1.5 flex-1 mr-3 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${completion}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.04 }}
                      />
                    </div>
                    <span className="text-xs font-bold" style={{ color }}>{completion}%</span>
                  </div>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
