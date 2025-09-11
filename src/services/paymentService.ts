import { auth } from '../config/firebase';

const FIREBASE_FUNCTIONS_URL = 'https://us-central1-furaha-event-831ca.cloudfunctions.net';

export interface PaymentIntentRequest {
  planId: 'standard' | 'premium';
  customerInfo: {
    email: string;
    name: string;
  };
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  customerId: string;
  plan: {
    id: string;
    name: string;
    amount: number;
    currency: string;
  };
}

export interface Transaction {
  id: string;
  userId: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: 'completed' | 'failed' | 'pending';
  planId: string;
  createdAt: any;
}

class PaymentService {
  private async getAuthToken(): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return await user.getIdToken();
  }

  async createPaymentIntent(request: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${FIREBASE_FUNCTIONS_URL}/createPaymentIntent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async getPaymentHistory(): Promise<Transaction[]> {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${FIREBASE_FUNCTIONS_URL}/getPaymentHistory`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch payment history');
      }

      const data = await response.json();
      return data.transactions;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }

  async cancelSubscription(): Promise<void> {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${FIREBASE_FUNCTIONS_URL}/cancelSubscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();