import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth as useFirebaseAuth, UserData } from '../hooks/useAuth';

interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<{ success: boolean; error?: string; user?: UserData }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (updates: Partial<Pick<UserData, 'firstName' | 'lastName'>>) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const firebaseAuth = useFirebaseAuth();

  const value: AuthContextType = {
    user: firebaseAuth.user,
    isAuthenticated: firebaseAuth.isAuthenticated,
    login: firebaseAuth.login,
    register: firebaseAuth.register,
    logout: firebaseAuth.logout,
    resetPassword: firebaseAuth.resetPassword,
    updateUserProfile: firebaseAuth.updateUserProfile,
    isLoading: firebaseAuth.isLoading,
    error: firebaseAuth.error,
    clearError: firebaseAuth.clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};