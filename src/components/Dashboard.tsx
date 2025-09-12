import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Upload,
  Crown,
  Sparkles,
  Heart,
  Gift,
  GraduationCap,
  User,
  Mail,
  Phone,
  MapPin,
  Wine,
  MessageCircle,
  Check,
  X,
  Clock,
  AlertCircle,
  TrendingUp,
  FileText,
  Share2,
  Filter,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Star,
  Award,
  Target,
  Zap
} from 'lucide-react';
import UserProfile from './UserProfile';
import TableManagement from './TableManagement';
import TemplateCustomization from './TemplateCustomization';
import DashboardSettings from './DashboardSettings';
import UpgradeModal from './UpgradeModal';
import { useTemplates } from '../hooks/useTemplates';
import { useSubscription } from '../hooks/useSubscription';
import { useLanguage } from '../contexts/LanguageContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

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

interface Table {
  id: number;
  name: string;
  seats: number;
  assignedGuests: any[];
}

interface DashboardProps {
  selectedTemplate?: TemplateData | null;
  userData: UserData | null;
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
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [tables, setTables] = useState<Table[]>([
    { id: 1, name: 'Table des Mariés', seats: 8, assignedGuests: [] },
    { id: 2, name: 'Table Famille', seats: 10, assignedGuests: [] },
    { id: 3, name: 'Table Amis', seats: 8, assignedGuests: [] }
  ]);

  // États pour la gestion des invités
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingInvite, setEditingInvite] = useState<any>(null);
  const [inviteFormData, setInviteFormData] = useState({
    nom: '',
    table: '',
    etat: 'simple' as 'simple' | 'couple'
  });

  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTable, setFilterTable] = useState('all');

  useEffect(() => {
    if (selectedTemplate) {
      setSelectedModel(selectedTemplate);
      setShowCustomization(true);
    }
  }, [selectedTemplate]);

  // Filtrer les invités selon les critères
  const filteredInvites = userInvites.filter(invite => {
    const matchesSearch = invite.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'confirmed' && invite.confirmed) ||
      (filterStatus === 'pending' && !invite.confirmed);
    const matchesTable = filterTable === 'all' || invite.table === filterTable;
    
    return matchesSearch && matchesStatus && matchesTable;
  });

  // Statistiques
  const totalInvites = userInvites.length;
  const confirmedInvites = userInvites.filter(invite => invite.confirmed).length;
  const pendingInvites = totalInvites - confirmedInvites;
  const totalTables = tables.length;

  const handleCreateInvite = async () => {
    if (!canCreateInvite()) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      const inviteId = await createInvite({
        nom: inviteFormData.nom,
        table: inviteFormData.table,
        etat: inviteFormData.etat,
        confirmed: false
      });

      if (inviteId) {
        setShowInviteModal(false);
        setInviteFormData({ nom: '', table: '', etat: 'simple' });
        await refreshUserData();
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'invité:', error);
    }
  };

  const handleEditInvite = async () => {
    if (!editingInvite) return;

    try {
      await updateInvite(editingInvite.id, {
        nom: inviteFormData.nom,
        table: inviteFormData.table,
        etat: inviteFormData.etat
      });

      setEditingInvite(null);
      setShowInviteModal(false);
      setInviteFormData({ nom: '', table: '', etat: 'simple' });
      await refreshUserData();
    } catch (error) {
      console.error('Erreur lors de la modification de l\'invité:', error);
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    if (window.confirm(t('confirm_delete') || 'Êtes-vous sûr de vouloir supprimer cet invité ?')) {
      try {
        await deleteInvite(inviteId);
        await refreshUserData();
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'invité:', error);
      }
    }
  };

  const openInviteModal = (invite?: any) => {
    if (invite) {
      setEditingInvite(invite);
      setInviteFormData({
        nom: invite.nom,
        table: invite.table || '',
        etat: invite.etat
      });
    } else {
      setEditingInvite(null);
      setInviteFormData({ nom: '', table: '', etat: 'simple' });
    }
    setShowInviteModal(true);
  };

  const exportToExcel = () => {
    const data = userInvites.map(invite => ({
      [t('guest_name') || 'Nom']: invite.nom,
      [t('table_number') || 'Table']: invite.table || 'Non assigné',
      [t('guest_type') || 'Type']: invite.etat === 'couple' ? t('couple') || 'Couple' : t('single') || 'Simple',
      [t('confirmation_status') || 'Statut']: invite.confirmed ? t('confirmed') || 'Confirmé' : t('pending') || 'En attente'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t('guests') || 'Invités');
    XLSX.writeFile(wb, `invites_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(t('guest_list') || 'Liste des Invités', 20, 20);
    
    let yPosition = 40;
    userInvites.forEach((invite, index) => {
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${invite.nom}`, 20, yPosition);
      doc.text(`${t('table') || 'Table'}: ${invite.table || 'Non assigné'}`, 40, yPosition + 10);
      doc.text(`${t('status') || 'Statut'}: ${invite.confirmed ? t('confirmed') || 'Confirmé' : t('pending') || 'En attente'}`, 40, yPosition + 20);
      yPosition += 35;
      
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
    });
    
    doc.save(`invites_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const getUniqueTableNames = () => {
    const tableNames = new Set(userInvites.map(invite => invite.table).filter(Boolean));
    return Array.from(tableNames);
  };

  if (showProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-amber-50/30 to-purple-50/20">
        <div className="max-w-4xl mx-auto p-6">
          <UserProfile 
            userData={userData!} 
            onLogout={() => {
              setShowProfile(false);
              onLogout();
            }} 
          />
          <div className="mt-6">
            <button
              onClick={() => setShowProfile(false)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-glow-amber transform hover:scale-105"
            >
              {t('back_to_dashboard') || 'Retour au Dashboard'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showCustomization && selectedModel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-amber-50/30 to-purple-50/20 p-6">
        <div className="max-w-7xl mx-auto">
          <TemplateCustomization
            template={selectedModel}
            onBack={() => {
              setShowCustomization(false);
              setSelectedModel(null);
            }}
            onSave={(customizedTemplate) => {
              console.log('Template sauvegardé:', customizedTemplate);
              setShowCustomization(false);
              setSelectedModel(null);
            }}
          />
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200/50 shadow-lg hover:shadow-glow-amber transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 bg-amber-500 rounded-xl shadow-glow-amber">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-amber-700 text-sm font-medium">{t('total_invitations') || 'Total Invitations'}</p>
              <p className="text-2xl font-bold text-amber-900">{totalInvites}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 bg-emerald-500 rounded-xl">
              <Check className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-emerald-700 text-sm font-medium">{t('confirmed_guests') || 'Invités Confirmés'}</p>
              <p className="text-2xl font-bold text-emerald-900">{confirmedInvites}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 bg-orange-500 rounded-xl">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-orange-700 text-sm font-medium">{t('pending_responses') || 'Réponses en Attente'}</p>
              <p className="text-2xl font-bold text-orange-900">{pendingInvites}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 bg-purple-500 rounded-xl">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-purple-700 text-sm font-medium">{t('total_tables') || 'Total Tables'}</p>
              <p className="text-2xl font-bold text-purple-900">{totalTables}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 p-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-6">
          {t('quick_actions') || 'Actions Rapides'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => openInviteModal()}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-glow-amber transform hover:scale-105"
          >
            <Plus className="h-5 w-5 mr-2" />
            {t('create_invitation') || 'Créer une Invitation'}
          </button>
          
          <button
            onClick={() => setActiveTab('guests')}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-lg transform hover:scale-105"
          >
            <Users className="h-5 w-5 mr-2" />
            {t('manage_guests') || 'Gérer les Invités'}
          </button>
          
          <button
            onClick={() => setActiveTab('analytics')}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-lg transform hover:scale-105"
          >
            <BarChart3 className="h-5 w-5 mr-2" />
            {t('view_analytics') || 'Voir Statistiques'}
          </button>
        </div>
      </div>

      {/* Modèles récents */}
      {userModels.length > 0 && (
        <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 p-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-6">
            {t('recent_templates') || 'Modèles Récents'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userModels.slice(0, 3).map((model) => {
              const IconComponent = model.category === 'wedding' ? Heart : 
                                   model.category === 'birthday' ? Gift : GraduationCap;
              return (
                <div key={model.id} className="border border-neutral-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center mb-3">
                    <IconComponent className="h-5 w-5 text-amber-500 mr-2" />
                    <h4 className="font-semibold text-slate-900 truncate">{model.name}</h4>
                  </div>
                  <p className="text-slate-600 text-sm mb-3 line-clamp-2">{model.title}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedModel(model);
                        setShowCustomization(true);
                      }}
                      className="flex-1 bg-amber-100 text-amber-700 px-3 py-2 rounded-lg hover:bg-amber-200 transition-all duration-300 font-medium text-sm"
                    >
                      <Edit className="h-4 w-4 inline mr-1" />
                      {t('edit') || 'Modifier'}
                    </button>
                    <button className="flex-1 bg-purple-100 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-200 transition-all duration-300 font-medium text-sm">
                      <Eye className="h-4 w-4 inline mr-1" />
                      {t('view') || 'Voir'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Invités récents */}
      {userInvites.length > 0 && (
        <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 p-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-6">
            {t('recent_guests') || 'Invités Récents'}
          </h3>
          <div className="space-y-3">
            {userInvites.slice(0, 5).map((invite) => (
              <div key={invite.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-amber-50/30 rounded-xl border border-neutral-200/50">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                    invite.etat === 'couple' ? 'bg-gradient-to-r from-pink-500 to-purple-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'
                  }`}>
                    {invite.nom.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-slate-900">{invite.nom}</p>
                    <p className="text-sm text-slate-600">
                      {t('table') || 'Table'}: {invite.table || t('not_assigned') || 'Non assigné'} • 
                      {invite.etat === 'couple' ? ` ${t('couple') || 'Couple'}` : ` ${t('single') || 'Simple'}`}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  invite.confirmed 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {invite.confirmed ? t('confirmed') || 'Confirmé' : t('pending') || 'En attente'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderGuests = () => (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête avec actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            {t('guest_management') || 'Gestion des Invités'}
          </h3>
          <p className="text-slate-600 mt-1">
            {t('manage_guest_list') || 'Gérez votre liste d\'invités et leurs confirmations'}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={exportToExcel}
            className="bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition-all duration-300 font-semibold flex items-center shadow-lg transform hover:scale-105"
          >
            <Download className="h-4 w-4 mr-2" />
            Excel
          </button>
          
          <button
            onClick={exportToPDF}
            className="bg-rose-500 text-white px-4 py-2 rounded-xl hover:bg-rose-600 transition-all duration-300 font-semibold flex items-center shadow-lg transform hover:scale-105"
          >
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </button>
          
          <button
            onClick={() => openInviteModal()}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold flex items-center shadow-glow-amber transform hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('add_guest') || 'Ajouter Invité'}
          </button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('search') || 'Rechercher'}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('search_guests') || 'Rechercher des invités...'}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('status') || 'Statut'}
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
            >
              <option value="all">{t('all') || 'Tous'}</option>
              <option value="confirmed">{t('confirmed') || 'Confirmés'}</option>
              <option value="pending">{t('pending') || 'En attente'}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('table') || 'Table'}
            </label>
            <select
              value={filterTable}
              onChange={(e) => setFilterTable(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
            >
              <option value="all">{t('all_tables') || 'Toutes les tables'}</option>
              {getUniqueTableNames().map(tableName => (
                <option key={tableName} value={tableName}>{tableName}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterTable('all');
              }}
              className="w-full bg-neutral-100 text-neutral-700 px-4 py-2 rounded-xl hover:bg-neutral-200 transition-all duration-300 font-medium flex items-center justify-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('reset') || 'Réinitialiser'}
            </button>
          </div>
        </div>
      </div>

      {/* Liste des invités */}
      <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 overflow-hidden">
        {/* En-tête du tableau - Desktop */}
        <div className="hidden md:grid md:grid-cols-5 gap-4 p-6 bg-gradient-to-r from-neutral-50 to-amber-50/30 border-b border-neutral-200/50">
          <div className="font-semibold text-slate-700">{t('guest_name') || 'Nom de l\'invité'}</div>
          <div className="font-semibold text-slate-700">{t('table_number') || 'Numéro de table'}</div>
          <div className="font-semibold text-slate-700">{t('guest_type') || 'Type d\'invité'}</div>
          <div className="font-semibold text-slate-700">{t('confirmation_status') || 'Statut de confirmation'}</div>
          <div className="font-semibold text-slate-700 text-right">{t('actions') || 'Actions'}</div>
        </div>

        {/* Corps du tableau */}
        <div className="divide-y divide-neutral-200/50">
          {filteredInvites.map((invite, index) => (
            <div
              key={invite.id}
              className="animate-slide-up hover:bg-gradient-to-r hover:from-neutral-50/50 hover:to-amber-50/30 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Version Desktop */}
              <div className="hidden md:grid md:grid-cols-5 gap-4 p-6 items-center">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3 ${
                    invite.etat === 'couple' 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500' 
                      : 'bg-gradient-to-r from-amber-500 to-orange-500'
                  }`}>
                    {invite.nom.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{invite.nom}</p>
                    <p className="text-sm text-slate-600">
                      {invite.etat === 'couple' ? t('couple') || 'Couple' : t('single') || 'Simple'}
                    </p>
                  </div>
                </div>
                <div className="text-slate-600">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                    <MapPin className="h-4 w-4 mr-1" />
                    {invite.table || t('not_assigned') || 'Non assigné'}
                  </span>
                </div>
                <div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    invite.etat === 'couple' 
                      ? 'bg-pink-100 text-pink-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {invite.etat === 'couple' ? t('couple') || 'Couple' : t('single') || 'Simple'}
                  </span>
                </div>
                <div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    invite.confirmed 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {invite.confirmed ? t('confirmed') || 'Confirmé' : t('pending') || 'En attente'}
                  </span>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => openInviteModal(invite)}
                    className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                    title={t('edit') || 'Modifier'}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteInvite(invite.id)}
                    className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                    title={t('delete') || 'Supprimer'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Version Mobile */}
              <div className="md:hidden p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3 ${
                      invite.etat === 'couple' 
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500' 
                        : 'bg-gradient-to-r from-amber-500 to-orange-500'
                    }`}>
                      {invite.nom.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{invite.nom}</p>
                      <p className="text-sm text-slate-600">
                        {t('table') || 'Table'}: {invite.table || t('not_assigned') || 'Non assigné'}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    invite.confirmed 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {invite.confirmed ? t('confirmed') || 'Confirmé' : t('pending') || 'En attente'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => openInviteModal(invite)}
                    className="bg-amber-100 text-amber-700 px-3 py-2 rounded-lg hover:bg-amber-200 transition-all duration-200 font-medium flex items-center justify-center text-sm"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {t('edit') || 'Modifier'}
                  </button>
                  <button
                    onClick={() => handleDeleteInvite(invite.id)}
                    className="bg-rose-100 text-rose-700 px-3 py-2 rounded-lg hover:bg-rose-200 transition-all duration-200 font-medium flex items-center justify-center text-sm"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {t('delete') || 'Supprimer'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredInvites.length === 0 && (
          <div className="p-12 text-center">
            <Users className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-500 mb-2">
              {searchTerm || filterStatus !== 'all' || filterTable !== 'all' 
                ? t('no_guests_found') || 'Aucun invité trouvé'
                : t('no_guests_yet') || 'Aucun invité pour le moment'
              }
            </h3>
            <p className="text-neutral-400 mb-6">
              {searchTerm || filterStatus !== 'all' || filterTable !== 'all'
                ? t('try_different_filters') || 'Essayez des filtres différents'
                : t('start_adding_guests') || 'Commencez par ajouter vos premiers invités'
              }
            </p>
            {(!searchTerm && filterStatus === 'all' && filterTable === 'all') && (
              <button
                onClick={() => openInviteModal()}
                className="bg-amber-500 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-all duration-300 font-semibold"
              >
                {t('add_first_guest') || 'Ajouter le premier invité'}
              </button>
            )}
          </div>
        )}
      </div>
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
        <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
          {t('analytics') || 'Statistiques'}
        </h3>
        <p className="text-slate-600">
          {t('analytics_description') || 'Analysez les données de vos invitations et événements'}
        </p>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200/50 shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500 rounded-xl">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-blue-700 text-sm font-medium">{t('response_rate') || 'Taux de Réponse'}</p>
              <p className="text-2xl font-bold text-blue-900">
                {totalInvites > 0 ? Math.round((confirmedInvites / totalInvites) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200/50 shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-green-500 rounded-xl">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-green-700 text-sm font-medium">{t('confirmation_rate') || 'Taux de Confirmation'}</p>
              <p className="text-2xl font-bold text-green-900">
                {totalInvites > 0 ? Math.round((confirmedInvites / totalInvites) * 100) : 0}%
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
              <p className="text-purple-700 text-sm font-medium">{t('couples') || 'Couples'}</p>
              <p className="text-2xl font-bold text-purple-900">
                {userInvites.filter(invite => invite.etat === 'couple').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200/50 shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-orange-500 rounded-xl">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-orange-700 text-sm font-medium">{t('singles') || 'Individuels'}</p>
              <p className="text-2xl font-bold text-orange-900">
                {userInvites.filter(invite => invite.etat === 'simple').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques et détails */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 p-6">
          <h4 className="text-lg font-semibold text-slate-900 mb-4">
            {t('confirmation_breakdown') || 'Répartition des Confirmations'}
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-emerald-500 rounded-full mr-3"></div>
                <span className="text-slate-700">{t('confirmed') || 'Confirmés'}</span>
              </div>
              <span className="font-semibold text-slate-900">{confirmedInvites}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-amber-500 rounded-full mr-3"></div>
                <span className="text-slate-700">{t('pending') || 'En attente'}</span>
              </div>
              <span className="font-semibold text-slate-900">{pendingInvites}</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-3 mt-4">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${totalInvites > 0 ? (confirmedInvites / totalInvites) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 p-6">
          <h4 className="text-lg font-semibold text-slate-900 mb-4">
            {t('guest_type_breakdown') || 'Répartition par Type d\'Invité'}
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-slate-700">{t('couples') || 'Couples'}</span>
              </div>
              <span className="font-semibold text-slate-900">
                {userInvites.filter(invite => invite.etat === 'couple').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-slate-700">{t('singles') || 'Individuels'}</span>
              </div>
              <span className="font-semibold text-slate-900">
                {userInvites.filter(invite => invite.etat === 'simple').length}
              </span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-3 mt-4">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${totalInvites > 0 ? (userInvites.filter(invite => invite.etat === 'couple').length / totalInvites) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des tables */}
      <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 p-6">
        <h4 className="text-lg font-semibold text-slate-900 mb-4">
          {t('table_occupancy') || 'Occupation des Tables'}
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">
                  {t('table_name') || 'Nom de la Table'}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">
                  {t('assigned_guests') || 'Invités Assignés'}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">
                  {t('confirmed_guests') || 'Invités Confirmés'}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">
                  {t('occupancy_rate') || 'Taux d\'Occupation'}
                </th>
              </tr>
            </thead>
            <tbody>
              {getUniqueTableNames().map(tableName => {
                const tableGuests = userInvites.filter(invite => invite.table === tableName);
                const confirmedTableGuests = tableGuests.filter(invite => invite.confirmed);
                const occupancyRate = tableGuests.length > 0 ? (confirmedTableGuests.length / tableGuests.length) * 100 : 0;
                
                return (
                  <tr key={tableName} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{tableName}</td>
                    <td className="py-3 px-4 text-slate-600">{tableGuests.length}</td>
                    <td className="py-3 px-4 text-slate-600">{confirmedTableGuests.length}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-20 bg-neutral-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${occupancyRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {Math.round(occupancyRate)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
          {t('templates') || 'Mes Modèles'}
        </h3>
        <p className="text-slate-600">
          {t('manage_templates') || 'Gérez et personnalisez vos modèles d\'invitation'}
        </p>
      </div>

      {userModels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userModels.map((model) => {
            const IconComponent = model.category === 'wedding' ? Heart : 
                               model.category === 'birthday' ? Gift : GraduationCap;
            return (
              <div key={model.id} className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 overflow-hidden hover:shadow-glow-amber transition-all duration-300 transform hover:scale-105">
                <div className="relative h-48 bg-gradient-to-br from-neutral-100 to-amber-50">
                  {model.backgroundImage && (
                    <img
                      src={model.backgroundImage}
                      alt={model.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                      <IconComponent className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h4 className="text-white font-bold text-lg mb-1">{model.name}</h4>
                    <p className="text-white/80 text-sm">{model.title}</p>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      model.category === 'wedding' ? 'bg-rose-100 text-rose-800' :
                      model.category === 'birthday' ? 'bg-purple-100 text-purple-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {model.category === 'wedding' ? t('wedding') || 'Mariage' :
                       model.category === 'birthday' ? t('birthday') || 'Anniversaire' :
                       t('graduation') || 'Collation'}
                    </span>
                    <span className="text-sm text-slate-500">
                      {new Date(model.createdAt || '').toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {model.invitationText}
                  </p>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedModel(model);
                        setShowCustomization(true);
                      }}
                      className="flex-1 bg-amber-100 text-amber-700 px-4 py-2 rounded-xl hover:bg-amber-200 transition-all duration-300 font-medium flex items-center justify-center"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {t('edit') || 'Modifier'}
                    </button>
                    <button className="flex-1 bg-purple-100 text-purple-700 px-4 py-2 rounded-xl hover:bg-purple-200 transition-all duration-300 font-medium flex items-center justify-center">
                      <Eye className="h-4 w-4 mr-2" />
                      {t('preview') || 'Aperçu'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-amber-100 to-amber-200 rounded-full">
              <Sparkles className="h-12 w-12 text-amber-600" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            {t('no_templates_yet') || 'Aucun modèle pour le moment'}
          </h3>
          <p className="text-slate-600 mb-6">
            {t('create_first_template') || 'Créez votre premier modèle d\'invitation personnalisé'}
          </p>
          <button
            onClick={() => setActiveTab('overview')}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-glow-amber transform hover:scale-105"
          >
            {t('get_started') || 'Commencer'}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-amber-50/30 to-purple-50/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-luxury border-b border-neutral-200/50 sticky top-0 z-40">
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
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-amber-700 to-slate-900 bg-clip-text text-transparent">
                  {t('dashboard') || 'Dashboard'}
                </h1>
                <p className="text-sm text-slate-600">
                  {t('welcome_back') || 'Bon retour'}, {userData?.firstName}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Indicateur d'abonnement */}
              {subscription && (
                <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-amber-50 to-amber-100 px-4 py-2 rounded-full border border-amber-200/50">
                  <Crown className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">
                    {subscription.plan === 'free' ? t('free_plan') || 'Gratuit' : subscription.plan}
                  </span>
                  {subscription.plan === 'free' && (
                    <span className="text-xs text-amber-600">
                      ({getRemainingInvites()}/5)
                    </span>
                  )}
                </div>
              )}

              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                title={t('settings') || 'Paramètres'}
              >
                <Settings className="h-5 w-5" />
              </button>

              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-full hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-medium shadow-glow-amber transform hover:scale-105"
              >
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                  {userData?.firstName[0]}{userData?.lastName[0]}
                </div>
                <span className="hidden sm:block">{userData?.firstName}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white/60 backdrop-blur-xl border-b border-neutral-200/50 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: t('overview') || 'Vue d\'ensemble', icon: BarChart3 },
              { id: 'guests', label: t('guests') || 'Invités', icon: Users },
              { id: 'tables', label: t('tables') || 'Tables', icon: Calendar },
              { id: 'templates', label: t('templates') || 'Modèles', icon: Sparkles },
              { id: 'analytics', label: t('analytics') || 'Statistiques', icon: TrendingUp }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
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
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'guests' && renderGuests()}
        {activeTab === 'tables' && renderTables()}
        {activeTab === 'templates' && renderTemplates()}
        {activeTab === 'analytics' && renderAnalytics()}
      </main>

      {/* Modal pour ajouter/modifier un invité */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-luxury max-w-md w-full animate-slide-up">
            <div className="p-6 border-b border-neutral-200/50">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">
                  {editingInvite ? t('edit_guest') || 'Modifier l\'invité' : t('add_guest') || 'Ajouter un invité'}
                </h3>
                <button
                  onClick={() => setShowInviteModal(false)}
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
                    {t('guest_name') || 'Nom de l\'invité'}
                  </label>
                  <input
                    type="text"
                    value={inviteFormData.nom}
                    onChange={(e) => setInviteFormData({ ...inviteFormData, nom: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    placeholder={t('enter_guest_name') || 'Entrez le nom de l\'invité'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('table_assignment') || 'Attribution de table'}
                  </label>
                  <select
                    value={inviteFormData.table}
                    onChange={(e) => setInviteFormData({ ...inviteFormData, table: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                  >
                    <option value="">{t('select_table') || 'Sélectionner une table'}</option>
                    {tables.map(table => (
                      <option key={table.id} value={table.name}>{table.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('guest_type') || 'Type d\'invité'}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setInviteFormData({ ...inviteFormData, etat: 'simple' })}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                        inviteFormData.etat === 'simple'
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-neutral-300 hover:border-amber-300'
                      }`}
                    >
                      <User className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-sm font-medium">{t('single') || 'Simple'}</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInviteFormData({ ...inviteFormData, etat: 'couple' })}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                        inviteFormData.etat === 'couple'
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-neutral-300 hover:border-purple-300'
                      }`}
                    >
                      <Users className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-sm font-medium">{t('couple') || 'Couple'}</div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-3 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-all duration-200 font-medium"
                >
                  {t('cancel') || 'Annuler'}
                </button>
                <button
                  onClick={editingInvite ? handleEditInvite : handleCreateInvite}
                  disabled={!inviteFormData.nom.trim() || isLoading}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-glow-amber transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      {t('saving') || 'Sauvegarde...'}
                    </div>
                  ) : (
                    editingInvite ? t('save_changes') || 'Sauvegarder' : t('add_guest') || 'Ajouter'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Messages d'erreur */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-rose-500 text-white px-6 py-3 rounded-xl shadow-lg animate-slide-up z-50">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;