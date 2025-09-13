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
  Upload,
  Search,
  Filter,
  MoreVertical,
  Crown,
  Sparkles,
  Heart,
  Gift,
  GraduationCap,
  Mail,
  Share2,
  Copy,
  ExternalLink,
  MessageCircle,
  Send
} from 'lucide-react';
import { UserData } from '../hooks/useAuth';
import UserProfile from './UserProfile';
import TableManagement from './TableManagement';
import TemplateCustomization from './TemplateCustomization';
import DashboardSettings from './DashboardSettings';
import UpgradeModal from './UpgradeModal';
import { useTemplates } from '../hooks/useTemplates';
import { useSubscription } from '../hooks/useSubscription';
import * as XLSX from 'xlsx';

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
    userModels, 
    userInvites, 
    userTables,
    createInvite, 
    updateInvite, 
    deleteInvite,
    createTable,
    updateTable,
    deleteTable,
    isLoading,
    error,
    refreshUserData
  } = useTemplates();
  
  const { subscription, canCreateInvite, getRemainingInvites } = useSubscription();

  const [activeTab, setActiveTab] = useState('overview');
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [customizingTemplate, setCustomizingTemplate] = useState<TemplateData | null>(null);
  
  // États pour la gestion des invités
  const [guests, setGuests] = useState<Guest[]>([]);
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [guestFormData, setGuestFormData] = useState({
    nom: '',
    table: '',
    etat: 'simple' as 'simple' | 'couple'
  });
  
  // États pour la gestion des tables
  const [tables, setTables] = useState<Table[]>([]);
  
  // États pour la recherche et les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);

  // États pour les liens d'invitation personnalisés
  const [showInvitationLinkModal, setShowInvitationLinkModal] = useState(false);
  const [selectedGuestForLink, setSelectedGuestForLink] = useState<Guest | null>(null);
  const [invitationMessage, setInvitationMessage] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  // Charger les données au montage du composant
  useEffect(() => {
    if (userInvites.length > 0) {
      setGuests(userInvites);
    }
    if (userTables.length > 0) {
      setTables(userTables);
    }
  }, [userInvites, userTables]);

  // Gérer le template sélectionné
  useEffect(() => {
    if (selectedTemplate && !showCustomization) {
      setCustomizingTemplate(selectedTemplate);
      setShowCustomization(true);
    }
  }, [selectedTemplate]);

  // Messages d'invitation prédéfinis
  const invitationMessages = [
    "🎉 Vous êtes cordialement invité(e) à notre événement spécial ! Votre présence nous ferait un immense plaisir.",
    "✨ Nous avons l'honneur de vous inviter à célébrer avec nous ce moment unique. Réservez votre place dès maintenant !",
    "💫 Rejoignez-nous pour une soirée inoubliable ! Votre invitation personnalisée vous attend.",
    "🌟 Vous êtes notre invité(e) d'honneur ! Découvrez tous les détails de notre événement en cliquant sur le lien.",
    "🎊 Une invitation spéciale rien que pour vous ! Nous espérons vous voir parmi nous pour cette célébration.",
    "💝 Votre présence est le plus beau des cadeaux ! Consultez votre invitation personnalisée.",
    "🥂 Levons nos verres ensemble ! Votre invitation exclusive vous attend, ne la manquez pas.",
    "🎈 Préparez-vous à vivre des moments magiques ! Votre place est réservée, il ne manque plus que vous."
  ];

  const openInvitationLinkModal = (guest: Guest) => {
    setSelectedGuestForLink(guest);
    setInvitationMessage(invitationMessages[Math.floor(Math.random() * invitationMessages.length)]);
    setGeneratedLink('');
    setLinkCopied(false);
    setShowInvitationLinkModal(true);
  };

  const generateInvitationLink = () => {
    if (!selectedGuestForLink) return;
    
    const baseUrl = window.location.origin;
    const inviteId = selectedGuestForLink.id;
    const link = `${baseUrl}/invitation/${inviteId}`;
    setGeneratedLink(link);
  };

  const copyLinkToClipboard = async () => {
    if (!generatedLink) return;
    
    try {
      await navigator.clipboard.writeText(generatedLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  const shareInvitation = () => {
    if (!generatedLink || !selectedGuestForLink) return;
    
    const shareText = `${invitationMessage}\n\n${generatedLink}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Invitation personnalisée',
        text: shareText,
        url: generatedLink
      });
    } else {
      // Fallback pour les navigateurs qui ne supportent pas l'API Web Share
      const mailtoLink = `mailto:?subject=Invitation personnalisée&body=${encodeURIComponent(shareText)}`;
      window.open(mailtoLink);
    }
  };

  const openAddGuestModal = () => {
    if (!canCreateInvite()) {
      setShowUpgradeModal(true);
      return;
    }
    
    setEditingGuest(null);
    setGuestFormData({ nom: '', table: '', etat: 'simple' });
    setShowAddGuestModal(true);
  };

  const openEditGuestModal = (guest: Guest) => {
    setEditingGuest(guest);
    setGuestFormData({
      nom: guest.nom,
      table: guest.table,
      etat: guest.etat
    });
    setShowAddGuestModal(true);
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingGuest) {
        // Modifier un invité existant
        const success = await updateInvite(editingGuest.id, {
          nom: guestFormData.nom,
          table: guestFormData.table,
          etat: guestFormData.etat
        });
        
        if (success) {
          await refreshUserData();
        }
      } else {
        // Ajouter un nouvel invité
        const inviteId = await createInvite({
          nom: guestFormData.nom,
          table: guestFormData.table,
          etat: guestFormData.etat,
          confirmed: false
        });
        
        if (inviteId) {
          await refreshUserData();
        }
      }
      
      setShowAddGuestModal(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet invité ?')) {
      const success = await deleteInvite(guestId);
      if (success) {
        await refreshUserData();
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedGuests.length === 0) return;
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedGuests.length} invité(s) ?`)) {
      for (const guestId of selectedGuests) {
        await deleteInvite(guestId);
      }
      await refreshUserData();
      setSelectedGuests([]);
    }
  };

  const exportGuestsToExcel = () => {
    const exportData = guests.map(guest => ({
      'Nom': guest.nom,
      'Table': guest.table,
      'Type': guest.etat === 'couple' ? 'Couple' : 'Simple',
      'Statut': guest.confirmed ? 'Confirmé' : 'En attente'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Invités');
    XLSX.writeFile(wb, 'liste_invites.xlsx');
  };

  const importGuestsFromExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        for (const row of jsonData as any[]) {
          if (row['Nom']) {
            await createInvite({
              nom: row['Nom'],
              table: row['Table'] || '',
              etat: row['Type'] === 'Couple' ? 'couple' : 'simple',
              confirmed: false
            });
          }
        }
        
        await refreshUserData();
        alert('Import réussi !');
      } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        alert('Erreur lors de l\'import du fichier');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.table.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'confirmed' && guest.confirmed) ||
                         (filterStatus === 'pending' && !guest.confirmed);
    return matchesSearch && matchesFilter;
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
        return Heart;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <Users className="h-6 w-6 text-white" />
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
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-rose-700 text-sm font-medium">Templates</p>
              <p className="text-2xl font-bold text-rose-900">{userModels.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Section */}
      <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Mes Templates
            </h3>
            <p className="text-slate-600 mt-1">Gérez vos modèles d'invitation personnalisés</p>
          </div>
        </div>

        {userModels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userModels.map((template, index) => {
              const IconComponent = getIconForCategory(template.category);
              return (
                <div
                  key={template.id}
                  className="group cursor-pointer animate-slide-up transform hover:scale-105 transition-all duration-500"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="bg-gradient-to-br from-neutral-50 to-amber-50/30 rounded-2xl shadow-lg hover:shadow-glow-amber transition-all duration-500 overflow-hidden backdrop-blur-sm border border-neutral-200/50 hover:border-amber-300/50">
                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={template.backgroundImage}
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute top-3 right-3">
                        <div className="bg-amber-500 rounded-full p-2 shadow-lg">
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h4 className="font-bold text-slate-900 mb-2">{template.name}</h4>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">{template.title}</p>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setCustomizingTemplate(template);
                            setShowCustomization(true);
                          }}
                          className="flex-1 bg-amber-500 text-white px-3 py-2 rounded-lg hover:bg-amber-600 transition-all duration-300 font-medium text-sm flex items-center justify-center"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </button>
                        <button className="flex-1 bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 transition-all duration-300 font-medium text-sm flex items-center justify-center">
                          <Eye className="h-4 w-4 mr-1" />
                          Aperçu
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Sparkles className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-500 mb-2">Aucun template personnalisé</h3>
            <p className="text-neutral-400 mb-6">Commencez par sélectionner un modèle à personnaliser</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderGuests = () => (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Gestion des Invités
          </h3>
          <p className="text-slate-600 mt-1">
            {guests.length} invité{guests.length > 1 ? 's' : ''} • {guests.filter(g => g.confirmed).length} confirmé{guests.filter(g => g.confirmed).length > 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={openAddGuestModal}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold flex items-center shadow-glow-amber transform hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un invité
          </button>
          
          <button
            onClick={exportGuestsToExcel}
            className="bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition-all duration-300 font-semibold flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </button>
          
          <label className="bg-purple-500 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition-all duration-300 font-semibold flex items-center cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Importer
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={importGuestsFromExcel}
              className="hidden"
            />
          </label>
          
          {selectedGuests.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-rose-500 text-white px-4 py-2 rounded-xl hover:bg-rose-600 transition-all duration-300 font-semibold flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer ({selectedGuests.length})
            </button>
          )}
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-2xl shadow-lg border border-neutral-200/50 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher un invité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-neutral-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
            >
              <option value="all">Tous les statuts</option>
              <option value="confirmed">Confirmés</option>
              <option value="pending">En attente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des invités */}
      <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 overflow-hidden">
        {/* En-tête du tableau - Desktop */}
        <div className="hidden md:grid md:grid-cols-6 gap-4 p-4 bg-gradient-to-r from-neutral-50 to-amber-50/30 border-b border-neutral-200/50">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedGuests.length === filteredGuests.length && filteredGuests.length > 0}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedGuests(filteredGuests.map(g => g.id));
                } else {
                  setSelectedGuests([]);
                }
              }}
              className="mr-3 rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="font-semibold text-slate-700">Nom de l'invité</span>
          </div>
          <div className="font-semibold text-slate-700">Table</div>
          <div className="font-semibold text-slate-700">Type</div>
          <div className="font-semibold text-slate-700">Statut</div>
          <div className="font-semibold text-slate-700">Invitation</div>
          <div className="font-semibold text-slate-700 text-right">Actions</div>
        </div>

        {/* Corps du tableau */}
        <div className="divide-y divide-neutral-200/50">
          {filteredGuests.map((guest, index) => (
            <div
              key={guest.id}
              className="animate-slide-up hover:bg-gradient-to-r hover:from-neutral-50/50 hover:to-amber-50/30 transition-all duration-300"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Version Desktop */}
              <div className="hidden md:grid md:grid-cols-6 gap-4 p-4 items-center">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedGuests.includes(guest.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedGuests([...selectedGuests, guest.id]);
                      } else {
                        setSelectedGuests(selectedGuests.filter(id => id !== guest.id));
                      }
                    }}
                    className="mr-3 rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
                  />
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
                    </div>
                  </div>
                </div>
                
                <div className="text-slate-600">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                    {guest.table || 'Non assigné'}
                  </span>
                </div>
                
                <div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    guest.etat === 'couple' 
                      ? 'bg-pink-100 text-pink-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {guest.etat === 'couple' ? 'Couple' : 'Simple'}
                  </span>
                </div>
                
                <div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    guest.confirmed 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {guest.confirmed ? 'Confirmé' : 'En attente'}
                  </span>
                </div>

                <div>
                  <button
                    onClick={() => openInvitationLinkModal(guest)}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-sm transform hover:scale-105"
                  >
                    <Share2 className="h-3 w-3 mr-1" />
                    Envoyer lien
                  </button>
                </div>
                
                <div className="flex justify-end space-x-1">
                  <button
                    onClick={() => openEditGuestModal(guest)}
                    className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                    title="Modifier"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGuest(guest.id)}
                    className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all duration-200 transform hover:scale-110"
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
                    <input
                      type="checkbox"
                      checked={selectedGuests.includes(guest.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedGuests([...selectedGuests, guest.id]);
                        } else {
                          setSelectedGuests(selectedGuests.filter(id => id !== guest.id));
                        }
                      }}
                      className="mr-3 rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
                    />
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg ${
                      guest.etat === 'couple' 
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500' 
                        : 'bg-gradient-to-r from-amber-500 to-orange-500'
                    }`}>
                      {guest.nom.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-slate-900">{guest.nom}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                          {guest.table || 'Non assigné'}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          guest.etat === 'couple' 
                            ? 'bg-pink-100 text-pink-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {guest.etat === 'couple' ? 'Couple' : 'Simple'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    guest.confirmed 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {guest.confirmed ? 'Confirmé' : 'En attente'}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => openInvitationLinkModal(guest)}
                    className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-all duration-200 font-medium flex items-center justify-center text-sm"
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Lien
                  </button>
                  <button
                    onClick={() => openEditGuestModal(guest)}
                    className="bg-amber-100 text-amber-700 px-3 py-2 rounded-lg hover:bg-amber-200 transition-all duration-200 font-medium flex items-center justify-center text-sm"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteGuest(guest.id)}
                    className="bg-rose-100 text-rose-700 px-3 py-2 rounded-lg hover:bg-rose-200 transition-all duration-200 font-medium flex items-center justify-center text-sm"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredGuests.length === 0 && (
          <div className="p-12 text-center">
            <Users className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-500 mb-2">
              {searchTerm || filterStatus !== 'all' ? 'Aucun invité trouvé' : 'Aucun invité ajouté'}
            </h3>
            <p className="text-neutral-400 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Essayez de modifier vos critères de recherche'
                : 'Commencez par ajouter votre premier invité'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button
                onClick={openAddGuestModal}
                className="bg-amber-500 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-all duration-300 font-semibold"
              >
                Ajouter un invité
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderTables = () => (
    <TableManagement 
      tables={tables}
      setTables={setTables}
      guests={guests}
      onSaveTable={async (table) => {
        if (table.id && tables.find(t => t.id === table.id)) {
          await updateTable(table.id.toString(), table);
        } else {
          await createTable(table);
        }
        await refreshUserData();
      }}
      onDeleteTable={async (tableId) => {
        await deleteTable(tableId.toString());
        await refreshUserData();
      }}
      isLoading={isLoading}
    />
  );

  if (showProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-amber-50/30 to-purple-50/20 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setShowProfile(false)}
            className="mb-6 flex items-center text-amber-600 hover:text-amber-700 transition-all duration-300 group"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Retour au dashboard
          </button>
          <UserProfile userData={userData} onLogout={onLogout} />
        </div>
      </div>
    );
  }

  if (showCustomization && customizingTemplate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-amber-50/30 to-purple-50/20 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <TemplateCustomization
            template={customizingTemplate}
            onBack={() => {
              setShowCustomization(false);
              setCustomizingTemplate(null);
            }}
            onSave={(customizedTemplate) => {
              console.log('Template sauvegardé:', customizedTemplate);
              setShowCustomization(false);
              setCustomizingTemplate(null);
            }}
          />
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'guests', label: 'Invités', icon: Users },
    { id: 'tables', label: 'Tables', icon: Calendar }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-amber-50/30 to-purple-50/20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-amber-200/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Crown className="h-8 w-8 text-amber-500 animate-glow drop-shadow-lg" />
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-amber-700 to-slate-900 bg-clip-text text-transparent">
                    Dashboard
                  </h1>
                  <p className="text-sm text-slate-600">Bienvenue, {userData.firstName}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {subscription && (
                <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-amber-50 to-amber-100 px-3 py-2 rounded-lg border border-amber-200/50">
                  <Crown className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">
                    Plan {subscription.plan === 'free' ? 'Gratuit' : subscription.plan}
                  </span>
                  {subscription.plan === 'free' && (
                    <span className="text-xs text-amber-600">
                      ({getRemainingInvites()} invitations)
                    </span>
                  )}
                </div>
              )}

              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-full hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-medium shadow-glow-amber transform hover:scale-105"
              >
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-amber-600 font-bold text-xs">
                  {userData.firstName[0]}{userData.lastName[0]}
                </div>
                <span className="hidden sm:block">{userData.firstName}</span>
              </button>

              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200 transform hover:scale-110"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white/60 backdrop-blur-xl border-b border-neutral-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'guests' && renderGuests()}
        {activeTab === 'tables' && renderTables()}
      </div>

      {/* Modal d'ajout/modification d'invité */}
      {showAddGuestModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-luxury max-w-md w-full animate-slide-up">
            <div className="p-6 border-b border-neutral-200/50">
              <h3 className="text-xl font-bold text-slate-900">
                {editingGuest ? 'Modifier l\'invité' : 'Ajouter un invité'}
              </h3>
            </div>

            <form onSubmit={handleGuestSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={guestFormData.nom}
                    onChange={(e) => setGuestFormData({ ...guestFormData, nom: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    placeholder="Nom et prénom de l'invité"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Numéro de table
                  </label>
                  <input
                    type="text"
                    value={guestFormData.table}
                    onChange={(e) => setGuestFormData({ ...guestFormData, table: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    placeholder="Ex: Table 1, Table VIP..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Type d'invité
                  </label>
                  <select
                    value={guestFormData.etat}
                    onChange={(e) => setGuestFormData({ ...guestFormData, etat: e.target.value as 'simple' | 'couple' })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                  >
                    <option value="simple">Simple (1 personne)</option>
                    <option value="couple">Couple (2 personnes)</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddGuestModal(false)}
                  className="flex-1 px-4 py-3 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-all duration-200 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-glow-amber transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? 'Sauvegarde...' : (editingGuest ? 'Modifier' : 'Ajouter')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de lien d'invitation personnalisé */}
      {showInvitationLinkModal && selectedGuestForLink && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-luxury max-w-lg w-full animate-slide-up">
            <div className="p-6 border-b border-neutral-200/50 bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg mr-4">
                    <Share2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Invitation personnalisée
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Pour {selectedGuestForLink.nom}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInvitationLinkModal(false)}
                  className="p-2 hover:bg-blue-200 rounded-lg transition-colors duration-200"
                >
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Message personnalisé */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Message d'invitation personnalisé
                </label>
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                  <textarea
                    value={invitationMessage}
                    onChange={(e) => setInvitationMessage(e.target.value)}
                    rows={4}
                    className="w-full pl-12 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                    placeholder="Rédigez votre message d'invitation personnalisé..."
                  />
                </div>
                
                {/* Messages prédéfinis */}
                <div className="mt-3">
                  <p className="text-xs text-slate-500 mb-2">Messages suggérés :</p>
                  <div className="flex flex-wrap gap-2">
                    {invitationMessages.slice(0, 3).map((message, index) => (
                      <button
                        key={index}
                        onClick={() => setInvitationMessage(message)}
                        className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-all duration-200"
                      >
                        Message {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Génération du lien */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Lien d'invitation
                  </label>
                  {!generatedLink && (
                    <button
                      onClick={generateInvitationLink}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium text-sm flex items-center shadow-lg transform hover:scale-105"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Générer le lien
                    </button>
                  )}
                </div>

                {generatedLink && (
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={generatedLink}
                        readOnly
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-mono"
                      />
                      <button
                        onClick={copyLinkToClipboard}
                        className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300 ${
                          linkCopied 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {linkCopied ? (
                          <>
                            <Check className="h-3 w-3 inline mr-1" />
                            Copié !
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 inline mr-1" />
                            Copier
                          </>
                        )}
                      </button>
                    </div>

                    {/* Aperçu du message complet */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                      <h4 className="text-sm font-semibold text-blue-800 mb-2">Aperçu du message complet :</h4>
                      <div className="text-sm text-blue-700 whitespace-pre-wrap">
                        {invitationMessage}
                        {'\n\n'}
                        {generatedLink}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-neutral-200">
                <button
                  onClick={() => setShowInvitationLinkModal(false)}
                  className="flex-1 px-4 py-3 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-all duration-200 font-medium"
                >
                  Fermer
                </button>
                
                {generatedLink && (
                  <button
                    onClick={shareInvitation}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold shadow-lg transform hover:scale-105 flex items-center justify-center"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Partager
                  </button>
                )}
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
    </div>
  );
};

export default Dashboard;