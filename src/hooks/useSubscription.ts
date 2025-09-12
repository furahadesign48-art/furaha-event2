import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface SubscriptionData {
  id: string;
  userId: string;
  plan: 'free' | 'standard' | 'premium';
  status: 'active' | 'inactive' | 'cancelled';
  inviteLimit: number;
  currentInvites: number;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Hook de gestion d'abonnement simplifié (sans Firebase)
export const useSubscription = () => {
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

    // Créer un abonnement gratuit par défaut
    const defaultSubscription: SubscriptionData = {
      id: user.id,
      userId: user.id,
      plan: 'free',
      status: 'active',
      inviteLimit: 5,
      currentInvites: 0,
      startDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setSubscription(defaultSubscription);
    setIsLoading(false);
  }, [user?.id]);

  const updateInviteCount = async (newCount: number) => {
    if (!user?.id || !subscription) return false;

    try {
      setSubscription(prev => prev ? {
        ...prev,
        currentInvites: newCount,
        updatedAt: new Date().toISOString()
      } : null);
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du compteur:', error);
      return false;
    }
  };

  const canCreateInvite = () => {
    if (!subscription) return false;
    if (subscription.plan === 'free') {
      return subscription.currentInvites < 5;
    }
    return true; // Plans payants = illimité
  };

  const getRemainingInvites = () => {
    if (!subscription) return 0;
    if (subscription.plan === 'free') {
      return Math.max(0, 5 - subscription.currentInvites);
    }
    return 999999; // Plans payants = illimité
  };

  const upgradeToPremium = async (plan: 'standard' | 'premium') => {
    if (!user?.id) return false;

    try {
      const newLimit = 999999; // Illimité pour les plans payants
      
      setSubscription(prev => prev ? {
        ...prev,
        plan,
        inviteLimit: newLimit,
        status: 'active',
        updatedAt: new Date().toISOString()
      } : null);
      
      return true;
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