import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Palette, Type, Image, Eye, EyeOff, Crown, Heart, Leaf, Feather, Sun, X } from 'lucide-react';

interface TemplateData {
  id: string;
  name: string;
  category: string;
  backgroundImage: string;
  title: string;
  invitationText: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  drinkOptions: string[];
  features: string[];
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  customizations?: {
    colors?: {
      primary: string;
      secondary: string;
      accent: string;
    };
    fonts?: {
  X,
  Layout
      body: string;
    };
    layout?: string;
  };
}

interface TemplateCustomizationProps {
  template: TemplateData;
  onBack: () => void;
  onSave: (customizedTemplate: TemplateData) => void;
}

const TemplateCustomization = ({ template, onBack, onSave }: TemplateCustomizationProps) => {
  const [customizedTemplate, setCustomizedTemplate] = useState<TemplateData>(template);
  const [activeTab, setActiveTab] = useState('content');
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Déterminer le style du template
  const getTemplateStyle = () => {
    if (template.name.toLowerCase().includes('bohème') || 
        template.name.toLowerCase().includes('nature') ||
        template.originalTemplateId === 'wedding-boheme-nature') {
      return 'boheme';
    }
    return 'classic';
  };

  const templateStyle = getTemplateStyle();

  // Initialiser les couleurs par défaut selon le style
  useEffect(() => {
    const defaultColors = templateStyle === 'boheme' ? {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#14b8a6'
    } : {
      primary: '#f59e0b',
      secondary: '#d97706',
      accent: '#f43f5e'
    };

    // Utiliser les couleurs personnalisées existantes ou les couleurs par défaut
    const currentColors = template.customizations?.colors || template.colors || defaultColors;
    
    setCustomizedTemplate(prev => ({
      ...prev,
      colors: currentColors,
      customizations: {
        ...prev.customizations,
        colors: currentColors,
        fonts: prev.customizations?.fonts || {
          title: 'Playfair Display',
          body: 'Inter'
        },
        layout: prev.customizations?.layout || 'default'
      }
    }));
  }, [template, templateStyle]);

  const handleColorChange = (colorType: 'primary' | 'secondary' | 'accent', value: string) => {
    setCustomizedTemplate(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorType]: value
      },
      customizations: {
        ...prev.customizations,
        colors: {
          ...prev.customizations?.colors,
          [colorType]: value
        }
      }
    }));
  };

  const handleContentChange = (field: string, value: string) => {
    setCustomizedTemplate(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDrinkOptionsChange = (options: string[]) => {
    setCustomizedTemplate(prev => ({
      ...prev,
      drinkOptions: options
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(customizedTemplate);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'content', label: 'Contenu', icon: Type },
    { id: 'colors', label: 'Couleurs', icon: Palette },
    { id: 'layout', label: 'Mise en page', icon: Layout }
  ];

  // Obtenir les couleurs actuelles pour l'aperçu
  const getCurrentColors = () => {
    return customizedTemplate.colors || customizedTemplate.customizations?.colors || {
      primary: templateStyle === 'boheme' ? '#10b981' : '#f59e0b',
      secondary: templateStyle === 'boheme' ? '#059669' : '#d97706',
      accent: templateStyle === 'boheme' ? '#14b8a6' : '#f43f5e'
    };
  };

  const currentColors = getCurrentColors();

  const renderPreview = () => {
    return (
      <div className="relative">
        {/* Phone Frame avec style adaptatif */}
        <div className={`relative w-80 h-[700px] rounded-[3rem] p-6 shadow-luxury ${
          templateStyle === 'boheme' 
            ? 'bg-gradient-to-br from-emerald-900 to-teal-900 border border-emerald-700'
            : 'bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700'
        }`}>
          <div className={`w-full h-full rounded-[2rem] overflow-hidden relative shadow-inner ${
            templateStyle === 'boheme' 
              ? 'bg-gradient-to-br from-emerald-50 to-teal-50/30'
              : 'bg-gradient-to-br from-neutral-50 to-amber-50/30'
          }`}>
            {/* Status Bar */}
            <div className={`h-6 flex items-center justify-between px-6 text-neutral-50 text-xs ${
              templateStyle === 'boheme' 
                ? 'bg-gradient-to-r from-emerald-900 to-teal-900'
                : 'bg-gradient-to-r from-slate-900 to-slate-800'
            }`}>
              <span>9:41</span>
              <div className="flex space-x-1">
                <div 
                  className="w-1 h-1 rounded-full animate-pulse" 
                  style={{ backgroundColor: currentColors.primary }}
                ></div>
                <div 
                  className="w-1 h-1 rounded-full animate-pulse" 
                  style={{ backgroundColor: currentColors.secondary, animationDelay: '0.3s' }}
                ></div>
                <div 
                  className="w-1 h-1 rounded-full animate-pulse" 
                  style={{ backgroundColor: currentColors.accent, animationDelay: '0.6s' }}
                ></div>
              </div>
            </div>
            
            {/* Invitation Content */}
            <div className="h-full bg-cover bg-center bg-no-repeat relative overflow-y-auto" style={{ backgroundImage: `url(${customizedTemplate.backgroundImage})` }}>
              <div className={`absolute inset-0 ${
                templateStyle === 'boheme' 
                  ? 'bg-gradient-to-b from-black/50 via-black/20 to-black/60'
                  : 'bg-gradient-to-b from-black/60 via-black/40 to-black/70'
              }`}></div>
              
              <div className="relative z-10 p-6 h-full flex flex-col justify-between text-center text-white">
                
                {templateStyle === 'classic' ? (
                  // Template classique avec couleurs personnalisées
                  <>
                    <div>
                      <div className="mb-6">
                        <div className="flex justify-center space-x-2 mb-4">
                          <Sparkles 
                            className="h-6 w-6 animate-pulse" 
                            style={{ color: currentColors.primary }} 
                          />
                          <Heart 
                            className="h-8 w-8" 
                            style={{ color: currentColors.accent }} 
                          />
                          <Sparkles 
                            className="h-6 w-6 animate-pulse" 
                            style={{ color: currentColors.primary }} 
                          />
                        </div>
                        
                        <div 
                          className="w-24 h-px mx-auto mb-4" 
                          style={{ 
                            background: `linear-gradient(to right, transparent, ${currentColors.primary}, transparent)` 
                          }}
                        ></div>
                        <div className="flex justify-center space-x-2 mb-4">
                          <Sparkles 
                            className="h-4 w-4 animate-pulse" 
                            style={{ color: currentColors.primary }} 
                          />
                          <Sparkles 
                            className="h-3 w-3 animate-pulse" 
                            style={{ color: currentColors.secondary, animationDelay: '0.5s' }} 
                          />
                          <Sparkles 
                            className="h-4 w-4 animate-pulse" 
                            style={{ color: currentColors.primary, animationDelay: '1s' }} 
                          />
                        </div>
                      </div>

                      <h1 
                        className="text-2xl font-bold font-luxury drop-shadow-lg mb-6" 
                        style={{ color: currentColors.primary }}
                      >
                        {customizedTemplate.title}
                      </h1>

                      <div 
                        className="backdrop-blur-sm rounded-2xl p-4 mb-6 border" 
                        style={{ 
                          background: `linear-gradient(to right, ${currentColors.primary}40, ${currentColors.secondary}40)`,
                          borderColor: `${currentColors.primary}30`
                        }}
                      >
                        <p 
                          className="text-base mb-2" 
                          style={{ color: `${currentColors.primary}cc` }}
                        >
                          Cher(e)
                        </p>
                        <p className="text-xl font-semibold text-white">[Nom de l'invité]</p>
                        <p 
                          className="text-base mt-2" 
                          style={{ color: `${currentColors.primary}dd` }}
                        >
                          Table n° [Numéro de table]
                        </p>
                      </div>

                      <div 
                        className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 mb-6 border" 
                        style={{ borderColor: `${currentColors.primary}20` }}
                      >
                        <p className="text-neutral-200 leading-relaxed text-sm">
                          {customizedTemplate.invitationText}
                        </p>
                      </div>

                      <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-center text-neutral-200">
                          <Calendar 
                            className="h-5 w-5 mr-3" 
                            style={{ color: currentColors.primary }} 
                          />
                          <div className="text-left">
                            <p className="font-semibold">{customizedTemplate.eventDate}</p>
                            <p 
                              className="text-sm" 
                              style={{ color: `${currentColors.primary}dd` }}
                            >
                              {customizedTemplate.eventTime}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-center text-neutral-200">
                          <MapPin 
                            className="h-5 w-5 mr-3" 
                            style={{ color: currentColors.primary }} 
                          />
                          <p className="text-sm text-center">{customizedTemplate.eventLocation}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div 
                        className="backdrop-blur-sm rounded-2xl p-4 border" 
                        style={{ 
                          background: `linear-gradient(to right, ${currentColors.primary}50, ${currentColors.secondary}50)`,
                          borderColor: `${currentColors.primary}30`
                        }}
                      >
                        <h3 
                          className="font-semibold mb-3 flex items-center justify-center" 
                          style={{ color: `${currentColors.primary}cc` }}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Confirmation de présence
                        </h3>
                        <button
                          className="w-full py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                          style={{
                            background: `linear-gradient(to right, ${currentColors.primary}, ${currentColors.secondary})`,
                            color: '#1e293b'
                          }}
                        >
                          Confirmer ma présence
                        </button>
                      </div>

                      <div 
                        className="backdrop-blur-sm rounded-2xl p-4 border" 
                        style={{ 
                          background: `linear-gradient(to right, ${currentColors.primary}50, ${currentColors.secondary}50)`,
                          borderColor: `${currentColors.primary}30`
                        }}
                      >
                        <h3 
                          className="font-semibold mb-3 flex items-center justify-center" 
                          style={{ color: `${currentColors.primary}cc` }}
                        >
                          <Wine className="h-4 w-4 mr-2" />
                          Choix de boisson
                        </h3>
                        <select
                          className="w-full bg-slate-800/80 text-white border rounded-xl px-4 py-2 focus:ring-2 transition-all duration-200"
                          style={{ 
                            borderColor: `${currentColors.primary}30`
                          }}
                        >
                          <option value="">Sélectionnez votre boisson</option>
                          {customizedTemplate.drinkOptions.map((drink) => (
                            <option key={drink} value={drink}>{drink}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  // Template bohème avec couleurs personnalisées
                  <>
                    <div>
                      <div className="mb-8">
                        <div className="flex justify-center items-center mb-6">
                          <div className="relative">
                            <div className="flex items-center space-x-3">
                              <Leaf 
                                className="h-8 w-8 animate-float" 
                                style={{ color: currentColors.primary }}
                              />
                              <Sun 
                                className="h-10 w-10 animate-glow" 
                                style={{ color: currentColors.accent }}
                              />
                              <Feather 
                                className="h-8 w-8 animate-float" 
                                style={{ color: currentColors.secondary, animationDelay: '1s' }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-center space-x-4 mb-6">
                          <div 
                            className="w-2 h-2 rounded-full animate-pulse" 
                            style={{ backgroundColor: currentColors.primary }}
                          ></div>
                          <div 
                            className="w-16 h-px" 
                            style={{ 
                              background: `linear-gradient(to right, transparent, ${currentColors.primary}, transparent)` 
                            }}
                          ></div>
                          <div 
                            className="w-2 h-2 rounded-full animate-pulse" 
                            style={{ backgroundColor: currentColors.secondary, animationDelay: '0.5s' }}
                          ></div>
                        </div>
                      </div>

                      <div 
                        className="backdrop-blur-sm rounded-3xl p-6 mb-6 border shadow-2xl" 
                        style={{ 
                          background: `linear-gradient(to right, ${currentColors.primary}30, ${currentColors.secondary}30)`,
                          borderColor: `${currentColors.primary}20`
                        }}
                      >
                        <h1 
                          className="text-2xl font-bold font-luxury drop-shadow-lg mb-4 tracking-wide" 
                          style={{ color: currentColors.primary }}
                        >
                          {customizedTemplate.title}
                        </h1>
                        <div className="flex justify-center space-x-2">
                          <Leaf 
                            className="h-4 w-4" 
                            style={{ color: currentColors.primary }}
                          />
                          <div 
                            className="w-12 h-px mt-2" 
                            style={{ 
                              background: `linear-gradient(to right, transparent, ${currentColors.primary}, transparent)` 
                            }}
                          ></div>
                          <Feather 
                            className="h-4 w-4" 
                            style={{ color: currentColors.secondary }}
                          />
                        </div>
                      </div>

                      <div 
                        className="backdrop-blur-sm rounded-2xl p-5 mb-6 border shadow-xl" 
                        style={{ 
                          background: `linear-gradient(to right, ${currentColors.secondary}40, ${currentColors.accent}40)`,
                          borderColor: `${currentColors.secondary}30`
                        }}
                      >
                        <div className="flex justify-center mb-3">
                          <div className="flex space-x-2">
                            <Leaf 
                              className="h-4 w-4 animate-float" 
                              style={{ color: currentColors.primary }}
                            />
                            <Heart 
                              className="h-5 w-5" 
                              style={{ color: currentColors.accent }}
                            />
                            <Feather 
                              className="h-4 w-4 animate-float" 
                              style={{ color: currentColors.primary, animationDelay: '1s' }}
                            />
                          </div>
                        </div>
                        <p 
                          className="text-sm mb-2 tracking-wide" 
                          style={{ color: `${currentColors.primary}cc` }}
                        >
                          Invité d'honneur
                        </p>
                        <p 
                          className="text-xl font-semibold tracking-wide" 
                          style={{ color: currentColors.primary }}
                        >
                          [Nom de l'invité]
                        </p>
                        <div 
                          className="w-16 h-px mx-auto mt-3 mb-3" 
                          style={{ 
                            background: `linear-gradient(to right, transparent, ${currentColors.secondary}, transparent)` 
                          }}
                        ></div>
                        <p 
                          className="text-sm tracking-wide" 
                          style={{ color: currentColors.secondary }}
                        >
                          Place n° [Numéro de table]
                        </p>
                      </div>

                      <div 
                        className="bg-black/20 backdrop-blur-sm rounded-2xl p-5 mb-6 border shadow-xl" 
                        style={{ borderColor: `${currentColors.primary}20` }}
                      >
                        <div className="flex justify-center mb-4">
                          <div className="flex space-x-2">
                            <Sun 
                              className="h-4 w-4" 
                              style={{ color: currentColors.accent }}
                            />
                            <Leaf 
                              className="h-4 w-4" 
                              style={{ color: currentColors.primary }}
                            />
                            <Sun 
                              className="h-4 w-4" 
                              style={{ color: currentColors.accent }}
                            />
                          </div>
                        </div>
                        <p className="text-neutral-100 leading-relaxed text-sm italic tracking-wide">
                          {customizedTemplate.invitationText}
                        </p>
                      </div>

                      <div className="space-y-4 mb-6">
                        <div 
                          className="backdrop-blur-sm rounded-xl p-4 border" 
                          style={{ 
                            background: `linear-gradient(to right, ${currentColors.primary}40, ${currentColors.secondary}40)`,
                            borderColor: `${currentColors.primary}30`
                          }}
                        >
                          <div className="flex items-center justify-center text-white">
                            <Calendar 
                              className="h-5 w-5 mr-3" 
                              style={{ color: currentColors.primary }}
                            />
                            <div className="text-center">
                              <p className="font-bold text-lg tracking-wide">{customizedTemplate.eventDate}</p>
                              <p 
                                className="text-sm tracking-wide" 
                                style={{ color: currentColors.primary }}
                              >
                                {customizedTemplate.eventTime}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className="backdrop-blur-sm rounded-xl p-4 border" 
                          style={{ 
                            background: `linear-gradient(to right, ${currentColors.secondary}40, ${currentColors.accent}40)`,
                            borderColor: `${currentColors.secondary}30`
                          }}
                        >
                          <div className="flex items-center justify-center text-white">
                            <MapPin 
                              className="h-5 w-5 mr-3" 
                              style={{ color: currentColors.secondary }}
                            />
                            <p className="text-sm text-center tracking-wide">{customizedTemplate.eventLocation}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div 
                        className="backdrop-blur-sm rounded-2xl p-4 border shadow-xl" 
                        style={{ 
                          background: `linear-gradient(to right, ${currentColors.primary}50, ${currentColors.secondary}50)`,
                          borderColor: `${currentColors.primary}40`
                        }}
                      >
                        <h3 
                          className="font-bold mb-4 flex items-center justify-center tracking-wide" 
                          style={{ color: currentColors.primary }}
                        >
                          <div 
                            className="w-4 h-4 rounded-full mr-3 animate-pulse" 
                            style={{ backgroundColor: currentColors.primary }}
                          ></div>
                          Confirmation Naturelle
                        </h3>
                        <button
                          className="w-full py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 tracking-wide shadow-2xl"
                          style={{
                            background: `linear-gradient(to right, ${currentColors.primary}, ${currentColors.secondary})`,
                            color: '#1e293b'
                          }}
                        >
                          <span className="flex items-center justify-center">
                            <Heart className="h-5 w-5 mr-2" />
                            Confirmer ma Présence
                          </span>
                        </button>
                      </div>

                      <div 
                        className="backdrop-blur-sm rounded-2xl p-4 border shadow-xl" 
                        style={{ 
                          background: `linear-gradient(to right, ${currentColors.secondary}50, ${currentColors.accent}50)`,
                          borderColor: `${currentColors.secondary}40`
                        }}
                      >
                        <h3 
                          className="font-bold mb-4 flex items-center justify-center tracking-wide" 
                          style={{ color: currentColors.secondary }}
                        >
                          <div 
                            className="w-4 h-4 rounded-full mr-3 animate-pulse" 
                            style={{ backgroundColor: currentColors.secondary }}
                          ></div>
                          Sélection Bio
                        </h3>
                        <select
                          className="w-full bg-slate-800/90 text-white border rounded-2xl px-4 py-3 focus:ring-2 transition-all duration-200 font-medium"
                          style={{ 
                            borderColor: `${currentColors.secondary}40`,
                            color: currentColors.secondary
                          }}
                        >
                          <option value="">Choisissez votre nectar</option>
                          {customizedTemplate.drinkOptions.map((drink) => (
                            <option key={drink} value={drink}>{drink}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContentTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Titre de l'événement
        </label>
        <input
          type="text"
          value={customizedTemplate.title}
          onChange={(e) => handleContentChange('title', e.target.value)}
          className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
          placeholder="Ex: Mariage de Sophie & Lucas"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Texte d'invitation
        </label>
        <textarea
          value={customizedTemplate.invitationText}
          onChange={(e) => handleContentChange('invitationText', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 resize-none"
          placeholder="Votre message d'invitation personnalisé..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Date de l'événement
          </label>
          <input
            type="text"
            value={customizedTemplate.eventDate}
            onChange={(e) => handleContentChange('eventDate', e.target.value)}
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
            placeholder="Ex: 15 Juin 2024"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Heure de l'événement
          </label>
          <input
            type="text"
            value={customizedTemplate.eventTime}
            onChange={(e) => handleContentChange('eventTime', e.target.value)}
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
            placeholder="Ex: 16h00"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Lieu de l'événement
        </label>
        <input
          type="text"
          value={customizedTemplate.eventLocation}
          onChange={(e) => handleContentChange('eventLocation', e.target.value)}
          className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
          placeholder="Ex: Château de Versailles, Versailles"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Options de boissons
        </label>
        <div className="space-y-2">
          {customizedTemplate.drinkOptions.map((drink, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={drink}
                onChange={(e) => {
                  const newOptions = [...customizedTemplate.drinkOptions];
                  newOptions[index] = e.target.value;
                  handleDrinkOptionsChange(newOptions);
                }}
                className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
              />
              <button
                onClick={() => {
                  const newOptions = customizedTemplate.drinkOptions.filter((_, i) => i !== index);
                  handleDrinkOptionsChange(newOptions);
                }}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const newOptions = [...customizedTemplate.drinkOptions, 'Nouvelle boisson'];
              handleDrinkOptionsChange(newOptions);
            }}
            className="w-full px-4 py-2 border-2 border-dashed border-neutral-300 text-neutral-600 rounded-lg hover:border-amber-400 hover:text-amber-600 transition-all duration-200 font-medium"
          >
            + Ajouter une boisson
          </button>
        </div>
      </div>
    </div>
  );

  const renderColorsTab = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Personnalisation des couleurs
        </h3>
        <p className="text-slate-600">
          {templateStyle === 'boheme' 
            ? 'Adaptez les couleurs naturelles à votre style bohème'
            : 'Personnalisez la palette de couleurs de votre invitation'
          }
        </p>
      </div>

      {/* Aperçu des couleurs actuelles */}
      <div className="bg-gradient-to-r from-neutral-50 to-amber-50/30 rounded-xl p-6 border border-neutral-200/50">
        <h4 className="font-semibold text-slate-900 mb-4">Aperçu des couleurs</h4>
        <div className="flex justify-center space-x-4">
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full shadow-lg border-4 border-white mb-2"
              style={{ backgroundColor: currentColors.primary }}
            ></div>
            <p className="text-xs font-medium text-slate-600">Primaire</p>
          </div>
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full shadow-lg border-4 border-white mb-2"
              style={{ backgroundColor: currentColors.secondary }}
            ></div>
            <p className="text-xs font-medium text-slate-600">Secondaire</p>
          </div>
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full shadow-lg border-4 border-white mb-2"
              style={{ backgroundColor: currentColors.accent }}
            ></div>
            <p className="text-xs font-medium text-slate-600">Accent</p>
          </div>
        </div>
      </div>

      {/* Sélecteurs de couleurs */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Couleur primaire
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="color"
              value={currentColors.primary}
              onChange={(e) => handleColorChange('primary', e.target.value)}
              className="w-16 h-12 rounded-lg border-2 border-neutral-300 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
            />
            <input
              type="text"
              value={currentColors.primary}
              onChange={(e) => handleColorChange('primary', e.target.value)}
              className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 font-mono"
              placeholder="#f59e0b"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Couleur secondaire
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="color"
              value={currentColors.secondary}
              onChange={(e) => handleColorChange('secondary', e.target.value)}
              className="w-16 h-12 rounded-lg border-2 border-neutral-300 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
            />
            <input
              type="text"
              value={currentColors.secondary}
              onChange={(e) => handleColorChange('secondary', e.target.value)}
              className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 font-mono"
              placeholder="#d97706"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Couleur d'accent
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="color"
              value={currentColors.accent}
              onChange={(e) => handleColorChange('accent', e.target.value)}
              className="w-16 h-12 rounded-lg border-2 border-neutral-300 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
            />
            <input
              type="text"
              value={currentColors.accent}
              onChange={(e) => handleColorChange('accent', e.target.value)}
              className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 font-mono"
              placeholder="#f43f5e"
            />
          </div>
        </div>
      </div>

      {/* Palettes prédéfinies selon le style */}
      <div>
        <h4 className="font-semibold text-slate-900 mb-4">
          {templateStyle === 'boheme' ? 'Palettes naturelles' : 'Palettes prédéfinies'}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {templateStyle === 'boheme' ? (
            // Palettes bohèmes
            <>
              <button
                onClick={() => {
                  handleColorChange('primary', '#10b981');
                  handleColorChange('secondary', '#059669');
                  handleColorChange('accent', '#14b8a6');
                }}
                className="p-4 rounded-xl border-2 border-neutral-200 hover:border-emerald-400 transition-all duration-300 group"
              >
                <div className="flex space-x-2 mb-2">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full"></div>
                  <div className="w-6 h-6 bg-emerald-600 rounded-full"></div>
                  <div className="w-6 h-6 bg-teal-500 rounded-full"></div>
                </div>
                <p className="text-sm font-medium text-slate-700 group-hover:text-emerald-700">Émeraude Nature</p>
              </button>

              <button
                onClick={() => {
                  handleColorChange('primary', '#059669');
                  handleColorChange('secondary', '#047857');
                  handleColorChange('accent', '#0d9488');
                }}
                className="p-4 rounded-xl border-2 border-neutral-200 hover:border-teal-400 transition-all duration-300 group"
              >
                <div className="flex space-x-2 mb-2">
                  <div className="w-6 h-6 bg-emerald-600 rounded-full"></div>
                  <div className="w-6 h-6 bg-emerald-700 rounded-full"></div>
                  <div className="w-6 h-6 bg-teal-600 rounded-full"></div>
                </div>
                <p className="text-sm font-medium text-slate-700 group-hover:text-teal-700">Forêt Profonde</p>
              </button>

              <button
                onClick={() => {
                  handleColorChange('primary', '#84cc16');
                  handleColorChange('secondary', '#65a30d');
                  handleColorChange('accent', '#22c55e');
                }}
                className="p-4 rounded-xl border-2 border-neutral-200 hover:border-lime-400 transition-all duration-300 group"
              >
                <div className="flex space-x-2 mb-2">
                  <div className="w-6 h-6 bg-lime-500 rounded-full"></div>
                  <div className="w-6 h-6 bg-lime-600 rounded-full"></div>
                  <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                </div>
                <p className="text-sm font-medium text-slate-700 group-hover:text-lime-700">Prairie Verte</p>
              </button>

              <button
                onClick={() => {
                  handleColorChange('primary', '#0891b2');
                  handleColorChange('secondary', '#0e7490');
                  handleColorChange('accent', '#06b6d4');
                }}
                className="p-4 rounded-xl border-2 border-neutral-200 hover:border-cyan-400 transition-all duration-300 group"
              >
                <div className="flex space-x-2 mb-2">
                  <div className="w-6 h-6 bg-cyan-600 rounded-full"></div>
                  <div className="w-6 h-6 bg-cyan-700 rounded-full"></div>
                  <div className="w-6 h-6 bg-cyan-500 rounded-full"></div>
                </div>
                <p className="text-sm font-medium text-slate-700 group-hover:text-cyan-700">Océan Calme</p>
              </button>

              <button
                onClick={() => {
                  handleColorChange('primary', '#7c3aed');
                  handleColorChange('secondary', '#6d28d9');
                  handleColorChange('accent', '#8b5cf6');
                }}
                className="p-4 rounded-xl border-2 border-neutral-200 hover:border-violet-400 transition-all duration-300 group"
              >
                <div className="flex space-x-2 mb-2">
                  <div className="w-6 h-6 bg-violet-600 rounded-full"></div>
                  <div className="w-6 h-6 bg-violet-700 rounded-full"></div>
                  <div className="w-6 h-6 bg-violet-500 rounded-full"></div>
                </div>
                <p className="text-sm font-medium text-slate-700 group-hover:text-violet-700">Lavande Mystique</p>
              </button>

              <button
                onClick={() => {
                  handleColorChange('primary', '#dc2626');
                  handleColorChange('secondary', '#b91c1c');
                  handleColorChange('accent', '#ef4444');
                }}
                className="p-4 rounded-xl border-2 border-neutral-200 hover:border-red-400 transition-all duration-300 group"
              >
                <div className="flex space-x-2 mb-2">
                  <div className="w-6 h-6 bg-red-600 rounded-full"></div>
                  <div className="w-6 h-6 bg-red-700 rounded-full"></div>
                  <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                </div>
                <p className="text-sm font-medium text-slate-700 group-hover:text-red-700">Coucher Soleil</p>
              </button>
            </>
          ) : (
            // Palettes classiques
            <>
              <button
                onClick={() => {
                  handleColorChange('primary', '#f59e0b');
                  handleColorChange('secondary', '#d97706');
                  handleColorChange('accent', '#f43f5e');
                }}
                className="p-4 rounded-xl border-2 border-neutral-200 hover:border-amber-400 transition-all duration-300 group"
              >
                <div className="flex space-x-2 mb-2">
                  <div className="w-6 h-6 bg-amber-500 rounded-full"></div>
                  <div className="w-6 h-6 bg-amber-600 rounded-full"></div>
                  <div className="w-6 h-6 bg-rose-500 rounded-full"></div>
                </div>
                <p className="text-sm font-medium text-slate-700 group-hover:text-amber-700">Or & Rose</p>
              </button>

              <button
                onClick={() => {
                  handleColorChange('primary', '#8b5cf6');
                  handleColorChange('secondary', '#7c3aed');
                  handleColorChange('accent', '#ec4899');
                }}
                className="p-4 rounded-xl border-2 border-neutral-200 hover:border-purple-400 transition-all duration-300 group"
              >
                <div className="flex space-x-2 mb-2">
                  <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
                  <div className="w-6 h-6 bg-purple-600 rounded-full"></div>
                  <div className="w-6 h-6 bg-pink-500 rounded-full"></div>
                </div>
                <p className="text-sm font-medium text-slate-700 group-hover:text-purple-700">Violet Royal</p>
              </button>

              <button
                onClick={() => {
                  handleColorChange('primary', '#10b981');
                  handleColorChange('secondary', '#059669');
                  handleColorChange('accent', '#3b82f6');
                }}
                className="p-4 rounded-xl border-2 border-neutral-200 hover:border-emerald-400 transition-all duration-300 group"
              >
                <div className="flex space-x-2 mb-2">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full"></div>
                  <div className="w-6 h-6 bg-emerald-600 rounded-full"></div>
                  <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                </div>
                <p className="text-sm font-medium text-slate-700 group-hover:text-emerald-700">Émeraude & Saphir</p>
              </button>

              <button
                onClick={() => {
                  handleColorChange('primary', '#dc2626');
                  handleColorChange('secondary', '#b91c1c');
                  handleColorChange('accent', '#f59e0b');
                }}
                className="p-4 rounded-xl border-2 border-neutral-200 hover:border-red-400 transition-all duration-300 group"
              >
                <div className="flex space-x-2 mb-2">
                  <div className="w-6 h-6 bg-red-600 rounded-full"></div>
                  <div className="w-6 h-6 bg-red-700 rounded-full"></div>
                  <div className="w-6 h-6 bg-amber-500 rounded-full"></div>
                </div>
                <p className="text-sm font-medium text-slate-700 group-hover:text-red-700">Rouge Passion</p>
              </button>

              <button
                onClick={() => {
                  handleColorChange('primary', '#0891b2');
                  handleColorChange('secondary', '#0e7490');
                  handleColorChange('accent', '#06b6d4');
                }}
                className="p-4 rounded-xl border-2 border-neutral-200 hover:border-cyan-400 transition-all duration-300 group"
              >
                <div className="flex space-x-2 mb-2">
                  <div className="w-6 h-6 bg-cyan-600 rounded-full"></div>
                  <div className="w-6 h-6 bg-cyan-700 rounded-full"></div>
                  <div className="w-6 h-6 bg-cyan-500 rounded-full"></div>
                </div>
                <p className="text-sm font-medium text-slate-700 group-hover:text-cyan-700">Bleu Océan</p>
              </button>

              <button
                onClick={() => {
                  handleColorChange('primary', '#7c2d12');
                  handleColorChange('secondary', '#92400e');
                  handleColorChange('accent', '#f59e0b');
                }}
                className="p-4 rounded-xl border-2 border-neutral-200 hover:border-orange-400 transition-all duration-300 group"
              >
                <div className="flex space-x-2 mb-2">
                  <div className="w-6 h-6 bg-orange-800 rounded-full"></div>
                  <div className="w-6 h-6 bg-orange-700 rounded-full"></div>
                  <div className="w-6 h-6 bg-amber-500 rounded-full"></div>
                </div>
                <p className="text-sm font-medium text-slate-700 group-hover:text-orange-700">Automne Doré</p>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderLayoutTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Image de fond
        </label>
        <input
          type="url"
          value={customizedTemplate.backgroundImage}
          onChange={(e) => handleContentChange('backgroundImage', e.target.value)}
          className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
          placeholder="URL de l'image de fond"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Nom du modèle
        </label>
        <input
          type="text"
          value={customizedTemplate.name}
          onChange={(e) => handleContentChange('name', e.target.value)}
          className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
          placeholder="Nom de votre modèle personnalisé"
        />
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-rose-50 rounded-xl p-6 border border-amber-200/50">
        <h4 className="font-semibold text-amber-800 mb-3">Conseils de personnalisation</h4>
        <ul className="text-amber-700 text-sm space-y-2">
          <li>• Utilisez des images haute résolution (min. 1200px de largeur)</li>
          <li>• Privilégiez des images avec un bon contraste pour la lisibilité</li>
          <li>• Les couleurs sombres fonctionnent mieux pour le texte blanc</li>
          <li>• Testez votre invitation sur différents appareils</li>
        </ul>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'content':
        return renderContentTab();
      case 'colors':
        return renderColorsTab();
      case 'layout':
        return renderLayoutTab();
      default:
        return renderContentTab();
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${
      templateStyle === 'boheme' 
        ? 'bg-gradient-to-br from-slate-900 via-emerald-900/30 to-slate-800'
        : 'bg-gradient-to-br from-slate-900 via-amber-900/20 to-slate-800'
    }`}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {templateStyle === 'boheme' ? (
          <>
            <div className="absolute top-10 right-10 w-60 h-60 bg-gradient-to-r from-emerald-300/8 to-teal-300/8 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-10 left-10 w-48 h-48 bg-gradient-to-r from-emerald-400/8 to-emerald-200/8 rounded-full blur-3xl animate-bounce-slow"></div>
          </>
        ) : (
          <>
            <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-r from-amber-400/10 to-rose-400/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-r from-amber-500/10 to-amber-300/10 rounded-full blur-3xl animate-bounce-slow"></div>
          </>
        )}
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className={`flex items-center transition-all duration-300 group ${
                templateStyle === 'boheme' 
                  ? 'text-emerald-400 hover:text-emerald-300'
                  : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Retour au dashboard
            </button>
            
            <div className="text-center">
              <h1 className={`text-3xl md:text-4xl font-bold ${
                templateStyle === 'boheme' 
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 bg-clip-text text-transparent'
              }`}>
                Personnalisation du Template
              </h1>
              <p className="text-neutral-300 mt-2">
                {templateStyle === 'boheme' 
                  ? 'Adaptez votre invitation bohème à votre style naturel'
                  : 'Personnalisez votre invitation selon vos goûts'
                }
              </p>
            </div>

            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center transition-all duration-300 group ${
                templateStyle === 'boheme' 
                  ? 'text-emerald-400 hover:text-emerald-300'
                  : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              {showPreview ? <EyeOff className="h-5 w-5 mr-2" /> : <Eye className="h-5 w-5 mr-2" />}
              {showPreview ? 'Masquer' : 'Aperçu'}
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Preview */}
            {showPreview && (
              <div className="flex justify-center animate-slide-up">
                {renderPreview()}
              </div>
            )}

            {/* Customization Panel */}
            <div className={`animate-slide-up ${showPreview ? '' : 'lg:col-span-2 max-w-4xl mx-auto'}`}>
              <div className={`backdrop-blur-xl rounded-3xl shadow-luxury p-6 ${
                templateStyle === 'boheme' 
                  ? 'bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-400/30'
                  : 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-amber-500/20'
              }`}>
                {/* Tabs */}
                <div className="flex space-x-1 mb-8 bg-black/20 rounded-2xl p-2">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-300 font-medium ${
                          activeTab === tab.id
                            ? templateStyle === 'boheme'
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                              : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 shadow-glow-amber'
                            : 'text-neutral-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span className="hidden sm:block">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content */}
                <div className="text-white">
                  {renderTabContent()}
                </div>

                {/* Save Button */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-luxury transform hover:scale-105 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-500 ${
                      templateStyle === 'boheme'
                        ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 text-white hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-600'
                        : 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-900 hover:from-amber-600 hover:via-amber-700 hover:to-amber-600 shadow-glow-amber'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <span className="relative flex items-center justify-center">
                      {isSaving ? (
                        <>
                          <div className={`w-5 h-5 border-2 rounded-full animate-spin mr-2 ${
                            templateStyle === 'boheme'
                              ? 'border-white/30 border-t-white'
                              : 'border-slate-900/30 border-t-slate-900'
                          }`}></div>
                          Sauvegarde en cours...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Sauvegarder les modifications
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateCustomization;