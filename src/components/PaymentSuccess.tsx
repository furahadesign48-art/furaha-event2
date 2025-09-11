import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { useStripeSubscription } from '../hooks/useStripeSubscription';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyPayment, subscription } = useStripeSubscription();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      verifyPayment(sessionId);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-100/30 to-emerald-200/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center animate-fade-in">
        <div className="bg-white rounded-3xl shadow-luxury border border-emerald-200/50 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/20 to-emerald-300/20 rounded-full blur-2xl"></div>
          
          <div className="relative">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-glow-emerald animate-bounce">
                  <Check className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="h-6 w-6 text-emerald-500 animate-pulse" />
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent mb-4">
              Paiement Réussi !
            </h2>
            
            <p className="text-slate-600 mb-6 leading-relaxed">
              Félicitations ! Votre abonnement {subscription?.plan === 'standard' ? 'Standard' : 'Premium'} a été activé avec succès.
            </p>
            
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl p-4 border border-emerald-200/50 mb-6">
              <div className="flex items-center justify-center mb-2">
                <Crown className="h-6 w-6 text-emerald-600 mr-2" />
                <h4 className="text-emerald-800 font-semibold">
                  Plan {subscription?.plan === 'standard' ? 'Standard' : 'Premium'} Activé
                </h4>
              </div>
              <p className="text-emerald-700 text-sm">
                Vous pouvez maintenant profiter de toutes les fonctionnalités premium !
              </p>
            </div>
            
            <button
              onClick={() => navigate('/', { replace: true })}
              className="w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 text-white py-3 rounded-xl hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-600 transition-all duration-500 font-semibold shadow-lg transform hover:scale-105 flex items-center justify-center"
            >
              <span className="mr-2">Accéder au Dashboard</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;