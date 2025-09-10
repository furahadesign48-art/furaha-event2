import React, { useState } from 'react';
import { Gift, Calendar, MapPin, Users, Cake, Camera, MessageCircle, QrCode, ArrowLeft, Check, Star, Sparkles, Music } from 'lucide-react';
import AuthModal from './AuthModal';
import { useTemplates } from '../hooks/useTemplates';
import { useAuth } from './AuthContext';

interface BirthdayTemplateProps {
  onBack: () => void;
  onSelectTemplate: (templateData: any) => void;
  isAuthenticated?: boolean;
}

const BirthdayTemplate = ({ onBack, onSelectTemplate, isAuthenticated }: BirthdayTemplateProps) => {
  const { createUserTemplate, isLoading } = useTemplates();
  const { user } = useAuth();
  const [selectedDrink, setSelectedDrink] = useState('');
  const [guestMessage, setGuestMessage] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showQRInfo, setShowQRInfo] = useState(false);

  const templateData = {
    id: 'birthday-celebration-premium',
    name: 'Anniversaire Celebration Premium',
    category: 'birthday',
    backgroundImage: 'https://images.pexels.com/photos/1729808/pexels-photo-1729808.jpeg?auto=compress&cs=tinysrgb&w=1200',
    title: 'Joyeux Anniversaire Marie !',
    invitationText: 'Venez célébrer avec moi cette journée spéciale ! Votre présence sera le plus beau des cadeaux pour marquer mes 25 ans dans la joie et la bonne humeur.',
    eventDate: '20 Juillet 2024',
    eventTime: '19h00',
    eventLocation: 'Restaurant Le Jardin Secret, Paris',
    drinkOptions: ['Cocktail Signature', 'Champagne', 'Vin Rouge', 'Vin Blanc', 'Jus de Fruits', 'Eau'],
    features: [
      'Photo de fond festive',
      'Titre personnalisable',
      'Texte d\'invitation modifiable',
      'Nom de l\'invité dynamique',
      'Numéro de table automatique',
      'Date et lieu de l\'événement',
      'Livre d\'or interactif',
      'Confirmation de présence',
      'Choix de boisson',
      'QR Code unique',
      'Galerie de souvenirs',
      'Vœux des invités'
    ]
  };

  const handleConfirmation = () => {
    setIsConfirmed(!isConfirmed);
  };

  const handleSelectTemplate = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    try {
      // Créer une copie du template dans Firestore
      const userTemplateId = await createUserTemplate(templateData, {
        guestData: {
          name: '[Nom de l\'invité]',
          tableNumber: '[Numéro de table]',
          qrCode: `BIRTH-${Date.now()}`,
          confirmation: 'pending',
          selectedDrink: '',
          message: ''
        }
      });

      if (userTemplateId) {
        // Créer l'objet pour le callback avec l'ID du nouveau template
        const personalizedTemplate = {
          ...templateData,
          id: userTemplateId,
          isPersonalized: true,
          createdAt: new Date().toISOString(),
          guestData: {
            name: '[Nom de l\'invité]',
            tableNumber: '[Numéro de table]'
          }
        };
        
        onSelectTemplate(personalizedTemplate);
      } else {
        alert('Erreur lors de la création du modèle personnalisé');
      }
    } catch (error) {
      console.error('Erreur lors de la sélection du template:', error);
      alert('Erreur lors de la création de votre modèle personnalisé');
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-r from-purple-500/10 to-purple-300/10 rounded-full blur-3xl animate-bounce-slow"></div>
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-gradient-to-r from-pink-400/10 to-purple-400/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center text-purple-400 hover:text-purple-300 transition-all duration-300 group"
            >
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Retour aux catégories
            </button>
            
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-purple-400 bg-clip-text text-transparent">
                Modèle Anniversaire Premium
              </h1>
              <p className="text-neutral-300 mt-2">Célébrez avec style et originalité</p>
            </div>

            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center text-purple-400 hover:text-purple-300 transition-all duration-300"
            >
              Aperçu
            </button>
          </div>
        </div>
                            
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Template Preview */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl shadow-luxury border border-purple-500/20 overflow-hidden">
              <div 
                className="relative h-96 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${templateData.backgroundImage})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6">
                  <div className="mb-6">
                    <div className="flex justify-center space-x-2 mb-4">
                      <Sparkles className="h-6 w-6 text-purple-400 animate-pulse" />
                      <Gift className="h-8 w-8 text-purple-300" />
                      <Sparkles className="h-6 w-6 text-purple-400 animate-pulse" />
                    </div>
                    
                    <div className="w-24 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent mx-auto mb-4"></div>
                    <div className="flex justify-center space-x-2 mb-4">
                      <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
                      <Music className="h-3 w-3 text-purple-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
                      <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" style={{ animationDelay: '1s' }} />
                    </div>
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-300 via-purple-200 to-purple-300 bg-clip-text text-transparent mb-6 font-luxury drop-shadow-lg">
                    {templateData.title}
                  </h1>

                  {/* Guest Info */}
                  <div className="bg-gradient-to-r from-purple-900/40 to-purple-800/40 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-purple-500/30">
                    <p className="text-purple-200 text-sm mb-2">Cher(e)</p>
                    <p className="text-xl font-semibold text-purple-100">[Nom de l'invité]</p>
                    <p className="text-purple-300 text-sm mt-2">Table n° [Numéro de table]</p>
                  </div>

                  {/* Invitation Text */}
                  <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-purple-500/20">
                    <p className="text-neutral-200 leading-relaxed text-sm">
                      {templateData.invitationText}
                    </p>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-center text-purple-200">
                      <Calendar className="h-5 w-5 mr-3 text-purple-400" />
                      <div className="text-left">
                        <p className="font-semibold">{templateData.eventDate}</p>
                        <p className="text-sm text-purple-300">{templateData.eventTime}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center text-purple-200">
                      <MapPin className="h-5 w-5 mr-3 text-purple-400" />
                      <p className="text-sm">{templateData.eventLocation}</p>
                    </div>
                  </div>

                  {/* RSVP Section */}
                  <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-purple-500/30">
                    <h3 className="text-purple-200 font-semibold mb-3 flex items-center justify-center">
                      <Users className="h-4 w-4 mr-2" />
                      Confirmation de présence
                    </h3>
                    <button
                      onClick={handleConfirmation}
                      className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                        isConfirmed
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-glow-purple'
                          : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-glow-purple'
                      }`}
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
                  <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-purple-500/30">
                    <h3 className="text-purple-200 font-semibold mb-3 flex items-center justify-center">
                      <Cake className="h-4 w-4 mr-2" />
                      Choix de boisson
                    </h3>
                    <select
                      value={selectedDrink}
                      onChange={(e) => setSelectedDrink(e.target.value)}
                      className="w-full bg-slate-800/80 text-purple-200 border border-purple-500/30 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    >
                      <option value="">Sélectionnez votre boisson</option>
                      {templateData.drinkOptions.map((drink) => (
                        <option key={drink} value={drink}>{drink}</option>
                      ))}
                    </select>
                  </div>

                  {/* Guest Book */}
                  <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-purple-500/30">
                    <h3 className="text-purple-200 font-semibold mb-3 flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Livre d'or
                    </h3>
                    <textarea
                      value={guestMessage}
                      onChange={(e) => setGuestMessage(e.target.value)}
                      placeholder="Laissez un message d'anniversaire..."
                      className="w-full bg-slate-800/80 text-purple-200 border border-purple-500/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 resize-none"
                      rows={3}
                    />
                    <div className="mt-3 space-y-2">
                      <button 
                        onClick={() => {
                          if (guestMessage.trim()) {
                            alert('Message envoyé avec succès !');
                            setGuestMessage('');
                          } else {
                            alert('Veuillez écrire un message avant d\'envoyer.');
                          }
                        }}
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-2 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-semibold text-sm shadow-lg transform hover:scale-105 relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <MessageCircle className="h-4 w-4 inline mr-2" />
                        Envoyer le message
                      </button>
                      <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 font-semibold text-sm">
                        <Camera className="h-4 w-4 inline mr-2" />
                        Ajouter une photo
                      </button>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-4 border border-purple-500/30">
                    <h3 className="text-purple-200 font-semibold mb-3 flex items-center justify-center">
                      <QrCode className="h-4 w-4 mr-2" />
                      QR Code Invité
                    </h3>
                    <div className="text-center">
                      <div 
                        className="bg-white rounded-xl p-4 inline-block cursor-pointer hover:scale-105 transition-transform duration-300"
                        onClick={() => setShowQRInfo(!showQRInfo)}
                      >
                        <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center">
                          <QrCode className="h-12 w-12 text-purple-400" />
                        </div>
                      </div>
                      
                      <p className="text-center mt-3 text-purple-300 text-xs">
                        Cliquez pour scanner
                      </p>
                      
                      {showQRInfo && (
                        <div className="mt-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 animate-slide-up">
                          <div className="text-center mb-3">
                            <h4 className="font-bold text-slate-900 text-sm">Informations Invité</h4>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                              <span className="font-medium text-slate-700">Nom:</span>
                              <span className="font-bold text-slate-900">[Nom de l'invité]</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                              <span className="font-medium text-slate-700">Table:</span>
                              <span className="font-bold text-slate-900">[Numéro de table]</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                              <span className="font-medium text-slate-700">Boisson:</span>
                              <span className="font-bold text-slate-900">{selectedDrink || 'Non sélectionnée'}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                              <span className="font-medium text-slate-700">Code:</span>
                              <span className="font-bold text-slate-900 font-mono">BIRTH-2024-001</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowQRInfo(false);
                            }}
                            className="w-full mt-3 bg-slate-600 text-white py-1 rounded-lg hover:bg-slate-700 transition-all duration-300 text-xs font-medium"
                          >
                            Fermer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Template Information */}
            <div className="animate-slide-up">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl shadow-luxury border border-purple-500/20 p-8">
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow-glow-purple">
                      <Gift className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent mb-2">
                    Anniversaire Premium
                  </h2>
                  <p className="text-neutral-300">Célébrez chaque année avec style</p>
                </div>

                {/* Features */}
                <div className="mb-8">
                  <h3 className="text-purple-400 font-semibold mb-4">Fonctionnalités incluses</h3>
                  <div className="space-y-3">
                    {templateData.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-neutral-300">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mr-3 flex-shrink-0 animate-pulse"></div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Template Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-2xl p-4 border border-purple-500/20">
                    <div className="text-2xl font-bold text-purple-400">Premium</div>
                    <div className="text-neutral-400 text-sm">Qualité</div>
                  </div>
                  <div className="text-center bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-2xl p-4 border border-purple-500/20">
                    <div className="text-2xl font-bold text-purple-400">12+</div>
                    <div className="text-neutral-400 text-sm">Fonctionnalités</div>
                  </div>
                  <div className="text-center bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-2xl p-4 border border-purple-500/20">
                    <div className="text-2xl font-bold text-purple-400">100%</div>
                    <div className="text-neutral-400 text-sm">Personnalisable</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <button
                    onClick={handleSelectTemplate}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-500 via-purple-600 to-purple-500 text-white py-4 rounded-2xl hover:from-purple-600 hover:via-purple-700 hover:to-purple-600 transition-all duration-500 font-bold text-lg shadow-glow-purple hover:shadow-luxury transform hover:scale-105 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <span className="relative flex items-center justify-center">
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Création en cours...
                        </>
                      ) : (
                        <>
                          <Gift className="h-5 w-5 mr-2" />
                          Choisir ce modèle
                        </>
                      )}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="w-full bg-transparent border-2 border-purple-500 text-purple-400 py-3 rounded-2xl hover:bg-purple-500 hover:text-white transition-all duration-500 font-semibold transform hover:scale-105"
                  >
                    Prévisualisation complète
                  </button>
                </div>

                {/* Template Description */}
                <div className="mt-8 p-6 bg-gradient-to-r from-purple-900/20 to-purple-800/20 rounded-2xl border border-purple-500/20">
                  <h4 className="text-purple-400 font-semibold mb-3">À propos de ce modèle</h4>
                  <p className="text-neutral-300 text-sm leading-relaxed">
                    Ce modèle premium d'anniversaire combine festivité et élégance pour créer une invitation 
                    mémorable. Avec son design coloré et ses fonctionnalités interactives, il offre une 
                    expérience complète pour célébrer cette journée spéciale avec vos proches.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal d'authentification */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default BirthdayTemplate;