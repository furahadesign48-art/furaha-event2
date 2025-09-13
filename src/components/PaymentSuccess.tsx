import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Crown, Gem, ArrowRight, Sparkles } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { upgradeToPremium } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(true);
  const [plan, setPlan] = useState<'standard' | 'premium'>('standard');

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const processPayment = async () => {
      if (!sessionId) {
        navigate('/');
        return;
      }

      try {
        // Dans un vrai projet, vous feriez un appel à votre backend pour vérifier la session
        // et récupérer les détails du paiement
        const response = await fetch(`/api/verify-payment?session_id=${sessionId}`);
        const paymentData = await response.json();

        if (paymentData.success) {
          // Mettre à jour l'abonnement de l'utilisateur
          await upgradeToPremium(paymentData.plan);
          setPlan(paymentData.plan);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du paiement:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [sessionId, navigate, upgradeToPremium]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-neutral-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="text-center animate-fade-in">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-emerald-600 opacity-30" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Vérification du paiement...
          </h2>
          <p className="text-slate-600">
            Nous vérifions votre paiement, veuillez patienter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-neutral-50 to-emerald-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-r from-emerald-200/20 to-amber-200/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-r from-amber-200/20 to-emerald-200/20 rounded-full blur-3xl animate-bounce-slow"></div>
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-gradient-to-r from-emerald-300/20 to-emerald-200/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-2xl w-full text-center animate-slide-up">
          <div className="bg-white rounded-3xl shadow-luxury border border-neutral-200/50 p-8 md:p-12 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/10 to-amber-200/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-200/10 to-amber-200/10 rounded-full blur-2xl"></div>
            
            <div className="relative">
              {/* Success Icon */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-glow-amber animate-glow">
                    <CheckCircle className="h-12 w-12 text-white drop-shadow-lg" />
                  </div>
                  <div className="absolute inset-0 animate-ping">
                    <div className="w-24 h-24 bg-emerald-400 rounded-full opacity-20"></div>
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="h-8 w-8 text-amber-500 animate-pulse" />
                  </div>
                  <div className="absolute -bottom-2 -left-2">
                    {plan === 'premium' ? (
                      <Gem className="h-6 w-6 text-purple-500 animate-bounce" />
                    ) : (
                      <Crown className="h-6 w-6 text-amber-500 animate-bounce" />
                    )}
                  </div>
                </div>
              </div>

              {/* Success Message */}
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 bg-clip-text text-transparent">
                  Paiement réussi !
                </span>
              </h1>

              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Félicitations ! Votre abonnement au plan{' '}
                <span className={`font-bold ${
                  plan === 'premium' ? 'text-purple-600' : 'text-amber-600'
                }`}>
                  {plan === 'premium' ? 'Premium' : 'Standard'}
                </span>{' '}
                a été activé avec succès.
              </p>

              {/* Plan Benefits */}
              <div className={`rounded-2xl p-6 mb-8 ${
                plan === 'premium'
                  ? 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200/50'
                  : 'bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200/50'
              }`}>
                <div className="flex items-center justify-center mb-4">
                  {plan === 'premium' ? (
                    <Gem className="h-8 w-8 text-purple-600 mr-3" />
                  ) : (
                    <Crown className="h-8 w-8 text-amber-600 mr-3" />
                  )}
                  <h2 className={`text-2xl font-bold ${
                    plan === 'premium' ? 'text-purple-900' : 'text-amber-900'
                  }`}>
                    Vous avez maintenant accès à :
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plan === 'premium' ? (
                    <>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-purple-600 mr-3" />
                        <span className="text-purple-800">Invitations illimitées</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-purple-600 mr-3" />
                        <span className="text-purple-800">Design sur mesure</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-purple-600 mr-3" />
                        <span className="text-purple-800">Support prioritaire</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-purple-600 mr-3" />
                        <span className="text-purple-800">Statistiques avancées</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-amber-600 mr-3" />
                        <span className="text-amber-800">200 invitations/mois</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-amber-600 mr-3" />
                        <span className="text-amber-800">Modèles premium</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-amber-600 mr-3" />
                        <span className="text-amber-800">Personnalisation avancée</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-amber-600 mr-3" />
                        <span className="text-amber-800">Support prioritaire</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/dashboard')}
                  className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 shadow-lg hover:shadow-luxury transform hover:scale-105 relative overflow-hidden group ${
                    plan === 'premium'
                      ? 'bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600 text-white hover:from-purple-700 hover:via-purple-800 hover:to-purple-700 shadow-glow-purple'
                      : 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-900 hover:from-amber-600 hover:via-amber-700 hover:to-amber-600 shadow-glow-amber'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative flex items-center justify-center">
                    Accéder au Dashboard
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="px-8 py-4 border-2 border-neutral-300 text-neutral-700 rounded-2xl hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-300 font-semibold"
                >
                  Retour à l'accueil
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-8 p-4 bg-gradient-to-r from-neutral-50 to-amber-50/30 rounded-2xl border border-neutral-200/50">
                <p className="text-sm text-slate-600">
                  Un email de confirmation a été envoyé à votre adresse. 
                  Vous pouvez gérer votre abonnement depuis votre dashboard à tout moment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;