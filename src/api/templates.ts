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

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class TemplatesAPI {
  // Templates par défaut
  static async getDefaultTemplates(): Promise<APIResponse<TemplateData[]>> {
    try {
      const templatesRef = collection(db, 'templates');
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
      
      const sortedTemplates = templates.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime;
      });

      return { success: true, data: sortedTemplates };
    } catch (error) {
      console.error('Erreur lors de la récupération des templates:', error);
      return { 
        success: false, 
        error: 'Impossible de récupérer les templates' 
      };
    }
  }

  static async getDefaultTemplate(templateId: string): Promise<APIResponse<TemplateData>> {
    try {
      const templateRef = doc(db, 'templates', templateId);
      const templateDoc = await getDoc(templateRef);
      
      if (templateDoc.exists()) {
        const template: TemplateData = {
          id: templateDoc.id,
          ...templateDoc.data()
        } as TemplateData;
        return { success: true, data: template };
      }
      
      return { success: false, error: 'Template non trouvé' };
    } catch (error) {
      console.error('Erreur lors de la récupération du template:', error);
      return { 
        success: false, 
        error: 'Impossible de récupérer le template' 
      };
    }
  }

  static async getTemplatesByCategory(
    category: 'wedding' | 'birthday' | 'graduation'
  ): Promise<APIResponse<TemplateData[]>> {
    try {
      const templatesRef = collection(db, 'templates');
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
      
      return { success: true, data: templates };
    } catch (error) {
      console.error('Erreur lors de la récupération des templates par catégorie:', error);
      return { 
        success: false, 
        error: 'Impossible de récupérer les templates' 
      };
    }
  }

  // Modèles utilisateur
  static async getUserModels(userId: string): Promise<APIResponse<UserModel[]>> {
    try {
      console.log('Chargement des modèles pour l\'utilisateur:', userId);
      const modelsRef = collection(db, 'users', userId, 'UserModel');
      const querySnapshot = await getDocs(modelsRef);
      
      const models: UserModel[] = [];
      querySnapshot.forEach((doc) => {
        console.log('Modèle trouvé:', doc.id, doc.data());
        models.push({
          id: doc.id,
          ...doc.data()
        } as UserModel);
      });
      
      const sortedModels = models.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime;
      });

      console.log('Total modèles chargés:', sortedModels.length);
      return { success: true, data: sortedModels };
    } catch (error) {
      console.error('Erreur lors de la récupération des modèles utilisateur:', error);
      return { 
        success: false, 
        error: 'Impossible de récupérer vos modèles' 
      };
    }
  }

  static async createUserModel(
    userId: string, 
    originalTemplate: TemplateData,
    customizations?: Partial<UserModel>
  ): Promise<APIResponse<string>> {
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

      const modelRef = doc(db, 'users', userId, 'UserModel', modelId);
      await setDoc(modelRef, userModel);
      
      console.log('Modèle utilisateur créé:', modelId);
      return { success: true, data: modelId };
    } catch (error) {
      console.error('Erreur lors de la création du modèle utilisateur:', error);
      return { 
        success: false, 
        error: 'Impossible de créer le modèle personnalisé' 
      };
    }
  }

  static async getUserModel(userId: string, modelId: string): Promise<APIResponse<UserModel>> {
    try {
      const modelRef = doc(db, 'users', userId, 'UserModel', modelId);
      const modelDoc = await getDoc(modelRef);
      
      if (modelDoc.exists()) {
        const model: UserModel = {
          id: modelDoc.id,
          ...modelDoc.data()
        } as UserModel;
        return { success: true, data: model };
      }
      
      return { success: false, error: 'Modèle non trouvé' };
    } catch (error) {
      console.error('Erreur lors de la récupération du modèle utilisateur:', error);
      return { 
        success: false, 
        error: 'Impossible de récupérer le modèle' 
      };
    }
  }

  static async updateUserModel(
    userId: string,
    modelId: string,
    updates: Partial<UserModel>
  ): Promise<APIResponse<void>> {
    try {
      const modelRef = doc(db, 'users', userId, 'UserModel', modelId);
      
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(modelRef, updateData);
      console.log('Modèle utilisateur mis à jour:', modelId);
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du modèle:', error);
      return { 
        success: false, 
        error: 'Impossible de mettre à jour le modèle' 
      };
    }
  }

  static async deleteUserModel(userId: string, modelId: string): Promise<APIResponse<void>> {
    try {
      const modelRef = doc(db, 'users', userId, 'UserModel', modelId);
      await deleteDoc(modelRef);
      console.log('Modèle utilisateur supprimé:', modelId);
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression du modèle:', error);
      return { 
        success: false, 
        error: 'Impossible de supprimer le modèle' 
      };
    }
  }
}