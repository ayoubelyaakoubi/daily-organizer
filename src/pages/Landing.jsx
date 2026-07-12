import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Flame, BarChart2, Smile, Users, WifiOff, Check,
  ArrowRight, ChevronDown, Crown, Target, TrendingUp, Sparkles, Quote,
} from 'lucide-react'
import { FREE_FEATURES, PREMIUM_FEATURES, PRICING, FREE_MAX_OBJECTIVES } from '../utils/plans'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: 'easeOut' },
}

// ── Mini mockup de l'app (hero) ──────────────────────────────────

function HeroMockup() {
  const days = Array.from({ length: 28 }, (_, i) => i + 1)
  const pctFor = (d) => [100, 100, 75, 100, 50, 100, 100, 25, 100, 75, 100, 100, 0, 100, 100, 50, 75, 100, 100, 100, 25, 100, 75, 100, 100, 50, 100, 100][d - 1]
  const colorFor = (pct) => (pct >= 75 ? '#10b981' : pct >= 40 ? '#f59e0b' : pct > 0 ? '#6366f1' : 'rgba(255,255,255,0.06)')

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.7, delay: 0.3 }}
      className="relative mx-auto max-w-md"
    >
      {/* Glow */}
      <div className="absolute -inset-6 bg-indigo-600/20 rounded-[2.5rem] blur-3xl pointer-events-none" />

      <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl">
        {/* Fake header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Calendar size={13} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">Juillet 2026</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30">
            <Flame size={12} className="text-orange-400" fill="#fb923c55" />
            <span className="text-xs font-bold text-orange-400">14 jours</span>
          </div>
        </div>

        {/* Mini calendar */}
        <div className="grid grid-cols-7 gap-1.5 mb-4">
          {days.map((d) => {
            const pct = pctFor(d)
            return (
              <div
                key={d}
                className="aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold"
                style={{
                  backgroundColor: pct > 0 ? `${colorFor(pct)}20` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${pct > 0 ? `${colorFor(pct)}50` : 'rgba(255,255,255,0.06)'}`,
                  color: pct > 0 ? colorFor(pct) : '#475569',
                }}
              >
                {d}
              </div>
            )
          })}
        </div>

        {/* Fake objectives */}
        {[
          { emoji: '🏃', label: 'Sport / Exercice', color: '#10b981', done: true },
          { emoji: '📚', label: 'Lire 30 minutes', color: '#6366f1', done: true },
          { emoji: '💻', label: 'Travailler mon projet', color: '#f59e0b', done: false },
        ].map((o) => (
          <div
            key={o.label}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl mb-1.5 border"
            style={{
              backgroundColor: o.done ? `${o.color}15` : 'rgba(255,255,255,0.03)',
              borderColor: o.done ? `${o.color}40` : 'rgba(255,255,255,0.07)',
            }}
          >
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: o.done ? o.color : 'transparent', border: o.done ? 'none' : '1.5px solid #475569' }}
            >
              {o.done && <Check size={10} className="text-white" />}
            </div>
            <span className="text-sm">{o.emoji}</span>
            <span className={`text-xs font-medium ${o.done ? 'line-through opacity-60' : ''}`} style={{ color: o.done ? o.color : '#cbd5e1' }}>
              {o.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ── Sections ─────────────────────────────────────────────────────

const FEATURES = [
  { icon: Target, color: '#6366f1', title: 'Objectifs quotidiens', desc: 'Définis tes objectifs avec emoji, couleur et priorité. Coche-les chaque jour en un clic.' },
  { icon: Flame, color: '#f97316', title: 'Streaks & motivation', desc: 'Enchaîne les journées à 100% et garde ta série vivante. Confettis et sons à chaque victoire.' },
  { icon: BarChart2, color: '#10b981', title: 'Statistiques détaillées', desc: 'Heatmap annuelle, meilleur jour de la semaine, radar par objectif : comprends tes habitudes.' },
  { icon: Smile, color: '#eab308', title: 'Humeur & journal', desc: "Note ton humeur du jour et écris tes réflexions. Ton journal personnel, jour après jour." },
  { icon: Users, color: '#ec4899', title: 'Partage & classement', desc: 'Partage ta progression, ajoute tes amis par code et grimpe dans le leaderboard hebdo.' },
  { icon: WifiOff, color: '#06b6d4', title: 'Hors-ligne & installable', desc: "Installe l'app sur ton téléphone (PWA). Tes données se synchronisent sur tous tes appareils." },
]

const STEPS = [
  { num: '1', title: 'Définis tes objectifs', desc: `Sport, lecture, projet… jusqu'à ${FREE_MAX_OBJECTIVES} objectifs gratuits, illimités en Premium.` },
  { num: '2', title: 'Coche chaque jour', desc: 'Ouvre l\'app, coche ce que tu as accompli. 10 secondes par jour suffisent.' },
  { num: '3', title: 'Regarde ta progression', desc: 'Streaks, pourcentages, heatmap : ta constance devient visible et motivante.' },
]

const TESTIMONIALS = [
  { name: 'Sara M.', role: 'Étudiante en médecine', text: "Le streak m'a rendue accro à mes révisions. 47 jours d'affilée et je ne compte pas m'arrêter !", color: '#ec4899' },
  { name: 'Yassine K.', role: 'Développeur freelance', text: "Enfin un tracker simple qui ne me demande pas 15 minutes de saisie. Je coche, je ferme, c'est fait.", color: '#6366f1' },
  { name: 'Imane B.', role: 'Coach sportive', text: "Je l'utilise avec mes clientes : le classement entre amies crée une émulation incroyable.", color: '#10b981' },
]

const FAQS = [
  { q: 'Est-ce vraiment gratuit ?', a: `Oui ! Le plan gratuit inclut ${FREE_MAX_OBJECTIVES} objectifs, le suivi quotidien illimité, les streaks et les statistiques de base. Aucune carte bancaire n'est demandée.` },
  { q: 'Que contient le plan Premium ?', a: 'Objectifs illimités, partage de progression, classement entre amis, statistiques avancées (heatmap, radar) et export Excel/CSV/JSON.' },
  { q: 'Mes données sont-elles privées ?', a: 'Oui. Tes données sont liées à ton compte et protégées par des règles de sécurité strictes. Seul ton profil public (si tu actives le partage) est visible par tes amis.' },
  { q: "Puis-je utiliser l'app sur mon téléphone ?", a: "Oui, Daily Organizer est une PWA : installe-la depuis ton navigateur et utilise-la comme une app native, même hors-ligne." },
  { q: 'Puis-je annuler mon abonnement ?', a: 'À tout moment, en un clic. Tu conserves tes données et repasses simplement au plan gratuit.' },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.03]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/[0.03] transition-colors"
      >
        <span className="text-sm font-semibold text-white">{q}</span>
        <ChevronDown size={16} className={`text-slate-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="px-5 pb-4 text-sm text-slate-400 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PricingCard({ highlight, title, price, sub, features, cta, icon: Icon }) {
  return (
    <motion.div
      {...fadeUp}
      className={`relative flex-1 rounded-3xl p-7 border ${
        highlight
          ? 'border-amber-500/40 bg-gradient-to-b from-amber-500/[0.08] to-slate-900/60 shadow-xl shadow-amber-500/10'
          : 'border-white/10 bg-white/[0.03]'
      }`}
    >
      {highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full whitespace-nowrap">
          ⭐ Recommandé
        </span>
      )}
      <div className="flex items-center gap-2 mb-4">
        <Icon size={18} className={highlight ? 'text-amber-400' : 'text-slate-400'} />
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      <div className="mb-1">
        <span className="text-4xl font-extrabold text-white">{price}</span>
      </div>
      <p className="text-xs text-slate-500 mb-6">{sub}</p>
      <ul className="space-y-2.5 mb-7">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <Check size={14} className={`mt-0.5 shrink-0 ${highlight ? 'text-amber-400' : 'text-emerald-400'}`} />
            <span className="text-sm text-slate-300">{f}</span>
          </li>
        ))}
      </ul>
      <Link
        to="/signup"
        className={`block w-full py-3 rounded-xl text-center text-sm font-bold transition-all ${
          highlight
            ? 'text-white hover:shadow-lg hover:shadow-amber-500/25'
            : 'border border-white/15 text-slate-200 hover:bg-white/5'
        }`}
        style={highlight ? { background: 'linear-gradient(135deg, #f59e0b, #d97706)' } : {}}
      >
        {cta}
      </Link>
    </motion.div>
  )
}

// ── Page ─────────────────────────────────────────────────────────

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-x-hidden">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl" />
      </div>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Calendar size={16} className="text-white" />
            </div>
            <span className="font-bold text-white">Daily Organizer</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="hover:text-white transition-colors">Tarifs</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all">
              Se connecter
            </Link>
            <Link to="/signup" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-indigo-500/25">
              Commencer
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pt-16 pb-20 md:pt-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-6"
            >
              <Sparkles size={12} />
              Nouveau — partage & classement entre amis
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-5"
            >
              Atteins tes objectifs,{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                un jour à la fois
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-lg leading-relaxed mb-8"
            >
              Le tracker d'habitudes simple et motivant : coche tes objectifs chaque jour,
              enchaîne les streaks, et regarde ta constance transformer ta vie.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-3"
            >
              <Link
                to="/signup"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
              >
                Commencer gratuitement
                <ArrowRight size={16} />
              </Link>
              <a
                href="#features"
                className="px-6 py-3.5 rounded-xl border border-white/15 text-slate-300 font-medium hover:bg-white/5 hover:text-white transition-all"
              >
                Découvrir
              </a>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs text-slate-600 mt-5"
            >
              ✓ Gratuit pour toujours &nbsp;·&nbsp; ✓ Sans carte bancaire &nbsp;·&nbsp; ✓ 2 minutes pour démarrer
            </motion.p>
          </div>

          <HeroMockup />
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-4 py-20 scroll-mt-16">
        <motion.div {...fadeUp} className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
            Tout ce qu'il faut pour rester constant
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Pensé pour être utilisé en 10 secondes par jour — mais assez puissant pour transformer tes habitudes.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.06 }}
              className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 hover:border-white/20 hover:bg-white/[0.05] transition-all"
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: `${f.color}1a` }}
              >
                <f.icon size={20} style={{ color: f.color }} />
              </div>
              <h3 className="font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 py-20">
        <motion.h2 {...fadeUp} className="text-3xl font-extrabold text-center mb-14">
          Comment ça marche ?
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((s, i) => (
            <motion.div key={s.num} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }} className="relative text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-xl font-extrabold text-white mb-4 shadow-lg shadow-indigo-500/25">
                {s.num}
              </div>
              <h3 className="font-bold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-7 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-px bg-gradient-to-r from-indigo-500/40 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="relative z-10 max-w-4xl mx-auto px-4 py-20 scroll-mt-16">
        <motion.div {...fadeUp} className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Un tarif simple et honnête</h2>
          <p className="text-slate-400">Commence gratuitement, passe à Premium quand tu veux aller plus loin.</p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6">
          <PricingCard
            icon={Target}
            title="Gratuit"
            price="0 €"
            sub="Pour toujours"
            features={FREE_FEATURES}
            cta="Commencer gratuitement"
          />
          <PricingCard
            highlight
            icon={Crown}
            title="Premium"
            price={PRICING.monthly.label.split(' /')[0]}
            sub={`par mois — ou ${PRICING.yearly.label} (${PRICING.yearly.sub})`}
            features={PREMIUM_FEATURES}
            cta="Essayer Premium"
          />
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-20">
        <motion.h2 {...fadeUp} className="text-3xl font-extrabold text-center mb-14">
          Ils ont construit leurs habitudes ici
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.08 }}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
            >
              <Quote size={18} style={{ color: t.color }} className="mb-3 opacity-60" />
              <p className="text-sm text-slate-300 leading-relaxed mb-5">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}99)` }}
                >
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="relative z-10 max-w-2xl mx-auto px-4 py-20 scroll-mt-16">
        <motion.h2 {...fadeUp} className="text-3xl font-extrabold text-center mb-10">
          Questions fréquentes
        </motion.h2>
        <div className="space-y-3">
          {FAQS.map((f) => <FaqItem key={f.q} {...f} />)}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 py-20">
        <motion.div
          {...fadeUp}
          className="relative rounded-3xl border border-indigo-500/30 p-10 md:p-14 text-center overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))' }}
        >
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <TrendingUp size={32} className="mx-auto text-indigo-400 mb-4" />
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Ta première journée à 100% commence aujourd'hui
          </h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Rejoins Daily Organizer gratuitement et transforme tes objectifs en habitudes durables.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
          >
            Commencer gratuitement
            <ArrowRight size={17} />
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/5 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Calendar size={14} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-300">Daily Organizer</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <a href="#features" className="hover:text-slate-300 transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="hover:text-slate-300 transition-colors">Tarifs</a>
            <a href="#faq" className="hover:text-slate-300 transition-colors">FAQ</a>
            <Link to="/login" className="hover:text-slate-300 transition-colors">Connexion</Link>
          </div>
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Ayoub El Yaakoubi — Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}
