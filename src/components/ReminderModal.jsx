import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Bell, BellOff, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import useStore from '../store/useStore'

export default function ReminderModal({ onClose }) {
  const { reminder, setReminder } = useStore()
  const [time, setTime]       = useState(reminder.time)
  const [permStatus, setPermStatus] = useState(Notification.permission)

  const requestPerm = async () => {
    const result = await Notification.requestPermission()
    setPermStatus(result)
  }

  const handleSave = async () => {
    if (permStatus !== 'granted') {
      await requestPerm()
      if (Notification.permission !== 'granted') return
    }
    setReminder({ time, enabled: true })
    onClose()
  }

  const handleDisable = () => {
    setReminder({ enabled: false })
    onClose()
  }

  const testNotif = () => {
    if (Notification.permission !== 'granted') { requestPerm(); return }
    new Notification('Daily Organizer 🎯', {
      body: "Ceci est un test de notification — n'oublie pas tes objectifs !",
      icon : '/icon.svg',
    })
  }

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
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Bell size={18} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Rappel quotidien</h2>
              <p className="text-xs text-slate-400">Notification à l'heure choisie</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Permission status */}
          <div className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${
            permStatus === 'granted'
              ? 'border-emerald-500/30 bg-emerald-500/8 text-emerald-400'
              : permStatus === 'denied'
              ? 'border-red-500/30 bg-red-500/8 text-red-400'
              : 'border-amber-500/30 bg-amber-500/8 text-amber-400'
          }`}>
            {permStatus === 'granted'
              ? <><CheckCircle size={15} /><span>Notifications autorisées ✓</span></>
              : permStatus === 'denied'
              ? <><AlertCircle size={15} /><span>Notifications bloquées — autorise dans les paramètres du navigateur</span></>
              : <><AlertCircle size={15} /><span>Permission non accordée</span>
                  <button onClick={requestPerm} className="ml-auto text-xs underline">Autoriser</button>
                </>
            }
          </div>

          {/* Time picker */}
          <div>
            <label className="text-xs text-slate-500 font-medium mb-2 flex items-center gap-1.5">
              <Clock size={12} />
              Heure du rappel
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-lg font-bold text-white outline-none transition-all text-center"
              style={{
                backgroundColor: 'rgba(99,102,241,0.12)',
                border         : '1px solid rgba(99,102,241,0.3)',
                colorScheme    : 'dark',
              }}
            />
          </div>

          {/* Current status */}
          {reminder.enabled && (
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 rounded-xl p-3">
              <Bell size={12} className="text-indigo-400 shrink-0" />
              <span>Rappel actif tous les jours à <strong className="text-indigo-300">{reminder.time}</strong></span>
            </div>
          )}

          {/* Test button */}
          {permStatus === 'granted' && (
            <button
              onClick={testNotif}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors border border-white/8 rounded-xl hover:bg-white/5"
            >
              Envoyer une notification test
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 space-y-2">
          <button
            onClick={handleSave}
            disabled={permStatus === 'denied'}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Bell size={15} />
            {reminder.enabled ? 'Mettre à jour' : 'Activer le rappel'}
          </button>
          {reminder.enabled && (
            <button
              onClick={handleDisable}
              className="w-full py-2 rounded-xl border border-white/10 text-slate-400 text-sm hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
            >
              <BellOff size={14} />
              Désactiver
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
