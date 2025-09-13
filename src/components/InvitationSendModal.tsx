import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  MessageCircle, 
  Mail, 
  Smartphone, 
  Share2,
  Check,
  ExternalLink,
  User,
  Calendar,
  MapPin,
  Clock
} from 'lucide-react';
import { InvitationService } from '../services/invitationService';
import { UserModel, Invite } from '../services/templateService';

interface InvitationSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  invite: Invite;
  userModel: UserModel;
}

const InvitationSendModal = ({ isOpen, onClose, invite, userModel }: InvitationSendModalProps) => {
  const [invitationUrl, setInvitationUrl] = useState('');
  const [invitationMessage, setInvitationMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (isOpen && invite) {
      // Générer l'URL d'invitation
      const url = InvitationService.generateInvitationUrl(invite.id);
      setInvitationUrl(url);

      // Générer le message (juste le lien)
      const msg = InvitationService.generateInvitationMessage(invite, userModel, url);
      setInvitationMessage(msg);
    }
  }, [isOpen, invite, userModel]);

  const handleCopyMessage = async () => {
    const success = await InvitationService.copyToClipboard(invitationMessage);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleWhatsAppSend = () => {
    if (phoneNumber.trim()) {
      InvitationService.openWhatsApp(phoneNumber, invitationMessage);
    } else {
      alert('Veuillez saisir un numéro de téléphone');
    }
  };

  const handleEmailSend = () => {
    if (email.trim()) {
      const subject = `Invitation - ${userModel.title}`;
      InvitationService.openEmail(email, subject, invitationMessage);
    } else {
      alert('Veuillez saisir une adresse email');
    }
  };

  const handleSMSSend = () => {
    if (phoneNumber.trim()) {
      InvitationService.openSMS(phoneNumber, invitationMessage);
    } else {
      alert('Veuillez saisir un numéro de téléphone');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-luxury max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200/50 bg-gradient-to-r from-neutral-50 to-amber-50/30">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="relative mr-3">
                <Send className="h-6 w-6 text-amber-500 animate-glow drop-shadow-lg" />
                <div className="absolute inset-0 animate-pulse">
                  <Send className="h-6 w-6 text-amber-300 opacity-30" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Envoyer l'invitation
                </h2>
                <p className="text-slate-600 text-sm">
                  Invité: {invite.nom}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
            >
              <X className="h-5 w-5 text-neutral-500" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Informations de l'invité */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl p-4 mb-6 border border-amber-200/50">
            <div className="flex items-center mb-3">
              <User className="h-5 w-5 text-amber-600 mr-2" />
              <h3 className="font-semibold text-amber-800">Détails de l'invitation</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center">
                <User className="h-4 w-4 text-amber-600 mr-2" />
                <span className="text-amber-700">
                  <strong>Invité:</strong> {invite.nom}
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-amber-600 mr-2" />
                <span className="text-amber-700">
                  <strong>Date:</strong> {userModel.eventDate}
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-amber-600 mr-2" />
                <span className="text-amber-700">
                  <strong>Heure:</strong> {userModel.eventTime}
                </span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-amber-600 mr-2" />
                <span className="text-amber-700">
                  <strong>Table:</strong> {invite.table || 'Non assigné'}
                </span>
              </div>
            </div>
          </div>

          {/* Aperçu du lien d'invitation */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-slate-900">Lien d'invitation</h3>
              <button
                onClick={handleCopyMessage}
                className="flex items-center px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all duration-300 text-sm font-medium"
              >
                {copySuccess ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copier le lien
                  </>
                )}
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200/50">
              <div className="bg-emerald-600 text-white p-4 rounded-xl">
                <div className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                  <code className="text-sm break-all">{invitationMessage}</code>
                </div>
              </div>
            </div>
          </div>

          {/* Coordonnées de contact */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Coordonnées de contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Adresse email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                  placeholder="invité@example.com"
                />
              </div>
            </div>
          </div>

          {/* Boutons d'envoi */}
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={handleWhatsAppSend}
              className="flex flex-col items-center p-6 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-all duration-300 font-medium transform hover:scale-105"
            >
              <MessageCircle className="h-8 w-8 mb-3" />
              <span className="text-base font-semibold">WhatsApp</span>
            </button>
            
            <button
              onClick={handleEmailSend}
              className="flex flex-col items-center p-6 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-all duration-300 font-medium transform hover:scale-105"
            >
              <Mail className="h-8 w-8 mb-3" />
              <span className="text-base font-semibold">Email</span>
            </button>
            
            <button
              onClick={handleCopyMessage}
              className="flex flex-col items-center p-6 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-all duration-300 font-medium transform hover:scale-105"
            >
              {copySuccess ? (
                <>
                  <Check className="h-8 w-8 mb-3" />
                  <span className="text-base font-semibold">Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="h-8 w-8 mb-3" />
                  <span className="text-base font-semibold">Copier</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-200/50 bg-gradient-to-r from-neutral-50 to-amber-50/30">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-all duration-200 font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationSendModal;