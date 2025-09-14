import { useState, useEffect, useCallback } from 'react';
import { TemplatesAPI, TemplateData, UserModel } from '../api/templates';
import { InvitesAPI, Invite } from '../api/invites';
import { TablesAPI, Table } from '../api/tables';
import { useAuth } from '../components/AuthContext';
import { useSubscription } from './useSubscription';

export const useTemplatesAPI = () => {
  const { user } = useAuth();
  const { updateInviteCount, subscription } = useSubscription();
  const [defaultTemplates, setDefaultTemplates] = useState<TemplateData[]>([]);
  const [userModels, setUserModels] = useState<UserModel[]>([]);
  const [userInvites, setUserInvites] = useState<Invite[]>([]);
  const [userTables, setUserTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les templates par défaut
  const loadDefaultTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await TemplatesAPI.getDefaultTemplates();
      if (result.success) {
        setDefaultTemplates(result.data || []);
      } else {
        setError(result.error || 'Erreur lors du chargement des templates');
      }
    } catch (err) {
      setError('Erreur lors du chargement des templates');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les modèles utilisateur
  const loadUserModels = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const result = await TemplatesAPI.getUserModels(user.id);
      if (result.success) {
        setUserModels(result.data || []);
      } else {
        setError(result.error || 'Erreur lors du chargement de vos modèles');
      }
    } catch (err) {
      setError('Erreur lors du chargement de vos modèles');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Charger les invités utilisateur
  const loadUserInvites = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const result = await InvitesAPI.getUserInvites(user.id);
      if (result.success) {
        setUserInvites(result.data || []);
      } else {
        setError(result.error || 'Erreur lors du chargement de vos invités');
      }
    } catch (err) {
      setError('Erreur lors du chargement de vos invités');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Charger les tables utilisateur
  const loadUserTables = useCallback(async () => {
    if (!user) return;
    
    try {
      setError(null);
      const result = await TablesAPI.getUserTables(user.id);
      if (result.success) {
        setUserTables(result.data || []);
      } else {
        setError(result.error || 'Erreur lors du chargement de vos tables');
      }
    } catch (err) {
      setError('Erreur lors du chargement de vos tables');
    }
  }, [user]);

  // Charger templates par catégorie
  const loadTemplatesByCategory = async (category: 'wedding' | 'birthday' | 'graduation') => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await TemplatesAPI.getTemplatesByCategory(category);
      if (result.success) {
        return result.data || [];
      } else {
        setError(result.error || 'Erreur lors du chargement des templates');
        return [];
      }
    } catch (err) {
      setError('Erreur lors du chargement des templates');
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
      const result = await TemplatesAPI.createUserModel(
        user.id,
        originalTemplate,
        customizations
      );
      
      if (result.success) {
        // Recharger les modèles utilisateur
        await loadUserModels();
        return result.data || null;
      } else {
        setError(result.error || 'Erreur lors de la création du modèle');
        return null;
      }
    } catch (err) {
      setError('Erreur lors de la création du modèle');
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
      const result = await TemplatesAPI.updateUserModel(user.id, modelId, updates);
      
      if (result.success) {
        // Recharger les modèles utilisateur
        await loadUserModels();
        return true;
      } else {
        setError(result.error || 'Erreur lors de la mise à jour du modèle');
        return false;
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour du modèle');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer un modèle utilisateur
  const deleteUserModel = async (modelId: string): Promise<boolean> => {
    if (!user) {
      setError('Vous devez être connecté pour supprimer un modèle');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await TemplatesAPI.deleteUserModel(user.id, modelId);
      
      if (result.success) {
        // Recharger les modèles utilisateur
        await loadUserModels();
        return true;
      } else {
        setError(result.error || 'Erreur lors de la suppression du modèle');
        return false;
      }
    } catch (err) {
      setError('Erreur lors de la suppression du modèle');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Récupérer un template par défaut spécifique
  const getDefaultTemplate = async (templateId: string): Promise<TemplateData | null> => {
    try {
      setError(null);
      const result = await TemplatesAPI.getDefaultTemplate(templateId);
      if (result.success) {
        return result.data || null;
      } else {
        setError(result.error || 'Erreur lors de la récupération du template');
        return null;
      }
    } catch (err) {
      setError('Erreur lors de la récupération du template');
      return null;
    }
  };

  // Récupérer un modèle utilisateur spécifique
  const getUserModel = async (modelId: string): Promise<UserModel | null> => {
    if (!user) return null;

    try {
      setError(null);
      const result = await TemplatesAPI.getUserModel(user.id, modelId);
      if (result.success) {
        return result.data || null;
      } else {
        setError(result.error || 'Erreur lors de la récupération du modèle');
        return null;
      }
    } catch (err) {
      setError('Erreur lors de la récupération du modèle');
      return null;
    }
  };

  // Fonctions pour les invités
  const createInvite = async (inviteData: Omit<Invite, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
    if (!user) {
      setError('Vous devez être connecté pour créer un invité');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await InvitesAPI.createInvite(user.id, inviteData);
      
      if (result.success) {
        // Mettre à jour le compteur d'abonnement
        const currentCount = userInvites.length;
        if (subscription) {
          await updateInviteCount(currentCount + 1);
        }
        
        // Recharger les invités
        await loadUserInvites();
        return result.data || null;
      } else {
        setError(result.error || 'Erreur lors de la création de l\'invité');
        return null;
      }
    } catch (err) {
      setError('Erreur lors de la création de l\'invité');
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
      const result = await InvitesAPI.updateInvite(user.id, inviteId, updates);
      
      if (result.success) {
        // Recharger les invités
        await loadUserInvites();
        return true;
      } else {
        setError(result.error || 'Erreur lors de la mise à jour de l\'invité');
        return false;
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour de l\'invité');
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
      const result = await InvitesAPI.deleteInvite(user.id, inviteId);
      
      if (result.success) {
        // Recharger les invités
        await loadUserInvites();
        return true;
      } else {
        setError(result.error || 'Erreur lors de la suppression de l\'invité');
        return false;
      }
    } catch (err) {
      setError('Erreur lors de la suppression de l\'invité');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonctions pour les tables
  const createTable = async (tableData: Omit<Table, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
    if (!user) {
      setError('Vous devez être connecté pour créer une table');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await TablesAPI.createTable(user.id, tableData);
      
      if (result.success) {
        // Recharger les tables
        await loadUserTables();
        return result.data || null;
      } else {
        setError(result.error || 'Erreur lors de la création de la table');
        return null;
      }
    } catch (err) {
      setError('Erreur lors de la création de la table');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTable = async (tableId: string, updates: Partial<Table>): Promise<boolean> => {
    if (!user) {
      setError('Vous devez être connecté pour modifier une table');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await TablesAPI.updateTable(user.id, tableId, updates);
      
      if (result.success) {
        // Recharger les tables
        await loadUserTables();
        return true;
      } else {
        setError(result.error || 'Erreur lors de la mise à jour de la table');
        return false;
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour de la table');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTable = async (tableId: string): Promise<boolean> => {
    if (!user) {
      setError('Vous devez être connecté pour supprimer une table');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await TablesAPI.deleteTable(user.id, tableId);
      
      if (result.success) {
        // Recharger les tables
        await loadUserTables();
        return true;
      } else {
        setError(result.error || 'Erreur lors de la suppression de la table');
        return false;
      }
    } catch (err) {
      setError('Erreur lors de la suppression de la table');
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
      loadUserTables();
    } else {
      setUserModels([]);
      setUserInvites([]);
      setUserTables([]);
    }
  }, [user, loadUserModels, loadUserInvites, loadUserTables]);

  // Fonction pour forcer le rechargement des données
  const refreshUserData = useCallback(async () => {
    if (user) {
      await Promise.all([
        loadUserModels(),
        loadUserInvites(),
        loadUserTables()
      ]);
    }
  }, [user, loadUserModels, loadUserInvites, loadUserTables]);

  return {
    defaultTemplates,
    userModels,
    userInvites,
    userTables,
    isLoading,
    error,
    loadDefaultTemplates,
    loadUserModels,
    loadUserInvites,
    loadUserTables,
    loadTemplatesByCategory,
    createUserModel,
    updateUserModel,
    deleteUserModel,
    getDefaultTemplate,
    getUserModel,
    createInvite,
    updateInvite,
    deleteInvite,
    createTable,
    updateTable,
    deleteTable,
    // Compatibilité avec l'ancien nom
    createUserTemplate: createUserModel,
    userTemplates: userModels,
    clearError: () => setError(null),
    refreshUserData
  };
};