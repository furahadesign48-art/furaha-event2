import React from 'react';
import { Palette, Sparkles, BarChart3 } from 'lucide-react';

const WhyChooseSection = () => {
  const features = [
    {
      id: 1,
      title: 'Templates Premium',
      description: 'Des modèles exceptionnels avec toutes les fonctionnalités avancées',
      icon: Palette,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'from-amber-50 to-orange-50'
    },
    {
      id: 2,
      title: 'Design Personnalisé',
      description: 'Personnalisez complètement vos invitations selon vos goûts',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50'
    },
    {
      id: 3,
      title: 'Gestion Complète',
      description: 'Dashboard admin pour gérer tous vos événements en un seul endroit',
      icon: BarChart3,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'from-emerald-50 to-teal-50'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-neutral-100 via-amber-50/30 to-neutral-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-36 h-36 bg-gradient-to-r from-amber-200/15 to-purple-200/15 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-10 right-20 w-28 h-28 bg-gradient-to-r from-emerald-200/15 to-amber-200/15 rounded-full blur-2xl animate-bounce-slow"></div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
              Pourquoi Choisir Furaha-Event ?
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Des fonctionnalités exceptionnelles pour des événements mémorables
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={feature.id}
                className="text-center animate-slide-up transform hover:scale-105 transition-all duration-500"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className={`bg-gradient-to-br ${feature.bgColor} rounded-3xl p-8 shadow-luxury hover:shadow-glow-amber transition-all duration-500 backdrop-blur-sm border border-neutral-200/50 hover:border-amber-300/50`}>
                  <div className="flex justify-center mb-6">
                    <div className={`p-4 rounded-full bg-gradient-to-r ${feature.color} shadow-lg`}>
                      <IconComponent className="h-12 w-12 text-white drop-shadow-lg" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;