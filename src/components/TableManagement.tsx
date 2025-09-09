import React, { useState } from 'react';
import { Plus, Edit, Trash2, Users, X, Eye } from 'lucide-react';

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
}

const TableManagement = ({ tables, setTables }: TableManagementProps) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState<TableFormData>({ name: '', seats: 8 });

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
    setSelectedTable(table);
    setIsGuestModalOpen(true);
  };

  const closeGuestModal = () => {
    setIsGuestModalOpen(false);
    setSelectedTable(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTable) {
      // Modifier une table existante
      setTables(tables.map(table => 
        table.id === editingTable.id 
          ? { ...table, name: formData.name, seats: formData.seats }
          : table
      ));
    } else {
      // Ajouter une nouvelle table
      const newTable: Table = {
        id: Math.max(...tables.map(t => t.id), 0) + 1,
        name: formData.name,
        seats: formData.seats,
        assignedGuests: []
      };
      setTables([...tables, newTable]);
    }
    
    closeModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette table ?')) {
      setTables(tables.filter(table => table.id !== id));
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

  const totalTables = tables.length;
  const totalSeats = tables.reduce((sum, table) => sum + table.seats, 0);
  const totalAssignedGuests = tables.reduce((sum, table) => sum + table.assignedGuests.length, 0);

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
                <p className="text-rose-700 text-sm font-medium">Places Libres</p>
                <p className="text-2xl font-bold text-rose-900">{totalSeats - totalAssignedGuests}</p>
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
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                    {table.assignedGuests.length} / {table.seats}
                  </span>
                </div>
                <div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                    table.assignedGuests.length === table.seats 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : table.assignedGuests.length > 0 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-neutral-100 text-neutral-800'
                  }`}>
                    {table.assignedGuests.length === table.seats 
                      ? 'Complète' 
                      : table.assignedGuests.length > 0 
                        ? 'Partielle' 
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
                        <span className="text-purple-600 text-sm font-medium">
                          {table.assignedGuests.length} assignés
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    table.assignedGuests.length === table.seats 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : table.assignedGuests.length > 0 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-neutral-100 text-neutral-800'
                  }`}>
                    {table.assignedGuests.length === table.seats 
                      ? 'Complète' 
                      : table.assignedGuests.length > 0 
                        ? 'Partielle' 
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
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-glow-amber transform hover:scale-105"
                >
                  {editingTable ? 'Modifier' : 'Ajouter'}
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
              {selectedTable.assignedGuests.length > 0 ? (
                <div className="space-y-3">
                  {selectedTable.assignedGuests.map((guest, index) => (
                    <div
                      key={guest.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-amber-50/30 rounded-xl border border-neutral-200/50 hover:shadow-md transition-all duration-200 animate-slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                          {guest.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-slate-900">{guest.name}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(guest.status)}`}>
                        {getStatusText(guest.status)}
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

            {selectedTable.assignedGuests.length > 0 && (
              <div className="p-6 border-t border-neutral-200/50 bg-gradient-to-r from-neutral-50 to-amber-50/30">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-emerald-700 font-medium">Confirmés</p>
                    <p className="text-lg font-bold text-emerald-900">
                      {selectedTable.assignedGuests.filter(g => g.status === 'confirmed').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-amber-700 font-medium">En attente</p>
                    <p className="text-lg font-bold text-amber-900">
                      {selectedTable.assignedGuests.filter(g => g.status === 'pending').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-rose-700 font-medium">Déclinés</p>
                    <p className="text-lg font-bold text-rose-900">
                      {selectedTable.assignedGuests.filter(g => g.status === 'declined').length}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TableManagement;