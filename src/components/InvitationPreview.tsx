import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Users, 
  Wine, 
  Camera, 
  MessageCircle, 
  QrCode, 
  Check, 
  Sparkles,
  ArrowLeft,
  Gift,
  GraduationCap,
  User,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  Send,
  Clock,
  Star
} from 'lucide-react';
import { UserModelService, InviteService } from '../services/templateService';
import { UserModel, Invite } from '../services/templateService';

const InvitationPreview = () => {
  const { inviteId } = useParams<{ inviteId: string }>();
  const navigate = useNavigate();
  const [userModel, setUserModel] = useState<UserModel | null>(null);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDrink, setSelectedDrink] = useState('');
  const [guestMessage, setGuestMessage] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  
  // État pour le système de balayage
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const screens = [
    { id: 0, title: 'Bienvenue', subtitle: 'Votre invitation personnalisée' },
    { id: 1, title: 'Détails', subtitle: 'Informations de l\'événement' },
    { id: 2, title: 'Confirmation', subtitle: 'Répondez à l\'invitation' },
    { id: 3, title: 'QR Code', subtitle: 'Votre code d\'accès' }
  ];

  useEffect(() => {
    const loadInvitationData = async () => {
      if (!inviteId) {
        setError('ID d\'invitation manquant');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('Chargement de l\'invitation:', inviteId);
        
        const inviteData = await InviteService.getInviteGlobal(inviteId);
        console.log('Données d\'invitation récupérées:', inviteData);
        
        if (!inviteData) {
          setError('Invitation non trouvée');
          setIsLoading(false);
          return;
        }
        
        setInvite(inviteData);
        setIsConfirmed(inviteData.confirmed);
        console.log('Invitation définie:', inviteData);
        
        console.log('Récupération des modèles pour l\'utilisateur:', inviteData.userId);
        const userModels = await UserModelService.getUserModels(inviteData.userId);
        console.log('Modèles utilisateur récupérés:', userModels);
        
        if (userModels.length > 0) {
          setUserModel(userModels[0]);
          console.log('Modèle utilisateur défini:', userModels[0]);
          
          await generateQRCode(inviteData, userModels[0]);
        } else {
          setError('Modèle d\'invitation non trouvé');
        }
        
      } catch (err) {
        console.error('Erreur lors du chargement de l\'invitation:', err);
        setError('Erreur lors du chargement de l\'invitation');
      } finally {
        setIsLoading(false);
      }
    };

    loadInvitationData();
  }, [inviteId]);

  const generateQRCode = async (inviteData: Invite, modelData: UserModel) => {
    try {
      const qrData = {
        nom: inviteData.nom,
        table: inviteData.table || 'Non assigné',
        boisson: 'Non sélectionnée'
      };
      
      const qrString = JSON.stringify(qrData);
      const qrCodeUrl = await QRCode.toDataURL(qrString, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeDataUrl(qrCodeUrl);
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
    }
  };

  useEffect(() => {
    if (invite && userModel && selectedDrink) {
      const updateQRCode = async () => {
        const qrData = {
          nom: invite.nom,
          table: invite.table || 'Non assigné',
          boisson: selectedDrink
        };
        
        try {
          const qrString = JSON.stringify(qrData);
          const qrCodeUrl = await QRCode.toDataURL(qrString, {
            width: 200,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          setQrCodeDataUrl(qrCodeUrl);
        } catch (error) {
          console.error('Erreur lors de la mise à jour du QR code:', error);
        }
      };
      
      updateQRCode();
    }
  }, [selectedDrink, invite, userModel]);

  // Gestion du balayage tactile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentScreen < screens.length - 1) {
      nextScreen();
    }
    if (isRightSwipe && currentScreen > 0) {
      prevScreen();
    }
  };

  const nextScreen = () => {
    if (currentScreen < screens.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentScreen(prev => prev + 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const prevScreen = () => {
    if (currentScreen > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentScreen(prev => prev - 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const goToScreen = (screenIndex: number) => {
    if (screenIndex !== currentScreen && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentScreen(screenIndex);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const handleConfirmation = async () => {
    if (!invite || !userModel) return;
    
    try {
      const newStatus = !isConfirmed;
      await InviteService.updateInvite(userModel.userId, invite.id, {
        confirmed: newStatus
      });
      setIsConfirmed(newStatus);
    } catch (error) {
      console.error('Erreur lors de la confirmation:', error);
      alert('Erreur lors de la confirmation');
    }
  };

  const handleSendMessage = async () => {
    if (!guestMessage.trim() || !invite || !userModel) {
      alert('Veuillez écrire un message avant d\'envoyer.');
      return;
    }
    
    try {
      await InviteService.updateInviteResponse(userModel.userId, invite.id, {
        message: guestMessage
      });
      alert('Message envoyé avec succès !');
      setGuestMessage('');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      alert('Erreur lors de l\'envoi du message');
    }
  };

  const handleDrinkSelection = async (drink: string) => {
    if (!invite || !userModel) return;
    
    try {
      await InviteService.updateInviteResponse(userModel.userId, invite.id, {
        selectedDrink: drink
      });
      setSelectedDrink(drink);
    } catch (error) {
      console.error('Erreur lors de la sélection de boisson:', error);
    }
  };

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'wedding':
        return Heart;
      case 'birthday':
        return Gift;
      case 'graduation':
        return GraduationCap;
      default:
        return Heart;
    }
  };

  const getColorScheme = (category: string) => {
    switch (category) {
      case 'wedding':
        return {
          primary: '#f59e0b',
          secondary: '#d97706',
          accent: '#f43f5e'
        };
      case 'birthday':
        return {
          primary: '#8b5cf6',
          secondary: '#7c3aed',
          accent: '#ec4899'
        };
      case 'graduation':
        return {
          primary: '#10b981',
          secondary: '#059669',
          accent: '#3b82f6'
        };
      default:
        return {
          primary: '#f59e0b',
          secondary: '#d97706',
          accent: '#f43f5e'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900/20 to-slate-800 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative mb-6">
            <Heart className="h-16 w-16 text-amber-500 animate-glow drop-shadow-lg mx-auto" />
            <div className="absolute inset-0 animate-ping">
              <Heart className="h-16 w-16 text-amber-300 opacity-30 mx-auto" />
            </div>
          </div>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-amber-200 font-medium">Chargement de votre invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !userModel || !invite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-rose-900/20 to-slate-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="bg-white rounded-3xl shadow-luxury border border-neutral-200/50 p-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-rose-500 to-rose-600 rounded-full shadow-glow-rose">
                <MessageCircle className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4">
              Invitation non trouvée
            </h2>
            
            <p className="text-slate-600 mb-6 leading-relaxed">
              {error || 'Cette invitation n\'existe pas ou a été supprimée.'}
            </p>
            
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-900 py-3 rounded-xl hover:from-amber-600 hover:via-amber-700 hover:to-amber-600 transition-all duration-500 font-semibold shadow-glow-amber hover:shadow-luxury transform hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5 inline mr-2" />
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  const IconComponent = getIconForCategory(userModel.category);
  const colors = userModel.colors || userModel.customizations?.colors || getColorScheme(userModel.category);

  const renderScreen = () => {
    switch (currentScreen) {
      case 0: // Écran 1: Photo de profil + animation + titre + info du guest
        return (
          <div className="flex flex-col items-center justify-center h-full text-center text-white space-y-8 p-6">
            {/* Animation d'entrée avec icône */}
            <div className="relative">
              <div className="relative">
                <IconComponent 
                  className="h-24 w-24 sm:h-32 sm:w-32 animate-glow drop-shadow-2xl transition-all duration-1000" 
                  style={{ color: colors.accent }} 
                />
                <div className="absolute inset-0 animate-ping">
                  <IconComponent 
                    className="h-24 w-24 sm:h-32 sm:w-32 opacity-30" 
                    style={{ color: colors.accent }} 
                  />
                </div>
              </div>
              
              {/* Particules flottantes */}
              <div className="absolute -top-4 -left-4">
                <Sparkles className="h-6 w-6 text-white animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-6">
                <Sparkles className="h-4 w-4 text-white animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
              <div className="absolute -bottom-4 -right-2">
                <Sparkles className="h-5 w-5 text-white animate-pulse" style={{ animationDelay: '1s' }} />
              </div>
            </div>

            {/* Ligne décorative animée */}
            <div className="flex items-center space-x-4">
              <div 
                className="w-16 h-px animate-pulse" 
                style={{ background: `linear-gradient(to right, transparent, ${colors.primary})` }}
              ></div>
              <Star className="h-4 w-4" style={{ color: colors.primary }} />
              <div 
                className="w-16 h-px animate-pulse" 
                style={{ background: `linear-gradient(to left, transparent, ${colors.primary})` }}
              ></div>
            </div>

            {/* Titre principal */}
            <div className="space-y-4">
              <h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-bold font-luxury drop-shadow-lg animate-fade-in" 
                style={{ color: colors.primary }}
              >
                {userModel.title}
              </h1>
              
              <div className="text-lg sm:text-xl text-neutral-200 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                Vous êtes cordialement invité(e)
              </div>
            </div>

            {/* Informations de l'invité avec animation */}
            <div 
              className="backdrop-blur-sm rounded-3xl p-8 border max-w-md mx-auto animate-slide-up shadow-2xl" 
              style={{ 
                background: `linear-gradient(135deg, ${colors.primary}40, ${colors.secondary}40)`,
                borderColor: `${colors.primary}30`,
                animationDelay: '0.6s'
              }}
            >
              <div className="flex items-center justify-center mb-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-2xl animate-glow"
                  style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                >
                  {invite.nom.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
              </div>
              
              <p className="text-2xl sm:text-3xl font-bold text-white mb-2">{invite.nom}</p>
              <div className="flex items-center justify-center space-x-2">
                <User className="h-5 w-5" style={{ color: colors.primary }} />
                <p className="text-lg" style={{ color: `${colors.primary}dd` }}>
                  {userModel.category === 'graduation' ? 'Place' : 'Table'} n° {invite.table || 'Non assigné'}
                </p>
              </div>
              
              {/* Badge du type d'invité */}
              <div className="mt-4">
                <span 
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
                  style={{ 
                    background: invite.etat === 'couple' 
                      ? `linear-gradient(135deg, ${colors.accent}, ${colors.primary})` 
                      : `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                    color: '#1e293b'
                  }}
                >
                  {invite.etat === 'couple' ? (
                    <>
                      <Heart className="h-4 w-4 mr-2" />
                      Invitation Couple (2 places)
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4 mr-2" />
                      Invitation Simple (1 place)
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        );

      case 1: // Écran 2: Texte d'invitation + date + heure + lieu
        return (
          <div className="flex flex-col justify-center h-full text-center text-white space-y-8 p-6">
            {/* Texte d'invitation */}
            <div 
              className="bg-black/40 backdrop-blur-sm rounded-3xl p-8 border max-w-2xl mx-auto animate-fade-in shadow-2xl" 
              style={{ borderColor: `${colors.primary}20` }}
            >
              <div className="flex justify-center mb-6">
                <MessageCircle 
                  className="h-12 w-12 animate-glow drop-shadow-lg" 
                  style={{ color: colors.primary }} 
                />
              </div>
              
              <p className="text-neutral-200 leading-relaxed text-lg sm:text-xl font-light">
                {userModel.invitationText}
              </p>
            </div>

            {/* Détails de l'événement avec animations */}
            <div className="space-y-6 max-w-lg mx-auto">
              <div 
                className="flex items-center justify-center text-neutral-200 text-xl sm:text-2xl animate-slide-up"
                style={{ animationDelay: '0.2s' }}
              >
                <div 
                  className="p-4 rounded-full mr-6 shadow-2xl animate-glow"
                  style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                >
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-2xl sm:text-3xl">{userModel.eventDate}</p>
                  <p className="text-lg sm:text-xl" style={{ color: `${colors.primary}dd` }}>
                    {userModel.eventTime}
                  </p>
                </div>
              </div>
              
              <div 
                className="flex items-center justify-center text-neutral-200 text-xl sm:text-2xl animate-slide-up"
                style={{ animationDelay: '0.4s' }}
              >
                <div 
                  className="p-4 rounded-full mr-6 shadow-2xl animate-glow"
                  style={{ background: `linear-gradient(135deg, ${colors.secondary}, ${colors.accent})` }}
                >
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-lg sm:text-xl font-semibold">{userModel.eventLocation}</p>
                </div>
              </div>
            </div>

            {/* Informations supplémentaires */}
            <div 
              className="backdrop-blur-sm rounded-2xl p-6 border max-w-md mx-auto animate-slide-up"
              style={{ 
                background: `linear-gradient(135deg, ${colors.primary}30, ${colors.secondary}30)`,
                borderColor: `${colors.primary}30`,
                animationDelay: '0.6s'
              }}
            >
              <div className="flex items-center justify-center mb-3">
                <Clock className="h-5 w-5 mr-2" style={{ color: colors.primary }} />
                <span className="text-lg font-semibold" style={{ color: `${colors.primary}cc` }}>
                  Informations importantes
                </span>
              </div>
              <p className="text-neutral-200 text-sm leading-relaxed">
                Merci de confirmer votre présence avant le {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        );

      case 2: // Écran 3: Confirmation + message
        return (
          <div className="flex flex-col justify-center h-full text-center text-white space-y-8 p-6">
            {/* Section de confirmation */}
            <div 
              className="backdrop-blur-sm rounded-3xl p-8 border max-w-md mx-auto animate-fade-in shadow-2xl" 
              style={{ 
                background: `linear-gradient(135deg, ${colors.primary}50, ${colors.secondary}50)`,
                borderColor: `${colors.primary}30`
              }}
            >
              <div className="flex justify-center mb-6">
                <div 
                  className="p-4 rounded-full shadow-2xl animate-glow"
                  style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                >
                  <Users className="h-12 w-12 text-white" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold mb-6" style={{ color: `${colors.primary}cc` }}>
                Confirmation de présence
              </h3>
              
              <button
                onClick={handleConfirmation}
                className="w-full py-5 rounded-2xl font-bold text-xl transition-all duration-500 transform hover:scale-105 shadow-2xl relative overflow-hidden group"
                style={{
                  background: isConfirmed 
                    ? 'linear-gradient(135deg, #10b981, #059669)' 
                    : `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                  color: isConfirmed ? 'white' : '#1e293b'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative flex items-center justify-center">
                  {isConfirmed ? (
                    <>
                      <Check className="h-6 w-6 mr-3" />
                      Présence confirmée ✨
                    </>
                  ) : (
                    <>
                      <Heart className="h-6 w-6 mr-3" />
                      Confirmer ma présence
                    </>
                  )}
                </span>
              </button>
            </div>

            {/* Sélection de boisson */}
            <div 
              className="backdrop-blur-sm rounded-3xl p-8 border max-w-md mx-auto animate-slide-up shadow-2xl" 
              style={{ 
                background: `linear-gradient(135deg, ${colors.primary}50, ${colors.secondary}50)`,
                borderColor: `${colors.primary}30`,
                animationDelay: '0.2s'
              }}
            >
              <div className="flex justify-center mb-6">
                <div 
                  className="p-4 rounded-full shadow-2xl animate-glow"
                  style={{ background: `linear-gradient(135deg, ${colors.secondary}, ${colors.accent})` }}
                >
                  <Wine className="h-12 w-12 text-white" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold mb-6" style={{ color: `${colors.primary}cc` }}>
                Choix de boisson
              </h3>
              
              <select
                value={selectedDrink}
                onChange={(e) => handleDrinkSelection(e.target.value)}
                className="w-full bg-slate-800/90 text-white border-2 rounded-2xl px-6 py-4 focus:ring-4 transition-all duration-300 text-lg font-medium shadow-inner"
                style={{ 
                  borderColor: `${colors.primary}40`,
                  focusRingColor: `${colors.primary}30`
                }}
              >
                <option value="">Sélectionnez votre boisson préférée</option>
                {userModel.drinkOptions.map((drink) => (
                  <option key={drink} value={drink}>{drink}</option>
                ))}
              </select>
              
              {selectedDrink && (
                <div 
                  className="mt-4 p-4 rounded-2xl animate-slide-up"
                  style={{ background: `linear-gradient(135deg, ${colors.accent}30, ${colors.primary}30)` }}
                >
                  <div className="flex items-center justify-center">
                    <Wine className="h-5 w-5 mr-2" style={{ color: colors.primary }} />
                    <span className="font-semibold" style={{ color: `${colors.primary}cc` }}>
                      Choix enregistré: {selectedDrink}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Livre d'or */}
            <div 
              className="backdrop-blur-sm rounded-3xl p-8 border max-w-lg mx-auto animate-slide-up shadow-2xl" 
              style={{ 
                background: `linear-gradient(135deg, ${colors.primary}50, ${colors.secondary}50)`,
                borderColor: `${colors.primary}30`,
                animationDelay: '0.4s'
              }}
            >
              <div className="flex justify-center mb-6">
                <div 
                  className="p-4 rounded-full shadow-2xl animate-glow"
                  style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.primary})` }}
                >
                  <MessageCircle className="h-12 w-12 text-white" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold mb-6" style={{ color: `${colors.primary}cc` }}>
                Livre d'or
              </h3>
              
              <textarea
                value={guestMessage}
                onChange={(e) => setGuestMessage(e.target.value)}
                placeholder="Laissez un message de vœux..."
                className="w-full bg-slate-800/90 text-white border-2 rounded-2xl px-6 py-4 focus:ring-4 transition-all duration-300 resize-none text-lg shadow-inner"
                rows={4}
                style={{ 
                  borderColor: `${colors.primary}40`,
                  focusRingColor: `${colors.primary}30`
                }}
              />
              
              <button 
                onClick={handleSendMessage}
                disabled={!guestMessage.trim()}
                className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-2xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-bold text-lg shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative flex items-center justify-center">
                  <Send className="h-6 w-6 mr-3" />
                  Envoyer le message
                </span>
              </button>
            </div>
          </div>
        );

      case 3: // Écran 4: QR Code
        return (
          <div className="flex flex-col items-center justify-center h-full text-center text-white space-y-8 p-6">
            {/* QR Code principal */}
            <div 
              className="backdrop-blur-sm rounded-3xl p-8 border max-w-sm mx-auto animate-fade-in shadow-2xl" 
              style={{ 
                background: `linear-gradient(135deg, ${colors.primary}50, ${colors.secondary}50)`,
                borderColor: `${colors.primary}30`
              }}
            >
              <div className="flex justify-center mb-6">
                <div 
                  className="p-4 rounded-full shadow-2xl animate-glow"
                  style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}
                >
                  <QrCode className="h-12 w-12 text-white" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold mb-6" style={{ color: `${colors.primary}cc` }}>
                Votre Code d'Accès
              </h3>
              
              {qrCodeDataUrl && (
                <div className="bg-white rounded-3xl p-8 mb-6 shadow-inner border-4 border-white/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Code" 
                    className="w-full max-w-[200px] mx-auto drop-shadow-2xl"
                  />
                </div>
              )}
              
              <p className="text-neutral-200 text-sm leading-relaxed mb-4">
                Présentez ce code QR à l'entrée de l'événement pour un accès rapide
              </p>
              
              <div 
                className="p-4 rounded-2xl animate-pulse"
                style={{ background: `linear-gradient(135deg, ${colors.accent}20, ${colors.primary}20)` }}
              >
                <div className="flex items-center justify-center">
                  <Sparkles className="h-5 w-5 mr-2" style={{ color: colors.primary }} />
                  <span className="font-semibold text-lg" style={{ color: `${colors.primary}cc` }}>
                    Code unique et sécurisé
                  </span>
                </div>
              </div>
            </div>

            {/* Résumé des informations */}
            <div 
              className="backdrop-blur-sm rounded-2xl p-6 border max-w-md mx-auto animate-slide-up shadow-xl"
              style={{ 
                background: `linear-gradient(135deg, ${colors.primary}30, ${colors.secondary}30)`,
                borderColor: `${colors.primary}30`,
                animationDelay: '0.3s'
              }}
            >
              <h4 className="text-lg font-bold mb-4" style={{ color: `${colors.primary}cc` }}>
                Résumé de votre réponse
              </h4>
              
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">Présence:</span>
                  <span 
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      isConfirmed 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-amber-500 text-slate-900'
                    }`}
                  >
                    {isConfirmed ? 'Confirmée' : 'En attente'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">Boisson:</span>
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-semibold"
                    style={{ 
                      background: selectedDrink ? `${colors.primary}` : '#6b7280',
                      color: selectedDrink ? '#1e293b' : 'white'
                    }}
                  >
                    {selectedDrink || 'Non sélectionnée'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">Message:</span>
                  <span 
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      guestMessage.trim() 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-neutral-500 text-white'
                    }`}
                  >
                    {guestMessage.trim() ? 'Envoyé' : 'Aucun'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background avec parallax */}
      <div className="absolute inset-0">
        <img
          src={userModel.backgroundImage}
          alt="Event Background"
          className="w-full h-full object-cover scale-110 transition-transform duration-1000"
          style={{ 
            transform: `scale(1.1) translateX(${currentScreen * -2}px)`,
            filter: 'blur(1px)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
        <div 
          className="absolute inset-0 transition-all duration-1000"
          style={{ 
            background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20, ${colors.accent}20)`
          }}
        ></div>
      </div>

      {/* Header fixe */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-white/80 hover:text-white transition-all duration-300 group backdrop-blur-sm bg-black/30 rounded-full px-4 py-2"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="hidden sm:block">Retour</span>
          </button>
          
          {/* Indicateur de progression */}
          <div className="flex items-center space-x-2 backdrop-blur-sm bg-black/30 rounded-full px-4 py-2">
            {screens.map((screen, index) => (
              <button
                key={screen.id}
                onClick={() => goToScreen(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentScreen 
                    ? 'scale-125 shadow-lg' 
                    : 'hover:scale-110'
                }`}
                style={{ 
                  backgroundColor: index === currentScreen ? colors.primary : 'rgba(255,255,255,0.4)'
                }}
              />
            ))}
          </div>
          
          <div className="text-white/80 text-sm backdrop-blur-sm bg-black/30 rounded-full px-4 py-2">
            {currentScreen + 1} / {screens.length}
          </div>
        </div>
      </div>

      {/* Contenu principal avec balayage */}
      <div 
        className="relative z-10 h-screen overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ 
            transform: `translateX(-${currentScreen * 100}%)`,
            width: `${screens.length * 100}%`
          }}
        >
          {screens.map((screen, index) => (
            <div 
              key={screen.id} 
              className="w-full h-full flex-shrink-0 relative"
              style={{ width: `${100 / screens.length}%` }}
            >
              <div className="h-full flex flex-col">
                {/* Titre de l'écran */}
                <div className="pt-24 pb-8 text-center">
                  <h2 
                    className="text-2xl sm:text-3xl font-bold mb-2 animate-fade-in"
                    style={{ color: colors.primary }}
                  >
                    {screen.title}
                  </h2>
                  <p className="text-white/80 text-lg animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    {screen.subtitle}
                  </p>
                </div>
                
                {/* Contenu de l'écran */}
                <div className="flex-1 flex items-center justify-center">
                  {index === currentScreen && renderScreen()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation en bas */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-6">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            onClick={prevScreen}
            disabled={currentScreen === 0 || isTransitioning}
            className="flex items-center justify-center w-14 h-14 rounded-full backdrop-blur-sm bg-black/40 text-white hover:bg-black/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-110 shadow-2xl"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Indicateur central avec titre */}
          <div className="text-center backdrop-blur-sm bg-black/30 rounded-2xl px-6 py-3">
            <p className="text-white font-semibold text-lg">
              {screens[currentScreen].title}
            </p>
            <p className="text-white/70 text-sm">
              Balayez pour naviguer
            </p>
          </div>

          <button
            onClick={nextScreen}
            disabled={currentScreen === screens.length - 1 || isTransitioning}
            className="flex items-center justify-center w-14 h-14 rounded-full backdrop-blur-sm bg-black/40 text-white hover:bg-black/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-110 shadow-2xl"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
        
        {/* Instructions de balayage */}
        <div className="text-center mt-4">
          <p className="text-white/60 text-sm backdrop-blur-sm bg-black/20 rounded-full px-4 py-2 inline-block">
            👆 Balayez horizontalement ou utilisez les flèches
          </p>
        </div>
      </div>

      {/* Effets de transition */}
      {isTransitioning && (
        <div className="absolute inset-0 z-30 pointer-events-none">
          <div 
            className="absolute inset-0 animate-pulse"
            style={{ 
              background: `linear-gradient(90deg, transparent, ${colors.primary}10, transparent)`
            }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default InvitationPreview;