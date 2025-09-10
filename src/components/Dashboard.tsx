import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Settings, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Share2, 
  Eye,
  User,
  Mail,
  Phone,
  MapPin,
  Crown,
  Sparkles,
  Heart,
  Gift,
  GraduationCap,
  X,
  Save,
  Check,
  MessageCircle,
  Copy,
  ExternalLink
} from 'lucide-react';
import UserProfile from './UserProfile';
import TemplateCustomization from './TemplateCustomization';
import TableManagement from './TableManagement';
import { useTemplates } from '../hooks/useTemplates';
import { UserData } from '../hooks/useAuth';
import { collection, doc, setDoc, getDocs, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

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
  assignedGuests: Guest[];
}

interface DashboardProps {
  selectedTemplate?: TemplateData | null;
  userData: UserData;
  onLogout: () => void;
}

const Dashboard = ({ selectedTemplate, userData, onLogout }: DashboardProps) => {
  const { 
    userInvites, 
    userModels, 
    createInvite, 
    updateInvite, 
    deleteInvite, 
    updateUserModel,
    isLoading: templatesLoading 
  } = useTemplates();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCustomization, setShowCustomization] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<TemplateData | null>(selectedTemplate || null);
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userTemplateForCustomization, setUserTemplateForCustomization] = useState<TemplateData | null>(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  
  // États pour la gestion des invités
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingInvite, setEditingInvite] = useState<Guest | null>(null);
  const [inviteFormData, setInviteFormData] = useState({
    nom: '',
    table: '',
    etat: 'simple' as 'simple' | 'couple',
    confirmed: false,
  });

  // Charger les tables depuis Firestore
  const loadTables = async () => {
    if (!userData?.id) return;
    
    try {
      setIsLoadingTables(true);
      const tablesRef = collection(db, 'users', userData.id, 'Tables');
      const querySnapshot = await getDocs(tablesRef);
      
      const loadedTables: Table[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loadedTables.push({
          id: parseInt(doc.id.replace('table_', '')),
          name: data.name,
          seats: data.seats,
          assignedGuests: data.assignedGuests || []
        });
      });
      
      setTables(loadedTables.sort((a, b) => a.id - b.id));
    } catch (error) {
      console.error('Erreur lors du chargement des tables:', error);
    } finally {
      setIsLoadingTables(false);
    }
  };

  // Sauvegarder une table dans Firestore
  const saveTableToFirestore = async (table: Table) => {
    if (!userData?.id) return;
    
    try {
      const tableRef = doc(db, 'users', userData.id, 'Tables', `table_${table.id}`);
      await setDoc(tableRef, {
        name: table.name,
        seats: table.seats,
        assignedGuests: table.assignedGuests,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la table:', error);
      throw error;
    }
  };

  // Supprimer une table de Firestore
  const deleteTableFromFirestore = async (tableId: number) => {
    if (!userData?.id) return;
    
    try {
      const tableRef = doc(db, 'users', userData.id, 'Tables', `table_${tableId}`);
      await deleteDoc(tableRef);
    } catch (error) {
      console.error('Erreur lors de la suppression de la table:', error);
      throw error;
    }
  };

  // Charger le template actuel depuis les modèles utilisateur
  const loadCurrentTemplate = async () => {
    if (!userData?.id || userModels.length === 0) return;
    
    try {
      setIsLoadingTemplate(true);
      // Prendre le premier modèle utilisateur comme template actuel
      const userModel = userModels[0];
      const templateData: TemplateData = {
        id: userModel.id,
        name: userModel.name,
        category: userModel.category,
        backgroundImage: userModel.backgroundImage,
        title: userModel.title,
        invitationText: userModel.invitationText,
        eventDate: userModel.eventDate,
        eventTime: userModel.eventTime,
        eventLocation: userModel.eventLocation,
        drinkOptions: userModel.drinkOptions,
        features: userModel.features,
        colors: userModel.customizations?.colors,
        isPersonalized: true,
        createdAt: userModel.createdAt?.toDate().toISOString()
      };
      
      setCurrentTemplate(templateData);
      console.log('Template actuel chargé depuis Firebase:', templateData);
    } catch (error) {
      console.error('Erreur lors du chargement du template actuel:', error);
    } finally {
      setIsLoadingTemplate(false);
    }
  };

  // Charger le template actuel quand les modèles utilisateur changent
  useEffect(() => {
    if (userModels.length > 0 && !currentTemplate) {
      loadCurrentTemplate();
    }
  }, [userModels, userData?.id]);

  // Charger le template sélectionné au montage
  useEffect(() => {
    if (selectedTemplate && !currentTemplate) {
      setCurrentTemplate(selectedTemplate);
    }
  }, [selectedTemplate]);

  // Charger les tables au montage du composant
  useEffect(() => {
    if (userData?.id) {
      loadTables();
    }
  }, [userData?.id]);

  // Mettre à jour les tables disponibles quand les tables changent
  useEffect(() => {
    setAvailableTables(tables);
  }, [tables]);

  // Charger les invités depuis Firestore
  const guests: Guest[] = userInvites.map(invite => ({
    id: invite.id,
    nom: invite.nom,
    table: invite.table,
    etat: invite.etat,
    confirmed: invite.confirmed,
  }));

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'invitations', label: 'Gestion des invitations', icon: Users },
    { id: 'tables', label: 'Plan de table', icon: MapPin },
    { id: 'profile', label: 'Mon profil', icon: User },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  const handleCustomizeTemplate = () => {
    console.log('Modèles utilisateur disponibles:', userModels);
    console.log('Template actuel:', currentTemplate);
    
    if (currentTemplate && userModels.length > 0) {
      // Utiliser le premier modèle utilisateur disponible
      const userModel = userModels[0];
      console.log('Utilisation du modèle utilisateur:', userModel);
      
      setUserTemplateForCustomization({
        id: userModel.id,
        name: userModel.name,
        category: userModel.category,
        backgroundImage: userModel.backgroundImage,
        title: userModel.title,
        invitationText: userModel.invitationText,
        eventDate: userModel.eventDate,
        eventTime: userModel.eventTime,
        eventLocation: userModel.eventLocation,
        drinkOptions: userModel.drinkOptions,
        features: userModel.features,
        colors: userModel.customizations?.colors,
        isPersonalized: true
      });
      setShowCustomization(true);
    } else if (currentTemplate) {
      // Fallback vers le template actuel si pas de modèle utilisateur
      setUserTemplateForCustomization(currentTemplate);
      setShowCustomization(true);
    }
  };

  const handleSaveCustomization = (customizedTemplate: TemplateData) => {
    console.log('Sauvegarde de la personnalisation:', customizedTemplate);
    
    const saveCustomization = async () => {
      try {
        setIsLoading(true);
        
        // Sauvegarder les modifications dans le modèle utilisateur
        if (userTemplateForCustomization && userModels.length > 0) {
          const userModel = userModels[0];
          await updateUserModel(userModel.id, {
            name: customizedTemplate.name,
            title: customizedTemplate.title,
            invitationText: customizedTemplate.invitationText,
            eventDate: customizedTemplate.eventDate,
            eventTime: customizedTemplate.eventTime,
            eventLocation: customizedTemplate.eventLocation,
            drinkOptions: customizedTemplate.drinkOptions,
            backgroundImage: customizedTemplate.backgroundImage,
            colors: customizedTemplate.colors,
            customizations: {
              ...userModel.customizations,
              colors: customizedTemplate.colors || userModel.customizations?.colors
            }
          });
          
          console.log('Modèle utilisateur mis à jour dans Firebase');
        }
        
        // Mettre à jour le template actuel dans l'état local
        setCurrentTemplate(customizedTemplate);
        console.log('Template actuel mis à jour dans l\'état local:', customizedTemplate);
        
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('Erreur lors de la sauvegarde des modifications');
      } finally {
        setIsLoading(false);
      }
    };
    
    saveCustomization();
    
    setUserTemplateForCustomization(null);
    setShowCustomization(false);
  };

  // Fonction pour forcer le rechargement du template
  const refreshCurrentTemplate = async () => {
    if (userModels.length > 0) {
      const userModel = userModels[0];
      const templateData: TemplateData = {
        id: userModel.id,
        name: userModel.name,
        category: userModel.category,
        backgroundImage: userModel.backgroundImage,
        title: userModel.title,
        invitationText: userModel.invitationText,
        eventDate: userModel.eventDate,
        eventTime: userModel.eventTime,
        eventLocation: userModel.eventLocation,
        drinkOptions: userModel.drinkOptions,
        features: userModel.features,
        colors: userModel.customizations?.colors,
        isPersonalized: true,
        createdAt: userModel.createdAt?.toDate().toISOString()
      };
      
      setCurrentTemplate(templateData);
    }
  };

  const openInviteModal = (invite?: Guest) => {
    if (invite) {
      setEditingInvite(invite);
      setInviteFormData({
        nom: invite.nom,
        table: invite.table,
        etat: invite.etat,
        confirmed: invite.confirmed,
      });
    } else {
      setEditingInvite(null);
      setInviteFormData({
        nom: '',
        table: '',
        etat: 'simple',
        confirmed: false,
      });
    }
    setShowInviteModal(true);
  };

  const closeInviteModal = () => {
    setShowInviteModal(false);
    setEditingInvite(null);
    setInviteFormData({
      nom: '',
      table: '',
      etat: 'simple',
      confirmed: false,
    });
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingInvite) {
        // Modifier un invité existant
        await updateInvite(editingInvite.id, inviteFormData);
      } else {
        // Créer un nouvel invité
        await createInvite(inviteFormData);
      }
      closeInviteModal();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'invité:', error);
      alert('Erreur lors de la sauvegarde de l\'invité');
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet invité ?')) {
      try {
        await deleteInvite(inviteId);
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'invité:', error);
        alert('Erreur lors de la suppression de l\'invité');
      }
    }
  };

  const handleShareWhatsApp = (guest: Guest) => {
    const baseUrl = window.location.origin;
    const invitationUrl = `${baseUrl}/invitation/${guest.id}`;
    console.log('URL d\'invitation WhatsApp:', invitationUrl);
    const message = `Bonjour ${guest.nom}, vous êtes invité(e) à notre événement ! Voici votre invitation personnalisée : ${invitationUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareEmail = (guest: Guest) => {
    const baseUrl = window.location.origin;
    const invitationUrl = `${baseUrl}/invitation/${guest.id}`;
    console.log('URL d\'invitation Email:', invitationUrl);
    const subject = `Invitation à notre événement`;
    const body = `Bonjour ${guest.nom},\n\nVous êtes invité(e) à notre événement !\n\nVoici votre invitation personnalisée :\n${invitationUrl}\n\nNous espérons vous voir bientôt !\n\nCordialement`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const handleCopyLink = async (guest: Guest) => {
    const baseUrl = window.location.origin;
    const invitationUrl = `${baseUrl}/invitation/${guest.id}`;
    console.log('URL d\'invitation à copier:', invitationUrl);
    try {
      await navigator.clipboard.writeText(invitationUrl);
      alert('Lien copié dans le presse-papiers !');
    } catch (error) {
      // Fallback pour les navigateurs qui ne supportent pas l'API clipboard
      const textArea = document.createElement('textarea');
      textArea.value = invitationUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Lien copié dans le presse-papiers !');
    }
  };

  const handlePreviewInvitation = (guest: Guest) => {
    const baseUrl = window.location.origin;
    const invitationUrl = `${baseUrl}/invitation/${guest.id}`;
    console.log('URL d\'invitation pour prévisualisation:', invitationUrl);
    window.open(invitationUrl, '_blank');
  };
  
  const getEtatColor = (etat: string) => {
    switch (etat) {
      case 'couple':
        return 'bg-purple-100 text-purple-800';
      case 'simple':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getEtatText = (etat: string) => {
    switch (etat) {
      case 'couple':
        return 'Couple';
      case 'simple':
        return 'Simple';
      default:
        return 'Inconnu';
    }
  };

  if (showCustomization && currentTemplate) {
    return (
      <TemplateCustomization
        template={userTemplateForCustomization || currentTemplate}
        onBack={() => {
          setShowCustomization(false);
          setUserTemplateForCustomization(null);
        }}
        onSave={handleSaveCustomization}
      />
    );
  }

  const renderOverview = () => (
    <div className="animate-fade-in">
      {/* En-tête de bienvenue */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-amber-50 via-rose-50/30 to-amber-50 rounded-2xl p-6 border border-amber-200/50 shadow-luxury">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-glow-amber mr-4">
                {userData.firstName[0]}{userData.lastName[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Bienvenue, {userData.firstName} !
                </h1>
                <p className="text-slate-600 mt-1">Gérez vos événements et invitations en toute simplicité</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <Crown className="h-8 w-8 text-amber-500 animate-glow" />
              <Sparkles className="h-6 w-6 text-rose-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200/50 shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-amber-500 rounded-xl shadow-glow-amber">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-amber-700 text-sm font-medium">Total Invités</p>
              <p className="text-2xl font-bold text-amber-900">{guests.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200/50 shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-emerald-500 rounded-xl">
              <Check className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-emerald-700 text-sm font-medium">Confirmés</p>
              <p className="text-2xl font-bold text-emerald-900">
                {guests.filter(g => g.confirmed).length}
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
              <p className="text-purple-700 text-sm font-medium">En attente</p>
              <p className="text-2xl font-bold text-purple-900">
                {guests.filter(g => !g.confirmed).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl p-6 border border-rose-200/50 shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-rose-500 rounded-xl">
              <X className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-rose-700 text-sm font-medium">Déclinés</p>
              <p className="text-2xl font-bold text-rose-900">
                0
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Template actuel */}
      {currentTemplate && (
        <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Template Actuel
              </h2>
              <p className="text-slate-600 mt-1">{currentTemplate.name}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleCustomizeTemplate}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold flex items-center shadow-glow-amber transform hover:scale-105"
                disabled={!currentTemplate && userModels.length === 0}
              >
                <Edit className="h-4 w-4 mr-2" />
                Personnaliser
              </button>
              <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 font-semibold flex items-center shadow-glow-purple transform hover:scale-105">
                <Eye className="h-4 w-4 mr-2" />
                Prévisualiser
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <img
                src={currentTemplate.backgroundImage}
                alt={currentTemplate.name}
                className="w-full h-48 object-cover rounded-xl shadow-lg"
              />
            </div>
            <div className="md:col-span-2">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Détails de l'événement</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-slate-600">
                      <Calendar className="h-4 w-4 mr-2 text-amber-500" />
                      {currentTemplate.eventDate} à {currentTemplate.eventTime}
                    </div>
                    <div className="flex items-center text-slate-600">
                      <MapPin className="h-4 w-4 mr-2 text-amber-500" />
                      {currentTemplate.eventLocation}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Titre</h4>
                  <p className="text-slate-600">{currentTemplate.title}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Message d'invitation</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {currentTemplate.invitationText.length > 150 
                      ? currentTemplate.invitationText.substring(0, 150) + '...'
                      : currentTemplate.invitationText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => setActiveTab('invitations')}
          className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200/50 hover:shadow-glow-amber transition-all duration-300 transform hover:scale-105 text-left group"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 bg-amber-500 rounded-xl shadow-glow-amber group-hover:scale-110 transition-transform duration-300">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-amber-900">Gérer les invités</h3>
              <p className="text-amber-700 text-sm">Ajouter, modifier ou supprimer des invités</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('tables')}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200/50 hover:shadow-glow-purple transition-all duration-300 transform hover:scale-105 text-left group"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 bg-purple-500 rounded-xl shadow-glow-purple group-hover:scale-110 transition-transform duration-300">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-purple-900">Plan de table</h3>
              <p className="text-purple-700 text-sm">Organiser les places de vos invités</p>
            </div>
          </div>
        </button>

        <button
          onClick={handleCustomizeTemplate}
          className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200/50 hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-left group"
          disabled={!currentTemplate}
        >
          <div className="flex items-center mb-4">
            <div className="p-3 bg-emerald-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-emerald-900">Personnaliser</h3>
              <p className="text-emerald-700 text-sm">Modifier votre template d'invitation</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  const renderInvitations = () => (
    <div className="animate-fade-in">
      {/* En-tête avec bouton d'ajout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Gestion des Invitations
          </h2>
          <p className="text-slate-600 mt-1">Gérez votre liste d'invités pour l'événement</p>
        </div>
        
        <button
          onClick={() => openInviteModal()}
          className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold flex items-center shadow-glow-amber hover:shadow-luxury transform hover:scale-105"
        >
          <Plus className="h-5 w-5 mr-2" />
          Ajouter un invité
        </button>
      </div>

      {/* Statistiques des invités */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200/50 shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-amber-500 rounded-xl shadow-glow-amber">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-amber-700 text-sm font-medium">Total Invités</p>
              <p className="text-2xl font-bold text-amber-900">{guests.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200/50 shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-emerald-500 rounded-xl">
              <Check className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-emerald-700 text-sm font-medium">Confirmés</p>
              <p className="text-2xl font-bold text-emerald-900">
                {guests.filter(g => g.confirmed).length}
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
              <p className="text-purple-700 text-sm font-medium">En attente</p>
              <p className="text-2xl font-bold text-purple-900">
                {guests.filter(g => !g.confirmed).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl p-6 border border-rose-200/50 shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-rose-500 rounded-xl">
              <X className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-rose-700 text-sm font-medium">Déclinés</p>
              <p className="text-2xl font-bold text-rose-900">
                0
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des invités */}
      <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 overflow-hidden">
        {/* En-tête du tableau - Desktop */}
        <div className="hidden md:grid md:grid-cols-6 gap-4 p-6 bg-gradient-to-r from-neutral-50 to-amber-50/30 border-b border-neutral-200/50">
          <div className="font-semibold text-slate-700">Nom</div>
          <div className="font-semibold text-slate-700">Table</div>
          <div className="font-semibold text-slate-700">État</div>
          <div className="font-semibold text-slate-700">Confirmé</div>
          <div className="font-semibold text-slate-700"></div>
          <div className="font-semibold text-slate-700 text-right">Actions</div>
        </div>

        {/* Corps du tableau */}
        <div className="divide-y divide-neutral-200/50">
          {guests.length > 0 ? (
            guests.map((guest, index) => (
              <div
                key={guest.id}
                className="animate-slide-up hover:bg-gradient-to-r hover:from-neutral-50/50 hover:to-amber-50/30 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Version Desktop */}
                <div className="hidden md:grid md:grid-cols-6 gap-4 p-6 items-center">
                  <div className="font-medium text-slate-900">{guest.nom}</div>
                  <div className="text-slate-600">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800">
                      {guest.table || 'Non assigné'}
                    </span>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEtatColor(guest.etat)}`}>
                      {getEtatText(guest.etat)}
                    </span>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${guest.confirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {guest.confirmed ? 'Oui' : 'Non'}
                    </span>
                  </div>
                  <div></div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handlePreviewInvitation(guest)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                      title="Prévisualiser l'invitation"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleShareWhatsApp(guest)}
                      className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                      title="Partager sur WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleShareEmail(guest)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                      title="Envoyer par email"
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleCopyLink(guest)}
                      className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                      title="Copier le lien"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openInviteModal(guest)}
                      className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteInvite(guest.id)}
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
                    <div>
                      <h4 className="font-medium text-slate-900 text-lg">{guest.nom}</h4>
                      <div className="flex items-center mt-1 space-x-3">
                        <span className="text-slate-600 text-sm">Table: {guest.table || 'Non assigné'}</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEtatColor(guest.etat)}`}>
                          {getEtatText(guest.etat)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="mb-3 space-y-1">
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Confirmé:</span> {guest.confirmed ? 'Oui' : 'Non'}
                        </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handlePreviewInvitation(guest)}
                      className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-all duration-200 font-medium flex items-center justify-center text-sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Voir
                    </button>
                    <button
                      onClick={() => openInviteModal(guest)}
                      className="bg-amber-100 text-amber-700 px-3 py-2 rounded-lg hover:bg-amber-200 transition-all duration-200 font-medium flex items-center justify-center text-sm"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </button>
                  </div>
                  <button
                    onClick={() => handleDeleteInvite(guest.id)}
                    className="w-full bg-rose-100 text-rose-700 px-3 py-2 rounded-lg hover:bg-rose-200 transition-all duration-200 font-medium flex items-center justify-center text-sm mt-2"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Users className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-500 mb-2">Aucun invité ajouté</h3>
              <p className="text-neutral-400 mb-6">Commencez par ajouter votre premier invité</p>
              <button
                onClick={() => openInviteModal()}
                className="bg-amber-500 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-all duration-300 font-semibold"
              >
                Ajouter un invité
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal pour ajouter/modifier un invité */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full animate-slide-up relative">
            {/* Header simple */}
            <div className="p-6 pb-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  Ajouter un invité
                </h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleInviteSubmit} className="px-6 pb-6">
              <div className="space-y-4">
                {/* Nom complet */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={inviteFormData.nom}
                    onChange={(e) => setInviteFormData({ ...inviteFormData, nom: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50"
                    placeholder="Ex: Jean Dupont"
                    required
                  />
                </div>

                {/* Numéro de table */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Table
                  </label>
                  <select
                    value={inviteFormData.table}
                    onChange={(e) => setInviteFormData({ ...inviteFormData, table: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50"
                  >
                    <option value="">Sélectionner une table</option>
                    {availableTables.map((table) => {
                      const occupiedSeats = guests.filter(guest => guest.table === table.name).length;
                      return (
                        <option key={table.id} value={table.name}>
                          {table.name} ({occupiedSeats}/{table.seats})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    État
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setInviteFormData({ ...inviteFormData, etat: 'simple' })}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        inviteFormData.etat === 'simple'
                          ? 'border-amber-500 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 shadow-glow-amber'
                          : 'bg-gray-100 text-gray-600 border-gray-300 hover:border-green-300'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center space-x-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">Simple</span>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setInviteFormData({ ...inviteFormData, etat: 'couple' })}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        inviteFormData.etat === 'couple'
                          ? 'bg-pink-100 text-pink-800 border-pink-300'
                          : 'bg-gray-100 text-gray-600 border-gray-300 hover:border-pink-300'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Heart className="h-4 w-4" />
                        <span className="font-medium">Couple</span>
                        <span className="text-xs mt-1 opacity-75">2 personnes</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeInviteModal}
                  className="flex-1 px-6 py-4 border-2 border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-300 font-semibold transform hover:scale-105"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-all duration-200 font-medium"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  {isLoading ? (
                    <div className="relative flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Sauvegarde...
                    </div>
                  ) : (
                    <span className="relative flex items-center justify-center">
                      <Save className="h-4 w-4 inline mr-2" />
                      {editingInvite ? 'Modifier' : 'Ajouter'}
                      <Sparkles className="h-4 w-4 ml-2" />
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderTables = () => (
    <TableManagement 
      tables={tables} 
      setTables={setTables}
      onSaveTable={saveTableToFirestore}
      onDeleteTable={deleteTableFromFirestore}
      isLoading={isLoadingTables}
    />
  );

  const renderProfile = () => (
    <UserProfile userData={userData} onLogout={onLogout} />
  );

  const renderSettings = () => (
    <div className="animate-fade-in">
      <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 p-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-6">
          Paramètres
        </h2>
        <p className="text-slate-600">Fonctionnalité en cours de développement...</p>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'invitations':
        return renderInvitations();
      case 'tables':
        return renderTables();
      case 'profile':
        return renderProfile();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-amber-50/30 to-purple-50/20 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-r from-amber-200/10 to-purple-200/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-gradient-to-r from-rose-200/10 to-amber-200/10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-neutral-200/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-rose-500 rounded-xl flex items-center justify-center shadow-glow-amber">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div className="hidden md:block">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      InviteElegance
                    </h1>
                  </div>
                </div>
                <div className="hidden md:block w-px h-6 bg-neutral-300"></div>
                <div className="hidden md:block">
                  <span className="text-slate-600 text-sm">Dashboard</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {userData.firstName[0]}{userData.lastName[0]}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-slate-900">{userData.firstName} {userData.lastName}</p>
                    <p className="text-xs text-slate-500">{userData.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-luxury border border-neutral-200/50 overflow-hidden sticky top-24">
                <div className="p-6 bg-gradient-to-r from-amber-50 to-rose-50/30 border-b border-neutral-200/50">
                  <h3 className="text-lg font-semibold text-slate-900">Navigation</h3>
                </div>
                <nav className="p-4">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300 mb-2 text-left ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-glow-amber transform scale-105'
                            : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700 hover:transform hover:scale-102'
                        }`}
                      >
                        <IconComponent className="h-5 w-5 mr-3" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;