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
  Crown, 
  Sparkles,
  MessageCircle,
  Wine,
  Download,
  User,
  Table,
  LogOut,
  ArrowLeft,
  X,
  Heart,
  Send,
  Mail,
  MessageSquare
} from 'lucide-react';
import UserProfile from './UserProfile';
import TableManagement from './TableManagement';
import TemplateCustomization from './TemplateCustomization';
import UpgradeModal from './UpgradeModal';
import DashboardSettings from './DashboardSettings';
import GuestMessagesViewer from './GuestMessagesViewer';
import { useTemplates } from '../hooks/useTemplates';
import { useSubscription } from '../hooks/useSubscription';
import { UserData } from '../hooks/useAuth';

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

interface Guest {
  id: string;
  nom: string;
  table: string;
  etat: 'simple' | 'couple';
  confirmed: boolean;
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
  const { 
    userModels, 
    userInvites, 
    userTables,
    createInvite, 
    updateInvite, 
    deleteInvite,
    createTable,
    updateTable,
    deleteTable,
    updateUserModel,
    deleteUserModel,
    isLoading,
    error,
    refreshUserData
  } = useTemplates();
  
  const { subscription, canCreateInvite, getRemainingInvites } = useSubscription();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showProfile, setShowProfile] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGuestMessages, setShowGuestMessages] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateData | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [newGuest, setNewGuest] = useState({ nom: '', table: '', etat: 'simple' as 'simple' | 'couple' });
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);

  // Synchroniser les données avec les hooks
  useEffect(() => {
    if (userInvites) {
      const formattedGuests = userInvites.map(invite => ({
        id: invite.id,
        nom: invite.nom,
        table: invite.table,
        etat: invite.etat,
        confirmed: invite.confirmed
      }));
      setGuests(formattedGuests);
    }
  }, [userInvites]);

  useEffect(() => {
    if (userTables) {
      const formattedTables = userTables.map(table => ({
        id: table.id,
        name: table.name,
        seats: table.seats,
        assignedGuests: table.assignedGuests || []
      }));
      setTables(formattedTables);
    }
  }, [userTables]);

  // Rafraîchir les données au montage
  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  const handleAddGuest = async () => {
    setIsAddingGuest(true);
    try {
      const inviteId = await createInvite({
        nom: newGuest.nom,
        table: newGuest.table || 'Non assigné',
        etat: newGuest.etat,
        confirmed: false
      });

      if (inviteId) {
        setNewGuest({ nom: '', table: '', etat: 'simple' });
        setShowAddGuestModal(false);
        await refreshUserData();
      } else {
        alert('Erreur lors de l\'ajout de l\'invité');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'invité:', error);
      alert('Erreur lors de l\'ajout de l\'invité');
    } finally {
      setIsAddingGuest(false);
    }
  };

  const openAddGuestModal = () => {
    setNewGuest({ nom: '', table: '', etat: 'simple' });
    setShowAddGuestModal(true);
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet invité ?')) {
      try {
        const success = await deleteInvite(guestId);
        if (success) {
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

  const handleSaveTable = async (table: Table) => {
    try {
      if (tables.find(t => t.id === table.id)) {
        // Mettre à jour
        const success = await updateTable(table.id.toString(), {
          name: table.name,
          seats: table.seats,
          assignedGuests: table.assignedGuests
        });
        if (!success) {
          throw new Error('Échec de la mise à jour');
        }
      } else {
        // Créer
        const tableId = await createTable({
          name: table.name,
          seats: table.seats,
          assignedGuests: table.assignedGuests
        });
        if (!tableId) {
          throw new Error('Échec de la création');
        }
      }
      await refreshUserData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la table:', error);
      throw error;
    }
  };

  const handleDeleteTable = async (tableId: number) => {
    try {
      const success = await deleteTable(tableId.toString());
      if (!success) {
        throw new Error('Échec de la suppression');
      }
      await refreshUserData();
    } catch (error) {
      console.error('Erreur lors de la suppression de la table:', error);
      throw error;
    }
  };

  const handleEditTemplate = (template: TemplateData) => {
    setEditingTemplate(template);
  };

  const handleSaveTemplate = async (customizedTemplate: TemplateData) => {
    if (!editingTemplate) return;
    
    try {
      const success = await updateUserModel(editingTemplate.id, {
        title: customizedTemplate.title,
        invitationText: customizedTemplate.invitationText,
        eventDate: customizedTemplate.eventDate,
        eventTime: customizedTemplate.eventTime,
        eventLocation: customizedTemplate.eventLocation,
        backgroundImage: customizedTemplate.backgroundImage,
        drinkOptions: customizedTemplate.drinkOptions,
        name: customizedTemplate.name
      });

      if (success) {
        setEditingTemplate(null);
        await refreshUserData();
      } else {
        alert('Erreur lors de la sauvegarde du template');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du template');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      try {
        const success = await deleteUserModel(templateId);
        if (success) {
          await refreshUserData();
        } else {
          alert('Erreur lors de la suppression du template');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du template');
      }
    }
  };

  const generateInvitationLink = (templateId: string, guestId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/invitation/${guestId}`;
  };

  const sendWhatsAppInvitation = (guest: Guest) => {
    const invitationLink = generateInvitationLink(userModels[0]?.id || 'demo', guest.id);
    const eventName = userModels[0]?.title || 'Notre Événement Spécial';
    const eventDate = userModels[0]?.eventDate || 'Bientôt';
    const eventLocation = userModels[0]?.eventLocation || 'Lieu à confirmer';
    
    const message = `🎉 *Invitation Spéciale* 🎉

Bonjour ${guest.nom} !

Vous êtes cordialement invité(e) à :
✨ *${eventName}*
📅 Date : ${eventDate}
📍 Lieu : ${eventLocation}
🪑 Table : ${guest.table}

Pour confirmer votre présence et découvrir tous les détails, cliquez sur votre invitation personnalisée :
👇 ${invitationLink}

Nous avons hâte de célébrer avec vous ! 💫

Avec toute notre affection,
L'équipe organisatrice ❤️`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const sendEmailInvitation = (guest: Guest) => {
    const invitationLink = generateInvitationLink(userModels[0]?.id || 'demo', guest.id);
    const eventName = userModels[0]?.title || 'Notre Événement Spécial';
    const eventDate = userModels[0]?.eventDate || 'Bientôt';
    const eventTime = userModels[0]?.eventTime || 'Heure à confirmer';
    const eventLocation = userModels[0]?.eventLocation || 'Lieu à confirmer';
    
    const subject = `🎉 Invitation Spéciale - ${eventName}`;
    const body = `Bonjour ${guest.nom},

Vous êtes cordialement invité(e) à notre événement spécial !

📋 DÉTAILS DE L'ÉVÉNEMENT :
✨ Événement : ${eventName}
📅 Date : ${eventDate}
🕐 Heure : ${eventTime}
📍 Lieu : ${eventLocation}
🪑 Table assignée : ${guest.table}

🎯 VOTRE INVITATION PERSONNALISÉE :
Cliquez sur le lien ci-dessous pour accéder à votre invitation interactive où vous pourrez :
• Confirmer votre présence
• Choisir votre boisson préférée
• Laisser un message dans notre livre d'or
• Voir tous les détails de l'événement

👉 ${invitationLink}

Nous sommes impatients de célébrer ce moment spécial avec vous !

Avec toute notre affection,
L'équipe organisatrice

---
💌 Cette invitation a été créée avec Furaha-Event
🔗 Découvrez nos services : https://furaha-event.com`;

    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const sendAllInvitations = (method: 'whatsapp' | 'email') => {
    if (guests.length === 0) {
      alert('Aucun invité à qui envoyer les invitations');
      return;
    }
    
    const confirmMessage = `Êtes-vous sûr de vouloir envoyer les invitations par ${method === 'whatsapp' ? 'WhatsApp' : 'Email'} à tous les ${guests.length} invités ?`;
    
    if (window.confirm(confirmMessage)) {
      guests.forEach(guest => {
        if (method === 'whatsapp') {
          sendWhatsAppInvitation(guest);
        } else {
          sendEmailInvitation(guest);
        }
      });
      
      alert(`Invitations ${method === 'whatsapp' ? 'WhatsApp' : 'Email'} envoyées à tous les invités !`);
    }
  };

  if (showProfile && userData) {
    return <UserProfile userData={userData} onLogout={onLogout} />;
  }

  if (editingTemplate) {
    return (
      <TemplateCustomization
        template={editingTemplate}
        onBack={() => setEditingTemplate(null)}
        onSave={handleSaveTemplate}
      />
    );
  }

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'templates', label: 'Mes Templates', icon: Sparkles },
    { id: 'guests', label: 'Invités', icon: Users },
    { id: 'tables', label: 'Tables', icon: Table },
    { id: 'messages', label: 'Messages & Boissons', icon: MessageCircle }
  ];

  const renderOverview = () => {
    const totalGuests = guests.length;
    const confirmedGuests = guests.filter(g => g.confirmed).length;
    const pendingGuests = totalGuests - confirmedGuests;
    const totalTables = tables.length;

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200/50 shadow-lg hover:shadow-glow-amber transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-glow-amber">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-amber-700 text-sm font-medium">Total Invités</p>
                <p className="text-3xl font-bold text-amber-900">{totalGuests}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200/50 shadow-lg hover:shadow-lg transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-emerald-700 text-sm font-medium">Confirmés</p>
                <p className="text-3xl font-bold text-emerald-900">{confirmedGuests}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200/50 shadow-lg hover:shadow-lg transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-purple-700 text-sm font-medium">En attente</p>
                <p className="text-3xl font-bold text-purple-900">{pendingGuests}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl p-6 border border-rose-200/50 shadow-lg hover:shadow-lg transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-rose-500 to-rose-600 rounded-xl">
                <Table className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-rose-700 text-sm font-medium">Tables</p>
                <p className="text-3xl font-bold text-rose-900">{totalTables}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 p-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-6">
            Actions rapides
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={openAddGuestModal}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-glow-amber transform hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              Ajouter un invité
            </button>
            
            <button
              onClick={() => setActiveTab('tables')}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-lg transform hover:scale-105"
            >
              <Table className="h-5 w-5 mr-2" />
              Gérer les tables
            </button>
            
            <button
              onClick={() => setShowGuestMessages(true)}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-lg transform hover:scale-105"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Messages & Boissons
            </button>
            
            <button
              onClick={() => setActiveTab('templates')}
              className="bg-gradient-to-r from-rose-500 to-rose-600 text-white p-4 rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-lg transform hover:scale-105"
            >
              <Eye className="h-5 w-5 mr-2" />
              Voir mes templates
            </button>
          </div>
        </div>

        {/* Template sélectionné */}
        {selectedTemplate && (
          <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 p-6">
            <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-6">
              Template sélectionné
            </h3>
            <div className="bg-gradient-to-r from-amber-50 to-rose-50/30 rounded-xl p-6 border border-amber-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">{selectedTemplate.name}</h4>
                  <p className="text-slate-600 mb-4">{selectedTemplate.title}</p>
                  <div className="flex items-center space-x-4 text-sm text-slate-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{selectedTemplate.eventDate}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{selectedTemplate.eventTime}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleEditTemplate(selectedTemplate)}
                    className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-all duration-300 font-semibold flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Personnaliser
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activité récente */}
        <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 p-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-6">
            Activité récente
          </h3>
          <div className="space-y-4">
            {guests.slice(0, 5).map((guest, index) => (
              <div
                key={guest.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-amber-50/30 rounded-xl border border-neutral-200/50 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg ${
                    guest.etat === 'couple' 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500' 
                      : 'bg-gradient-to-r from-amber-500 to-orange-500'
                  }`}>
                    {guest.nom.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-slate-900">{guest.nom}</p>
                    <p className="text-sm text-slate-600">Table: {guest.table}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  guest.confirmed 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {guest.confirmed ? 'Confirmé' : 'En attente'}
                </span>
              </div>
            ))}
            
            {guests.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-neutral-500 mb-2">Aucun invité ajouté</h4>
                <p className="text-neutral-400 mb-6">Commencez par ajouter vos premiers invités</p>
                <button
                  onClick={openAddGuestModal}
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
  };

  const renderTemplates = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Mes Templates
          </h3>
          <p className="text-slate-600 mt-1">Gérez vos modèles d'invitation personnalisés</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userModels.map((template, index) => (
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
              <div className="absolute bottom-4 left-4 right-4">
                <h4 className="text-white font-bold text-lg drop-shadow-lg">{template.title}</h4>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h5 className="font-semibold text-slate-900">{template.name}</h5>
                  <p className="text-sm text-slate-600 capitalize">{template.category}</p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const link = generateInvitationLink(template.id, guests[0]?.id || 'demo');
                    navigator.clipboard.writeText(link);
                    alert('Lien copié dans le presse-papiers !');
                  }}
                  className="flex-1 bg-purple-100 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-200 transition-all duration-200 font-medium flex items-center justify-center text-sm"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Aperçu
                </button>
                <button
                  onClick={() => handleEditTemplate(template)}
                  className="flex-1 bg-amber-100 text-amber-700 px-3 py-2 rounded-lg hover:bg-amber-200 transition-all duration-200 font-medium flex items-center justify-center text-sm"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Modifier
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="flex-1 bg-rose-100 text-rose-700 px-3 py-2 rounded-lg hover:bg-rose-200 transition-all duration-200 font-medium flex items-center justify-center text-sm"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {userModels.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-500 mb-2">Aucun template personnalisé</h3>
          <p className="text-neutral-400 mb-6">Créez votre premier template en sélectionnant un modèle</p>
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

  const renderGuests = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Gestion des Invités
          </h3>
          <p className="text-slate-600 mt-1">Ajoutez et gérez vos invités</p>
        </div>
        
        {subscription && subscription.plan === 'free' && (
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200/50">
            <div className="flex items-center">
              <Crown className="h-5 w-5 text-amber-600 mr-2" />
              <div>
                <p className="text-amber-800 font-semibold text-sm">Plan Gratuit</p>
                <p className="text-amber-700 text-xs">{getRemainingInvites()} invitations restantes</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Formulaire d'ajout d'invité */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">Liste des invités ({guests.length})</h4>
          <p className="text-slate-600 text-sm">Gérez vos invités et leurs confirmations</p>
        </div>
        <button
          onClick={openAddGuestModal}
          className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold flex items-center shadow-glow-amber transform hover:scale-105"
        >
          <Plus className="h-5 w-5 mr-2" />
          Ajouter un invité
        </button>
      </div>

      {/* Liste des invités */}
      <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 overflow-hidden">
        <div className="p-6 border-b border-neutral-200/50 bg-gradient-to-r from-neutral-50 to-amber-50/30">
          <h4 className="text-lg font-semibold text-slate-900">Liste des invités ({guests.length})</h4>
        </div>
        
        <div className="divide-y divide-neutral-200/50">
          {guests.map((guest, index) => (
            <div
              key={guest.id}
              className="p-6 hover:bg-gradient-to-r hover:from-neutral-50/50 hover:to-amber-50/30 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-lg ${
                    guest.etat === 'couple' 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500' 
                      : 'bg-gradient-to-r from-amber-500 to-orange-500'
                  }`}>
                    {guest.nom.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div className="ml-4">
                    <h5 className="font-semibold text-slate-900 text-lg">{guest.nom}</h5>
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <span>Table: {guest.table}</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        guest.etat === 'couple' 
                          ? 'bg-pink-100 text-pink-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {guest.etat === 'couple' ? 'Couple (2 places)' : 'Simple (1 place)'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    guest.confirmed 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {guest.confirmed ? 'Confirmé' : 'En attente'}
                  </span>
                  
                  <button
                    onClick={() => {
                      const link = generateInvitationLink(userModels[0]?.id || 'demo', guest.id);
                      navigator.clipboard.writeText(link);
                      alert('Lien d\'invitation copié !');
                    }}
                    className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                    title="Copier le lien d'invitation"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => sendWhatsAppInvitation(guest)}
                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                    title="Envoyer par WhatsApp"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => sendEmailInvitation(guest)}
                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                    title="Envoyer par Email"
                  >
                    <Mail className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteGuest(guest.id)}
                    className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                    title="Supprimer l'invité"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {guests.length === 0 && (
          <div className="p-12 text-center">
            <Users className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-500 mb-2">Aucun invité ajouté</h3>
            <p className="text-neutral-400">Commencez par ajouter vos premiers invités</p>
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
        guests={guests}
        onSaveTable={handleSaveTable}
        onDeleteTable={handleDeleteTable}
        isLoading={isLoading}
      />
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'templates':
        return renderTemplates();
      case 'guests':
        return renderGuests();
      case 'tables':
        return renderTables();
      case 'messages':
        return (
          <div className="animate-fade-in">
            <div className="text-center py-12">
              <MessageCircle className="h-16 w-16 text-amber-500 mx-auto mb-4 animate-glow" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Messages & Boissons des Invités</h3>
              <p className="text-slate-600 mb-6">Consultez tous les messages de vœux et choix de boissons de vos invités</p>
              <button
                onClick={() => setShowGuestMessages(true)}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-4 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-glow-amber transform hover:scale-105 flex items-center mx-auto"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Voir tous les messages
              </button>
            </div>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-amber-50/30 to-purple-50/20 dark:from-slate-900 dark:via-slate-800/30 dark:to-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-neutral-50/95 via-amber-50/90 to-neutral-50/95 dark:from-slate-800/95 dark:via-slate-700/90 dark:to-slate-800/95 backdrop-blur-xl shadow-luxury border-b border-amber-200/30 dark:border-slate-600/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center text-amber-600 hover:text-amber-700 transition-all duration-300 group"
              >
                <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                Retour à l'accueil
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Crown className="h-8 w-8 text-amber-500 animate-glow drop-shadow-lg" />
                  <div className="absolute inset-0 animate-pulse">
                    <Crown className="h-8 w-8 text-amber-300 opacity-30" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-amber-700 to-slate-900 dark:from-slate-100 dark:via-amber-300 dark:to-slate-100 bg-clip-text text-transparent">
                    Dashboard Furaha-Event
                  </h1>
                  {userData && (
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      Bienvenue, {userData.firstName} {userData.lastName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowGuestMessages(true)}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-semibold flex items-center shadow-lg transform hover:scale-105"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Messages
              </button>
              
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700 rounded-lg transition-all duration-200"
              >
                <Settings className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-glow-amber transform hover:scale-105"
              >
                {userData && (
                  <div className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center text-amber-400 font-bold text-xs">
                    {userData.firstName[0]}{userData.lastName[0]}
                  </div>
                )}
                <span className="hidden sm:block">Profil</span>
              </button>
              
              <button
                onClick={onLogout}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-lg transition-all duration-200"
                title="Se déconnecter"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 shadow-lg border-b border-neutral-200/50 dark:border-slate-600/50 sticky top-16 z-40">
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
        {renderTabContent()}
      </main>

      {/* Modals */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={subscription?.plan || 'free'}
        remainingInvites={getRemainingInvites()}
      />

      <DashboardSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <GuestMessagesViewer
        isOpen={showGuestMessages}
        onClose={() => setShowGuestMessages(false)}
      />

      {/* Modal d'ajout d'invité */}
      {showAddGuestModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-luxury max-w-md w-full animate-slide-up">
            <div className="p-6 border-b border-neutral-200/50 bg-gradient-to-r from-neutral-50 to-amber-50/30">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">Ajouter un invité</h3>
                <button
                  onClick={() => setShowAddGuestModal(false)}
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
                    value={newGuest.nom}
                    onChange={(e) => setNewGuest({ ...newGuest, nom: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    placeholder="Ex: Sophie Martin"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Table
                  </label>
                  <select
                    value={newGuest.table}
                    onChange={(e) => setNewGuest({ ...newGuest, table: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                  >
                    <option value="">Sélectionner une table</option>
                    <option value="Non assigné">Non assigné</option>
                    {tables.map((table) => (
                      <option key={table.id} value={table.name}>
                        {table.name} ({table.seats} places)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Statut
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewGuest({ ...newGuest, etat: 'simple' })}
                      className={`flex items-center justify-center px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                        newGuest.etat === 'simple'
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                          : 'border-neutral-200 hover:border-emerald-300 text-slate-600'
                      }`}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Simple
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setNewGuest({ ...newGuest, etat: 'couple' })}
                      className={`flex items-center justify-center px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                        newGuest.etat === 'couple'
                          ? 'border-rose-400 bg-rose-50 text-rose-700'
                          : 'border-neutral-200 hover:border-rose-300 text-slate-600'
                      }`}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Couple
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAddGuestModal(false)}
                  className="flex-1 px-4 py-3 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-all duration-200 font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddGuest}
                  disabled={isAddingGuest || !newGuest.nom.trim()}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-glow-amber transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isAddingGuest ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Ajout...
                    </div>
                  ) : (
                    'Ajouter'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;