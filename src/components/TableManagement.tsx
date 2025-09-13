import React, { useState } from 'react';
import { Plus, Edit, Trash2, Users, X, Eye } from 'lucide-react';
import { useTemplates } from '../hooks/useTemplates';

interface Guest {
  id: number;
  name: string;
  status: 'confirmed' | 'pending' | 'declined';
}

interface Table {
  id: number;
  name: string;
  seats: number;
  assignedGuests: Guest[];
}

interface TableFormData {
  name: string;
  seats: number;
}

interface TableManagementProps {
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  guests?: Array<{
    id: string;
    nom: string;
    table: string;
    etat: 'simple' | 'couple';
    confirmed: boolean;
  }>;
  onSaveTable?: (table: Table) => Promise<void>;
  onDeleteTable?: (tableId: number) => Promise<void>;
  isLoading?: boolean;
}

const TableManagement = ({ tables, setTables, guests = [], onSaveTable, onDeleteTable, isLoading }: TableManagementProps) => {
  const { userInvites, deleteTable } = useTemplates();
  const [isSaving, setIsSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState<TableFormData>({ name: '', seats: 8 });

  // Utiliser les invités réels depuis le hook
  const realGuests = userInvites.length > 0 ? userInvites : guests;

  // Fonction pour obtenir les invités assignés à une table
  const getGuestsForTable = (tableName: string) => {
    return realGuests.filter(guest => guest.table === tableName);
  };

  // Fonction pour calculer les places occupées par table
  const getOccupiedSeats = (tableName: string) => {
    const tableGuests = getGuestsForTable(tableName);
    return tableGuests.reduce((total, guest) => {
      return total + (guest.etat === 'couple' ? 2 : 1);
    }, 0);
  };

  const openModal = (table?: Table) => {
    if (table) {
      setEditingTable(table);
      setFormData({ name: table.name, seats: table.seats });
    } else {
      setEditingTable(null);
      setFormData({ name: '', seats: 8 });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTable(null);
    setFormData({ name: '', seats: 8 });
  };

  const openGuestModal = (table: Table) => {
    // Mettre à jour la table avec les invités réels
    const realTableGuests = getGuestsForTable(table.name).map(guest => ({
      id: parseInt(guest.id.replace(/\D/g, '')) || Math.random(),
      name: guest.nom,
      status: guest.confirmed ? 'confirmed' : 'pending' as 'confirmed' | 'pending' | 'declined'
    }));
    
    const updatedTable = {
      ...table,
      assignedGuests: realTableGuests
    };
    
    setSelectedTable(updatedTable);
    setIsGuestModalOpen(true);
  };

  const closeGuestModal = () => {
    setIsGuestModalOpen(false);
    setSelectedTable(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    
    try {
      if (editingTable) {
        // Modifier une table existante
        const updatedTable = { ...editingTable, name: formData.name, seats: formData.seats };
        
        if (onSaveTable) {
          await onSaveTable(updatedTable);
        }
        
        setTables(tables.map(table => 
          table.id === editingTable.id ? updatedTable : table
        ));
      } else {
        // Ajouter une nouvelle table
        const newTable: Table = {
          id: Math.max(...tables.map(t => t.id), 0) + 1,
          name: formData.name,
          seats: formData.seats,
          assignedGuests: []
        };
        
        if (onSaveTable) {
          await onSaveTable(newTable);
        }
        
        setTables([...tables, newTable]);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la table');
    } finally {
      setIsSaving(false);
    }
    
    closeModal();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette table ?')) {
      try {
        setIsSaving(true);
        
        const success = await deleteTable(id.toString());
        
        if (success) {
          setTables(tables.filter(table => table.id !== id));
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la table');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'declined':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmé';
      case 'pending':
        return 'En attente';
      case 'declined':
        return 'Décliné';
      default:
        return 'Inconnu';
    }
  };

  // Calculer les statistiques avec les données réelles
  const totalTables = tables.length;
  const totalSeats = tables.reduce((sum, table) => sum + table.seats, 0);
  const totalAssignedGuests = realGuests.length;
  const totalOccupiedSeats = realGuests.reduce((total, guest) => {
    return total + (guest.etat === 'couple' ? 2 : 1);
  }, 0);

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
                <p className="text-amber-700 text-sm font-medium">Total Tables</p>
                <p className="text-2xl font-bold text-amber-900">{totalTables}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200/50 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500 rounded-xl shadow-glow-purple">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-purple-700 text-sm font-medium">Total Places</p>
                <p className="text-2xl font-bold text-purple-900">{totalSeats}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200/50 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-500 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-emerald-700 text-sm font-medium">Invités Assignés</p>
                <p className="text-2xl font-bold text-emerald-900">{totalAssignedGuests}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl p-6 border border-rose-200/50 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-rose-500 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-rose-700 text-sm font-medium">Places Occupées</p>
                <p className="text-2xl font-bold text-rose-900">{totalOccupiedSeats}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* En-tête avec bouton d'ajout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Gestion des Tables
          </h3>
          <p className="text-slate-600 mt-1">Organisez les places de vos invités</p>
        </div>
        
        <button
          onClick={() => openModal()}
          className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold flex items-center shadow-glow-amber hover:shadow-luxury transform hover:scale-105"
        >
          <Plus className="h-5 w-5 mr-2" />
          Ajouter une table
        </button>
      </div>

      {/* Tableau des tables */}
      <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 overflow-hidden">
        {/* En-tête du tableau - Desktop */}
        <div className="hidden md:grid md:grid-cols-5 gap-4 p-6 bg-gradient-to-r from-neutral-50 to-amber-50/30 border-b border-neutral-200/50">
          <div className="font-semibold text-slate-700">Nom de la table</div>
          <div className="font-semibold text-slate-700">Nombre de places</div>
          <div className="font-semibold text-slate-700">Invités assignés</div>
          <div className="font-semibold text-slate-700">Statut</div>
          <div className="font-semibold text-slate-700 text-right">Actions</div>
        </div>

        {/* Corps du tableau */}
        <div className="divide-y divide-neutral-200/50">
          {tables.map((table, index) => (
            (() => {
              const tableGuests = getGuestsForTable(table.name);
              const occupiedSeats = getOccupiedSeats(table.name);
              const availableSeats = table.seats - occupiedSeats;
              
              return (
            <div
              key={table.id}
              className="animate-slide-up hover:bg-gradient-to-r hover:from-neutral-50/50 hover:to-amber-50/30 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Version Desktop */}
              <div className="hidden md:grid md:grid-cols-5 gap-4 p-6 items-center">
                <div className="font-medium text-slate-900">{table.name}</div>
                <div className="text-slate-600">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800">
                    <Users className="h-4 w-4 mr-1" />
                    {table.seats} places
                  </span>
                </div>
                <div className="text-slate-600">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                    occupiedSeats > table.seats 
                      ? 'bg-rose-100 text-rose-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {occupiedSeats} / {table.seats} places
                  </span>
                  {tableGuests.length > 0 && (
                    <div className="text-xs text-slate-500 mt-1">
                      {tableGuests.length} invité{tableGuests.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    occupiedSeats >= table.seats 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : occupiedSeats > 0 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-neutral-100 text-neutral-800'
                  }`}>
                    {occupiedSeats >= table.seats 
                      ? 'Complète'
                      : occupiedSeats > 0 
                        ? `${availableSeats} libre${availableSeats > 1 ? 's' : ''}` 
                        : 'Vide'}
                  </span>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => openGuestModal(table)}
                    className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                    title="Voir invités"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openModal(table)}
                    className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                    title="Modifier"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(table.id)}
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
                    <h4 className="font-medium text-slate-900 text-lg">{table.name}</h4>
                    <div className="flex items-center mt-1 space-x-3">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-amber-600 mr-1" />
                        <span className="text-slate-600 text-sm">{table.seats} places</span>
                      </div>
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${
                          occupiedSeats > table.seats ? 'text-rose-600' : 'text-purple-600'
                        }`}>
                          {occupiedSeats} / {table.seats} occupées
                        </span>
                      </div>
                      {tableGuests.length > 0 && (
                        <div className="flex items-center">
                          <span className="text-emerald-600 text-sm font-medium">
                            {tableGuests.length} invité{tableGuests.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    occupiedSeats >= table.seats 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : occupiedSeats > 0 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-neutral-100 text-neutral-800'
                  }`}>
                    {occupiedSeats >= table.seats 
                      ? 'Complète' 
                      : occupiedSeats > 0 
                        ? `${availableSeats} libre${availableSeats > 1 ? 's' : ''}` 
                        : 'Vide'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => openGuestModal(table)}
                    className="bg-purple-100 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-200 transition-all duration-200 font-medium flex items-center justify-center text-sm"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Invités
                  </button>
                  <button
                    onClick={() => openModal(table)}
                    className="bg-amber-100 text-amber-700 px-3 py-2 rounded-lg hover:bg-amber-200 transition-all duration-200 font-medium flex items-center justify-center text-sm"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(table.id)}
                    className="bg-rose-100 text-rose-700 px-3 py-2 rounded-lg hover:bg-rose-200 transition-all duration-200 font-medium flex items-center justify-center text-sm"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
              );
            })()
          ))}
        </div>

        {tables.length === 0 && (
          <div className="p-12 text-center">
            <Users className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-500 mb-2">Aucune table configurée</h3>
            <p className="text-neutral-400 mb-6">Commencez par ajouter votre première table</p>
            <button
              onClick={() => openModal()}
              className="bg-amber-500 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-all duration-300 font-semibold"
            >
              Ajouter une table
            </button>
          </div>
        )}
      </div>

      {/* Modal pour ajouter/modifier une table */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-luxury max-w-md w-full animate-slide-up">
            <div className="p-6 border-b border-neutral-200/50">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">
                  {editingTable ? 'Modifier la table' : 'Ajouter une table'}
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
                    Nom de la table
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    placeholder="Ex: Table des Mariés"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre de places
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.seats}
                    onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    required
                  />
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
                    editingTable ? 'Modifier' : 'Ajouter'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal pour voir les invités d'une table */}
      {isGuestModalOpen && selectedTable && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-luxury max-w-lg w-full animate-slide-up max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-neutral-200/50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Invités - {selectedTable.name}
                  </h3>
                  <p className="text-slate-600 text-sm mt-1">
                    {selectedTable.assignedGuests.length} invité(s) assigné(s) sur {selectedTable.seats} places
                  </p>
                </div>
                <button
                  onClick={closeGuestModal}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
                >
                  <X className="h-5 w-5 text-neutral-500" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-96">
              {selectedTable && getGuestsForTable(selectedTable.name).length > 0 ? (
                <div className="space-y-3">
                  {getGuestsForTable(selectedTable.name).map((guest, index) => (
                    <div
                      key={guest.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-amber-50/30 rounded-xl border border-neutral-200/50 hover:shadow-md transition-all duration-200 animate-slide-up"
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
                          <div className="flex items-center space-x-2">
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
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        guest.confirmed 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {guest.confirmed ? 'Confirmé' : 'En attente'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-neutral-500 mb-2">Aucun invité assigné</h4>
                  <p className="text-neutral-400">Cette table n'a pas encore d'invités assignés</p>
                </div>
              )}
            </div>

            {selectedTable && getGuestsForTable(selectedTable.name).length > 0 && (
              <div className="p-6 border-t border-neutral-200/50 bg-gradient-to-r from-neutral-50 to-amber-50/30">
                {(() => {
                  const tableGuests = getGuestsForTable(selectedTable.name);
                  const confirmedGuests = tableGuests.filter(g => g.confirmed);
                  const pendingGuests = tableGuests.filter(g => !g.confirmed);
                  const occupiedSeats = getOccupiedSeats(selectedTable.name);
                  
                  return (
                    <>
                      <div className="mb-4 text-center">
                        <h4 className="font-semibold text-slate-900 mb-2">Résumé de la table</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-slate-600">Places occupées</p>
                            <p className="text-lg font-bold text-slate-900">{occupiedSeats} / {selectedTable.seats}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Places libres</p>
                            <p className="text-lg font-bold text-slate-900">{selectedTable.seats - occupiedSeats}</p>
                          </div>
                        </div>
                      </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-emerald-700 font-medium">Confirmés</p>
                    <p className="text-lg font-bold text-emerald-900">
                        {confirmedGuests.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-amber-700 font-medium">En attente</p>
                    <p className="text-lg font-bold text-amber-900">
                        {pendingGuests.length}
                    </p>
                  </div>
                  <div>
                      <p className="text-sm text-slate-700 font-medium">Total invités</p>
                    <p className="text-lg font-bold text-rose-900">
                        {tableGuests.length}
                    </p>
                  </div>
                </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TableManagement;