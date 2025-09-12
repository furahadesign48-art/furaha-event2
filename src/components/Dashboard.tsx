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
  Crown, 
  Sparkles,
  Heart,
  Gift,
  GraduationCap,
  FileText,
  Download,
  Share2,
  QrCode,
  MessageCircle,
  TrendingUp,
  UserCheck,
  Clock,
  Table,
  Mail,
  Phone,
  MapPin,
  Filter,
  Search,
  SortAsc,
  MoreVertical,
  Copy,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useTemplates } from '../hooks/useTemplates';
import { useSubscription } from '../hooks/useSubscription';
import { UserData } from '../hooks/useAuth';
import { UserModel, Invite } from '../services/templateService';
import TemplateCustomization from './TemplateCustomization';
import TableManagement from './TableManagement';
import UserProfile from './UserProfile';
import DashboardSettings from './DashboardSettings';
import UpgradeModal from './UpgradeModal';
import { useLanguage } from '../contexts/LanguageContext';

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
  isPersonalized?: boolean;
  createdAt?: string;
  guestData?: {
    name: string;
    tableNumber: string;
  };
}

interface Table {
  id: number;
  name: string;
  seats: number;
  assignedGuests: any[];
}

interface DashboardProps {
  selectedTemplate?: TemplateData | null;
  userData: UserData;
  onLogout: () => void;
}

const Dashboard = ({ selectedTemplate, userData, onLogout }: DashboardProps) => {
  const { t } = useLanguage();
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
  const [showCustomization, setShowCustomization] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [customizingTemplate, setCustomizingTemplate] = useState<TemplateData | null>(null);
  const [tables, setTables] = useState<Table[]>([
    { id: 1, name: 'Table des Mariés', seats: 8, assignedGuests: [] },
    { id: 2, name: 'Table Famille', seats: 10, assignedGuests: [] },
    { id: 3, name: 'Table Amis', seats: 8, assignedGuests: [] }
  ]);

  // États pour la gestion des invités
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Invite | null>(null);
  const [guestFormData, setGuestFormData] = useState({
    nom: '',
    table: '',
    etat: 'simple' as 'simple' | 'couple'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Charger le template sélectionné au montage
  useEffect(() => {
    if (selectedTemplate) {
      setCustomizingTemplate(selectedTemplate);
      setShowCustomization(true);
    }
  }, [selectedTemplate]);

  // Rafraîchir les données périodiquement
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUserData();
    }, 30000); // Rafraîchir toutes les 30 secondes

    return () => clearInterval(interval);
  }, [refreshUserData]);

  const handleCustomizeTemplate = (template: UserModel) => {
    const templateData: TemplateData = {
      id: template.id,
      name: template.name,
      category: template.category,
      backgroundImage: template.backgroundImage,
      title: template.title,
      invitationText: template.invitationText,
      eventDate: template.eventDate,
      eventTime: template.eventTime,
      eventLocation: template.eventLocation,
      drinkOptions: template.drinkOptions,
      features: template.features,
      isPersonalized: true,
      createdAt: template.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
    };
    
    setCustomizingTemplate(templateData);
    setShowCustomization(true);
  };

  const handleSaveCustomization = (customizedTemplate: TemplateData) => {
    console.log('Template personnalisé sauvegardé:', customizedTemplate);
    setShowCustomization(false);
    setCustomizingTemplate(null);
    // Rafraîchir les données
    refreshUserData();
  };

  const handleAddGuest = async () => {
    if (!guestFormData.nom.trim()) {
      alert(t('required_field'));
      return;
    }

    // Vérifier la limite d'invitations
    if (!canCreateInvite()) {
      setShowUpgradeModal(true);
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
        alert(t('guest_confirmed'));
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'invité:', error);
      alert(t('error'));
    }
  };

  const handleEditGuest = (guest: Invite) => {
    setEditingGuest(guest);
    setGuestFormData({
      nom: guest.nom,
      table: guest.table || '',
      etat: guest.etat
    });
    setShowAddGuestModal(true);
  };

  const handleUpdateGuest = async () => {
    if (!editingGuest || !guestFormData.nom.trim()) {
      alert(t('required_field'));
      return;
    }

    try {
      const success = await updateInvite(editingGuest.id, {
        nom: guestFormData.nom,
        table: guestFormData.table || 'Non assigné',
        etat: guestFormData.etat
      });

      if (success) {
        setShowAddGuestModal(false);
        setEditingGuest(null);
        setGuestFormData({ nom: '', table: '', etat: 'simple' });
        alert(t('profile_updated'));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'invité:', error);
      alert(t('error'));
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet invité ?')) {
      try {
        const success = await deleteInvite(guestId);
        if (success) {
          alert('Invité supprimé avec succès');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'invité:', error);
        alert(t('error'));
      }
    }
  };

  const generateInvitationLink = (guestId: string) => {
    return `${window.location.origin}/invitation/${guestId}`;
  };

  const copyInvitationLink = (guestId: string) => {
    const link = generateInvitationLink(guestId);
    navigator.clipboard.writeText(link).then(() => {
      alert('Lien copié dans le presse-papiers !');
    });
  };

  const openInvitationPreview = (guestId: string) => {
    const link = generateInvitationLink(guestId);
    window.open(link, '_blank');
  };

  // Filtrer et trier les invités
  const filteredAndSortedGuests = userInvites
    .filter(guest => {
      const matchesSearch = guest.nom.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || 
        (filterStatus === 'confirmed' && guest.confirmed) ||
        (filterStatus === 'pending' && !guest.confirmed);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.nom.localeCompare(b.nom);
        case 'table':
          return (a.table || '').localeCompare(b.table || '');
        case 'status':
          return a.confirmed === b.confirmed ? 0 : a.confirmed ? -1 : 1;
        default:
          return 0;
      }
    });

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'wedding':
        return Heart;
      case 'birthday':
        return Gift;
      case 'graduation':
        return GraduationCap;
      default:
        return FileText;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'wedding':
        return t('wedding_invitations');
      case 'birthday':
        return t('birthday_invitations');
      case 'graduation':
        return t('graduation_invitations');
      default:
        return category;
    }
  };

  const getStatusColor = (confirmed: boolean) => {
    return confirmed 
      ? 'bg-emerald-100 text-emerald-800' 
      : 'bg-amber-100 text-amber-800';
  };

  const getStatusText = (confirmed: boolean) => {
    return confirmed ? t('confirmed') : t('pending');
  };

  // Statistiques
  const totalInvites = userInvites.length;
  const confirmedInvites = userInvites.filter(invite => invite.confirmed).length;
  const pendingInvites = totalInvites - confirmedInvites;
  const totalTemplates = userModels.length;

  if (showCustomization && customizingTemplate) {
    return (
      <TemplateCustomization
        template={customizingTemplate}
        onBack={() => {
          setShowCustomization(false);
          setCustomizingTemplate(null);
        }}
        onSave={handleSaveCustomization}
      />
    );
  }

  const renderOverview = () => (
    <div className="space-y-8 animate-fade-in">
      {/* En-tête de bienvenue */}
      <div className="bg-gradient-to-r from-amber-50 via-amber-100/50 to-rose-50 rounded-3xl p-8 border border-amber-200/50 shadow-luxury relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-rose-200/20 rounded-full blur-2xl"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                {t('dashboard_welcome')}, {userData.firstName} !
              </h1>
              <p className="text-slate-600 text-lg">
                {t('dashboard_subtitle')}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Crown className="h-8 w-8 text-amber-500 animate-glow" />
              <div className="text-right">
                <p className="text-sm font-medium text-amber-700">
                  {subscription?.plan === 'free' ? t('free_plan') : subscription?.plan}
                </p>
                {subscription?.plan === 'free' && (
                  <p className="text-xs text-amber-600">
                    {getRemainingInvites()}/5 {t('remaining_invites')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200/50 shadow-lg hover:shadow-glow-amber transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-700 text-sm font-medium">{t('my_templates')}</p>
              <p className="text-3xl font-bold text-amber-900">{totalTemplates}</p>
            </div>
            <div className="p-3 bg-amber-500 rounded-xl shadow-glow-amber">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200/50 shadow-lg hover:shadow-glow-purple transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-700 text-sm font-medium">{t('total_invitations')}</p>
              <p className="text-3xl font-bold text-purple-900">{totalInvites}</p>
            </div>
            <div className="p-3 bg-purple-500 rounded-xl shadow-glow-purple">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-700 text-sm font-medium">{t('confirmed_guests')}</p>
              <p className="text-3xl font-bold text-emerald-900">{confirmedInvites}</p>
            </div>
            <div className="p-3 bg-emerald-500 rounded-xl">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl p-6 border border-rose-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-700 text-sm font-medium">{t('pending_responses')}</p>
              <p className="text-3xl font-bold text-rose-900">{pendingInvites}</p>
            </div>
            <div className="p-3 bg-rose-500 rounded-xl">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 p-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-6">
          {t('quick_actions')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowAddGuestModal(true)}
            className="flex items-center justify-center p-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-glow-amber transform hover:scale-105"
          >
            <Plus className="h-5 w-5 mr-2" />
            {t('add')} {t('guests').toLowerCase()}
          </button>
          
          <button
            onClick={() => setActiveTab('tables')}
            className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-glow-purple transform hover:scale-105"
          >
            <Table className="h-5 w-5 mr-2" />
            {t('manage_guests')}
          </button>
          
          <button
            onClick={() => setActiveTab('analytics')}
            className="flex items-center justify-center p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-glow transform hover:scale-105"
          >
            <BarChart3 className="h-5 w-5 mr-2" />
            {t('view_analytics')}
          </button>
        </div>
      </div>

      {/* Activité récente */}
      <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 p-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-6">
          {t('recent_activity')}
        </h2>
        <div className="space-y-4">
          {userInvites.slice(0, 5).map((invite, index) => (
            <div key={invite.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-amber-50/30 rounded-xl border border-neutral-200/50 hover:shadow-md transition-all duration-200">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg ${
                  invite.confirmed 
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' 
                    : 'bg-gradient-to-r from-amber-500 to-amber-600'
                }`}>
                  {invite.nom.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div className="ml-3">
                  <p className="font-medium text-slate-900">{invite.nom}</p>
                  <p className="text-sm text-slate-600">
                    {invite.confirmed ? t('guest_confirmed') : t('invitation_sent')}
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invite.confirmed)}`}>
                {getStatusText(invite.confirmed)}
              </span>
            </div>
          ))}
          
          {userInvites.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-500 mb-2">{t('no_invitations')}</h3>
              <p className="text-neutral-400 mb-6">{t('create_first_invitation')}</p>
              <button
                onClick={() => setShowAddGuestModal(true)}
                className="bg-amber-500 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-all duration-300 font-semibold"
              >
                {t('create_invitation')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            {t('my_templates')}
          </h2>
          <p className="text-slate-600 mt-1">{t('event_management')}</p>
        </div>
      </div>

      {userModels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userModels.map((template, index) => {
            const IconComponent = getIconForCategory(template.category);
            return (
              <div
                key={template.id}
                className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 overflow-hidden hover:shadow-glow-amber transition-all duration-500 transform hover:scale-105 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={template.backgroundImage}
                    alt={template.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                      <IconComponent className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-lg mb-1 drop-shadow-lg">
                      {template.title}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {getCategoryName(template.category)}
                    </p>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-slate-600 text-sm">{template.eventDate}</p>
                      <p className="text-slate-500 text-xs">{template.eventLocation}</p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      {t('template_customized')}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCustomizeTemplate(template)}
                      className="flex-1 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-all duration-300 font-medium flex items-center justify-center"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {t('edit')}
                    </button>
                    
                    <button className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-all duration-300 font-medium flex items-center justify-center">
                      <Eye className="h-4 w-4 mr-2" />
                      {t('view')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <FileText className="h-24 w-24 text-neutral-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-neutral-500 mb-4">{t('no_templates')}</h3>
          <p className="text-neutral-400 mb-8 max-w-md mx-auto">
            {t('create_first_template')}
          </p>
          <button className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-4 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-glow-amber transform hover:scale-105">
            <Plus className="h-5 w-5 mr-2 inline" />
            {t('create')} {t('templates').toLowerCase()}
          </button>
        </div>
      )}
    </div>
  );

  const renderGuests = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            {t('guest_management')}
          </h2>
          <p className="text-slate-600 mt-1">{totalInvites} {t('guests').toLowerCase()}</p>
        </div>
        
        <button
          onClick={() => setShowAddGuestModal(true)}
          className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold flex items-center shadow-glow-amber transform hover:scale-105"
        >
          <Plus className="h-5 w-5 mr-2" />
          {t('add')} {t('guests').toLowerCase()}
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
          >
            <option value="all">{t('filter')} - Tous</option>
            <option value="confirmed">{t('confirmed')}</option>
            <option value="pending">{t('pending')}</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
          >
            <option value="name">{t('sort')} - {t('guest_name')}</option>
            <option value="table">{t('table_number')}</option>
            <option value="status">{t('confirmation_status')}</option>
          </select>
          
          <div className="flex items-center text-sm text-slate-600">
            <Filter className="h-4 w-4 mr-2" />
            {filteredAndSortedGuests.length} résultat(s)
          </div>
        </div>
      </div>

      {/* Liste des invités */}
      {filteredAndSortedGuests.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 overflow-hidden">
          {/* En-tête du tableau - Desktop */}
          <div className="hidden md:grid md:grid-cols-6 gap-4 p-6 bg-gradient-to-r from-neutral-50 to-amber-50/30 border-b border-neutral-200/50">
            <div className="font-semibold text-slate-700">{t('guest_name')}</div>
            <div className="font-semibold text-slate-700">{t('table_number')}</div>
            <div className="font-semibold text-slate-700">{t('guest_type')}</div>
            <div className="font-semibold text-slate-700">{t('confirmation_status')}</div>
            <div className="font-semibold text-slate-700">{t('invitation_preview')}</div>
            <div className="font-semibold text-slate-700 text-right">Actions</div>
          </div>

          {/* Corps du tableau */}
          <div className="divide-y divide-neutral-200/50">
            {filteredAndSortedGuests.map((guest, index) => (
              <div
                key={guest.id}
                className="animate-slide-up hover:bg-gradient-to-r hover:from-neutral-50/50 hover:to-amber-50/30 transition-all duration-300"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Version Desktop */}
                <div className="hidden md:grid md:grid-cols-6 gap-4 p-6 items-center">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg mr-3 ${
                      guest.etat === 'couple' 
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500' 
                        : 'bg-gradient-to-r from-amber-500 to-orange-500'
                    }`}>
                      {guest.nom.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{guest.nom}</p>
                      <p className="text-sm text-slate-500">ID: {guest.id.substring(0, 8)}...</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                      <Table className="h-4 w-4 mr-1" />
                      {guest.table || 'Non assigné'}
                    </span>
                  </div>
                  
                  <div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      guest.etat === 'couple' 
                        ? 'bg-pink-100 text-pink-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {guest.etat === 'couple' ? t('couple') : t('single')}
                    </span>
                  </div>
                  
                  <div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(guest.confirmed)}`}>
                      {guest.confirmed ? (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      ) : (
                        <Clock className="h-4 w-4 mr-1" />
                      )}
                      {getStatusText(guest.confirmed)}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openInvitationPreview(guest.id)}
                      className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                      title={t('invitation_preview')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => copyInvitationLink(guest.id)}
                      className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                      title="Copier le lien"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEditGuest(guest)}
                      className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                      title={t('edit')}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGuest(guest.id)}
                      className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                      title={t('delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Version Mobile */}
                <div className="md:hidden p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-lg mr-3 ${
                        guest.etat === 'couple' 
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500' 
                          : 'bg-gradient-to-r from-amber-500 to-orange-500'
                      }`}>
                        {guest.nom.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">{guest.nom}</h3>
                        <p className="text-sm text-slate-500">{guest.table || 'Non assigné'}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(guest.confirmed)}`}>
                      {getStatusText(guest.confirmed)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      guest.etat === 'couple' 
                        ? 'bg-pink-100 text-pink-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {guest.etat === 'couple' ? t('couple') : t('single')}
                    </span>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openInvitationPreview(guest.id)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => copyInvitationLink(guest.id)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditGuest(guest)}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGuest(guest.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 p-12 text-center">
          <Users className="h-24 w-24 text-neutral-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-neutral-500 mb-4">{t('no_invitations')}</h3>
          <p className="text-neutral-400 mb-8 max-w-md mx-auto">
            {searchTerm || filterStatus !== 'all' 
              ? 'Aucun invité ne correspond à vos critères de recherche.'
              : t('create_first_invitation')
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button
              onClick={() => setShowAddGuestModal(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-4 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-glow-amber transform hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2 inline" />
              {t('add')} {t('guests').toLowerCase()}
            </button>
          )}
        </div>
      )}
    </div>
  );

  const renderTables = () => (
    <div className="animate-fade-in">
      <TableManagement 
        tables={tables} 
        setTables={setTables}
        guests={userInvites}
      />
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          {t('statistics')}
        </h2>
        <p className="text-slate-600 mt-1">{t('event_analytics')}</p>
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200/50 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-500 rounded-xl shadow-glow-amber">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-amber-600 text-sm font-medium">+12%</span>
          </div>
          <div>
            <p className="text-amber-700 text-sm font-medium">{t('total_invitations')}</p>
            <p className="text-3xl font-bold text-amber-900">{totalInvites}</p>
            <p className="text-amber-600 text-xs mt-1">Ce mois-ci</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200/50 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500 rounded-xl">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
            <span className="text-emerald-600 text-sm font-medium">
              {totalInvites > 0 ? Math.round((confirmedInvites / totalInvites) * 100) : 0}%
            </span>
          </div>
          <div>
            <p className="text-emerald-700 text-sm font-medium">Taux de confirmation</p>
            <p className="text-3xl font-bold text-emerald-900">{confirmedInvites}/{totalInvites}</p>
            <p className="text-emerald-600 text-xs mt-1">{t('confirmed_guests')}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200/50 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500 rounded-xl shadow-glow-purple">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <span className="text-purple-600 text-sm font-medium">
              {totalInvites > 0 ? Math.round((pendingInvites / totalInvites) * 100) : 0}%
            </span>
          </div>
          <div>
            <p className="text-purple-700 text-sm font-medium">{t('pending_responses')}</p>
            <p className="text-3xl font-bold text-purple-900">{pendingInvites}</p>
            <p className="text-purple-600 text-xs mt-1">En attente</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl p-6 border border-rose-200/50 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-rose-500 rounded-xl">
              <Table className="h-6 w-6 text-white" />
            </div>
            <span className="text-rose-600 text-sm font-medium">{tables.length}</span>
          </div>
          <div>
            <p className="text-rose-700 text-sm font-medium">{t('total_tables')}</p>
            <p className="text-3xl font-bold text-rose-900">{tables.reduce((sum, table) => sum + table.seats, 0)}</p>
            <p className="text-rose-600 text-xs mt-1">Places totales</p>
          </div>
        </div>
      </div>

      {/* Graphiques et analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Répartition des confirmations</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-emerald-500 rounded-full mr-3"></div>
                <span className="text-slate-700">{t('confirmed')}</span>
              </div>
              <div className="flex items-center">
                <span className="text-slate-900 font-semibold mr-2">{confirmedInvites}</span>
                <span className="text-slate-500 text-sm">
                  ({totalInvites > 0 ? Math.round((confirmedInvites / totalInvites) * 100) : 0}%)
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-amber-500 rounded-full mr-3"></div>
                <span className="text-slate-700">{t('pending')}</span>
              </div>
              <div className="flex items-center">
                <span className="text-slate-900 font-semibold mr-2">{pendingInvites}</span>
                <span className="text-slate-500 text-sm">
                  ({totalInvites > 0 ? Math.round((pendingInvites / totalInvites) * 100) : 0}%)
                </span>
              </div>
            </div>
            
            {/* Barre de progression */}
            <div className="mt-4">
              <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
                  style={{ width: `${totalInvites > 0 ? (confirmedInvites / totalInvites) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-center text-sm text-slate-600 mt-2">
                Taux de confirmation: {totalInvites > 0 ? Math.round((confirmedInvites / totalInvites) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Répartition par type</h3>
          <div className="space-y-4">
            {(() => {
              const singleGuests = userInvites.filter(guest => guest.etat === 'simple').length;
              const coupleGuests = userInvites.filter(guest => guest.etat === 'couple').length;
              
              return (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-slate-700">{t('single')}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-slate-900 font-semibold mr-2">{singleGuests}</span>
                      <span className="text-slate-500 text-sm">
                        ({totalInvites > 0 ? Math.round((singleGuests / totalInvites) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-pink-500 rounded-full mr-3"></div>
                      <span className="text-slate-700">{t('couple')}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-slate-900 font-semibold mr-2">{coupleGuests}</span>
                      <span className="text-slate-500 text-sm">
                        ({totalInvites > 0 ? Math.round((coupleGuests / totalInvites) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                  
                  {/* Barre de progression */}
                  <div className="mt-4">
                    <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden flex">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                        style={{ width: `${totalInvites > 0 ? (singleGuests / totalInvites) * 100 : 0}%` }}
                      ></div>
                      <div 
                        className="h-full bg-gradient-to-r from-pink-500 to-pink-600 transition-all duration-500"
                        style={{ width: `${totalInvites > 0 ? (coupleGuests / totalInvites) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <p className="text-center text-sm text-slate-600 mt-2">
                      Places occupées: {singleGuests + (coupleGuests * 2)} places
                    </p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="animate-fade-in">
      <UserProfile userData={userData} onLogout={onLogout} />
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'templates':
        return renderTemplates();
      case 'guests':
        return renderGuests();
      case 'tables':
        return renderTables();
      case 'analytics':
        return renderAnalytics();
      case 'profile':
        return renderProfile();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-amber-50/30 to-purple-50/20 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-r from-amber-200/10 to-purple-200/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-r from-rose-200/10 to-amber-200/10 rounded-full blur-3xl animate-bounce-slow"></div>
      </div>

      <div className="relative z-10 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white/80 backdrop-blur-xl shadow-luxury border-r border-neutral-200/50 min-h-screen sticky top-0">
          <div className="p-6">
            {/* Logo */}
            <div className="flex items-center space-x-2 mb-8">
              <div className="relative">
                <Crown className="h-8 w-8 text-amber-500 animate-glow drop-shadow-lg" />
                <div className="absolute inset-0 animate-pulse">
                  <Crown className="h-8 w-8 text-amber-300 opacity-30" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 via-amber-700 to-slate-900 bg-clip-text text-transparent">
                Furaha-Event
              </span>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {[
                { id: 'overview', label: t('dashboard'), icon: BarChart3 },
                { id: 'templates', label: t('my_templates'), icon: FileText },
                { id: 'guests', label: t('guests'), icon: Users },
                { id: 'tables', label: t('tables'), icon: Table },
                { id: 'analytics', label: t('analytics'), icon: TrendingUp },
                { id: 'profile', label: t('profile'), icon: Users }
              ].map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300 text-left ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-glow-amber transform scale-105'
                        : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700 hover:transform hover:scale-102'
                    }`}
                  >
                    <IconComponent className="h-5 w-5 mr-3" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Plan d'abonnement */}
            {subscription && (
              <div className="mt-8 p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl border border-amber-200/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Crown className="h-4 w-4 text-amber-600 mr-2" />
                    <span className="text-sm font-semibold text-amber-800">
                      {subscription.plan === 'free' ? t('free_plan') : subscription.plan}
                    </span>
                  </div>
                  {subscription.plan === 'free' && (
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="text-xs bg-amber-600 text-white px-2 py-1 rounded-full hover:bg-amber-700 transition-all duration-300"
                    >
                      {t('upgrade_plan')}
                    </button>
                  )}
                </div>
                
                {subscription.plan === 'free' && (
                  <div>
                    <div className="flex justify-between text-xs text-amber-700 mb-2">
                      <span>{t('remaining_invites')}</span>
                      <span>{getRemainingInvites()}/5</span>
                    </div>
                    <div className="w-full bg-amber-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((5 - getRemainingInvites()) / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Paramètres */}
            <div className="mt-8 pt-6 border-t border-neutral-200/50">
              <button
                onClick={() => setShowSettings(true)}
                className="w-full flex items-center px-4 py-3 text-slate-600 hover:bg-neutral-50 hover:text-slate-700 rounded-xl transition-all duration-300"
              >
                <Settings className="h-5 w-5 mr-3" />
                {t('settings')}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>

      {/* Modal d'ajout/modification d'invité */}
      {showAddGuestModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-luxury max-w-md w-full animate-slide-up">
            <div className="p-6 border-b border-neutral-200/50">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">
                  {editingGuest ? t('edit') + ' ' + t('guests').toLowerCase() : t('add') + ' ' + t('guests').toLowerCase()}
                </h3>
                <button
                  onClick={() => {
                    setShowAddGuestModal(false);
                    setEditingGuest(null);
                    setGuestFormData({ nom: '', table: '', etat: 'simple' });
                  }}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
                >
                  <X className="h-5 w-5 text-neutral-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('guest_name')}
                  </label>
                  <input
                    type="text"
                    value={guestFormData.nom}
                    onChange={(e) => setGuestFormData({ ...guestFormData, nom: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    placeholder="Nom complet de l'invité"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('table_number')}
                  </label>
                  <select
                    value={guestFormData.table}
                    onChange={(e) => setGuestFormData({ ...guestFormData, table: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                  >
                    <option value="">Sélectionner une table</option>
                    {tables.map((table) => (
                      <option key={table.id} value={table.name}>
                        {table.name} ({table.seats} places)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('guest_type')}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setGuestFormData({ ...guestFormData, etat: 'simple' })}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                        guestFormData.etat === 'simple'
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-neutral-300 hover:border-amber-300'
                      }`}
                    >
                      <Users className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">{t('single')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuestFormData({ ...guestFormData, etat: 'couple' })}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                        guestFormData.etat === 'couple'
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-neutral-300 hover:border-pink-300'
                      }`}
                    >
                      <Heart className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">{t('couple')}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddGuestModal(false);
                    setEditingGuest(null);
                    setGuestFormData({ nom: '', table: '', etat: 'simple' });
                  }}
                  className="flex-1 px-4 py-3 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-all duration-200 font-medium"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={editingGuest ? handleUpdateGuest : handleAddGuest}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-glow-amber transform hover:scale-105"
                >
                  {editingGuest ? t('save') : t('add')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de paramètres */}
      <DashboardSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

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