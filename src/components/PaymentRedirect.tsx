import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Crown, Sparkles, Check, ArrowLeft, CreditCard, Shield, Zap, Star, X } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

const PaymentRedirect = () => {
  const { plan } = useParams<{ plan: 'standard' | 'premium' }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { subscription, upgradeToPremium } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'error' | null>(null);
  
  // Stripe client secret + erreur/loading
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !plan) return;

    let mounted = true;
    setStripeLoading(true);

    const createIntent = async () => {
      try {
        const token = await user.getIdToken();

        // URL de la Firebase Function (configurable via .env)
        const endpoint = import.meta.env.VITE_CREATE_PAYMENT_INTENT_URL || '/createPaymentIntent';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ plan }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur création PaymentIntent');

        if (mounted) setClientSecret(data.clientSecret);
      } catch (err: any) {
        console.error('createPaymentIntent error', err);
        if (mounted) setStripeError(err.message || 'Erreur Stripe');
      } finally {
        if (mounted) setStripeLoading(false);
      }
    };

    createIntent();
    return () => { mounted = false; };
  }, [user, plan]);

  // StripePaymentForm component definition
  const StripePaymentForm = ({ plan, onSuccess }: { plan: 'standard' | 'premium'; onSuccess?: () => void }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { upgradeToPremium } = useSubscription();
    const [isProcessingLocal, setIsProcessingLocal] = useState(false);
    const [errorLocal, setErrorLocal] = useState<string | null>(null);

    const handleConfirm = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements) return;

      setIsProcessingLocal(true);
      setErrorLocal(null);

      try {
        // On confirme en "if_required" pour éviter redirections forcées
        const result = await stripe.confirmPayment({
          elements,
          confirmParams: {
            // si Stripe doit rediriger pour 3DS, il redirigera vers cette URL
            return_url: window.location.origin + '/payment-result',
          },
          redirect: 'if_required',
        });

        if (result.error) {
          setErrorLocal(result.error.message || 'Erreur de paiement');
          return;
        }

        const paymentIntent = result.paymentIntent;
        if (paymentIntent && paymentIntent.status === 'succeeded') {
          // Mise à jour de l'abonnement côté client (double-check côté webhook)
          await upgradeToPremium(plan);
          onSuccess && onSuccess();
        } else {
          // Si nécessite action, Stripe gère la redirection; sinon handle l'état
          setErrorLocal(`Statut du paiement: ${paymentIntent?.status || 'inconnu'}`);
        }
      } catch (err: any) {
        console.error(err);
        setErrorLocal(err.message || 'Erreur lors du paiement');
      } finally {
        setIsProcessingLocal(false);
      }
    };

    return (
      <form onSubmit={handleConfirm}>
        <div className="mb-4">
          <PaymentElement />
        </div>

        {errorLocal && <p className="text-red-500 mb-3">{errorLocal}</p>}

        <button
          type="submit"
          disabled={!stripe || isProcessingLocal}
          className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-white py-4 rounded-2xl transition-all duration-500 font-bold text-lg disabled:opacity-50"
        >
          {isProcessingLocal ? 'Traitement...' : `Confirmer le Paiement - ${plan === 'premium' ? '200€' : '100€'}`}
        </button>
      </form>
    );
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const planDetails = {
    standard: {
      name: 'Standard',
      price: '100$',
      period: '/mois',
      color: 'amber',
      icon: Crown,
      features: [
        '200 invitations maximum',
        '1 mois de validité',
        'Tous les modèles premium',
        'Personnalisation avancée',
        'Statistiques détaillées',
        'Support prioritaire'
      ]
    },
    premium: {
      name: 'Premium',
      price: '200$',
      period: '/mois',
      color: 'purple',
      icon: Sparkles,
      features: [
        'Invitations illimitées',
        '1 mois de validité',
        'Tous les modèles premium',
        'Personnalisation avancée',
        'Statistiques détaillées',
        'Support prioritaire',
        'Design sur mesure',
        'API d\'intégration'
      ]
    }
  };

  const currentPlan = plan && planDetails[plan] ? planDetails[plan] : planDetails.standard;
  const IconComponent = currentPlan.icon;

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-100/30 to-emerald-200/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="bg-white rounded-3xl shadow-luxury border border-emerald-200/50 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/20 to-emerald-300/20 rounded-full blur-2xl"></div>
            
            <div className="relative">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-glow-amber animate-bounce">
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
                Félicitations ! Votre abonnement <span className="font-semibold text-emerald-600">{currentPlan.name}</span> a été activé avec succès.
              </p>
              
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl p-4 border border-emerald-200/50 mb-6">
                <div className="flex items-center justify-center mb-2">
                  <IconComponent className="h-6 w-6 text-emerald-600 mr-2" />
                  <h4 className="text-emerald-800 font-semibold">Plan {currentPlan.name} Activé</h4>
                </div>
                <p className="text-emerald-700 text-sm">
                  Vous allez être redirigé vers votre dashboard dans quelques secondes...
                </p>
              </div>
              
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              
              <button
                onClick={() => navigate('/', { replace: true })}
                className="w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 text-white py-3 rounded-xl hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-600 transition-all duration-500 font-semibold shadow-lg transform hover:scale-105"
              >
                Accéder au Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-rose-100/30 to-rose-200/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="bg-white rounded-3xl shadow-luxury border border-rose-200/50 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-200/20 to-rose-300/20 rounded-full blur-2xl"></div>
            
            <div className="relative">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-r from-rose-500 to-rose-600 rounded-full shadow-lg">
                  <X className="h-12 w-12 text-white" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-rose-700 bg-clip-text text-transparent mb-4">
                Paiement Échoué
              </h2>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                Une erreur est survenue lors du traitement de votre paiement. Veuillez réessayer ou contacter notre support.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => setPaymentStatus(null)}
                  className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-900 py-3 rounded-xl hover:from-amber-600 hover:via-amber-700 hover:to-amber-600 transition-all duration-500 font-semibold shadow-glow-amber transform hover:scale-105"
                >
                  Réessayer le Paiement
                </button>
                
                <button
                  onClick={() => navigate('/', { replace: true })}
                  className="w-full bg-transparent border-2 border-slate-300 text-slate-700 py-3 rounded-xl hover:bg-slate-50 transition-all duration-300 font-semibold"
                >
                  <ArrowLeft className="h-4 w-4 inline mr-2" />
                  Retour à l'Accueil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-amber-50/30 to-purple-50/20 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-r from-amber-200/20 to-purple-200/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-r from-rose-200/20 to-amber-200/20 rounded-full blur-3xl animate-bounce-slow"></div>
      </div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8 animate-fade-in">
            <button
              onClick={() => navigate('/', { replace: true })}
              className="inline-flex items-center text-amber-600 hover:text-amber-700 transition-all duration-300 group mb-6"
            >
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Retour à l'accueil
            </button>
            
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className={`p-4 bg-gradient-to-r ${
                  currentPlan.color === 'amber' 
                    ? 'from-amber-500 to-amber-600' 
                    : 'from-purple-500 to-purple-600'
                } rounded-full shadow-glow-amber animate-glow`}>
                  <IconComponent className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className={`h-6 w-6 ${
                    currentPlan.color === 'amber' ? 'text-amber-500' : 'text-purple-500'
                  } animate-pulse`} />
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className={`bg-gradient-to-r ${
                currentPlan.color === 'amber' 
                  ? 'from-amber-600 to-amber-700' 
                  : 'from-purple-600 to-purple-700'
              } bg-clip-text text-transparent`}>
                Finaliser votre Abonnement
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Vous êtes sur le point de souscrire au plan <span className="font-semibold">{currentPlan.name}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Plan Details */}
            <div className="bg-white rounded-3xl shadow-luxury border border-neutral-200/50 p-8 animate-slide-up">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                  Plan {currentPlan.name}
                </h2>
                <div className="flex items-baseline justify-center mb-4">
                  <span className={`text-4xl font-bold bg-gradient-to-r ${
                    currentPlan.color === 'amber' 
                      ? 'from-amber-600 to-amber-700' 
                      : 'from-purple-600 to-purple-700'
                  } bg-clip-text text-transparent`}>
                    {currentPlan.price}
                  </span>
                  <span className="text-slate-500 ml-1">{currentPlan.period}</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="font-semibold text-slate-900 mb-4">Fonctionnalités incluses :</h3>
                {currentPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <div className="relative mr-3 flex-shrink-0">
                      <Check className={`h-5 w-5 ${
                        currentPlan.color === 'amber' ? 'text-amber-500' : 'text-purple-500'
                      } drop-shadow-sm`} />
                      <div className="absolute inset-0 animate-pulse">
                        <Check className={`h-5 w-5 ${
                          currentPlan.color === 'amber' ? 'text-amber-300' : 'text-purple-300'
                        } opacity-30`} />
                      </div>
                    </div>
                    <span className="text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className={`bg-gradient-to-r ${
                currentPlan.color === 'amber' 
                  ? 'from-amber-50 to-amber-100' 
                  : 'from-purple-50 to-purple-100'
              } rounded-2xl p-4 border ${
                currentPlan.color === 'amber' 
                  ? 'border-amber-200/50' 
                  : 'border-purple-200/50'
              }`}>
                <div className="flex items-center mb-2">
                  <Shield className={`h-4 w-4 ${
                    currentPlan.color === 'amber' ? 'text-amber-600' : 'text-purple-600'
                  } mr-2`} />
                  <h4 className={`${
                    currentPlan.color === 'amber' ? 'text-amber-800' : 'text-purple-800'
                  } font-semibold text-sm`}>
                    Garantie de satisfaction
                  </h4>
                </div>
                <p className={`${
                  currentPlan.color === 'amber' ? 'text-amber-700' : 'text-purple-700'
                } text-xs`}>
                  Annulation possible à tout moment. Aucun engagement.
                </p>
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-white rounded-3xl shadow-luxury border border-neutral-200/50 p-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Informations de Paiement</h3>
                <p className="text-slate-600 text-sm">Paiement sécurisé par Stripe</p>
              </div>

              {paymentStatus === 'pending' ? (
                <div className="text-center py-8">
                  <div className="relative mb-6">
                    <CreditCard className="h-16 w-16 text-amber-500 animate-pulse mx-auto" />
                    <div className="absolute inset-0 animate-ping">
                      <CreditCard className="h-16 w-16 text-amber-300 opacity-30 mx-auto" />
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">Traitement en cours...</h4>
                  <p className="text-slate-600 mb-6">Veuillez patienter pendant que nous traitons votre paiement.</p>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* User Info */}
                  <div className="bg-gradient-to-r from-neutral-50 to-amber-50/30 rounded-2xl p-4 border border-neutral-200/50">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-slate-600">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="border border-neutral-200 rounded-2xl p-4">
                    <h4 className="font-semibold text-slate-900 mb-3">Résumé de la commande</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Plan {currentPlan.name}</span>
                        <span className="font-semibold text-slate-900">{currentPlan.price}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stripe Payment Form */}
                  {clientSecret && (
                    <StripePaymentForm 
                      plan={plan || 'standard'} 
                      onSuccess={() => setPaymentStatus('success')} 
                    />
                  )}

                  {stripeLoading && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                      <p className="text-slate-600 mt-2">Chargement du formulaire de paiement...</p>
                    </div>
                  )}

                  {stripeError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-red-600 text-sm">{stripeError}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentRedirect;