import React, { useState, useEffect } from 'react';
import { MessageCircle, Wine, User, Calendar, Filter, Search, Download, Eye, X, Heart, Gift, GraduationCap, Send, Mail, MessageSquare } from 'lucide-react';
import { useTemplates } from '../hooks/useTemplates';
import { useAuth } from './AuthContext';
import { InviteService } from '../services/templateService';

interface GuestMessage {
  id: string;
  guestName: string;
  table: string;
  message?: string;
  selectedDrink?: string;
  confirmed: boolean;
  guestType: 'simple' | 'couple';
  timestamp?: string;
}

interface GuestMessagesViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuestMessagesViewer = ({ isOpen, onClose }: GuestMessagesViewerProps) => {
  const { userInvites, userModels } = useTemplates();
  const { user } = useAuth();
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<GuestMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [filterDrink, setFilterDrink] = useState<'all' | 'selected' | 'none'>('all');
  const [selectedMessage, setSelectedMessage] = useState<GuestMessage | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadGuestMessages();
    }
  }, [isOpen, user, userInvites]);

  const loadGuestMessages = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Transformer les invités en messages avec leurs réponses
      const guestMessages: GuestMessage[] = await Promise.all(
        userInvites.map(async (invite) => {
          try {
            // Récupérer les données complètes de l'invité depuis Firestore
            const fullInviteData = await InviteService.getInvite(user.id, invite.id);
            
            return {
              id: invite.id,
              guestName: invite.nom,
              table: invite.table || 'Non assigné',
              message: fullInviteData?.message || '',
              selectedDrink: fullInviteData?.selectedDrink || '',
              confirmed: invite.confirmed,
              guestType: invite.etat,
              timestamp: fullInviteData?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
            };
          } catch (error) {
            console.error('Erreur lors du chargement des données pour l\'invité:', invite.id, error);
            return {
              id: invite.id,
              guestName: invite.nom,
              table: invite.table || 'Non assigné',
              message: '',
              selectedDrink: '',
              confirmed: invite.confirmed,
              guestType: invite.etat,
              timestamp: new Date().toISOString()
            };
          }
        })
      );

      setMessages(guestMessages);
      setFilteredMessages(guestMessages);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les messages
  useEffect(() => {
    let filtered = messages;

    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(msg => 
        msg.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.table.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (msg.message && msg.message.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtre par statut de confirmation
    if (filterStatus !== 'all') {
      filtered = filtered.filter(msg => 
        filterStatus === 'confirmed' ? msg.confirmed : !msg.confirmed
      );
    }

    // Filtre par choix de boisson
    if (filterDrink !== 'all') {
      filtered = filtered.filter(msg => 
        filterDrink === 'selected' ? msg.selectedDrink : !msg.selectedDrink
      );
    }

    setFilteredMessages(filtered);
  }, [messages, searchTerm, filterStatus, filterDrink]);

  const getEventIcon = () => {
    if (userModels.length > 0) {
      const category = userModels[0].category;
      switch (category) {
        case 'wedding':
          return Heart;
        case 'birthday':
          return Gift;
        case 'graduation':
          return GraduationCap;
        default:
          return MessageCircle;
      }
    }
    return MessageCircle;
  };

  const getEventColors = () => {
    if (userModels.length > 0) {
      const category = userModels[0].category;
      switch (category) {
        case 'wedding':
          return {
            primary: 'from-rose-500 to-pink-500',
            bg: 'from-rose-50 to-pink-50',
            text: 'text-rose-600',
            border: 'border-rose-200'
          };
        case 'birthday':
          return {
            primary: 'from-purple-500 to-indigo-500',
            bg: 'from-purple-50 to-indigo-50',
            text: 'text-purple-600',
            border: 'border-purple-200'
          };
        case 'graduation':
          return {
            primary: 'from-emerald-500 to-teal-500',
            bg: 'from-emerald-50 to-teal-50',
            text: 'text-emerald-600',
            border: 'border-emerald-200'
          };
        default:
          return {
            primary: 'from-amber-500 to-orange-500',
            bg: 'from-amber-50 to-orange-50',
            text: 'text-amber-600',
            border: 'border-amber-200'
          };
      }
    }
    return {
      primary: 'from-amber-500 to-orange-500',
      bg: 'from-amber-50 to-orange-50',
      text: 'text-amber-600',
      border: 'border-amber-200'
    };
  };

  const openMessageModal = (message: GuestMessage) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
  };

  const closeMessageModal = () => {
    setSelectedMessage(null);
    setShowMessageModal(false);
  };

  const sendWhatsAppToGuest = (guestMessage: GuestMessage) => {
    const invitationLink = `${window.location.origin}/invitation/${guestMessage.id}`;
    const eventName = userModels[0]?.title || 'Notre Événement Spécial';
    const eventDate = userModels[0]?.eventDate || 'Bientôt';
    const eventLocation = userModels[0]?.eventLocation || 'Lieu à confirmer';
    
    const message = `🎉 *Invitation Spéciale* 🎉

Bonjour ${guestMessage.guestName} !

Vous êtes cordialement invité(e) à :
✨ *${eventName}*
📅 Date : ${eventDate}
📍 Lieu : ${eventLocation}
🪑 Table : ${guestMessage.table}

Pour confirmer votre présence et découvrir tous les détails, cliquez sur votre invitation personnalisée :
👇 ${invitationLink}

Nous avons hâte de célébrer avec vous ! 💫

Avec toute notre affection,
L'équipe organisatrice ❤️`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const sendEmailToGuest = (guestMessage: GuestMessage) => {
    const invitationLink = `${window.location.origin}/invitation/${guestMessage.id}`;
    const eventName = userModels[0]?.title || 'Notre Événement Spécial';
    const eventDate = userModels[0]?.eventDate || 'Bientôt';
    const eventTime = userModels[0]?.eventTime || 'Heure à confirmer';
    const eventLocation = userModels[0]?.eventLocation || 'Lieu à confirmer';
    
    const subject = `🎉 Invitation Spéciale - ${eventName}`;
    const body = `Bonjour ${guestMessage.guestName},

Vous êtes cordialement invité(e) à notre événement spécial !

📋 DÉTAILS DE L'ÉVÉNEMENT :
✨ Événement : ${eventName}
📅 Date : ${eventDate}
🕐 Heure : ${eventTime}
📍 Lieu : ${eventLocation}
🪑 Table assignée : ${guestMessage.table}

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
    window.open(mailtoUrl, '_blank');
  };

  const exportMessages = () => {
    const csvContent = [
      ['Nom', 'Table', 'Type', 'Statut', 'Boisson', 'Message', 'Date'],
      ...filteredMessages.map(msg => [
        msg.guestName,
        msg.table,
        msg.guestType === 'couple' ? 'Couple' : 'Simple',
        msg.confirmed ? 'Confirmé' : 'En attente',
        msg.selectedDrink || 'Non sélectionnée',
        msg.message || 'Aucun message',
        new Date(msg.timestamp || '').toLocaleDateString('fr-FR')
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'messages-invites.csv';
    link.click();
  };

  if (!isOpen) return null;

  const EventIcon = getEventIcon();
  const colors = getEventColors();

  // Statistiques
  const totalMessages = messages.filter(msg => msg.message && msg.message.trim()).length;
  const totalDrinkSelections = messages.filter(msg => msg.selectedDrink).length;
  const confirmedGuests = messages.filter(msg => msg.confirmed).length;
  const pendingGuests = messages.filter(msg => !msg.confirmed).length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-luxury max-w-6xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className={`p-6 border-b border-neutral-200/50 bg-gradient-to-r ${colors.bg}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="relative mr-4">
                <EventIcon className={`h-8 w-8 ${colors.text} animate-glow drop-shadow-lg`} />
                <div className="absolute inset-0 animate-pulse">
                  <EventIcon className={`h-8 w-8 ${colors.text} opacity-30`} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Messages & Boissons des Invités
                </h2>
                <p className="text-slate-600">
                  Consultez tous les messages de vœux et choix de boissons
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
            >
              <X className="h-6 w-6 text-neutral-500" />
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="p-6 border-b border-neutral-200/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`bg-gradient-to-br ${colors.bg} rounded-xl p-4 ${colors.border} border shadow-lg`}>
              <div className="flex items-center">
                <div className={`p-2 bg-gradient-to-r ${colors.primary} rounded-lg shadow-lg`}>
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <p className={`${colors.text} text-sm font-medium`}>Messages</p>
                  <p className="text-2xl font-bold text-slate-900">{totalMessages}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 shadow-lg">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg">
                  <Wine className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-purple-600 text-sm font-medium">Boissons</p>
                  <p className="text-2xl font-bold text-slate-900">{totalDrinkSelections}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200 shadow-lg">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-emerald-600 text-sm font-medium">Confirmés</p>
                  <p className="text-2xl font-bold text-slate-900">{confirmedGuests}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200 shadow-lg">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg shadow-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-amber-600 text-sm font-medium">En attente</p>
                  <p className="text-2xl font-bold text-slate-900">{pendingGuests}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="p-6 border-b border-neutral-200/50 bg-gradient-to-r from-neutral-50 to-amber-50/30">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par nom, table ou message..."
                  className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Filtres */}
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'confirmed' | 'pending')}
                className="px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
              >
                <option value="all">Tous les statuts</option>
                <option value="confirmed">Confirmés</option>
                <option value="pending">En attente</option>
              </select>

              <select
                value={filterDrink}
                onChange={(e) => setFilterDrink(e.target.value as 'all' | 'selected' | 'none')}
                className="px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
              >
                <option value="all">Toutes les boissons</option>
                <option value="selected">Boisson sélectionnée</option>
                <option value="none">Aucune boisson</option>
              </select>

              <button
                onClick={exportMessages}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-3 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-semibold flex items-center shadow-lg transform hover:scale-105"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <p className="text-slate-600 font-medium">Chargement des messages...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-500 mb-2">
                {messages.length === 0 ? 'Aucun message reçu' : 'Aucun résultat'}
              </h3>
              <p className="text-neutral-400">
                {messages.length === 0 
                  ? 'Vos invités n\'ont pas encore envoyé de messages'
                  : 'Essayez de modifier vos critères de recherche'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((message, index) => (
                <div
                  key={message.id}
                  className="bg-gradient-to-r from-neutral-50 to-amber-50/30 rounded-xl p-6 border border-neutral-200/50 hover:shadow-lg transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                        message.guestType === 'couple' 
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500' 
                          : 'bg-gradient-to-r from-amber-500 to-orange-500'
                      }`}>
                        {message.guestName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>

                      {/* Informations */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-slate-900 text-lg">{message.guestName}</h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            message.confirmed 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {message.confirmed ? 'Confirmé' : 'En attente'}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            message.guestType === 'couple' 
                              ? 'bg-pink-100 text-pink-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {message.guestType === 'couple' ? 'Couple' : 'Simple'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-slate-600 mb-3">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            <span>Table: {message.table}</span>
                          </div>
                          {message.selectedDrink && (
                            <div className="flex items-center">
                              <Wine className="h-4 w-4 mr-1 text-purple-600" />
                              <span className="font-medium text-purple-700">{message.selectedDrink}</span>
                            </div>
                          )}
                        </div>

                        {/* Message */}
                        {message.message && message.message.trim() ? (
                          <div className="bg-white rounded-lg p-4 border border-neutral-200/50 shadow-sm">
                            <div className="flex items-center mb-2">
                              <MessageCircle className={`h-4 w-4 mr-2 ${colors.text}`} />
                              <span className="text-sm font-medium text-slate-700">Message de vœux</span>
                            </div>
                            <p className="text-slate-800 leading-relaxed">
                              {message.message.length > 150 
                                ? `${message.message.substring(0, 150)}...`
                                : message.message
                              }
                            </p>
                            {message.message.length > 150 && (
                              <button
                                onClick={() => openMessageModal(message)}
                                className={`mt-2 text-sm ${colors.text} hover:underline font-medium`}
                              >
                                Lire la suite
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="bg-neutral-100 rounded-lg p-4 border border-neutral-200/50">
                            <p className="text-neutral-500 text-sm italic">Aucun message envoyé</p>
                          </div>
                        )}

                        {/* Timestamp */}
                        <div className="mt-3 text-xs text-slate-500">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(message.timestamp || '').toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => sendWhatsAppToGuest(message)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                        title="Envoyer par WhatsApp"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => sendEmailToGuest(message)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                        title="Envoyer par Email"
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                      
                      {message.message && message.message.trim() && (
                        <button
                          onClick={() => openMessageModal(message)}
                          className={`p-2 ${colors.text} hover:bg-amber-50 rounded-lg transition-all duration-200 transform hover:scale-110`}
                          title="Voir le message complet"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-200/50 bg-gradient-to-r from-neutral-50 to-amber-50/30">
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-600">
              {filteredMessages.length} résultat{filteredMessages.length > 1 ? 's' : ''} 
              {filteredMessages.length !== messages.length && ` sur ${messages.length} total`}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterDrink('all');
                }}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-all duration-200 font-medium"
              >
                <Filter className="h-4 w-4 mr-2 inline" />
                Réinitialiser
              </button>
              
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-glow-amber transform hover:scale-105"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal pour afficher le message complet */}
      {showMessageModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-60 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-luxury max-w-lg w-full animate-slide-up">
            <div className={`p-6 border-b border-neutral-200/50 bg-gradient-to-r ${colors.bg}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg mr-3 ${
                    selectedMessage.guestType === 'couple' 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500' 
                      : 'bg-gradient-to-r from-amber-500 to-orange-500'
                  }`}>
                    {selectedMessage.guestName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{selectedMessage.guestName}</h3>
                    <p className="text-slate-600 text-sm">Table: {selectedMessage.table}</p>
                  </div>
                </div>
                <button
                  onClick={closeMessageModal}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
                >
                  <X className="h-5 w-5 text-neutral-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Informations de l'invité */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-r from-neutral-50 to-amber-50/30 rounded-xl p-4 border border-neutral-200/50">
                  <div className="flex items-center mb-2">
                    <User className="h-4 w-4 text-amber-600 mr-2" />
                    <span className="text-sm font-medium text-slate-700">Statut</span>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedMessage.confirmed 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedMessage.confirmed ? 'Confirmé' : 'En attente'}
                  </span>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200/50">
                  <div className="flex items-center mb-2">
                    <Wine className="h-4 w-4 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-slate-700">Boisson</span>
                  </div>
                  <p className="text-purple-800 font-medium">
                    {selectedMessage.selectedDrink || 'Non sélectionnée'}
                  </p>
                </div>
              </div>

              {/* Message complet */}
              {selectedMessage.message && selectedMessage.message.trim() ? (
                <div className="bg-gradient-to-r from-neutral-50 to-amber-50/30 rounded-xl p-6 border border-neutral-200/50">
                  <div className="flex items-center mb-4">
                    <MessageCircle className={`h-5 w-5 ${colors.text} mr-2`} />
                    <h4 className="text-lg font-semibold text-slate-900">Message de vœux</h4>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-neutral-200/50 shadow-sm">
                    <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                  
                  <div className="mt-4 text-xs text-slate-500">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    Envoyé le {new Date(selectedMessage.timestamp || '').toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-neutral-100 rounded-xl p-6 border border-neutral-200/50 text-center">
                  <MessageCircle className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500 font-medium">Aucun message envoyé</p>
                  <p className="text-neutral-400 text-sm">Cet invité n'a pas encore laissé de message</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-neutral-200/50 bg-gradient-to-r from-neutral-50 to-amber-50/30">
              <button
                onClick={closeMessageModal}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-glow-amber transform hover:scale-105"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestMessagesViewer;