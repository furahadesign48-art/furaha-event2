import { useState, useEffect } from 'react';
import { TemplateService, UserModelService, UserModel, TemplateData, InviteService, Invite } from '../services/templateService';
import { useAuth } from './useAuth';
import { useSubscription } from './useSubscription';

export const useTemplates = () => {
  const { user } = useAuth();
  const { canCreateInvite, updateInviteCount, subscription } = useSubscription();
  const [defaultTemplates, setDefaultTemplates] = useState<TemplateData[]>([]);
  const [userModels, setUserModels] = useState<UserModel[]>([]);
  const [userInvites, setUserInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les templates par défaut
  const loadDefaultTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const templates = await TemplateService.getDefaultTemplates();
      setDefaultTemplates(templates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des templates');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les modèles utilisateur
  const loadUserModels = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const models = await UserModelService.getUserModels(user.id);
      setUserModels(models);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de vos modèles');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les invités utilisateur
  const loadUserInvites = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const invites = await InviteService.getUserInvites(user.id);
      setUserInvites(invites);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de vos invités');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les modèles utilisateur (pour compatibilité)
  const loadUserTemplateReferences = async () => {
    if (!user) return [];
    try {
      const models = await UserModelService.getUserModels(user.id);
      return models;
    } catch (err) {
      console.error('Erreur lors du chargement des références des templates:', err);
      return [];
    }
  };

  // Charger templates par catégorie
  const loadTemplatesByCategory = async (category: 'wedding' | 'birthday' | 'graduation') => {
    try {
      setIsLoading(true);
      setError(null);
      const templates = await TemplateService.getTemplatesByCategory(category);
      return templates;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des templates');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Créer un modèle utilisateur
  const createUserModel = async (
    originalTemplate: TemplateData,
    customizations?: Partial<UserModel>
  ): Promise<string | null> => {
    if (!user) {
      setError('Vous devez être connecté pour créer un modèle');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      const modelId = await UserModelService.createUserModel(
        user.id,
        originalTemplate,
        customizations
      );
      
      // Recharger les modèles utilisateur
      await loadUserModels();
      
      return modelId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du modèle');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Mettre à jour un modèle utilisateur
  const updateUserModel = async (
    modelId: string,
    updates: Partial<UserModel>
  ): Promise<boolean> => {
    if (!user) {
      setError('Vous devez être connecté pour modifier un modèle');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      await UserModelService.updateUserModel(user.id, modelId, updates);
      
      // Recharger les modèles utilisateur
      await loadUserModels();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du modèle');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer un modèle utilisateur
  const deleteUserModel = async (
    modelId: string
  ): Promise<boolean> => {
    if (!user) {
      setError('Vous devez être connecté pour supprimer un modèle');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      await UserModelService.deleteUserModel(user.id, modelId);
      
      // Recharger les modèles utilisateur
      await loadUserModels();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du modèle');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Récupérer un template par défaut spécifique
  const getDefaultTemplate = async (templateId: string): Promise<TemplateData | null> => {
    try {
      setError(null);
      return await TemplateService.getDefaultTemplate(templateId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération du template');
      return null;
    }
  };

  // Récupérer un modèle utilisateur spécifique
  const getUserModel = async (
    modelId: string
  ): Promise<UserModel | null> => {
    if (!user) return null;

    try {
      setError(null);
      return await UserModelService.getUserModel(user.id, modelId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération du modèle');
      return null;
    }
  };

  // Fonctions pour les invités
  const createInvite = async (inviteData: Omit<Invite, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
    if (!user) {
      setError('Vous devez être connecté pour créer un invité');
      return null;
    }

    // Vérification TRIPLE de la limite d'invitations
    const currentCount = userInvites.length;
    console.log('Vérification limite:', { plan: subscription?.plan, currentCount, limit: 5 });
    
    if (subscription?.plan === 'free' && currentCount >= 5) {
      const errorMsg = `LIMITE ATTEINTE: ${currentCount}/5 invitations utilisées. Passez au plan premium pour continuer.`;
      setError(errorMsg);
      console.error(errorMsg);
      return null;
    }

    // Vérification supplémentaire avec canCreateInvite
    if (!canCreateInvite()) {
      setError('Impossible de créer plus d\'invitations avec votre plan actuel.');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      const inviteId = await InviteService.createInvite(user.id, inviteData);
      
      // Mettre à jour le compteur d'abonnement
      if (subscription) {
        await updateInviteCount(currentCount + 1);
      }
      
      // Recharger les invités
      await loadUserInvites();
      
      return inviteId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de l\'invité');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateInvite = async (inviteId: string, updates: Partial<Invite>): Promise<boolean> => {
    if (!user) {
      setError('Vous devez être connecté pour modifier un invité');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      await InviteService.updateInvite(user.id, inviteId, updates);
      
      // Recharger les invités
      await loadUserInvites();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'invité');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteInvite = async (inviteId: string): Promise<boolean> => {
    if (!user) {
      setError('Vous devez être connecté pour supprimer un invité');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      await InviteService.deleteInvite(user.id, inviteId);
      
      // Recharger les invités
      await loadUserInvites();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'invité');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les templates au montage du composant
  useEffect(() => {
    loadDefaultTemplates();
  }, []);

  // Charger les modèles et invités utilisateur quand l'utilisateur change
  useEffect(() => {
    if (user) {
      loadUserModels();
      loadUserInvites();
    } else {
      setUserModels([]);
      setUserInvites([]);
    }
  }, [user]);

  // Fonction pour forcer le rechargement des données
  const refreshUserData = async () => {
    if (user) {
      await Promise.all([
        loadUserModels(),
        loadUserInvites()
      ]);
    }
  };

  return {
    defaultTemplates,
    userModels,
    userInvites,
    isLoading,
    error,
    loadDefaultTemplates,
    loadUserModels,
    loadUserInvites,
    loadUserTemplateReferences,
    loadTemplatesByCategory,
    createUserModel,
    updateUserModel,
    deleteUserModel,
    getDefaultTemplate,
    getUserModel,
    createInvite,
    updateInvite,
    deleteInvite,
    // Compatibilité avec l'ancien nom
    createUserTemplate: createUserModel,
    userTemplates: userModels,
    clearError: () => setError(null),
    refreshUserData
  };
};