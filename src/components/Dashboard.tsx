import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  Crown,
  Sparkles,
  Heart,
  Gift,
  GraduationCap,
  User,
  LogOut,
  Bell,
  Search,
  Filter,
  MoreVertical,
  Copy,
  Share2,
  ExternalLink,
  CheckCircle,
  Clock,
  Camera,
  XCircle,
  AlertCircle,
  TrendingUp,
  Mail,
  X,
  Save
  MapPin
} from 'lucide-react';
  Camera,
  X
import { useAuth } from './AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import UserProfile from './UserProfile';
import TableManagement from './TableManagement';
import TemplateCustomization from './TemplateCustomization';
import DashboardSettings from './DashboardSettings';
import UpgradeModal from './UpgradeModal';
  Camera,
  X
import { UserModel, Invite } from '../services/templateService';

interface DashboardProps {
  selectedTemplate?: any;
  userData: UserData | null;
  onLogout: () => void;
}

interface Table {
  id: number;
  name: string;
  seats: number;
  assignedGuests: any[];
}

const Dashboard = ({ selectedTemplate, userData, onLogout }: DashboardProps) => {
  const { 
    userModels, 
    userInvites, 
    isLoading, 
    error, 
    updateUserModel, 
    deleteUserModel, 
    createInvite, 
    updateInvite, 
    deleteInvite,
    refreshUserData 
  } = useTemplates();
  const { user } = useAuth();
  const { subscription, canCreateInvite, getRemainingInvites } = useSubscription();

  const [activeTab, setActiveTab] = useState('overview');
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<UserModel | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteFormData, setInviteFormData] = useState({
    guestName: '',
    tableNumber: '',
    guestType: 'simple' as 'simple' | 'couple'
  });
  const [tables, setTables] = useState<Table[]>([
    { id: 1, name: 'Table des Mariés', seats: 8, assignedGuests: [] },
    { id: 2, name: 'Table Famille', seats: 10, assignedGuests: [] },
    { id: 3, name: 'Table Amis', seats: 8, assignedGuests: [] }
  ]);

  // Charger les données au montage et quand selectedTemplate change
  useEffect(() => {
    if (selectedTemplate && user) {
      console.log('Template sélectionné reçu:', selectedTemplate);
      refreshUserData();
    }
  }, [selectedTemplate, user, refreshUserData]);

  // Fonction pour sauvegarder les modifications du template
  const handleSaveTemplate = async (customizedTemplate: any) => {
    if (!user || !customizedTemplate.id) {
      console.error('Utilisateur ou ID de template manquant');
      return;
    }

    try {
      console.log('Sauvegarde du template personnalisé:', customizedTemplate);
      
      // Préparer les données de mise à jour
      const updateData = {
        name: customizedTemplate.name,
        title: customizedTemplate.title,
        invitationText: customizedTemplate.invitationText,
        eventDate: customizedTemplate.eventDate,
        eventTime: customizedTemplate.eventTime,
        eventLocation: customizedTemplate.eventLocation,
        backgroundImage: customizedTemplate.backgroundImage,
        drinkOptions: customizedTemplate.drinkOptions,
        colors: customizedTemplate.colors,
        customizations: {
          colors: customizedTemplate.colors,
          fonts: customizedTemplate.customizations?.fonts || {
            title: 'Playfair Display',
            body: 'Inter'
          },
          layout: customizedTemplate.customizations?.layout || 'default'
        },
        updatedAt: new Date().toISOString()
      };

      console.log('Données de mise à jour:', updateData);

      // Mettre à jour le modèle dans Firestore
      const success = await updateUserModel(customizedTemplate.id, updateData);
      
      if (success) {
        console.log('Template mis à jour avec succès');
        // Forcer le rechargement des données
        await refreshUserData();
        // Fermer l'éditeur
        setEditingTemplate(null);
        // Changer d'onglet pour voir les modifications
        setActiveTab('templates');
      } else {
        console.error('Échec de la mise à jour du template');
        alert('Erreur lors de la sauvegarde des modifications');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde des modifications');
    }
  };

  const handleEditTemplate = (template: UserModel) => {
    console.log('Édition du template:', template);
    setEditingTemplate(template);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!user) return;
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) {
      try {
        const success = await deleteUserModel(templateId);
        if (success) {
          console.log('Template supprimé avec succès');
          await refreshUserData();
        } else {
          alert('Erreur lors de la suppression du modèle');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du modèle');
      }
    }
  };

  const handleCreateInvite = async () => {
    if (!canCreateInvite()) {
      setShowUpgradeModal(true);
      return;
    }

    setShowInviteModal(true);
  };

  const handleSubmitInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteFormData.guestName.trim() || !inviteFormData.tableNumber.trim()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const inviteId = await createInvite({
        nom: inviteFormData.guestName.trim(),
        table: inviteFormData.tableNumber.trim(),
        etat: inviteFormData.guestType,
        confirmed: false
      });

      if (inviteId) {
        console.log('Invité créé avec succès:', inviteId);
        await refreshUserData();
        setShowInviteModal(false);
        setInviteFormData({ guestName: '', tableNumber: '', guestType: 'simple' });
      } else {
        alert('Erreur lors de la création de l\'invité');
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'invité:', error);
      if (error.message?.includes('limite')) {
        setShowUpgradeModal(true);
        setShowInviteModal(false);
      } else {
        alert('Erreur lors de la création de l\'invité');
      }
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet invité ?')) {
      try {
        const success = await deleteInvite(inviteId);
        if (success) {
          console.log('Invité supprimé avec succès');
          await refreshUserData();
        } else {
          alert('Erreur lors de la suppression de l\'invité');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'invité');
      }
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

  const getColorForCategory = (category: string) => {
    switch (category) {
      case 'wedding':
        return 'from-rose-500 to-pink-500';
      case 'birthday':
        return 'from-purple-500 to-indigo-500';
      case 'graduation':
        return 'from-emerald-500 to-teal-500';
      default:
        return 'from-amber-500 to-orange-500';
    }
  };

  const generateInviteLink = (inviteId: string) => {
    return `${window.location.origin}/invitation/${inviteId}`;
  };

  const copyInviteLink = (inviteId: string) => {
    const link = generateInviteLink(inviteId);
    navigator.clipboard.writeText(link).then(() => {
      alert('Lien copié dans le presse-papiers !');
    });
  };

  const shareInvite = async (inviteId: string, guestName: string) => {
    const link = generateInviteLink(inviteId);
    const message = `Bonjour ${guestName}, voici votre invitation : ${link}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Invitation',
          text: message,
          url: link
        });
      } catch (error) {
        // Fallback en cas d'erreur (permission refusée, annulation utilisateur, etc.)
        const mailtoLink = `mailto:?subject=Votre invitation&body=${encodeURIComponent(message)}`;
        window.open(mailtoLink);
      }
    } else {
      // Fallback pour les navigateurs qui ne supportent pas l'API Web Share
      const mailtoLink = `mailto:?subject=Votre invitation&body=${encodeURIComponent(message)}`;
      window.open(mailtoLink);
    }
  };

  // Si on édite un template, afficher l'éditeur
  if (editingTemplate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-amber-50/30 to-purple-50/20 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <TemplateCustomization
            template={editingTemplate}
            onBack={() => setEditingTemplate(null)}
            onSave={handleSaveTemplate}
          />
        </div>
      </div>
    );
  }

  // Si on affiche le profil
  if (showProfile && userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-amber-50/30 to-purple-50/20 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <UserProfile 
            userData={userData} 
            onLogout={onLogout}
          />
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'templates', label: 'Mes Modèles', icon: Sparkles },
    { id: 'guests', label: 'Invités', icon: Users },
    { id: 'tables', label: 'Tables', icon: Calendar },
    { id: 'analytics', label: 'Statistiques', icon: TrendingUp }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Statistiques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200/50 shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-amber-500 rounded-xl shadow-glow-amber">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-amber-700 text-sm font-medium">Mes Modèles</p>
                    <p className="text-2xl font-bold text-amber-900">{userModels.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200/50 shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-500 rounded-xl shadow-glow-purple">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-purple-700 text-sm font-medium">Total Invités</p>
                    <p className="text-2xl font-bold text-purple-900">{userInvites.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200/50 shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-emerald-500 rounded-xl">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-emerald-700 text-sm font-medium">Confirmés</p>
                    <p className="text-2xl font-bold text-emerald-900">
                      {userInvites.filter(invite => invite.confirmed).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl p-6 border border-rose-200/50 shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-rose-500 rounded-xl">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-rose-700 text-sm font-medium">Plan Actuel</p>
                    <p className="text-lg font-bold text-rose-900 capitalize">
                      {subscription?.plan || 'Gratuit'}
                    </p>
                    {subscription?.plan === 'free' && (
                      <p className="text-xs text-rose-600">
                        {getRemainingInvites()}/5 restantes
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 p-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-6">
                Actions rapides
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleCreateInvite}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-glow-amber transform hover:scale-105"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Ajouter un invité
                </button>
                
                <button
                  onClick={() => setActiveTab('templates')}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-lg transform hover:scale-105"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Gérer mes modèles
                </button>
                
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-lg transform hover:scale-105"
                >
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Voir les statistiques
                </button>
              </div>
            </div>

            {/* Activité récente */}
            <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 p-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-6">
                Activité récente
              </h3>
              <div className="space-y-4">
                {userInvites.slice(0, 5).map((invite, index) => (
                  <div key={invite.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-amber-50/30 rounded-xl border border-neutral-200/50">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                        invite.confirmed ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}>
                        {invite.nom.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-slate-900">{invite.nom}</p>
                        <p className="text-sm text-slate-600">Table {invite.table}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        invite.confirmed 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {invite.confirmed ? 'Confirmé' : 'En attente'}
                      </span>
                    </div>
                  </div>
                ))}
                
                {userInvites.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-neutral-500 mb-2">Aucun invité pour le moment</h4>
                    <p className="text-neutral-400 mb-6">Commencez par ajouter vos premiers invités</p>
                    <button
                      onClick={handleCreateInvite}
                      className="bg-amber-500 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-all duration-300 font-semibold"
                    >
                      Ajouter un invité
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'templates':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Mes Modèles d'Invitation
                </h3>
                <p className="text-slate-600 mt-1">Gérez et personnalisez vos modèles</p>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center space-x-2">
                  <div className="w-4 h-4 bg-amber-500 rounded-full animate-bounce"></div>
                  <div className="w-4 h-4 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-4 h-4 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <p className="text-slate-600 mt-2">Chargement de vos modèles...</p>
              </div>
            ) : userModels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userModels.map((template, index) => {
                  const IconComponent = getIconForCategory(template.category);
                  const colorClass = getColorForCategory(template.category);
                  
                  return (
                    <div
                      key={template.id}
                      className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 overflow-hidden hover:shadow-glow-amber transition-all duration-500 animate-slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={template.backgroundImage}
                          alt={template.name}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <div className="absolute top-4 right-4">
                          <div className={`p-2 bg-gradient-to-r ${colorClass} rounded-full shadow-lg`}>
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <h4 className="text-white font-bold text-lg mb-1">{template.title}</h4>
                          <p className="text-white/80 text-sm">{template.name}</p>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-sm text-slate-600">Catégorie</p>
                            <p className="font-semibold text-slate-900 capitalize">{template.category}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Créé le</p>
                            <p className="font-semibold text-slate-900">
                              {new Date(template.createdAt || '').toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => handleEditTemplate(template)}
                            className="bg-amber-100 text-amber-700 px-3 py-2 rounded-lg hover:bg-amber-200 transition-all duration-200 font-medium flex items-center justify-center text-sm"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Modifier
                          </button>
                          
                          <button
                            onClick={() => {
                              const link = `${window.location.origin}/invitation/preview/${template.id}`;
                              window.open(link, '_blank');
                            }}
                            className="bg-purple-100 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-200 transition-all duration-200 font-medium flex items-center justify-center text-sm"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Voir
                          </button>
                          
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="bg-rose-100 text-rose-700 px-3 py-2 rounded-lg hover:bg-rose-200 transition-all duration-200 font-medium flex items-center justify-center text-sm"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Suppr.
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Sparkles className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-neutral-500 mb-2">Aucun modèle personnalisé</h4>
                <p className="text-neutral-400 mb-6">Créez votre premier modèle d'invitation personnalisé</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-amber-500 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-all duration-300 font-semibold"
                >
                  Retour à l'accueil
                </button>
              </div>
            )}
          </div>
        );

      case 'guests':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Gestion des Invités
                </h3>
                <p className="text-slate-600 mt-1">
                  {subscription?.plan === 'free' 
                    ? `${userInvites.length}/5 invitations utilisées`
                    : `${userInvites.length} invités`
                  }
                </p>
              </div>
              
              <button
                onClick={handleCreateInvite}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold flex items-center shadow-glow-amber transform hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                Ajouter un invité
              </button>
            </div>

            {/* Tableau des invités */}
            <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 overflow-hidden">
              {/* En-tête du tableau - Desktop */}
              <div className="hidden md:grid md:grid-cols-6 gap-4 p-6 bg-gradient-to-r from-neutral-50 to-amber-50/30 border-b border-neutral-200/50">
                <div className="font-semibold text-slate-700">Nom</div>
                <div className="font-semibold text-slate-700">Table</div>
                <div className="font-semibold text-slate-700">Type</div>
                <div className="font-semibold text-slate-700">Statut</div>
                <div className="font-semibold text-slate-700">Lien</div>
                <div className="font-semibold text-slate-700 text-right">Actions</div>
              </div>

              {/* Corps du tableau */}
              <div className="divide-y divide-neutral-200/50">
                {userInvites.map((invite, index) => (
                  <div
                    key={invite.id}
                    className="animate-slide-up hover:bg-gradient-to-r hover:from-neutral-50/50 hover:to-amber-50/30 transition-all duration-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Version Desktop */}
                    <div className="hidden md:grid md:grid-cols-6 gap-4 p-6 items-center">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg ${
                          invite.etat === 'couple' 
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500' 
                            : 'bg-gradient-to-r from-amber-500 to-orange-500'
                        }`}>
                          {invite.nom.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-slate-900">{invite.nom}</p>
                        </div>
                      </div>
                      
                      <div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                          Table {invite.table}
                        </span>
                      </div>
                      
                      <div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          invite.etat === 'couple' 
                            ? 'bg-pink-100 text-pink-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {invite.etat === 'couple' ? 'Couple' : 'Simple'}
                        </span>
                      </div>
                      
                      <div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          invite.confirmed 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {invite.confirmed ? 'Confirmé' : 'En attente'}
                        </span>
                      </div>
                      
                      <div>
                        <button
                          onClick={() => copyInviteLink(invite.id)}
                          className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all duration-200 text-sm font-medium"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copier
                        </button>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => shareInvite(invite.id, invite.nom)}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                          title="Partager"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => {
                            const link = generateInviteLink(invite.id);
                            window.open(link, '_blank');
                          }}
                          className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                          title="Voir l'invitation"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteInvite(invite.id)}
                          className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Version Mobile */}
                    <div className="md:hidden p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg ${
                            invite.etat === 'couple' 
                              ? 'bg-gradient-to-r from-pink-500 to-purple-500' 
                              : 'bg-gradient-to-r from-amber-500 to-orange-500'
                          }`}>
                            {invite.nom.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-slate-900">{invite.nom}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-purple-600 font-medium">Table {invite.table}</span>
                              <span className={`text-xs font-medium ${
                                invite.etat === 'couple' ? 'text-pink-600' : 'text-blue-600'
                              }`}>
                                {invite.etat === 'couple' ? 'Couple' : 'Simple'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          invite.confirmed 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {invite.confirmed ? 'Confirmé' : 'En attente'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2">
                        <button
                          onClick={() => copyInviteLink(invite.id)}
                          className="bg-slate-100 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-200 transition-all duration-200 font-medium flex items-center justify-center text-xs"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copier
                        </button>
                        
                        <button
                          onClick={() => shareInvite(invite.id, invite.nom)}
                          className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-all duration-200 font-medium flex items-center justify-center text-xs"
                        >
                          <Share2 className="h-3 w-3 mr-1" />
                          Partager
                        </button>
                        
                        <button
                          onClick={() => {
                            const link = generateInviteLink(invite.id);
                            window.open(link, '_blank');
                          }}
                          className="bg-purple-100 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-200 transition-all duration-200 font-medium flex items-center justify-center text-xs"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Voir
                        </button>
                        
                        <button
                          onClick={() => handleDeleteInvite(invite.id)}
                          className="bg-rose-100 text-rose-700 px-3 py-2 rounded-lg hover:bg-rose-200 transition-all duration-200 font-medium flex items-center justify-center text-xs"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Suppr.
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {userInvites.length === 0 && (
                <div className="p-12 text-center">
                  <Users className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-500 mb-2">Aucun invité pour le moment</h3>
                  <p className="text-neutral-400 mb-6">Commencez par ajouter vos premiers invités</p>
                  <button
                    onClick={handleCreateInvite}
                    className="bg-amber-500 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-all duration-300 font-semibold"
                  >
                    Ajouter un invité
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'tables':
        return (
          <TableManagement 
            tables={tables} 
            setTables={setTables}
            guests={userInvites}
          />
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Statistiques et Analytics
              </h3>
              <p className="text-slate-600 mt-1">Analysez les performances de vos invitations</p>
            </div>

            {/* Statistiques détaillées */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200/50 shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-blue-700 text-sm font-medium">Invitations Envoyées</p>
                    <p className="text-2xl font-bold text-blue-900">{userInvites.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200/50 shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-emerald-500 rounded-xl">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-emerald-700 text-sm font-medium">Taux de Confirmation</p>
                    <p className="text-2xl font-bold text-emerald-900">
                      {userInvites.length > 0 
                        ? Math.round((userInvites.filter(i => i.confirmed).length / userInvites.length) * 100)
                        : 0
                      }%
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200/50 shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-amber-500 rounded-xl">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-amber-700 text-sm font-medium">En Attente</p>
                    <p className="text-2xl font-bold text-amber-900">
                      {userInvites.filter(i => !i.confirmed).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200/50 shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-500 rounded-xl">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-purple-700 text-sm font-medium">Couples</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {userInvites.filter(i => i.etat === 'couple').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Graphique simple */}
            <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 p-6">
              <h4 className="text-lg font-semibold text-slate-900 mb-6">Répartition des confirmations</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Confirmés</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-neutral-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-1000"
                        style={{ 
                          width: userInvites.length > 0 
                            ? `${(userInvites.filter(i => i.confirmed).length / userInvites.length) * 100}%`
                            : '0%'
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-slate-900 w-12 text-right">
                      {userInvites.filter(i => i.confirmed).length}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">En attente</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-neutral-200 rounded-full h-2">
                      <div 
                        className="bg-amber-500 h-2 rounded-full transition-all duration-1000"
                        style={{ 
                          width: userInvites.length > 0 
                            ? `${(userInvites.filter(i => !i.confirmed).length / userInvites.length) * 100}%`
                            : '0%'
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-slate-900 w-12 text-right">
                      {userInvites.filter(i => !i.confirmed).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Conseils */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200/50">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                <h4 className="text-lg font-semibold text-purple-800">Conseils pour améliorer vos confirmations</h4>
              </div>
              <ul className="text-purple-700 space-y-2">
                <li>• Envoyez des rappels personnalisés aux invités qui n'ont pas encore confirmé</li>
                <li>• Utilisez les liens de partage pour faciliter la diffusion</li>
                <li>• Personnalisez vos modèles pour qu'ils reflètent votre événement</li>
                <li>• Suivez régulièrement les statistiques pour identifier les tendances</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-amber-50/30 to-purple-50/20 dark:from-slate-900 dark:via-slate-800/30 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-luxury border-b border-neutral-200/50 dark:border-slate-600/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Crown className="h-8 w-8 text-amber-500 animate-glow drop-shadow-lg" />
                <div className="absolute inset-0 animate-pulse">
                  <Crown className="h-8 w-8 text-amber-300 opacity-30" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  Dashboard Furaha-Event
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Bienvenue, {userData?.firstName} {userData?.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 transform hover:scale-110"
                title="Paramètres"
              >
                <Settings className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-full hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-medium shadow-glow-amber transform hover:scale-105"
              >
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-amber-900 font-bold text-xs">
                  {userData?.firstName?.[0]}{userData?.lastName?.[0]}
                </div>
                <span className="hidden sm:block">Mon Profil</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-b border-neutral-200/50 dark:border-slate-600/50 sticky top-16 z-30">
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
                      ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500'
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
        {error && (
          <div className="mb-6 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-xl p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 mr-2" />
              <p className="text-rose-700 dark:text-rose-300">{error}</p>
            </div>
          </div>
        )}
        
        {renderTabContent()}
      </main>

      {/* Modals */}
      <DashboardSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={subscription?.plan || 'free'}
        remainingInvites={getRemainingInvites()}
      />

      {/* Modal d'ajout d'invité */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxury max-w-md w-full animate-slide-up">
            <div className="p-6 border-b border-neutral-200/50 dark:border-slate-600/50 bg-gradient-to-r from-neutral-50 to-amber-50/30 dark:from-slate-700 dark:to-slate-600">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="relative mr-3">
                    <Users className="h-6 w-6 text-amber-500 animate-glow drop-shadow-lg" />
                    <div className="absolute inset-0 animate-pulse">
                      <Users className="h-6 w-6 text-amber-300 opacity-30" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                      Ajouter un invité
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      Créez une nouvelle invitation
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteFormData({ guestName: '', tableNumber: '', guestType: 'simple' });
                  }}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                >
                  <X className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitInvite} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nom de l'invité *
                  </label>
                  <input
                    type="text"
                    value={inviteFormData.guestName}
                    onChange={(e) => setInviteFormData(prev => ({ ...prev, guestName: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    placeholder="Ex: Sophie Martin"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Numéro de table *
                  </label>
                  <input
                    type="text"
                    value={inviteFormData.tableNumber}
                    onChange={(e) => setInviteFormData(prev => ({ ...prev, tableNumber: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    placeholder="Ex: 1, 2, VIP..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Type d'invité
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setInviteFormData(prev => ({ ...prev, guestType: 'simple' }))}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        inviteFormData.guestType === 'simple'
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                          : 'border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-300 dark:hover:border-amber-400'
                      }`}
                    >
                      <div className="text-center">
                        <User className="h-6 w-6 mx-auto mb-2" />
                        <p className="font-medium">Simple</p>
                        <p className="text-xs opacity-75">1 personne</p>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setInviteFormData(prev => ({ ...prev, guestType: 'couple' }))}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        inviteFormData.guestType === 'couple'
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                          : 'border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-300 dark:hover:border-amber-400'
                      }`}
                    >
                      <div className="text-center">
                        <Users className="h-6 w-6 mx-auto mb-2" />
                        <p className="font-medium">Couple</p>
                        <p className="text-xs opacity-75">2 personnes</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteFormData({ guestName: '', tableNumber: '', guestType: 'simple' });
                  }}
                  className="flex-1 px-4 py-3 border border-neutral-300 dark:border-slate-600 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-slate-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-slate-600 transition-all duration-200 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-glow-amber transform hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2 inline" />
                  Créer l'invité
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;