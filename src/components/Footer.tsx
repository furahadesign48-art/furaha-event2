import React from 'react';
import { Crown, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-neutral-50 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-20 w-32 h-32 bg-gradient-to-r from-amber-500/10 to-purple-500/10 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-28 h-28 bg-gradient-to-r from-rose-500/10 to-amber-500/10 rounded-full blur-2xl animate-bounce-slow"></div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative">
                <Crown className="h-10 w-10 text-amber-500 drop-shadow-lg animate-glow" />
                <div className="absolute inset-0 animate-pulse">
                  <Crown className="h-10 w-10 text-amber-300 opacity-30" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-neutral-50 via-amber-200 to-neutral-50 bg-clip-text text-transparent">
                Furaha-Event
              </span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed backdrop-blur-sm bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
              Créez des invitations digitales exceptionnelles qui marquent les esprits. 
              Votre événement mérite une <span className="text-amber-400 font-medium">invitation à la hauteur</span> de son importance.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center text-gray-300">
                <div className="relative mr-2">
                  <Mail className="h-5 w-5 text-amber-500 drop-shadow-sm" />
                  <div className="absolute inset-0 animate-pulse">
                    <Mail className="h-5 w-5 text-amber-300 opacity-20" />
                  </div>
                </div>
                <span>contact@furaha-event.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-amber-500 to-amber-400 bg-clip-text text-transparent">Liens rapides</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-300 hover:text-amber-400 transition-all duration-300 relative group">
                  À propos
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-400 group-hover:w-full transition-all duration-300"></span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-amber-400 transition-all duration-300 relative group">
                  Contact
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-400 group-hover:w-full transition-all duration-300"></span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-amber-400 transition-all duration-300 relative group">
                  Politique de confidentialité
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-400 group-hover:w-full transition-all duration-300"></span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-amber-400 transition-all duration-300 relative group">
                  Conditions d'utilisation
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-400 group-hover:w-full transition-all duration-300"></span>
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-amber-500 to-rose-400 bg-clip-text text-transparent">Support</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-300 hover:text-rose-400 transition-all duration-300 relative group">
                  Centre d'aide
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-500 to-amber-400 group-hover:w-full transition-all duration-300"></span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-rose-400 transition-all duration-300 relative group">
                  Guides
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-500 to-amber-400 group-hover:w-full transition-all duration-300"></span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-rose-400 transition-all duration-300 relative group">
                  Tutoriels
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-500 to-amber-400 group-hover:w-full transition-all duration-300"></span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-rose-400 transition-all duration-300 relative group">
                  FAQ
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-500 to-amber-400 group-hover:w-full transition-all duration-300"></span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gradient-to-r from-gray-800 via-amber-800/30 to-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 Furaha-Event. Tous droits réservés.
            </p>
            
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-all duration-300 text-sm relative group">
                Mentions légales
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-all duration-300 text-sm relative group">
                Cookies
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-all duration-300 text-sm relative group">
                Accessibilité
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;