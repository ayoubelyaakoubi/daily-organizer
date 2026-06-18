import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import useStore from '../store/useStore'
import { MONTHS_FR } from '../utils/dateUtils'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  const color = val >= 75 ? '#10b981' : val >= 40 ? '#f59e0b' : '#6366f1'
  return (
    <div style={{
      backgroundColor: 'rgba(15,23,42,0.95)',
      border         : '1px solid rgba(255,255,255,0.12)',
      borderRadius   : 12,
      padding        : '10px 14px',
      backdropFilter : 'blur(12px)',
      boxShadow      : '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4 }}>{label}</p>
      <p style={{ color, fontWeight: 700, fontSize: 20 }}>{val}%</p>
      <p style={{ color: '#64748b', fontSize: 10, marginTop: 2 }}>complétion mensuelle</p>
    </div>
  )
}

const CustomDot = (props) => {
  const { cx, cy, value } = props
  if (value === 0) return null
  const color = value >= 75 ? '#10b981' : value >= 40 ? '#f59e0b' : '#6366f1'
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill={color} stroke="rgba(15,23,42,0.9)" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={9} fill={color} fillOpacity={0.15} />
    </g>
  )
}

export default function ProgressChart({ year }) {
  const { getMonthCompletion } = useStore()

  const today = new Date()
  const currentMonthIdx = today.getMonth()  // 0-based

  const data = MONTHS_FR.map((name, i) => {
    const monthNum = i + 1
    const isPast = year < today.getFullYear() || (year === today.getFullYear() && i <= currentMonthIdx)
    return {
      month     : name.slice(0, 3),
      fullMonth : name,
      completion: isPast ? getMonthCompletion(year, monthNum) : null,
    }
  })

  const maxVal  = Math.max(...data.map((d) => d.completion ?? 0), 10)
  const avgVal  = (() => {
    const vals = data.filter((d) => d.completion !== null && d.completion > 0).map((d) => d.completion)
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0
  })()

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="max-w-6xl mx-auto px-4 pb-12"
    >
      {/* Title row */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-white">Progression {year}</h3>
          <p className="text-xs text-slate-400 mt-0.5">Évolution mensuelle du taux de complétion</p>
        </div>
        <div className="flex gap-4 text-right">
          <div>
            <p className="text-xs text-slate-500">Pic</p>
            <p className="text-sm font-bold text-emerald-400">{maxVal}%</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Moyenne</p>
            <p className="text-sm font-bold text-indigo-400">{avgVal}%</p>
          </div>
        </div>
      </div>

      {/* Chart card */}
      <div
        className="rounded-2xl border border-white/8 p-6"
        style={{ background: 'linear-gradient(135deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.8) 100%)', backdropFilter: 'blur(8px)' }}
      >
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: -8 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#6366f1" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 6"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />

            {/* Average reference line */}
            {avgVal > 0 && (
              <ReferenceLine
                y={avgVal}
                stroke="rgba(99,102,241,0.35)"
                strokeDasharray="4 4"
                label={{
                  value   : `moy. ${avgVal}%`,
                  position: 'insideTopRight',
                  fill    : 'rgba(99,102,241,0.7)',
                  fontSize: 10,
                  dy      : -4,
                }}
              />
            )}

            <XAxis
              dataKey="month"
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              dy={6}
            />
            <YAxis
              domain={[0, 100]}
              tickCount={6}
              tickFormatter={(v) => `${v}%`}
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={36}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }}
            />

            <Area
              type="monotone"
              dataKey="completion"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#areaGrad)"
              dot={<CustomDot />}
              activeDot={{ r: 6, fill: '#818cf8', stroke: 'rgba(15,23,42,0.9)', strokeWidth: 2 }}
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Month labels row hint */}
        <div className="flex justify-between mt-3 px-9">
          {MONTHS_FR.map((m, i) => {
            const val = data[i].completion
            const color = val === null ? 'transparent' : val >= 75 ? '#10b981' : val >= 40 ? '#f59e0b' : '#6366f1'
            return (
              <div
                key={m}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: color, opacity: val ? 0.6 : 0.2 }}
              />
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
