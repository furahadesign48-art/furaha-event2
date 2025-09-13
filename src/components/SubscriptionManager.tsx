import React, { useState } from 'react';
import { Crown, Gem, Calendar, CreditCard, AlertCircle, CheckCircle, Settings, X } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import PaymentModal from './PaymentModal';

interface SubscriptionManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionManager = ({ isOpen, onClose }: SubscriptionManagerProps) => {
  const { subscription, isLoading } = useSubscription();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'premium'>('standard');

  if (!isOpen) return null;

  const handleUpgrade = (plan: 'standard' | 'premium') => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handleCancelSubscription = () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler votre abonnement ? Vous perdrez l\'accès aux fonctionnalités premium à la fin de votre période de facturation.')) {
      // Dans un vrai projet, vous feriez un appel à votre API pour annuler l'abonnement
      alert('Abonnement annulé. Vous conservez l\'accès jusqu\'à la fin de votre période de facturation.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'premium':
        return Gem;
      case 'standard':
        return Crown;
      default:
        return Settings;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'premium':
        return 'from-purple-500 to-purple-600';
      case 'standard':
        return 'from-amber-500 to-amber-600';
      default:
        return 'from-neutral-400 to-neutral-500';
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-luxury p-8 text-center">
          <div className="w-8 h-8 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement de votre abonnement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-luxury max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200/50 bg-gradient-to-r from-neutral-50 to-amber-50/30">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="relative mr-3">
                <Settings className="h-6 w-6 text-amber-500 animate-glow drop-shadow-lg" />
                <div className="absolute inset-0 animate-pulse">
                  <Settings className="h-6 w-6 text-amber-300 opacity-30" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Gestion de l'abonnement
                </h2>
                <p className="text-slate-600 text-sm">
                  Gérez votre plan et vos fonctionnalités
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

        {/* Current Subscription */}
        {subscription && (
          <div className="p-6">
            <div className={`bg-gradient-to-br ${
              subscription.plan === 'premium' 
                ? 'from-purple-50 to-purple-100 border-purple-200/50' 
                : subscription.plan === 'standard'
                  ? 'from-amber-50 to-amber-100 border-amber-200/50'
                  : 'from-neutral-50 to-neutral-100 border-neutral-200/50'
            } rounded-2xl p-6 border mb-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {(() => {
                    const IconComponent = getPlanIcon(subscription.plan);
                    return (
                      <div className={`p-3 rounded-full bg-gradient-to-r ${getPlanColor(subscription.plan)} shadow-lg mr-4`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                    );
                  })()}
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Plan {subscription.plan === 'free' ? 'Gratuit' : subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
                    </h3>
                    <p className={`text-sm ${
                      subscription.status === 'active' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {subscription.status === 'active' ? 'Actif' : 'Inactif'}
                    </p>
                  </div>
                </div>
                
                {subscription.status === 'active' && (
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mr-2" />
                    <span className="text-emerald-600 font-medium text-sm">Actif</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">
                    {subscription.plan === 'free' ? '5' : subscription.inviteLimit === 999999 ? '∞' : subscription.inviteLimit}
                  </div>
                  <div className="text-slate-600 text-sm">Invitations/mois</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">
                    {subscription.currentInvites}
                  </div>
                  <div className="text-slate-600 text-sm">Utilisées ce mois</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">
                    {subscription.plan === 'free' 
                      ? '5' 
                      : subscription.inviteLimit === 999999 
                        ? '∞' 
                        : subscription.inviteLimit - subscription.currentInvites}
                  </div>
                  <div className="text-slate-600 text-sm">Restantes</div>
                </div>
              </div>

              {subscription.endDate && (
                <div className="flex items-center justify-center p-3 bg-white/50 rounded-xl">
                  <Calendar className="h-4 w-4 text-slate-600 mr-2" />
                  <span className="text-slate-700 text-sm">
                    Renouvellement le {formatDate(subscription.endDate)}
                  </span>
                </div>
              )}
            </div>

            {/* Upgrade Options */}
            {subscription.plan === 'free' && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Passer à un plan premium
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200/50">
                    <div className="flex items-center mb-4">
                      <Crown className="h-6 w-6 text-amber-600 mr-3" />
                      <h4 className="text-lg font-bold text-amber-900">Standard</h4>
                    </div>
                    <div className="text-3xl font-bold text-amber-900 mb-2">$100</div>
                    <div className="text-amber-700 text-sm mb-4">par mois</div>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center text-amber-800 text-sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        200 invitations/mois
                      </li>
                      <li className="flex items-center text-amber-800 text-sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Modèles premium
                      </li>
                      <li className="flex items-center text-amber-800 text-sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Support prioritaire
                      </li>
                    </ul>
                    <button
                      onClick={() => handleUpgrade('standard')}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold"
                    >
                      Choisir Standard
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200/50">
                    <div className="flex items-center mb-4">
                      <Gem className="h-6 w-6 text-purple-600 mr-3" />
                      <h4 className="text-lg font-bold text-purple-900">Premium</h4>
                    </div>
                    <div className="text-3xl font-bold text-purple-900 mb-2">$200</div>
                    <div className="text-purple-700 text-sm mb-4">par mois</div>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center text-purple-800 text-sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Invitations illimitées
                      </li>
                      <li className="flex items-center text-purple-800 text-sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Design sur mesure
                      </li>
                      <li className="flex items-center text-purple-800 text-sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Support VIP
                      </li>
                    </ul>
                    <button
                      onClick={() => handleUpgrade('premium')}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 font-semibold"
                    >
                      Choisir Premium
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Information */}
            {subscription.plan !== 'free' && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Informations de facturation
                </h3>
                
                <div className="bg-gradient-to-r from-neutral-50 to-amber-50/30 rounded-2xl p-6 border border-neutral-200/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 text-slate-600 mr-3" />
                      <span className="font-medium text-slate-900">Méthode de paiement</span>
                    </div>
                    <button className="text-amber-600 hover:text-amber-700 font-medium text-sm">
                      Modifier
                    </button>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded text-white text-xs flex items-center justify-center font-bold mr-3">
                      VISA
                    </div>
                    <span className="text-slate-700">•••• •••• •••• 4242</span>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-neutral-200/50">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Prochain paiement</span>
                      <span className="font-medium text-slate-900">
                        {subscription.endDate ? formatDate(subscription.endDate) : 'Non défini'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Actions */}
            {subscription.plan !== 'free' && (
              <div className="space-y-4">
                <button
                  onClick={() => window.open('https://billing.stripe.com/p/login/test_123', '_blank')}
                  className="w-full bg-gradient-to-r from-neutral-100 to-neutral-200 text-slate-900 py-3 rounded-xl hover:from-neutral-200 hover:to-neutral-300 transition-all duration-300 font-semibold flex items-center justify-center"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Gérer la facturation
                </button>
                
                <button
                  onClick={handleCancelSubscription}
                  className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white py-3 rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all duration-300 font-semibold flex items-center justify-center"
                >
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Annuler l'abonnement
                </button>
              </div>
            )}

            {/* Support */}
            <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200/50">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 mr-2" />
                <h4 className="font-semibold text-emerald-800">Support client</h4>
              </div>
              <p className="text-emerald-700 text-sm mb-3">
                Besoin d'aide avec votre abonnement ? Notre équipe est là pour vous aider.
              </p>
              <button
                onClick={() => window.location.href = 'mailto:support@furaha-event.com'}
                className="text-emerald-600 hover:text-emerald-700 font-semibold underline text-sm"
              >
                Contacter le support
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedPlan={selectedPlan}
      />
    </div>
  );
};

export default SubscriptionManager;