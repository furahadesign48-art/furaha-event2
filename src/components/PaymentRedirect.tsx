import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Crown, Sparkles, Check, ArrowLeft, CreditCard, Shield, X, Loader } from 'lucide-react';
import { Elements, useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import { stripePromise } from '../config/stripe';
import { useAuth } from './AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { auth } from '../config/firebase';

const PaymentRedirect = () => {
  const { plan } = useParams<{ plan: 'standard' | 'premium' }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { upgradeToPremium } = useSubscription();
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'error' | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Composant interne pour le formulaire de paiement Stripe
  const StripePaymentForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
      email: user?.email || '',
      name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

      if (!stripe || !elements || !clientSecret) {
        setError('Stripe n\'est pas encore chargé');
        return;
      }

      setIsProcessing(true);
      setFormErrors({});
      setError(null);

      const cardElement = elements.getElement(CardNumberElement);
      if (!cardElement) {
        setError('Élément de carte non trouvé');
        setIsProcessing(false);
        return;
      }

      try {
        // Confirmer le paiement avec Stripe
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: formData.name,
              email: formData.email,
            },
          },
        });

        if (stripeError) {
          throw new Error(stripeError.message || 'Erreur lors du paiement');
        }

        if (paymentIntent?.status === 'succeeded') {
          // Mettre à jour l'abonnement de l'utilisateur
          const planType = plan as 'standard' | 'premium';
          await upgradeToPremium(planType);
          
          setPaymentStatus('success');
          
          // Rediriger vers le dashboard après 2 secondes
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 2000);
        } else {
          throw new Error('Le paiement n\'a pas été confirmé');
        }
      } catch (err: any) {
        console.error('Erreur de paiement:', err);
        setError(err.message || 'Erreur lors du paiement');
        setPaymentStatus('error');
      } finally {
        setIsProcessing(false);
      }
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
                Numéro de carte
              </label>
              <div className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 transition-all duration-200 bg-white">
                <CardNumberElement
                  options={cardElementOptions}
                />
              </div>
            </div>

            {/* Expiration et CVC */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date d'expiration
                </label>
                <div className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 transition-all duration-200 bg-white">
                  <CardExpiryElement
                    options={cardElementOptions}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  CVC
                </label>
                <div className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 transition-all duration-200 bg-white">
                  <CardCvcElement
                    options={cardElementOptions}
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
              <span className="text-slate-600">Plan {plan === 'premium' ? 'Premium' : 'Standard'}</span>
              <span className="font-semibold text-slate-900">{plan === 'premium' ? '200€' : '100€'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">TVA (20%)</span>
              <span className="text-slate-600">{plan === 'premium' ? '40€' : '20€'}</span>
            </div>
            <hr className="my-3" />
            <div className="flex justify-between items-center text-lg font-bold">
              <span className="text-slate-900">Total</span>
              <span className="text-amber-600">{plan === 'premium' ? '240€' : '120€'}</span>
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
                Payer {plan === 'premium' ? '240€' : '120€'}
              </>
            )}
          </span>
        </button>

        {/* Informations légales */}
        <div className="text-center">
          <p className="text-xs text-slate-500">
            En cliquant sur "Payer", vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
          </p>
        </div>
      </form>
    );
  };

  // Créer le PaymentIntent au chargement du composant
  useEffect(() => {
    if (!user || !plan || !isAuthenticated) return;

    const createPaymentIntent = async () => {
      setIsCreatingPayment(true);
      setError(null);

      try {
        // Obtenir le token Firebase de l'utilisateur connecté
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
          throw new Error('Token d\'authentification non disponible');
        }

        const token = await firebaseUser.getIdToken();
        
        // Appeler la fonction Firebase
        const functionUrl = `${import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || 'https://us-central1-furaha-event-831ca.cloudfunctions.net'}/createPaymentIntent`;
        
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            plan: plan // 'standard' ou 'premium'
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || `Erreur HTTP ${response.status}`);
        }

        if (!data.clientSecret) {
          throw new Error('Client secret manquant dans la réponse');
        }

        setClientSecret(data.clientSecret);
      } catch (err: any) {
        console.error('Erreur lors de la création du PaymentIntent:', err);
        setError(err.message || 'Erreur lors de la création du paiement');
      } finally {
        setIsCreatingPayment(false);
      }
    };

    createPaymentIntent();
  }, [user, plan, isAuthenticated]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-amber-50/30 to-purple-50/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="bg-white rounded-3xl shadow-luxury border border-neutral-200/50 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Connexion requise</h2>
            <p className="text-slate-600 mb-6">Vous devez être connecté pour accéder au paiement.</p>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!plan || !['standard', 'premium'].includes(plan)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-amber-50/30 to-purple-50/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="bg-white rounded-3xl shadow-luxury border border-neutral-200/50 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Plan invalide</h2>
            <p className="text-slate-600 mb-6">Le plan sélectionné n'est pas valide.</p>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  const planDetails = {
    standard: {
      name: 'Standard',
      price: '100€',
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
      price: '200€',
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

  const currentPlan = planDetails[plan];
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
                  Redirection vers votre dashboard...
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
                {error || 'Une erreur est survenue lors du traitement de votre paiement. Veuillez réessayer ou contacter notre support.'}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setPaymentStatus(null);
                    setError(null);
                    window.location.reload();
                  }}
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
        <div className="max-w-4xl w-full">
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
                    Paiement 100% Sécurisé
                  </h4>
                </div>
                <ul className={`${
                  currentPlan.color === 'amber' ? 'text-amber-700' : 'text-purple-700'
                } text-xs space-y-1`}>
                  <li>• Chiffrement SSL 256-bit</li>
                  <li>• Traité par Stripe (leader mondial)</li>
                  <li>• Aucune donnée stockée sur nos serveurs</li>
                  <li>• Annulation possible à tout moment</li>
                </ul>
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-white rounded-3xl shadow-luxury border border-neutral-200/50 p-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Paiement Sécurisé</h3>
                <p className="text-slate-600 text-sm">Powered by Stripe</p>
              </div>

              {isCreatingPayment ? (
                <div className="text-center py-8">
                  <div className="relative mb-6">
                    <CreditCard className="h-16 w-16 text-amber-500 animate-pulse mx-auto" />
                    <div className="absolute inset-0 animate-ping">
                      <CreditCard className="h-16 w-16 text-amber-300 opacity-30 mx-auto" />
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">Préparation du paiement...</h4>
                  <p className="text-slate-600 mb-6">Veuillez patienter pendant que nous préparons votre paiement sécurisé.</p>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              ) : error ? (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center">
                  <X className="h-12 w-12 text-rose-600 mx-auto mb-4" />
                  <h4 className="text-rose-800 font-semibold mb-2">Erreur de configuration</h4>
                  <p className="text-rose-600 text-sm mb-4">{error}</p>
                  <button
                    onClick={() => {
                      setError(null);
                      window.location.reload();
                    }}
                    className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-all duration-300 font-semibold text-sm"
                  >
                    Réessayer
                  </button>
                </div>
              ) : clientSecret ? (
                <Elements 
                  stripe={stripePromise} 
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#f59e0b',
                        colorBackground: '#ffffff',
                        colorText: '#1e293b',
                        colorDanger: '#ef4444',
                        fontFamily: 'Inter, system-ui, sans-serif',
                        spacingUnit: '4px',
                        borderRadius: '12px',
                      },
                    },
                  }}
                >
                  <StripePaymentForm />
                </Elements>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
                  <p className="text-slate-600">Initialisation du paiement...</p>
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