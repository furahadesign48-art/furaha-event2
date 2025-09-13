import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Settings, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Share2, 
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
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Wine,
  MessageCircle,
  QrCode,
  FileText,
  Upload,
  Copy,
  ExternalLink,
  Zap,
  TrendingUp,
  UserCheck,
  Mail
} from 'lucide-react';
import { useTemplates } from '../hooks/useTemplates';
import { useSubscription } from '../hooks/useSubscription';
import { useAuth } from './AuthContext';
import { UserData } from '../hooks/useAuth';
import { UserModel, Invite } from '../services/templateService';
import TemplateCustomization from './TemplateCustomization';
import TableManagement from './TableManagement';
import UserProfile from './UserProfile';
import DashboardSettings from './DashboardSettings';
import UpgradeModal from './UpgradeModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';

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
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { 
    userModels, 
    userInvites, 
    isLoading, 
    error, 
    createInvite, 
    updateInvite, 
    deleteInvite,
    refreshUserData,
    clearError 
  } = useTemplates();
  const { subscription, canCreateInvite, getRemainingInvites } = useSubscription();

  // États pour la navigation et les modales
  const [activeTab, setActiveTab] = useState('overview');
  const [showCustomization, setShowCustomization] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<UserModel | null>(null);

  // États pour la gestion des invités
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Invite | null>(null);
  const [guestFormData, setGuestFormData] = useState({
    nom: '',
    table: '',
    etat: 'simple' as 'simple' | 'couple'
  });

  // États pour la gestion des tables
  const [tables, setTables] = useState<Table[]>([
    { id: 1, name: 'Table des Mariés', seats: 8, assignedGuests: [] },
    { id: 2, name: 'Table Famille', seats: 10, assignedGuests: [] },
    { id: 3, name: 'Table Amis', seats: 8, assignedGuests: [] }
  ]);

  // États pour les filtres et la recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Effet pour traiter le template sélectionné
  useEffect(() => {
    if (selectedTemplate) {
      console.log('Template sélectionné reçu:', selectedTemplate);
      setSelectedModel(selectedTemplate);
      setShowCustomization(true);
    }
  }, [selectedTemplate]);

  // Effet pour rafraîchir les données
  useEffect(() => {
    if (user) {
      refreshUserData();
    }
  }, [user, refreshUserData]);

  // Gestion des erreurs
  useEffect(() => {
    if (error) {
      console.error('Erreur Dashboard:', error);
      setTimeout(() => clearError(), 5000);
    }
  }, [error, clearError]);

  // Navigation tabs
  const navigationTabs = [
    { id: 'overview', label: t('dashboard') || 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'templates', label: t('templates') || 'Mes Modèles', icon: Sparkles },
    { id: 'guests', label: t('guests') || 'Invités', icon: Users },
    { id: 'tables', label: t('tables') || 'Tables', icon: MapPin },
    { id: 'analytics', label: t('analytics') || 'Statistiques', icon: TrendingUp }
  ];

  // Fonctions utilitaires
  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'wedding': return Heart;
      case 'birthday': return Gift;
      case 'graduation': return GraduationCap;
      default: return Heart;
    }
  };

  const getStatusColor = (confirmed: boolean) => {
    return confirmed 
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
  };

  const getStatusIcon = (confirmed: boolean) => {
    return confirmed ? CheckCircle : Clock;
  };

  // Gestion des invités
  const handleAddGuest = async () => {
    if (!canCreateInvite()) {
      setShowUpgradeModal(true);
      return;
    }

    if (!guestFormData.nom.trim()) {
      alert('Veuillez saisir le nom de l\'invité');
      return;
    }

    try {
      const inviteId = await createInvite({
        nom: guestFormData.nom,
        table: guestFormData.table || 'Non assigné',
        etat: guestFormData.etat,
        confirmed: false
      });

      if (inviteId) {
        setShowAddGuestModal(false);
        setGuestFormData({ nom: '', table: '', etat: 'simple' });
        await refreshUserData();
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'invité:', error);
    }
  };

  const handleEditGuest = async () => {
    if (!editingGuest) return;

    try {
      await updateInvite(editingGuest.id, {
        nom: guestFormData.nom,
        table: guestFormData.table,
        etat: guestFormData.etat
      });

      setEditingGuest(null);
      setGuestFormData({ nom: '', table: '', etat: 'simple' });
      await refreshUserData();
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet invité ?')) {
      try {
        await deleteInvite(guestId);
        await refreshUserData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const openEditModal = (guest: Invite) => {
    setEditingGuest(guest);
    setGuestFormData({
      nom: guest.nom,
      table: guest.table || '',
      etat: guest.etat
    });
  };

  // Filtrage et tri des invités
  const filteredGuests = userInvites.filter(guest => {
    const matchesSearch = guest.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'confirmed' && guest.confirmed) ||
      (filterStatus === 'pending' && !guest.confirmed);
    return matchesSearch && matchesFilter;
  });

  const sortedGuests = [...filteredGuests].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.nom.localeCompare(b.nom);
      case 'table':
        return (a.table || '').localeCompare(b.table || '');
      case 'status':
        return Number(b.confirmed) - Number(a.confirmed);
      default:
        return 0;
    }
  });

  // Statistiques
  const stats = {
    totalInvites: userInvites.length,
    confirmedGuests: userInvites.filter(g => g.confirmed).length,
    pendingGuests: userInvites.filter(g => !g.confirmed).length,
    totalTables: tables.length,
    remainingInvites: getRemainingInvites()
  };

  // Gestion de la personnalisation
  const handleCustomizeTemplate = (model: UserModel) => {
    setSelectedModel(model);
    setShowCustomization(true);
  };

  const handleSaveCustomization = (customizedTemplate: any) => {
    console.log('Template personnalisé sauvegardé:', customizedTemplate);
    setShowCustomization(false);
    setSelectedModel(null);
    refreshUserData();
  };

  // Génération de lien d'invitation
  const generateInviteLink = (inviteId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/invitation/${inviteId}`;
  };

  const copyInviteLink = (inviteId: string) => {
    const link = generateInviteLink(inviteId);
    navigator.clipboard.writeText(link).then(() => {
      alert('Lien copié dans le presse-papiers !');
    });
  };

  // Rendu conditionnel pour la personnalisation
  if (showCustomization && selectedModel) {
    return (
      <TemplateCustomization
        template={selectedModel}
        onBack={() => {
          setShowCustomization(false);
          setSelectedModel(null);
        }}
        onSave={handleSaveCustomization}
      />
    );
  }

  // Rendu conditionnel pour le profil
  if (showProfile && userData) {
    return (
      <UserProfile
        userData={userData}
        onLogout={onLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-amber-50/30 to-purple-50/20 dark:from-slate-900 dark:via-slate-800/30 dark:to-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-luxury border-b border-amber-200/30 dark:border-slate-600/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo et titre */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img 
                  src="https://firebasestorage.googleapis.com/v0/b/furaha-event-831ca.firebasestorage.app/o/FURAHA-GOLD2.png?alt=media&token=5c1cbd85-df78-4e88-b0ad-d1c57d460692" 
                  alt="Furaha Event Logo" 
                  className="h-10 w-10 object-contain drop-shadow-lg animate-glow"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-amber-700 to-slate-900 dark:from-slate-100 dark:via-amber-300 dark:to-slate-100 bg-clip-text text-transparent">
                  {t('dashboard') || 'Dashboard'}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {userData ? `Bienvenue, ${userData.firstName}` : 'Gestion de vos événements'}
                </p>
              </div>
            </div>

            {/* Actions header */}
            <div className="flex items-center space-x-4">
              {/* Indicateur d'abonnement */}
              {subscription && (
                <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 px-3 py-2 rounded-xl border border-amber-200/50 dark:border-amber-600/30">
                  <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    {subscription.plan === 'free' ? `${stats.remainingInvites}/5` : 'Illimité'}
                  </span>
                </div>
              )}

              {/* Notifications */}
              <button className="p-2 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700 rounded-lg transition-all duration-200">
                <Bell className="h-5 w-5" />
              </button>

              {/* Contrôles thème et langue */}
              <ThemeToggle />
              <LanguageSelector />

              {/* Menu utilisateur */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowProfile(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-2 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-medium shadow-glow-amber transform hover:scale-105"
                >
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                    {userData?.firstName?.[0]}{userData?.lastName?.[0]}
                  </div>
                  <span className="hidden sm:block">{userData?.firstName}</span>
                </button>

                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700 rounded-lg transition-all duration-200"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation tabs */}
        <div className="mb-8">
          <div className="border-b border-neutral-200/50 dark:border-slate-600/50">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {navigationTabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <IconComponent className="h-5 w-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="animate-fade-in">
          {/* Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxury border border-neutral-200/50 dark:border-slate-600/50 p-6 hover:shadow-glow-amber transition-all duration-300">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-glow-amber">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('total_invitations') || 'Total Invitations'}</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalInvites}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxury border border-neutral-200/50 dark:border-slate-600/50 p-6 hover:shadow-glow-amber transition-all duration-300">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('confirmed_guests') || 'Invités Confirmés'}</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.confirmedGuests}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxury border border-neutral-200/50 dark:border-slate-600/50 p-6 hover:shadow-glow-amber transition-all duration-300">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('pending_responses') || 'En Attente'}</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.pendingGuests}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxury border border-neutral-200/50 dark:border-slate-600/50 p-6 hover:shadow-glow-amber transition-all duration-300">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('total_tables') || 'Total Tables'}</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalTables}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxury border border-neutral-200/50 dark:border-slate-600/50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">{t('quick_actions') || 'Actions Rapides'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setShowAddGuestModal(true)}
                    className="flex items-center justify-center p-4 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-xl border border-amber-200/50 dark:border-amber-600/30 hover:from-amber-100 hover:to-amber-200 dark:hover:from-amber-800/40 dark:hover:to-amber-700/40 transition-all duration-300 group"
                  >
                    <Plus className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-3 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-medium text-amber-800 dark:text-amber-300">{t('create_invitation') || 'Ajouter un Invité'}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('tables')}
                    className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl border border-purple-200/50 dark:border-purple-600/30 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-800/40 dark:hover:to-purple-700/40 transition-all duration-300 group"
                  >
                    <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-medium text-purple-800 dark:text-purple-300">{t('manage_guests') || 'Gérer les Tables'}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="flex items-center justify-center p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-xl border border-emerald-200/50 dark:border-emerald-600/30 hover:from-emerald-100 hover:to-emerald-200 dark:hover:from-emerald-800/40 dark:hover:to-emerald-700/40 transition-all duration-300 group"
                  >
                    <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mr-3 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-medium text-emerald-800 dark:text-emerald-300">{t('view_analytics') || 'Voir Statistiques'}</span>
                  </button>
                </div>
              </div>

              {/* Activité récente */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxury border border-neutral-200/50 dark:border-slate-600/50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">{t('recent_activity') || 'Activité Récente'}</h3>
                {userInvites.length > 0 ? (
                  <div className="space-y-4">
                    {userInvites.slice(0, 5).map((invite, index) => (
                      <div key={invite.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-amber-50/30 dark:from-slate-700 dark:to-slate-600 rounded-xl border border-neutral-200/50 dark:border-slate-600/50">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-rose-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {invite.nom.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <div className="ml-4">
                            <p className="font-medium text-slate-900 dark:text-slate-100">{invite.nom}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {invite.table ? `Table: ${invite.table}` : 'Table non assignée'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invite.confirmed)}`}>
                            {invite.confirmed ? 'Confirmé' : 'En attente'}
                          </span>
                          <button
                            onClick={() => copyInviteLink(invite.id)}
                            className="p-2 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700 rounded-lg transition-all duration-200"
                            title="Copier le lien"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-16 w-16 text-neutral-300 dark:text-slate-600 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-neutral-500 dark:text-slate-400 mb-2">Aucun invité pour le moment</h4>
                    <p className="text-neutral-400 dark:text-slate-500 mb-6">Commencez par ajouter vos premiers invités</p>
                    <button
                      onClick={() => setShowAddGuestModal(true)}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-glow-amber transform hover:scale-105"
                    >
                      <Plus className="h-5 w-5 inline mr-2" />
                      Ajouter un invité
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mes Modèles */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('templates') || 'Mes Modèles'}</h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">Gérez et personnalisez vos modèles d'invitation</p>
                </div>
              </div>

              {userModels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userModels.map((model, index) => {
                    const IconComponent = getIconForCategory(model.category);
                    return (
                      <div
                        key={model.id}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxury border border-neutral-200/50 dark:border-slate-600/50 overflow-hidden hover:shadow-glow-amber transition-all duration-300 group animate-slide-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={model.backgroundImage}
                            alt={model.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                          <div className="absolute top-4 right-4">
                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                              <IconComponent className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-white font-bold text-lg mb-1">{model.name}</h3>
                            <p className="text-white/80 text-sm capitalize">{model.category}</p>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                Premium
                              </span>
                              <span className="text-sm text-slate-500 dark:text-slate-400">
                                {new Date(model.createdAt || '').toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <button
                              onClick={() => handleCustomizeTemplate(model)}
                              className="flex items-center justify-center px-3 py-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-800/40 transition-all duration-200 text-sm font-medium"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Modifier
                            </button>

                            <button
                              onClick={() => window.open(`/invitation/preview-${model.id}`, '_blank')}
                              className="flex items-center justify-center px-3 py-2 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800/40 transition-all duration-200 text-sm font-medium"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Aperçu
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) {
                                  // Logique de suppression
                                }
                              }}
                              className="flex items-center justify-center px-3 py-2 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-800/40 transition-all duration-200 text-sm font-medium"
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
                  <Sparkles className="h-16 w-16 text-neutral-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-500 dark:text-slate-400 mb-2">Aucun modèle personnalisé</h3>
                  <p className="text-neutral-400 dark:text-slate-500 mb-6">Créez votre premier modèle d'invitation personnalisé</p>
                  <button
                    onClick={onLogout}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-glow-amber transform hover:scale-105"
                  >
                    Retour à l'accueil
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Gestion des Invités */}
          {activeTab === 'guests' && (
            <div className="space-y-6">
              {/* Header avec recherche et filtres */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('guests') || 'Gestion des Invités'}</h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    {stats.totalInvites} invité{stats.totalInvites > 1 ? 's' : ''} • {stats.confirmedGuests} confirmé{stats.confirmedGuests > 1 ? 's' : ''}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  {/* Recherche */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un invité..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-neutral-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-slate-700 dark:text-slate-100 transition-all duration-200"
                    />
                  </div>

                  {/* Filtres */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-neutral-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-slate-700 dark:text-slate-100 transition-all duration-200"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="confirmed">Confirmés</option>
                    <option value="pending">En attente</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-neutral-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-slate-700 dark:text-slate-100 transition-all duration-200"
                  >
                    <option value="name">Trier par nom</option>
                    <option value="table">Trier par table</option>
                    <option value="status">Trier par statut</option>
                  </select>

                  <button
                    onClick={() => setShowAddGuestModal(true)}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold flex items-center shadow-glow-amber transform hover:scale-105"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </button>
                </div>
              </div>

              {/* Liste des invités */}
              {sortedGuests.length > 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxury border border-neutral-200/50 dark:border-slate-600/50 overflow-hidden">
                  {/* Header du tableau - Desktop */}
                  <div className="hidden md:grid md:grid-cols-6 gap-4 p-6 bg-gradient-to-r from-neutral-50 to-amber-50/30 dark:from-slate-700 dark:to-slate-600 border-b border-neutral-200/50 dark:border-slate-600/50">
                    <div className="font-semibold text-slate-700 dark:text-slate-300">Invité</div>
                    <div className="font-semibold text-slate-700 dark:text-slate-300">Table</div>
                    <div className="font-semibold text-slate-700 dark:text-slate-300">Type</div>
                    <div className="font-semibold text-slate-700 dark:text-slate-300">Statut</div>
                    <div className="font-semibold text-slate-700 dark:text-slate-300">Lien</div>
                    <div className="font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</div>
                  </div>

                  {/* Corps du tableau */}
                  <div className="divide-y divide-neutral-200/50 dark:divide-slate-600/50">
                    {sortedGuests.map((guest, index) => (
                      <div
                        key={guest.id}
                        className="animate-slide-up hover:bg-gradient-to-r hover:from-neutral-50/50 hover:to-amber-50/30 dark:hover:from-slate-700/50 dark:hover:to-slate-600/30 transition-all duration-300"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        {/* Version Desktop */}
                        <div className="hidden md:grid md:grid-cols-6 gap-4 p-6 items-center">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg ${
                              guest.etat === 'couple' 
                                ? 'bg-gradient-to-r from-pink-500 to-purple-500' 
                                : 'bg-gradient-to-r from-amber-500 to-orange-500'
                            }`}>
                              {guest.nom.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                            <div className="ml-3">
                              <p className="font-medium text-slate-900 dark:text-slate-100">{guest.nom}</p>
                            </div>
                          </div>

                          <div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                              <MapPin className="h-3 w-3 mr-1" />
                              {guest.table || 'Non assigné'}
                            </span>
                          </div>

                          <div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              guest.etat === 'couple' 
                                ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300' 
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                            }`}>
                              {guest.etat === 'couple' ? 'Couple' : 'Simple'}
                            </span>
                          </div>

                          <div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(guest.confirmed)}`}>
                              {React.createElement(getStatusIcon(guest.confirmed), { className: "h-3 w-3 mr-1" })}
                              {guest.confirmed ? 'Confirmé' : 'En attente'}
                            </span>
                          </div>

                          <div>
                            <button
                              onClick={() => copyInviteLink(guest.id)}
                              className="flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-800/40 transition-all duration-200 text-sm font-medium"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copier
                            </button>
                          </div>

                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => window.open(generateInviteLink(guest.id), '_blank')}
                              className="p-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-all duration-200"
                              title="Voir l'invitation"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(guest)}
                              className="p-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-all duration-200"
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteGuest(guest.id)}
                              className="p-2 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all duration-200"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Version Mobile */}
                        <div className="md:hidden p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-lg ${
                                guest.etat === 'couple' 
                                  ? 'bg-gradient-to-r from-pink-500 to-purple-500' 
                                  : 'bg-gradient-to-r from-amber-500 to-orange-500'
                              }`}>
                                {guest.nom.split(' ').map(n => n[0]).join('').substring(0, 2)}
                              </div>
                              <div className="ml-3">
                                <p className="font-medium text-slate-900 dark:text-slate-100 text-lg">{guest.nom}</p>
                                <div className="flex items-center mt-1 space-x-2">
                                  <span className="text-sm text-slate-600 dark:text-slate-400">
                                    {guest.table || 'Non assigné'}
                                  </span>
                                  <span className="text-xs text-slate-500 dark:text-slate-500">•</span>
                                  <span className="text-sm text-slate-600 dark:text-slate-400">
                                    {guest.etat === 'couple' ? 'Couple' : 'Simple'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(guest.confirmed)}`}>
                              {guest.confirmed ? 'Confirmé' : 'En attente'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-2">
                            <button
                              onClick={() => window.open(generateInviteLink(guest.id), '_blank')}
                              className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-3 py-2 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800/40 transition-all duration-200 font-medium flex items-center justify-center text-sm"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Voir
                            </button>
                            <button
                              onClick={() => copyInviteLink(guest.id)}
                              className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-3 py-2 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-800/40 transition-all duration-200 font-medium flex items-center justify-center text-sm"
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Copier
                            </button>
                            <button
                              onClick={() => openEditModal(guest)}
                              className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 px-3 py-2 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-800/40 transition-all duration-200 font-medium flex items-center justify-center text-sm"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteGuest(guest.id)}
                              className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 px-3 py-2 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-800/40 transition-all duration-200 font-medium flex items-center justify-center text-sm"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Suppr.
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-neutral-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-500 dark:text-slate-400 mb-2">
                    {searchTerm || filterStatus !== 'all' ? 'Aucun invité trouvé' : 'Aucun invité pour le moment'}
                  </h3>
                  <p className="text-neutral-400 dark:text-slate-500 mb-6">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Essayez de modifier vos critères de recherche'
                      : 'Commencez par ajouter vos premiers invités'
                    }
                  </p>
                  {(!searchTerm && filterStatus === 'all') && (
                    <button
                      onClick={() => setShowAddGuestModal(true)}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-glow-amber transform hover:scale-105"
                    >
                      <Plus className="h-5 w-5 inline mr-2" />
                      Ajouter un invité
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Gestion des Tables */}
          {activeTab === 'tables' && (
            <TableManagement
              tables={tables}
              setTables={setTables}
              guests={userInvites}
            />
          )}

          {/* Statistiques */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('analytics') || 'Statistiques'}</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Analysez les données de vos événements</p>
              </div>

              {/* Statistiques détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxury border border-neutral-200/50 dark:border-slate-600/50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Taux de confirmation</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {stats.totalInvites > 0 ? Math.round((stats.confirmedGuests / stats.totalInvites) * 100) : 0}%
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxury border border-neutral-200/50 dark:border-slate-600/50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Invités couples</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {userInvites.filter(g => g.etat === 'couple').length}
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxury border border-neutral-200/50 dark:border-slate-600/50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Places occupées</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {userInvites.reduce((total, guest) => total + (guest.etat === 'couple' ? 2 : 1), 0)}
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                      <UserCheck className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxury border border-neutral-200/50 dark:border-slate-600/50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Invitations restantes</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {subscription?.plan === 'free' ? stats.remainingInvites : '∞'}
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Graphiques et analyses */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxury border border-neutral-200/50 dark:border-slate-600/50 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Répartition par statut</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full mr-3"></div>
                        <span className="text-slate-700 dark:text-slate-300">Confirmés</span>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{stats.confirmedGuests}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-amber-500 rounded-full mr-3"></div>
                        <span className="text-slate-700 dark:text-slate-300">En attente</span>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{stats.pendingGuests}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxury border border-neutral-200/50 dark:border-slate-600/50 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Répartition par type</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-slate-700 dark:text-slate-300">Invités simples</span>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {userInvites.filter(g => g.etat === 'simple').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-pink-500 rounded-full mr-3"></div>
                        <span className="text-slate-700 dark:text-slate-300">Couples</span>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {userInvites.filter(g => g.etat === 'couple').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommandations */}
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-2xl p-6 border border-amber-200/50 dark:border-amber-600/30">
                <div className="flex items-center mb-4">
                  <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2" />
                  <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300">Recommandations</h3>
                </div>
                <div className="space-y-3">
                  {stats.pendingGuests > 0 && (
                    <p className="text-amber-700 dark:text-amber-300 text-sm">
                      • Vous avez {stats.pendingGuests} invité{stats.pendingGuests > 1 ? 's' : ''} en attente de confirmation. 
                      Pensez à leur envoyer un rappel.
                    </p>
                  )}
                  {subscription?.plan === 'free' && stats.remainingInvites < 2 && (
                    <p className="text-amber-700 dark:text-amber-300 text-sm">
                      • Il vous reste seulement {stats.remainingInvites} invitation{stats.remainingInvites > 1 ? 's' : ''}. 
                      Considérez une mise à niveau vers un plan premium.
                    </p>
                  )}
                  {stats.totalInvites === 0 && (
                    <p className="text-amber-700 dark:text-amber-300 text-sm">
                      • Commencez par ajouter vos premiers invités pour voir apparaître les statistiques.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'ajout/modification d'invité */}
      {(showAddGuestModal || editingGuest) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxury max-w-md w-full animate-slide-up">
            <div className="p-6 border-b border-neutral-200/50 dark:border-slate-600/50">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {editingGuest ? 'Modifier l\'invité' : 'Ajouter un invité'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddGuestModal(false);
                    setEditingGuest(null);
                    setGuestFormData({ nom: '', table: '', etat: 'simple' });
                  }}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                >
                  <X className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nom de l'invité *
                  </label>
                  <input
                    type="text"
                    value={guestFormData.nom}
                    onChange={(e) => setGuestFormData({ ...guestFormData, nom: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-slate-700 dark:text-slate-100 transition-all duration-200"
                    placeholder="Ex: Sophie Martin"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Table
                  </label>
                  <select
                    value={guestFormData.table}
                    onChange={(e) => setGuestFormData({ ...guestFormData, table: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-slate-700 dark:text-slate-100 transition-all duration-200"
                  >
                    <option value="">Sélectionner une table</option>
                    {tables.map((table) => (
                      <option key={table.id} value={table.name}>{table.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Type d'invité
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setGuestFormData({ ...guestFormData, etat: 'simple' })}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                        guestFormData.etat === 'simple'
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                          : 'border-neutral-300 dark:border-slate-600 hover:border-amber-300 dark:hover:border-amber-600'
                      }`}
                    >
                      <User className="h-5 w-5 mx-auto mb-2" />
                      <span className="text-sm font-medium">Simple</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuestFormData({ ...guestFormData, etat: 'couple' })}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                        guestFormData.etat === 'couple'
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300'
                          : 'border-neutral-300 dark:border-slate-600 hover:border-pink-300 dark:hover:border-pink-600'
                      }`}
                    >
                      <Heart className="h-5 w-5 mx-auto mb-2" />
                      <span className="text-sm font-medium">Couple</span>
                    </button>
                  </div>
                </div>

                {/* Limite d'invitations */}
                {subscription?.plan === 'free' && !editingGuest && (
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-xl p-4 border border-amber-200/50 dark:border-amber-600/30">
                    <div className="flex items-center mb-2">
                      <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400 mr-2" />
                      <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Plan Gratuit</span>
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      {stats.remainingInvites} invitation{stats.remainingInvites > 1 ? 's' : ''} restante{stats.remainingInvites > 1 ? 's' : ''} sur 5
                    </p>
                    {stats.remainingInvites === 0 && (
                      <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="mt-2 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium underline"
                      >
                        Passer au plan premium
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddGuestModal(false);
                    setEditingGuest(null);
                    setGuestFormData({ nom: '', table: '', etat: 'simple' });
                  }}
                  className="flex-1 px-4 py-3 border border-neutral-300 dark:border-slate-600 text-neutral-700 dark:text-neutral-300 rounded-xl hover:bg-neutral-50 dark:hover:bg-slate-700 transition-all duration-200 font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={editingGuest ? handleEditGuest : handleAddGuest}
                  disabled={!guestFormData.nom.trim() || (!editingGuest && !canCreateInvite())}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-glow-amber transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {editingGuest ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de mise à niveau */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={subscription?.plan || 'free'}
        remainingInvites={stats.remainingInvites}
      />

      {/* Modal des paramètres */}
      <DashboardSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Notification d'erreur */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-rose-500 text-white px-6 py-4 rounded-xl shadow-luxury animate-slide-up z-50">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="fixed bottom-4 left-4 bg-amber-500 text-white px-6 py-4 rounded-xl shadow-luxury animate-slide-up z-50">
          <div className="flex items-center">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
            <span className="font-medium">Chargement...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;