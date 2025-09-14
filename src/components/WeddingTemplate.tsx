import React, { useState } from 'react';
import { Heart, Calendar, MapPin, Users, Wine, Camera, MessageCircle, QrCode, ArrowLeft, Check, Star, Sparkles, User, Eye, ChevronLeft, ChevronRight, Flower2, Crown } from 'lucide-react';
import AuthModal from './AuthModal';
import { useTemplates } from '../hooks/useTemplates';
import { useAuth } from './AuthContext';

interface WeddingTemplateProps {
  onBack: () => void;
  onSelectTemplate: (templateData: any) => void;
  isAuthenticated?: boolean;
}

const WeddingTemplate = ({ onBack, onSelectTemplate, isAuthenticated }: WeddingTemplateProps) => {
  const { createUserTemplate, isLoading } = useTemplates();
  const { user } = useAuth();
  const [selectedDrink, setSelectedDrink] = useState('');
  const [guestMessage, setGuestMessage] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showQRInfo, setShowQRInfo] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(0);

  const templates = [
    {
    id: 'wedding-gold-premium',
    name: 'Mariage Gold Premium',
    category: 'wedding',
    backgroundImage: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=1200',
    title: 'Mariage de Sophie & Lucas',
    invitationText: 'Nous avons l\'honneur de vous inviter à célébrer notre union dans la joie et l\'amour. Votre présence sera le plus beau des cadeaux pour ce jour si spécial.',
    eventDate: '15 Juin 2024',
    eventTime: '16h00',
    eventLocation: 'Château de Versailles, Versailles',
    drinkOptions: ['Champagne', 'Vin Rouge', 'Vin Blanc', 'Cocktail Sans Alcool', 'Eau'],
    features: [
      'Photo de fond romantique',
      'Titre personnalisable',
      'Texte d\'invitation modifiable',
      'Nom de l\'invité dynamique',
      'Numéro de table automatique',
      'Date et lieu de l\'événement',
      'Livre d\'or interactif',
      'Confirmation de présence',
      'Choix de boisson',
      'QR Code unique'
    ]
    },
    {
      id: 'wedding-royal-elegance',
      name: 'Mariage Royal Elegance',
      category: 'wedding',
      backgroundImage: 'https://images.pexels.com/photos/1488482/pexels-photo-1488482.jpeg?auto=compress&cs=tinysrgb&w=1200',
      title: 'Sophie & Lucas',
      invitationText: 'Avec une immense joie, nous vous invitons à partager le plus beau jour de notre vie. Votre présence illuminera cette journée magique où deux cœurs ne feront plus qu\'un.',
      eventDate: '15 Juin 2024',
      eventTime: '16h00',
      eventLocation: 'Domaine de Chantilly, Chantilly',
      drinkOptions: ['Champagne Rosé', 'Vin de Bordeaux', 'Vin de Loire', 'Cocktail Royal', 'Eau de Source'],
      features: [
        'Design royal sophistiqué',
        'Animations élégantes',
        'Typographie luxury',
        'Nom de l\'invité en or',
        'Numéro de table royal',
        'Détails événement premium',
        'Livre d\'or royal',
        'Confirmation VIP',
        'Sélection boissons premium',
        'QR Code doré',
        'Galerie photos',
        'Messages personnalisés'
      ]
    }
  ];

  const templateData = templates[currentTemplate];

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
          qrCode: `WED-${Date.now()}`,
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

  const nextTemplate = () => {
    setCurrentTemplate((prev) => (prev + 1) % templates.length);
  };

  const prevTemplate = () => {
    setCurrentTemplate((prev) => (prev - 1 + templates.length) % templates.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900/20 to-slate-800 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-r from-amber-400/10 to-rose-400/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-r from-amber-500/10 to-amber-300/10 rounded-full blur-3xl animate-bounce-slow"></div>
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-gradient-to-r from-rose-400/10 to-amber-400/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center text-amber-400 hover:text-amber-300 transition-all duration-300 group"
            >
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Retour aux catégories
            </button>
            
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 bg-clip-text text-transparent">
                Modèles Mariage Premium
              </h1>
              <p className="text-neutral-300 mt-2">
                {currentTemplate === 0 ? 'Élégance et romantisme pour votre jour J' : 'Sophistication royale pour votre union'}
              </p>
              <div className="flex justify-center items-center mt-4 space-x-4">
                <button
                  onClick={prevTemplate}
                  className="p-2 bg-amber-500/20 hover:bg-amber-500/30 rounded-full transition-all duration-300 transform hover:scale-110"
                >
                  <ChevronLeft className="h-5 w-5 text-amber-400" />
                </button>
                <div className="flex space-x-2">
                  {templates.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTemplate(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentTemplate ? 'bg-amber-400' : 'bg-amber-400/30'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextTemplate}
                  className="p-2 bg-amber-500/20 hover:bg-amber-500/30 rounded-full transition-all duration-300 transform hover:scale-110"
                >
                  <ChevronRight className="h-5 w-5 text-amber-400" />
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center text-amber-400 hover:text-amber-300 transition-all duration-300 group"
            >
              Prévisualiser
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Template Preview */}
            <div className="flex justify-center animate-slide-up">
              <div className="relative">
                {/* Phone Frame */}
                <div className="relative w-80 h-[700px] bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-6 shadow-luxury border border-slate-700">
                  <div className="w-full h-full bg-gradient-to-br from-neutral-50 to-amber-50/30 rounded-[2rem] overflow-hidden relative shadow-inner">
                    {/* Status Bar */}
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 h-6 flex items-center justify-between px-6 text-neutral-50 text-xs">
                      <span>9:41</span>
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                        <div className="w-1 h-1 bg-rose-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                      </div>
                    </div>
                    
                    {/* Invitation Content */}
                    <div className="h-full bg-cover bg-center bg-no-repeat relative overflow-y-auto" style={{ backgroundImage: `url(${templateData.backgroundImage})` }}>
                      <div className={`absolute inset-0 ${
                        currentTemplate === 0 
                          ? 'bg-gradient-to-b from-black/60 via-black/40 to-black/70'
                          : 'bg-gradient-to-b from-black/70 via-black/50 to-black/80'
                      }`}></div>
                      
                      <div className={`relative z-10 p-6 h-full flex flex-col justify-between text-center text-white transition-all duration-500 ${
                        currentTemplate === 1 ? 'animate-slide-up' : ''
                      }`}>
                        
                        {currentTemplate === 0 ? (
                          // Template Gold Premium (existant)
                          <>
                  <div>
                    <div className="mb-6">
                      <div className="flex justify-center space-x-2 mb-4">
                        <Sparkles className="h-6 w-6 text-amber-400 animate-pulse" />
                        <Heart className="h-8 w-8 text-amber-400" />
                        <Sparkles className="h-6 w-6 text-amber-400 animate-pulse" />
                      </div>
                      
                      <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-4"></div>
                      <div className="flex justify-center space-x-2 mb-4">
                        <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                        <Sparkles className="h-3 w-3 text-amber-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
                        <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" style={{ animationDelay: '1s' }} />
                      </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 bg-clip-text text-transparent mb-6 font-luxury drop-shadow-lg">
                      {templateData.title}
                    </h1>

                    {/* Guest Info */}
                    <div className="bg-gradient-to-r from-amber-900/40 to-amber-800/40 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-amber-500/30">
                      <p className="text-amber-200 text-sm mb-2">Cher(e)</p>
                      <p className="text-xl font-semibold text-amber-100">[Nom de l'invité]</p>
                      <p className="text-amber-300 text-sm mt-2">Table n° [Numéro de table]</p>
                    </div>

                    {/* Invitation Text */}
                    <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-amber-500/20">
                      <p className="text-neutral-200 leading-relaxed text-sm">
                        {templateData.invitationText}
                      </p>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-center text-amber-200">
                        <Calendar className="h-5 w-5 mr-3 text-amber-400" />
                        <div className="text-left">
                          <p className="font-semibold">{templateData.eventDate}</p>
                          <p className="text-sm text-amber-300">{templateData.eventTime}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center text-amber-200">
                        <MapPin className="h-5 w-5 mr-3 text-amber-400" />
                        <p className="text-sm">{templateData.eventLocation}</p>
                      </div>
                    </div>

                    {/* RSVP Section */}
                    <div className="bg-gradient-to-r from-amber-900/50 to-amber-800/50 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-amber-500/30">
                      <h3 className="text-amber-200 font-semibold mb-3 flex items-center justify-center">
                        <Users className="h-4 w-4 mr-2" />
                        Confirmation de présence
                      </h3>
                      <button
                        onClick={handleConfirmation}
                        className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                          isConfirmed
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-glow-amber'
                            : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 hover:from-amber-600 hover:to-amber-700 shadow-glow-amber'
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
                    <div className="bg-gradient-to-r from-amber-900/50 to-amber-800/50 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-amber-500/30">
                      <h3 className="text-amber-200 font-semibold mb-3 flex items-center justify-center">
                        <Wine className="h-4 w-4 mr-2" />
                        Choix de boisson
                      </h3>
                      <select
                        value={selectedDrink}
                        onChange={(e) => setSelectedDrink(e.target.value)}
                        className="w-full bg-slate-800/80 text-amber-200 border border-amber-500/30 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                      >
                        <option value="">Sélectionnez votre boisson</option>
                        {templateData.drinkOptions.map((drink) => (
                          <option key={drink} value={drink}>{drink}</option>
                        ))}
                      </select>
                    </div>

                    {/* Guest Book */}
                    <div className="bg-gradient-to-r from-amber-900/50 to-amber-800/50 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-amber-500/30">
                      <h3 className="text-amber-200 font-semibold mb-3 flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Livre d'or
                      </h3>
                      <textarea
                        value={guestMessage}
                        onChange={(e) => setGuestMessage(e.target.value)}
                        placeholder="Laissez un message aux mariés..."
                        className="w-full bg-slate-800/80 text-amber-200 border border-amber-500/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 resize-none"
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
                        <button className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-slate-900 py-2 rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all duration-300 font-semibold text-sm">
                          <Camera className="h-4 w-4 inline mr-2" />
                          Ajouter une photo
                        </button>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="bg-gradient-to-r from-amber-900/50 to-amber-800/50 backdrop-blur-sm rounded-2xl p-4 border border-amber-500/30">
                      <h3 className="text-amber-200 font-semibold mb-3 flex items-center justify-center">
                        <QrCode className="h-4 w-4 mr-2" />
                        QR Code Invité
                      </h3>
                      <div 
                        className="bg-white rounded-xl p-4 inline-block cursor-pointer hover:scale-105 transition-transform duration-300"
                        onClick={() => setShowQRInfo(!showQRInfo)}
                      >
                        <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center">
                          <QrCode className="h-12 w-12 text-amber-400" />
                        </div>
                      </div>
                      
                      <p className="text-center mt-3 text-amber-300 text-xs">
                        Cliquez pour scanner
                      </p>
                      
                      {showQRInfo && (
                        <div className="mt-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 animate-slide-up">
                          <div className="text-center mb-3">
                            <h4 className="font-bold text-slate-900 text-sm">Informations Invité</h4>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                              <div className="flex items-center">
                                <User className="h-3 w-3 text-slate-600 mr-2" />
                                <span className="font-medium text-slate-700">Nom:</span>
                              </div>
                              <span className="font-bold text-slate-900">[Nom de l'invité]</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 text-slate-600 mr-2" />
                                <span className="font-medium text-slate-700">Table:</span>
                              </div>
                              <span className="font-bold text-slate-900">[Numéro de table]</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                              <div className="flex items-center">
                                <Wine className="h-3 w-3 text-slate-600 mr-2" />
                                <span className="font-medium text-slate-700">Boisson:</span>
                              </div>
                              <span className="font-bold text-slate-900">{selectedDrink || 'Non sélectionnée'}</span>
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
                
                          </>
                        ) : (
                          // Template Royal Elegance (nouveau)
                          <>
                            <div>
                              <div className="mb-8">
                                <div className="flex justify-center items-center mb-6">
                                  <div className="relative">
                                    <Crown className="h-12 w-12 text-amber-300 animate-glow drop-shadow-2xl" />
                                    <div className="absolute inset-0 animate-pulse">
                                      <Crown className="h-12 w-12 text-rose-400 opacity-40" />
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="w-32 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent mx-auto mb-6"></div>
                                <div className="flex justify-center space-x-3 mb-6">
                                  <Flower2 className="h-6 w-6 text-amber-300 animate-pulse" />
                                  <Heart className="h-8 w-8 text-rose-300 animate-glow" />
                                  <Flower2 className="h-6 w-6 text-amber-300 animate-pulse" />
                                </div>
                              </div>

                              {/* Royal Title */}
                              <div className="mb-8">
                                <div className="bg-gradient-to-r from-amber-900/60 to-rose-900/60 backdrop-blur-sm rounded-3xl p-6 border border-amber-400/30 shadow-2xl">
                                  <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 bg-clip-text text-transparent mb-4 font-luxury drop-shadow-lg tracking-wide">
                                    {templateData.title}
                                  </h1>
                                  <div className="w-24 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent mx-auto"></div>
                                </div>
                              </div>

                              {/* Guest Info Royal */}
                              <div className="bg-gradient-to-r from-amber-900/50 to-rose-900/50 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-amber-400/40 shadow-xl">
                                <div className="flex justify-center mb-3">
                                  <Crown className="h-6 w-6 text-amber-300" />
                                </div>
                                <p className="text-amber-200 text-sm mb-2 tracking-wide">Invité d'Honneur</p>
                                <p className="text-2xl font-bold text-amber-100 tracking-wide">[Nom de l'invité]</p>
                                <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent mx-auto mt-3 mb-3"></div>
                                <p className="text-amber-300 text-sm tracking-wide">Table Royale n° [Numéro de table]</p>
                              </div>

                              {/* Royal Invitation Text */}
                              <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-rose-400/30 shadow-xl">
                                <div className="flex justify-center mb-4">
                                  <div className="flex space-x-2">
                                    <Flower2 className="h-4 w-4 text-rose-300" />
                                    <Heart className="h-5 w-5 text-amber-300" />
                                    <Flower2 className="h-4 w-4 text-rose-300" />
                                  </div>
                                </div>
                                <p className="text-neutral-100 leading-relaxed text-sm italic tracking-wide">
                                  {templateData.invitationText}
                                </p>
                              </div>

                              {/* Royal Event Details */}
                              <div className="space-y-4 mb-6">
                                <div className="bg-gradient-to-r from-amber-900/40 to-amber-800/40 backdrop-blur-sm rounded-xl p-4 border border-amber-400/30">
                                  <div className="flex items-center justify-center text-amber-200">
                                    <Calendar className="h-5 w-5 mr-3 text-amber-300" />
                                    <div className="text-center">
                                      <p className="font-bold text-lg tracking-wide">{templateData.eventDate}</p>
                                      <p className="text-sm text-amber-300 tracking-wide">{templateData.eventTime}</p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="bg-gradient-to-r from-rose-900/40 to-rose-800/40 backdrop-blur-sm rounded-xl p-4 border border-rose-400/30">
                                  <div className="flex items-center justify-center text-rose-200">
                                    <MapPin className="h-5 w-5 mr-3 text-rose-300" />
                                    <p className="text-sm text-center tracking-wide">{templateData.eventLocation}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              {/* Royal RSVP Section */}
                              <div className="bg-gradient-to-r from-amber-900/60 to-rose-900/60 backdrop-blur-sm rounded-2xl p-4 border border-amber-400/40 shadow-xl">
                                <h3 className="text-amber-200 font-bold mb-4 flex items-center justify-center tracking-wide">
                                  <Crown className="h-4 w-4 mr-2" />
                                  Confirmation Royale
                                </h3>
                                <button
                                  onClick={handleConfirmation}
                                  className={`w-full py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 tracking-wide ${
                                    isConfirmed
                                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-2xl'
                                      : 'bg-gradient-to-r from-amber-400 to-rose-400 text-slate-900 hover:from-amber-500 hover:to-rose-500 shadow-2xl'
                                  }`}
                                >
                                  {isConfirmed ? (
                                    <span className="flex items-center justify-center">
                                      <Check className="h-5 w-5 mr-2" />
                                      Présence Confirmée
                                    </span>
                                  ) : (
                                    <span className="flex items-center justify-center">
                                      <Crown className="h-5 w-5 mr-2" />
                                      Confirmer ma Présence
                                    </span>
                                  )}
                                </button>
                              </div>

                              {/* Royal Drink Selection */}
                              <div className="bg-gradient-to-r from-rose-900/60 to-amber-900/60 backdrop-blur-sm rounded-2xl p-4 border border-rose-400/40 shadow-xl">
                                <h3 className="text-rose-200 font-bold mb-4 flex items-center justify-center tracking-wide">
                                  <Wine className="h-4 w-4 mr-2" />
                                  Sélection Royale
                                </h3>
                                <select
                                  value={selectedDrink}
                                  onChange={(e) => setSelectedDrink(e.target.value)}
                                  className="w-full bg-slate-800/90 text-rose-200 border border-rose-400/40 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all duration-200 font-medium"
                                >
                                  <option value="">Choisissez votre nectar</option>
                                  {templateData.drinkOptions.map((drink) => (
                                    <option key={drink} value={drink}>{drink}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Royal Guest Book */}
                              <div className="bg-gradient-to-r from-amber-900/60 to-rose-900/60 backdrop-blur-sm rounded-2xl p-4 border border-amber-400/40 shadow-xl">
                                <h3 className="text-amber-200 font-bold mb-4 flex items-center justify-center tracking-wide">
                                  <MessageCircle className="h-4 w-4 mr-2" />
                                  Livre d'Or Royal
                                </h3>
                                <textarea
                                  value={guestMessage}
                                  onChange={(e) => setGuestMessage(e.target.value)}
                                  placeholder="Vos vœux les plus sincères..."
                                  className="w-full bg-slate-800/90 text-amber-200 border border-amber-400/40 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 resize-none font-medium"
                                  rows={3}
                                />
                                <div className="mt-4 space-y-3">
                                  <button 
                                    onClick={() => {
                                      if (guestMessage.trim()) {
                                        alert('Vos vœux ont été transmis avec succès !');
                                        setGuestMessage('');
                                      } else {
                                        alert('Veuillez écrire vos vœux avant d\'envoyer.');
                                      }
                                    }}
                                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-bold shadow-xl transform hover:scale-105"
                                  >
                                    <MessageCircle className="h-4 w-4 inline mr-2" />
                                    Transmettre mes Vœux
                                  </button>
                                  <button className="w-full bg-gradient-to-r from-amber-500 to-rose-500 text-slate-900 py-3 rounded-xl hover:from-amber-600 hover:to-rose-600 transition-all duration-300 font-bold shadow-xl">
                                    <Camera className="h-4 w-4 inline mr-2" />
                                    Ajouter une Photo Souvenir
                                  </button>
                                </div>
                              </div>

                              {/* Royal QR Code */}
                              <div className="bg-gradient-to-r from-rose-900/60 to-amber-900/60 backdrop-blur-sm rounded-2xl p-4 border border-rose-400/40 shadow-xl">
                                <h3 className="text-rose-200 font-bold mb-4 flex items-center justify-center tracking-wide">
                                  <QrCode className="h-4 w-4 mr-2" />
                                  Code Royal
                                </h3>
                                <div 
                                  className="bg-gradient-to-br from-amber-100 to-rose-100 rounded-2xl p-4 inline-block cursor-pointer hover:scale-105 transition-transform duration-300 shadow-xl border-2 border-amber-300/50"
                                  onClick={() => setShowQRInfo(!showQRInfo)}
                                >
                                  <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-inner">
                                    <QrCode className="h-12 w-12 text-amber-400" />
                                  </div>
                                </div>
                                
                                <p className="text-center mt-3 text-rose-300 text-xs tracking-wide font-medium">
                                  Touchez pour révéler
                                </p>
                                
                                {showQRInfo && (
                                  <div className="mt-4 bg-gradient-to-br from-white to-amber-50 backdrop-blur-sm rounded-2xl p-4 animate-slide-up shadow-2xl border border-amber-300/50">
                                    <div className="text-center mb-3">
                                      <div className="flex justify-center mb-2">
                                        <Crown className="h-5 w-5 text-amber-600" />
                                      </div>
                                      <h4 className="font-bold text-slate-900 text-sm tracking-wide">Informations Royales</h4>
                                    </div>
                                    <div className="space-y-2 text-xs">
                                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-50 to-rose-50 rounded-xl border border-amber-200/50">
                                        <div className="flex items-center">
                                          <User className="h-3 w-3 text-slate-600 mr-2" />
                                          <span className="font-semibold text-slate-700">Invité:</span>
                                        </div>
                                        <span className="font-bold text-slate-900">[Nom de l'invité]</span>
                                      </div>
                                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-rose-50 to-amber-50 rounded-xl border border-rose-200/50">
                                        <div className="flex items-center">
                                          <Crown className="h-3 w-3 text-slate-600 mr-2" />
                                          <span className="font-semibold text-slate-700">Table:</span>
                                        </div>
                                        <span className="font-bold text-slate-900">[Numéro de table]</span>
                                      </div>
                                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-50 to-rose-50 rounded-xl border border-amber-200/50">
                                        <div className="flex items-center">
                                          <Wine className="h-3 w-3 text-slate-600 mr-2" />
                                          <span className="font-semibold text-slate-700">Nectar:</span>
                                        </div>
                                        <span className="font-bold text-slate-900">{selectedDrink || 'Non sélectionné'}</span>
                                      </div>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowQRInfo(false);
                                      }}
                                      className="w-full mt-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white py-2 rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-300 text-xs font-bold tracking-wide"
                                    >
                                      Fermer
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-r from-amber-400 to-rose-400 rounded-full opacity-20 animate-float blur-lg"></div>
                <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full opacity-15 animate-float blur-lg" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/4 -left-6 w-10 h-10 bg-gradient-to-r from-rose-400 to-amber-400 rounded-full opacity-25 animate-bounce-slow blur-sm"></div>
                <div className="absolute bottom-1/4 -right-4 w-8 h-8 bg-gradient-to-r from-emerald-400 to-purple-400 rounded-full opacity-30 animate-float blur-sm" style={{ animationDelay: '2s' }}></div>
              </div>
            </div>

            {/* Template Information */}
            <div className="animate-slide-up">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl shadow-luxury border border-amber-500/20 p-6">
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full shadow-glow-amber">
                      {currentTemplate === 0 ? (
                        <Heart className="h-12 w-12 text-slate-900" />
                      ) : (
                        <Crown className="h-12 w-12 text-slate-900" />
                      )}
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent mb-2">
                    {templateData.name}
                  </h2>
                  <p className="text-neutral-300">
                    {currentTemplate === 0 
                      ? 'Le summum de l\'élégance pour votre mariage'
                      : 'Sophistication royale pour votre union sacrée'
                    }
                  </p>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h3 className="text-amber-400 font-semibold mb-4">Fonctionnalités incluses</h3>
                  <div className="space-y-2">
                    {templateData.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-neutral-300">
                        <div className="w-2 h-2 bg-amber-400 rounded-full mr-3 flex-shrink-0 animate-pulse"></div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Template Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center bg-gradient-to-br from-amber-900/30 to-amber-800/30 rounded-2xl p-4 border border-amber-500/20">
                    <div className="text-2xl font-bold text-amber-400">
                      {currentTemplate === 0 ? 'Premium' : 'Royal'}
                    </div>
                    <div className="text-neutral-400 text-sm">Qualité</div>
                  </div>
                  <div className="text-center bg-gradient-to-br from-amber-900/30 to-amber-800/30 rounded-2xl p-4 border border-amber-500/20">
                    <div className="text-2xl font-bold text-amber-400">
                      {currentTemplate === 0 ? '10+' : '12+'}
                    </div>
                    <div className="text-neutral-400 text-sm">Fonctionnalités</div>
                  </div>
                  <div className="text-center bg-gradient-to-br from-amber-900/30 to-amber-800/30 rounded-2xl p-4 border border-amber-500/20">
                    <div className="text-2xl font-bold text-amber-400">100%</div>
                    <div className="text-neutral-400 text-sm">Personnalisable</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mb-4">
                  <button
                    onClick={handleSelectTemplate}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-900 py-4 rounded-2xl hover:from-amber-600 hover:via-amber-700 hover:to-amber-600 transition-all duration-500 font-bold text-lg shadow-glow-amber hover:shadow-luxury transform hover:scale-105 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <span className="relative flex items-center justify-center">
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin mr-2"></div>
                          Création en cours...
                        </>
                      ) : (
                        <>
                          {currentTemplate === 0 ? (
                            <Heart className="h-5 w-5 mr-2" />
                          ) : (
                            <Crown className="h-5 w-5 mr-2" />
                          )}
                          Choisir ce modèle
                        </>
                      )}
                    </span>
                  </button>
                </div>

                {/* Template Description */}
                <div className="p-4 bg-gradient-to-r from-amber-900/20 to-amber-800/20 rounded-2xl border border-amber-500/20">
                  <h4 className="text-amber-400 font-semibold mb-3">À propos de ce modèle</h4>
                  <p className="text-neutral-300 text-xs leading-relaxed">
                    {currentTemplate === 0 
                      ? 'Ce modèle premium combine élégance et fonctionnalité pour créer une invitation de mariage inoubliable. Avec son design gold sophistiqué et ses nombreuses fonctionnalités interactives, il offre une expérience complète à vos invités tout en reflétant le prestige de votre événement.'
                      : 'Ce modèle royal incarne la sophistication absolue avec son design luxueux et ses animations raffinées. Chaque détail a été pensé pour créer une expérience d\'invitation digne des plus grandes célébrations, alliant tradition et modernité dans un écrin de beauté.'
                    }
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

export default WeddingTemplate;