# Furaha-Event - Système de Paiement Stripe + Supabase

Pour utiliser l'authentification Firebase, vous devez :
## Configuration Firebase

✅ **Configuration terminée !**

Le projet est maintenant configuré avec Firebase :
- **Projet Firebase** : furaha-event-831ca
- **Authentification** : Email/Mot de passe activée
- **Firestore** : Base de données configurée
- **Persistance** : Session utilisateur maintenue automatiquement

### Variables d'environnement requises

Les variables d'environnement sont déjà configurées dans le fichier `.env` :

```
VITE_FIREBASE_API_KEY=AIzaSyBtWKFZ78KtLA_WKEkNBpJWS1LQVUMWQXc
VITE_FIREBASE_AUTH_DOMAIN=furaha-event-831ca.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=furaha-event-831ca
VITE_FIREBASE_STORAGE_BUCKET=furaha-event-831ca.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=369854399050
VITE_FIREBASE_APP_ID=1:369854399050:web:9dd985ac0fd2a26a8e9cb3
```

### Fonctionnalités d'authentification

- ✅ **Inscription** avec email/mot de passe
- ✅ **Connexion** avec email/mot de passe  
- ✅ **Réinitialisation** de mot de passe
- ✅ **Persistance** de session (l'utilisateur reste connecté)
- ✅ **Déconnexion** manuelle
- ✅ **Gestion** des profils utilisateur

## Configuration Stripe + Supabase

### 1. Configuration Stripe

1. **Créer un compte Stripe** : https://dashboard.stripe.com/register
2. **Récupérer les clés API** :
   - Clé publique : `pk_test_...` (pour le frontend)
   - Clé secrète : `sk_test_...` (pour les fonctions Edge)
3. **Créer les produits et prix** :
   ```bash
   # Plan Standard - 100$ par mois
   stripe products create --name="Standard Plan" --description="200 invitations maximum"
   stripe prices create --product=prod_xxx --unit-amount=10000 --currency=usd --recurring[interval]=month
   
   # Plan Premium - 200$ par mois  
   stripe products create --name="Premium Plan" --description="Invitations illimitées"
   stripe prices create --product=prod_xxx --unit-amount=20000 --currency=usd --recurring[interval]=month
   ```
4. **Configurer les webhooks** :
   - URL : `https://your-project.supabase.co/functions/v1/stripe-webhook`
   - Événements : `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`

### 2. Configuration Supabase

1. **Créer un projet Supabase** : https://supabase.com/dashboard
2. **Exécuter les migrations** :
   ```sql
   -- Les tables seront créées automatiquement via le fichier de migration
   ```
3. **Configurer les variables d'environnement** dans Supabase :
   - `STRIPE_SECRET_KEY` : Votre clé secrète Stripe
   - `STRIPE_WEBHOOK_SECRET` : Secret du webhook Stripe

### 3. Variables d'environnement

Créez un fichier `.env` avec :

```env
# Firebase (existant)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Fonctionnalités de paiement

- ✅ **Paiements sécurisés** avec Stripe Checkout
- ✅ **Abonnements récurrents** (Standard/Premium)
- ✅ **Webhooks** pour synchroniser les statuts
- ✅ **Portail client** pour gérer les abonnements
- ✅ **Gestion des limites** d'invitations par plan
- ✅ **Historique des paiements**

### Règles Firestore

Ajoutez ces règles dans votre console Firebase Firestore :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour la collection users
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Règles pour les événements et invitations
    match /events/{eventId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /invitations/{invitationId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Règles Supabase (RLS)

Les règles de sécurité sont automatiquement configurées via les migrations :

```sql
-- Les utilisateurs ne peuvent voir que leurs propres abonnements et paiements
CREATE POLICY "Users can read own subscriptions" ON subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can read own payments" ON payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
```

## Déploiement

1. **Déployer les fonctions Edge Supabase** :
   ```bash
   supabase functions deploy create-checkout-session
   supabase functions deploy stripe-webhook
   supabase functions deploy verify-payment
   supabase functions deploy cancel-subscription
   supabase functions deploy create-customer-portal
   ```

2. **Configurer les variables d'environnement** dans Supabase Dashboard

3. **Tester les paiements** en mode test avec les cartes de test Stripe

L'application gère maintenant les vrais paiements avec Stripe tout en conservant le système d'authentification Firebase existant.
```