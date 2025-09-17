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
  Download,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { UserModelService, InviteService } from '../services/templateService';
import { UserModel, Invite } from '../services/templateService';

const InvitationPreview = () => {
  const { inviteId } = useParams<{ inviteId: string }>();
  const navigate = useNavigate();
  const [userModel, setUserModel] = useState<UserModel | null>(null);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [allGuestMessages, setAllGuestMessages] = useState<Array<{
    id: string;
    nom: string;
    message?: string;
    timestamp?: string;
  }>>([]);
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
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
          
          // Charger tous les messages des autres invités
          await loadAllGuestMessages(inviteData.userId);
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

  // Charger tous les messages des invités pour cet événement
  const loadAllGuestMessages = async (userId: string) => {
    try {
      const allInvites = await InviteService.getUserInvites(userId);
      
      // Récupérer les messages de tous les invités
      const messagesWithDetails = await Promise.all(
        allInvites.map(async (invite) => {
          try {
            const fullInviteData = await InviteService.getInvite(userId, invite.id);
            return {
              id: invite.id,
              nom: invite.nom,
              message: fullInviteData?.message || '',
              timestamp: fullInviteData?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
            };
          } catch (error) {
            console.error('Erreur lors du chargement du message pour:', invite.id);
            return {
              id: invite.id,
              nom: invite.nom,
              message: '',
              timestamp: new Date().toISOString()
            };
          }
        })
      );
      
      // Filtrer seulement les invités qui ont envoyé des messages
      const messagesWithContent = messagesWithDetails
        .filter(msg => msg.message && msg.message.trim())
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setAllGuestMessages(messagesWithContent);
    } catch (error) {
      console.error('Erreur lors du chargement des messages des invités:', error);
    }
  };
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
  
  const downloadQRCode = () => {
    if (!qrCodeDataUrl || !invite) return;
    
    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `qrcode-${invite.nom.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      // Recharger les messages après envoi
      await loadAllGuestMessages(userModel.userId);
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

  const nextMessage = () => {
    setCurrentMessageIndex((prev) => (prev + 1) % allGuestMessages.length);
  };

  const prevMessage = () => {
    setCurrentMessageIndex((prev) => (prev - 1 + allGuestMessages.length) % allGuestMessages.length);
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
  // Utiliser les couleurs personnalisées si elles existent, sinon les couleurs par défaut
  const colors = userModel.colors || userModel.customizations?.colors || getColorScheme(userModel.category);

  return (
<div className="min-h-screen relative overflow-hidden">
  {/* Haut avec l'image nette (agrandie + overlay sombre) */}
  <div className="absolute top-0 left-0 w-full">
    <img
      src={userModel.backgroundImage}
      alt="Event Background"
      className="w-full object-cover 
                 h-[600px] sm:h-[700px] md:h-[800px] lg:h-[900px] 
                 scale-110"
    />
    {/* Overlay sombre fixe pour lisibilité */}
    <div className="absolute inset-0 bg-black/40"></div>
    {/* Gradient pour fondre avec le flou */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent"></div>
  </div>

  {/* Bas avec l'image floutée + overlay sombre */}
  <div className="absolute w-full top-[550px] sm:top-[650px] md:top-[750px] lg:top-[850px] bottom-0 overflow-hidden">
 <img
  src={userModel.backgroundImage}
  alt="Event Background Blurred"
  className="w-full h-full object-cover scale-110"
  style={{ filter: 'blur(14px)' }} // Ajuste la valeur (ex: 10px, 15px, 18px)
 />


    {/* Overlay sombre pour lisibilité */}
    <div className="absolute inset-0 bg-black/60"></div>
  </div>


      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl mx-auto mt-32 sm:mt-40 md:mt-48 lg:mt-56">
          <div className="text-center text-white space-y-6 sm:space-y-8 animate-fade-in">
                  {/* Decorative Header */}
                  <div className="group hover:scale-105 transition-all duration-500 hover:drop-shadow-2xl">
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
                    className="text-3xl sm:text-4xl lg:text-5xl font-bold font-luxury drop-shadow-lg group hover:scale-105 hover:drop-shadow-2xl transition-all duration-500 cursor-default" 
                    style={{ color: colors.primary }}
                  >
                    {userModel.title}
                  </h1>

                 <div className="text-center text-white space-y-6 sm:space-y-8 mt-12 sm:mt-16 md:mt-20">
  {/* Guest Info Section */}
  <div 
    className="backdrop-blur-sm rounded-2xl p-6 sm:p-8 border max-w-md mx-auto group hover:scale-105 hover:backdrop-blur-md hover:shadow-2xl transition-all duration-500 hover:border-opacity-60" 
    style={{ 
      background: `linear-gradient(to right, ${colors.primary}40, ${colors.secondary}40)`,
      borderColor: `${colors.primary}30`
    }}
  >
    <p className="text-base sm:text-lg mb-3" style={{ color: `${colors.primary}cc` }}>Cher(e)</p>
    <p className="text-2xl sm:text-3xl font-semibold text-white">
  {invite.etat === "couple" && (
    <span className="text-lg font-normal mr-2">couple</span> )} {invite.nom}</p>
    <p className="text-base sm:text-lg mt-3" style={{ color: `${colors.primary}dd` }}>
      {userModel.category === 'graduation' ? 'Place' : 'Table'} n° {invite.table || 'Non assigné'}
    </p>
  </div>
</div>


                  {/* Invitation Text */}
                  <div 
                    className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border max-w-2xl mx-auto group hover:scale-105 hover:bg-black/40 hover:backdrop-blur-md hover:shadow-2xl transition-all duration-500 hover:border-opacity-60" 
                    style={{ borderColor: `${colors.primary}20` }}
                  >
                    <p className="text-neutral-200 leading-relaxed text-base sm:text-lg">
                      {userModel.invitationText}
                    </p>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-6 max-w-lg mx-auto group hover:scale-105 transition-all duration-500">
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
                    className="backdrop-blur-sm rounded-2xl p-6 sm:p-8 border max-w-md mx-auto group hover:scale-105 hover:backdrop-blur-md hover:shadow-2xl transition-all duration-500 hover:border-opacity-60" 
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
                      className="w-full py-4 sm:py-5 rounded-xl font-semibold transition-all duration-500 transform hover:scale-110 hover:shadow-2xl text-lg sm:text-xl group-hover:animate-pulse"
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
                    className="backdrop-blur-sm rounded-2xl p-6 sm:p-8 border max-w-md mx-auto group hover:scale-105 hover:backdrop-blur-md hover:shadow-2xl transition-all duration-500 hover:border-opacity-60" 
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
                      className="w-full bg-slate-800/80 text-white border rounded-xl px-4 py-4 focus:ring-2 transition-all duration-500 text-base sm:text-lg hover:bg-slate-700/90 hover:shadow-xl group-hover:scale-105"
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
                    className="backdrop-blur-sm rounded-2xl p-6 sm:p-8 border max-w-lg mx-auto group hover:scale-105 hover:backdrop-blur-md hover:shadow-2xl transition-all duration-500 hover:border-opacity-60" 
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
                      className="w-full bg-slate-800/80 text-white border rounded-xl px-4 py-4 focus:ring-2 transition-all duration-500 resize-none text-base sm:text-lg hover:bg-slate-700/90 hover:shadow-xl group-hover:scale-105"
                      rows={4}
                      style={{ 
                        borderColor: `${colors.primary}30`,
                        focusRingColor: colors.primary
                      }}
                    />
                    <div className="mt-6 space-y-4">
                      <button 
                        onClick={handleSendMessage}
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-500 font-semibold text-base sm:text-lg shadow-lg transform hover:scale-110 hover:shadow-2xl hover:animate-pulse"
                      >
                        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 inline mr-3" />
                        Envoyer le message
                      </button>
                      
                      {/* Bouton pour voir les messages des autres invités */}
                      {allGuestMessages.length > 0 && (
                        <button 
                          onClick={() => setShowAllMessages(true)}
                          className="w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-slate-900 py-4 rounded-xl hover:from-yellow-500 hover:via-amber-600 hover:to-yellow-700 transition-all duration-500 font-bold text-base sm:text-lg shadow-glow-amber transform hover:scale-110 hover:shadow-2xl relative overflow-hidden group border border-yellow-300/50"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                          <span className="relative flex items-center justify-center">
                          <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 inline mr-3" />
                          Lire les messages des invités ({allGuestMessages.length})
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* QR Code Section */}
                  {qrCodeDataUrl && (
                    <div 
                      className="backdrop-blur-sm rounded-3xl p-6 sm:p-8 border max-w-sm mx-auto shadow-2xl group hover:scale-105 hover:backdrop-blur-md hover:shadow-3xl transition-all duration-500 hover:border-opacity-60" 
                      style={{ 
                        background: `linear-gradient(to right, ${colors.primary}50, ${colors.secondary}50)`,
                        borderColor: `${colors.primary}30`
                      }}
                    >
                      <h3 
                        className="font-bold mb-6 flex items-center justify-center text-lg sm:text-xl tracking-wide" 
                        style={{ color: `${colors.primary}cc` }}
                      >
                        <div className="relative mr-3">
                          <QrCode className="h-6 w-6 sm:h-7 sm:w-7 drop-shadow-lg" />
                          <div className="absolute inset-0 animate-pulse opacity-30">
                            <QrCode className="h-6 w-6 sm:h-7 sm:w-7" />
                          </div>
                        </div>
                        Code d'Invitation
                      </h3>
                      
                      <div className="bg-white rounded-2xl p-6 mb-6 shadow-inner border-4 border-white/20 backdrop-blur-sm">
                        <img 
                          src={qrCodeDataUrl} 
                          alt="QR Code" 
                          className="w-full max-w-[180px] sm:max-w-[200px] mx-auto drop-shadow-lg"
                        />
                      </div>
                      
                      <button
                        onClick={downloadQRCode}
                        className="w-full py-4 sm:py-5 rounded-2xl text-base sm:text-lg font-bold transition-all duration-500 transform hover:scale-110 shadow-lg hover:shadow-2xl hover:animate-pulse group-hover:bg-opacity-90"
                        style={{ 
                          background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                          color: '#1e293b',
                          boxShadow: `0 10px 25px ${colors.primary}30`
                        }}
                      >
                        <div className="flex items-center justify-center">
                          <div className="relative mr-2">
                            <Download className="h-5 w-5 sm:h-6 sm:w-6" />
                          </div>
                          Télécharger QR Code
                        </div>
                      </button>
                    </div>
                  )}
          </div>
        </div>
      </div>
      
      {/* Modal pour afficher tous les messages des invités */}
      {showAllMessages && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-gradient-to-br from-white via-amber-50/30 to-yellow-50/20 rounded-3xl shadow-luxury max-w-2xl w-full max-h-[85vh] overflow-hidden animate-slide-up border border-amber-200/50 backdrop-blur-xl">
            {/* Header */}
            <div 
              className="p-6 border-b border-amber-200/50 relative overflow-hidden bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-100/80"
              style={{ 
                background: `linear-gradient(to right, ${colors.primary}15, ${colors.secondary}15, #fbbf2420)`
              }}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-300/20 to-yellow-300/20 rounded-full blur-xl"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-yellow-300/20 to-amber-300/20 rounded-full blur-xl"></div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="relative mr-4">
                    <BookOpen 
                      className="h-8 w-8 text-amber-600 animate-glow drop-shadow-lg" 
                    />
                    <div className="absolute inset-0 animate-pulse">
                      <BookOpen 
                        className="h-8 w-8 text-yellow-400 opacity-40" 
                      />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-800 via-yellow-700 to-amber-900 bg-clip-text text-transparent">
                      Messages des Invités
                    </h2>
                    <p className="text-amber-700/80">
                      {allGuestMessages.length} message{allGuestMessages.length > 1 ? 's' : ''} de vœux
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAllMessages(false)}
                  className="p-2 hover:bg-amber-100/50 rounded-xl transition-all duration-300 transform hover:scale-110"
                >
                  <X className="h-6 w-6 text-amber-600" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {allGuestMessages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-500 mb-2">Aucun message pour le moment</h3>
                  <p className="text-neutral-400">Soyez le premier à laisser un message de vœux !</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Navigation des messages */}
                  {allGuestMessages.length > 1 && (
                    <div className="flex items-center justify-between mb-6">
                      <button
                        onClick={prevMessage}
                        className="p-3 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 hover:from-amber-200 hover:to-yellow-200 transition-all duration-300 shadow-lg transform hover:scale-110 border border-amber-200/50"
                      >
                        <ChevronLeft className="h-5 w-5 text-amber-700" />
                      </button>
                      
                      <div className="text-center">
                        <p className="text-sm font-semibold text-amber-800">
                          Message {currentMessageIndex + 1} sur {allGuestMessages.length}
                        </p>
                        <div className="flex justify-center space-x-2 mt-2">
                          {allGuestMessages.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentMessageIndex(index)}
                              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                index === currentMessageIndex 
                                  ? 'w-6' 
                                  : 'hover:scale-125'
                              }`}
                              style={{ 
                                backgroundColor: index === currentMessageIndex ? '#f59e0b' : '#d1d5db'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <button
                        onClick={nextMessage}
                        className="p-3 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 hover:from-amber-200 hover:to-yellow-200 transition-all duration-300 shadow-lg transform hover:scale-110 border border-amber-200/50"
                      >
                        <ChevronRight className="h-5 w-5 text-amber-700" />
                      </button>
                    </div>
                  )}

                  {/* Message actuel */}
                  {allGuestMessages[currentMessageIndex] && (
                    <div 
                      className="rounded-2xl p-6 border shadow-luxury animate-slide-up bg-gradient-to-br from-white via-amber-50/20 to-yellow-50/10 backdrop-blur-sm"
                      style={{ 
                        borderColor: '#f59e0b30'
                      }}
                    >
                      <div className="flex items-center mb-4">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-glow-amber mr-4"
                          style={{ 
                            background: 'linear-gradient(to right, #f59e0b, #d97706)'
                          }}
                        >
                          {allGuestMessages[currentMessageIndex].nom.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold bg-gradient-to-r from-amber-800 to-amber-900 bg-clip-text text-transparent">
                            {allGuestMessages[currentMessageIndex].nom}
                          </h4>
                          <p className="text-sm text-amber-700/80">
                            {new Date(allGuestMessages[currentMessageIndex].timestamp || '').toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-white to-amber-50/30 rounded-xl p-4 border border-amber-200/50 shadow-lg backdrop-blur-sm">
                        <div className="flex items-center mb-3">
                          <MessageCircle 
                            className="h-4 w-4 mr-2 text-amber-600" 
                          />
                          <span className="text-sm font-semibold text-amber-800">Message de vœux</span>
                        </div>
                        <p className="text-slate-900 leading-relaxed whitespace-pre-wrap font-medium">
                          {allGuestMessages[currentMessageIndex].message}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Liste compacte de tous les messages */}
                  {allGuestMessages.length > 1 && (
                    <div className="mt-8">
                      <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                        <MessageCircle 
                          className="h-5 w-5 mr-2" 
                          style={{ color: colors.primary }}
                        />
                        Tous les messages
                      </h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {allGuestMessages.map((message, index) => (
                          <button
                            key={message.id}
                            onClick={() => setCurrentMessageIndex(index)}
                            className={`w-full text-left p-4 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                              index === currentMessageIndex
                                ? 'shadow-lg transform scale-105'
                                : 'hover:transform hover:scale-102'
                            }`}
                            style={{ 
                              background: index === currentMessageIndex 
                                ? `linear-gradient(to right, ${colors.primary}10, ${colors.secondary}10)`
                                : 'linear-gradient(to right, #f8fafc, #f1f5f9)',
                              borderColor: index === currentMessageIndex ? `${colors.primary}30` : '#e2e8f0'
                            }}
                          >
                            <div className="flex items-center mb-2">
                              <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md mr-3"
                                style={{ 
                                  background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`
                                }}
                              >
                                {message.nom.split(' ').map(n => n[0]).join('').substring(0, 2)}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 text-sm">{message.nom}</p>
                                <p className="text-xs text-slate-500">
                                  {new Date(message.timestamp || '').toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                            </div>
                            <p className="text-slate-700 text-sm leading-relaxed">
                              {message.message && message.message.length > 100 
                                ? `${message.message.substring(0, 100)}...`
                                : message.message}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div 
              className="p-6 border-t border-amber-200/50 bg-gradient-to-r from-amber-50/50 via-yellow-50/30 to-amber-50/50"
              style={{ 
                background: 'linear-gradient(to right, #f59e0b08, #d9770608, #fbbf2408)'
              }}
            >
              <button
                onClick={() => setShowAllMessages(false)}
                className="w-full py-3 rounded-xl font-bold transition-all duration-500 shadow-glow-amber transform hover:scale-105 relative overflow-hidden group border border-amber-300/50"
                style={{ 
                  background: 'linear-gradient(to right, #f59e0b, #d97706)',
                  color: '#1e293b'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative">
                Fermer
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitationPreview;