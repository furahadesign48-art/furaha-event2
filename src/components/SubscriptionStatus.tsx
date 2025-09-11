import React from 'react';
import { Crown, Sparkles, Calendar, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

const SubscriptionStatus = () => {
  const { subscription, isLoading, getRemainingInvites } = useSubscription();

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 p-6 animate-pulse">
        <div className="h-6 bg-neutral-200 rounded mb-4"></div>
        <div className="h-4 bg-neutral-200 rounded mb-2"></div>
        <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-gradient-to-r from-rose-50 to-rose-100 rounded-2xl border border-rose-200/50 p-6">
        <div className="flex items-center mb-4">
          <AlertCircle className="h-6 w-6 text-rose-600 mr-3" />
          <h3 className="text-lg font-semibold text-rose-800">Erreur d'abonnement</h3>
        </div>
        <p className="text-rose-700 text-sm">
          Impossible de charger les informations d'abonnement.
        </p>
      </div>
    );
  }

  const getPlanIcon = () => {
    switch (subscription.plan) {
      case 'premium':
        return <Sparkles className="h-6 w-6 text-purple-600" />;
      case 'standard':
        return <Crown className="h-6 w-6 text-amber-600" />;
      default:
        return <CheckCircle className="h-6 w-6 text-emerald-600" />;
    }
  };

  const getPlanColor = () => {
    switch (subscription.plan) {
      case 'premium':
        return 'from-purple-50 to-purple-100 border-purple-200/50';
      case 'standard':
        return 'from-amber-50 to-amber-100 border-amber-200/50';
      default:
        return 'from-emerald-50 to-emerald-100 border-emerald-200/50';
    }
  };

  const getPlanName = () => {
    switch (subscription.plan) {
      case 'premium':
        return 'Premium';
      case 'standard':
        return 'Standard';
      default:
        return 'Gratuit';
    }
  };

  const getStatusColor = () => {
    switch (subscription.status) {
      case 'active':
        return 'text-emerald-600 bg-emerald-100';
      case 'cancelled':
        return 'text-rose-600 bg-rose-100';
      default:
        return 'text-amber-600 bg-amber-100';
    }
  };

  const getStatusText = () => {
    switch (subscription.status) {
      case 'active':
        return 'Actif';
      case 'cancelled':
        return 'Annulé';
      default:
        return 'Inactif';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className={`bg-gradient-to-r ${getPlanColor()} rounded-2xl border p-6 animate-fade-in`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          {getPlanIcon()}
          <div className="ml-3">
            <h3 className="text-lg font-bold text-slate-900">Plan {getPlanName()}</h3>
            <div className="flex items-center mt-1">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
          </div>
        </div>
        
        {subscription.plan !== 'free' && (
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900">
              {subscription.plan === 'standard' ? '100€' : '200€'}
            </div>
            <div className="text-sm text-slate-600">/mois</div>
          </div>
        )}
      </div>

      {/* Informations d'utilisation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Invitations</p>
              <p className="text-lg font-bold text-slate-900">
                {subscription.currentInvites}
                {subscription.plan === 'free' && ` / ${subscription.inviteLimit}`}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${
              subscription.plan === 'free' 
                ? 'bg-emerald-100' 
                : subscription.plan === 'standard' 
                  ? 'bg-amber-100' 
                  : 'bg-purple-100'
            }`}>
              <CreditCard className={`h-5 w-5 ${
                subscription.plan === 'free' 
                  ? 'text-emerald-600' 
                  : subscription.plan === 'standard' 
                    ? 'text-amber-600' 
                    : 'text-purple-600'
              }`} />
            </div>
          </div>
          {subscription.plan === 'free' && (
            <div className="mt-2">
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(subscription.currentInvites / subscription.inviteLimit) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {getRemainingInvites()} invitations restantes
              </p>
            </div>
          )}
        </div>

        <div className="bg-white/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Depuis le</p>
              <p className="text-lg font-bold text-slate-900">
                {formatDate(subscription.startDate)}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${
              subscription.plan === 'free' 
                ? 'bg-emerald-100' 
                : subscription.plan === 'standard' 
                  ? 'bg-amber-100' 
                  : 'bg-purple-100'
            }`}>
              <Calendar className={`h-5 w-5 ${
                subscription.plan === 'free' 
                  ? 'text-emerald-600' 
                  : subscription.plan === 'standard' 
                    ? 'text-amber-600' 
                    : 'text-purple-600'
              }`} />
            </div>
          </div>
          {subscription.endDate && (
            <p className="text-xs text-slate-600 mt-1">
              Expire le {formatDate(subscription.endDate)}
            </p>
          )}
        </div>
      </div>

      {/* Avantages du plan */}
      <div className="bg-white/50 rounded-xl p-4">
        <h4 className="font-semibold text-slate-900 mb-3">Avantages de votre plan</h4>
        <div className="space-y-2">
          {subscription.plan === 'free' && (
            <>
              <div className="flex items-center text-sm text-slate-700">
                <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                5 invitations gratuites
              </div>
              <div className="flex items-center text-sm text-slate-700">
                <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                Modèles de base
              </div>
              <div className="flex items-center text-sm text-slate-700">
                <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                Support par email
              </div>
            </>
          )}
          
          {subscription.plan === 'standard' && (
            <>
              <div className="flex items-center text-sm text-slate-700">
                <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                200 invitations maximum
              </div>
              <div className="flex items-center text-sm text-slate-700">
                <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                Tous les modèles premium
              </div>
              <div className="flex items-center text-sm text-slate-700">
                <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                Support prioritaire
              </div>
            </>
          )}
          
          {subscription.plan === 'premium' && (
            <>
              <div className="flex items-center text-sm text-slate-700">
                <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />
                Invitations illimitées
              </div>
              <div className="flex items-center text-sm text-slate-700">
                <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />
                Design sur mesure
              </div>
              <div className="flex items-center text-sm text-slate-700">
                <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />
                API d'intégration
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatus;