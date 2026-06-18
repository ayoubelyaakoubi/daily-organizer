import { useState } from 'react'
import ReactDOM from 'react-dom'
import { motion } from 'framer-motion'
import useStore from '../store/useStore'
import { MONTHS_FR } from '../utils/dateUtils'

const DAYS = ['L', '', 'M', '', 'V', '', 'D']
const CELL = 13
const GAP  = 3

function cellColor(completion, isPast) {
  if (!isPast)          return 'rgba(255,255,255,0.04)'
  if (completion === 0) return 'rgba(255,255,255,0.07)'
  if (completion === 100) return '#10b981'
  if (completion >= 75)   return '#6366f1'
  if (completion >= 50)   return 'rgba(99,102,241,0.65)'
  if (completion >= 25)   return 'rgba(99,102,241,0.38)'
  return 'rgba(99,102,241,0.18)'
}

export default function Heatmap({ year }) {
  const getDayCompletion = useStore((s) => s.getDayCompletion)
  const [tooltip, setTooltip] = useState(null)

  const today = new Date()
  today.setHours(23, 59, 59, 999)

  // Build cells array
  const jan1   = new Date(year, 0, 1)
  const offset = jan1.getDay() === 0 ? 6 : jan1.getDay() - 1  // Mon=0 offset

  const cells = Array(offset).fill(null)

  const d = new Date(year, 0, 1)
  while (d.getFullYear() === year) {
    const m   = d.getMonth()
    const day = d.getDate()
    const key = `${year}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    cells.push({ date: new Date(d), key, month: m, day, completion: getDayCompletion(key), isPast: d <= today })
    d.setDate(d.getDate() + 1)
  }

  // Split into weeks of 7
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) {
    const w = cells.slice(i, i + 7)
    while (w.length < 7) w.push(null)
    weeks.push(w)
  }

  // Month label positions (first week where month appears)
  const monthLabels = {}
  weeks.forEach((week, wi) => {
    week.forEach((c) => {
      if (c && !(c.month in monthLabels)) monthLabels[c.month] = wi
    })
  })

  return (
    <div className="overflow-x-auto pb-2">
      {/* Month labels */}
      <div className="flex ml-5 mb-1">
        {weeks.map((_, wi) => (
          <div key={wi} style={{ width: CELL + GAP, flexShrink: 0 }}>
            {Object.entries(monthLabels).find(([, w]) => w === wi) && (
              <span className="text-[10px] text-slate-500 font-medium">
                {MONTHS_FR[+Object.entries(monthLabels).find(([, w]) => w === wi)[0]].slice(0, 3)}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex" style={{ gap: GAP }}>
        {/* Day-of-week labels */}
        <div className="flex flex-col shrink-0" style={{ gap: GAP, width: 14, paddingTop: 1 }}>
          {DAYS.map((label, i) => (
            <div key={i} style={{ height: CELL, fontSize: 9, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 2 }}>
              {label}
            </div>
          ))}
        </div>

        {/* Week columns */}
        <div className="flex" style={{ gap: GAP }}>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col" style={{ gap: GAP }}>
              {week.map((cell, di) => {
                if (!cell) return <div key={di} style={{ width: CELL, height: CELL }} />

                const color = cellColor(cell.completion, cell.isPast)
                const isToday = cell.date.toDateString() === new Date().toDateString()

                return (
                  <motion.div
                    key={di}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (wi * 7 + di) * 0.0005, duration: 0.2 }}
                    whileHover={cell.isPast ? { scale: 1.5, zIndex: 10 } : {}}
                    style={{
                      width          : CELL,
                      height         : CELL,
                      borderRadius   : 3,
                      backgroundColor: color,
                      cursor         : cell.isPast ? 'pointer' : 'default',
                      outline        : isToday ? '2px solid rgba(99,102,241,0.8)' : 'none',
                      outlineOffset  : '1px',
                      position       : 'relative',
                    }}
                    onMouseEnter={(e) => {
                      if (!cell.isPast) return
                      const r = e.currentTarget.getBoundingClientRect()
                      setTooltip({
                        x: r.left + r.width / 2,
                        y: r.top - 6,
                        label: cell.date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }),
                        completion: cell.completion,
                      })
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 ml-5">
        <span className="text-[10px] text-slate-600">0%</span>
        {[0, 25, 50, 75, 100].map((v) => (
          <div key={v} style={{ width: CELL, height: CELL, borderRadius: 3, backgroundColor: cellColor(v, true) }} />
        ))}
        <span className="text-[10px] text-slate-600">100%</span>
      </div>

      {/* Tooltip portal */}
      {tooltip && ReactDOM.createPortal(
        <div style={{
          position      : 'fixed',
          left          : tooltip.x,
          top           : tooltip.y,
          transform     : 'translate(-50%, -100%)',
          zIndex        : 99999,
          pointerEvents : 'none',
          backgroundColor: 'rgba(10,15,35,0.97)',
          border        : '1px solid rgba(255,255,255,0.12)',
          borderRadius  : 8,
          padding       : '6px 10px',
          whiteSpace    : 'nowrap',
          boxShadow     : '0 4px 20px rgba(0,0,0,0.5)',
        }}>
          <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 2 }}>{tooltip.label}</p>
          <p style={{ color: tooltip.completion === 100 ? '#10b981' : tooltip.completion > 0 ? '#818cf8' : '#475569', fontWeight: 700, fontSize: 13 }}>
            {tooltip.completion}% accompli
          </p>
        </div>,
        document.body
      )}
    </div>
  )
}
