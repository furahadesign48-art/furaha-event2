import React, { useState } from 'react';
import { Menu, X, Crown, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useSubscription } from '../hooks/useSubscription';


interface HeaderProps {
  onLogin?: () => void;
}

const Header = ({ onLogin }: HeaderProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { subscription, getRemainingInvites } = useSubscription();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Fermer le menu utilisateur en cliquant à l'extérieur
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
  };

  return (
<header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-neutral-50/95 via-amber-50/90 to-neutral-50/95 backdrop-blur-xl shadow-luxury border-b border-amber-200/30 z-50 animate-fade-in">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      
      {/* Logo personnalisé depuis un lien */}
      <div className="flex items-center space-x-2">
        <div className="relative">
          <img 
            src="https://firebasestorage.googleapis.com/v0/b/furaha-event-831ca.firebasestorage.app/o/FURAHA-GOLD2.png?alt=media&token=5c1cbd85-df78-4e88-b0ad-d1c57d460692" 
            alt="Furaha Event Logo" 
            className="h-12 w-12 object-contain drop-shadow-lg animate-glow"
          />
          <div className="absolute inset-0 animate-pulse opacity-50">
            <img 
              src="https://firebasestorage.googleapis.com/v0/b/furaha-event-831ca.firebasestorage.app/o/FURAHA-GOLD2.png?alt=media&token=5c1cbd85-df78-4e88-b0ad-d1c57d460692" 
              alt="Furaha Event Logo pulse" 
              className="h-12 w-12 object-contain"
            />
          </div>
        </div>

        <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-amber-700 to-slate-900 bg-clip-text text-transparent">
          Furaha-Event
        </span>
        </div>


          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-slate-700 hover:text-amber-600 transition-all duration-300 font-medium relative group">
              Accueil
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#" className="text-slate-700 hover:text-amber-600 transition-all duration-300 font-medium relative group">
              Modèles
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#" className="text-slate-700 hover:text-amber-600 transition-all duration-300 font-medium relative group">
              Prix
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            
            {/* Bouton de connexion ou menu utilisateur */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 px-4 py-2 rounded-full hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-medium shadow-glow-amber hover:shadow-luxury transform hover:scale-105"
                >
                  <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-amber-400 font-bold text-sm">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <span className="hidden sm:block">{user.firstName}</span>
                </button>
                
                {/* Menu déroulant utilisateur */}
                {showUserMenu && (
                  <div className="user-menu absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-luxury border border-neutral-200/50 py-2 z-50 animate-slide-up">
                    <div className="px-4 py-3 border-b border-neutral-200/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-slate-600">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <button
                        onClick={() => {
                          console.log('Clic sur Mon Dashboard');
                          setShowUserMenu(false);
                          onLogin && onLogin();
                        }}
                        className="w-full flex items-center px-4 py-2 text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-all duration-200"
                      >
                        <User className="h-4 w-4 mr-3" />
                        Mon Dashboard
                      </button>
                      
                      {/* Affichage du plan et des invitations restantes */}
                      {subscription && (
                        <div className="px-4 py-2 bg-gradient-to-r from-amber-50 to-amber-100 mx-2 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium text-amber-800">
                                Plan {subscription.plan === 'free' ? 'Gratuit' : subscription.plan}
                              </p>
                              {subscription.plan === 'free' && (
                                <p className="text-xs text-amber-600">
                                  {getRemainingInvites()} invitations restantes
                                </p>
                              )}
                            </div>
                            <Crown className="h-4 w-4 text-amber-600" />
                          </div>
                        </div>
                      )}
                      
                      <hr className="my-2 border-neutral-200/50" />
                      
                      <button
                        onClick={() => {
                          console.log('Clic sur Se déconnecter');
                          setShowUserMenu(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center px-4 py-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all duration-200"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={onLogin}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 px-6 py-2 rounded-full hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-medium shadow-glow-amber hover:shadow-luxury transform hover:scale-105"
              >
                Connexion
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-slate-900" />
            ) : (
              <Menu className="h-6 w-6 text-slate-900" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 animate-slide-up">
            <nav className="flex flex-col space-y-4">
              <a href="#" className="text-slate-700 hover:text-amber-500 transition-colors duration-300 font-medium px-4 py-2">
                Accueil
              </a>
              <a href="#" className="text-slate-700 hover:text-amber-500 transition-colors duration-300 font-medium px-4 py-2">
                Modèles
              </a>
              <a href="#" className="text-slate-700 hover:text-amber-500 transition-colors duration-300 font-medium px-4 py-2">
                Prix
              </a>
              
              {isAuthenticated && user ? (
                <div className="mx-4 space-y-2">
                  <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-slate-600">{user.email}</p>
                      {subscription?.plan === 'free' && (
                        <p className="text-xs text-amber-600">
                          {getRemainingInvites()}/5 invitations
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (onLogin) {
                        onLogin();
                      }
                    }}
                    className="w-full bg-amber-500 text-slate-900 px-4 py-2 rounded-xl hover:bg-amber-600 transition-all duration-300 font-medium flex items-center justify-center"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Mon Dashboard
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full bg-rose-500 text-white px-4 py-2 rounded-xl hover:bg-rose-600 transition-all duration-300 font-medium flex items-center justify-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Se déconnecter
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    onLogin?.();
                  }}
                  className="bg-amber-500 text-slate-900 px-6 py-2 rounded-full hover:bg-amber-600 transition-all duration-300 font-medium shadow-lg mx-4"
                >
                  Connexion
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;