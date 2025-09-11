import React, { useState } from 'react';
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement
} from '@stripe/react-stripe-js';
import { CreditCard, User, Mail, Lock, Loader } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useSubscription } from '../hooks/useSubscription';

interface PaymentFormProps {
  plan: {
    name: string;
    price: number;
    priceId: string;
    currency: string;
  };
  onSuccess: () => void;
  onError: (error: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const PaymentForm = ({ plan, onSuccess, onError, isProcessing, setIsProcessing }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const { upgradeToPremium } = useSubscription();
  
  const [formData, setFormData] = useState({
    email: user?.email || '',
    name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1e293b',
        fontFamily: 'Inter, system-ui, sans-serif',
        '::placeholder': {
          color: '#64748b',
        },
        iconColor: '#f59e0b',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !user) {
      onError('Stripe n\'est pas encore chargé ou utilisateur non connecté');
      return;
    }

    setIsProcessing(true);
    setErrors({});

    const cardElement = elements.getElement(CardNumberElement);
    if (!cardElement) {
      onError('Élément de carte non trouvé');
      setIsProcessing(false);
      return;
    }

    try {
      // Simuler la création d'un PaymentIntent côté serveur
      // En production, vous devriez appeler votre API backend
      const paymentIntentResponse = await simulateCreatePaymentIntent({
        amount: plan.price * 100, // Stripe utilise les centimes
        currency: plan.currency.toLowerCase(),
        customer_email: formData.email,
        customer_name: formData.name,
        plan_id: plan.priceId
      });

      if (!paymentIntentResponse.success) {
        throw new Error(paymentIntentResponse.error || 'Erreur lors de la création du paiement');
      }

      // Confirmer le paiement avec Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        paymentIntentResponse.client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: formData.name,
              email: formData.email,
            },
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message || 'Erreur lors du paiement');
      }

      if (paymentIntent?.status === 'succeeded') {
        // Mettre à jour l'abonnement de l'utilisateur
        const planType = plan.name.toLowerCase() as 'standard' | 'premium';
        await upgradeToPremium(planType);
        
        // Simuler la sauvegarde côté serveur
        await simulateSaveSubscription({
          userId: user.id,
          planId: plan.priceId,
          paymentIntentId: paymentIntent.id,
          status: 'active'
        });

        onSuccess();
      } else {
        throw new Error('Le paiement n\'a pas été confirmé');
      }
    } catch (error) {
      console.error('Erreur de paiement:', error);
      onError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulation d'appel API pour créer un PaymentIntent
  const simulateCreatePaymentIntent = async (data: any) => {
    // En production, remplacez par un vrai appel à votre API
    return new Promise<{ success: boolean; client_secret?: string; error?: string }>((resolve) => {
      setTimeout(() => {
        // Simuler un succès 90% du temps
        if (Math.random() > 0.1) {
          resolve({
            success: true,
            client_secret: `pi_test_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`
          });
        } else {
          resolve({
            success: false,
            error: 'Erreur de simulation côté serveur'
          });
        }
      }, 1000);
    });
  };

  // Simulation de sauvegarde d'abonnement
  const simulateSaveSubscription = async (data: any) => {
    // En production, remplacez par un vrai appel à votre API
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('Abonnement sauvegardé:', data);
        resolve();
      }, 500);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gradient-to-r from-neutral-50 to-amber-50/30 rounded-2xl p-6 border border-neutral-200/50">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-amber-600" />
          Informations de paiement
        </h3>

        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Mail className="h-4 w-4 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
              required
              disabled={isProcessing}
            />
          </div>

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <User className="h-4 w-4 inline mr-1" />
              Nom complet
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
              required
              disabled={isProcessing}
            />
          </div>

          {/* Numéro de carte */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <CreditCard className="h-4 w-4 inline mr-1" />
              Numéro de carte
            </label>
            <div className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 transition-all duration-200">
              <CardNumberElement
                options={cardElementOptions}
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* Expiration et CVC */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date d'expiration
              </label>
              <div className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 transition-all duration-200">
                <CardExpiryElement
                  options={cardElementOptions}
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Lock className="h-4 w-4 inline mr-1" />
                CVC
              </label>
              <div className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 transition-all duration-200">
                <CardCvcElement
                  options={cardElementOptions}
                  disabled={isProcessing}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Résumé de commande */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200/50">
        <h4 className="font-semibold text-slate-900 mb-4">Résumé de la commande</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Plan {plan.name}</span>
            <span className="font-semibold text-slate-900">{plan.price}€</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">TVA (20%)</span>
            <span className="text-slate-600">{(plan.price * 0.2).toFixed(2)}€</span>
          </div>
          <hr className="my-3" />
          <div className="flex justify-between items-center text-lg font-bold">
            <span className="text-slate-900">Total</span>
            <span className="text-amber-600">{(plan.price * 1.2).toFixed(2)}€</span>
          </div>
        </div>
      </div>

      {/* Bouton de paiement */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-900 py-4 rounded-2xl hover:from-amber-600 hover:via-amber-700 hover:to-amber-600 transition-all duration-500 font-bold text-lg shadow-glow-amber hover:shadow-luxury transform hover:scale-105 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        <span className="relative flex items-center justify-center">
          {isProcessing ? (
            <>
              <Loader className="h-5 w-5 mr-2 animate-spin" />
              Traitement en cours...
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5 mr-2" />
              Payer {(plan.price * 1.2).toFixed(2)}€
            </>
          )}
        </span>
      </button>

      {/* Informations légales */}
      <div className="text-center">
        <p className="text-xs text-slate-500">
          En cliquant sur "Payer", vous acceptez nos{' '}
          <a href="#" className="text-amber-600 hover:text-amber-700 underline">
            conditions d'utilisation
          </a>{' '}
          et notre{' '}
          <a href="#" className="text-amber-600 hover:text-amber-700 underline">
            politique de confidentialité
          </a>
          .
        </p>
      </div>
    </form>
  );
};

export default PaymentForm;