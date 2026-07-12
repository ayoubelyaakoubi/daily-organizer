// ── Plans & monétisation ─────────────────────────────────────────
// Les liens de paiement (Stripe Payment Links, Lemon Squeezy, …)
// se configurent dans .env.local — voir README.md section Monétisation.

export const FREE_MAX_OBJECTIVES = 5

export const PRICING = {
  monthly: {
    label: '2,99 € / mois',
    link: import.meta.env.VITE_PAYMENT_LINK_MONTHLY || null,
  },
  yearly: {
    label: '24,99 € / an',
    sub: '2 mois offerts',
    link: import.meta.env.VITE_PAYMENT_LINK_YEARLY || null,
  },
}

export const FREE_FEATURES = [
  `${FREE_MAX_OBJECTIVES} objectifs maximum`,
  'Suivi quotidien illimité',
  'Streaks & progression annuelle',
  'Humeur et notes du jour',
  'Application installable (PWA)',
]

export const PREMIUM_FEATURES = [
  'Objectifs illimités',
  'Partage de progression avec tes amis',
  'Classement entre amis (leaderboard)',
  'Statistiques avancées (heatmap, radar)',
  'Export Excel / CSV / JSON',
  'Support prioritaire',
]
