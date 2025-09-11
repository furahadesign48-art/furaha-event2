import React from 'react';
import { AlertCircle, Database, ExternalLink } from 'lucide-react';

const SupabaseConnectionBanner = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const isConnected = supabaseUrl && supabaseAnonKey;

  if (isConnected) {
    return null; // Ne pas afficher si déjà connecté
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg shadow-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-amber-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-amber-800">
            Configuration Supabase requise
          </h3>
          <div className="mt-2 text-sm text-amber-700">
            <p className="mb-2">
              Pour utiliser les fonctionnalités de paiement Stripe, vous devez connecter votre projet à Supabase.
            </p>
            <div className="flex items-center space-x-4">
              <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200">
                <Database className="h-4 w-4 mr-2" />
                Connect to Supabase
                <ExternalLink className="h-3 w-3 ml-1" />
              </button>
              <span className="text-xs text-amber-600">
                Cliquez sur le bouton "Connect to Supabase" en haut à droite
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseConnectionBanner;