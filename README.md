Furaha-Event3

Pour utiliser l'authentification Firebase, vous devez :

## Configuration Stripe

✅ **Intégration Stripe configurée !**

Le projet est maintenant configuré avec Stripe pour les paiements :
- **Checkout sécurisé** : Formulaire de paiement intégré
- **Webhooks** : Gestion automatique des événements
- **Abonnements** : Gestion des plans Standard et Premium
- **Portail client** : Interface pour gérer les abonnements

### Configuration requise

1. **Créer un compte Stripe** : [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)

2. **Récupérer les clés API** :
   - Clé publique : `pk_test_...` (pour le frontend)
   - Clé secrète : `sk_test_...` (pour le backend)
   - Secret webhook : `whsec_...` (pour les webhooks)

3. **Configurer les variables d'environnement** :
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique
   STRIPE_SECRET_KEY=sk_test_votre_cle_secrete
   STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook
   ```

4. **Créer les produits et prix dans Stripe** :
   - Plan Standard : 100€/mois
   - Plan Premium : 200€/mois
   - Récupérer les Price IDs et les mettre dans `src/config/stripe.ts`

5. **Configurer les webhooks** :
   - URL : `https://votre-projet.supabase.co/functions/v1/stripe-webhook`
   - Événements à écouter :
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`

### Fonctionnalités Stripe

- ✅ **Paiements sécurisés** avec Stripe Checkout
- ✅ **Gestion des abonnements** automatique
- ✅ **Webhooks** pour synchroniser les statuts
- ✅ **Portail client** pour gérer les abonnements
- ✅ **Support des cartes** bancaires européennes
- ✅ **Gestion des échecs** de paiement
- ✅ **Annulation** d'abonnements

### Structure des Edge Functions

```
supabase/functions/
├── stripe-checkout/     # Création des sessions de paiement
├── stripe-webhook/      # Gestion des événements Stripe
└── stripe-portal/       # Portail client pour gérer les abonnements
```

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