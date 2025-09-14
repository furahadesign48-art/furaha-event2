import React, { useState } from 'react';
import { User, Mail, Calendar, Settings, LogOut, Edit, Save, X } from 'lucide-react';
import { useAuth, UserData } from '../hooks/useAuth';


interface UserProfileProps {
  userData: UserData;
  onLogout: () => void;
}

const UserProfile = ({ userData, onLogout }: UserProfileProps) => {
  const { updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: userData.firstName,
    lastName: userData.lastName
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const result = await updateUserProfile({
        firstName: editData.firstName,
        lastName: editData.lastName
      });
      
      if (result.success) {
        setIsEditing(false);
        alert('Profil mis à jour avec succès !');
      } else {
        alert('Erreur lors de la mise à jour : ' + result.error);
      }
    } catch (error) {
      alert('Erreur lors de la mise à jour du profil');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      firstName: userData.firstName,
      lastName: userData.lastName
    });
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-luxury border border-neutral-200/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-rose-50/30 p-6 border-b border-neutral-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-glow-amber">
              {userData.firstName[0]}{userData.lastName[0]}
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                {userData.firstName} {userData.lastName}
              </h2>
              <p className="text-slate-600">{userData.email}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all duration-200"
                title="Modifier le profil"
              >
                <Edit className="h-5 w-5" />
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                  title="Sauvegarder"
                >
                  {isUpdating ? (
                    <div className="w-5 h-5 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin"></div>
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all duration-200"
                  title="Annuler"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-6">
          {/* Informations personnelles */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-amber-600" />
              Informations personnelles
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Prénom
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.firstName}
                    onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                  />
                ) : (
                  <div className="bg-neutral-50 px-4 py-3 rounded-xl border border-neutral-200">
                    {userData.firstName}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nom
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.lastName}
                    onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                  />
                ) : (
                  <div className="bg-neutral-50 px-4 py-3 rounded-xl border border-neutral-200">
                    {userData.lastName}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Mail className="h-5 w-5 mr-2 text-amber-600" />
              Contact
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Adresse email
              </label>
              <div className="bg-neutral-50 px-4 py-3 rounded-xl border border-neutral-200">
                {userData.email}
              </div>
              <p className="text-xs text-slate-500 mt-1">L'email ne peut pas être modifié</p>
            </div>
          </div>

          {/* Informations du compte */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-amber-600" />
              Informations du compte
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ID Utilisateur
                </label>
                <div className="bg-neutral-50 px-4 py-3 rounded-xl border border-neutral-200 font-mono text-sm">
                  {userData.id}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Membre depuis
                </label>
                <div className="bg-neutral-50 px-4 py-3 rounded-xl border border-neutral-200">
                  {formatDate(userData.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-amber-600" />
              Statistiques
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200/50">
                <div className="text-2xl font-bold text-amber-900">0</div>
                <div className="text-amber-700 text-sm">Événements créés</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200/50">
                <div className="text-2xl font-bold text-purple-900">0</div>
                <div className="text-purple-700 text-sm">Invitations envoyées</div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200/50">
                <div className="text-2xl font-bold text-emerald-900">0</div>
                <div className="text-emerald-700 text-sm">Templates utilisés</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-neutral-50 to-amber-50/30 p-6 border-t border-neutral-200/50">
        <button
          onClick={onLogout}
          className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white py-3 rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-glow-rose transform hover:scale-105"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Se déconnecter
        </button>
      </div>
    </div>
  );
};

export default UserProfile;