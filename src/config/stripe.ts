import { loadStripe } from '@stripe/stripe-js';

// Clé publique Stripe (côté client)
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  throw new Error('VITE_STRIPE_PUBLISHABLE_KEY is not defined in environment variables');
}

// Initialiser Stripe
export const stripePromise = loadStripe(stripePublishableKey);

// Configuration des plans
export const STRIPE_PLANS = {
  standard: {
    priceId: 'price_standard_monthly', // À remplacer par votre vrai Price ID
    name: 'Standard',
    price: 10000, // 100.00 EUR en centimes
    currency: 'eur',
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
    priceId: 'price_premium_monthly', // À remplacer par votre vrai Price ID
    name: 'Premium',
    price: 20000, // 200.00 EUR en centimes
    currency: 'eur',
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