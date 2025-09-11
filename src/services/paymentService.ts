import { stripePromise, STRIPE_PLANS, StripePlan } from '../config/stripe';
import { supabase } from '../config/supabase';
import { UserData } from '../hooks/useAuth';

export class PaymentService {
  // Créer une session de paiement Stripe
  static async createCheckoutSession(
    userId: string,
    plan: StripePlan,
    userEmail: string
  ): Promise<{ sessionId: string; url: string } | null> {
    try {
      console.log('Création de la session de paiement pour:', { userId, plan, userEmail });

      // Appeler votre fonction Edge Supabase pour créer la session Stripe
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          userId,
          plan,
          userEmail,
          priceId: STRIPE_PLANS[plan].priceId,
          successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/payment/cancel`
        }
      });

      if (error) {
        console.error('Erreur lors de la création de la session:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Erreur PaymentService.createCheckoutSession:', error);
      return null;
    }
  }

  // Rediriger vers Stripe Checkout
  static async redirectToCheckout(sessionId: string): Promise<void> {
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe n\'est pas initialisé');
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) {
      console.error('Erreur lors de la redirection vers Stripe:', error);
      throw error;
    }
  }

  // Vérifier le statut d'un paiement
  static async verifyPayment(sessionId: string): Promise<{
    success: boolean;
    subscription?: any;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, subscription: data };
    } catch (error) {
      console.error('Erreur lors de la vérification du paiement:', error);
      return { success: false, error: 'Erreur lors de la vérification du paiement' };
    }
  }

  // Récupérer l'abonnement actuel de l'utilisateur
  static async getUserSubscription(userId: string) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Erreur lors de la récupération de l\'abonnement:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erreur getUserSubscription:', error);
      return null;
    }
  }

  // Annuler un abonnement
  static async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { subscriptionId }
      });

      if (error) {
        console.error('Erreur lors de l\'annulation:', error);
        return false;
      }

      return data.success;
    } catch (error) {
      console.error('Erreur cancelSubscription:', error);
      return false;
    }
  }

  // Créer un portail client Stripe
  static async createCustomerPortal(customerId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('create-customer-portal', {
        body: { 
          customerId,
          returnUrl: window.location.origin 
        }
      });

      if (error) {
        console.error('Erreur lors de la création du portail:', error);
        return null;
      }

      return data.url;
    } catch (error) {
      console.error('Erreur createCustomerPortal:', error);
      return null;
    }
  }
}