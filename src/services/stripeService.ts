import { loadStripe } from '@stripe/stripe-js';

// Clé publique Stripe (à remplacer par votre vraie clé)
const stripePromise = loadStripe('pk_test_51S5oDh0PYTC9Tov9fdmCskecUbB6SucRqXh2NmvvjutjFPyFuM1Fzspamz57dZc2jAFSpC2lkvAkbHwOBfDveud900ziUGPeMk');

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'standard',
    name: 'Standard',
    price: 100,
    currency: 'usd',
    interval: 'month',
    stripePriceId: 'price_1S6F6Q0PYTC9Tov97eby2PNf', // À remplacer par votre vrai Price ID
    features: [
      '200 invitations maximum',
      '1 mois de validité',
      'Tous les modèles premium',
      'Personnalisation avancée',
      'Statistiques détaillées',
      'Support prioritaire'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 200,
    currency: 'usd',
    interval: 'month',
    stripePriceId: 'price_premium_monthly', // À remplacer par votre vrai Price ID
    features: [
      'Invitations illimitées',
      '1 mois de validité',
      'Tous les modèles premium',
      'Personnalisation avancée',
      'Statistiques détaillées',
      'Support prioritaire',
      'Design sur mesure'
    ]
  }
];

export class StripeService {
  private static stripe: any = null;

  static async getStripe() {
    if (!this.stripe) {
      this.stripe = await stripePromise;
    }
    return this.stripe;
  }

  static async createCheckoutSession(planId: string, userId: string, userEmail: string) {
    try {
      const plan = pricingPlans.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan non trouvé');
      }

      // Dans un vrai projet, ceci serait un appel à votre backend
      // Ici, nous simulons la création d'une session Stripe
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          userId,
          userEmail,
          planId,
          successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/payment/cancel`,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session de paiement');
      }

      const session = await response.json();
      return session;
    } catch (error) {
      console.error('Erreur Stripe:', error);
      throw error;
    }
  }

  static async redirectToCheckout(sessionId: string) {
    try {
      const stripe = await this.getStripe();
      if (!stripe) {
        throw new Error('Stripe non initialisé');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Erreur lors de la redirection:', error);
      throw error;
    }
  }

  static async handlePayment(planId: string, userId: string, userEmail: string) {
    try {
      const session = await this.createCheckoutSession(planId, userId, userEmail);
      await this.redirectToCheckout(session.id);
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      throw error;
    }
  }
}