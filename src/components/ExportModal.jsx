import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, FileJson, FileSpreadsheet, Check } from 'lucide-react'
import useStore from '../store/useStore'
import { MONTHS_FR } from '../utils/dateUtils'

function download(filename, content, mime) {
  const blob = new Blob([content], { type: mime })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ExportModal({ onClose }) {
  const { objectives, dayData, dayNotes, dayMoods, closedMonths } = useStore()
  const [done, setDone] = useState(null)

  const flash = (type) => { setDone(type); setTimeout(() => setDone(null), 2000) }

  // ── JSON ────────────────────────────────────────────────
  const exportJSON = () => {
    const data = {
      exportedAt : new Date().toISOString(),
      objectives,
      closedMonths,
      days: Object.entries(dayData).map(([date, checks]) => ({
        date,
        checks,
        note : dayNotes[date]  || '',
        mood : dayMoods[date]  || '',
        completion: (() => {
          if (!objectives.length) return 0
          let tw = 0, dw = 0
          objectives.forEach((o) => { const w = o.priority ? 2 : 1; tw += w; if (checks[o.id]) dw += w })
          return tw ? Math.round((dw / tw) * 100) : 0
        })(),
      })),
    }
    download(
      `daily-organizer-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(data, null, 2),
      'application/json'
    )
    flash('json')
  }

  // ── CSV ─────────────────────────────────────────────────
  const exportCSV = () => {
    const rows = [
      ['Date', 'Jour', 'Mois', 'Complétion (%)', 'Humeur', 'Note', ...objectives.map((o) => o.title)],
    ]

    const allDates = Object.keys(dayData).sort()
    allDates.forEach((date) => {
      const checks = dayData[date] || {}
      const d = new Date(date)
      const dayName  = d.toLocaleDateString('fr-FR', { weekday: 'long' })
      const monthName = MONTHS_FR[d.getMonth()]

      let tw = 0, dw = 0
      objectives.forEach((o) => { const w = o.priority ? 2 : 1; tw += w; if (checks[o.id]) dw += w })
      const pct = tw ? Math.round((dw / tw) * 100) : 0

      rows.push([
        date,
        dayName,
        monthName,
        pct,
        dayMoods[date] || '',
        (dayNotes[date] || '').replace(/"/g, '""'),
        ...objectives.map((o) => (checks[o.id] ? 'Oui' : 'Non')),
      ])
    })

    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    download(
      `daily-organizer-${new Date().toISOString().slice(0, 10)}.csv`,
      '﻿' + csv,  // BOM for Excel UTF-8
      'text/csv;charset=utf-8'
    )
    flash('csv')
  }

  const dayCount = Object.keys(dayData).length
  const noteCount = Object.values(dayNotes || {}).filter(Boolean).length

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
        className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">Exporter mes données</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {dayCount} jour{dayCount !== 1 ? 's' : ''} · {objectives.length} objectifs · {noteCount} note{noteCount !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3">
          {/* JSON */}
          <motion.button
            onClick={exportJSON}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-500/40 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
              {done === 'json' ? <Check size={20} className="text-emerald-400" /> : <FileJson size={20} className="text-indigo-400" />}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white text-sm">Export JSON</p>
              <p className="text-xs text-slate-400 mt-0.5">Toutes les données structurées · idéal pour sauvegarde</p>
            </div>
            <Download size={16} className="text-slate-500 shrink-0" />
          </motion.button>

          {/* CSV */}
          <motion.button
            onClick={exportCSV}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-emerald-500/40 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              {done === 'csv' ? <Check size={20} className="text-emerald-400" /> : <FileSpreadsheet size={20} className="text-emerald-400" />}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white text-sm">Export CSV</p>
              <p className="text-xs text-slate-400 mt-0.5">Compatible Excel / Google Sheets · une ligne par jour</p>
            </div>
            <Download size={16} className="text-slate-500 shrink-0" />
          </motion.button>
        </div>

        {/* Footer info */}
        <div className="px-6 pb-6">
          <p className="text-xs text-slate-600 text-center">
            Les données restent sur ton appareil — aucun envoi vers un serveur.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
