import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowLeft, RefreshCw } from 'lucide-react';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-amber-100/30 to-amber-200/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center animate-fade-in">
        <div className="bg-white rounded-3xl shadow-luxury border border-amber-200/50 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-amber-300/20 rounded-full blur-2xl"></div>
          
          <div className="relative">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full shadow-lg">
                <X className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent mb-4">
              Paiement Annulé
            </h2>
            
            <p className="text-slate-600 mb-6 leading-relaxed">
              Vous avez annulé le processus de paiement. Aucun montant n'a été débité de votre compte.
            </p>
            
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl p-4 border border-amber-200/50 mb-6">
              <p className="text-amber-700 text-sm">
                Vous pouvez toujours souscrire à un abonnement plus tard depuis votre dashboard.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/pricing', { replace: true })}
                className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-900 py-3 rounded-xl hover:from-amber-600 hover:via-amber-700 hover:to-amber-600 transition-all duration-500 font-semibold shadow-glow-amber transform hover:scale-105 flex items-center justify-center"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Voir les Plans
              </button>
              
              <button
                onClick={() => navigate('/', { replace: true })}
                className="w-full bg-transparent border-2 border-slate-300 text-slate-700 py-3 rounded-xl hover:bg-slate-50 transition-all duration-300 font-semibold flex items-center justify-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l'Accueil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;