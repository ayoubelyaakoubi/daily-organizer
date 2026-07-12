# Daily Organizer

Tracker d'objectifs et d'habitudes quotidiennes — React + Vite + Tailwind + Firebase.

**Fonctionnalités** : landing page, comptes email (vérification + reset mot de passe), suivi quotidien avec streaks, humeur & notes, statistiques (heatmap, radar, exports), partage de progression, classement entre amis, plan Free / Premium, PWA installable, sync multi-appareils.

## Démarrage

```bash
npm install
cp .env.example .env.local   # puis remplir les valeurs Firebase
npm run dev
```

## Configuration Firebase (obligatoire)

1. **Authentication** → Sign-in method → activer **Email/Password**.
2. **Realtime Database** → créer la base, puis déployer les règles de sécurité :
   - copier le contenu de [`database.rules.json`](database.rules.json) dans l'onglet *Règles*, **ou**
   - `firebase deploy --only database` avec la CLI Firebase.
3. (Optionnel) **Authentication → Templates** : personnaliser les emails de vérification / reset en français.

### Structure de la base

```
users/{uid}/data      → données de l'utilisateur (objectifs, jours, notes…) — privé
users/{uid}/friends   → liste d'amis { friendUid: true }                    — privé
plans/{uid}           → "premium" (absent = free) — écrit UNIQUEMENT côté admin
profiles/{uid}        → profil public (nom, streak, % semaine) si partage activé
codes/{code}          → code ami → uid
```

## Monétisation (Free vs Premium)

- **Free** : 5 objectifs max, pas de partage, stats basiques.
- **Premium** : objectifs illimités, partage + leaderboard, stats avancées, exports.

### Activer le paiement

1. Créer un compte [Stripe](https://stripe.com) (ou Lemon Squeezy, compatible Maroc via Payoneer).
2. Créer deux **Payment Links** (mensuel + annuel) et les mettre dans `.env.local` :
   ```
   VITE_PAYMENT_LINK_MONTHLY=https://buy.stripe.com/...
   VITE_PAYMENT_LINK_YEARLY=https://buy.stripe.com/...
   ```
3. **Activer Premium pour un client** : dans la console Firebase → Realtime Database, créer `plans/{uid}` = `"premium"` (l'uid est visible dans Authentication). L'app se met à jour en temps réel.
4. **Automatisation (recommandé dès les premiers clients)** : une Cloud Function déclenchée par le webhook Stripe `checkout.session.completed` qui écrit `plans/{uid}` automatiquement. Demander l'email du client dans le Payment Link pour faire le rapprochement.

> ⚠️ Le champ `plans/{uid}` n'est **pas** modifiable par les clients (règle `.write: false`) — c'est ce qui empêche de s'auto-attribuer Premium.

## Roadmap

- [ ] Webhook Stripe → activation Premium automatique (Cloud Function)
- [ ] Notifications push FCM (plus fiables que l'API Notification actuelle)
- [ ] Défis de groupe ("tous à 100% cette semaine ?")
- [ ] Blog SEO (articles productivité) — idéal en pré-rendu statique
- [ ] Dashboard analytics (Firebase Analytics + retention)
- [ ] Export Google Calendar / Slack, API publique

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — build de production (dans `dist/`)
- `npm run lint` — ESLint
- `npm run preview` — prévisualisation du build
