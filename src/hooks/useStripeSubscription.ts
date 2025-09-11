import { useState, useEffect } from 'react';
import { PaymentService } from '../services/paymentService';
import { supabase, SupabaseSubscription } from '../config/supabase';
import { useAuth } from './useAuth';

export const useStripeSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SupabaseSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger l'abonnement de l'utilisateur
  useEffect(() => {
    if (!user?.id) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    const loadSubscription = async () => {
      try {
        setIsLoading(true);
        const subscriptionData = await PaymentService.getUserSubscription(user.id);
        setSubscription(subscriptionData);
      } catch (err) {
        console.error('Erreur lors du chargement de l\'abonnement:', err);
        setError('Erreur lors du chargement de l\'abonnement');
      } finally {
        setIsLoading(false);
      }
    };

    loadSubscription();

    // Écouter les changements en temps réel
    const subscription_listener = supabase
      .channel('subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Changement d\'abonnement détecté:', payload);
          if (payload.eventType === 'DELETE') {
            setSubscription(null);
          } else {
            setSubscription(payload.new as SupabaseSubscription);
          }
        }
      )
      .subscribe();

    return () => {
      subscription_listener.unsubscribe();
    };
  }, [user?.id]);

  // Créer une session de paiement
  const createCheckoutSession = async (plan: 'standard' | 'premium') => {
    if (!user) {
      setError('Vous devez être connecté pour effectuer un paiement');
      return null;
    }

    try {
      setError(null);
      const session = await PaymentService.createCheckoutSession(
        user.id,
        plan,
        user.email
      );

      if (!session) {
        setError('Erreur lors de la création de la session de paiement');
        return null;
      }

      return session;
    } catch (err) {
      console.error('Erreur lors de la création de la session:', err);
      setError('Erreur lors de la création de la session de paiement');
      return null;
    }
  };

  // Rediriger vers Stripe Checkout
  const redirectToCheckout = async (sessionId: string) => {
    try {
      await PaymentService.redirectToCheckout(sessionId);
    } catch (err) {
      console.error('Erreur lors de la redirection:', err);
      setError('Erreur lors de la redirection vers le paiement');
    }
  };

  // Vérifier un paiement
  const verifyPayment = async (sessionId: string) => {
    try {
      setError(null);
      const result = await PaymentService.verifyPayment(sessionId);
      
      if (result.success && result.subscription) {
        setSubscription(result.subscription);
      }
      
      return result;
    } catch (err) {
      console.error('Erreur lors de la vérification:', err);
      setError('Erreur lors de la vérification du paiement');
      return { success: false, error: 'Erreur lors de la vérification du paiement' };
    }
  };

  // Annuler un abonnement
  const cancelSubscription = async () => {
    if (!subscription?.stripe_subscription_id) {
      setError('Aucun abonnement à annuler');
      return false;
    }

    try {
      setError(null);
      const success = await PaymentService.cancelSubscription(subscription.stripe_subscription_id);
      
      if (success) {
        // L'abonnement sera mis à jour via le webhook
        return true;
      } else {
        setError('Erreur lors de l\'annulation de l\'abonnement');
        return false;
      }
    } catch (err) {
      console.error('Erreur lors de l\'annulation:', err);
      setError('Erreur lors de l\'annulation de l\'abonnement');
      return false;
    }
  };

  // Ouvrir le portail client Stripe
  const openCustomerPortal = async () => {
    if (!subscription?.stripe_customer_id) {
      setError('Aucun abonnement trouvé');
      return;
    }

    try {
      setError(null);
      const portalUrl = await PaymentService.createCustomerPortal(subscription.stripe_customer_id);
      
      if (portalUrl) {
        window.open(portalUrl, '_blank');
      } else {
        setError('Erreur lors de l\'ouverture du portail client');
      }
    } catch (err) {
      console.error('Erreur lors de l\'ouverture du portail:', err);
      setError('Erreur lors de l\'ouverture du portail client');
    }
  };

  // Vérifier si l'utilisateur peut créer des invitations
  const canCreateInvite = () => {
    if (!subscription) return true; // Plan gratuit par défaut
    
    if (subscription.status !== 'active') return false;
    
    // Les plans payants ont des invitations illimitées
    return subscription.plan === 'standard' || subscription.plan === 'premium';
  };

  // Obtenir le nombre d'invitations restantes
  const getRemainingInvites = () => {
    if (!subscription || subscription.plan === 'standard' || subscription.plan === 'premium') {
      return 999999; // Illimité pour les plans payants
    }
    
    return 5; // Plan gratuit
  };

  return {
    subscription,
    isLoading,
    error,
    createCheckoutSession,
    redirectToCheckout,
    verifyPayment,
    cancelSubscription,
    openCustomerPortal,
    canCreateInvite,
    getRemainingInvites,
    clearError: () => setError(null),
  };
};