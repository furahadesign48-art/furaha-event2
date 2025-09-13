const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export class StripeService {
  static async createCheckoutSession(plan: 'standard' | 'premium', userId: string): Promise<CheckoutSessionResponse> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          plan,
          userId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création de la session de paiement');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur StripeService:', error);
      throw error;
    }
  }

  static async redirectToCheckout(sessionId: string): Promise<void> {
    // Redirection directe vers l'URL de checkout
    const checkoutUrl = `https://checkout.stripe.com/pay/${sessionId}`;
    window.location.href = checkoutUrl;
  }
}