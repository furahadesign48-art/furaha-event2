import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface SubscriptionData {
  id: string;
  userId: string;
  plan: 'free' | 'standard' | 'premium';
  status: 'active' | 'inactive' | 'cancelled';
  inviteLimit: number;
  currentInvites: number;
  startDate: string;
  endDate?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class SubscriptionsAPI {
  static async getSubscription(userId: string): Promise<APIResponse<SubscriptionData>> {
    try {
      const subscriptionRef = doc(db, 'subscriptions', userId);
      const subscriptionDoc = await getDoc(subscriptionRef);
      
      if (subscriptionDoc.exists()) {
        const data = subscriptionDoc.data() as Omit<SubscriptionData, 'id'>;
        const subscription: SubscriptionData = {
          id: subscriptionDoc.id,
          ...data
        };
        return { success: true, data: subscription };
      } else {
        // Créer un abonnement gratuit par défaut
        const defaultSubscription: Omit<SubscriptionData, 'id'> = {
          userId: userId,
          plan: 'free',
          status: 'active',
          inviteLimit: 999999,
          currentInvites: 0,
          startDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await setDoc(subscriptionRef, defaultSubscription);
        const subscription: SubscriptionData = {
          id: userId,
          ...defaultSubscription
        };
        return { success: true, data: subscription };
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'abonnement:', error);
      return { 
        success: false, 
        error: 'Erreur lors du chargement de l\'abonnement' 
      };
    }
  }

  static async createSubscription(
    userId: string, 
    plan: 'free' | 'standard' | 'premium'
  ): Promise<APIResponse<void>> {
    try {
      const subscriptionRef = doc(db, 'subscriptions', userId);
      const inviteLimit = plan === 'free' ? 5 : 999999;
      
      const subscriptionData = {
        userId,
        plan,
        status: 'active',
        inviteLimit,
        currentInvites: 0,
        startDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(subscriptionRef, subscriptionData);
      console.log('Abonnement créé:', userId);
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la création de l\'abonnement:', error);
      return { 
        success: false, 
        error: 'Impossible de créer l\'abonnement' 
      };
    }
  }

  static async updateSubscription(
    userId: string, 
    updates: Partial<SubscriptionData>
  ): Promise<APIResponse<void>> {
    try {
      const subscriptionRef = doc(db, 'subscriptions', userId);
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(subscriptionRef, updateData);
      console.log('Abonnement mis à jour:', userId);
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'abonnement:', error);
      return { 
        success: false, 
        error: 'Impossible de mettre à jour l\'abonnement' 
      };
    }
  }

  static async updateInviteCount(userId: string, newCount: number): Promise<APIResponse<void>> {
    try {
      const subscriptionRef = doc(db, 'subscriptions', userId);
      await updateDoc(subscriptionRef, {
        currentInvites: newCount,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du compteur:', error);
      return { 
        success: false, 
        error: 'Erreur lors de la mise à jour du compteur' 
      };
    }
  }

  static subscribeToSubscription(
    userId: string, 
    callback: (subscription: SubscriptionData | null) => void
  ): () => void {
    const subscriptionRef = doc(db, 'subscriptions', userId);
    
    return onSnapshot(subscriptionRef, async (doc) => {
      try {
        if (doc.exists()) {
          const data = doc.data() as Omit<SubscriptionData, 'id'>;
          const subscription: SubscriptionData = {
            id: doc.id,
            ...data
          };
          callback(subscription);
        } else {
          // Créer un abonnement gratuit par défaut
          const defaultSubscription: Omit<SubscriptionData, 'id'> = {
            userId: userId,
            plan: 'free',
            status: 'active',
            inviteLimit: 999999,
            currentInvites: 0,
            startDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          await setDoc(subscriptionRef, defaultSubscription);
          const subscription: SubscriptionData = {
            id: userId,
            ...defaultSubscription
          };
          callback(subscription);
        }
      } catch (err) {
        console.error('Erreur lors du chargement de l\'abonnement:', err);
        callback(null);
      }
    });
  }
}