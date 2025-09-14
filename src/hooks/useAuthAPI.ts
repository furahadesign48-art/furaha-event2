import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { AuthAPI, UserData } from '../api/auth';

export const useAuthAPI = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      setError(null);
      console.log('Changement d\'état d\'authentification:', firebaseUser?.email || 'Déconnecté');

      if (firebaseUser) {
        try {
          const result = await AuthAPI.getUserData(firebaseUser.uid);
          if (result.success) {
            setUser(result.data);
            setFirebaseUser(firebaseUser);
            console.log('Données utilisateur récupérées via API');
          } else {
            setError(result.error || 'Erreur lors de la récupération des données');
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des données utilisateur:', error);
          setError('Erreur lors de la récupération des données utilisateur');
        }
      } else {
        setUser(null);
        setFirebaseUser(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const result = await AuthAPI.register(email, password, firstName, lastName);
      
      if (result.success) {
        setUser(result.data);
        return { success: true, user: result.data };
      } else {
        setError(result.error || 'Erreur d\'inscription');
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      const errorMessage = 'Erreur lors de l\'inscription';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const result = await AuthAPI.login(email, password);
      
      if (result.success) {
        // L'utilisateur sera automatiquement défini via onAuthStateChanged
        return { success: true };
      } else {
        setError(result.error || 'Erreur de connexion');
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      const errorMessage = 'Erreur lors de la connexion';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const result = await AuthAPI.logout();
      if (result.success) {
        setUser(null);
        setFirebaseUser(null);
        return { success: true };
      } else {
        setError(result.error || 'Erreur lors de la déconnexion');
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      const errorMessage = 'Erreur lors de la déconnexion';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      const result = await AuthAPI.resetPassword(email);
      return result;
    } catch (error: any) {
      const errorMessage = 'Erreur lors de la réinitialisation';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateUserProfile = async (updates: Partial<Pick<UserData, 'firstName' | 'lastName'>>) => {
    if (!firebaseUser || !user) return { success: false, error: 'Utilisateur non connecté' };

    try {
      setError(null);
      
      const result = await AuthAPI.updateUserProfile(firebaseUser.uid, updates);
      
      if (result.success) {
        // Mettre à jour l'état local
        setUser(prev => prev ? { ...prev, ...updates } : null);
        return { success: true };
      } else {
        setError(result.error || 'Erreur lors de la mise à jour');
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      const errorMessage = 'Erreur lors de la mise à jour du profil';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return {
    user,
    firebaseUser,
    isAuthenticated: !!user,
    isLoading,
    error,
    register,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    clearError: () => setError(null)
  };
};