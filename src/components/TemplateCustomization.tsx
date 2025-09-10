import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Download, 
  Upload, 
  Palette, 
  Type, 
  Calendar, 
  MapPin, 
  Users, 
  Wine, 
  MessageCircle, 
  QrCode,
  Heart,
  Sparkles,
  Camera,
  Check,
  X
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
}

interface TemplateCustomizationProps {
  template: TemplateData;
  onBack: () => void;
  onSave: (customizedTemplate: TemplateData) => void;
}

const TemplateCustomization = ({ template, onBack, onSave }: TemplateCustomizationProps) => {
  const [customTemplate, setCustomTemplate] = useState<TemplateData>(template);
  const [activeTab, setActiveTab] = useState('general');
  const [selectedDrink, setSelectedDrink] = useState('');
  const [guestMessage, setGuestMessage] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [newDrink, setNewDrink] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#f59e0b'); // amber-500
  const [secondaryColor, setSecondaryColor] = useState('#d97706'); // amber-600
  const [accentColor, setAccentColor] = useState('#f43f5e'); // rose-500
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: 'general', label: 'Général', icon: Type },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'colors', label: 'Couleurs', icon: Palette },
    { id: 'event', label: 'Événement', icon: Calendar },
    { id: 'options', label: 'Options', icon: Wine }
  ];

  const handleInputChange = (field: keyof TemplateData, value: any) => {
    setCustomTemplate(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleInputChange('backgroundImage', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addDrinkOption = () => {
    if (newDrink.trim() && !customTemplate.drinkOptions.includes(newDrink.trim())) {
      handleInputChange('drinkOptions', [...customTemplate.drinkOptions, newDrink.trim()]);
      setNewDrink('');
    }
  };

  const removeDrinkOption = (index: number) => {
    const newOptions = customTemplate.drinkOptions.filter((_, i) => i !== index);
    handleInputChange('drinkOptions', newOptions);
  };

  const handleSave = () => {
    onSave(customTemplate);
    alert('Template sauvegardé avec succès !');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Titre de l'invitation
              </label>
              <input
                type="text"
                value={customTemplate.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                placeholder="Ex: Mariage de Sophie & Lucas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Texte d'invitation
              </label>
              <textarea
                value={customTemplate.invitationText}
                onChange={(e) => handleInputChange('invitationText', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 resize-none"
                placeholder="Rédigez votre message d'invitation..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nom du template
              </label>
              <input
                type="text"
                value={customTemplate.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                placeholder="Nom de votre template personnalisé"
              />
            </div>
          </div>
        );

      case 'design':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Image de fond
              </label>
              <div className="space-y-4">
                <div className="relative h-32 bg-gradient-to-br from-neutral-100 to-amber-50 rounded-xl border-2 border-dashed border-neutral-300 hover:border-amber-400 transition-all duration-300">
                  {customTemplate.backgroundImage ? (
                    <img
                      src={customTemplate.backgroundImage}
                      alt="Background preview"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Camera className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                        <p className="text-neutral-500 text-sm">Aucune image sélectionnée</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-amber-500 text-white px-4 py-3 rounded-xl hover:bg-amber-600 transition-all duration-300 font-semibold flex items-center justify-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Télécharger une image
                  </button>
                  
                  <button
                    onClick={() => handleInputChange('backgroundImage', 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=1200')}
                    className="flex-1 bg-neutral-500 text-white px-4 py-3 rounded-xl hover:bg-neutral-600 transition-all duration-300 font-semibold"
                  >
                    Image par défaut
                  </button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                URL d'image personnalisée
              </label>
              <input
                type="url"
                value={customTemplate.backgroundImage}
                onChange={(e) => handleInputChange('backgroundImage', e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                onClick={() => handleInputChange('backgroundImage', 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=1200')}
                className="cursor-pointer group"
              >
                <div className="relative h-20 rounded-xl overflow-hidden border-2 border-transparent group-hover:border-amber-400 transition-all duration-300">
                  <img
                    src="https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400"
                    alt="Template 1"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"></div>
                </div>
                <p className="text-xs text-center mt-2 text-slate-600">Romantique</p>
              </div>

              <div
                onClick={() => handleInputChange('backgroundImage', 'https://images.pexels.com/photos/1488482/pexels-photo-1488482.jpeg?auto=compress&cs=tinysrgb&w=1200')}
                className="cursor-pointer group"
              >
                <div className="relative h-20 rounded-xl overflow-hidden border-2 border-transparent group-hover:border-amber-400 transition-all duration-300">
                  <img
                    src="https://images.pexels.com/photos/1488482/pexels-photo-1488482.jpeg?auto=compress&cs=tinysrgb&w=400"
                    alt="Template 2"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"></div>
                </div>
                <p className="text-xs text-center mt-2 text-slate-600">Élégant</p>
              </div>

              <div
                onClick={() => handleInputChange('backgroundImage', 'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=1200')}
                className="cursor-pointer group"
              >
                <div className="relative h-20 rounded-xl overflow-hidden border-2 border-transparent group-hover:border-amber-400 transition-all duration-300">
                  <img
                    src="https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=400"
                    alt="Template 3"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"></div>
                </div>
                <p className="text-xs text-center mt-2 text-slate-600">Moderne</p>
              </div>

              <div
                onClick={() => handleInputChange('backgroundImage', 'https://images.pexels.com/photos/1729808/pexels-photo-1729808.jpeg?auto=compress&cs=tinysrgb&w=1200')}
                className="cursor-pointer group"
              >
                <div className="relative h-20 rounded-xl overflow-hidden border-2 border-transparent group-hover:border-amber-400 transition-all duration-300">
                  <img
                    src="https://images.pexels.com/photos/1729808/pexels-photo-1729808.jpeg?auto=compress&cs=tinysrgb&w=400"
                    alt="Template 4"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"></div>
                </div>
                <p className="text-xs text-center mt-2 text-slate-600">Classique</p>
              </div>
            </div>
          </div>
        );

      case 'colors':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-4">
                Couleur principale
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-16 h-12 rounded-xl border-2 border-neutral-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 font-mono"
                  placeholder="#f59e0b"
                />
              </div>
              <p className="text-sm text-slate-500 mt-2">Couleur utilisée pour les éléments principaux et les boutons</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-4">
                Couleur secondaire
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-16 h-12 rounded-xl border-2 border-neutral-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 font-mono"
                  placeholder="#d97706"
                />
              </div>
              <p className="text-sm text-slate-500 mt-2">Couleur pour les effets de survol et les accents</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-4">
                Couleur d'accent
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-16 h-12 rounded-xl border-2 border-neutral-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 font-mono"
                  placeholder="#f43f5e"
                />
              </div>
              <p className="text-sm text-slate-500 mt-2">Couleur pour les éléments décoratifs et les icônes</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setPrimaryColor('#f59e0b');
                  setSecondaryColor('#d97706');
                  setAccentColor('#f43f5e');
                }}
                className="p-4 rounded-xl border-2 border-neutral-200 hover:border-amber-400 transition-all duration-300 group"
              >
                <div className="flex space-x-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500"></div>
                  <div className="w-6 h-6 rounded-full bg-amber-600"></div>
                  <div className="w-6 h-6 rounded-full bg-rose-500"></div>
                </div>
                <p className="text-sm font-medium text-slate-700 group-hover:text-amber-700">Doré & Rose</p>
              </button>

              <button
                onClick={() => {
                  setPrimaryColor('#8b5cf6');
                  setSecondaryColor('#7c3aed');
                  setAccentColor('#ec4899');
                }}
                className="p-4 rounded-xl border-2 border-neutral-200 hover:border-purple-400 transition-all duration-300 group"
              >
                <div className="flex space-x-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-violet-500"></div>
                  <div className="w-6 h-6 rounded-full bg-violet-600"></div>
                  <div className="w-6 h-6 rounded-full bg-pink-500"></div>
                </div>
                <p className="text-sm font-medium text-slate-700 group-hover:text-purple-700">Violet & Rose</p>
              </button>

              <button
                onClick={() => {
                  setPrimaryColor('#10b981');
                  setSecondaryColor('#059669');
                  setAccentColor('#3b82f6');
                }}
                className="p-4 rounded-xl border-2 border-neutral-200 hover:border-emerald-400 transition-all duration-300 group"
              >
                <div className="flex space-x-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500"></div>
                  <div className="w-6 h-6 rounded-full bg-emerald-600"></div>
                  <div className="w-6 h-6 rounded-full bg-blue-500"></div>
                </div>
                <p className="text-sm font-medium text-slate-700 group-hover:text-emerald-700">Émeraude & Bleu</p>
              </button>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200/50">
              <div className="flex items-center mb-4">
                <Palette className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-purple-800">Personnalisation des couleurs</h3>
              </div>
              <p className="text-purple-700 text-sm">
                Personnalisez les couleurs de votre invitation pour qu'elle corresponde parfaitement à votre thème.
                Les modifications s'appliquent en temps réel dans l'aperçu.
              </p>
            </div>
          </div>
        );

      case 'event':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date de l'événement
                </label>
                <input
                  type="date"
                  value={customTemplate.eventDate.split(' ')[2] + '-' + 
                        (customTemplate.eventDate.split(' ')[1] === 'Juin' ? '06' : '01') + '-' + 
                        customTemplate.eventDate.split(' ')[0].padStart(2, '0')}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    const formattedDate = date.toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    });
                    handleInputChange('eventDate', formattedDate);
                  }}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Heure de l'événement
                </label>
                <input
                  type="time"
                  value={customTemplate.eventTime.replace('h', ':')}
                  onChange={(e) => handleInputChange('eventTime', e.target.value.replace(':', 'h'))}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Lieu de l'événement
              </label>
              <input
                type="text"
                value={customTemplate.eventLocation}
                onChange={(e) => handleInputChange('eventLocation', e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                placeholder="Adresse complète du lieu"
              />
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200/50">
              <div className="flex items-center mb-4">
                <MapPin className="h-5 w-5 text-amber-600 mr-2" />
                <h3 className="text-lg font-semibold text-amber-800">Informations du lieu</h3>
              </div>
              <p className="text-amber-700 text-sm">
                Assurez-vous que l'adresse est complète et précise pour faciliter l'accès de vos invités.
                Vous pouvez inclure des indications supplémentaires dans le texte d'invitation.
              </p>
            </div>
          </div>
        );

      case 'options':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-4">
                Options de boissons
              </label>
              
              <div className="space-y-3 mb-4">
                {customTemplate.drinkOptions.map((drink, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gradient-to-r from-neutral-50 to-amber-50/30 rounded-xl p-4 border border-neutral-200/50"
                  >
                    <div className="flex items-center">
                      <Wine className="h-4 w-4 text-amber-600 mr-3" />
                      <span className="text-slate-700 font-medium">{drink}</span>
                    </div>
                    <button
                      onClick={() => removeDrinkOption(index)}
                      className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all duration-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newDrink}
                  onChange={(e) => setNewDrink(e.target.value)}
                  placeholder="Nouvelle option de boisson"
                  className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                  onKeyPress={(e) => e.key === 'Enter' && addDrinkOption()}
                />
                <button
                  onClick={addDrinkOption}
                  className="bg-amber-500 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-all duration-300 font-semibold"
                >
                  Ajouter
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200/50">
              <div className="flex items-center mb-4">
                <Wine className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-purple-800">Gestion des boissons</h3>
              </div>
              <p className="text-purple-700 text-sm">
                Personnalisez les options de boissons selon vos préférences. Vos invités pourront 
                sélectionner leur choix directement depuis l'invitation.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderPreview = () => {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-luxury border border-amber-500/30 overflow-hidden sticky top-8">
        <div className="p-4">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-amber-400 mb-2">Aperçu en temps réel</h3>
            <p className="text-neutral-300 text-sm">Vos modifications apparaissent instantanément</p>
          </div>
          <div className="relative bg-black rounded-2xl overflow-hidden shadow-inner mx-auto w-full max-w-xs">
            {/* Invitation Content */}
            <div className="relative h-[500px] overflow-y-auto">
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={customTemplate.backgroundImage}
                  alt="Wedding Background"
                  className="w-full h-full object-cover transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 via-transparent to-amber-900/20" style={{ background: `linear-gradient(to right, ${primaryColor}20, transparent, ${primaryColor}20)` }}></div>
              </div>

              {/* Content */}
              <div className="relative z-10 p-4 text-center text-white">
                {/* Decorative Header */}
                <div className="mb-4">
                  <div className="flex justify-center items-center mb-3">
                    <div className="relative">
                      <Heart className="h-8 w-8 animate-glow drop-shadow-2xl" style={{ color: accentColor }} />
                      <div className="absolute inset-0 animate-ping">
                        <Heart className="h-8 w-8 opacity-30" style={{ color: accentColor }} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-16 h-px mx-auto mb-3" style={{ background: `linear-gradient(to right, transparent, ${primaryColor}, transparent)` }}></div>
                  <div className="flex justify-center space-x-1 mb-3">
                    <Sparkles className="h-3 w-3 animate-pulse" style={{ color: primaryColor }} />
                    <Sparkles className="h-2 w-2 animate-pulse" style={{ color: secondaryColor, animationDelay: '0.5s' }} />
                    <Sparkles className="h-3 w-3 animate-pulse" style={{ color: primaryColor, animationDelay: '1s' }} />
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-lg font-bold mb-4 font-luxury drop-shadow-lg transition-all duration-300" style={{ color: primaryColor }}>
                  {customTemplate.title}
                </h1>

                {/* Guest Info */}
                <div className="backdrop-blur-sm rounded-xl p-3 mb-4 border" style={{ 
                  background: `linear-gradient(to right, ${primaryColor}40, ${secondaryColor}40)`,
                  borderColor: `${primaryColor}30`
                }}>
                  <p className="text-xs mb-1" style={{ color: `${primaryColor}cc` }}>Cher(e)</p>
                  <p className="text-sm font-semibold text-white">[Nom de l'invité]</p>
                  <p className="text-xs mt-1" style={{ color: `${primaryColor}dd` }}>Table n° [Numéro de table]</p>
                </div>

                {/* Invitation Text */}
                <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 mb-4 border" style={{ borderColor: `${primaryColor}20` }}>
                  <p className="text-neutral-200 leading-relaxed text-xs transition-all duration-300">
                    {customTemplate.invitationText.length > 120 
                      ? customTemplate.invitationText.substring(0, 120) + '...'
                      : customTemplate.invitationText}
                  </p>
                </div>

                {/* Event Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-center text-neutral-200">
                    <Calendar className="h-3 w-3 mr-2" style={{ color: primaryColor }} />
                    <div className="text-left">
                      <p className="text-xs font-semibold transition-all duration-300">{customTemplate.eventDate}</p>
                      <p className="text-xs transition-all duration-300" style={{ color: `${primaryColor}dd` }}>{customTemplate.eventTime}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center text-neutral-200">
                    <MapPin className="h-3 w-3 mr-2" style={{ color: primaryColor }} />
                    <p className="text-xs transition-all duration-300">
                      {customTemplate.eventLocation.length > 30 
                        ? customTemplate.eventLocation.substring(0, 30) + '...'
                        : customTemplate.eventLocation}
                    </p>
                  </div>
                </div>

                {/* RSVP Section */}
                <div className="backdrop-blur-sm rounded-xl p-3 mb-3 border" style={{ 
                  background: `linear-gradient(to right, ${primaryColor}50, ${secondaryColor}50)`,
                  borderColor: `${primaryColor}30`
                }}>
                  <h3 className="text-xs font-semibold mb-2 flex items-center justify-center" style={{ color: `${primaryColor}cc` }}>
                    <Users className="h-3 w-3 mr-1" />
                    Confirmation
                  </h3>
                  <button
                    onClick={() => setIsConfirmed(!isConfirmed)}
                    className="w-full py-2 rounded-lg text-xs font-semibold transition-all duration-300 transform hover:scale-105"
                    style={{
                      background: isConfirmed 
                        ? 'linear-gradient(to right, #10b981, #059669)' 
                        : `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                      color: isConfirmed ? 'white' : '#1e293b'
                    }}
                  >
                    {isConfirmed ? (
                      <span className="flex items-center justify-center">
                        <Check className="h-3 w-3 mr-1" />
                        Présence confirmée
                      </span>
                    ) : (
                      'Confirmer ma présence'
                    )}
                  </button>
                </div>

                {/* Drink Selection */}
                <div className="backdrop-blur-sm rounded-xl p-3 mb-3 border" style={{ 
                  background: `linear-gradient(to right, ${primaryColor}50, ${secondaryColor}50)`,
                  borderColor: `${primaryColor}30`
                }}>
                  <h3 className="text-xs font-semibold mb-2 flex items-center justify-center" style={{ color: `${primaryColor}cc` }}>
                    <Wine className="h-3 w-3 mr-1" />
                    Choix de boisson
                  </h3>
                  <select
                    value={selectedDrink}
                    onChange={(e) => setSelectedDrink(e.target.value)}
                    className="w-full bg-slate-800/80 text-white border rounded-lg px-2 py-1 text-xs focus:ring-1 transition-all duration-200"
                    style={{ 
                      borderColor: `${primaryColor}30`,
                      focusRingColor: primaryColor
                    }}
                  >
                    <option value="">Sélectionnez votre boisson</option>
                    {customTemplate.drinkOptions.slice(0, 3).map((drink) => (
                      <option key={drink} value={drink}>{drink}</option>
                    ))}
                  </select>
                </div>

                {/* Guest Book - Simplified */}
                <div className="backdrop-blur-sm rounded-xl p-3 mb-3 border" style={{ 
                  background: `linear-gradient(to right, ${primaryColor}50, ${secondaryColor}50)`,
                  borderColor: `${primaryColor}30`
                }}>
                  <h3 className="text-xs font-semibold mb-2 flex items-center justify-center" style={{ color: `${primaryColor}cc` }}>
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Livre d'or
                  </h3>
                  <textarea
                    value={guestMessage}
                    onChange={(e) => setGuestMessage(e.target.value)}
                    placeholder="Laissez un message aux mariés..."
                    className="w-full bg-slate-800/80 text-white border rounded-lg px-2 py-1 text-xs focus:ring-1 transition-all duration-200 resize-none"
                    rows={2}
                    style={{ 
                      borderColor: `${primaryColor}30`,
                      focusRingColor: primaryColor
                    }}
                  />
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    <button 
                      onClick={() => {
                        if (guestMessage.trim()) {
                          alert('Message envoyé avec succès !');
                          setGuestMessage('');
                        } else {
                          alert('Veuillez écrire un message avant d\'envoyer.');
                        }
                      }}
                      className="py-1 rounded-lg text-xs font-semibold shadow-lg transform hover:scale-105 relative overflow-hidden group transition-all duration-300"
                      style={{ background: 'linear-gradient(to right, #10b981, #059669)', color: 'white' }}
                    >
                      <MessageCircle className="h-3 w-3 inline mr-1" />
                      Envoyer
                    </button>
                    <button 
                      className="py-1 rounded-lg text-xs font-semibold transition-all duration-300"
                      style={{ 
                        background: `linear-gradient(to right, ${secondaryColor}, ${primaryColor})`,
                        color: '#1e293b'
                      }}
                    >
                      <Camera className="h-3 w-3 inline mr-1" />
                      Photo
                    </button>
                  </div>
                </div>

                {/* QR Code */}
                <div className="backdrop-blur-sm rounded-xl p-3 border" style={{ 
                  background: `linear-gradient(to right, ${primaryColor}50, ${secondaryColor}50)`,
                  borderColor: `${primaryColor}30`
                }}>
                  <h3 className="text-xs font-semibold mb-2 flex items-center justify-center" style={{ color: `${primaryColor}cc` }}>
                    <QrCode className="h-3 w-3 mr-1" />
                    QR Code Invité
                  </h3>
                  <div className="bg-white rounded-lg p-2 inline-block">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-md flex items-center justify-center">
                      <QrCode className="h-8 w-8" style={{ color: primaryColor }} />
                    </div>
                  </div>
                  <p className="text-xs mt-1" style={{ color: `${primaryColor}dd` }}>WED-2024-001</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="flex items-center text-amber-600 hover:text-amber-700 transition-all duration-300 group mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Retour
          </button>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Personnalisation du Template
            </h2>
            <p className="text-slate-600 mt-1">{customTemplate.name}</p>
          </div>
        </div>
        
        <button
          onClick={handleSave}
          className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold flex items-center shadow-glow-amber transform hover:scale-105"
        >
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-luxury border border-neutral-200/50 overflow-hidden sticky top-8">
            <div className="p-4 bg-gradient-to-r from-neutral-50 to-amber-50/30 border-b border-neutral-200/50">
              <h3 className="text-base font-semibold text-slate-900">Personnalisation</h3>
              <p className="text-xs text-slate-600 mt-1">Modifiez votre invitation</p>
            </div>
            <nav className="p-3">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg transition-all duration-300 mb-1 text-sm ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-glow-amber'
                        : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
            
            {/* Quick Actions */}
            <div className="p-3 border-t border-neutral-200/50 bg-gradient-to-r from-neutral-50 to-amber-50/30">
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all duration-300 text-xs font-medium">
                  <Eye className="h-3 w-3 mr-1" />
                  Aperçu
                </button>
                <button className="flex items-center justify-center px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-all duration-300 text-xs font-medium">
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-luxury border border-neutral-200/50 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </h3>
              <p className="text-sm text-slate-600">
                {activeTab === 'general' && 'Modifiez le contenu principal de votre invitation'}
                {activeTab === 'design' && 'Personnalisez l\'apparence visuelle'}
                {activeTab === 'colors' && 'Ajustez la palette de couleurs'}
                {activeTab === 'event' && 'Configurez les détails de l\'événement'}
                {activeTab === 'options' && 'Gérez les options pour vos invités'}
              </p>
            </div>
            {renderTabContent()}
          </div>
        </div>
        
        {/* Real-time Preview */}
        <div className="lg:col-span-1">
          {renderPreview()}
        </div>
      </div>
    </div>
  );
};

export default TemplateCustomization;