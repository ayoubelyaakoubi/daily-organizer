export const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

export const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export const DAYS_FULL_FR = [
  'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'
]

export function toDateKey(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function toMonthKey(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`
}

export function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

export function getFirstDayOfMonth(year, month) {
  // Returns 0=Mon, 1=Tue ... 6=Sun (ISO week)
  const day = new Date(year, month - 1, 1).getDay()
  return day === 0 ? 6 : day - 1
}

export function formatDate(year, month, day) {
  const d = new Date(year, month - 1, day)
  const dayName = DAYS_FULL_FR[d.getDay() === 0 ? 6 : d.getDay() - 1]
  return `${dayName} ${day} ${MONTHS_FR[month - 1]} ${year}`
}

export function isToday(year, month, day) {
  const today = new Date()
  return (
    today.getFullYear() === year &&
    today.getMonth() + 1 === month &&
    today.getDate() === day
  )
}

export function isPast(year, month, day) {
  const date = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}
