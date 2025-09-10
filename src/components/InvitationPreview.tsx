import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  GraduationCap
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
  const colors = userModel.customizations?.colors || getColorScheme(userModel.category);

  return (
<div className="min-h-screen relative overflow-hidden">
  {/* Haut avec l’image nette (agrandie + overlay sombre) */}
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

  {/* Bas avec l’image floutée + overlay sombre */}
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
                  {/* Decorative Header */}
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

                  {/* Title */}
                  <h1 
                    className="text-3xl sm:text-4xl lg:text-5xl font-bold font-luxury drop-shadow-lg" 
                    style={{ color: colors.primary }}
                  >
                    {userModel.title}
                  </h1>

                  {/* Guest Info */}
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

                  {/* Invitation Text */}
                  <div 
                    className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border max-w-2xl mx-auto" 
                    style={{ borderColor: `${colors.primary}20` }}
                  >
                    <p className="text-neutral-200 leading-relaxed text-base sm:text-lg">
                      {userModel.invitationText}
                    </p>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-6 max-w-lg mx-auto">
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
                  </div>

                  {/* RSVP Section */}
                  <div 
                    className="backdrop-blur-sm rounded-2xl p-6 sm:p-8 border max-w-md mx-auto" 
                    style={{ 
                      background: `linear-gradient(to right, ${colors.primary}50, ${colors.secondary}50)`,
                      borderColor: `${colors.primary}30`
                    }}
                  >
                    <h3 
                      className="font-semibold mb-6 flex items-center justify-center text-lg sm:text-xl" 
                      style={{ color: `${colors.primary}cc` }}
                    >
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                      Confirmation de présence
                    </h3>
                    <button
                      onClick={handleConfirmation}
                      className="w-full py-4 sm:py-5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-lg sm:text-xl"
                      style={{
                        background: isConfirmed 
                          ? 'linear-gradient(to right, #10b981, #059669)' 
                          : `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                        color: isConfirmed ? 'white' : '#1e293b'
                      }}
                    >
                      {isConfirmed ? (
                        <span className="flex items-center justify-center">
                          <Check className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                          Présence confirmée
                        </span>
                      ) : (
                        'Confirmer ma présence'
                      )}
                    </button>
                  </div>

                  {/* Drink Selection */}
                  <div 
                    className="backdrop-blur-sm rounded-2xl p-6 sm:p-8 border max-w-md mx-auto" 
                    style={{ 
                      background: `linear-gradient(to right, ${colors.primary}50, ${colors.secondary}50)`,
                      borderColor: `${colors.primary}30`
                    }}
                  >
                    <h3 
                      className="font-semibold mb-6 flex items-center justify-center text-lg sm:text-xl" 
                      style={{ color: `${colors.primary}cc` }}
                    >
                      <Wine className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                      Choix de boisson
                    </h3>
                    <select
                      value={selectedDrink}
                      onChange={(e) => handleDrinkSelection(e.target.value)}
                      className="w-full bg-slate-800/80 text-white border rounded-xl px-4 py-4 focus:ring-2 transition-all duration-200 text-base sm:text-lg"
                      style={{ 
                        borderColor: `${colors.primary}30`,
                        focusRingColor: colors.primary
                      }}
                    >
                      <option value="">Sélectionnez votre boisson</option>
                      {userModel.drinkOptions.map((drink) => (
                        <option key={drink} value={drink}>{drink}</option>
                      ))}
                    </select>
                  </div>

                  {/* Guest Book */}
                  <div 
                    className="backdrop-blur-sm rounded-2xl p-6 sm:p-8 border max-w-lg mx-auto" 
                    style={{ 
                      background: `linear-gradient(to right, ${colors.primary}50, ${colors.secondary}50)`,
                      borderColor: `${colors.primary}30`
                    }}
                  >
                    <h3 
                      className="font-semibold mb-6 flex items-center justify-center text-lg sm:text-xl" 
                      style={{ color: `${colors.primary}cc` }}
                    >
                      <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                      Livre d'or
                    </h3>
                    <textarea
                      value={guestMessage}
                      onChange={(e) => setGuestMessage(e.target.value)}
                      placeholder="Laissez un message..."
                      className="w-full bg-slate-800/80 text-white border rounded-xl px-4 py-4 focus:ring-2 transition-all duration-200 resize-none text-base sm:text-lg"
                      rows={4}
                      style={{ 
                        borderColor: `${colors.primary}30`,
                        focusRingColor: colors.primary
                      }}
                    />
                    <div className="mt-6 space-y-4">
                      <button 
                        onClick={handleSendMessage}
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-semibold text-base sm:text-lg shadow-lg transform hover:scale-105"
                      >
                        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 inline mr-3" />
                        Envoyer le message
                      </button>
                      <button 
                        className="w-full py-4 rounded-xl text-base sm:text-lg font-semibold transition-all duration-300"
                        style={{ 
                          background: `linear-gradient(to right, ${colors.secondary}, ${colors.primary})`,
                          color: '#1e293b'
                        }}
                      >
                        <Camera className="h-5 w-5 sm:h-6 sm:w-6 inline mr-3" />
                        Ajouter une photo
                      </button>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div 
                    className="backdrop-blur-sm rounded-2xl p-6 sm:p-8 border max-w-sm mx-auto" 
                    style={{ 
                      background: `linear-gradient(to right, ${colors.primary}50, ${colors.secondary}50)`,
                      borderColor: `${colors.primary}30`
                    }}
                  >
                    <h3 
                      className="font-semibold mb-6 flex items-center justify-center text-lg sm:text-xl" 
                      style={{ color: `${colors.primary}cc` }}
                    >
                      <QrCode className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                      QR Code Invité
                    </h3>
                    <div className="bg-white rounded-xl p-6 inline-block">
                      <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center">
                        <QrCode 
                          className="h-16 w-16 sm:h-20 sm:w-20" 
                          style={{ color: colors.primary }} 
                        />
                      </div>
                    </div>
                    <p 
                      className="text-sm sm:text-base mt-4" 
                      style={{ color: `${colors.primary}dd` }}
                    >
                      Code unique: {invite.id.toUpperCase()}
                    </p>
                  </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationPreview;