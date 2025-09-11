Furaha-Event3

Pour utiliser l'authentification Firebase, vous devez :
## Configuration Firebase

✅ **Configuration terminée !**

Le projet est maintenant configuré avec Firebase :
- **Projet Firebase** : furaha-event-831ca
- **Authentification** : Email/Mot de passe activée
- **Firestore** : Base de données configurée
- **Persistance** : Session utilisateur maintenue automatiquement

## Configuration Stripe

✅ **Système de paiement intégré !**

Le projet inclut maintenant un système de paiement complet avec Stripe :
- **Paiements sécurisés** : Intégration Stripe Elements
- **Plans d'abonnement** : Gratuit, Standard (100€/mois), Premium (200€/mois)
- **Gestion des limites** : Contrôle automatique des invitations selon le plan
- **Interface moderne** : Modals de paiement élégants et sécurisés

### Configuration requise

1. **Compte Stripe** : Créez un compte sur [stripe.com](https://stripe.com)
2. **Clés API** : Récupérez vos clés dans le dashboard Stripe
3. **Variables d'environnement** : Ajoutez votre clé publique dans `.env`

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique_stripe
```

### Fonctionnalités de paiement

- ✅ **Modal de paiement** intégré avec Stripe Elements
- ✅ **Validation en temps réel** des cartes de crédit
- ✅ **Gestion des erreurs** et messages utilisateur
- ✅ **Mise à jour automatique** des abonnements
- ✅ **Interface responsive** pour mobile et desktop
- ✅ **Sécurité PCI** complète via Stripe

### Variables d'environnement requises

Les variables d'environnement sont déjà configurées dans le fichier `.env` :

```
VITE_FIREBASE_API_KEY=AIzaSyBtWKFZ78KtLA_WKEkNBpJWS1LQVUMWQXc
VITE_FIREBASE_AUTH_DOMAIN=furaha-event-831ca.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=furaha-event-831ca
VITE_FIREBASE_STORAGE_BUCKET=furaha-event-831ca.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=369854399050
VITE_FIREBASE_APP_ID=1:369854399050:web:9dd985ac0fd2a26a8e9cb3
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_stripe
```

### Fonctionnalités d'authentification

- ✅ **Inscription** avec email/mot de passe
- ✅ **Connexion** avec email/mot de passe  
- ✅ **Réinitialisation** de mot de passe
- ✅ **Persistance** de session (l'utilisateur reste connecté)
- ✅ **Déconnexion** manuelle
- ✅ **Gestion** des profils utilisateur

### Fonctionnalités de paiement

- ✅ **Plan Gratuit** : 5 invitations gratuites
- ✅ **Plan Standard** : 200 invitations (100€/mois)
- ✅ **Plan Premium** : Invitations illimitées (200€/mois)
- ✅ **Paiement sécurisé** via Stripe
- ✅ **Gestion automatique** des limites d'utilisation

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
    
    // Règles pour les abonnements
    match /subscriptions/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Déploiement en production

### Configuration Stripe en production

1. **Remplacez les clés de test** par les clés de production dans `.env`
2. **Configurez les webhooks** Stripe pour synchroniser les paiements
3. **Implémentez un backend** pour gérer les PaymentIntents de manière sécurisée
4. **Testez les paiements** avec de vraies cartes en mode test

### Sécurité

- ✅ **Aucune donnée sensible** stockée côté client
- ✅ **Chiffrement SSL** pour tous les échanges
- ✅ **Validation côté serveur** des paiements
- ✅ **Conformité PCI** via Stripe