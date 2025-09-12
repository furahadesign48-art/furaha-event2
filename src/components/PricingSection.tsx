import React from 'react';
import { Check, Star, Crown, Gem, Zap } from 'lucide-react';

const PricingSection = () => {
  const plans = [
    {
      name: 'Gratuit',
      price: '0€',
      period: '/mois',
      icon: Star,
      features: [
        '5 invitations maximum',
        'Modèles de base',
        'Support par email',
        'Export PDF'
      ],
      popular: false,
      buttonText: 'Commencer',
      buttonClass: 'bg-neutral-100 text-slate-900 hover:bg-neutral-200'
    },
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
      icon: Gem,
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

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-neutral-100 via-amber-50/30 to-purple-50/20 dark:from-slate-800 dark:via-slate-700/30 dark:to-slate-800/80 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-r from-amber-200/20 to-purple-200/20 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-32 h-32 bg-gradient-to-r from-rose-200/20 to-amber-200/20 rounded-full blur-2xl animate-bounce-slow"></div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-slate-900 via-amber-700 to-slate-900 dark:from-slate-100 dark:via-amber-300 dark:to-slate-100 bg-clip-text text-transparent">
            Choisissez votre plan
            </span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto backdrop-blur-sm bg-neutral-50/50 dark:bg-slate-800/50 rounded-xl p-4 border border-amber-200/30 dark:border-slate-600/30">
            Des solutions adaptées à tous vos besoins d'événements, du plus simple au plus sophistiqué
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            const gradientColors = {
              0: 'from-neutral-50 to-slate-50',
              1: 'from-amber-50 via-amber-25 to-rose-50',
              2: 'from-purple-50 via-slate-50 to-amber-50'
            };
            return (
              <div
                key={plan.name}
                className={`relative bg-gradient-to-br ${gradientColors[index]} dark:from-slate-700 dark:to-slate-600 rounded-3xl shadow-luxury hover:shadow-glow-amber transition-all duration-500 p-8 backdrop-blur-sm border ${
                  plan.popular 
                    ? 'border-2 border-amber-400 dark:border-amber-500 transform hover:scale-105 shadow-glow-amber' 
                    : 'border border-neutral-200/50 dark:border-slate-600/50 hover:border-amber-300 dark:hover:border-amber-400 transform hover:scale-102'
                } animate-slide-up`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
                </div>
                
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 px-6 py-2 rounded-full text-sm font-semibold shadow-glow-amber animate-glow">
                      Plus populaire
                    </span>
                  </div>
                )}

                {/* Badge de limitation pour le plan gratuit */}
                {index === 0 && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-gradient-to-r from-rose-500 to-rose-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                      Limité
                    </span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    <div className={`p-4 rounded-full ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-amber-100 to-amber-200 shadow-glow-amber' 
                        : index === 2 
                          ? 'bg-gradient-to-r from-purple-100 to-slate-100' 
                          : 'bg-gradient-to-r from-neutral-100 to-slate-100'
                    }`}>
                      <IconComponent className={`h-10 w-10 ${
                        plan.popular 
                          ? 'text-amber-600 drop-shadow-lg' 
                          : index === 2 
                            ? 'text-purple-600' 
                            : 'text-slate-600'
                      }`} />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-2">{plan.name}</h3>
                  
                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-amber-700 to-slate-900 dark:from-slate-100 dark:via-amber-300 dark:to-slate-100 bg-clip-text text-transparent">{plan.price}</span>
                    <span className="text-slate-500 dark:text-slate-400 ml-1">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <div className="relative mr-3 flex-shrink-0">
                        <Check className="h-5 w-5 text-amber-500 drop-shadow-sm" />
                        <div className="absolute inset-0 animate-pulse">
                          <Check className="h-5 w-5 text-amber-300 opacity-30" />
                        </div>
                      </div>
                      <span className="text-slate-700">{feature}</span>
                      <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-4 rounded-full font-semibold transition-all duration-500 shadow-lg hover:shadow-luxury transform hover:scale-105 relative overflow-hidden ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 hover:from-amber-600 hover:to-amber-700 shadow-glow-amber' 
                    : index === 2 
                      ? 'bg-gradient-to-r from-slate-900 to-purple-900 text-neutral-50 hover:from-purple-900 hover:to-slate-800 shadow-glow-purple' 
                      : 'bg-gradient-to-r from-neutral-100 to-slate-100 text-slate-900 hover:from-slate-100 hover:to-neutral-200 cursor-default opacity-75'
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative flex items-center justify-center">
                    {index === 0 && <Zap className="h-4 w-4 mr-2" />}
                    {plan.buttonText}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;