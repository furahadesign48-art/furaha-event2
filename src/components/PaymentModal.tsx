import React, { useState } from 'react';
import { X, Crown, Gem, Check, CreditCard, Shield, Zap, Sparkles } from 'lucide-react';
import { StripeService, pricingPlans } from '../services/stripeService';
import { useAuth } from './AuthContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan?: 'standard' | 'premium';
}

const PaymentModal = ({ isOpen, onClose, selectedPlan }: PaymentModalProps) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(selectedPlan || 'standard');

  if (!isOpen) return null;

  const plan = pricingPlans.find(p => p.id === currentPlan);
  if (!plan) return null;

  const handlePayment = async () => {
    if (!user) {
      alert('Vous devez être connecté pour effectuer un paiement');
      return;
    }

    setIsProcessing(true);
    try {
      await StripeService.handlePayment(currentPlan, user.id, user.email);
    } catch (error) {
      console.error('Erreur de paiement:', error);
      alert('Erreur lors du paiement. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-luxury max-w-lg w-full animate-slide-up relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-purple-200/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-rose-200/20 to-amber-200/20 rounded-full blur-2xl"></div>
        
        {/* Header */}
        <div className="relative p-6 border-b border-neutral-200/50 bg-gradient-to-r from-neutral-50 to-amber-50/30">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="relative mr-3">
                {currentPlan === 'premium' ? (
                  <Gem className="h-8 w-8 text-purple-600 animate-glow drop-shadow-lg" />
                ) : (
                  <Crown className="h-8 w-8 text-amber-500 animate-glow drop-shadow-lg" />
                )}
                <div className="absolute inset-0 animate-pulse">
                  {currentPlan === 'premium' ? (
                    <Gem className="h-8 w-8 text-purple-300 opacity-30" />
                  ) : (
                    <Crown className="h-8 w-8 text-amber-300 opacity-30" />
                  )}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Passer au plan {plan.name}
                </h2>
                <p className="text-slate-600 text-sm">
                  Débloquez toutes les fonctionnalités premium
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
            >
              <X className="h-5 w-5 text-neutral-500" />
            </button>
          </div>
        </div>

        {/* Plan Selection */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {pricingPlans.map((planOption) => (
              <button
                key={planOption.id}
                onClick={() => setCurrentPlan(planOption.id as 'standard' | 'premium')}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                  currentPlan === planOption.id
                    ? planOption.id === 'premium'
                      ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-purple-100 shadow-glow-purple'
                      : 'border-amber-400 bg-gradient-to-br from-amber-50 to-amber-100 shadow-glow-amber'
                    : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50'
                }`}
              >
                <div className="flex items-center justify-center mb-3">
                  {planOption.id === 'premium' ? (
                    <Gem className={`h-8 w-8 ${currentPlan === planOption.id ? 'text-purple-600' : 'text-neutral-400'}`} />
                  ) : (
                    <Crown className={`h-8 w-8 ${currentPlan === planOption.id ? 'text-amber-600' : 'text-neutral-400'}`} />
                  )}
                </div>
                <h3 className={`font-bold text-lg mb-2 ${
                  currentPlan === planOption.id 
                    ? planOption.id === 'premium' ? 'text-purple-900' : 'text-amber-900'
                    : 'text-neutral-700'
                }`}>
                  {planOption.name}
                </h3>
                <div className="text-2xl font-bold mb-1">
                  ${planOption.price}
                </div>
                <div className="text-sm text-neutral-600">par mois</div>
              </button>
            ))}
          </div>

          {/* Selected Plan Details */}
          <div className={`rounded-2xl p-6 mb-6 ${
            currentPlan === 'premium'
              ? 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200/50'
              : 'bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200/50'
          }`}>
            <div className="flex items-center mb-4">
              {currentPlan === 'premium' ? (
                <Gem className="h-6 w-6 text-purple-600 mr-3" />
              ) : (
                <Crown className="h-6 w-6 text-amber-600 mr-3" />
              )}
              <h3 className={`text-xl font-bold ${
                currentPlan === 'premium' ? 'text-purple-900' : 'text-amber-900'
              }`}>
                Plan {plan.name}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 gap-2 mb-4">
              {plan.features.slice(0, 4).map((feature, index) => (
                <div key={index} className="flex items-center">
                  <Check className={`h-4 w-4 mr-3 ${
                    currentPlan === 'premium' ? 'text-purple-600' : 'text-amber-600'
                  }`} />
                  <span className={`text-sm ${
                    currentPlan === 'premium' ? 'text-purple-800' : 'text-amber-800'
                  }`}>
                    {feature}
                  </span>
                </div>
              ))}
              {plan.features.length > 4 && (
                <div className="flex items-center">
                  <Sparkles className={`h-4 w-4 mr-3 ${
                    currentPlan === 'premium' ? 'text-purple-600' : 'text-amber-600'
                  }`} />
                  <span className={`text-sm ${
                    currentPlan === 'premium' ? 'text-purple-800' : 'text-amber-800'
                  }`}>
                    +{plan.features.length - 4} autres fonctionnalités
                  </span>
                </div>
              )}
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold mb-1">
                ${plan.price}
              </div>
              <div className={`text-sm ${
                currentPlan === 'premium' ? 'text-purple-700' : 'text-amber-700'
              }`}>
                par mois, facturé mensuellement
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl p-4 mb-6 border border-emerald-200/50">
            <div className="flex items-center mb-2">
              <Shield className="h-5 w-5 text-emerald-600 mr-2" />
              <h4 className="font-semibold text-emerald-800">Paiement sécurisé</h4>
            </div>
            <p className="text-emerald-700 text-sm">
              Vos informations de paiement sont protégées par le chiffrement SSL et traitées de manière sécurisée par Stripe.
            </p>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing || !user}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-500 shadow-lg hover:shadow-luxury transform hover:scale-105 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
              currentPlan === 'premium'
                ? 'bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600 text-white hover:from-purple-700 hover:via-purple-800 hover:to-purple-700 shadow-glow-purple'
                : 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-900 hover:from-amber-600 hover:via-amber-700 hover:to-amber-600 shadow-glow-amber'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="relative flex items-center justify-center">
              {isProcessing ? (
                <>
                  <div className={`w-6 h-6 border-2 rounded-full animate-spin mr-3 ${
                    currentPlan === 'premium' 
                      ? 'border-white/30 border-t-white' 
                      : 'border-slate-900/30 border-t-slate-900'
                  }`}></div>
                  Redirection vers Stripe...
                </>
              ) : (
                <>
                  <CreditCard className="h-6 w-6 mr-3" />
                  Payer ${plan.price}/mois avec Stripe
                </>
              )}
            </span>
          </button>

          {/* Terms */}
          <p className="text-center text-xs text-neutral-500 mt-4">
            En continuant, vous acceptez nos{' '}
            <a href="#" className="text-amber-600 hover:text-amber-700 underline">
              conditions d'utilisation
            </a>{' '}
            et notre{' '}
            <a href="#" className="text-amber-600 hover:text-amber-700 underline">
              politique de confidentialité
            </a>
            . Vous pouvez annuler votre abonnement à tout moment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;