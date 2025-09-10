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
        
        // Extraire l'ID utilisateur de l'ID d'invitation (format: invite_timestamp_randomstring)
        // Pour cet exemple, nous devrons chercher dans toutes les collections d'utilisateurs
        // ou avoir une structure différente. Pour l'instant, utilisons un ID utilisateur fixe
        // En production, vous devriez avoir une collection globale d'invitations avec userId
        
        // Simulation de récupération - à adapter selon votre structure de données
        const userId = 'user123'; // À remplacer par la vraie logique
        
        const inviteData = await InviteService.getInvite(userId, inviteId);
        if (!inviteData) {
          setError('Invitation non trouvée');
          setIsLoading(false);
          return;
        }
        
        setInvite(inviteData);
        setIsConfirmed(inviteData.confirmed);
        
        // Récupérer le modèle utilisateur associé
        const userModels = await UserModelService.getUserModels(userId);
        if (userModels.length > 0) {
          setUserModel(userModels[0]); // Prendre le premier modèle
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
      await InviteService.updateInvite(userModel.userId, invite.id, {
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
      await InviteService.updateInvite(userModel.userId, invite.id, {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900/20 to-slate-800 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-r from-amber-400/10 to-rose-400/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-r from-amber-500/10 to-amber-300/10 rounded-full blur-3xl animate-bounce-slow"></div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-md mx-auto">
          {/* Mobile Frame */}
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-4 shadow-luxury border border-amber-500/30">
            <div className="relative bg-black rounded-[2rem] overflow-hidden shadow-inner">
              {/* Status Bar */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 h-6 flex items-center justify-between px-6 text-amber-400 text-xs">
                <span>9:41</span>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-amber-400 rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  <div className="w-1 h-1 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                </div>
              </div>
              
              {/* Invitation Content */}
              <div className="relative h-[700px] overflow-y-auto">
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={userModel.backgroundImage}
                    alt="Event Background"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80"></div>
                  <div 
                    className="absolute inset-0" 
                    style={{ 
                      background: `linear-gradient(to right, ${colors.primary}20, transparent, ${colors.primary}20)` 
                    }}
                  ></div>
                </div>

                {/* Content */}
                <div className="relative z-10 p-6 text-center text-white">
                  {/* Decorative Header */}
                  <div className="mb-6">
                    <div className="flex justify-center items-center mb-4">
                      <div className="relative">
                        <IconComponent 
                          className="h-12 w-12 animate-glow drop-shadow-2xl" 
                          style={{ color: colors.accent }} 
                        />
                        <div className="absolute inset-0 animate-ping">
                          <IconComponent 
                            className="h-12 w-12 opacity-30" 
                            style={{ color: colors.accent }} 
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className="w-24 h-px mx-auto mb-4" 
                      style={{ 
                        background: `linear-gradient(to right, transparent, ${colors.primary}, transparent)` 
                      }}
                    ></div>
                    <div className="flex justify-center space-x-2 mb-4">
                      <Sparkles 
                        className="h-4 w-4 animate-pulse" 
                        style={{ color: colors.primary }} 
                      />
                      <Sparkles 
                        className="h-3 w-3 animate-pulse" 
                        style={{ color: colors.secondary, animationDelay: '0.5s' }} 
                      />
                      <Sparkles 
                        className="h-4 w-4 animate-pulse" 
                        style={{ color: colors.primary, animationDelay: '1s' }} 
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <h1 
                    className="text-2xl font-bold mb-6 font-luxury drop-shadow-lg" 
                    style={{ color: colors.primary }}
                  >
                    {userModel.title}
                  </h1>

                  {/* Guest Info */}
                  <div 
                    className="backdrop-blur-sm rounded-2xl p-4 mb-6 border" 
                    style={{ 
                      background: `linear-gradient(to right, ${colors.primary}40, ${colors.secondary}40)`,
                      borderColor: `${colors.primary}30`
                    }}
                  >
                    <p className="text-sm mb-2" style={{ color: `${colors.primary}cc` }}>Cher(e)</p>
                    <p className="text-xl font-semibold text-white">{invite.nom}</p>
                    <p className="text-sm mt-2" style={{ color: `${colors.primary}dd` }}>
                      {userModel.category === 'graduation' ? 'Place' : 'Table'} n° {invite.table || 'Non assigné'}
                    </p>
                  </div>

                  {/* Invitation Text */}
                  <div 
                    className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 mb-6 border" 
                    style={{ borderColor: `${colors.primary}20` }}
                  >
                    <p className="text-neutral-200 leading-relaxed text-sm">
                      {userModel.invitationText}
                    </p>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-center text-neutral-200">
                      <Calendar 
                        className="h-5 w-5 mr-3" 
                        style={{ color: colors.primary }} 
                      />
                      <div className="text-left">
                        <p className="font-semibold">{userModel.eventDate}</p>
                        <p className="text-sm" style={{ color: `${colors.primary}dd` }}>
                          {userModel.eventTime}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center text-neutral-200">
                      <MapPin 
                        className="h-5 w-5 mr-3" 
                        style={{ color: colors.primary }} 
                      />
                      <p className="text-sm">{userModel.eventLocation}</p>
                    </div>
                  </div>

                  {/* RSVP Section */}
                  <div 
                    className="backdrop-blur-sm rounded-2xl p-4 mb-4 border" 
                    style={{ 
                      background: `linear-gradient(to right, ${colors.primary}50, ${colors.secondary}50)`,
                      borderColor: `${colors.primary}30`
                    }}
                  >
                    <h3 
                      className="font-semibold mb-3 flex items-center justify-center" 
                      style={{ color: `${colors.primary}cc` }}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Confirmation de présence
                    </h3>
                    <button
                      onClick={handleConfirmation}
                      className="w-full py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                      style={{
                        background: isConfirmed 
                          ? 'linear-gradient(to right, #10b981, #059669)' 
                          : `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                        color: isConfirmed ? 'white' : '#1e293b'
                      }}
                    >
                      {isConfirmed ? (
                        <span className="flex items-center justify-center">
                          <Check className="h-4 w-4 mr-2" />
                          Présence confirmée
                        </span>
                      ) : (
                        'Confirmer ma présence'
                      )}
                    </button>
                  </div>

                  {/* Drink Selection */}
                  <div 
                    className="backdrop-blur-sm rounded-2xl p-4 mb-4 border" 
                    style={{ 
                      background: `linear-gradient(to right, ${colors.primary}50, ${colors.secondary}50)`,
                      borderColor: `${colors.primary}30`
                    }}
                  >
                    <h3 
                      className="font-semibold mb-3 flex items-center justify-center" 
                      style={{ color: `${colors.primary}cc` }}
                    >
                      <Wine className="h-4 w-4 mr-2" />
                      Choix de boisson
                    </h3>
                    <select
                      value={selectedDrink}
                      onChange={(e) => handleDrinkSelection(e.target.value)}
                      className="w-full bg-slate-800/80 text-white border rounded-xl px-4 py-2 focus:ring-2 transition-all duration-200"
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
                    className="backdrop-blur-sm rounded-2xl p-4 mb-4 border" 
                    style={{ 
                      background: `linear-gradient(to right, ${colors.primary}50, ${colors.secondary}50)`,
                      borderColor: `${colors.primary}30`
                    }}
                  >
                    <h3 
                      className="font-semibold mb-3 flex items-center justify-center" 
                      style={{ color: `${colors.primary}cc` }}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Livre d'or
                    </h3>
                    <textarea
                      value={guestMessage}
                      onChange={(e) => setGuestMessage(e.target.value)}
                      placeholder="Laissez un message..."
                      className="w-full bg-slate-800/80 text-white border rounded-xl px-4 py-3 focus:ring-2 transition-all duration-200 resize-none"
                      rows={3}
                      style={{ 
                        borderColor: `${colors.primary}30`,
                        focusRingColor: colors.primary
                      }}
                    />
                    <div className="mt-3 space-y-2">
                      <button 
                        onClick={handleSendMessage}
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-2 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-semibold text-sm shadow-lg transform hover:scale-105"
                      >
                        <MessageCircle className="h-4 w-4 inline mr-2" />
                        Envoyer le message
                      </button>
                      <button 
                        className="w-full py-2 rounded-xl text-sm font-semibold transition-all duration-300"
                        style={{ 
                          background: `linear-gradient(to right, ${colors.secondary}, ${colors.primary})`,
                          color: '#1e293b'
                        }}
                      >
                        <Camera className="h-4 w-4 inline mr-2" />
                        Ajouter une photo
                      </button>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div 
                    className="backdrop-blur-sm rounded-2xl p-4 border" 
                    style={{ 
                      background: `linear-gradient(to right, ${colors.primary}50, ${colors.secondary}50)`,
                      borderColor: `${colors.primary}30`
                    }}
                  >
                    <h3 
                      className="font-semibold mb-3 flex items-center justify-center" 
                      style={{ color: `${colors.primary}cc` }}
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      QR Code Invité
                    </h3>
                    <div className="bg-white rounded-xl p-4 inline-block">
                      <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center">
                        <QrCode 
                          className="h-12 w-12" 
                          style={{ color: colors.primary }} 
                        />
                      </div>
                    </div>
                    <p 
                      className="text-xs mt-2" 
                      style={{ color: `${colors.primary}dd` }}
                    >
                      Code unique: {invite.id.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationPreview;