import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

// Traductions
const translations = {
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.templates': 'Modèles',
    'nav.pricing': 'Prix',
    'nav.login': 'Connexion',
    'nav.dashboard': 'Mon Dashboard',
    'nav.logout': 'Se déconnecter',
    
    // Dashboard
    'dashboard.title': 'Tableau de bord',
    'dashboard.welcome': 'Bienvenue',
    'dashboard.overview': 'Vue d\'ensemble',
    'dashboard.events': 'Événements',
    'dashboard.invitations': 'Invitations',
    'dashboard.templates': 'Modèles',
    'dashboard.settings': 'Paramètres',
    'dashboard.profile': 'Profil',
    
    // Invitations
    'invitations.title': 'Gestion des Invitations',
    'invitations.create': 'Créer une invitation',
    'invitations.name': 'Nom',
    'invitations.table': 'Table',
    'invitations.status': 'Statut',
    'invitations.actions': 'Actions',
    'invitations.confirmed': 'Confirmé',
    'invitations.pending': 'En attente',
    'invitations.declined': 'Décliné',
    
    // Templates
    'templates.title': 'Mes Modèles',
    'templates.create': 'Créer un modèle',
    'templates.wedding': 'Mariage',
    'templates.birthday': 'Anniversaire',
    'templates.graduation': 'Collation',
    
    // Common
    'common.save': 'Sauvegarder',
    'common.cancel': 'Annuler',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.view': 'Voir',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    
    // Theme
    'theme.light': 'Mode clair',
    'theme.dark': 'Mode sombre',
    'theme.toggle': 'Basculer le thème',
    
    // Language
    'language.french': 'Français',
    'language.english': 'English',
    'language.select': 'Choisir la langue'
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.templates': 'Templates',
    'nav.pricing': 'Pricing',
    'nav.login': 'Login',
    'nav.dashboard': 'My Dashboard',
    'nav.logout': 'Logout',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome',
    'dashboard.overview': 'Overview',
    'dashboard.events': 'Events',
    'dashboard.invitations': 'Invitations',
    'dashboard.templates': 'Templates',
    'dashboard.settings': 'Settings',
    'dashboard.profile': 'Profile',
    
    // Invitations
    'invitations.title': 'Invitation Management',
    'invitations.create': 'Create invitation',
    'invitations.name': 'Name',
    'invitations.table': 'Table',
    'invitations.status': 'Status',
    'invitations.actions': 'Actions',
    'invitations.confirmed': 'Confirmed',
    'invitations.pending': 'Pending',
    'invitations.declined': 'Declined',
    
    // Templates
    'templates.title': 'My Templates',
    'templates.create': 'Create template',
    'templates.wedding': 'Wedding',
    'templates.birthday': 'Birthday',
    'templates.graduation': 'Graduation',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.view': 'View',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    
    // Theme
    'theme.light': 'Light mode',
    'theme.dark': 'Dark mode',
    'theme.toggle': 'Toggle theme',
    
    // Language
    'language.french': 'Français',
    'language.english': 'English',
    'language.select': 'Select language'
  }
};

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage || 'fr';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};