import { stripePromise, STRIPE_PLANS, StripePlan } from '../config/stripe';
import { useAuth } from '../hooks/useAuth';

export class StripeService {
  // Créer une session de checkout
  static async createCheckoutSession(
    planType: StripePlan,
    userId: string,
    userEmail: string,
    successUrl: string,
    cancelUrl: string
  ) {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType,
          userId,
          userEmail,
          successUrl,
          cancelUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session de paiement');
      }

      const { sessionId } = await response.json();
      return sessionId;
    } catch (error) {
      console.error('Erreur lors de la création de la session Stripe:', error);
      throw error;
    }
  }

  // Rediriger vers Stripe Checkout
  static async redirectToCheckout(sessionId: string) {
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe n\'a pas pu être initialisé');
    }

    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });

    if (error) {
      console.error('Erreur lors de la redirection vers Stripe:', error);
      throw error;
    }
  }

  // Créer un portail client pour gérer l'abonnement
  static async createCustomerPortalSession(customerId: string, returnUrl: string) {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          returnUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du portail client');
      }

      const { url } = await response.json();
      return url;
    } catch (error) {
      console.error('Erreur lors de la création du portail client:', error);
      throw error;
    }
  }

  // Vérifier le statut d'un abonnement
  static async getSubscriptionStatus(subscriptionId: string) {
    try {
      const response = await fetch(`/api/stripe/subscription-status/${subscriptionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la vérification de l\'abonnement');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'abonnement:', error);
      throw error;
    }
  }

  // Annuler un abonnement
  static async cancelSubscription(subscriptionId: string) {
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'annulation de l\'abonnement');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'abonnement:', error);
      throw error;
    }
  }
}