import { useState, useEffect } from 'react';
import { SubscriptionsAPI, SubscriptionData } from '../api/subscriptions';
import { useAuth } from '../components/AuthContext';

export const useSubscriptionAPI = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    // Utiliser la méthode de souscription en temps réel
    const unsubscribe = SubscriptionsAPI.subscribeToSubscription(user.id, (subscriptionData) => {
      setSubscription(subscriptionData);
      setIsLoading(false);
      if (!subscriptionData) {
        setError('Erreur lors du chargement de l\'abonnement');
      } else {
        setError(null);
      }
    });

    return () => unsubscribe();
  }, [user?.id]);

  const updateInviteCount = async (newCount: number) => {
    if (!user?.id || !subscription) return false;

    try {
      const result = await SubscriptionsAPI.updateInviteCount(user.id, newCount);
      return result.success;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du compteur:', error);
      return false;
    }
  };

  const canCreateInvite = () => {
    if (!subscription) return false;
    return true; // Tous les plans = illimité
  };

  const getRemainingInvites = () => {
    if (!subscription) return 0;
    return 999999; // Plans payants = illimité
  };

  const upgradeToPremium = async (plan: 'standard' | 'premium') => {
    if (!user?.id) return false;

    try {
      const newLimit = plan === 'standard' ? 999999 : 999999; // Illimité pour les plans payants
      
      const result = await SubscriptionsAPI.updateSubscription(user.id, {
        plan,
        inviteLimit: newLimit,
        status: 'active'
      });
      
      return result.success;
    } catch (error) {
      console.error('Erreur lors de la mise à niveau:', error);
      return false;
    }
  };

  return {
    subscription,
    isLoading,
    error,
    updateInviteCount,
    canCreateInvite,
    getRemainingInvites,
    upgradeToPremium,
    clearError: () => setError(null)
  };
};