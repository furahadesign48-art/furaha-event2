import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Lock, Shield, Check, X, Loader } from 'lucide-react';
import { useAuth } from './AuthContext';
import { STRIPE_PLANS, StripePlan } from '../config/stripe';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface CheckoutFormProps {
  planType: StripePlan;
  onSuccess: () => void;
  onCancel: () => void;
}

const CheckoutForm = ({ planType, onSuccess, onCancel }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = STRIPE_PLANS[planType];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !user) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Créer la session de checkout
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Configuration Supabase manquante');
      }
      
      const response = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          planType,
          userId: user.id,
          userEmail: user.email,
          successUrl: `${window.location.origin}/?payment=success`,
          cancelUrl: `${window.location.origin}/?payment=cancel`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Erreur Stripe:', errorData);
        throw new Error(`Erreur lors de la création de la session de paiement: ${errorData}`);
      }

      const { sessionId } = await response.json();

      // Rediriger vers Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      console.error('Erreur de paiement:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-luxury border border-neutral-200/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-6 border-b border-amber-200/50">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-amber-500 rounded-full shadow-glow-amber">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Abonnement {plan.name}
          </h2>
          <div className="flex items-baseline justify-center">
            <span className="text-3xl font-bold text-amber-600">
              {(plan.price / 100).toFixed(2)}€
            </span>
            <span className="text-slate-600 ml-1">/mois</span>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="p-6 border-b border-neutral-200/50">
        <h3 className="font-semibold text-slate-900 mb-4">Inclus dans ce plan :</h3>
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-4 w-4 text-emerald-500 mr-3 flex-shrink-0" />
              <span className="text-slate-700 text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl">
            <div className="flex items-center">
              <X className="h-5 w-5 text-rose-500 mr-2" />
              <p className="text-rose-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Informations de paiement
          </label>
          <div className="p-4 border border-neutral-300 rounded-xl focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 transition-all duration-200">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#374151',
                    '::placeholder': {
                      color: '#9CA3AF',
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Security Info */}
        <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200/50">
          <div className="flex items-center mb-2">
            <Shield className="h-4 w-4 text-emerald-600 mr-2" />
            <span className="text-emerald-800 font-semibold text-sm">Paiement sécurisé</span>
          </div>
          <p className="text-emerald-700 text-xs">
            Vos informations de paiement sont protégées par le chiffrement SSL 256-bit.
            Nous ne stockons jamais vos données de carte bancaire.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            type="submit"
            disabled={!stripe || isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-4 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-bold text-lg shadow-glow-amber hover:shadow-luxury transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="relative flex items-center justify-center">
              {isLoading ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  Traitement en cours...
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5 mr-2" />
                  Confirmer l'abonnement - {(plan.price / 100).toFixed(2)}€
                </>
              )}
            </span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-transparent border-2 border-neutral-300 text-neutral-700 py-3 rounded-xl hover:bg-neutral-50 transition-all duration-300 font-semibold"
          >
            Annuler
          </button>
        </div>

        {/* Terms */}
        <p className="text-xs text-slate-500 text-center mt-4">
          En confirmant votre abonnement, vous acceptez nos{' '}
          <a href="#" className="text-amber-600 hover:text-amber-700 underline">
            conditions d'utilisation
          </a>{' '}
          et notre{' '}
          <a href="#" className="text-amber-600 hover:text-amber-700 underline">
            politique de confidentialité
          </a>
          .
        </p>
      </form>
    </div>
  );
};

interface StripeCheckoutProps {
  planType: StripePlan;
  onSuccess: () => void;
  onCancel: () => void;
}

const StripeCheckout = ({ planType, onSuccess, onCancel }: StripeCheckoutProps) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        planType={planType}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
};

export default StripeCheckout;