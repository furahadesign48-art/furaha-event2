import React, { useState } from 'react';
import { Plus, Edit, Trash2, Users, X, Send, Eye, UserCheck, UserX, Search, Filter } from 'lucide-react';
import { useTemplates } from '../hooks/useTemplates';
import { useAuth } from './AuthContext';
import InvitationSendModal from './InvitationSendModal';

interface Guest {
  id: string;
  nom: string;
  table: string;
  etat: 'simple' | 'couple';
  confirmed: boolean;
}

interface GuestFormData {
  nom: string;
  table: string;
  etat: 'simple' | 'couple';
}

interface GuestManagementProps {
  guests: Guest[];
  setGuests: React.Dispatch<React.SetStateAction<Guest[]>>;
  tables?: Array<{
    id: number;
    name: string;
    seats: number;
  }>;
  onSaveGuest?: (guest: Guest) => Promise<void>;
  onDeleteGuest?: (guestId: string) => Promise<void>;
  isLoading?: boolean;
}

const GuestManagement = ({ guests, setGuests, tables = [], onSaveGuest, onDeleteGuest, isLoading }: GuestManagementProps) => {
  const { userInvites, userModels, createInvite, updateInvite, deleteInvite } = useTemplates();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [formData, setFormData] = useState<GuestFormData>({ nom: '', table: '', etat: 'simple' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [filterType, setFilterType] = useState<'all' | 'simple' | 'couple'>('all');

  // Modal d'envoi d'invitation
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [selectedGuestForSend, setSelectedGuestForSend] = useState<Guest | null>(null);

  // Utiliser les invités réels depuis le hook
  const realGuests = userInvites.length > 0 ? userInvites : guests;

  const openModal = (guest?: Guest) => {
    if (guest) {
      setEditingGuest(guest);
      setFormData({ nom: guest.nom, table: guest.table, etat: guest.etat });
    } else {
      setEditingGuest(null);
      setFormData({ nom: '', table: '', etat: 'simple' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGuest(null);
    setFormData({ nom: '', table: '', etat: 'simple' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Vous devez être connecté pour gérer les invités');
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (editingGuest) {
        // Modifier un invité existant
        const updatedGuest = { 
          ...editingGuest, 
          nom: formData.nom, 
          table: formData.table, 
          etat: formData.etat 
        };
        
        // Utiliser la fonction onSaveGuest si elle existe, sinon utiliser le hook
        if (onSaveGuest) {
          await onSaveGuest(updatedGuest);
        } else {
          const success = await updateInvite(editingGuest.id, {
            nom: formData.nom,
            table: formData.table,
            etat: formData.etat
          });
        
          if (!success) {
            alert('Erreur lors de la modification de l\'invité');
            return;
          }
        }
        
        setGuests(guests.map(guest => 
          guest.id === editingGuest.id ? updatedGuest : guest
        ));
      } else {
        // Ajouter un nouvel invité
        const newGuest: Guest = {
          id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          nom: formData.nom,
          table: formData.table,
          etat: formData.etat,
          confirmed: false
        };
        
        // Utiliser la fonction onSaveGuest si elle existe, sinon utiliser le hook
        if (onSaveGuest) {
          await onSaveGuest(newGuest);
        } else {
          const inviteId = await createInvite({
            nom: formData.nom,
            table: formData.table,
            etat: formData.etat,
            confirmed: false
          });
        
          if (!inviteId) {
            alert('Erreur lors de la création de l\'invité');
            return;
          }
          
          newGuest.id = inviteId;
        }
        
        setGuests([...guests, newGuest]);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de l\'invité');
    } finally {
      setIsSaving(false);
    }
    
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet invité ?')) {
      if (!user) {
        alert('Vous devez être connecté pour supprimer un invité');
        return;
      }
      
      try {
        setIsSaving(true);
        
        // Utiliser la fonction onDeleteGuest si elle existe, sinon utiliser le hook
        if (onDeleteGuest) {
          await onDeleteGuest(id);
        } else {
          const success = await deleteInvite(id);
        
          if (!success) {
            alert('Erreur lors de la suppression de l\'invité');
            return;
          }
        }
        
        setGuests(guests.filter(guest => guest.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'invité');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSendInvitation = (guest: Guest) => {
    setSelectedGuestForSend(guest);
    setSendModalOpen(true);
  };

  // Filtrer les invités
  const filteredGuests = realGuests.filter(guest => {
    const matchesSearch = guest.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'confirmed' && guest.confirmed) ||
      (filterStatus === 'pending' && !guest.confirmed);
    const matchesType = filterType === 'all' || guest.etat === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (confirmed: boolean) => {
    return confirmed 
      ? 'bg-emerald-100 text-emerald-800' 
      : 'bg-amber-100 text-amber-800';
  };

  const getStatusText = (confirmed: boolean) => {
    return confirmed ? 'Confirmé' : 'En attente';
  };

  const getTypeColor = (etat: string) => {
    return etat === 'couple' 
      ? 'bg-pink-100 text-pink-800' 
      : 'bg-blue-100 text-blue-800';
  };

  const getTypeText = (etat: string) => {
    return etat === 'couple' ? 'Couple' : 'Simple';
  };

  // Calculer les statistiques
  const totalGuests = realGuests.length;
  const confirmedGuests = realGuests.filter(g => g.confirmed).length;
  const pendingGuests = totalGuests - confirmedGuests;
  const coupleGuests = realGuests.filter(g => g.etat === 'couple').length;

  return (
    <div className="animate-fade-in">
      {/* En-tête avec statistiques */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200/50 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-amber-500 rounded-xl shadow-glow-amber">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-amber-700 text-sm font-medium">Total Invités</p>
                <p className="text-2xl font-bold text-amber-900">{totalGuests}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200/50 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-500 rounded-xl">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-emerald-700 text-sm font-medium">Confirmés</p>
                <p className="text-2xl font-bold text-emerald-900">{confirmedGuests}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-6 border border-orange-200/50 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-orange-500 rounded-xl">
                <UserX className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-orange-700 text-sm font-medium">En attente</p>
                <p className="text-2xl font-bold text-orange-900">{pendingGuests}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 border border-pink-200/50 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-pink-500 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-pink-700 text-sm font-medium">Couples</p>
                <p className="text-2xl font-bold text-pink-900">{coupleGuests}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* En-tête avec bouton d'ajout et filtres */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Gestion des Invités
          </h3>
          <p className="text-slate-600 mt-1">Gérez votre liste d'invités et envoyez les invitations</p>
        </div>
        
        <button
          onClick={() => openModal()}
          className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold flex items-center shadow-glow-amber hover:shadow-luxury transform hover:scale-105"
        >
          <Plus className="h-5 w-5 mr-2" />
          Ajouter un invité
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-2xl shadow-lg border border-neutral-200/50 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Rechercher</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nom de l'invité..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Statut</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'confirmed' | 'pending')}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
            >
              <option value="all">Tous les statuts</option>
              <option value="confirmed">Confirmés</option>
              <option value="pending">En attente</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'simple' | 'couple')}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
            >
              <option value="all">Tous les types</option>
              <option value="simple">Simple</option>
              <option value="couple">Couple</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterType('all');
              }}
              className="w-full bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-200 transition-all duration-200 font-medium flex items-center justify-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des invités */}
      <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 overflow-hidden">
        {/* En-tête du tableau - Desktop */}
        <div className="hidden md:grid md:grid-cols-6 gap-4 p-6 bg-gradient-to-r from-neutral-50 to-amber-50/30 border-b border-neutral-200/50">
          <div className="font-semibold text-slate-700">Nom de l'invité</div>
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
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Version Desktop */}
              <div className="hidden md:grid md:grid-cols-6 gap-4 p-6 items-center">
                <div className="font-medium text-slate-900">{guest.nom}</div>
                <div className="text-slate-600">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                    {guest.table || 'Non assigné'}
                  </span>
                </div>
                <div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(guest.etat)}`}>
                    {getTypeText(guest.etat)}
                  </span>
                </div>
                <div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(guest.confirmed)}`}>
                    {getStatusText(guest.confirmed)}
                  </span>
                </div>
                <div>
                  <button
                    onClick={() => handleSendInvitation(guest)}
                    className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full text-sm font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105"
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Envoyer
                  </button>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => openModal(guest)}
                    className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                    title="Modifier"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(guest.id)}
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
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(guest.etat)}`}>
                        {getTypeText(guest.etat)}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(guest.confirmed)}`}>
                        {getStatusText(guest.confirmed)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      Table: {guest.table || 'Non assigné'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleSendInvitation(guest)}
                    className="bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-200 transition-all duration-200 font-medium flex items-center justify-center text-sm"
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Envoyer
                  </button>
                  <button
                    onClick={() => openModal(guest)}
                    className="bg-amber-100 text-amber-700 px-3 py-2 rounded-lg hover:bg-amber-200 transition-all duration-200 font-medium flex items-center justify-center text-sm"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(guest.id)}
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
              {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
                ? 'Aucun invité trouvé' 
                : 'Aucun invité ajouté'}
            </h3>
            <p className="text-neutral-400 mb-6">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                ? 'Essayez de modifier vos critères de recherche'
                : 'Commencez par ajouter votre premier invité'}
            </p>
            {!searchTerm && filterStatus === 'all' && filterType === 'all' && (
              <button
                onClick={() => openModal()}
                className="bg-amber-500 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-all duration-300 font-semibold"
              >
                Ajouter un invité
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal pour ajouter/modifier un invité */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-luxury max-w-md w-full animate-slide-up">
            <div className="p-6 border-b border-neutral-200/50">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">
                  {editingGuest ? 'Modifier l\'invité' : 'Ajouter un invité'}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
                >
                  <X className="h-5 w-5 text-neutral-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nom de l'invité
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    placeholder="Ex: Sophie Martin"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Table
                  </label>
                  {tables.length > 0 ? (
                    <select
                      value={formData.table}
                      onChange={(e) => setFormData({ ...formData, table: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    >
                      <option value="">Sélectionner une table</option>
                      {tables.map((table) => (
                        <option key={table.id} value={table.name}>
                          {table.name} ({table.seats} places)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.table}
                      onChange={(e) => setFormData({ ...formData, table: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                      placeholder="Ex: Table 1"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Type d'invité
                  </label>
                  <select
                    value={formData.etat}
                    onChange={(e) => setFormData({ ...formData, etat: e.target.value as 'simple' | 'couple' })}
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
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-all duration-200 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-glow-amber transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSaving ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Sauvegarde...
                    </div>
                  ) : (
                    editingGuest ? 'Modifier' : 'Ajouter'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'envoi d'invitation */}
      {sendModalOpen && selectedGuestForSend && userModels.length > 0 && (
        <InvitationSendModal
          isOpen={sendModalOpen}
          onClose={() => {
            setSendModalOpen(false);
            setSelectedGuestForSend(null);
          }}
          invite={selectedGuestForSend}
          userModel={userModels[0]} // Utiliser le premier modèle utilisateur
        />
      )}
    </div>
  );
};

export default GuestManagement;