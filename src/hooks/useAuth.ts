import { useState } from 'react';

export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  photoURL?: string;
}

// Hook d'authentification simplifié (sans Firebase)
export const useAuth = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setError(null);
      setIsLoading(true);

      // Simulation d'inscription (remplacez par votre logique d'authentification)
      const newUser: UserData = {
        id: `user_${Date.now()}`,
        email,
        firstName,
        lastName,
        createdAt: new Date().toISOString()
      };

      setUser(newUser);
      
      return { success: true, user: newUser };
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

      // Simulation de connexion (remplacez par votre logique d'authentification)
      const mockUser: UserData = {
        id: `user_${Date.now()}`,
        email,
        firstName: 'Utilisateur',
        lastName: 'Test',
        createdAt: new Date().toISOString()
      };

      setUser(mockUser);
      
      return { success: true };
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
      setUser(null);
      return { success: true };
    } catch (error: any) {
      const errorMessage = 'Erreur lors de la déconnexion';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      // Simulation de réinitialisation
      return { success: true };
    } catch (error: any) {
      const errorMessage = 'Erreur lors de la réinitialisation';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateUserProfile = async (updates: Partial<Pick<UserData, 'firstName' | 'lastName'>>) => {
    if (!user) return { success: false, error: 'Utilisateur non connecté' };

    try {
      setError(null);
      setUser(prev => prev ? { ...prev, ...updates } : null);
      return { success: true };
    } catch (error: any) {
      const errorMessage = 'Erreur lors de la mise à jour du profil';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return {
    user,
    firebaseUser: null,
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