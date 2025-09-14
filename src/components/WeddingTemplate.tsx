import React, { useState } from 'react';
import { Heart, Calendar, MapPin, Users, Wine, Camera, MessageCircle, QrCode, ArrowLeft, Check, Star, Sparkles, User, Eye, ChevronLeft, ChevronRight, Flower2, Crown, Diamond, Gem, Feather, Leaf, Sun } from 'lucide-react';
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
      ],
      style: 'classic'
    },
    {
      id: 'wedding-boheme-nature',
      name: 'Mariage Bohème Nature',
      category: 'wedding',
      backgroundImage: 'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=1200',
      title: 'Emma & Alexandre',
      invitationText: 'Sous le ciel étoilé et entourés de la nature, nous souhaitons partager avec vous le plus beau jour de notre vie. Venez célébrer notre amour dans un cadre authentique et chaleureux.',
      eventDate: '22 Août 2024',
      eventTime: '17h30',
      eventLocation: 'Domaine des Oliviers, Provence',
      drinkOptions: ['Vin Bio Local', 'Cocktail Artisanal', 'Kombucha Maison', 'Eau de Source', 'Tisane aux Herbes'],
      features: [
        'Design bohème authentique',
        'Animations naturelles fluides',
        'Typographie manuscrite',
        'Navigation par gestes',
        'Galerie photo immersive',
        'Carte interactive du lieu',
        'Messages audio possibles',
        'Confirmation écologique',
        'Menu bio personnalisé',
        'QR Code végétal',
        'Playlist collaborative',
        'Météo en temps réel'
      ],
      style: 'boheme'
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

  // Navigation différente selon le template
  const renderNavigation = () => {
    if (currentTemplate === 0) {
      // Navigation classique pour le template Gold
      return (
        <div className="flex justify-center items-center mt-4 space-x-4">
          <button
            onClick={prevTemplate}
            className="p-3 bg-amber-500/20 hover:bg-amber-500/30 rounded-full transition-all duration-300 transform hover:scale-110 border border-amber-400/30"
          >
            <ChevronLeft className="h-6 w-6 text-amber-400" />
          </button>
          <div className="flex space-x-3">
            {templates.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTemplate(index)}
                className={`w-4 h-4 rounded-full transition-all duration-300 border-2 ${
                  index === currentTemplate 
                    ? 'bg-amber-400 border-amber-300 shadow-glow-amber' 
                    : 'bg-amber-400/30 border-amber-400/50 hover:bg-amber-400/50'
                }`}
              />
            ))}
          </div>
          <button
            onClick={nextTemplate}
            className="p-3 bg-amber-500/20 hover:bg-amber-500/30 rounded-full transition-all duration-300 transform hover:scale-110 border border-amber-400/30"
          >
            <ChevronRight className="h-6 w-6 text-amber-400" />
          </button>
        </div>
      );
    } else {
      // Navigation bohème pour le template Nature
      return (
        <div className="flex justify-center items-center mt-6">
          <div className="bg-emerald-900/30 backdrop-blur-sm rounded-full p-2 border border-emerald-400/30">
            <div className="flex items-center space-x-6 px-4">
              <button
                onClick={prevTemplate}
                className="group flex items-center space-x-2 text-emerald-300 hover:text-emerald-200 transition-all duration-300"
              >
                <Leaf className="h-5 w-5 group-hover:-rotate-12 transition-transform duration-300" />
                <span className="text-sm font-medium hidden sm:block">Précédent</span>
              </button>
              
              <div className="flex items-center space-x-2">
                {templates.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTemplate(index)}
                    className={`transition-all duration-300 ${
                      index === currentTemplate 
                        ? 'w-8 h-2 bg-emerald-400 rounded-full shadow-lg' 
                        : 'w-2 h-2 bg-emerald-400/40 rounded-full hover:bg-emerald-400/60'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={nextTemplate}
                className="group flex items-center space-x-2 text-emerald-300 hover:text-emerald-200 transition-all duration-300"
              >
                <span className="text-sm font-medium hidden sm:block">Suivant</span>
                <Feather className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${
      currentTemplate === 0 
        ? 'bg-gradient-to-br from-slate-900 via-amber-900/20 to-slate-800'
        : 'bg-gradient-to-br from-slate-900 via-emerald-900/30 to-slate-800'
    }`}>
      {/* Background decorative elements - différents selon le template */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {currentTemplate === 0 ? (
          // Éléments décoratifs classiques
          <>
            <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-r from-amber-400/10 to-rose-400/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-r from-amber-500/10 to-amber-300/10 rounded-full blur-3xl animate-bounce-slow"></div>
            <div className="absolute top-1/2 left-10 w-24 h-24 bg-gradient-to-r from-rose-400/10 to-amber-400/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
          </>
        ) : (
          // Éléments décoratifs bohèmes
          <>
            <div className="absolute top-10 right-10 w-60 h-60 bg-gradient-to-r from-emerald-300/8 to-teal-300/8 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-10 left-10 w-48 h-48 bg-gradient-to-r from-emerald-400/8 to-emerald-200/8 rounded-full blur-3xl animate-bounce-slow"></div>
            <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-gradient-to-r from-teal-300/8 to-emerald-300/8 rounded-full blur-2xl animate-float" style={{ animationDelay: '3s' }}></div>
            <div className="absolute bottom-1/3 right-1/4 w-28 h-28 bg-gradient-to-r from-emerald-200/8 to-teal-200/8 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
          </>
        )}
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
        {/* Header - différent selon le template */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className={`flex items-center transition-all duration-300 group ${
                currentTemplate === 0 
                  ? 'text-amber-400 hover:text-amber-300'
                  : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Retour aux catégories
            </button>
            
            <div className="text-center">
              <h1 className={`text-3xl md:text-4xl font-bold ${
                currentTemplate === 0 
                  ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent'
              }`}>
                {currentTemplate === 0 ? 'Modèles Mariage Premium' : 'Mariage Bohème & Nature'}
              </h1>
              <p className="text-neutral-300 mt-2">
                {currentTemplate === 0 
                  ? 'Élégance et romantisme pour votre jour J' 
                  : 'Authenticité et harmonie avec la nature'}
              </p>
              {renderNavigation()}
            </div>

            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center transition-all duration-300 group ${
                currentTemplate === 0 
                  ? 'text-amber-400 hover:text-amber-300'
                  : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              {currentTemplate === 0 ? 'Prévisualiser' : 'Découvrir'}
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Template Preview */}
            <div className="flex justify-center animate-slide-up">
              <div className="relative">
                {/* Phone Frame - style différent selon le template */}
                <div className={`relative w-80 h-[700px] rounded-[3rem] p-6 shadow-luxury ${
                  currentTemplate === 0 
                    ? 'bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700'
                    : 'bg-gradient-to-br from-emerald-900 to-teal-900 border border-emerald-700'
                }`}>
                  <div className={`w-full h-full rounded-[2rem] overflow-hidden relative shadow-inner ${
                    currentTemplate === 0 
                      ? 'bg-gradient-to-br from-neutral-50 to-amber-50/30'
                      : 'bg-gradient-to-br from-emerald-50 to-teal-50/30'
                  }`}>
                    {/* Status Bar - style différent */}
                    <div className={`h-6 flex items-center justify-between px-6 text-neutral-50 text-xs ${
                      currentTemplate === 0 
                        ? 'bg-gradient-to-r from-slate-900 to-slate-800'
                        : 'bg-gradient-to-r from-emerald-900 to-teal-900'
                    }`}>
                      <span>9:41</span>
                      <div className="flex space-x-1">
                        <div className={`w-1 h-1 rounded-full animate-pulse ${
                          currentTemplate === 0 ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}></div>
                        <div className={`w-1 h-1 rounded-full animate-pulse ${
                          currentTemplate === 0 ? 'bg-amber-400' : 'bg-teal-400'
                        }`} style={{ animationDelay: '0.3s' }}></div>
                        <div className={`w-1 h-1 rounded-full animate-pulse ${
                          currentTemplate === 0 ? 'bg-rose-400' : 'bg-emerald-400'
                        }`} style={{ animationDelay: '0.6s' }}></div>
                      </div>
                    </div>
                    
                    {/* Invitation Content - complètement différent */}
                    <div className="h-full bg-cover bg-center bg-no-repeat relative overflow-y-auto" style={{ backgroundImage: `url(${templateData.backgroundImage})` }}>
                      <div className={`absolute inset-0 ${
                        currentTemplate === 0 
                          ? 'bg-gradient-to-b from-black/60 via-black/40 to-black/70'
                          : 'bg-gradient-to-b from-black/50 via-black/20 to-black/60'
                      }`}></div>
                      
                      <div className="relative z-10 p-6 h-full flex flex-col justify-between text-center text-white">
                        
                        {currentTemplate === 0 ? (
                          // Template Gold Premium - Style classique
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

                              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 bg-clip-text text-transparent mb-6 font-luxury drop-shadow-lg">
                                {templateData.title}
                              </h1>

                              <div className="bg-gradient-to-r from-amber-900/40 to-amber-800/40 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-amber-500/30">
                                <p className="text-amber-200 text-sm mb-2">Cher(e)</p>
                                <p className="text-xl font-semibold text-amber-100">[Nom de l'invité]</p>
                                <p className="text-amber-300 text-sm mt-2">Table n° [Numéro de table]</p>
                              </div>

                              <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-amber-500/20">
                                <p className="text-neutral-200 leading-relaxed text-sm">
                                  {templateData.invitationText}
                                </p>
                              </div>

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
                            </div>

                            <div className="space-y-4">
                              <div className="bg-gradient-to-r from-amber-900/50 to-amber-800/50 backdrop-blur-sm rounded-2xl p-4 border border-amber-500/30">
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

                              <div className="bg-gradient-to-r from-amber-900/50 to-amber-800/50 backdrop-blur-sm rounded-2xl p-4 border border-amber-500/30">
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

                              <div className="bg-gradient-to-r from-amber-900/50 to-amber-800/50 backdrop-blur-sm rounded-2xl p-4 border border-amber-500/30">
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
                                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-2 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-semibold text-sm shadow-lg transform hover:scale-105"
                                  >
                                    <MessageCircle className="h-4 w-4 inline mr-2" />
                                    Envoyer le message
                                  </button>
                                  <button className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-slate-900 py-2 rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all duration-300 font-semibold text-sm">
                                    <Camera className="h-4 w-4 inline mr-2" />
                                    Ajouter une photo
                                  </button>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          // Template Bohème Nature - Style complètement différent
                          <>
                            <div>
                              <div className="mb-8">
                                <div className="flex justify-center items-center mb-6">
                                  <div className="relative">
                                    <div className="flex items-center space-x-3">
                                      <Leaf className="h-8 w-8 text-emerald-300 animate-float" />
                                      <Sun className="h-10 w-10 text-amber-300 animate-glow" />
                                      <Feather className="h-8 w-8 text-teal-300 animate-float" style={{ animationDelay: '1s' }} />
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex justify-center space-x-4 mb-6">
                                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>
                                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                                </div>
                              </div>

                              <div className="bg-emerald-900/30 backdrop-blur-sm rounded-3xl p-6 mb-6 border border-emerald-400/20 shadow-2xl">
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-200 via-teal-200 to-emerald-200 bg-clip-text text-transparent mb-4 font-luxury drop-shadow-lg tracking-wide">
                                  {templateData.title}
                                </h1>
                                <div className="flex justify-center space-x-2">
                                  <Leaf className="h-4 w-4 text-emerald-300" />
                                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent mt-2"></div>
                                  <Feather className="h-4 w-4 text-teal-300" />
                                </div>
                              </div>

                              <div className="bg-teal-900/40 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-teal-400/30 shadow-xl">
                                <div className="flex justify-center mb-3">
                                  <div className="flex space-x-2">
                                    <Leaf className="h-4 w-4 text-emerald-300 animate-float" />
                                    <Heart className="h-5 w-5 text-teal-300" />
                                    <Feather className="h-4 w-4 text-emerald-300 animate-float" style={{ animationDelay: '1s' }} />
                                  </div>
                                </div>
                                <p className="text-emerald-200 text-sm mb-2 tracking-wide">Invité d'honneur</p>
                                <p className="text-xl font-semibold text-emerald-100 tracking-wide">[Nom de l'invité]</p>
                                <div className="w-16 h-px bg-gradient-to-r from-transparent via-teal-300 to-transparent mx-auto mt-3 mb-3"></div>
                                <p className="text-teal-300 text-sm tracking-wide">Place n° [Numéro de table]</p>
                              </div>

                              <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-emerald-400/20 shadow-xl">
                                <div className="flex justify-center mb-4">
                                  <div className="flex space-x-2">
                                    <Sun className="h-4 w-4 text-amber-300" />
                                    <Leaf className="h-4 w-4 text-emerald-300" />
                                    <Sun className="h-4 w-4 text-amber-300" />
                                  </div>
                                </div>
                                <p className="text-neutral-100 leading-relaxed text-sm italic tracking-wide">
                                  {templateData.invitationText}
                                </p>
                              </div>

                              <div className="space-y-4 mb-6">
                                <div className="bg-emerald-900/40 backdrop-blur-sm rounded-xl p-4 border border-emerald-400/30">
                                  <div className="flex items-center justify-center text-emerald-200">
                                    <Calendar className="h-5 w-5 mr-3 text-emerald-300" />
                                    <div className="text-center">
                                      <p className="font-bold text-lg tracking-wide">{templateData.eventDate}</p>
                                      <p className="text-sm text-emerald-300 tracking-wide">{templateData.eventTime}</p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="bg-teal-900/40 backdrop-blur-sm rounded-xl p-4 border border-teal-400/30">
                                  <div className="flex items-center justify-center text-teal-200">
                                    <MapPin className="h-5 w-5 mr-3 text-teal-300" />
                                    <p className="text-sm text-center tracking-wide">{templateData.eventLocation}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              {/* Navigation par swipe pour le style bohème */}
                              <div className="flex justify-center mb-4">
                                <div className="flex space-x-2">
                                  <div className="w-8 h-1 bg-emerald-400/60 rounded-full"></div>
                                  <div className="w-2 h-1 bg-emerald-400/30 rounded-full"></div>
                                  <div className="w-2 h-1 bg-emerald-400/30 rounded-full"></div>
                                </div>
                              </div>

                              <div className="bg-emerald-900/50 backdrop-blur-sm rounded-2xl p-4 border border-emerald-400/40 shadow-xl">
                                <h3 className="text-emerald-200 font-bold mb-4 flex items-center justify-center tracking-wide">
                                  <Leaf className="h-4 w-4 mr-2" />
                                  Confirmation Naturelle
                                </h3>
                                <button
                                  onClick={handleConfirmation}
                                  className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 tracking-wide ${
                                    isConfirmed
                                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-2xl'
                                      : 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-900 hover:from-emerald-500 hover:to-teal-500 shadow-2xl'
                                  }`}
                                >
                                  {isConfirmed ? (
                                    <span className="flex items-center justify-center">
                                      <Check className="h-5 w-5 mr-2" />
                                      Je serai présent(e)
                                    </span>
                                  ) : (
                                    <span className="flex items-center justify-center">
                                      <Heart className="h-5 w-5 mr-2" />
                                      Confirmer ma Présence
                                    </span>
                                  )}
                                </button>
                              </div>

                              <div className="bg-teal-900/50 backdrop-blur-sm rounded-2xl p-4 border border-teal-400/40 shadow-xl">
                                <h3 className="text-teal-200 font-bold mb-4 flex items-center justify-center tracking-wide">
                                  <Wine className="h-4 w-4 mr-2" />
                                  Sélection Bio
                                </h3>
                                <select
                                  value={selectedDrink}
                                  onChange={(e) => setSelectedDrink(e.target.value)}
                                  className="w-full bg-slate-800/90 text-teal-200 border border-teal-400/40 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all duration-200 font-medium"
                                >
                                  <option value="">Choisissez votre nectar</option>
                                  {templateData.drinkOptions.map((drink) => (
                                    <option key={drink} value={drink}>{drink}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="bg-emerald-900/50 backdrop-blur-sm rounded-2xl p-4 border border-emerald-400/40 shadow-xl">
                                <h3 className="text-emerald-200 font-bold mb-4 flex items-center justify-center tracking-wide">
                                  <MessageCircle className="h-4 w-4 mr-2" />
                                  Livre de Nature
                                </h3>
                                <textarea
                                  value={guestMessage}
                                  onChange={(e) => setGuestMessage(e.target.value)}
                                  placeholder="Partagez vos vœux authentiques..."
                                  className="w-full bg-slate-800/90 text-emerald-200 border border-emerald-400/40 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 resize-none font-medium"
                                  rows={3}
                                />
                                <div className="mt-4 space-y-3">
                                  <button 
                                    onClick={() => {
                                      if (guestMessage.trim()) {
                                        alert('Vos vœux ont été partagés avec amour !');
                                        setGuestMessage('');
                                      } else {
                                        alert('Veuillez écrire vos vœux avant de les partager.');
                                      }
                                    }}
                                    className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-3 rounded-2xl hover:from-teal-600 hover:to-emerald-600 transition-all duration-300 font-bold shadow-xl transform hover:scale-105"
                                  >
                                    <Heart className="h-4 w-4 inline mr-2" />
                                    Partager mes Vœux
                                  </button>
                                  <button className="w-full bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-900 py-3 rounded-2xl hover:from-amber-600 hover:to-emerald-600 transition-all duration-300 font-bold shadow-xl">
                                    <Camera className="h-4 w-4 inline mr-2" />
                                    Capturer ce Moment
                                  </button>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative Elements - différents selon le template */}
                {currentTemplate === 0 ? (
                  // Éléments classiques
                  <>
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-r from-amber-400 to-rose-400 rounded-full opacity-20 animate-float blur-lg"></div>
                    <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full opacity-15 animate-float blur-lg" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/4 -left-6 w-10 h-10 bg-gradient-to-r from-rose-400 to-amber-400 rounded-full opacity-25 animate-bounce-slow blur-sm"></div>
                    <div className="absolute bottom-1/4 -right-4 w-8 h-8 bg-gradient-to-r from-emerald-400 to-purple-400 rounded-full opacity-30 animate-float blur-sm" style={{ animationDelay: '2s' }}></div>
                  </>
                ) : (
                  // Éléments bohèmes
                  <>
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-r from-emerald-300 to-teal-300 rounded-full opacity-15 animate-float blur-xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full opacity-12 animate-float blur-xl" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute top-1/3 -left-8 w-16 h-16 bg-gradient-to-r from-emerald-300 to-amber-300 rounded-full opacity-20 animate-bounce-slow blur-lg"></div>
                    <div className="absolute bottom-1/3 -right-6 w-12 h-12 bg-gradient-to-r from-teal-300 to-emerald-300 rounded-full opacity-25 animate-float blur-lg" style={{ animationDelay: '3s' }}></div>
                  </>
                )}
              </div>
            </div>

            {/* Template Information - style différent selon le template */}
            <div className="animate-slide-up">
              <div className={`backdrop-blur-xl rounded-3xl shadow-luxury p-6 ${
                currentTemplate === 0 
                  ? 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-amber-500/20'
                  : 'bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-400/30'
              }`}>
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    <div className={`p-4 rounded-full shadow-lg ${
                      currentTemplate === 0 
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 shadow-glow-amber'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg'
                    }`}>
                      {currentTemplate === 0 ? (
                        <Heart className="h-12 w-12 text-slate-900" />
                      ) : (
                        <Leaf className="h-12 w-12 text-white" />
                      )}
                    </div>
                  </div>
                  <h2 className={`text-2xl font-bold mb-2 ${
                    currentTemplate === 0 
                      ? 'bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent'
                      : 'bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent'
                  }`}>
                    {templateData.name}
                  </h2>
                  <p className="text-neutral-300">
                    {currentTemplate === 0 
                      ? 'Le summum de l\'élégance pour votre mariage'
                      : 'Authenticité et harmonie pour votre union naturelle'
                    }
                  </p>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h3 className={`font-semibold mb-4 ${
                    currentTemplate === 0 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    Fonctionnalités incluses
                  </h3>
                  <div className="space-y-2">
                    {templateData.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-neutral-300">
                        <div className={`w-2 h-2 rounded-full mr-3 flex-shrink-0 animate-pulse ${
                          currentTemplate === 0 ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}></div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Template Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className={`text-center rounded-2xl p-4 border ${
                    currentTemplate === 0 
                      ? 'bg-gradient-to-br from-amber-900/30 to-amber-800/30 border-amber-500/20'
                      : 'bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border-emerald-500/20'
                  }`}>
                    <div className={`text-2xl font-bold ${
                      currentTemplate === 0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {currentTemplate === 0 ? 'Premium' : 'Bohème'}
                    </div>
                    <div className="text-neutral-400 text-sm">Style</div>
                  </div>
                  <div className={`text-center rounded-2xl p-4 border ${
                    currentTemplate === 0 
                      ? 'bg-gradient-to-br from-amber-900/30 to-amber-800/30 border-amber-500/20'
                      : 'bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border-emerald-500/20'
                  }`}>
                    <div className={`text-2xl font-bold ${
                      currentTemplate === 0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {currentTemplate === 0 ? '10+' : '12+'}
                    </div>
                    <div className="text-neutral-400 text-sm">Fonctionnalités</div>
                  </div>
                  <div className={`text-center rounded-2xl p-4 border ${
                    currentTemplate === 0 
                      ? 'bg-gradient-to-br from-amber-900/30 to-amber-800/30 border-amber-500/20'
                      : 'bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border-emerald-500/20'
                  }`}>
                    <div className={`text-2xl font-bold ${
                      currentTemplate === 0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      100%
                    </div>
                    <div className="text-neutral-400 text-sm">Personnalisable</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mb-4">
                  <button
                    onClick={handleSelectTemplate}
                    disabled={isLoading}
                    className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-luxury transform hover:scale-105 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-500 ${
                      currentTemplate === 0 
                        ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-900 hover:from-amber-600 hover:via-amber-700 hover:to-amber-600 shadow-glow-amber'
                        : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 text-white hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-600'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <span className="relative flex items-center justify-center">
                      {isLoading ? (
                        <>
                          <div className={`w-5 h-5 border-2 rounded-full animate-spin mr-2 ${
                            currentTemplate === 0 
                              ? 'border-slate-900/30 border-t-slate-900'
                              : 'border-white/30 border-t-white'
                          }`}></div>
                          Création en cours...
                        </>
                      ) : (
                        <>
                          {currentTemplate === 0 ? (
                            <Heart className="h-5 w-5 mr-2" />
                          ) : (
                            <Leaf className="h-5 w-5 mr-2" />
                          )}
                          Choisir ce modèle
                        </>
                      )}
                    </span>
                  </button>
                </div>

                {/* Template Description */}
                <div className={`p-4 rounded-2xl border ${
                  currentTemplate === 0 
                    ? 'bg-gradient-to-r from-amber-900/20 to-amber-800/20 border-amber-500/20'
                    : 'bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border-emerald-500/20'
                }`}>
                  <h4 className={`font-semibold mb-3 ${
                    currentTemplate === 0 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    À propos de ce modèle
                  </h4>
                  <p className="text-neutral-300 text-xs leading-relaxed">
                    {currentTemplate === 0 
                      ? 'Ce modèle premium combine élégance et fonctionnalité pour créer une invitation de mariage inoubliable. Avec son design gold sophistiqué et ses nombreuses fonctionnalités interactives, il offre une expérience complète à vos invités tout en reflétant le prestige de votre événement.'
                      : 'Ce modèle bohème célèbre l\'authenticité et la connexion avec la nature. Inspiré par les mariages en plein air et l\'esprit libre, il offre une expérience unique avec des animations organiques, une navigation intuitive et des fonctionnalités éco-responsables pour un mariage en harmonie avec vos valeurs.'
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