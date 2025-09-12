import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  BarChart3,
  Crown,
  Sparkles,
  Heart,
  Gift,
  GraduationCap,
  User,
  Mail,
  LogOut,
  ArrowLeft,
  X,
  Check,
  Clock,
  XCircle
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { useTemplates } from '../hooks/useTemplates';
import { useSubscription } from '../hooks/useSubscription';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import UserProfile from './UserProfile';
import TemplateCustomization from './TemplateCustomization';
import TableManagement from './TableManagement';
import UpgradeModal from './UpgradeModal';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

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

interface DashboardProps {
  selectedTemplate?: TemplateData | null;
  userData: UserData | null;
  onLogout: () => void;
}

const Dashboard = ({ selectedTemplate, userData, onLogout }: DashboardProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();
  const { 
    userModels, 
    userInvites, 
    createInvite, 
    updateInvite, 
    deleteInvite, 
    isLoading, 
    error,
    refreshUserData 
  } = useTemplates();
  const { subscription, canCreateInvite, getRemainingInvites } = useSubscription();

  const [activeTab, setActiveTab] = useState('overview');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [editingInvite, setEditingInvite] = useState(null);
  const [customizingTemplate, setCustomizingTemplate] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [tables, setTables] = useState([
    { id: 1, name: 'Table des Mariés', seats: 8, assignedGuests: [] },
    { id: 2, name: 'Table Famille', seats: 10, assignedGuests: [] },
    { id: 3, name: 'Table Amis', seats: 8, assignedGuests: [] }
  ]);

  const [inviteForm, setInviteForm] = useState({
    nom: '',
    table: '',
    etat: 'simple' as 'simple' | 'couple'
  });

  useEffect(() => {
    if (selectedTemplate) {
      setActiveTab('templates');
    }
  }, [selectedTemplate]);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canCreateInvite()) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      const inviteId = await createInvite({
        nom: inviteForm.nom,
        table: inviteForm.table,
        etat: inviteForm.etat,
        confirmed: false
      });

      if (inviteId) {
        setShowInviteModal(false);
        setInviteForm({ nom: '', table: '', etat: 'simple' });
        await refreshUserData();
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'invité:', error);
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet invité ?')) {
      await deleteInvite(inviteId);
      await refreshUserData();
    }
  };

  const getStatusIcon = (confirmed: boolean) => {
    return confirmed ? (
      <Check className="h-4 w-4 text-emerald-500" />
    ) : (
      <Clock className="h-4 w-4 text-amber-500" />
    );
  };

  const getStatusText = (confirmed: boolean) => {
    return confirmed ? t('invitations.confirmed') : t('invitations.pending');
  };

  const getStatusColor = (confirmed: boolean) => {
    return confirmed 
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
  };

  const getCategoryIcon = (category: string) => {
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

  const getCategoryColor = (category: string) => {
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

  if (showProfile && userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-amber-50/30 to-purple-50/20 dark:from-slate-900 dark:via-slate-800/30 dark:to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setShowProfile(false)}
              className="flex items-center text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-all duration-300 group"
            >
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              {t('common.back')}
            </button>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>
          
          <UserProfile 
            userData={userData} 
            onLogout={onLogout}
          />
        </div>
      </div>
    );
  }

  if (customizingTemplate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-amber-50/30 to-purple-50/20 dark:from-slate-900 dark:via-slate-800/30 dark:to-slate-900 p-4">
        <TemplateCustomization
          template={customizingTemplate}
          onBack={() => setCustomizingTemplate(null)}
          onSave={(customizedTemplate) => {
            console.log('Template sauvegardé:', customizedTemplate);
            setCustomizingTemplate(null);
          }}
        />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: t('dashboard.overview'), icon: BarChart3 },
    { id: 'invitations', label: t('dashboard.invitations'), icon: Users },
    { id: 'templates', label: t('dashboard.templates'), icon: Calendar },
    { id: 'tables', label: 'Tables', icon: Users },
    { id: 'settings', label: t('dashboard.settings'), icon: Settings }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-2xl p-6 border border-amber-200/50 dark:border-amber-700/50 shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-amber-500 rounded-xl shadow-glow-amber">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-amber-700 dark:text-amber-300 text-sm font-medium">Total Invités</p>
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{userInvites.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-700/50 shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-emerald-500 rounded-xl">
              <Check className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-emerald-700 dark:text-emerald-300 text-sm font-medium">Confirmés</p>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                {userInvites.filter(invite => invite.confirmed).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/50 shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-purple-500 rounded-xl shadow-glow-purple">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-purple-700 dark:text-purple-300 text-sm font-medium">Modèles</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{userModels.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-800/30 rounded-2xl p-6 border border-rose-200/50 dark:border-rose-700/50 shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-rose-500 rounded-xl">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-rose-700 dark:text-rose-300 text-sm font-medium">Plan</p>
              <p className="text-lg font-bold text-rose-900 dark:text-rose-100">
                {subscription?.plan === 'free' ? 'Gratuit' : subscription?.plan}
              </p>
              {subscription?.plan === 'free' && (
                <p className="text-xs text-rose-600 dark:text-rose-400">
                  {getRemainingInvites()}/5 restantes
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxury border border-neutral-200/50 dark:border-slate-600/50 p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              if (canCreateInvite()) {
                setShowInviteModal(true);
              } else {
                setShowUpgradeModal(true);
              }
            }}
            className="flex items-center justify-center p-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-glow-amber transform hover:scale-105"
          >
            <Plus className="h-5 w-5 mr-2" />
            {t('invitations.create')}
          </button>
          
          <button
            onClick={() => setActiveTab('templates')}
            className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-glow-purple transform hover:scale-105"
          >
            <Calendar className="h-5 w-5 mr-2" />
            {t('templates.create')}
          </button>
          
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center justify-center p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-semibold transform hover:scale-105"
          >
            <User className="h-5 w-5 mr-2" />
            {t('dashboard.profile')}
          </button>
        </div>
      </div>
    </div>
  );

  const renderInvitations = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('invitations.title')}</h3>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {userInvites.length} invité{userInvites.length > 1 ? 's' : ''} 
            {subscription?.plan === 'free' && ` • ${getRemainingInvites()} restante${getRemainingInvites() > 1 ? 's' : ''}`}
          </p>
        </div>
        
        <button
          onClick={() => {
            if (canCreateInvite()) {
              setShowInviteModal(true);
            } else {
              setShowUpgradeModal(true);
            }
          }}
          className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold flex items-center shadow-glow-amber transform hover:scale-105"
        >
          <Plus className="h-5 w-5 mr-2" />
          {t('invitations.create')}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxury border border-neutral-200/50 dark:border-slate-600/50 overflow-hidden">
        {userInvites.length > 0 ? (
          <>
            <div className="hidden md:grid md:grid-cols-5 gap-4 p-6 bg-gradient-to-r from-neutral-50 to-amber-50/30 dark:from-slate-700 dark:to-slate-600/30 border-b border-neutral-200/50 dark:border-slate-600/50">
              <div className="font-semibold text-slate-700 dark:text-slate-300">{t('invitations.name')}</div>
              <div className="font-semibold text-slate-700 dark:text-slate-300">{t('invitations.table')}</div>
              <div className="font-semibold text-slate-700 dark:text-slate-300">Type</div>
              <div className="font-semibold text-slate-700 dark:text-slate-300">{t('invitations.status')}</div>
              <div className="font-semibold text-slate-700 dark:text-slate-300 text-right">{t('invitations.actions')}</div>
            </div>

            <div className="divide-y divide-neutral-200/50 dark:divide-slate-600/50">
              {userInvites.map((invite, index) => (
                <div
                  key={invite.id}
                  className="animate-slide-up hover:bg-gradient-to-r hover:from-neutral-50/50 hover:to-amber-50/30 dark:hover:from-slate-700/50 dark:hover:to-slate-600/30 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="hidden md:grid md:grid-cols-5 gap-4 p-6 items-center">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{invite.nom}</div>
                    <div className="text-slate-600 dark:text-slate-400">{invite.table || 'Non assigné'}</div>
                    <div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        invite.etat === 'couple' 
                          ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300' 
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                        {invite.etat === 'couple' ? 'Couple' : 'Simple'}
                      </span>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invite.confirmed)}`}>
                        {getStatusIcon(invite.confirmed)}
                        <span className="ml-2">{getStatusText(invite.confirmed)}</span>
                      </span>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => window.open(`/invitation/${invite.id}`, '_blank')}
                        className="p-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-all duration-200 transform hover:scale-110"
                        title="Voir l'invitation"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteInvite(invite.id)}
                        className="p-2 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all duration-200 transform hover:scale-110"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="md:hidden p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 text-lg">{invite.nom}</h4>
                        <div className="flex items-center mt-1 space-x-3">
                          <span className="text-slate-600 dark:text-slate-400 text-sm">
                            Table: {invite.table || 'Non assigné'}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            invite.etat === 'couple' 
                              ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300' 
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}>
                            {invite.etat === 'couple' ? 'Couple' : 'Simple'}
                          </span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invite.confirmed)}`}>
                        {getStatusIcon(invite.confirmed)}
                        <span className="ml-1">{getStatusText(invite.confirmed)}</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => window.open(`/invitation/${invite.id}`, '_blank')}
                        className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-2 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all duration-200 font-medium flex items-center justify-center text-sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </button>
                      <button
                        onClick={() => handleDeleteInvite(invite.id)}
                        className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-3 py-2 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-all duration-200 font-medium flex items-center justify-center text-sm"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <Users className="h-16 w-16 text-neutral-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-500 dark:text-slate-400 mb-2">Aucun invité</h3>
            <p className="text-neutral-400 dark:text-slate-500 mb-6">Commencez par ajouter votre premier invité</p>
            <button
              onClick={() => {
                if (canCreateInvite()) {
                  setShowInviteModal(true);
                } else {
                  setShowUpgradeModal(true);
                }
              }}
              className="bg-amber-500 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-all duration-300 font-semibold"
            >
              {t('invitations.create')}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('templates.title')}</h3>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Gérez vos modèles d'invitation personnalisés</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userModels.map((template, index) => {
          const IconComponent = getCategoryIcon(template.category);
          return (
            <div
              key={template.id}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxury border border-neutral-200/50 dark:border-slate-600/50 overflow-hidden hover:shadow-glow-amber transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={template.backgroundImage}
                  alt={template.name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute top-4 right-4">
                  <div className={`p-2 rounded-full bg-gradient-to-r ${getCategoryColor(template.category)} shadow-lg`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h4 className="text-white font-bold text-lg mb-1">{template.name}</h4>
                  <p className="text-white/80 text-sm">{template.category}</p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getCategoryColor(template.category)} text-white`}>
                    {template.category === 'wedding' && t('templates.wedding')}
                    {template.category === 'birthday' && t('templates.birthday')}
                    {template.category === 'graduation' && t('templates.graduation')}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCustomizingTemplate(template)}
                    className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-2 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-all duration-200 font-medium flex items-center justify-center text-sm"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {t('common.edit')}
                  </button>
                  <button className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-2 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all duration-200 font-medium flex items-center justify-center text-sm">
                    <Eye className="h-4 w-4 mr-1" />
                    {t('common.view')}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        
        {userModels.length === 0 && (
          <div className="col-span-full bg-white dark:bg-slate-800 rounded-2xl shadow-luxury border border-neutral-200/50 dark:border-slate-600/50 p-12 text-center">
            <Calendar className="h-16 w-16 text-neutral-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-500 dark:text-slate-400 mb-2">Aucun modèle</h3>
            <p className="text-neutral-400 dark:text-slate-500 mb-6">Vos modèles personnalisés apparaîtront ici</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTables = () => (
    <TableManagement 
      tables={tables}
      setTables={setTables}
      guests={userInvites}
    />
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">{t('dashboard.settings')}</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paramètres d'apparence */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxury border border-neutral-200/50 dark:border-slate-600/50 p-6">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Apparence</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mode sombre</label>
                <p className="text-xs text-slate-500 dark:text-slate-400">Basculer entre le mode clair et sombre</p>
              </div>
              <ThemeToggle />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Langue</label>
                <p className="text-xs text-slate-500 dark:text-slate-400">Choisir la langue de l'interface</p>
              </div>
              <LanguageToggle />
            </div>
          </div>
        </div>

        {/* Informations du compte */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxury border border-neutral-200/50 dark:border-slate-600/50 p-6">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Compte</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Plan actuel</label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {subscription?.plan === 'free' ? 'Plan Gratuit' : `Plan ${subscription?.plan}`}
                </p>
              </div>
              <div className="flex items-center">
                <Crown className="h-4 w-4 text-amber-500 mr-2" />
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  {subscription?.plan === 'free' ? 'Gratuit' : subscription?.plan}
                </span>
              </div>
            </div>
            
            {subscription?.plan === 'free' && (
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Invitations restantes</label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Sur votre plan gratuit</p>
                </div>
                <span className="text-sm font-medium text-rose-600 dark:text-rose-400">
                  {getRemainingInvites()}/5
                </span>
              </div>
            )}
            
            <button
              onClick={() => setShowProfile(true)}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold flex items-center justify-center"
            >
              <User className="h-4 w-4 mr-2" />
              Gérer le profil
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
                  {t('dashboard.title')}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t('dashboard.welcome')}, {userData?.firstName}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <LanguageToggle />
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold shadow-glow-amber">
                  {userData?.firstName[0]}{userData?.lastName[0]}
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all duration-200"
                  title={t('nav.logout')}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxury border border-neutral-200/50 dark:border-slate-600/50 overflow-hidden sticky top-24">
              <div className="p-4 bg-gradient-to-r from-neutral-50 to-amber-50/30 dark:from-slate-700 dark:to-slate-600/30 border-b border-neutral-200/50 dark:border-slate-600/50">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Navigation</h3>
              </div>
              <nav className="p-4">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300 mb-2 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-glow-amber'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-slate-700 hover:text-amber-700 dark:hover:text-amber-300'
                      }`}
                    >
                      <IconComponent className="h-5 w-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'invitations' && renderInvitations()}
            {activeTab === 'templates' && renderTemplates()}
            {activeTab === 'tables' && renderTables()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </div>
      </div>

      {/* Modal pour créer un invité */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxury max-w-md w-full animate-slide-up">
            <div className="p-6 border-b border-neutral-200/50 dark:border-slate-600/50">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {t('invitations.create')}
                </h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                >
                  <X className="h-5 w-5 text-neutral-500 dark:text-slate-400" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateInvite} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('invitations.name')}
                  </label>
                  <input
                    type="text"
                    value={inviteForm.nom}
                    onChange={(e) => setInviteForm({ ...inviteForm, nom: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    placeholder="Nom de l'invité"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('invitations.table')}
                  </label>
                  <input
                    type="text"
                    value={inviteForm.table}
                    onChange={(e) => setInviteForm({ ...inviteForm, table: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    placeholder="Numéro de table"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Type d'invitation
                  </label>
                  <select
                    value={inviteForm.etat}
                    onChange={(e) => setInviteForm({ ...inviteForm, etat: e.target.value as 'simple' | 'couple' })}
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="simple">Simple (1 personne)</option>
                    <option value="couple">Couple (2 personnes)</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-3 border border-neutral-300 dark:border-slate-600 text-neutral-700 dark:text-slate-300 rounded-xl hover:bg-neutral-50 dark:hover:bg-slate-700 transition-all duration-200 font-medium"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-glow-amber transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de mise à niveau */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={subscription?.plan || 'free'}
        remainingInvites={getRemainingInvites()}
      />
    </div>
  );
};

export default Dashboard;