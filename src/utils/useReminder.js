import { useEffect } from 'react'
import useStore from '../store/useStore'

export function useReminder() {
  const reminder          = useStore((s) => s.reminder)
  const setReminder       = useStore((s) => s.setReminder)
  const getDayCompletion  = useStore((s) => s.getDayCompletion)

  useEffect(() => {
    if (!reminder.enabled) return

    const check = () => {
      if (Notification.permission !== 'granted') return

      const now    = new Date()
      const [h, m] = reminder.time.split(':').map(Number)
      if (now.getHours() !== h || now.getMinutes() !== m) return

      const todayKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
      if (reminder.lastSent === todayKey) return

      const pct = getDayCompletion(todayKey)
      new Notification('Daily Organizer 🎯', {
        body: pct === 100
          ? '🏆 Journée parfaite ! Tous tes objectifs sont accomplis !'
          : pct > 0
          ? `Tu as accompli ${pct}% de tes objectifs aujourd'hui. Continue ! 💪`
          : "N'oublie pas tes objectifs du jour ! Commence maintenant 🚀",
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag  : 'daily-reminder',
      })

      setReminder({ lastSent: todayKey })
    }

    check()
    const interval = setInterval(check, 60_000)
    return () => clearInterval(interval)
  }, [reminder.enabled, reminder.time])
}
