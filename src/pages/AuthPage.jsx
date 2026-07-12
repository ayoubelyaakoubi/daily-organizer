import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Mail, Lock, User, ArrowRight, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'
import { signUp, signIn, resetPassword, signInWithProvider, authErrorMessage } from '../utils/auth'

// Logos des fournisseurs (lucide n'a pas d'icônes de marques)
const GoogleLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

const GithubLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.53-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/>
  </svg>
)

const MicrosoftLogo = () => (
  <svg width="15" height="15" viewBox="0 0 23 23">
    <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
    <rect x="12" y="1" width="10" height="10" fill="#7FBA00"/>
    <rect x="1" y="12" width="10" height="10" fill="#00A4EF"/>
    <rect x="12" y="12" width="10" height="10" fill="#FFB900"/>
  </svg>
)

const SOCIAL_BUTTONS = [
  { id: 'google', label: 'Google', Logo: GoogleLogo },
  { id: 'github', label: 'GitHub', Logo: GithubLogo },
  { id: 'microsoft', label: 'Microsoft', Logo: MicrosoftLogo },
]

const MODES = {
  '/login': {
    title: 'Bon retour !',
    subtitle: 'Connecte-toi pour retrouver tes objectifs',
    cta: 'Se connecter',
  },
  '/signup': {
    title: 'Crée ton compte',
    subtitle: 'Gratuit — aucune carte bancaire requise',
    cta: 'Commencer gratuitement',
  },
  '/reset': {
    title: 'Mot de passe oublié',
    subtitle: 'On t\'envoie un lien de réinitialisation par email',
    cta: 'Envoyer le lien',
  },
}

function Field({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
      <input
        {...props}
        className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:bg-white/8 transition-all"
      />
    </div>
  )
}

export default function AuthPage() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const mode = MODES[pathname] ? pathname : '/login'
  const { title, subtitle, cta } = MODES[mode]

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState(null) // id du provider en cours
  const [resetSent, setResetSent] = useState(false)

  const handleSocial = async (providerId) => {
    setError(null)
    setSocialLoading(providerId)
    try {
      await signInWithProvider(providerId)
      navigate('/app')
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setSocialLoading(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === '/signup') {
        await signUp(email.trim(), password, name.trim())
        navigate('/app')
      } else if (mode === '/login') {
        await signIn(email.trim(), password)
        navigate('/app')
      } else {
        await resetPassword(email.trim())
        setResetSent(true)
      }
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        {/* Back to landing */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-6">
          <ArrowLeft size={14} />
          Retour à l'accueil
        </Link>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
              <Calendar size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white leading-tight">{title}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            </div>
          </div>

          {resetSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <CheckCircle2 size={40} className="mx-auto text-emerald-400 mb-3" />
              <p className="text-white font-semibold">Email envoyé !</p>
              <p className="text-slate-400 text-sm mt-1">
                Vérifie ta boîte mail <span className="text-slate-300">{email}</span> et suis le lien pour réinitialiser ton mot de passe.
              </p>
              <Link
                to="/login"
                className="inline-block mt-5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
              >
                Retour à la connexion
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === '/signup' && (
                <Field
                  icon={User}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ton prénom"
                  autoComplete="name"
                  required
                />
              )}

              <Field
                icon={Mail}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton@email.com"
                autoComplete="email"
                required
              />

              {mode !== '/reset' && (
                <Field
                  icon={Lock}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe (6 caractères min.)"
                  autoComplete={mode === '/signup' ? 'new-password' : 'current-password'}
                  minLength={6}
                  required
                />
              )}

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5"
                >
                  {error}
                </motion.p>
              )}

              {mode === '/login' && (
                <div className="text-right">
                  <Link to="/reset" className="text-xs text-slate-500 hover:text-indigo-400 transition-colors">
                    Mot de passe oublié ?
                  </Link>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/25"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {cta}
              </button>

              {/* ── Connexion sociale ── */}
              {mode !== '/reset' && (
                <>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[11px] text-slate-500">ou continuer avec</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {SOCIAL_BUTTONS.map(({ id, label, Logo }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleSocial(id)}
                        disabled={socialLoading !== null}
                        title={`Continuer avec ${label}`}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 disabled:opacity-50 text-slate-300 transition-all"
                      >
                        {socialLoading === id ? <Loader2 size={15} className="animate-spin" /> : <Logo />}
                        <span className="text-xs font-medium hidden sm:inline">{label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </form>
          )}

          {/* Switch mode */}
          {!resetSent && (
            <p className="text-center text-sm text-slate-500 mt-6">
              {mode === '/signup' ? (
                <>Déjà un compte ?{' '}
                  <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Se connecter</Link>
                </>
              ) : (
                <>Pas encore de compte ?{' '}
                  <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">Créer un compte gratuit</Link>
                </>
              )}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
