import { UserModel, Invite } from './templateService';

export interface InvitationMessage {
  recipientName: string;
  recipientPhone?: string;
  recipientEmail?: string;
  invitationUrl: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
}

export class InvitationService {
  // Générer l'URL d'invitation
  static generateInvitationUrl(inviteId: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/invitation/${inviteId}`;
  }

  // Générer le message d'invitation personnalisé
  static generateInvitationMessage(
    invite: Invite, 
    userModel: UserModel, 
    invitationUrl: string
  ): string {
    return invitationUrl;
  }

  // Générer le message d'invitation avec plus de détails
  static generateDetailedInvitationMessage(
    invite: Invite, 
    userModel: UserModel, 
    invitationUrl: string
  ): string {
    return invitationUrl;
  }

  // Obtenir le texte du type d'événement
  private static getEventTypeText(category: string): string {
    switch (category) {
      case 'wedding':
        return 'notre mariage';
      case 'birthday':
        return 'notre anniversaire';
      case 'graduation':
        return 'notre collation de grade';
      default:
        return 'notre événement';
    }
  }

  // Copier le message dans le presse-papiers
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      // Fallback pour les navigateurs plus anciens
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (fallbackError) {
        console.error('Erreur lors de la copie (fallback):', fallbackError);
        return false;
      }
    }
  }

  // Ouvrir WhatsApp avec le message pré-rempli
  static openWhatsApp(phoneNumber: string, message: string): void {
    // Nettoyer le numéro de téléphone
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }

  // Ouvrir l'application email avec le message pré-rempli
  static openEmail(email: string, subject: string, message: string): void {
    const encodedSubject = encodeURIComponent(subject);
    const encodedMessage = encodeURIComponent(message);
    const emailUrl = `mailto:${email}?subject=${encodedSubject}&body=${encodedMessage}`;
    window.open(emailUrl, '_blank');
  }

  // Ouvrir SMS avec le message pré-rempli
  static openSMS(phoneNumber: string, message: string): void {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    const smsUrl = `sms:${cleanPhone}?body=${encodedMessage}`;
    window.open(smsUrl, '_blank');
  }

  // Partager via l'API Web Share (si disponible)
  static async shareViaWebShare(
    invite: Invite, 
    userModel: UserModel, 
    invitationUrl: string
  ): Promise<boolean> {
    if (!navigator.share) {
      return false;
    }

    try {
      const message = this.generateInvitationMessage(invite, userModel, invitationUrl);
      await navigator.share({
        title: `Invitation - ${userModel.title}`,
        text: message,
        url: invitationUrl
      });
      return true;
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      return false;
    }
  }
}