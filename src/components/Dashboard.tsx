import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  Share2,
  QrCode,
  MessageCircle,
  Sparkles,
  LogOut,
  User,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import UserProfile from './UserProfile';
import TableManagement from './TableManagement';
import TemplateCustomization from './TemplateCustomization';
import UpgradeModal from './UpgradeModal';
import SubscriptionPage from './SubscriptionPage';
import { useTemplates } from '../hooks/useTemplates';
import { useSubscription } from '../hooks/useSubscription';
import { UserData } from '../hooks/useAuth';
import { UserModel, Invite } from '../services/templateService';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

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
    createInvite, 
    updateInvite, 
    deleteInvite,
    refreshUserData 
  } = useTemplates();
  
  const { subscription, canCreateInvite, getRemainingInvites } = useSubscription();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSubscriptionPage, setShowSubscriptionPage] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [customizingTemplate, setCustomizingTemplate] = useState<any>(null);
  const [tables, setTables] = useState<Table[]>([
    { id: 1, name: 'Table des Mariés', seats: 8, assignedGuests: [] },
    { id: 2, name: 'Table Famille', seats: 10, assignedGuests: [] },
    { id: 3, name: 'Table Amis', seats: 8, assignedGuests: [] }
  ]);

  // États pour la gestion des invités
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingInvite, setEditingInvite] = useState<Invite | null>(null);
  const [inviteFormData, setInviteFormData] = useState({
    nom: '',
    table: '',
    etat: 'simple' as 'simple' | 'couple'
  });

  // Charger les données au montage
  useEffect(() => {
    if (userData) {
      refreshUserData();
    }
  }, [userData]);

  // Vérifier les limites d'invitations
  useEffect(() => {
    if (subscription?.plan === 'free' && userInvites.length >= 5) {
      console.log('Limite d\'invitations atteinte pour le plan gratuit');
    }
  }, [subscription, userInvites]);

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'invites', label: 'Invités', icon: Users },
    { id: 'templates', label: 'Mes Modèles', icon: Calendar },
    { id: 'tables', label: 'Tables', icon: Settings },
    { id: 'profile', label: 'Profil', icon: User }
  ];

  const handleCreateInvite = async () => {
    if (!userData) return;

    // Vérification STRICTE de la limite
    if (subscription?.plan === 'free' && userInvites.length >= 5) {
      setShowUpgradeModal(true);
      return;
    }

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
        alert('Invité créé avec succès !');
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'invité:', error);
      if (error.message?.includes('limite')) {
        setShowUpgradeModal(true);
      } else {
        alert('Erreur lors de la création de l\'invité');
      }
    }
  };

  const handleEditInvite = (invite: Invite) => {
    setEditingInvite(invite);
    setInviteFormData({
      nom: invite.nom,
      table: invite.table,
      etat: invite.etat
    });
    setShowInviteModal(true);
  };

  const handleUpdateInvite = async () => {
    if (!editingInvite) return;

    try {
      await updateInvite(editingInvite.id, {
        nom: inviteFormData.nom,
        table: inviteFormData.table,
        etat: inviteFormData.etat
      });

      setShowInviteModal(false);
      setEditingInvite(null);
      setInviteFormData({ nom: '', table: '', etat: 'simple' });
      alert('Invité mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour de l\'invité');
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet invité ?')) {
      try {
        await deleteInvite(inviteId);
        alert('Invité supprimé avec succès !');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'invité');
      }
    }
  };

  const generateInvitationLink = (inviteId: string) => {
    return `${window.location.origin}/invitation/${inviteId}`;
  };

  const handleShareInvitation = (inviteId: string) => {
    const link = generateInvitationLink(inviteId);
    navigator.clipboard.writeText(link);
    alert('Lien d\'invitation copié dans le presse-papiers !');
  };

  const exportToExcel = () => {
    const data = userInvites.map(invite => ({
      'Nom': invite.nom,
      'Table': invite.table,
      'État': invite.etat,
      'Confirmé': invite.confirmed ? 'Oui' : 'Non',
      'Date de création': new Date(invite.createdAt.toDate()).toLocaleDateString('fr-FR')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Invités');
    XLSX.writeFile(wb, 'liste_invites.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Liste des Invités', 20, 20);
    
    let y = 40;
    userInvites.forEach((invite, index) => {
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${invite.nom} - Table: ${invite.table} - ${invite.etat}`, 20, y);
      y += 10;
    });
    
    doc.save('liste_invites.pdf');
  };

  const handleCustomizeTemplate = (template: UserModel) => {
    setCustomizingTemplate(template);
    setShowCustomization(true);
  };

  const handleSaveCustomization = (customizedTemplate: any) => {
    console.log('Template personnalisé sauvegardé:', customizedTemplate);
    setShowCustomization(false);
    setCustomizingTemplate(null);
  };

  if (showSubscriptionPage) {
    return (
      <SubscriptionPage
        onBack={() => setShowSubscriptionPage(false)}
        currentPlan={subscription?.plan || 'free'}
        remainingInvites={getRemainingInvites()}
      />
    );
  }

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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8 animate-fade-in">
            {/* Alerte limite d'invitations */}
            {subscription?.plan === 'free' && userInvites.length >= 4 && (
              <div className="bg-gradient-to-r from-rose-50 to-amber-50 rounded-2xl p-6 border border-rose-200/50 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-rose-500 to-amber-500 rounded-full shadow-glow-rose">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-bold text-slate-900">
                        {userInvites.length >= 5 ? 'Limite atteinte !' : 'Attention !'}
                      </h3>
                      <p className="text-slate-600">
                        {userInvites.length >= 5 
                          ? 'Vous avez atteint la limite de 5 invitations gratuites'
                          : `Plus que ${5 - userInvites.length} invitation${5 - userInvites.length > 1 ? 's' : ''} gratuite${5 - userInvites.length > 1 ? 's' : ''}`
                        }
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSubscriptionPage(true)}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-glow-amber transform hover:scale-105"
                  >
                    <Zap className="h-5 w-5 inline mr-2" />
                    Passer au Premium
                  </button>
                </div>
              </div>
            )}

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200/50 shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-amber-500 rounded-xl shadow-glow-amber">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-amber-700 text-sm font-medium">Total Invités</p>
                    <p className="text-2xl font-bold text-amber-900">{userInvites.length}</p>
                    {subscription?.plan === 'free' && (
                      <p className="text-xs text-amber-600">/{subscription.inviteLimit} max</p>
                    )}
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
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200/50 shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-500 rounded-xl shadow-glow-purple">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-purple-700 text-sm font-medium">Mes Modèles</p>
                    <p className="text-2xl font-bold text-purple-900">{userModels.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl p-6 border border-rose-200/50 shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-rose-500 rounded-xl">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-rose-700 text-sm font-medium">En attente</p>
                    <p className="text-2xl font-bold text-rose-900">
                      {userInvites.filter(invite => !invite.confirmed).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Actions rapides</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    if (subscription?.plan === 'free' && userInvites.length >= 5) {
                      setShowUpgradeModal(true);
                    } else {
                      setShowInviteModal(true);
                    }
                  }}
                  className="flex items-center justify-center p-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-glow-amber transform hover:scale-105"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Nouvel invité
                </button>
                
                <button
                  onClick={exportToExcel}
                  className="flex items-center justify-center p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-semibold transform hover:scale-105"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Exporter Excel
                </button>
                
                <button
                  onClick={() => setShowSubscriptionPage(true)}
                  className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 font-semibold transform hover:scale-105"
                >
                  <Crown className="h-5 w-5 mr-2" />
                  Voir les plans
                </button>
              </div>
            </div>

            {/* Invités récents */}
            <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Invités récents</h3>
                <button
                  onClick={() => setActiveTab('invites')}
                  className="text-amber-600 hover:text-amber-700 font-medium"
                >
                  Voir tout
                </button>
              </div>
              
              {userInvites.length > 0 ? (
                <div className="space-y-3">
                  {userInvites.slice(0, 5).map((invite, index) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-amber-50/30 rounded-xl border border-neutral-200/50 hover:shadow-md transition-all duration-200 animate-slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
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
                          <p className="text-sm text-slate-600">Table: {invite.table || 'Non assigné'}</p>
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
                        <button
                          onClick={() => handleShareInvitation(invite.id)}
                          className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all duration-200"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-neutral-500 mb-2">Aucun invité pour le moment</h4>
                  <p className="text-neutral-400 mb-6">Commencez par ajouter votre premier invité</p>
                  <button
                    onClick={() => {
                      if (subscription?.plan === 'free' && userInvites.length >= 5) {
                        setShowUpgradeModal(true);
                      } else {
                        setShowInviteModal(true);
                      }
                    }}
                    className="bg-amber-500 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-all duration-300 font-semibold"
                  >
                    <Plus className="h-5 w-5 inline mr-2" />
                    Ajouter un invité
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'invites':
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Header avec actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Gestion des Invités
                </h2>
                <p className="text-slate-600 mt-1">
                  {userInvites.length} invité{userInvites.length > 1 ? 's' : ''} 
                  {subscription?.plan === 'free' && ` sur ${subscription.inviteLimit} maximum`}
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={exportToExcel}
                  className="bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition-all duration-300 font-semibold flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </button>
                
                <button
                  onClick={exportToPDF}
                  className="bg-rose-500 text-white px-4 py-2 rounded-xl hover:bg-rose-600 transition-all duration-300 font-semibold flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </button>
                
                <button
                  onClick={() => {
                    if (subscription?.plan === 'free' && userInvites.length >= 5) {
                      setShowUpgradeModal(true);
                    } else {
                      setShowInviteModal(true);
                    }
                  }}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 px-4 py-2 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold flex items-center shadow-glow-amber transform hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel invité
                </button>
              </div>
            </div>

            {/* Liste des invités */}
            <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 overflow-hidden">
              {userInvites.length > 0 ? (
                <>
                  {/* En-tête du tableau - Desktop */}
                  <div className="hidden md:grid md:grid-cols-6 gap-4 p-6 bg-gradient-to-r from-neutral-50 to-amber-50/30 border-b border-neutral-200/50">
                    <div className="font-semibold text-slate-700">Nom</div>
                    <div className="font-semibold text-slate-700">Table</div>
                    <div className="font-semibold text-slate-700">Type</div>
                    <div className="font-semibold text-slate-700">Statut</div>
                    <div className="font-semibold text-slate-700">Date</div>
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
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg mr-3 ${
                              invite.etat === 'couple' 
                                ? 'bg-gradient-to-r from-pink-500 to-purple-500' 
                                : 'bg-gradient-to-r from-amber-500 to-orange-500'
                            }`}>
                              {invite.nom.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                            <span className="font-medium text-slate-900">{invite.nom}</span>
                          </div>
                          
                          <div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                              {invite.table || 'Non assigné'}
                            </span>
                          </div>
                          
                          <div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                              invite.etat === 'couple' 
                                ? 'bg-pink-100 text-pink-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {invite.etat === 'couple' ? 'Couple' : 'Simple'}
                            </span>
                          </div>
                          
                          <div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                              invite.confirmed 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {invite.confirmed ? 'Confirmé' : 'En attente'}
                            </span>
                          </div>
                          
                          <div className="text-slate-600 text-sm">
                            {new Date(invite.createdAt.toDate()).toLocaleDateString('fr-FR')}
                          </div>
                          
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => {
                                const link = generateInvitationLink(invite.id);
                                window.open(link, '_blank');
                              }}
                              className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                              title="Voir l'invitation"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleShareInvitation(invite.id)}
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                              title="Partager"
                            >
                              <Share2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditInvite(invite)}
                              className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
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
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-lg mr-3 ${
                                invite.etat === 'couple' 
                                  ? 'bg-gradient-to-r from-pink-500 to-purple-500' 
                                  : 'bg-gradient-to-r from-amber-500 to-orange-500'
                              }`}>
                                {invite.nom.split(' ').map(n => n[0]).join('').substring(0, 2)}
                              </div>
                              <div>
                                <h4 className="font-medium text-slate-900">{invite.nom}</h4>
                                <p className="text-sm text-slate-600">Table: {invite.table || 'Non assigné'}</p>
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
                          
                          <div className="flex items-center justify-between">
                            <div className="flex space-x-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                invite.etat === 'couple' 
                                  ? 'bg-pink-100 text-pink-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {invite.etat === 'couple' ? 'Couple' : 'Simple'}
                              </span>
                              <span className="text-xs text-slate-500">
                                {new Date(invite.createdAt.toDate()).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            
                            <div className="flex space-x-1">
                              <button
                                onClick={() => {
                                  const link = generateInvitationLink(invite.id);
                                  window.open(link, '_blank');
                                }}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleShareInvitation(invite.id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              >
                                <Share2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEditInvite(invite)}
                                className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteInvite(invite.id)}
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
                </>
              ) : (
                <div className="p-12 text-center">
                  <Users className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-500 mb-2">Aucun invité pour le moment</h3>
                  <p className="text-neutral-400 mb-6">Commencez par ajouter votre premier invité</p>
                  <button
                    onClick={() => {
                      if (subscription?.plan === 'free' && userInvites.length >= 5) {
                        setShowUpgradeModal(true);
                      } else {
                        setShowInviteModal(true);
                      }
                    }}
                    className="bg-amber-500 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-all duration-300 font-semibold"
                  >
                    <Plus className="h-5 w-5 inline mr-2" />
                    Ajouter un invité
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'templates':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Mes Modèles
                </h2>
                <p className="text-slate-600 mt-1">{userModels.length} modèle{userModels.length > 1 ? 's' : ''} personnalisé{userModels.length > 1 ? 's' : ''}</p>
              </div>
            </div>

            {userModels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userModels.map((template, index) => (
                  <div
                    key={template.id}
                    className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 overflow-hidden hover:shadow-glow-amber transition-all duration-500 transform hover:scale-105 animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={template.backgroundImage}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-bold text-lg mb-1">{template.title}</h3>
                        <p className="text-white/80 text-sm">{template.category}</p>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-slate-600">
                          Créé le {new Date(template.createdAt?.toDate() || Date.now()).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          {template.category}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleCustomizeTemplate(template)}
                          className="bg-amber-500 text-white px-4 py-2 rounded-xl hover:bg-amber-600 transition-all duration-300 font-semibold flex items-center justify-center"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </button>
                        <button
                          onClick={() => {
                            const link = generateInvitationLink('demo');
                            window.open(link, '_blank');
                          }}
                          className="bg-purple-500 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition-all duration-300 font-semibold flex items-center justify-center"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Aperçu
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 p-12 text-center">
                <Calendar className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-500 mb-2">Aucun modèle personnalisé</h3>
                <p className="text-neutral-400 mb-6">Créez votre premier modèle d'invitation personnalisé</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-amber-500 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-all duration-300 font-semibold"
                >
                  <Plus className="h-5 w-5 inline mr-2" />
                  Créer un modèle
                </button>
              </div>
            )}
          </div>
        );

      case 'tables':
        return (
          <TableManagement
            tables={tables}
            setTables={setTables}
            guests={userInvites}
            isLoading={isLoading}
          />
        );

      case 'profile':
        return (
          <UserProfile
            userData={userData!}
            onLogout={onLogout}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-amber-50/30 to-purple-50/20">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:shadow-luxury lg:border-r lg:border-neutral-200/50">
          <div className="flex-1 flex flex-col min-h-0">
            {/* Header */}
            <div className="flex items-center h-16 px-6 bg-gradient-to-r from-neutral-50 to-amber-50/30 border-b border-neutral-200/50">
              <div className="flex items-center">
                <div className="relative">
                  <Crown className="h-8 w-8 text-amber-500 animate-glow drop-shadow-lg" />
                  <div className="absolute inset-0 animate-pulse">
                    <Crown className="h-8 w-8 text-amber-300 opacity-30" />
                  </div>
                </div>
                <span className="ml-2 text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Dashboard
                </span>
              </div>
            </div>

            {/* User Info */}
            <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-rose-50/30 border-b border-neutral-200/50">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold shadow-glow-amber">
                  {userData?.firstName[0]}{userData?.lastName[0]}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-900">{userData?.firstName} {userData?.lastName}</p>
                  <p className="text-xs text-slate-600">
                    Plan {subscription?.plan === 'free' ? 'Gratuit' : subscription?.plan}
                    {subscription?.plan === 'free' && ` (${getRemainingInvites()}/5)`}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 shadow-glow-amber transform scale-105'
                        : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                  >
                    <IconComponent className="mr-3 h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {/* Upgrade CTA */}
            {subscription?.plan === 'free' && (
              <div className="p-4 border-t border-neutral-200/50">
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200/50">
                  <div className="flex items-center mb-2">
                    <Sparkles className="h-4 w-4 text-amber-600 mr-2" />
                    <h4 className="text-sm font-semibold text-amber-800">Passez au Premium</h4>
                  </div>
                  <p className="text-xs text-amber-700 mb-3">
                    Débloquez toutes les fonctionnalités
                  </p>
                  <button
                    onClick={() => setShowSubscriptionPage(true)}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 py-2 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold text-sm shadow-glow-amber transform hover:scale-105"
                  >
                    <Crown className="h-4 w-4 inline mr-1" />
                    Voir les plans
                  </button>
                </div>
              </div>
            )}

            {/* Logout */}
            <div className="p-4 border-t border-neutral-200/50">
              <button
                onClick={onLogout}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-all duration-300"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Se déconnecter
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          {/* Mobile Header */}
          <div className="lg:hidden bg-white shadow-sm border-b border-neutral-200/50 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Crown className="h-6 w-6 text-amber-500 mr-2" />
                <span className="font-bold text-slate-900">Dashboard</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {userData?.firstName[0]}{userData?.lastName[0]}
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden bg-white border-b border-neutral-200/50 px-4 py-2">
            <div className="flex space-x-1 overflow-x-auto">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-amber-500 text-slate-900'
                        : 'text-slate-600 hover:bg-amber-50'
                    }`}
                  >
                    <IconComponent className="mr-1 h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1 p-4 lg:p-8">
            {renderTabContent()}
          </main>
        </div>
      </div>

      {/* Modal pour ajouter/modifier un invité */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-luxury max-w-md w-full animate-slide-up">
            <div className="p-6 border-b border-neutral-200/50">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">
                  {editingInvite ? 'Modifier l\'invité' : 'Nouvel invité'}
                </h3>
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setEditingInvite(null);
                    setInviteFormData({ nom: '', table: '', etat: 'simple' });
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
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={inviteFormData.nom}
                    onChange={(e) => setInviteFormData(prev => ({ ...prev, nom: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    placeholder="Ex: Jean Dupont"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Table
                  </label>
                  <select
                    value={inviteFormData.table}
                    onChange={(e) => setInviteFormData(prev => ({ ...prev, table: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                  >
                    <option value="">Sélectionner une table</option>
                    {tables.map(table => (
                      <option key={table.id} value={table.name}>{table.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Type d'invitation
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center p-3 border border-neutral-300 rounded-xl cursor-pointer hover:border-amber-400 transition-colors duration-200">
                      <input
                        type="radio"
                        name="etat"
                        value="simple"
                        checked={inviteFormData.etat === 'simple'}
                        onChange={(e) => setInviteFormData(prev => ({ ...prev, etat: e.target.value as 'simple' | 'couple' }))}
                        className="mr-3"
                      />
                      <div>
                        <p className="font-medium text-slate-900">Simple</p>
                        <p className="text-xs text-slate-600">1 personne</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 border border-neutral-300 rounded-xl cursor-pointer hover:border-amber-400 transition-colors duration-200">
                      <input
                        type="radio"
                        name="etat"
                        value="couple"
                        checked={inviteFormData.etat === 'couple'}
                        onChange={(e) => setInviteFormData(prev => ({ ...prev, etat: e.target.value as 'simple' | 'couple' }))}
                        className="mr-3"
                      />
                      <div>
                        <p className="font-medium text-slate-900">Couple</p>
                        <p className="text-xs text-slate-600">2 personnes</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setEditingInvite(null);
                    setInviteFormData({ nom: '', table: '', etat: 'simple' });
                  }}
                  className="flex-1 px-4 py-3 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-all duration-200 font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={editingInvite ? handleUpdateInvite : handleCreateInvite}
                  disabled={!inviteFormData.nom.trim()}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 px-4 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-glow-amber transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {editingInvite ? 'Modifier' : 'Créer'}
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
        remainingInvites={getRemainingInvites()}
      />
    </div>
  );
};

export default Dashboard;