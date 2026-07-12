import { motion } from 'framer-motion'
import { X, Crown, Check, Sparkles } from 'lucide-react'
import { PRICING, PREMIUM_FEATURES } from '../utils/plans'

export default function UpgradeModal({ onClose, reason }) {
  const hasLinks = PRICING.monthly.link || PRICING.yearly.link

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
        className="relative w-full max-w-md bg-slate-900 border border-amber-500/20 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Glow header */}
        <div className="relative p-6 pb-5 text-center overflow-hidden">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
          <div className="relative">
            <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <Crown size={26} className="text-white" fill="currentColor" />
            </div>
            <h2 className="text-xl font-extrabold text-white">Passe à Premium</h2>
            <p className="text-sm text-slate-400 mt-1">
              {reason || 'Débloque tout le potentiel de Daily Organizer'}
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="px-6 pb-5">
          <div className="space-y-2.5">
            {PREMIUM_FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
                  <Check size={11} className="text-amber-400" />
                </div>
                <span className="text-sm text-slate-300">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing buttons */}
        <div className="p-6 pt-1 space-y-2.5">
          {hasLinks ? (
            <>
              {PRICING.yearly.link && (
                <a
                  href={PRICING.yearly.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-amber-500/25"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                >
                  <Sparkles size={15} />
                  {PRICING.yearly.label}
                  {PRICING.yearly.sub && (
                    <span className="absolute -top-2 right-3 text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                      {PRICING.yearly.sub}
                    </span>
                  )}
                </a>
              )}
              {PRICING.monthly.link && (
                <a
                  href={PRICING.monthly.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/15 text-sm font-semibold text-slate-200 hover:bg-white/5 transition-colors"
                >
                  {PRICING.monthly.label}
                </a>
              )}
              <p className="text-center text-[11px] text-slate-500 pt-1">
                Paiement sécurisé · Activation automatique · Annulable à tout moment
              </p>
            </>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-slate-400">
                Le paiement en ligne arrive très bientôt !
              </p>
              <p className="text-xs text-slate-500 mt-1">
                En attendant, contacte-nous pour activer Premium.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
