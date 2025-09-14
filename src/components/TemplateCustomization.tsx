import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Palette, Type, Layout, Eye, EyeOff, Crown, Sparkles, Heart, Gift, GraduationCap, X } from 'lucide-react';

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
  const [customizedTemplate, setCustomizedTemplate] = useState<TemplateData>(template);
  const [activeTab, setActiveTab] = useState('content');
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialiser les couleurs avec les valeurs existantes ou les valeurs par défaut
  const [colors, setColors] = useState(() => {
    // Priorité : customizations.colors > colors > couleurs par défaut
    const existingColors = template.customizations?.colors || template.colors;
    
    if (existingColors) {
      return {
        primary: existingColors.primary || '#f59e0b',
        secondary: existingColors.secondary || '#d97706',
        accent: existingColors.accent || '#f43f5e'
      };
    }

    // Couleurs par défaut selon la catégorie
    switch (template.category) {
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
  });

  // Mettre à jour le template personnalisé quand les couleurs changent
  useEffect(() => {
    setCustomizedTemplate(prev => ({
      ...prev,
      colors: colors,
      customizations: {
        ...prev.customizations,
        colors: colors
      }
    }));
  }, [colors]);

  const handleColorChange = (colorType: 'primary' | 'secondary' | 'accent', value: string) => {
    setColors(prev => ({
      ...prev,
      [colorType]: value
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomizedTemplate(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDrinkOptionsChange = (index: number, value: string) => {
    const newDrinkOptions = [...customizedTemplate.drinkOptions];
    newDrinkOptions[index] = value;
    setCustomizedTemplate(prev => ({
      ...prev,
      drinkOptions: newDrinkOptions
    }));
  };

  const addDrinkOption = () => {
    setCustomizedTemplate(prev => ({
      ...prev,
      drinkOptions: [...prev.drinkOptions, '']
    }));
  };

  const removeDrinkOption = (index: number) => {
    setCustomizedTemplate(prev => ({
      ...prev,
      drinkOptions: prev.drinkOptions.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // S'assurer que les couleurs sont bien incluses dans le template final
      const finalTemplate = {
        ...customizedTemplate,
        colors: colors,
        customizations: {
          ...customizedTemplate.customizations,
          colors: colors
        }
      };
      
      await onSave(finalTemplate);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
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

  const IconComponent = getIconForCategory(template.category);

  const tabs = [
    { id: 'content', label: 'Contenu', icon: Type },
    { id: 'colors', label: 'Couleurs', icon: Palette },
    { id: 'layout', label: 'Mise en page', icon: Layout }
  ];

  const renderContentTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Options de boissons
        </label>
        <div className="space-y-3">
          {customizedTemplate.drinkOptions.map((drink, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="text"
                value={drink}
                onChange={(e) => handleDrinkOptionsChange(index, e.target.value)}
                className="flex-1 px-4 py-3 border border-neutral-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                placeholder="Nom de la boisson"
              />
              <button
                onClick={() => removeDrinkOption(index)}
                className="p-3 text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-600 rounded-xl transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            onClick={addDrinkOption}
            className="w-full p-3 border-2 border-dashed border-neutral-300 dark:border-slate-600 rounded-xl text-neutral-500 dark:text-slate-400 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 transition-all duration-200 flex items-center justify-center"
          >
            <span>+ Ajouter une boisson</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderColorsTab = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Personnalisation des couleurs
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Modifiez les couleurs pour correspondre à votre style
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Couleur primaire */}
        <div className="bg-gradient-to-br from-neutral-50 to-amber-50/30 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-6 border border-neutral-200/50 dark:border-slate-600/50 shadow-lg">
          <div className="text-center mb-4">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-3 shadow-lg border-4 border-white"
              style={{ backgroundColor: colors.primary }}
            ></div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">Couleur Primaire</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">Couleur principale de l'invitation</p>
          </div>
          
          <div className="space-y-3">
            <input
              type="color"
              value={colors.primary}
              onChange={(e) => handleColorChange('primary', e.target.value)}
              className="w-full h-12 rounded-xl border-2 border-neutral-200 dark:border-slate-600 cursor-pointer"
            />
            <input
              type="text"
              value={colors.primary}
              onChange={(e) => handleColorChange('primary', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-slate-600 rounded-lg text-sm font-mono bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              placeholder="#f59e0b"
            />
          </div>
        </div>

        {/* Couleur secondaire */}
        <div className="bg-gradient-to-br from-neutral-50 to-purple-50/30 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-6 border border-neutral-200/50 dark:border-slate-600/50 shadow-lg">
          <div className="text-center mb-4">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-3 shadow-lg border-4 border-white"
              style={{ backgroundColor: colors.secondary }}
            ></div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">Couleur Secondaire</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">Couleur complémentaire</p>
          </div>
          
          <div className="space-y-3">
            <input
              type="color"
              value={colors.secondary}
              onChange={(e) => handleColorChange('secondary', e.target.value)}
              className="w-full h-12 rounded-xl border-2 border-neutral-200 dark:border-slate-600 cursor-pointer"
            />
            <input
              type="text"
              value={colors.secondary}
              onChange={(e) => handleColorChange('secondary', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-slate-600 rounded-lg text-sm font-mono bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              placeholder="#d97706"
            />
          </div>
        </div>

        {/* Couleur d'accent */}
        <div className="bg-gradient-to-br from-neutral-50 to-rose-50/30 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-6 border border-neutral-200/50 dark:border-slate-600/50 shadow-lg">
          <div className="text-center mb-4">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-3 shadow-lg border-4 border-white"
              style={{ backgroundColor: colors.accent }}
            ></div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">Couleur d'Accent</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">Couleur de mise en valeur</p>
          </div>
          
          <div className="space-y-3">
            <input
              type="color"
              value={colors.accent}
              onChange={(e) => handleColorChange('accent', e.target.value)}
              className="w-full h-12 rounded-xl border-2 border-neutral-200 dark:border-slate-600 cursor-pointer"
            />
            <input
              type="text"
              value={colors.accent}
              onChange={(e) => handleColorChange('accent', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-slate-600 rounded-lg text-sm font-mono bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              placeholder="#f43f5e"
            />
          </div>
        </div>
      </div>

      {/* Aperçu des couleurs */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-neutral-200/50 dark:border-slate-600/50 shadow-lg">
        <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Aperçu des couleurs</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            className="p-4 rounded-xl text-white font-semibold text-center shadow-lg"
            style={{ backgroundColor: colors.primary }}
          >
            Couleur Primaire
          </div>
          <div 
            className="p-4 rounded-xl text-white font-semibold text-center shadow-lg"
            style={{ backgroundColor: colors.secondary }}
          >
            Couleur Secondaire
          </div>
          <div 
            className="p-4 rounded-xl text-white font-semibold text-center shadow-lg"
            style={{ backgroundColor: colors.accent }}
          >
            Couleur d'Accent
          </div>
        </div>
      </div>

      {/* Palettes prédéfinies */}
      <div className="bg-gradient-to-r from-neutral-50 to-amber-50/30 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-6 border border-neutral-200/50 dark:border-slate-600/50">
        <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Palettes prédéfinies</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Or & Rose', primary: '#f59e0b', secondary: '#d97706', accent: '#f43f5e' },
            { name: 'Violet & Rose', primary: '#8b5cf6', secondary: '#7c3aed', accent: '#ec4899' },
            { name: 'Émeraude & Bleu', primary: '#10b981', secondary: '#059669', accent: '#3b82f6' },
            { name: 'Rouge & Or', primary: '#ef4444', secondary: '#dc2626', accent: '#f59e0b' },
            { name: 'Bleu & Cyan', primary: '#3b82f6', secondary: '#2563eb', accent: '#06b6d4' },
            { name: 'Rose & Violet', primary: '#ec4899', secondary: '#db2777', accent: '#8b5cf6' },
            { name: 'Vert & Lime', primary: '#22c55e', secondary: '#16a34a', accent: '#84cc16' },
            { name: 'Orange & Rouge', primary: '#f97316', secondary: '#ea580c', accent: '#ef4444' }
          ].map((palette, index) => (
            <button
              key={index}
              onClick={() => setColors({
                primary: palette.primary,
                secondary: palette.secondary,
                accent: palette.accent
              })}
              className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-neutral-200 dark:border-slate-600 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              title={palette.name}
            >
              <div className="flex space-x-1 mb-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: palette.primary }}
                ></div>
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: palette.secondary }}
                ></div>
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: palette.accent }}
                ></div>
              </div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{palette.name}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLayoutTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Image de fond
        </label>
        <input
          type="url"
          value={customizedTemplate.backgroundImage}
          onChange={(e) => handleInputChange('backgroundImage', e.target.value)}
          className="w-full px-4 py-3 border border-neutral-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          placeholder="URL de l'image de fond"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Nom du modèle
        </label>
        <input
          type="text"
          value={customizedTemplate.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="w-full px-4 py-3 border border-neutral-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          placeholder="Nom de votre modèle personnalisé"
        />
      </div>

      {/* Aperçu de l'image */}
      {customizedTemplate.backgroundImage && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-neutral-200/50 dark:border-slate-600/50 shadow-lg">
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Aperçu de l'image de fond</h4>
          <div className="relative h-48 rounded-xl overflow-hidden">
            <img
              src={customizedTemplate.backgroundImage}
              alt="Aperçu"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <h5 className="text-white font-bold text-lg drop-shadow-lg">
                {customizedTemplate.title}
              </h5>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-amber-50/30 to-purple-50/20 dark:from-slate-900 dark:via-slate-800/30 dark:to-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-neutral-50/95 via-amber-50/90 to-neutral-50/95 dark:from-slate-800/95 dark:via-slate-700/90 dark:to-slate-800/95 backdrop-blur-xl shadow-luxury border-b border-amber-200/30 dark:border-slate-600/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center text-amber-600 hover:text-amber-700 transition-all duration-300 group"
              >
                <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                Retour
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <IconComponent className="h-8 w-8 text-amber-500 animate-glow drop-shadow-lg" />
                  <div className="absolute inset-0 animate-pulse">
                    <IconComponent className="h-8 w-8 text-amber-300 opacity-30" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-amber-700 to-slate-900 dark:from-slate-100 dark:via-amber-300 dark:to-slate-100 bg-clip-text text-transparent">
                    Personnalisation du Template
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {template.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg transform hover:scale-105"
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="hidden sm:block">
                  {showPreview ? 'Masquer' : 'Aperçu'}
                </span>
              </button>
              
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Sauvegarde...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Sauvegarder</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`grid gap-8 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Panel de personnalisation */}
          <div className="space-y-6">
            {/* Navigation des onglets */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxury border border-neutral-200/50 dark:border-slate-600/50 overflow-hidden">
              <div className="flex border-b border-neutral-200/50 dark:border-slate-600/50">
                {tabs.map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center space-x-2 py-4 px-4 font-medium text-sm transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-glow-amber'
                          : 'text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <TabIcon className="h-4 w-4" />
                      <span className="hidden sm:block">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="p-6">
                {activeTab === 'content' && renderContentTab()}
                {activeTab === 'colors' && renderColorsTab()}
                {activeTab === 'layout' && renderLayoutTab()}
              </div>
            </div>
          </div>

          {/* Aperçu en temps réel */}
          {showPreview && (
            <div className="animate-slide-up">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxury border border-neutral-200/50 dark:border-slate-600/50 overflow-hidden sticky top-8">
                <div className="p-4 border-b border-neutral-200/50 dark:border-slate-600/50 bg-gradient-to-r from-neutral-50 to-amber-50/30 dark:from-slate-700 dark:to-slate-600">
                  <div className="flex items-center justify-center">
                    <div className="relative mr-3">
                      <Eye className="h-5 w-5 text-amber-500 animate-glow" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Aperçu en temps réel</h3>
                  </div>
                </div>

                <div className="p-6">
                  {/* Simulation mobile */}
                  <div className="mx-auto max-w-sm">
                    <div className="relative w-full h-96 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-4 shadow-luxury">
                      <div className="w-full h-full rounded-2xl overflow-hidden relative" style={{ backgroundImage: `url(${customizedTemplate.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
                        
                        <div className="relative z-10 p-4 h-full flex flex-col justify-between text-center text-white">
                          <div>
                            <div className="flex justify-center mb-4">
                              <IconComponent 
                                className="h-8 w-8 animate-glow drop-shadow-lg" 
                                style={{ color: colors.accent }} 
                              />
                            </div>
                            
                            <h1 
                              className="text-lg font-bold mb-4 drop-shadow-lg" 
                              style={{ color: colors.primary }}
                            >
                              {customizedTemplate.title}
                            </h1>

                            <div 
                              className="backdrop-blur-sm rounded-xl p-3 mb-4 border"
                              style={{ 
                                background: `linear-gradient(to right, ${colors.primary}40, ${colors.secondary}40)`,
                                borderColor: `${colors.primary}30`
                              }}
                            >
                              <p className="text-sm text-white/90">
                                [Nom de l'invité]
                              </p>
                            </div>

                            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 mb-4">
                              <p className="text-xs text-neutral-200 leading-relaxed">
                                {customizedTemplate.invitationText.length > 100 
                                  ? `${customizedTemplate.invitationText.substring(0, 100)}...`
                                  : customizedTemplate.invitationText
                                }
                              </p>
                            </div>

                            <div className="space-y-2 text-xs">
                              <div className="flex items-center justify-center">
                                <span style={{ color: colors.primary }}>
                                  📅 {customizedTemplate.eventDate} - {customizedTemplate.eventTime}
                                </span>
                              </div>
                              <div className="flex items-center justify-center">
                                <span style={{ color: colors.secondary }}>
                                  📍 {customizedTemplate.eventLocation.length > 30 
                                    ? `${customizedTemplate.eventLocation.substring(0, 30)}...`
                                    : customizedTemplate.eventLocation
                                  }
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <button
                              className="w-full py-2 rounded-lg font-semibold text-sm transition-all duration-300"
                              style={{ 
                                background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                                color: '#1e293b'
                              }}
                            >
                              Confirmer ma présence
                            </button>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                className="py-2 rounded-lg font-semibold text-xs transition-all duration-300"
                                style={{ 
                                  background: `linear-gradient(to right, ${colors.accent}, ${colors.primary})`,
                                  color: 'white'
                                }}
                              >
                                Boisson
                              </button>
                              <button
                                className="py-2 rounded-lg font-semibold text-xs transition-all duration-300"
                                style={{ 
                                  background: `linear-gradient(to right, ${colors.secondary}, ${colors.accent})`,
                                  color: 'white'
                                }}
                              >
                                Message
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateCustomization;