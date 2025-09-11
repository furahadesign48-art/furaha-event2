import { loadStripe } from '@stripe/stripe-js';

// Clé publique Stripe (remplacez par votre vraie clé en production)
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890abcdef';

export const stripePromise = loadStripe(stripePublishableKey);

export const STRIPE_CONFIG = {
  publishableKey: stripePublishableKey,
  currency: 'eur',
  country: 'FR'
};

export const PRICING_PLANS = {
  standard: {
    name: 'Standard',
    price: 100,
    priceId: 'price_standard_monthly', // ID du prix Stripe
    currency: 'EUR',
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
    name: 'Premium',
    price: 200,
    priceId: 'price_premium_monthly', // ID du prix Stripe
    currency: 'EUR',
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