import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  applyActionCode,
  checkActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from 'firebase/auth'
import { auth } from './firebase'

const ERROR_MESSAGES_FR = {
  'auth/email-already-in-use': 'Cet email est déjà utilisé. Essaie de te connecter.',
  'auth/invalid-email': "Cet email n'est pas valide.",
  'auth/weak-password': 'Mot de passe trop faible (6 caractères minimum).',
  'auth/user-not-found': 'Aucun compte trouvé avec cet email.',
  'auth/wrong-password': 'Mot de passe incorrect.',
  'auth/invalid-credential': 'Email ou mot de passe incorrect.',
  'auth/too-many-requests': 'Trop de tentatives. Réessaie dans quelques minutes.',
  'auth/network-request-failed': 'Problème de connexion. Vérifie ton réseau.',
  'auth/missing-password': 'Entre ton mot de passe.',
  'auth/operation-not-allowed': "Ce mode de connexion n'est pas activé (console Firebase → Authentication → Sign-in method).",
  'auth/popup-closed-by-user': 'Fenêtre de connexion fermée. Réessaie.',
  'auth/cancelled-popup-request': 'Fenêtre de connexion fermée. Réessaie.',
  'auth/popup-blocked': 'Popup bloquée par le navigateur. Autorise les popups pour ce site.',
  'auth/account-exists-with-different-credential':
    'Un compte existe déjà avec cet email via un autre mode de connexion. Connecte-toi avec la méthode utilisée à l\'origine.',
  'auth/unauthorized-domain': "Ce domaine n'est pas autorisé (console Firebase → Authentication → Settings → Authorized domains).",
  'auth/expired-action-code': 'Ce lien a expiré. Demande-en un nouveau.',
  'auth/invalid-action-code': 'Ce lien est invalide ou a déjà été utilisé. Demande-en un nouveau.',
}

export function authErrorMessage(err) {
  return ERROR_MESSAGES_FR[err?.code] || 'Une erreur est survenue. Réessaie.'
}

export async function signUp(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  if (displayName) await updateProfile(cred.user, { displayName })
  await sendEmailVerification(cred.user)
  return cred.user
}

export async function signIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email)
}

export async function resendVerification() {
  if (auth.currentUser) await sendEmailVerification(auth.currentUser)
}

export async function logOut() {
  await signOut(auth)
}

// ── Connexion sociale (Google / GitHub / Microsoft) ──────────────
// Chaque fournisseur doit être activé dans la console Firebase.

const SOCIAL_PROVIDERS = {
  google: () => {
    const p = new GoogleAuthProvider()
    p.setCustomParameters({ prompt: 'select_account' })
    return p
  },
  github: () => new GithubAuthProvider(),
  microsoft: () => {
    const p = new OAuthProvider('microsoft.com')
    p.setCustomParameters({ prompt: 'select_account' })
    return p
  },
}

export async function signInWithProvider(providerId) {
  const provider = SOCIAL_PROVIDERS[providerId]()
  const cred = await signInWithPopup(auth, provider)
  return cred.user
}

// ── Gestion des liens email (page /auth/action) ──────────────────
// Firebase envoie oobCode + mode ; on les traite dans notre propre app
// pour afficher des pages à notre charte au lieu de firebaseapp.com.

// Valide l'adresse email à partir du code du lien
export async function applyEmailVerification(oobCode) {
  await applyActionCode(auth, oobCode)
}

// Vérifie un code de reset et renvoie l'email associé (pour l'afficher)
export async function checkPasswordResetCode(oobCode) {
  return verifyPasswordResetCode(auth, oobCode) // renvoie l'email
}

// Applique le nouveau mot de passe
export async function completePasswordReset(oobCode, newPassword) {
  await confirmPasswordReset(auth, oobCode, newPassword)
}

// Inspecte un code (utile pour recoverEmail / infos)
export async function inspectActionCode(oobCode) {
  return checkActionCode(auth, oobCode)
}
