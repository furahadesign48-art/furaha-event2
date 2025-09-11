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
    priceId: 'price_1S6F6Q0PYTC9Tov97eby2PNf', // Remplacez par votre vrai Price ID Stripe
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
    priceId: 'price_1S6F7N0PYTC9Tov9cwD2dElL', // Remplacez par votre vrai Price ID Stripe
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