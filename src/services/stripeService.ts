const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export class StripeService {
  static async createCheckoutSession(plan: 'standard' | 'premium', userId: string): Promise<CheckoutSessionResponse> {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('Variables d\'environnement Supabase:', {
        SUPABASE_URL,
        SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ? 'Définie' : 'Manquante'
      });
      throw new Error('Configuration Supabase manquante. Vérifiez vos variables d\'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.');
    }

    try {
      console.log('Création de session Stripe pour:', { plan, userId });
      console.log('URL de la fonction Edge:', `${SUPABASE_URL}/functions/v1/create-checkout-session`);
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          plan,
          userId
        }),
      });

      console.log('Réponse de la fonction Edge:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur de la fonction Edge:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la création de la session de paiement');
      }

      const data = await response.json();
      console.log('Session créée avec succès:', data);
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