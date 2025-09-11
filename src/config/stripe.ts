import { loadStripe } from '@stripe/stripe-js';

// Clé publique Stripe (à remplacer par votre vraie clé)
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_publishable_key_here';

export const stripePromise = loadStripe(stripePublishableKey);

export const STRIPE_PLANS = {
  standard: {
    priceId: 'price_standard_monthly', // À remplacer par votre vrai Price ID Stripe
    name: 'Standard',
    price: 10000, // 100.00 USD en centimes
    currency: 'usd',
    interval: 'month',
    features: [
      '200 invitations maximum',
      '1 mois de validité',
      'Tous les modèles premium',
      'Personnalisation avancée',
      'Statistiques détaillées',
      'Support prioritaire'
    ]
  },
  premium: {
    priceId: 'price_premium_monthly', // À remplacer par votre vrai Price ID Stripe
    name: 'Premium',
    price: 20000, // 200.00 USD en centimes
    currency: 'usd',
    interval: 'month',
    features: [
      'Invitations illimitées',
      '1 mois de validité',
      'Tous les modèles premium',
      'Personnalisation avancée',
      'Statistiques détaillées',
      'Support prioritaire',
      'Design sur mesure',
      'API d\'intégration'
    ]
  }
} as const;

export type StripePlan = keyof typeof STRIPE_PLANS;