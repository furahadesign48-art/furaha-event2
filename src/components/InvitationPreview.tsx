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
  Eye
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
  const [showQRInfo, setShowQRInfo] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

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
        
        // Utiliser la méthode globale pour récupérer l'invitation
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
        
        // Récupérer le modèle utilisateur associé
        console.log('Récupération des modèles pour l\'utilisateur:', inviteData.userId);
        const userModels = await UserModelService.getUserModels(inviteData.userId);
        console.log('Modèles utilisateur récupérés:', userModels);
        
        if (userModels.length > 0) {
          setUserModel(userModels[0]); // Prendre le premier modèle
          console.log('Modèle utilisateur défini:', userModels[0]);
          
          // Générer le QR code avec les informations de l'invité
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

  // Générer le QR code avec les informations de l'invité
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

  // Mettre à jour le QR code quand la boisson change
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
        // Déterminer le style basé sur le nom du modèle
        if (userModel?.name?.includes('Bohème') || userModel?.name?.includes('Nature')) {
          return {
            primary: '#10b981',
            secondary: '#059669',
            accent: '#14b8a6'
          };
        } else {
          return {
            primary: '#f59e0b',
            secondary: '#d97706',
            accent: '#f43f5e'
          };
        }
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
  // Utiliser les couleurs personnalisées si elles existent, sinon les couleurs par défaut
  const colors = userModel.colors || userModel.customizations?.colors || getColorScheme(userModel.category);
  
  // Déterminer le style du template (classique ou bohème)
  const isBohoStyle = userModel.name?.includes('Bohème') || userModel.name?.includes('Nature');

  return (
<div className="min-h-screen relative overflow-hidden">
  {/* Haut avec l'image nette (agrandie + overlay sombre) */}
  <div className="absolute top-0 left-0 w-full">
    <img
      src={userModel.backgroundImage}
      alt="Event Background"
      className="w-full object-cover 
                 h-[800px] sm:h-[900px] md:h-[1000px] lg:h-[1100px] 
                 scale-125"
    />
    {/* Overlay sombre fixe pour lisibilité */}
    <div className="absolute inset-0 bg-black/40"></div>
    {/* Gradient pour fondre avec le flou */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent"></div>
  </div>

  {/* Bas avec l'image floutée + overlay sombre */}
  <div className="absolute w-full top-[750px] sm:top-[850px] md:top-[950px] lg:top-[1050px] bottom-0 overflow-hidden">
    <img
      src={userModel.backgroundImage}
      alt="Event Background Blurred"
      className="w-full h-full object-cover blur-2xl scale-125"
    />
    {/* Overlay sombre pour lisibilité */}
    <div className="absolute inset-0 bg-black/60"></div>
  </div>


      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl mx-auto">
          <div className="text-center text-white space-y-6 sm:space-y-8">
            {/* Decorative Header - différent selon le style */}
            <div>
              {isBohoStyle ? (
                // Header bohème avec éléments naturels
                <div className="flex justify-center items-center mb-8">
                  <div className="relative">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                      <IconComponent 
                        className="h-16 w-16 sm:h-20 sm:w-20 animate-float drop-shadow-2xl" 
                        style={{ color: colors.primary }} 
                      />
                      <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                      <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '0.9s' }}></div>
                    </div>
                  </div>
                </div>
              ) : (
                // Header classique
                <div>
                  <div className="flex justify-center items-center mb-6">
                    <div className="relative">
                      <IconComponent 
                        className="h-16 w-16 sm:h-20 sm:w-20 animate-glow drop-shadow-2xl" 
                        style={{ color: colors.accent }} 
                      />
                      <div className="absolute inset-0 animate-ping">
                        <IconComponent 
                          className="h-16 w-16 sm:h-20 sm:w-20 opacity-30" 
                          style={{ color: colors.accent }} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className="w-32 sm:w-48 h-px mx-auto mb-6" 
                    style={{ 
                      background: `linear-gradient(to right, transparent, ${colors.primary}, transparent)` 
                    }}
                  ></div>
                  <div className="flex justify-center space-x-3 mb-6">
                    <Sparkles 
                      className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" 
                      style={{ color: colors.primary }} 
                    />
                    <Sparkles 
                      className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" 
                      style={{ color: colors.secondary, animationDelay: '0.5s' }} 
                    />
                    <Sparkles 
                      className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" 
                      style={{ color: colors.primary, animationDelay: '1s' }} 
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Title - style différent selon le template */}
            {isBohoStyle ? (
              <div className="mb-8">
                <div 
                  className="backdrop-blur-sm rounded-3xl p-6 sm:p-8 border max-w-lg mx-auto shadow-2xl" 
                  style={{ 
                    background: `linear-gradient(to right, ${colors.primary}30, ${colors.secondary}30)`,
                    borderColor: `${colors.primary}20`
                  }}
                >
                  <h1 
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold font-luxury drop-shadow-lg tracking-wide" 
                    style={{ color: colors.primary }}
                  >
                    {userModel.title}
                  </h1>
                  <div className="flex justify-center space-x-2 mt-4">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <div 
                      className="w-16 h-px mt-1" 
                      style={{ background: `linear-gradient(to right, transparent, ${colors.primary}, transparent)` }}
                    ></div>
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  </div>
                </div>
              </div>
            ) : (
              <h1 
                className="text-3xl sm:text-4xl lg:text-5xl font-bold font-luxury drop-shadow-lg" 
                style={{ color: colors.primary }}
              >
                {userModel.title}
              </h1>
            )}

            {/* Guest Info - style différent selon le template */}
            {isBohoStyle ? (
              <div 
                className="backdrop-blur-sm rounded-2xl p-6 sm:p-8 border max-w-md mx-auto shadow-xl" 
                style={{ 
                  background: `linear-gradient(to right, ${colors.secondary}40, ${colors.primary}40)`,
                  borderColor: `${colors.primary}40`
                }}
              >
                <div className="flex justify-center mb-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-emerald-300 rounded-full animate-float"></div>
                    <div className="w-2 h-2 bg-teal-300 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
                    <div className="w-2 h-2 bg-emerald-300 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
                  </div>
                </div>
                <p className="text-base sm:text-lg mb-3 tracking-wide" style={{ color: `${colors.primary}cc` }}>
                  Invité d'honneur
                </p>
                <p className="text-2xl sm:text-3xl font-semibold text-white tracking-wide">{invite.nom}</p>
                <div 
                  className="w-16 h-px mx-auto my-4" 
                  style={{ background: `linear-gradient(to right, transparent, ${colors.primary}, transparent)` }}
                ></div>
                <p className="text-base sm:text-lg tracking-wide" style={{ color: `${colors.primary}dd` }}>
                  {userModel.category === 'graduation' ? 'Place' : 'Table'} n° {invite.table || 'Non assigné'}
                </p>
              </div>
            ) : (
              <div 
                className="backdrop-blur-sm rounded-2xl p-6 sm:p-8 border max-w-md mx-auto" 
                style={{ 
                  background: `linear-gradient(to right, ${colors.primary}40, ${colors.secondary}40)`,
                  borderColor: `${colors.primary}30`
                }}
              >
                <p className="text-base sm:text-lg mb-3" style={{ color: `${colors.primary}cc` }}>Cher(e)</p>
                <p className="text-2xl sm:text-3xl font-semibold text-white">{invite.nom}</p>
                <p className="text-base sm:text-lg mt-3" style={{ color: `${colors.primary}dd` }}>
                  {userModel.category === 'graduation' ? 'Place' : 'Table'} n° {invite.table || 'Non assigné'}
                </p>
              </div>
            )}

            {/* Invitation Text - style différent selon le template */}
            {isBohoStyle ? (
              <div 
                className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border max-w-2xl mx-auto shadow-xl" 
                style={{ borderColor: `${colors.primary}20` }}
              >
                <div className="flex justify-center mb-4">
                  <div className="flex space-x-2">
                    <div className="w-1 h-1 bg-emerald-300 rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-teal-300 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                    <div className="w-1 h-1 bg-emerald-300 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                  </div>
                </div>
                <p className="text-neutral-100 leading-relaxed text-base sm:text-lg italic tracking-wide">
                  {userModel.invitationText}
                </p>
              </div>
            ) : (
              <div 
                className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border max-w-2xl mx-auto" 
                style={{ borderColor: `${colors.primary}20` }}
              >
                <p className="text-neutral-200 leading-relaxed text-base sm:text-lg">
                  {userModel.invitationText}
                </p>
              </div>
            )}

            {/* Event Details - style différent selon le template */}
            <div className="space-y-6 max-w-lg mx-auto">
              {isBohoStyle ? (
                // Style bohème avec cartes séparées
                <>
                  <div 
                    className="backdrop-blur-sm rounded-xl p-4 sm:p-6 border shadow-xl" 
                    style={{ 
                      background: `linear-gradient(to right, ${colors.primary}40, ${colors.secondary}40)`,
                      borderColor: `${colors.primary}30`
                    }}
                  >
                    <div className="flex items-center justify-center text-neutral-200">
                      <Calendar 
                        className="h-6 w-6 sm:h-7 sm:w-7 mr-4" 
                        style={{ color: colors.primary }} 
                      />
                      <div className="text-center">
                        <p className="font-bold text-lg sm:text-xl tracking-wide">{userModel.eventDate}</p>
                        <p className="text-base sm:text-lg tracking-wide" style={{ color: `${colors.primary}dd` }}>
                          {userModel.eventTime}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className="backdrop-blur-sm rounded-xl p-4 sm:p-6 border shadow-xl" 
                    style={{ 
                      background: `linear-gradient(to right, ${colors.secondary}40, ${colors.primary}40)`,
                      borderColor: `${colors.secondary}30`
                    }}
                  >
                    <div className="flex items-center justify-center text-neutral-200">
                      <MapPin 
                        className="h-6 w-6 sm:h-7 sm:w-7 mr-4" 
                        style={{ color: colors.secondary }} 
                      />
                      <p className="text-base sm:text-lg text-center tracking-wide">{userModel.eventLocation}</p>
                    </div>
                  </div>
                </>
              ) : (
                // Style classique
                <>
                  <div className="flex items-center justify-center text-neutral-200 text-lg sm:text-xl">
                    <Calendar 
                      className="h-6 w-6 sm:h-7 sm:w-7 mr-4" 
                      style={{ color: colors.primary }} 
                    />
                    <div className="text-left">
                      <p className="font-semibold text-lg sm:text-xl">{userModel.eventDate}</p>
                      <p className="text-base sm:text-lg" style={{ color: `${colors.primary}dd` }}>
                        {userModel.eventTime}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center text-neutral-200 text-lg sm:text-xl">
                    <MapPin 
                      className="h-6 w-6 sm:h-7 sm:w-7 mr-4" 
                      style={{ color: colors.primary }} 
                    />
                    <p className="text-base sm:text-lg text-center">{userModel.eventLocation}</p>
                  </div>
                </>
              )}
            </div>

            {/* RSVP Section - style différent selon le template */}
            <div 
              className={`backdrop-blur-sm rounded-2xl p-6 sm:p-8 border max-w-md mx-auto ${isBohoStyle ? 'shadow-2xl' : ''}`} 
              style={{ 
                background: `linear-gradient(to right, ${colors.primary}50, ${colors.secondary}50)`,
                borderColor: `${colors.primary}${isBohoStyle ? '40' : '30'}`
              }}
            >
              <h3 
                className={`font-semibold mb-6 flex items-center justify-center text-lg sm:text-xl ${isBohoStyle ? 'tracking-wide' : ''}`} 
                style={{ color: `${colors.primary}cc` }}
              >
                <Users className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                {isBohoStyle ? 'Confirmation Naturelle' : 'Confirmation de présence'}
              </h3>
              <button
                onClick={handleConfirmation}
                className={`w-full py-4 sm:py-5 font-semibold transition-all duration-300 transform hover:scale-105 text-lg sm:text-xl ${
                  isBohoStyle ? 'rounded-2xl tracking-wide' : 'rounded-xl'
                }`}
                style={{
                  background: isConfirmed 
                    ? 'linear-gradient(to right, #10b981, #059669)' 
                    : `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                  color: isConfirmed ? 'white' : '#1e293b',
                  boxShadow: isBohoStyle ? '0 20px 40px rgba(0,0,0,0.3)' : undefined
                }}
              >
                {isConfirmed ? (
                  <span className="flex items-center justify-center">
                    <Check className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                    {isBohoStyle ? 'Je serai présent(e)' : 'Présence confirmée'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    {isBohoStyle && <Heart className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />}
                    {isBohoStyle ? 'Confirmer ma Présence' : 'Confirmer ma présence'}
                  </span>
                )}
              </button>
            </div>

            {/* Drink Selection - style différent selon le template */}
            <div 
              className={`backdrop-blur-sm rounded-2xl p-6 sm:p-8 border max-w-md mx-auto ${isBohoStyle ? 'shadow-2xl' : ''}`} 
              style={{ 
                background: `linear-gradient(to right, ${colors.primary}50, ${colors.secondary}50)`,
                borderColor: `${colors.primary}${isBohoStyle ? '40' : '30'}`
              }}
            >
              <h3 
                className={`font-semibold mb-6 flex items-center justify-center text-lg sm:text-xl ${isBohoStyle ? 'tracking-wide' : ''}`} 
                style={{ color: `${colors.primary}cc` }}
              >
                <Wine className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                {isBohoStyle ? 'Sélection Bio' : 'Choix de boisson'}
              </h3>
              <select
                value={selectedDrink}
                onChange={(e) => handleDrinkSelection(e.target.value)}
                className={`w-full bg-slate-800/90 text-white border px-4 py-4 focus:ring-2 transition-all duration-200 text-base sm:text-lg font-medium ${
                  isBohoStyle ? 'rounded-2xl' : 'rounded-xl'
                }`}
                style={{ 
                  borderColor: `${colors.primary}${isBohoStyle ? '40' : '30'}`,
                  focusRingColor: colors.primary
                }}
              >
                <option value="">{isBohoStyle ? 'Choisissez votre nectar' : 'Sélectionnez votre boisson'}</option>
                {userModel.drinkOptions.map((drink) => (
                  <option key={drink} value={drink}>{drink}</option>
                ))}
              </select>
            </div>

            {/* Guest Book - style différent selon le template */}
            <div 
              className={`backdrop-blur-sm rounded-2xl p-6 sm:p-8 border max-w-lg mx-auto ${isBohoStyle ? 'shadow-2xl' : ''}`} 
              style={{ 
                background: `linear-gradient(to right, ${colors.primary}50, ${colors.secondary}50)`,
                borderColor: `${colors.primary}${isBohoStyle ? '40' : '30'}`
              }}
            >
              <h3 
                className={`font-semibold mb-6 flex items-center justify-center text-lg sm:text-xl ${isBohoStyle ? 'tracking-wide' : ''}`} 
                style={{ color: `${colors.primary}cc` }}
              >
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                {isBohoStyle ? 'Livre de Nature' : 'Livre d\'or'}
              </h3>
              <textarea
                value={guestMessage}
                onChange={(e) => setGuestMessage(e.target.value)}
                placeholder={isBohoStyle ? 'Partagez vos vœux authentiques...' : 'Laissez un message...'}
                className={`w-full bg-slate-800/90 text-white border px-4 py-4 focus:ring-2 transition-all duration-200 resize-none text-base sm:text-lg font-medium ${
                  isBohoStyle ? 'rounded-2xl' : 'rounded-xl'
                }`}
                rows={4}
                style={{ 
                  borderColor: `${colors.primary}${isBohoStyle ? '40' : '30'}`,
                  focusRingColor: colors.primary
                }}
              />
              <div className="mt-6 space-y-4">
                <button 
                  onClick={handleSendMessage}
                  className={`w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-semibold text-base sm:text-lg shadow-lg transform hover:scale-105 ${
                    isBohoStyle ? 'rounded-2xl font-bold shadow-2xl' : 'rounded-xl'
                  }`}
                >
                  {isBohoStyle ? (
                    <span className="flex items-center justify-center">
                      <Heart className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                      Partager mes Vœux
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                      Envoyer le message
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* QR Code Section - style différent selon le template */}
            {qrCodeDataUrl && (
              <div 
                className="backdrop-blur-sm rounded-3xl p-6 sm:p-8 border max-w-sm mx-auto shadow-2xl" 
                style={{ 
                  background: `linear-gradient(to right, ${colors.primary}50, ${colors.secondary}50)`,
                  borderColor: `${colors.primary}${isBohoStyle ? '40' : '30'}`
                }}
              >
                <h3 
                  className={`font-bold mb-6 flex items-center justify-center text-lg sm:text-xl tracking-wide ${isBohoStyle ? 'font-bold' : ''}`} 
                  style={{ color: `${colors.primary}cc` }}
                >
                  <div className="relative mr-3">
                    <QrCode className="h-6 w-6 sm:h-7 sm:w-7 drop-shadow-lg" />
                    <div className="absolute inset-0 animate-pulse opacity-30">
                      <QrCode className="h-6 w-6 sm:h-7 sm:w-7" />
                    </div>
                  </div>
                  {isBohoStyle ? 'Code Naturel' : 'Code d\'Invitation'}
                </h3>
                
                <div className={`bg-white p-6 mb-6 shadow-inner border-4 border-white/20 backdrop-blur-sm ${
                  isBohoStyle ? 'rounded-3xl' : 'rounded-2xl'
                }`}>
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Code" 
                    className="w-full max-w-[180px] sm:max-w-[200px] mx-auto drop-shadow-lg"
                  />
                </div>
                
                <button
                  onClick={() => setShowQRInfo(!showQRInfo)}
                  className={`w-full py-4 sm:py-5 text-base sm:text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                    isBohoStyle ? 'rounded-3xl shadow-2xl' : 'rounded-2xl'
                  }`}
                  style={{ 
                    background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                    color: '#1e293b',
                    boxShadow: `0 10px 25px ${colors.primary}30`
                  }}
                >
                  <div className="flex items-center justify-center">
                    <div className="relative mr-2">
                      {showQRInfo ? (
                        <X className="h-5 w-5 sm:h-6 sm:w-6" />
                      ) : (
                        <Eye className="h-5 w-5 sm:h-6 sm:w-6" />
                      )}
                    </div>
                    {showQRInfo ? 'Masquer les détails' : (isBohoStyle ? 'Découvrir les détails' : 'Voir les détails')}
                  </div>
                </button>
                
                {showQRInfo && (
                  <div className={`mt-6 bg-white/95 backdrop-blur-sm p-4 sm:p-6 animate-slide-up shadow-xl border border-white/30 ${
                    isBohoStyle ? 'rounded-3xl' : 'rounded-2xl'
                  }`}>
                    <div className="text-center mb-4">
                      <h4 className="font-bold text-slate-900 text-base sm:text-lg mb-2">
                        {isBohoStyle ? 'Informations Naturelles' : 'Informations QR Code'}
                      </h4>
                      <div 
                        className="w-16 h-px mx-auto" 
                        style={{ background: `linear-gradient(to right, transparent, ${colors.primary}, transparent)` }}
                      ></div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className={`flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200/50 shadow-sm ${
                        isBohoStyle ? 'rounded-2xl' : 'rounded-xl'
                      }`}>
                        <div className="flex items-center">
                          <User className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 mr-3" />
                          <span className="font-semibold text-slate-700 text-sm sm:text-base">Nom</span>
                        </div>
                        <span className="font-bold text-slate-900 text-sm sm:text-base">{invite.nom}</span>
                      </div>
                      
                      <div className={`flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200/50 shadow-sm ${
                        isBohoStyle ? 'rounded-2xl' : 'rounded-xl'
                      }`}>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 mr-3" />
                          <span className="font-semibold text-slate-700 text-sm sm:text-base">
                            {userModel.category === 'graduation' ? 'Place' : (isBohoStyle ? 'Espace' : 'Table')}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          {invite.table || 'Non assigné'}
                        </span>
                      </div>
                      
                      <div className={`flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200/50 shadow-sm ${
                        isBohoStyle ? 'rounded-2xl' : 'rounded-xl'
                      }`}>
                        <div className="flex items-center">
                          <Wine className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 mr-3" />
                          <span className="font-semibold text-slate-700 text-sm sm:text-base">
                            {isBohoStyle ? 'Nectar' : 'Boisson'}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          {selectedDrink || 'Non sélectionnée'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-200/50">
                      <p className="text-xs sm:text-sm text-slate-600 text-center leading-relaxed">
                        <span className="inline-flex items-center">
                          <Sparkles className="h-3 w-3 mr-1" style={{ color: colors.primary }} />
                          {isBohoStyle 
                            ? 'Scannez ce code pour une connexion authentique' 
                            : 'Scannez ce code pour accéder rapidement à vos informations'
                          }
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationPreview;