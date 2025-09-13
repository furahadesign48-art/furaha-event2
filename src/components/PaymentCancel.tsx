import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-neutral-50 to-rose-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-r from-rose-200/20 to-amber-200/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-r from-amber-200/20 to-rose-200/20 rounded-full blur-3xl animate-bounce-slow"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-2xl w-full text-center animate-slide-up">
          <div className="bg-white rounded-3xl shadow-luxury border border-neutral-200/50 p-8 md:p-12 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-200/10 to-amber-200/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-rose-200/10 to-amber-200/10 rounded-full blur-2xl"></div>
            
            <div className="relative">
              {/* Cancel Icon */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-rose-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg">
                    <XCircle className="h-12 w-12 text-white drop-shadow-lg" />
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <HelpCircle className="h-8 w-8 text-amber-500 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Cancel Message */}
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 bg-clip-text text-transparent">
                  Paiement annulé
                </span>
              </h1>

              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Votre paiement a été annulé. Aucun montant n'a été débité de votre compte.
              </p>

              {/* Reassurance */}
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl p-6 mb-8 border border-amber-200/50">
                <div className="flex items-center justify-center mb-4">
                  <HelpCircle className="h-6 w-6 text-amber-600 mr-3" />
                  <h2 className="text-xl font-bold text-amber-900">
                    Besoin d'aide ?
                  </h2>
                </div>
                <p className="text-amber-800 mb-4">
                  Si vous avez rencontré un problème lors du paiement ou si vous avez des questions, 
                  notre équipe support est là pour vous aider.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                    <span className="text-amber-700">Support par email 24/7</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                    <span className="text-amber-700">Chat en direct disponible</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                    <span className="text-amber-700">FAQ complète</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                    <span className="text-amber-700">Guides d'utilisation</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/pricing')}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-900 rounded-2xl hover:from-amber-600 hover:via-amber-700 hover:to-amber-600 transition-all duration-500 font-bold text-lg shadow-glow-amber hover:shadow-luxury transform hover:scale-105 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Réessayer le paiement
                  </span>
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="px-8 py-4 border-2 border-neutral-300 text-neutral-700 rounded-2xl hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-300 font-semibold flex items-center justify-center"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Retour à l'accueil
                </button>
              </div>

              {/* Contact Support */}
              <div className="mt-8 p-4 bg-gradient-to-r from-neutral-50 to-rose-50/30 rounded-2xl border border-neutral-200/50">
                <p className="text-sm text-slate-600 mb-3">
                  Vous continuez à rencontrer des difficultés ?
                </p>
                <button
                  onClick={() => window.location.href = 'mailto:support@furaha-event.com'}
                  className="text-amber-600 hover:text-amber-700 font-semibold underline transition-colors duration-300"
                >
                  Contactez notre support → support@furaha-event.com
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;