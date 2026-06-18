import { motion } from 'framer-motion'
import { Trophy, Calendar, Star, CheckCircle, TrendingUp } from 'lucide-react'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip as ReTooltip,
} from 'recharts'
import useStore from '../store/useStore'
import { MONTHS_FR } from '../utils/dateUtils'
import Heatmap from './Heatmap'

function StatCard({ icon: Icon, label, value, sub, color = '#6366f1', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-2xl border border-white/10 p-5"
      style={{ background: 'linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}22` }}>
          <Icon size={18} style={{ color }} />
        </div>
        <span className="text-2xl font-extrabold" style={{ color }}>{value}</span>
      </div>
      <p className="text-slate-300 text-sm font-semibold">{label}</p>
      {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
    </motion.div>
  )
}

function BarChart({ data, labels, color = '#6366f1', title }) {
  const max = Math.max(...data, 1)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="rounded-2xl border border-white/10 p-5"
      style={{ background: 'linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)' }}
    >
      <p className="text-sm font-semibold text-slate-300 mb-4">{title}</p>
      <div className="flex items-end gap-2 h-28">
        {data.map((val, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-slate-500 font-medium">{val > 0 ? `${val}%` : ''}</span>
            <motion.div
              className="w-full rounded-t-lg"
              style={{ backgroundColor: color, opacity: 0.75 + (val / max) * 0.25 }}
              initial={{ height: 0 }}
              animate={{ height: `${Math.max((val / max) * 88, val > 0 ? 4 : 0)}px` }}
              transition={{ delay: 0.4 + i * 0.04, duration: 0.5, ease: 'easeOut' }}
            />
            <span className="text-[10px] text-slate-500 truncate w-full text-center">{labels[i]}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function ObjBar({ obj, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-3"
    >
      <span className="text-lg w-7 shrink-0">{obj.emoji}</span>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-slate-300 truncate">{obj.title}</span>
          <span className="text-xs font-bold ml-2 shrink-0" style={{ color: obj.color }}>{obj.pct}%</span>
        </div>
        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: obj.color }}
            initial={{ width: 0 }}
            animate={{ width: `${obj.pct}%` }}
            transition={{ delay: delay + 0.1, duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default function StatsView({ year }) {
  const getStats = useStore((s) => s.getStats)
  const stats = getStats(year)

  if (!stats) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <TrendingUp size={48} className="mx-auto text-slate-600 mb-4" />
        <p className="text-slate-400 text-lg font-semibold">Aucune donnée pour {year}</p>
        <p className="text-slate-500 text-sm mt-2">Commence à cocher tes objectifs pour voir tes statistiques.</p>
      </div>
    )
  }

  const { bestMonth, bestDow, dowAvg, dowLabels, totalDays100, daysLogged, bestObj, worstObj, objStats } = stats

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h2 className="text-2xl font-extrabold text-white">Statistiques {year}</h2>
        <p className="text-slate-400 text-sm mt-1">Analyse de ta progression annuelle</p>
      </motion.div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Trophy}
          label="Meilleur mois"
          value={bestMonth.pct ? `${bestMonth.pct}%` : '—'}
          sub={bestMonth.month ? MONTHS_FR[bestMonth.month - 1] : 'Pas encore de données'}
          color="#f59e0b"
          delay={0.05}
        />
        <StatCard
          icon={Calendar}
          label="Meilleur jour"
          value={bestDow.pct ? `${bestDow.pct}%` : '—'}
          sub={bestDow.pct ? `Les ${bestDow.label}edi` : 'Pas encore de données'}
          color="#6366f1"
          delay={0.1}
        />
        <StatCard
          icon={CheckCircle}
          label="Journées parfaites"
          value={totalDays100}
          sub={`sur ${daysLogged} jours actifs`}
          color="#10b981"
          delay={0.15}
        />
        <StatCard
          icon={Star}
          label="Objectif champion"
          value={bestObj ? `${bestObj.pct}%` : '—'}
          sub={bestObj ? `${bestObj.emoji} ${bestObj.title}` : 'Aucun objectif'}
          color="#ec4899"
          delay={0.2}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <BarChart
          data={dowAvg}
          labels={dowLabels}
          color="#6366f1"
          title="📅 Complétion moyenne par jour de la semaine"
        />

        {/* Obj ranking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-white/10 p-5"
          style={{ background: 'linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)' }}
        >
          <p className="text-sm font-semibold text-slate-300 mb-4">🎯 Classement des objectifs</p>
          <div className="space-y-4">
            {objStats.map((obj, i) => (
              <ObjBar key={obj.id} obj={obj} delay={0.45 + i * 0.06} />
            ))}
            {objStats.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-4">Aucun objectif défini</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Radar chart */}
      {objStats.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-6 rounded-2xl border border-white/10 p-5"
          style={{ background: 'linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)' }}
        >
          <p className="text-sm font-semibold text-slate-300 mb-1">🕸️ Profil de performance</p>
          <p className="text-xs text-slate-500 mb-4">Vue globale de ton équilibre par objectif</p>

          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={objStats.map((o) => ({ subject: `${o.emoji} ${o.title}`, value: o.pct, color: o.color }))}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
              />
              <ReTooltip
                contentStyle={{
                  backgroundColor: 'rgba(15,23,42,0.95)',
                  border         : '1px solid rgba(255,255,255,0.12)',
                  borderRadius   : 10,
                  color          : '#e2e8f0',
                  fontSize       : 12,
                }}
                formatter={(val) => [`${val}%`, 'Complétion']}
              />
              <Radar
                dataKey="value"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.18}
                strokeWidth={2}
                dot={{ fill: '#6366f1', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#818cf8' }}
              />
            </RadarChart>
          </ResponsiveContainer>

          {/* Mini legend */}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {objStats.map((o) => (
              <div key={o.id} className="flex items-center gap-1.5">
                <span className="text-base">{o.emoji}</span>
                <span className="text-xs text-slate-400">{o.title}</span>
                <span className="text-xs font-bold" style={{ color: o.color }}>{o.pct}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Heatmap annuelle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-6 rounded-2xl border border-white/10 p-5"
        style={{ background: 'linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)' }}
      >
        <p className="text-sm font-semibold text-slate-300 mb-4">🗓️ Heatmap {year} — activité quotidienne</p>
        <Heatmap year={year} />
      </motion.div>

      {/* Best / Worst highlight */}
      {bestObj && worstObj && bestObj.id !== worstObj.id && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            className="flex items-center gap-4 p-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/8"
          >
            <span className="text-3xl">{bestObj.emoji}</span>
            <div>
              <p className="text-xs text-emerald-400 font-semibold mb-0.5">🏆 Ton meilleur objectif</p>
              <p className="text-white font-bold">{bestObj.title}</p>
              <p className="text-emerald-400 text-sm">{bestObj.pct}% de réussite</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="flex items-center gap-4 p-4 rounded-2xl border border-amber-500/25 bg-amber-500/8"
          >
            <span className="text-3xl">{worstObj.emoji}</span>
            <div>
              <p className="text-xs text-amber-400 font-semibold mb-0.5">⚠️ À améliorer</p>
              <p className="text-white font-bold">{worstObj.title}</p>
              <p className="text-amber-400 text-sm">{worstObj.pct}% de réussite</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
