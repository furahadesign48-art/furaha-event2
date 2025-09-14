import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Invite {
  id: string;
  nom: string;
  table: string;
  etat: 'simple' | 'couple';
  confirmed: boolean;
  selectedDrink?: string;
  message?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class InvitesAPI {
  static async createInvite(
    userId: string, 
    inviteData: Omit<Invite, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<APIResponse<string>> {
    try {
      const inviteId = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('Création de l\'invitation avec ID:', inviteId, 'pour l\'utilisateur:', userId);
      
      const invite: Invite = {
        id: inviteId,
        ...inviteData,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      };

      const inviteRef = doc(db, 'users', userId, 'invites', inviteId);
      await setDoc(inviteRef, invite);
      
      console.log('Invitation créée avec succès:', inviteId);
      return { success: true, data: inviteId };
    } catch (error) {
      console.error('Erreur lors de la création de l\'invité:', error);
      return { 
        success: false, 
        error: 'Impossible de créer l\'invité' 
      };
    }
  }

  static async getUserInvites(userId: string): Promise<APIResponse<Invite[]>> {
    try {
      console.log('Chargement des invités pour l\'utilisateur:', userId);
      const invitesRef = collection(db, 'users', userId, 'invites');
      const querySnapshot = await getDocs(invitesRef);
      
      const invites: Invite[] = [];
      querySnapshot.forEach((doc) => {
        console.log('Invité trouvé:', doc.id, doc.data());
        invites.push({
          id: doc.id,
          ...doc.data()
        } as Invite);
      });
      
      const sortedInvites = invites.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime;
      });

      console.log('Total invités chargés:', sortedInvites.length);
      return { success: true, data: sortedInvites };
    } catch (error) {
      console.error('Erreur lors de la récupération des invités:', error);
      return { 
        success: false, 
        error: 'Impossible de récupérer les invités' 
      };
    }
  }

  static async getInvite(
    userId: string, 
    inviteId: string
  ): Promise<APIResponse<Invite & { userId: string }>> {
    try {
      const inviteRef = doc(db, 'users', userId, 'invites', inviteId);
      const inviteDoc = await getDoc(inviteRef);
      
      if (inviteDoc.exists()) {
        const invite = {
          id: inviteDoc.id,
          userId: userId,
          ...inviteDoc.data()
        } as (Invite & { userId: string });
        return { success: true, data: invite };
      }
      
      return { success: false, error: 'Invité non trouvé' };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'invité:', error);
      return { 
        success: false, 
        error: 'Impossible de récupérer l\'invité' 
      };
    }
  }

  static async getInviteGlobal(inviteId: string): Promise<APIResponse<Invite & { userId: string }>> {
    try {
      console.log('Recherche de l\'invitation:', inviteId);
      
      // Rechercher dans tous les utilisateurs
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        console.log('Vérification utilisateur:', userId);
        
        try {
          const inviteRef = doc(db, 'users', userId, 'invites', inviteId);
          const inviteDoc = await getDoc(inviteRef);
          
          if (inviteDoc.exists()) {
            console.log('Invitation trouvée pour l\'utilisateur:', userId);
            const inviteData = inviteDoc.data();
            const invite = {
              id: inviteDoc.id,
              userId: userId,
              ...inviteData
            } as (Invite & { userId: string });
            return { success: true, data: invite };
          }
        } catch (error) {
          console.log('Erreur lors de la vérification pour l\'utilisateur', userId, ':', error);
          continue;
        }
      }
      
      console.log('Invitation non trouvée dans tous les utilisateurs');
      return { success: false, error: 'Invitation non trouvée' };
    } catch (error) {
      console.error('Erreur lors de la récupération globale de l\'invité:', error);
      return { 
        success: false, 
        error: 'Impossible de récupérer l\'invité' 
      };
    }
  }

  static async updateInvite(
    userId: string,
    inviteId: string,
    updates: Partial<Invite>
  ): Promise<APIResponse<void>> {
    try {
      const inviteRef = doc(db, 'users', userId, 'invites', inviteId);
      
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(inviteRef, updateData);
      console.log('Invité mis à jour:', inviteId);
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'invité:', error);
      return { 
        success: false, 
        error: 'Impossible de mettre à jour l\'invité' 
      };
    }
  }

  static async deleteInvite(userId: string, inviteId: string): Promise<APIResponse<void>> {
    try {
      const inviteRef = doc(db, 'users', userId, 'invites', inviteId);
      await deleteDoc(inviteRef);
      
      console.log('Invité supprimé:', inviteId);
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'invité:', error);
      return { 
        success: false, 
        error: 'Impossible de supprimer l\'invité' 
      };
    }
  }

  static async updateInviteResponse(
    userId: string,
    inviteId: string,
    responseData: {
      confirmed?: boolean;
      selectedDrink?: string;
      message?: string;
    }
  ): Promise<APIResponse<void>> {
    try {
      const inviteRef = doc(db, 'users', userId, 'invites', inviteId);
      
      const updateData = {
        ...responseData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(inviteRef, updateData);
      console.log('Réponse de l\'invité mise à jour:', inviteId);
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la réponse:', error);
      return { 
        success: false, 
        error: 'Impossible de mettre à jour la réponse' 
      };
    }
  }
}