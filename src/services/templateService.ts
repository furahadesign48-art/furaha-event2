import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface TemplateData {
  id: string;
  name: string;
  category: 'wedding' | 'birthday' | 'graduation';
  backgroundImage: string;
  title: string;
  invitationText: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  drinkOptions: string[];
  features: string[];
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  isDefault?: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface UserModel extends TemplateData {
  userId: string;
  originalTemplateId: string;
  customizations?: {
    colors?: {
      primary: string;
      secondary: string;
      accent: string;
    };
    fonts?: {
      title: string;
      body: string;
    };
    layout?: string;
  };
}

export interface Invite {
  id: string;
  nom: string;
  table: string;
  etat: 'simple' | 'couple';
  confirmed: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Service pour les templates par défaut
export class TemplateService {
  private static readonly TEMPLATES_COLLECTION = 'templates';

  // Sauvegarder un template par défaut
  static async saveDefaultTemplate(template: TemplateData): Promise<void> {
    try {
      const templateRef = doc(db, this.TEMPLATES_COLLECTION, template.id);
      const templateData = {
        ...template,
        isDefault: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(templateRef, templateData);
      console.log('Template par défaut sauvegardé:', template.id);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du template:', error);
      throw new Error('Impossible de sauvegarder le template');
    }
  }

  // Récupérer tous les templates par défaut
  static async getDefaultTemplates(): Promise<TemplateData[]> {
    try {
      const templatesRef = collection(db, this.TEMPLATES_COLLECTION);
      const q = query(
        templatesRef, 
        where('isDefault', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const templates: TemplateData[] = [];
      
      querySnapshot.forEach((doc) => {
        templates.push({
          id: doc.id,
          ...doc.data()
        } as TemplateData);
      });
      
      return templates.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des templates:', error);
      throw new Error('Impossible de récupérer les templates');
    }
  }

  // Récupérer un template par défaut par ID
  static async getDefaultTemplate(templateId: string): Promise<TemplateData | null> {
    try {
      const templateRef = doc(db, this.TEMPLATES_COLLECTION, templateId);
      const templateDoc = await getDoc(templateRef);
      
      if (templateDoc.exists()) {
        return {
          id: templateDoc.id,
          ...templateDoc.data()
        } as TemplateData;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du template:', error);
      throw new Error('Impossible de récupérer le template');
    }
  }

  // Récupérer templates par catégorie
  static async getTemplatesByCategory(category: 'wedding' | 'birthday' | 'graduation'): Promise<TemplateData[]> {
    try {
      const templatesRef = collection(db, this.TEMPLATES_COLLECTION);
      const q = query(
        templatesRef,
        where('category', '==', category),
        where('isDefault', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const templates: TemplateData[] = [];
      
      querySnapshot.forEach((doc) => {
        templates.push({
          id: doc.id,
          ...doc.data()
        } as TemplateData);
      });
      
      return templates;
    } catch (error) {
      console.error('Erreur lors de la récupération des templates par catégorie:', error);
      throw new Error('Impossible de récupérer les templates');
    }
  }
}

// Service pour les modèles utilisateur (nouvelle structure)
export class UserModelService {
  private static readonly USERS_COLLECTION = 'users';

  // Créer un modèle utilisateur
  static async createUserModel(
    userId: string, 
    originalTemplate: TemplateData,
    customizations?: Partial<UserModel>
  ): Promise<string> {
    try {
      const modelId = `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const userModel: UserModel = {
        ...originalTemplate,
        id: modelId,
        userId,
        originalTemplateId: originalTemplate.id,
        customizations: {
          colors: originalTemplate.colors || {
            primary: '#f59e0b',
            secondary: '#d97706',
            accent: '#f43f5e'
          },
          fonts: {
            title: 'Playfair Display',
            body: 'Inter'
          },
          layout: 'default'
        },
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        ...customizations
      };

      // Sauvegarder dans users/{userId}/UserModel/{modelId}
      const modelRef = doc(db, this.USERS_COLLECTION, userId, 'UserModel', modelId);
      await setDoc(modelRef, userModel);
      
      console.log('Modèle utilisateur créé:', modelId);
      return modelId;
    } catch (error) {
      console.error('Erreur lors de la création du modèle utilisateur:', error);
      throw new Error('Impossible de créer le modèle personnalisé');
    }
  }

  // Récupérer tous les modèles d'un utilisateur
  static async getUserModels(userId: string): Promise<UserModel[]> {
    try {
      console.log('Chargement des modèles pour l\'utilisateur:', userId);
      const modelsRef = collection(db, this.USERS_COLLECTION, userId, 'UserModel');
      const querySnapshot = await getDocs(modelsRef);
      
      const models: UserModel[] = [];
      querySnapshot.forEach((doc) => {
        console.log('Modèle trouvé:', doc.id, doc.data());
        models.push({
          id: doc.id,
          ...doc.data()
        } as UserModel);
      });
      
      console.log('Total modèles chargés:', models.length);
      return models.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des modèles utilisateur:', error);
      throw new Error('Impossible de récupérer vos modèles');
    }
  }

  // Récupérer un modèle utilisateur spécifique
  static async getUserModel(userId: string, modelId: string): Promise<UserModel | null> {
    try {
      const modelRef = doc(db, this.USERS_COLLECTION, userId, 'UserModel', modelId);
      const modelDoc = await getDoc(modelRef);
      
      if (modelDoc.exists()) {
        return {
          id: modelDoc.id,
          ...modelDoc.data()
        } as UserModel;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du modèle utilisateur:', error);
      throw new Error('Impossible de récupérer le modèle');
    }
  }

  // Mettre à jour un modèle utilisateur
  static async updateUserModel(
    userId: string,
    modelId: string,
    updates: Partial<UserModel>
  ): Promise<void> {
    try {
      const modelRef = doc(db, this.USERS_COLLECTION, userId, 'UserModel', modelId);
      
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(modelRef, updateData);
      console.log('Modèle utilisateur mis à jour:', modelId);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du modèle:', error);
      throw new Error('Impossible de mettre à jour le modèle');
    }
  }

  // Supprimer un modèle utilisateur
  static async deleteUserModel(userId: string, modelId: string): Promise<void> {
    try {
      const modelRef = doc(db, this.USERS_COLLECTION, userId, 'UserModel', modelId);
      await deleteDoc(modelRef);
      console.log('Modèle utilisateur supprimé:', modelId);
    } catch (error) {
      console.error('Erreur lors de la suppression du modèle:', error);
      throw new Error('Impossible de supprimer le modèle');
    }
  }
}

// Service pour les invités
export class InviteService {
  private static readonly USERS_COLLECTION = 'users';

  // Créer un invité
  static async createInvite(userId: string, inviteData: Omit<Invite, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const inviteId = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const invite: Invite = {
        id: inviteId,
        ...inviteData,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      };

      // Sauvegarder dans users/{userId}/Invites/{inviteId}
      const inviteRef = doc(db, this.USERS_COLLECTION, userId, 'Invites', inviteId);
      await setDoc(inviteRef, invite);
      
      // Créer une référence globale pour faciliter la récupération
      const globalInviteRef = doc(db, 'globalInvitations', inviteId);
      await setDoc(globalInviteRef, {
        userId: userId,
        inviteId: inviteId,
        createdAt: serverTimestamp()
      });
      
      console.log('Invité créé:', inviteId);
      return inviteId;
    } catch (error) {
      console.error('Erreur lors de la création de l\'invité:', error);
      throw new Error('Impossible de créer l\'invité');
    }
  }

  // Récupérer tous les invités d'un utilisateur
  static async getUserInvites(userId: string): Promise<Invite[]> {
    try {
      console.log('Chargement des invités pour l\'utilisateur:', userId);
      const invitesRef = collection(db, this.USERS_COLLECTION, userId, 'Invites');
      const querySnapshot = await getDocs(invitesRef);
      
      const invites: Invite[] = [];
      querySnapshot.forEach((doc) => {
        console.log('Invité trouvé:', doc.id, doc.data());
        invites.push({
          id: doc.id,
          ...doc.data()
        } as Invite);
      });
      
      console.log('Total invités chargés:', invites.length);
      return invites.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des invités:', error);
      throw new Error('Impossible de récupérer les invités');
    }
  }

  // Récupérer un invité spécifique
  static async getInvite(userId: string, inviteId: string): Promise<(Invite & { userId: string }) | null> {
    try {
      const inviteRef = doc(db, this.USERS_COLLECTION, userId, 'Invites', inviteId);
      const inviteDoc = await getDoc(inviteRef);
      
      if (inviteDoc.exists()) {
        return {
          id: inviteDoc.id,
          userId: userId,
          ...inviteDoc.data()
        } as (Invite & { userId: string });
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'invité:', error);
      throw new Error('Impossible de récupérer l\'invité');
    }
  }

  // Nouvelle méthode pour récupérer un invité par ID global (recherche dans tous les utilisateurs)
  static async getInviteGlobal(inviteId: string): Promise<(Invite & { userId: string }) | null> {
    try {
      // Créer une collection globale d'invitations pour mapper inviteId -> userId
      const globalInviteRef = doc(db, 'globalInvitations', inviteId);
      const globalInviteDoc = await getDoc(globalInviteRef);
      
      if (globalInviteDoc.exists()) {
        const globalData = globalInviteDoc.data();
        const userId = globalData.userId;
        
        // Récupérer l'invitation complète
        const inviteData = await this.getInvite(userId, inviteId);
        return inviteData;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération globale de l\'invité:', error);
      throw new Error('Impossible de récupérer l\'invité');
    }
  }

  // Mettre à jour un invité
  static async updateInvite(
    userId: string,
    inviteId: string,
    updates: Partial<Invite>
  ): Promise<void> {
    try {
      const inviteRef = doc(db, this.USERS_COLLECTION, userId, 'Invites', inviteId);
      
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(inviteRef, updateData);
      console.log('Invité mis à jour:', inviteId);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'invité:', error);
      throw new Error('Impossible de mettre à jour l\'invité');
    }
  }

  // Supprimer un invité
  static async deleteInvite(userId: string, inviteId: string): Promise<void> {
    try {
      const inviteRef = doc(db, this.USERS_COLLECTION, userId, 'Invites', inviteId);
      await deleteDoc(inviteRef);
      
      // Supprimer aussi la référence globale
      const globalInviteRef = doc(db, 'globalInvitations', inviteId);
      await deleteDoc(globalInviteRef);
      
      console.log('Invité supprimé:', inviteId);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'invité:', error);
      throw new Error('Impossible de supprimer l\'invité');
    }
  }

  // Mettre à jour les informations d'un invité (confirmation, boissons, vœux)
  static async updateInviteResponse(
    userId: string,
    inviteId: string,
    responseData: {
      confirmed?: boolean;
      statut?: 'pending' | 'confirmed' | 'declined';
      boissons?: string;
      voeux?: string;
    }
  ): Promise<void> {
    try {
      const inviteRef = doc(db, this.USERS_COLLECTION, userId, 'Invites', inviteId);
      
      const updateData = {
        ...responseData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(inviteRef, updateData);
      console.log('Réponse de l\'invité mise à jour:', inviteId);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la réponse:', error);
      throw new Error('Impossible de mettre à jour la réponse');
    }
  }
}

// Fonction utilitaire pour initialiser les templates par défaut
export const initializeDefaultTemplates = async (): Promise<void> => {
  try {
    // Template Mariage
    const weddingTemplate: TemplateData = {
      id: 'wedding-gold-premium',
      name: 'Mariage Gold Premium',
      category: 'wedding',
      backgroundImage: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=1200',
      title: 'Mariage de [Prénom Mariée] & [Prénom Marié]',
      invitationText: 'Nous avons l\'honneur de vous inviter à célébrer notre union dans la joie et l\'amour. Votre présence sera le plus beau des cadeaux pour ce jour si spécial.',
      eventDate: '[Date de l\'événement]',
      eventTime: '[Heure de l\'événement]',
      eventLocation: '[Lieu de l\'événement]',
      drinkOptions: ['Champagne', 'Vin Rouge', 'Vin Blanc', 'Cocktail Sans Alcool', 'Eau'],
      features: [
        'Photo de fond romantique',
        'Titre personnalisable',
        'Texte d\'invitation modifiable',
        'Nom de l\'invité dynamique',
        'Numéro de table automatique',
        'Date et lieu de l\'événement',
        'Livre d\'or interactif',
        'Confirmation de présence',
        'Choix de boisson',
        'QR Code unique'
      ],
      colors: {
        primary: '#f59e0b',
        secondary: '#d97706',
        accent: '#f43f5e'
      }
    };

    // Template Anniversaire
    const birthdayTemplate: TemplateData = {
      id: 'birthday-celebration-premium',
      name: 'Anniversaire Celebration Premium',
      category: 'birthday',
      backgroundImage: 'https://images.pexels.com/photos/1729808/pexels-photo-1729808.jpeg?auto=compress&cs=tinysrgb&w=1200',
      title: 'Joyeux Anniversaire [Prénom] !',
      invitationText: 'Venez célébrer avec moi cette journée spéciale ! Votre présence sera le plus beau des cadeaux pour marquer mes [Âge] ans dans la joie et la bonne humeur.',
      eventDate: '[Date de l\'événement]',
      eventTime: '[Heure de l\'événement]',
      eventLocation: '[Lieu de l\'événement]',
      drinkOptions: ['Cocktail Signature', 'Champagne', 'Vin Rouge', 'Vin Blanc', 'Jus de Fruits', 'Eau'],
      features: [
        'Photo de fond festive',
        'Titre personnalisable',
        'Texte d\'invitation modifiable',
        'Nom de l\'invité dynamique',
        'Numéro de table automatique',
        'Date et lieu de l\'événement',
        'Livre d\'or interactif',
        'Confirmation de présence',
        'Choix de boisson',
        'QR Code unique',
        'Galerie de souvenirs',
        'Vœux des invités'
      ],
      colors: {
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        accent: '#ec4899'
      }
    };

    // Template Collation
    const graduationTemplate: TemplateData = {
      id: 'graduation-achievement-premium',
      name: 'Collation Achievement Premium',
      category: 'graduation',
      backgroundImage: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=1200',
      title: 'Collation de Grade - [Prénom] [Nom]',
      invitationText: 'Après des années d\'efforts et de persévérance, j\'ai l\'honneur de vous inviter à célébrer l\'obtention de mon diplôme. Votre présence rendrait ce moment encore plus mémorable.',
      eventDate: '[Date de l\'événement]',
      eventTime: '[Heure de l\'événement]',
      eventLocation: '[Lieu de l\'événement]',
      drinkOptions: ['Champagne', 'Vin d\'Honneur', 'Jus de Fruits', 'Eau Pétillante', 'Café', 'Thé'],
      features: [
        'Photo de diplôme',
        'Titre personnalisable',
        'Texte de félicitations',
        'Nom de l\'invité dynamique',
        'Numéro de place automatique',
        'Date et lieu de cérémonie',
        'Livre d\'or interactif',
        'Confirmation de présence',
        'Choix de boisson',
        'QR Code unique',
        'Galerie de souvenirs',
        'Messages de félicitations'
      ],
      colors: {
        primary: '#10b981',
        secondary: '#059669',
        accent: '#3b82f6'
      }
    };

    // Sauvegarder tous les templates par défaut
    await Promise.all([
      TemplateService.saveDefaultTemplate(weddingTemplate),
      TemplateService.saveDefaultTemplate(birthdayTemplate),
      TemplateService.saveDefaultTemplate(graduationTemplate)
    ]);

    console.log('Templates par défaut initialisés avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des templates:', error);
  }
};

// Maintenir la compatibilité avec l'ancien service
export const UserTemplateService = UserModelService;