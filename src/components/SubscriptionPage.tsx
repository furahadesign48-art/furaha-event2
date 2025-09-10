import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Sparkles, 
  Check, 
  Zap, 
  Star, 
  ArrowLeft, 
  CreditCard,
  Shield,
  Users,
  BarChart3,
  Palette,
  MessageCircle,
  X,
  AlertCircle
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { useSubscription } from '../hooks/useSubscription';

interface SubscriptionPageProps {
  onBack: () => void;
  currentPlan?: string;
  remainingInvites?: number;
}

const SubscriptionPage = ({ onBack, currentPlan = 'free', remainingInvites = 0 }: SubscriptionPageProps) => {
  const { user } = useAuth();
  const { subscription, upgradeToPremium } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const plans = [
    {
      id: 'free',
      name: 'Gratuit',
      price: '0€',
      period: '/mois',
      icon: Star,
      description: 'Parfait pour commencer',
      features: [
        '5 invitations maximum',
        'Modèles de base',
        'Support par email',
        'Export PDF',
        'QR Code basique'
      ],
      limitations: [
        'Limité à 5 invitations',
        'Pas de personnalisation avancée',
        'Support standard'
      ],
      popular: false,
      buttonText: 'Plan actuel',
      buttonClass: 'bg-neutral-200 text-neutral-600 cursor-not-allowed',
      disabled: true
    },
    {
      id: 'standard',
      name: 'Standard',
      price: '100$',
      period: '/mois',
      icon: Crown,
      description: 'Idéal pour les événements réguliers',
      features: [
        '200 invitations maximum',
        '1 mois de validité',
        'Tous les modèles premium',
        'Personnalisation avancée',
        'Statistiques détaillées',
        'Support prioritaire',
        'Export multiple formats',
        'QR Code personnalisé',
        'Gestion des tables',
        'Livre d\'or avancé'
      ],
      limitations: [],
      popular: true,
      buttonText: 'Choisir Standard',
      buttonClass: 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 hover:from-amber-600 hover:to-amber-700',
      disabled: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '200$',
      period: '/mois',
      icon: Sparkles,
      description: 'Pour les événements exceptionnels',
      features: [
        'Invitations illimitées',
        '1 mois de validité',
        'Tous les modèles premium',
        'Personnalisation complète',
        'Statistiques avancées',
        'Support prioritaire 24/7',
        'Design sur mesure',
        'API d\'intégration',
        'Gestion multi-événements',
        'Analytics en temps réel',
        'Branding personnalisé',
        'Consultation dédiée'
      ],
      limitations: [],
      popular: false,
      buttonText: 'Choisir Premium',
      buttonClass: 'bg-gradient-to-r from-slate-900 to-slate-800 text-neutral-50 hover:from-slate-800 hover:to-slate-700',
      disabled: false
    }
  ];

  const handlePlanSelection = (planId: string) => {
    if (planId === 'free' || planId === currentPlan) return;
    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedPlan || !user) return;

    setIsProcessing(true);
    
    try {
      // Simuler le processus de paiement Stripe
      // En production, vous intégreriez ici Stripe Checkout ou Elements
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mettre à jour l'abonnement
      const success = await upgradeToPremium(selectedPlan as 'standard' | 'premium');
      
      if (success) {
        alert(`Félicitations ! Vous êtes maintenant abonné au plan ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}.`);
        setShowPaymentModal(false);
        setSelectedPlan('');
      } else {
        alert('Erreur lors de la mise à niveau. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur de paiement:', error);
      alert('Erreur lors du traitement du paiement. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getCurrentPlanData = () => {
    return plans.find(plan => plan.id === currentPlan) || plans[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-amber-50/30 to-purple-50/20 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-r from-amber-200/20 to-purple-200/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-r from-rose-200/20 to-amber-200/20 rounded-full blur-3xl animate-bounce-slow"></div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center text-amber-600 hover:text-amber-700 transition-all duration-300 group"
            >
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Retour au dashboard
            </button>
            
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-amber-700 to-slate-900 bg-clip-text text-transparent">
                Choisissez votre plan
              </h1>
              <p className="text-slate-600 mt-2">Débloquez tout le potentiel de Furaha-Event</p>
            </div>

            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Current Plan Status */}
        {currentPlan === 'free' && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gradient-to-r from-rose-50 to-amber-50 rounded-2xl p-6 border border-rose-200/50 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-rose-500 to-amber-500 rounded-full shadow-glow-rose">
                    <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-slate-900">Limite d'invitations atteinte</h3>
                    <p className="text-slate-600">
                      Vous avez utilisé {5 - remainingInvites}/5 invitations gratuites
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-rose-600">{remainingInvites}</p>
                  <p className="text-sm text-slate-600">invitations restantes</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => {
              const IconComponent = plan.icon;
              const isCurrentPlan = plan.id === currentPlan;
              
              return (
                <div
                  key={plan.id}
                  className={`relative bg-gradient-to-br from-white to-neutral-50/50 rounded-3xl shadow-luxury transition-all duration-500 p-8 backdrop-blur-sm border ${
                    plan.popular 
                      ? 'border-2 border-amber-400 transform hover:scale-105 shadow-glow-amber' 
                      : isCurrentPlan
                        ? 'border-2 border-emerald-400 shadow-glow-emerald'
                        : 'border border-neutral-200/50 hover:border-amber-300 transform hover:scale-102'
                  } animate-slide-up`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 px-6 py-2 rounded-full text-sm font-semibold shadow-glow-amber animate-glow">
                        Recommandé
                      </span>
                    </div>
                  )}

                  {/* Current Plan Badge */}
                  {isCurrentPlan && (
                    <div className="absolute -top-4 right-4">
                      <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                        Plan actuel
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                      <div className={`p-4 rounded-full ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-amber-100 to-amber-200 shadow-glow-amber' 
                          : isCurrentPlan
                            ? 'bg-gradient-to-r from-emerald-100 to-emerald-200'
                            : plan.id === 'premium'
                              ? 'bg-gradient-to-r from-slate-100 to-slate-200'
                              : 'bg-gradient-to-r from-neutral-100 to-slate-100'
                      }`}>
                        <IconComponent className={`h-10 w-10 ${
                          plan.popular 
                            ? 'text-amber-600 drop-shadow-lg' 
                            : isCurrentPlan
                              ? 'text-emerald-600'
                              : plan.id === 'premium'
                                ? 'text-slate-600'
                                : 'text-neutral-600'
                        }`} />
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                      {plan.name}
                    </h3>
                    
                    <p className="text-slate-600 mb-4">{plan.description}</p>
                    
                    <div className="flex items-baseline justify-center mb-6">
                      <span className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-amber-700 to-slate-900 bg-clip-text text-transparent">
                        {plan.price}
                      </span>
                      <span className="text-slate-500 ml-1">{plan.period}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="mb-8">
                    <h4 className="font-semibold text-slate-900 mb-4">Fonctionnalités incluses :</h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center">
                          <div className="relative mr-3 flex-shrink-0">
                            <Check className="h-5 w-5 text-emerald-500 drop-shadow-sm" />
                            <div className="absolute inset-0 animate-pulse">
                              <Check className="h-5 w-5 text-emerald-300 opacity-30" />
                            </div>
                          </div>
                          <span className="text-slate-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Limitations */}
                    {plan.limitations.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-slate-900 mb-3">Limitations :</h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, idx) => (
                            <li key={idx} className="flex items-center">
                              <X className="h-4 w-4 text-rose-500 mr-3 flex-shrink-0" />
                              <span className="text-slate-600 text-sm">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handlePlanSelection(plan.id)}
                    disabled={plan.disabled || isCurrentPlan}
                    className={`w-full py-4 rounded-2xl font-semibold transition-all duration-500 shadow-lg hover:shadow-luxury transform hover:scale-105 relative overflow-hidden ${
                      plan.disabled || isCurrentPlan
                        ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed transform-none'
                        : plan.buttonClass
                    } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <span className="relative flex items-center justify-center">
                      {isCurrentPlan ? (
                        <>
                          <Check className="h-5 w-5 mr-2" />
                          Plan actuel
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5 mr-2" />
                          {plan.buttonText}
                        </>
                      )}
                    </span>
                  </button>

                  {/* Special Offer */}
                  {plan.id === 'standard' && (
                    <div className="mt-4 text-center">
                      <p className="text-xs text-amber-600 font-medium">
                        🎉 Offre spéciale : Premier mois à -50%
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Features Comparison */}
        <div className="max-w-7xl mx-auto mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4">
              Comparaison détaillée
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Découvrez toutes les fonctionnalités disponibles selon votre plan
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-neutral-50 to-amber-50/30">
                  <tr>
                    <th className="text-left p-6 font-semibold text-slate-900">Fonctionnalités</th>
                    <th className="text-center p-6 font-semibold text-slate-900">Gratuit</th>
                    <th className="text-center p-6 font-semibold text-amber-700">Standard</th>
                    <th className="text-center p-6 font-semibold text-slate-900">Premium</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/50">
                  <tr className="hover:bg-neutral-50/50 transition-colors duration-200">
                    <td className="p-6 font-medium text-slate-900">Nombre d'invitations</td>
                    <td className="p-6 text-center text-slate-600">5</td>
                    <td className="p-6 text-center text-amber-700 font-semibold">200</td>
                    <td className="p-6 text-center text-slate-900 font-semibold">Illimité</td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50 transition-colors duration-200">
                    <td className="p-6 font-medium text-slate-900">Modèles premium</td>
                    <td className="p-6 text-center"><X className="h-5 w-5 text-rose-500 mx-auto" /></td>
                    <td className="p-6 text-center"><Check className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                    <td className="p-6 text-center"><Check className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50 transition-colors duration-200">
                    <td className="p-6 font-medium text-slate-900">Personnalisation avancée</td>
                    <td className="p-6 text-center"><X className="h-5 w-5 text-rose-500 mx-auto" /></td>
                    <td className="p-6 text-center"><Check className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                    <td className="p-6 text-center"><Check className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50 transition-colors duration-200">
                    <td className="p-6 font-medium text-slate-900">Support prioritaire</td>
                    <td className="p-6 text-center"><X className="h-5 w-5 text-rose-500 mx-auto" /></td>
                    <td className="p-6 text-center"><Check className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                    <td className="p-6 text-center text-slate-900 font-semibold">24/7</td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50 transition-colors duration-200">
                    <td className="p-6 font-medium text-slate-900">Analytics avancées</td>
                    <td className="p-6 text-center"><X className="h-5 w-5 text-rose-500 mx-auto" /></td>
                    <td className="p-6 text-center"><Check className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                    <td className="p-6 text-center"><Check className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50 transition-colors duration-200">
                    <td className="p-6 font-medium text-slate-900">Design sur mesure</td>
                    <td className="p-6 text-center"><X className="h-5 w-5 text-rose-500 mx-auto" /></td>
                    <td className="p-6 text-center"><X className="h-5 w-5 text-rose-500 mx-auto" /></td>
                    <td className="p-6 text-center"><Check className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4">
              Questions fréquentes
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-neutral-200/50 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Puis-je changer de plan à tout moment ?</h3>
              <p className="text-slate-600">
                Oui, vous pouvez passer à un plan supérieur à tout moment. Les changements prennent effet immédiatement 
                et vous ne payez que la différence au prorata.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-neutral-200/50 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Que se passe-t-il si j'annule mon abonnement ?</h3>
              <p className="text-slate-600">
                Vous conservez l'accès à toutes les fonctionnalités jusqu'à la fin de votre période de facturation. 
                Après cela, votre compte revient au plan gratuit.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-neutral-200/50 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Y a-t-il des frais cachés ?</h3>
              <p className="text-slate-600">
                Non, nos prix sont transparents. Aucun frais d'installation, aucun coût caché. 
                Vous payez uniquement le montant affiché pour votre plan choisi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-luxury max-w-md w-full animate-slide-up">
            <div className="p-6 border-b border-neutral-200/50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Finaliser l'abonnement</h3>
                  <p className="text-slate-600 text-sm mt-1">
                    Plan {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}
                  </p>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
                >
                  <X className="h-5 w-5 text-neutral-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Plan Summary */}
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 mb-6 border border-amber-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-amber-900">
                      Plan {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}
                    </h4>
                    <p className="text-amber-700 text-sm">Facturation mensuelle</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-amber-900">
                      {plans.find(p => p.id === selectedPlan)?.price}
                    </p>
                    <p className="text-amber-700 text-sm">/mois</p>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h4 className="font-semibold text-slate-900 mb-4">Méthode de paiement</h4>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-neutral-300 rounded-xl cursor-pointer hover:border-amber-400 transition-colors duration-200">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <CreditCard className="h-5 w-5 text-slate-600 mr-3" />
                    <span className="font-medium text-slate-900">Carte bancaire</span>
                  </label>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-4 mb-6 border border-emerald-200/50">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-emerald-600 mr-3" />
                  <div>
                    <p className="text-emerald-800 font-medium text-sm">Paiement sécurisé</p>
                    <p className="text-emerald-700 text-xs">Vos données sont protégées par Stripe</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-glow-amber transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin mr-2"></div>
                      Traitement en cours...
                    </div>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 inline mr-2" />
                      Confirmer l'abonnement
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="w-full bg-neutral-100 text-neutral-700 py-3 rounded-xl hover:bg-neutral-200 transition-all duration-300 font-medium"
                >
                  Annuler
                </button>
              </div>

              <p className="text-xs text-slate-500 text-center mt-4">
                En confirmant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;