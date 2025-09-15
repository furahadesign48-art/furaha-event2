import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Palette, 
  Type, 
  Layout, 
  Image, 
  Calendar, 
  MapPin, 
  Users, 
  Wine, 
  MessageCircle, 
  Heart, 
  Gift, 
  GraduationCap, 
  Sparkles, 
  Check, 
  QrCode, 
  Camera, 
  User, 
  X,
  Leaf,
  Feather,
  Sun
} from 'lucide-react';

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
      title: string;
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
  const [activeTab, setActiveTab] = useState('content');
  const [isSaving, setIsSaving] = useState(false);
  const [customizedTemplate, setCustomizedTemplate] = useState<TemplateData>(() => {
    // Déterminer le style du template
    const isBoehmeStyle = template.name.toLowerCase().includes('bohème') || 
                         template.name.toLowerCase().includes('nature') ||
                         template.originalTemplateId === 'wedding-boheme-nature';
    
    // Couleurs par défaut selon le style
    const defaultColors = isBoehmeStyle ? {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#14b8a6'
    } : {
      primary: '#f59e0b',
      secondary: '#d97706',
      accent: '#f43f5e'
    };

    return {
      ...template,
      colors: template.colors || template.customizations?.colors || defaultColors,
      customizations: {
        colors: template.customizations?.colors || template.colors || defaultColors,
        fonts: template.customizations?.fonts || {
          title: 'Playfair Display',
          body: 'Inter'
        },
        layout: template.customizations?.layout || 'default',
        ...template.customizations
      }
    };
  });

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

  const handleInputChange = (field: keyof TemplateData, value: string | string[]) => {
    setCustomizedTemplate(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleColorChange = (colorType: 'primary' | 'secondary' | 'accent', color: string) => {
    setCustomizedTemplate(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorType]: color
      },
      customizations: {
        ...prev.customizations,
        colors: {
          ...prev.customizations?.colors,
          [colorType]: color
        }
      }
    }));
  };

  const handleFontChange = (fontType: 'title' | 'body', font: string) => {
    setCustomizedTemplate(prev => ({
      ...prev,
      customizations: {
        ...prev.customizations,
        fonts: {
          ...prev.customizations?.fonts,
          [fontType]: font
        }
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(customizedTemplate);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'content', label: 'Contenu', icon: Type },
    { id: 'colors', label: 'Couleurs', icon: Palette },
    { id: 'fonts', label: 'Polices', icon: Type },
    { id: 'layout', label: 'Mise en page', icon: Layout },
    { id: 'preview', label: 'Aperçu', icon: Eye }
  ];

  // Palettes de couleurs prédéfinies selon le style
  const getColorPalettes = () => {
    if (templateStyle === 'boheme') {
      return [
        { name: 'Nature Émeraude', primary: '#10b981', secondary: '#059669', accent: '#14b8a6' },
        { name: 'Forêt Profonde', primary: '#065f46', secondary: '#047857', accent: '#0d9488' },
        { name: 'Prairie Dorée', primary: '#84cc16', secondary: '#65a30d', accent: '#eab308' },
        { name: 'Océan Turquoise', primary: '#06b6d4', secondary: '#0891b2', accent: '#0e7490' },
        { name: 'Terre & Sable', primary: '#a3a3a3', secondary: '#737373', accent: '#d97706' },
        { name: 'Coucher de Soleil', primary: '#f97316', secondary: '#ea580c', accent: '#dc2626' }
      ];
    } else {
      return [
        { name: 'Or & Rose', primary: '#f59e0b', secondary: '#d97706', accent: '#f43f5e' },
        { name: 'Violet Royal', primary: '#8b5cf6', secondary: '#7c3aed', accent: '#ec4899' },
        { name: 'Émeraude Élégant', primary: '#10b981', secondary: '#059669', accent: '#3b82f6' },
        { name: 'Rouge Passion', primary: '#ef4444', secondary: '#dc2626', accent: '#f59e0b' },
        { name: 'Bleu Saphir', primary: '#3b82f6', secondary: '#2563eb', accent: '#8b5cf6' },
        { name: 'Rose Poudré', primary: '#ec4899', secondary: '#db2777', accent: '#f59e0b' }
      ];
    }
  };

  const renderContentTab = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Titre de l'événement
        </label>
        <input
          type="text"
          value={customizedTemplate.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="w-full px-4 py-3 border border-neutral-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          placeholder="Titre de votre événement"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Texte d'invitation
        </label>
        <textarea
          value={customizedTemplate.invitationText}
          onChange={(e) => handleInputChange('invitationText', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-neutral-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 resize-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          placeholder="Votre message d'invitation personnalisé"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Date de l'événement
          </label>
          <input
            type="text"
            value={customizedTemplate.eventDate}
            onChange={(e) => handleInputChange('eventDate', e.target.value)}
            className="w-full px-4 py-3 border border-neutral-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            placeholder="Ex: 15 Juin 2024"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Heure de l'événement
          </label>
          <input
            type="text"
            value={customizedTemplate.eventTime}
            onChange={(e) => handleInputChange('eventTime', e.target.value)}
            className="w-full px-4 py-3 border border-neutral-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            placeholder="Ex: 16h00"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Lieu de l'événement
        </label>
        <input
          type="text"
          value={customizedTemplate.eventLocation}
          onChange={(e) => handleInputChange('eventLocation', e.target.value)}
          className="w-full px-4 py-3 border border-neutral-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          placeholder="Adresse complète du lieu"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Options de boissons
        </label>
        <div className="space-y-3">
          {customizedTemplate.drinkOptions.map((drink, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="text"
                value={drink}
                onChange={(e) => {
                  const newDrinks = [...customizedTemplate.drinkOptions];
                  newDrinks[index] = e.target.value;
                  handleInputChange('drinkOptions', newDrinks);
                }}
                className="flex-1 px-4 py-3 border border-neutral-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                placeholder={`Boisson ${index + 1}`}
              />
              <button
                onClick={() => {
                  const newDrinks = customizedTemplate.drinkOptions.filter((_, i) => i !== index);
                  handleInputChange('drinkOptions', newDrinks);
                }}
                className="p-3 text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-600 rounded-xl transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const newDrinks = [...customizedTemplate.drinkOptions, ''];
              handleInputChange('drinkOptions', newDrinks);
            }}
            className="w-full px-4 py-3 border-2 border-dashed border-neutral-300 dark:border-slate-600 rounded-xl text-neutral-500 dark:text-slate-400 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 transition-all duration-200"
          >
            + Ajouter une boisson
          </button>
        </div>
      </div>
    </div>
  );

  const renderColorsTab = () => {
    const colorPalettes = getColorPalettes();
    const currentColors = customizedTemplate.colors || customizedTemplate.customizations?.colors;

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Couleurs actuelles */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${
            templateStyle === 'boheme' ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'
          }`}>
            Couleurs actuelles
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Couleur principale
              </label>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-xl shadow-lg border-2 border-white"
                  style={{ backgroundColor: currentColors?.primary }}
                ></div>
                <input
                  type="color"
                  value={currentColors?.primary || '#f59e0b'}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="w-16 h-12 rounded-xl border-2 border-neutral-300 dark:border-slate-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={currentColors?.primary || '#f59e0b'}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="flex-1 px-3 py-2 border border-neutral-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Couleur secondaire
              </label>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-xl shadow-lg border-2 border-white"
                  style={{ backgroundColor: currentColors?.secondary }}
                ></div>
                <input
                  type="color"
                  value={currentColors?.secondary || '#d97706'}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  className="w-16 h-12 rounded-xl border-2 border-neutral-300 dark:border-slate-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={currentColors?.secondary || '#d97706'}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  className="flex-1 px-3 py-2 border border-neutral-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Couleur d'accent
              </label>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-xl shadow-lg border-2 border-white"
                  style={{ backgroundColor: currentColors?.accent }}
                ></div>
                <input
                  type="color"
                  value={currentColors?.accent || '#f43f5e'}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                  className="w-16 h-12 rounded-xl border-2 border-neutral-300 dark:border-slate-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={currentColors?.accent || '#f43f5e'}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                  className="flex-1 px-3 py-2 border border-neutral-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Palettes prédéfinies */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${
            templateStyle === 'boheme' ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'
          }`}>
            {templateStyle === 'boheme' ? 'Palettes Naturelles' : 'Palettes Prédéfinies'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {colorPalettes.map((palette, index) => (
              <div
                key={index}
                className="p-4 border border-neutral-200 dark:border-slate-600 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer bg-white dark:bg-slate-700"
                onClick={() => {
                  handleColorChange('primary', palette.primary);
                  handleColorChange('secondary', palette.secondary);
                  handleColorChange('accent', palette.accent);
                }}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex space-x-2">
                    <div 
                      className="w-8 h-8 rounded-lg shadow-sm"
                      style={{ backgroundColor: palette.primary }}
                    ></div>
                    <div 
                      className="w-8 h-8 rounded-lg shadow-sm"
                      style={{ backgroundColor: palette.secondary }}
                    ></div>
                    <div 
                      className="w-8 h-8 rounded-lg shadow-sm"
                      style={{ backgroundColor: palette.accent }}
                    ></div>
                  </div>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{palette.name}</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <div>Principal: {palette.primary}</div>
                  <div>Secondaire: {palette.secondary}</div>
                  <div>Accent: {palette.accent}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderFontsTab = () => {
    const titleFonts = [
      'Playfair Display',
      'Merriweather',
      'Lora',
      'Crimson Text',
      'Libre Baskerville'
    ];

    const bodyFonts = [
      'Inter',
      'Open Sans',
      'Lato',
      'Source Sans Pro',
      'Nunito'
    ];

    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Police du titre
          </label>
          <select
            value={customizedTemplate.customizations?.fonts?.title || 'Playfair Display'}
            onChange={(e) => handleFontChange('title', e.target.value)}
            className="w-full px-4 py-3 border border-neutral-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          >
            {titleFonts.map((font) => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Police du texte
          </label>
          <select
            value={customizedTemplate.customizations?.fonts?.body || 'Inter'}
            onChange={(e) => handleFontChange('body', e.target.value)}
            className="w-full px-4 py-3 border border-neutral-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          >
            {bodyFonts.map((font) => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>

        {/* Aperçu des polices */}
        <div className="bg-gradient-to-r from-neutral-50 to-amber-50/30 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6 border border-neutral-200/50 dark:border-slate-600/50">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Aperçu des polices</h4>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Titre :</p>
              <h3 
                className="text-2xl font-bold text-slate-900 dark:text-slate-100"
                style={{ fontFamily: customizedTemplate.customizations?.fonts?.title || 'Playfair Display' }}
              >
                {customizedTemplate.title}
              </h3>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Texte :</p>
              <p 
                className="text-slate-700 dark:text-slate-300 leading-relaxed"
                style={{ fontFamily: customizedTemplate.customizations?.fonts?.body || 'Inter' }}
              >
                {customizedTemplate.invitationText.substring(0, 100)}...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLayoutTab = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Mise en page</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['default', 'centered', 'elegant', 'modern'].map((layoutType) => (
            <div
              key={layoutType}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                customizedTemplate.customizations?.layout === layoutType
                  ? 'border-amber-400 bg-amber-50 dark:bg-slate-600'
                  : 'border-neutral-200 dark:border-slate-600 hover:border-amber-300 bg-white dark:bg-slate-700'
              }`}
              onClick={() => {
                setCustomizedTemplate(prev => ({
                  ...prev,
                  customizations: {
                    ...prev.customizations,
                    layout: layoutType
                  }
                }));
              }}
            >
              <div className="w-full h-24 bg-gradient-to-br from-neutral-100 to-amber-100 dark:from-slate-600 dark:to-slate-500 rounded-lg mb-3 flex items-center justify-center">
                <Layout className="h-8 w-8 text-neutral-400 dark:text-slate-300" />
              </div>
              <p className="font-medium text-slate-900 dark:text-slate-100 capitalize">{layoutType}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Image de fond
        </label>
        <input
          type="url"
          value={customizedTemplate.backgroundImage}
          onChange={(e) => handleInputChange('backgroundImage', e.target.value)}
          className="w-full px-4 py-3 border border-neutral-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          placeholder="URL de l'image de fond"
        />
        {customizedTemplate.backgroundImage && (
          <div className="mt-3">
            <img
              src={customizedTemplate.backgroundImage}
              alt="Aperçu de l'image de fond"
              className="w-full h-32 object-cover rounded-xl border border-neutral-200 dark:border-slate-600"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderPreviewTab = () => {
    const currentColors = customizedTemplate.colors || customizedTemplate.customizations?.colors;
    const IconComponent = templateStyle === 'boheme' ? Leaf : Heart;

    return (
      <div className="animate-fade-in">
        <div className="flex justify-center">
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
                    <div className={`w-1 h-1 rounded-full animate-pulse ${
                      templateStyle === 'boheme' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}></div>
                    <div className={`w-1 h-1 rounded-full animate-pulse ${
                      templateStyle === 'boheme' ? 'bg-teal-400' : 'bg-amber-400'
                    }`} style={{ animationDelay: '0.3s' }}></div>
                    <div className={`w-1 h-1 rounded-full animate-pulse ${
                      templateStyle === 'boheme' ? 'bg-emerald-400' : 'bg-rose-400'
                    }`} style={{ animationDelay: '0.6s' }}></div>
                  </div>
                </div>
                
                {/* Invitation Content avec couleurs personnalisées */}
                <div className="h-full bg-cover bg-center bg-no-repeat relative overflow-y-auto" style={{ backgroundImage: `url(${customizedTemplate.backgroundImage})` }}>
                  <div className={`absolute inset-0 ${
                    templateStyle === 'boheme' 
                      ? 'bg-gradient-to-b from-black/50 via-black/20 to-black/60'
                      : 'bg-gradient-to-b from-black/60 via-black/40 to-black/70'
                  }`}></div>
                  
                  <div className="relative z-10 p-6 h-full flex flex-col justify-between text-center text-white">
                    
                    {templateStyle === 'boheme' ? (
                      // Style bohème avec couleurs personnalisées
                      <>
                        <div>
                          <div className="mb-8">
                            <div className="flex justify-center items-center mb-6">
                              <div className="relative">
                                <div className="flex items-center space-x-4">
                                  <Leaf 
                                    className="h-8 w-8 animate-float" 
                                    style={{ color: currentColors?.accent }}
                                  />
                                  <Sun 
                                    className="h-10 w-10 animate-glow" 
                                    style={{ color: currentColors?.primary }}
                                  />
                                  <Feather 
                                    className="h-8 w-8 animate-float" 
                                    style={{ color: currentColors?.secondary }}
                                    style={{ animationDelay: '1s' }}
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex justify-center space-x-4 mb-6">
                              <div 
                                className="w-2 h-2 rounded-full animate-pulse"
                                style={{ backgroundColor: currentColors?.primary }}
                              ></div>
                              <div 
                                className="w-16 h-px mt-1"
                                style={{ 
                                  background: `linear-gradient(to right, transparent, ${currentColors?.primary}, transparent)` 
                                }}
                              ></div>
                              <div 
                                className="w-2 h-2 rounded-full animate-pulse"
                                style={{ backgroundColor: currentColors?.accent, animationDelay: '0.5s' }}
                              ></div>
                            </div>
                          </div>

                          <div 
                            className="backdrop-blur-sm rounded-3xl p-6 mb-6 border shadow-2xl max-w-lg mx-auto"
                            style={{ 
                              background: `linear-gradient(to right, ${currentColors?.primary}30, ${currentColors?.secondary}30)`,
                              borderColor: `${currentColors?.primary}20`
                            }}
                          >
                            <h1 
                              className="text-2xl font-bold font-luxury drop-shadow-lg tracking-wide mb-4"
                              style={{ 
                                background: `linear-gradient(to right, ${currentColors?.primary}, ${currentColors?.accent}, ${currentColors?.primary})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                              }}
                            >
                              {customizedTemplate.title}
                            </h1>
                            <div className="flex justify-center space-x-2">
                              <Leaf 
                                className="h-4 w-4"
                                style={{ color: currentColors?.accent }}
                              />
                              <div 
                                className="w-12 h-px mt-2"
                                style={{ 
                                  background: `linear-gradient(to right, transparent, ${currentColors?.accent}, transparent)` 
                                }}
                              ></div>
                              <Feather 
                                className="h-4 w-4"
                                style={{ color: currentColors?.secondary }}
                              />
                            </div>
                          </div>

                          <div 
                            className="backdrop-blur-sm rounded-2xl p-5 mb-6 border shadow-xl"
                            style={{ 
                              background: `linear-gradient(to right, ${currentColors?.secondary}40, ${currentColors?.accent}40)`,
                              borderColor: `${currentColors?.accent}30`
                            }}
                          >
                            <div className="flex justify-center mb-3">
                              <div className="flex space-x-2">
                                <Leaf 
                                  className="h-4 w-4 animate-float"
                                  style={{ color: currentColors?.accent }}
                                />
                                <Heart 
                                  className="h-5 w-5"
                                  style={{ color: currentColors?.primary }}
                                />
                                <Feather 
                                  className="h-4 w-4 animate-float"
                                  style={{ color: currentColors?.accent, animationDelay: '1s' }}
                                />
                              </div>
                            </div>
                            <p 
                              className="text-sm mb-2 tracking-wide"
                              style={{ color: currentColors?.primary }}
                            >
                              Invité d'honneur
                            </p>
                            <p 
                              className="text-xl font-semibold tracking-wide"
                              style={{ color: currentColors?.accent }}
                            >
                              [Nom de l'invité]
                            </p>
                            <div 
                              className="w-16 h-px mx-auto mt-3 mb-3"
                              style={{ 
                                background: `linear-gradient(to right, transparent, ${currentColors?.secondary}, transparent)` 
                              }}
                            ></div>
                            <p 
                              className="text-sm tracking-wide"
                              style={{ color: currentColors?.secondary }}
                            >
                              Place n° [Numéro de table]
                            </p>
                          </div>

                          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-emerald-400/20 shadow-xl">
                            <div className="flex justify-center mb-4">
                              <div className="flex space-x-2">
                                <Sun 
                                  className="h-4 w-4"
                                  style={{ color: currentColors?.primary }}
                                />
                                <Leaf 
                                  className="h-4 w-4"
                                  style={{ color: currentColors?.accent }}
                                />
                                <Sun 
                                  className="h-4 w-4"
                                  style={{ color: currentColors?.primary }}
                                />
                              </div>
                            </div>
                            <p className="text-neutral-100 leading-relaxed text-sm italic tracking-wide">
                              {customizedTemplate.invitationText.substring(0, 120)}...
                            </p>
                          </div>

                          <div className="space-y-4 mb-6">
                            <div 
                              className="backdrop-blur-sm rounded-xl p-4 border"
                              style={{ 
                                background: `linear-gradient(to right, ${currentColors?.primary}40, ${currentColors?.secondary}40)`,
                                borderColor: `${currentColors?.primary}30`
                              }}
                            >
                              <div 
                                className="flex items-center justify-center"
                                style={{ color: currentColors?.accent }}
                              >
                                <Calendar 
                                  className="h-5 w-5 mr-3"
                                  style={{ color: currentColors?.accent }}
                                />
                                <div className="text-center">
                                  <p className="font-bold text-lg tracking-wide">{customizedTemplate.eventDate}</p>
                                  <p 
                                    className="text-sm tracking-wide"
                                    style={{ color: currentColors?.secondary }}
                                  >
                                    {customizedTemplate.eventTime}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div 
                              className="backdrop-blur-sm rounded-xl p-4 border"
                              style={{ 
                                background: `linear-gradient(to right, ${currentColors?.secondary}40, ${currentColors?.accent}40)`,
                                borderColor: `${currentColors?.secondary}30`
                              }}
                            >
                              <div 
                                className="flex items-center justify-center"
                                style={{ color: currentColors?.primary }}
                              >
                                <MapPin 
                                  className="h-5 w-5 mr-3"
                                  style={{ color: currentColors?.primary }}
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
                              background: `linear-gradient(to right, ${currentColors?.primary}50, ${currentColors?.secondary}50)`,
                              borderColor: `${currentColors?.primary}40`
                            }}
                          >
                            <h3 
                              className="font-bold mb-4 flex items-center justify-center tracking-wide"
                              style={{ color: currentColors?.accent }}
                            >
                              <div 
                                className="w-4 h-4 rounded-full mr-3 animate-pulse"
                                style={{ backgroundColor: currentColors?.accent }}
                              ></div>
                              Confirmation Naturelle
                            </h3>
                            <button
                              className="w-full py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 tracking-wide shadow-2xl"
                              style={{ 
                                background: `linear-gradient(to right, ${currentColors?.primary}, ${currentColors?.secondary})`,
                                color: '#1e293b'
                              }}
                            >
                              <span className="flex items-center justify-center">
                                <Heart className="h-5 w-5 mr-2" />
                                Confirmer ma Présence
                              </span>
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      // Style classique avec couleurs personnalisées
                      <>
                        <div>
                          <div className="mb-6">
                            <div className="flex justify-center space-x-2 mb-4">
                              <Sparkles 
                                className="h-6 w-6 animate-pulse" 
                                style={{ color: currentColors?.primary }} 
                              />
                              <IconComponent 
                                className="h-8 w-8" 
                                style={{ color: currentColors?.primary }} 
                              />
                              <Sparkles 
                                className="h-6 w-6 animate-pulse" 
                                style={{ color: currentColors?.primary }} 
                              />
                            </div>
                            
                            <div 
                              className="w-24 h-px mx-auto mb-4" 
                              style={{ 
                                background: `linear-gradient(to right, transparent, ${currentColors?.primary}, transparent)` 
                              }}
                            ></div>
                            <div className="flex justify-center space-x-2 mb-4">
                              <Sparkles 
                                className="h-4 w-4 animate-pulse" 
                                style={{ color: currentColors?.primary }} 
                              />
                              <Sparkles 
                                className="h-3 w-3 animate-pulse" 
                                style={{ color: currentColors?.secondary, animationDelay: '0.5s' }} 
                              />
                              <Sparkles 
                                className="h-4 w-4 animate-pulse" 
                                style={{ color: currentColors?.primary, animationDelay: '1s' }} 
                              />
                            </div>
                          </div>

                          <h1 
                            className="text-2xl font-bold font-luxury drop-shadow-lg mb-6"
                            style={{ 
                              background: `linear-gradient(to right, ${currentColors?.primary}, ${currentColors?.accent}, ${currentColors?.primary})`,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text'
                            }}
                          >
                            {customizedTemplate.title}
                          </h1>

                          <div 
                            className="backdrop-blur-sm rounded-2xl p-4 mb-6 border"
                            style={{ 
                              background: `linear-gradient(to right, ${currentColors?.primary}40, ${currentColors?.secondary}40)`,
                              borderColor: `${currentColors?.primary}30`
                            }}
                          >
                            <p 
                              className="text-sm mb-2" 
                              style={{ color: `${currentColors?.primary}cc` }}
                            >
                              Cher(e)
                            </p>
                            <p className="text-xl font-semibold text-white">[Nom de l'invité]</p>
                            <p 
                              className="text-sm mt-2" 
                              style={{ color: `${currentColors?.primary}dd` }}
                            >
                              Table n° [Numéro de table]
                            </p>
                          </div>

                          <div 
                            className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 mb-6 border"
                            style={{ borderColor: `${currentColors?.primary}20` }}
                          >
                            <p className="text-neutral-200 leading-relaxed text-sm">
                              {customizedTemplate.invitationText.substring(0, 120)}...
                            </p>
                          </div>

                          <div className="space-y-4 mb-6">
                            <div className="flex items-center justify-center text-neutral-200">
                              <Calendar 
                                className="h-5 w-5 mr-3" 
                                style={{ color: currentColors?.primary }} 
                              />
                              <div className="text-left">
                                <p className="font-semibold">{customizedTemplate.eventDate}</p>
                                <p 
                                  className="text-sm" 
                                  style={{ color: `${currentColors?.primary}dd` }}
                                >
                                  {customizedTemplate.eventTime}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-center text-neutral-200">
                              <MapPin 
                                className="h-5 w-5 mr-3" 
                                style={{ color: currentColors?.primary }} 
                              />
                              <p className="text-sm text-center">{customizedTemplate.eventLocation}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div 
                            className="backdrop-blur-sm rounded-2xl p-4 border"
                            style={{ 
                              background: `linear-gradient(to right, ${currentColors?.primary}50, ${currentColors?.secondary}50)`,
                              borderColor: `${currentColors?.primary}30`
                            }}
                          >
                            <h3 
                              className="font-semibold mb-3 flex items-center justify-center" 
                              style={{ color: `${currentColors?.primary}cc` }}
                            >
                              <Users className="h-4 w-4 mr-2" />
                              Confirmation de présence
                            </h3>
                            <button
                              className="w-full py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                              style={{
                                background: `linear-gradient(to right, ${currentColors?.primary}, ${currentColors?.secondary})`,
                                color: '#1e293b'
                              }}
                            >
                              Confirmer ma présence
                            </button>
                          </div>

                          <div 
                            className="backdrop-blur-sm rounded-2xl p-4 border"
                            style={{ 
                              background: `linear-gradient(to right, ${currentColors?.primary}50, ${currentColors?.secondary}50)`,
                              borderColor: `${currentColors?.primary}30`
                            }}
                          >
                            <h3 
                              className="font-semibold mb-3 flex items-center justify-center" 
                              style={{ color: `${currentColors?.primary}cc` }}
                            >
                              <Wine className="h-4 w-4 mr-2" />
                              Choix de boisson
                            </h3>
                            <select
                              className="w-full bg-slate-800/80 text-white border rounded-xl px-4 py-2 focus:ring-2 transition-all duration-200"
                              style={{ 
                                borderColor: `${currentColors?.primary}30`
                              }}
                            >
                              <option value="">Sélectionnez votre boisson</option>
                              {customizedTemplate.drinkOptions.slice(0, 3).map((drink) => (
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
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'content':
        return renderContentTab();
      case 'colors':
        return renderColorsTab();
      case 'fonts':
        return renderFontsTab();
      case 'layout':
        return renderLayoutTab();
      case 'preview':
        return renderPreviewTab();
      default:
        return renderContentTab();
    }
  };

  return (
    <div className={`min-h-screen ${
      templateStyle === 'boheme' 
        ? 'bg-gradient-to-br from-emerald-50 via-teal-50/30 to-emerald-100 dark:from-slate-900 dark:via-emerald-900/20 dark:to-slate-800'
        : 'bg-gradient-to-br from-neutral-50 via-amber-50/30 to-purple-50/20 dark:from-slate-900 dark:via-slate-800/30 dark:to-slate-900'
    }`}>
      {/* Header */}
      <header className={`shadow-luxury border-b ${
        templateStyle === 'boheme' 
          ? 'bg-gradient-to-r from-emerald-50/95 via-teal-50/90 to-emerald-50/95 border-emerald-200/30 dark:from-slate-800/95 dark:via-emerald-800/20 dark:to-slate-800/95 dark:border-emerald-600/30'
          : 'bg-gradient-to-r from-neutral-50/95 via-amber-50/90 to-neutral-50/95 border-amber-200/30 dark:from-slate-800/95 dark:via-slate-700/90 dark:to-slate-800/95 dark:border-slate-600/30'
      } backdrop-blur-xl`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className={`flex items-center transition-all duration-300 group ${
                  templateStyle === 'boheme' 
                    ? 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300'
                    : 'text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300'
                }`}
              >
                <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                Retour
              </button>
              
              <div>
                <h1 className={`text-xl font-bold ${
                  templateStyle === 'boheme' 
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 dark:from-emerald-400 dark:via-teal-400 dark:to-emerald-400 bg-clip-text text-transparent'
                    : 'bg-gradient-to-r from-slate-900 via-amber-700 to-slate-900 dark:from-slate-100 dark:via-amber-300 dark:to-slate-100 bg-clip-text text-transparent'
                }`}>
                  Personnalisation du Template
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {customizedTemplate.name}
                </p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                templateStyle === 'boheme' 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 hover:from-amber-600 hover:to-amber-700 shadow-glow-amber'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Sauvegarder
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`shadow-lg border-b sticky top-16 z-40 ${
        templateStyle === 'boheme' 
          ? 'bg-white/90 dark:bg-slate-800/90 border-emerald-200/50 dark:border-emerald-600/50'
          : 'bg-white/90 dark:bg-slate-800/90 border-neutral-200/50 dark:border-slate-600/50'
      } backdrop-blur-xl`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? templateStyle === 'boheme'
                        ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                        : 'border-amber-500 text-amber-600 dark:text-amber-400'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customization Panel */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxury border border-neutral-200/50 dark:border-slate-600/50 p-6">
            <h2 className={`text-xl font-bold mb-6 ${
              templateStyle === 'boheme' 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent'
            }`}>
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
            {renderTabContent()}
          </div>

          {/* Live Preview */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxury border border-neutral-200/50 dark:border-slate-600/50 p-6">
            <h2 className={`text-xl font-bold mb-6 ${
              templateStyle === 'boheme' 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent'
            }`}>
              Aperçu en temps réel
            </h2>
            {renderPreviewTab()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TemplateCustomization;