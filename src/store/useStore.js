import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT_OBJECTIVES = [
  { id: 'obj-1', title: 'Sport / Exercice', color: '#10b981', emoji: '🏃' },
  { id: 'obj-2', title: 'Lire 30 minutes', color: '#6366f1', emoji: '📚' },
  { id: 'obj-3', title: 'Travail sur projet', color: '#f59e0b', emoji: '💼' },
]

const useStore = create(
  persist(
    (set, get) => ({
      theme: 'dark',    // 'dark' | 'light'
      reminder: { enabled: false, time: '20:00', lastSent: null },
      objectives: DEFAULT_OBJECTIVES,
      dayData: {},       // { "YYYY-MM-DD": { [objId]: boolean } }
      dayNotes: {},      // { "YYYY-MM-DD": string }
      dayMoods: {},      // { "YYYY-MM-DD": emoji string }
      closedMonths: [],  // ["YYYY-MM"]

      // --- Theme ---
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

      // --- Reminder ---
      setReminder: (updates) =>
        set((s) => ({ reminder: { ...s.reminder, ...updates } })),

      // --- Objectives ---
      addObjective: (obj) =>
        set((s) => ({ objectives: [...s.objectives, obj] })),

      updateObjective: (id, updates) =>
        set((s) => ({
          objectives: s.objectives.map((o) => (o.id === id ? { ...o, ...updates } : o)),
        })),

      deleteObjective: (id) =>
        set((s) => ({ objectives: s.objectives.filter((o) => o.id !== id) })),

      reorderObjectives: (objectives) => set({ objectives }),

      // --- Day data ---
      toggleObjective: (date, objId) =>
        set((s) => ({
          dayData: {
            ...s.dayData,
            [date]: {
              ...s.dayData[date],
              [objId]: !s.dayData[date]?.[objId],
            },
          },
        })),

      // --- Day notes ---
      setDayNote: (date, note) =>
        set((s) => ({ dayNotes: { ...s.dayNotes, [date]: note } })),

      // --- Day moods ---
      setDayMood: (date, mood) =>
        set((s) => ({ dayMoods: { ...s.dayMoods, [date]: mood } })),

      // --- Month closing ---
      closeMonth: (ym) =>
        set((s) => ({
          closedMonths: s.closedMonths.includes(ym)
            ? s.closedMonths
            : [...s.closedMonths, ym],
        })),

      reopenMonth: (ym) =>
        set((s) => ({
          closedMonths: s.closedMonths.filter((m) => m !== ym),
        })),

      // Toggle priority on objective
      togglePriority: (id) =>
        set((s) => ({
          objectives: s.objectives.map((o) =>
            o.id === id ? { ...o, priority: !o.priority } : o
          ),
        })),

      // --- Computed (priority = weight×2) ---
      getDayCompletion: (date) => {
        const { objectives, dayData } = get()
        if (!objectives.length) return 0
        const checks = dayData[date] || {}
        let totalW = 0, doneW = 0
        objectives.forEach((o) => {
          const w = o.priority ? 2 : 1
          totalW += w
          if (checks[o.id]) doneW += w
        })
        return totalW ? Math.round((doneW / totalW) * 100) : 0
      },

      // --- Stats ---
      getStats: (year) => {
        const { objectives, dayData } = get()
        if (!objectives.length) return null

        const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
        const dowSum   = [0, 0, 0, 0, 0, 0, 0]
        const dowCount = [0, 0, 0, 0, 0, 0, 0]
        const objDone  = Object.fromEntries(objectives.map((o) => [o.id, 0]))
        const objTotal = Object.fromEntries(objectives.map((o) => [o.id, 0]))
        let totalDays100 = 0
        let bestMonth = { month: 0, pct: 0 }
        let daysLogged = 0

        for (let m = 1; m <= 12; m++) {
          const daysInMonth = new Date(year, m, 0).getDate()
          let mDone = 0, mTotal = 0

          for (let d = 1; d <= daysInMonth; d++) {
            const date = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            const checks = dayData[date] || {}
            const dayDone = objectives.filter((o) => checks[o.id]).length

            if (Object.keys(checks).length > 0 || dayDone > 0) {
              daysLogged++
              const dow = new Date(year, m - 1, d).getDay()
              const idx = dow === 0 ? 6 : dow - 1
              dowCount[idx]++
              dowSum[idx] += dayDone / objectives.length

              objectives.forEach((o) => {
                objTotal[o.id]++
                if (checks[o.id]) objDone[o.id]++
              })

              if (dayDone === objectives.length) totalDays100++
            }

            mDone  += dayDone
            mTotal += objectives.length
          }

          const pct = mTotal ? Math.round((mDone / mTotal) * 100) : 0
          if (pct > bestMonth.pct) bestMonth = { month: m, pct }
        }

        const dowAvg = dowSum.map((s, i) => (dowCount[i] ? Math.round((s / dowCount[i]) * 100) : 0))
        const bestDowIdx = dowAvg.indexOf(Math.max(...dowAvg))

        const objStats = objectives
          .map((o) => ({ ...o, pct: objTotal[o.id] ? Math.round((objDone[o.id] / objTotal[o.id]) * 100) : 0 }))
          .sort((a, b) => b.pct - a.pct)

        return {
          bestMonth,
          bestDow   : { label: DAYS_FR[bestDowIdx], pct: dowAvg[bestDowIdx] },
          dowAvg,
          dowLabels : DAYS_FR,
          totalDays100,
          daysLogged,
          bestObj   : objStats[0]  || null,
          worstObj  : objStats[objStats.length - 1] || null,
          objStats,
        }
      },

      // --- Streak ---
      getStreak: () => {
        const { objectives, dayData } = get()
        if (!objectives.length) return { count: 0, todayDone: false }

        const dateKey = (d) => {
          const y = d.getFullYear()
          const m = String(d.getMonth() + 1).padStart(2, '0')
          const day = String(d.getDate()).padStart(2, '0')
          return `${y}-${m}-${day}`
        }
        const completion = (d) => {
          const checks = dayData[dateKey(d)] || {}
          const done = objectives.filter((o) => checks[o.id]).length
          return Math.round((done / objectives.length) * 100)
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayDone = completion(today) === 100

        // Start from today if done, else from yesterday (streak still "alive")
        const start = new Date(today)
        if (!todayDone) start.setDate(start.getDate() - 1)

        let count = 0
        for (let i = 0; i < 366; i++) {
          const d = new Date(start)
          d.setDate(start.getDate() - i)
          if (completion(d) === 100) count++
          else break
        }

        return { count, todayDone }
      },

      getMonthCompletion: (year, month) => {
        const { objectives, dayData } = get()
        if (!objectives.length) return 0
        const daysInMonth = new Date(year, month, 0).getDate()
        let doneW = 0, totalW = 0
        const dayTotalW = objectives.reduce((s, o) => s + (o.priority ? 2 : 1), 0)
        for (let d = 1; d <= daysInMonth; d++) {
          const date = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
          const checks = dayData[date] || {}
          objectives.forEach((o) => { if (checks[o.id]) doneW += o.priority ? 2 : 1 })
          totalW += dayTotalW
        }
        return totalW ? Math.round((doneW / totalW) * 100) : 0
      },
    }),
    { name: 'daily-organizer-v1' }
  )
)

export default useStore
