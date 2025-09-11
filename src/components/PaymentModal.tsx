import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise, PRICING_PLANS } from '../config/stripe';
import { X, Crown, Sparkles, Check, CreditCard, Shield, Lock } from 'lucide-react';
import PaymentForm from './PaymentForm';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: 'standard' | 'premium';
  onSuccess: () => void;
}

const PaymentModal = ({ isOpen, onClose, selectedPlan, onSuccess }: PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  if (!isOpen) return null;

  const plan = PRICING_PLANS[selectedPlan];

  const handlePaymentSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-luxury max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-purple-200/20 rounded-full blur-2xl"></div>
        
        {/* Header */}
        <div className="relative p-6 border-b border-neutral-200/50 bg-gradient-to-r from-neutral-50 to-amber-50/30">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="relative mr-3">
                <div className={`p-3 rounded-full shadow-glow-amber ${
                  selectedPlan === 'premium' 
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600' 
                    : 'bg-gradient-to-r from-amber-500 to-amber-600'
                }`}>
                  {selectedPlan === 'premium' ? (
                    <Sparkles className="h-6 w-6 text-white" />
                  ) : (
                    <Crown className="h-6 w-6 text-white" />
                  )}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Paiement Sécurisé
                </h2>
                <p className="text-slate-600 text-sm">
                  Plan {plan.name} - {plan.price}€/{plan.interval === 'month' ? 'mois' : 'an'}
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

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Plan Details */}
            <div>
              <div className="bg-gradient-to-br from-neutral-50 to-amber-50/30 rounded-2xl p-6 border border-neutral-200/50 mb-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Plan {plan.name}</h3>
                  <div className="flex items-baseline justify-center mb-4">
                    <span className={`text-3xl font-bold ${
                      selectedPlan === 'premium' ? 'text-purple-600' : 'text-amber-600'
                    }`}>
                      {plan.price}€
                    </span>
                    <span className="text-slate-500 ml-1">/{plan.interval === 'month' ? 'mois' : 'an'}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900 mb-3">Fonctionnalités incluses :</h4>
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <div className="relative mr-3 flex-shrink-0">
                        <Check className={`h-4 w-4 ${
                          selectedPlan === 'premium' ? 'text-purple-500' : 'text-amber-500'
                        } drop-shadow-sm`} />
                      </div>
                      <span className="text-slate-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl p-4 border border-emerald-200/50">
                <div className="flex items-center mb-2">
                  <Shield className="h-5 w-5 text-emerald-600 mr-2" />
                  <h4 className="text-emerald-800 font-semibold text-sm">Paiement 100% Sécurisé</h4>
                </div>
                <ul className="text-emerald-700 text-xs space-y-1">
                  <li className="flex items-center">
                    <Lock className="h-3 w-3 mr-2" />
                    Chiffrement SSL 256-bit
                  </li>
                  <li className="flex items-center">
                    <CreditCard className="h-3 w-3 mr-2" />
                    Traité par Stripe (leader mondial)
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3 w-3 mr-2" />
                    Aucune donnée stockée sur nos serveurs
                  </li>
                </ul>
              </div>
            </div>

            {/* Payment Form */}
            <div>
              <Elements stripe={stripePromise}>
                <PaymentForm
                  plan={plan}
                  onSuccess={handlePaymentSuccess}
                  onError={(error) => {
                    console.error('Erreur de paiement:', error);
                    alert('Erreur lors du paiement: ' + error);
                  }}
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                />
              </Elements>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-200/50 bg-gradient-to-r from-neutral-50 to-amber-50/30">
          <div className="text-center">
            <p className="text-slate-500 text-xs mb-2">
              En procédant au paiement, vous acceptez nos conditions d'utilisation.
            </p>
            <p className="text-slate-500 text-xs">
              Annulation possible à tout moment. Aucun engagement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;