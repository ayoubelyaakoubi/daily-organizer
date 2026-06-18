import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Unlock, AlertCircle } from 'lucide-react'
import useStore from '../store/useStore'
import CircularProgress from './CircularProgress'
import {
  MONTHS_FR, DAYS_FR, toDateKey, toMonthKey,
  getDaysInMonth, getFirstDayOfMonth, isToday, isPast,
} from '../utils/dateUtils'

export default function MonthView({ year, month, onSelectDay }) {
  const { closedMonths, closeMonth, reopenMonth, getDayCompletion, getMonthCompletion } = useStore()
  const [confirmClose, setConfirmClose] = useState(false)

  const ym = toMonthKey(year, month)
  const isClosed = closedMonths.includes(ym)
  const monthCompletion = getMonthCompletion(year, month)
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOffset = getFirstDayOfMonth(year, month)

  const today = new Date()
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() + 1 === month

  const handleCloseMonth = () => {
    if (!confirmClose) {
      setConfirmClose(true)
      return
    }
    closeMonth(ym)
    setConfirmClose(false)
  }

  const completionColor =
    monthCompletion >= 75 ? '#10b981' :
    monthCompletion >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <motion.div
      layoutId={`month-${year}-${month}`}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      {/* Month Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-5">
          <CircularProgress
            value={monthCompletion}
            size={72}
            strokeWidth={5}
            color={completionColor}
          />
          <div>
            <h2 className="text-2xl font-extrabold text-white">
              {MONTHS_FR[month - 1]} {year}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {daysInMonth} jours · {monthCompletion}% accompli
            </p>
          </div>
        </div>

        {/* Close / Reopen Month */}
        {!isCurrentMonth || isClosed ? (
          <div className="flex flex-col items-end gap-2">
            <AnimatePresence>
              {confirmClose && !isClosed && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-amber-400 flex items-center gap-1"
                >
                  <AlertCircle size={12} />
                  Confirme la clôture du mois
                </motion.p>
              )}
            </AnimatePresence>

            {isClosed ? (
              <button
                onClick={() => reopenMonth(ym)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 text-slate-300 text-sm hover:bg-white/5 transition-colors"
              >
                <Unlock size={14} />
                Réouvrir
              </button>
            ) : (
              <button
                onClick={handleCloseMonth}
                onBlur={() => setConfirmClose(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  confirmClose
                    ? 'bg-amber-500 text-white hover:bg-amber-400'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Lock size={14} />
                {confirmClose ? 'Confirmer la clôture' : 'Clore le mois'}
              </button>
            )}
          </div>
        ) : null}
      </div>

      {/* Closed overlay message */}
      {isClosed && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-slate-700/40 border border-white/10"
        >
          <Lock size={16} className="text-slate-400" />
          <p className="text-slate-300 text-sm">
            Ce mois est <span className="font-semibold text-white">clos</span> — résultat final :{' '}
            <span className="font-bold" style={{ color: completionColor }}>{monthCompletion}%</span>
          </p>
        </motion.div>
      )}

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS_FR.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-slate-500 py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {/* Empty cells before first day */}
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const dateKey = toDateKey(year, month, day)
          const completion = getDayCompletion(dateKey)
          const todayFlag = isToday(year, month, day)
          const pastFlag = isPast(year, month, day)
          const hasData = completion > 0

          const dayColor =
            completion >= 75 ? '#10b981' :
            completion >= 40 ? '#f59e0b' :
            completion > 0 ? '#6366f1' : 'transparent'

          return (
            <motion.button
              key={day}
              layoutId={`day-${year}-${month}-${day}`}
              onClick={() => !isClosed && onSelectDay(day)}
              whileHover={!isClosed ? { scale: 1.06, y: -2 } : {}}
              whileTap={!isClosed ? { scale: 0.95 } : {}}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: day * 0.012 }}
              className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                isClosed
                  ? 'cursor-default opacity-70'
                  : 'cursor-pointer'
              } ${
                completion === 100
                  ? 'border-emerald-500/60 bg-emerald-500/10 shadow-md shadow-emerald-500/15'
                  : todayFlag
                  ? 'border-indigo-500 bg-indigo-500/15 shadow-lg shadow-indigo-500/20'
                  : pastFlag || hasData
                  ? 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10'
                  : 'border-white/5 bg-white/3 hover:border-white/15'
              }`}
            >
              {/* Completion ring */}
              <CircularProgress
                value={completion}
                size={38}
                strokeWidth={3}
                color={dayColor || '#6366f1'}
                label={false}
                done={completion === 100}
              />

              {/* Day number */}
              <span
                className={`text-xs font-bold leading-none ${
                  todayFlag ? 'text-indigo-300' : pastFlag ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                {day}
              </span>

              {/* Completion % label */}
              <span
                className="text-[10px] font-semibold leading-none"
                style={{ color: hasData ? dayColor : '#475569' }}
              >
                {completion}%
              </span>

              {/* Today dot */}
              {todayFlag && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-400 rounded-full border-2 border-slate-950 animate-pulse" />
              )}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
