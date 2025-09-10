import React from 'react';
import { X, Crown, Sparkles, Check, Zap } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  remainingInvites: number;
}

const UpgradeModal = ({ isOpen, onClose, currentPlan, remainingInvites }: UpgradeModalProps) => {
  if (!isOpen) return null;

  const plans = [
    {
      name: 'Standard',
      price: '100$',
      period: '/mois',
      icon: Crown,
      features: [
        '200 invitations maximum',
        '1 mois de validité',
        'Tous les modèles premium',
        'Personnalisation avancée',
        'Statistiques détaillées',
        'Support prioritaire'
      ],
      popular: true,
      buttonText: 'Choisir Standard',
      buttonClass: 'bg-amber-500 text-slate-900 hover:bg-amber-600'
    },
    {
      name: 'Premium',
      price: '200$',
      period: '/mois',
      icon: Sparkles,
      features: [
        'Invitations illimitées',
        '1 mois de validité',
        'Tous les modèles premium',
        'Personnalisation avancée',
        'Statistiques détaillées',
        'Support prioritaire',
        'Design sur mesure'
      ],
      popular: false,
      buttonText: 'Choisir Premium',
      buttonClass: 'bg-slate-900 text-neutral-50 hover:bg-slate-800'
    }
  ];

  const handleUpgrade = (planName: string) => {
    // Rediriger vers la page de paiement Stripe
    alert(`Redirection vers le paiement pour le plan ${planName}...`);
    // Ici vous intégreriez Stripe
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-luxury max-w-2xl w-full animate-slide-up relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-purple-200/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-rose-200/20 to-amber-200/20 rounded-full blur-2xl"></div>
        
        {/* Header */}
        <div className="relative p-6 border-b border-neutral-200/50 bg-gradient-to-r from-neutral-50 to-amber-50/30">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="relative mr-3">
                <Zap className="h-8 w-8 text-amber-500 animate-glow drop-shadow-lg" />
                <div className="absolute inset-0 animate-pulse">
                  <Zap className="h-8 w-8 text-amber-300 opacity-30" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Limite d'invitations atteinte
                </h2>
                <p className="text-slate-600 text-sm">
                  Vous avez utilisé {5 - remainingInvites}/5 invitations gratuites
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

        {/* Content */}
        <div className="relative p-6">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-amber-50 to-rose-50 rounded-2xl p-6 border border-amber-200/50 mb-6">
              <div className="flex items-center justify-center mb-4">
                <Crown className="h-12 w-12 text-amber-500 animate-glow" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Passez au niveau supérieur !
              </h3>
              <p className="text-slate-600">
                Vous avez atteint la limite de 5 invitations gratuites
              </p>
            </div>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 gap-6">
            {plans.map((plan, index) => {
              const IconComponent = plan.icon;
              return (
                <div
                  key={plan.name}
                  className={`relative bg-gradient-to-br from-neutral-50 to-amber-50/30 rounded-2xl shadow-lg hover:shadow-glow-amber transition-all duration-500 p-6 backdrop-blur-sm border ${
                    plan.popular 
                      ? 'border-2 border-amber-400 transform hover:scale-105 shadow-glow-amber' 
                      : 'border border-neutral-200/50 hover:border-amber-300 transform hover:scale-102'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 px-4 py-1 rounded-full text-sm font-semibold shadow-glow-amber animate-glow">
                        Recommandé
                      </span>
                    </div>
                  )}

                  <div className="flex items-center mb-6">
                    <div className="flex justify-center mb-4">
                      <div className={`p-3 rounded-full ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-amber-100 to-amber-200 shadow-glow-amber' 
                          : 'bg-gradient-to-r from-neutral-100 to-slate-100'
                      }`}>
                        <IconComponent className={`h-8 w-8 ${
                          plan.popular 
                            ? 'text-amber-600 drop-shadow-lg' 
                            : 'text-slate-600'
                        }`} />
                      </div>
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                        {plan.name}
                      </h3>
                      
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-amber-700 to-slate-900 bg-clip-text text-transparent">
                          {plan.price}
                        </span>
                        <span className="text-slate-500 ml-1">{plan.period}</span>
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <div className="relative mr-3 flex-shrink-0">
                          <Check className="h-4 w-4 text-amber-500 drop-shadow-sm" />
                          <div className="absolute inset-0 animate-pulse">
                            <Check className="h-4 w-4 text-amber-300 opacity-30" />
                          </div>
                        </div>
                        <span className="text-slate-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => handleUpgrade(plan.name)}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-500 shadow-lg hover:shadow-luxury transform hover:scale-105 relative overflow-hidden ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 hover:from-amber-600 hover:to-amber-700 shadow-glow-amber' 
                        : 'bg-gradient-to-r from-slate-900 to-slate-800 text-neutral-50 hover:from-slate-800 hover:to-slate-700'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
                    {plan.buttonText}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Vous pouvez annuler votre abonnement à tout moment. 
              <br />
              Aucun engagement, facturation mensuelle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;