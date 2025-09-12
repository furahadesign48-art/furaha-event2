import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'fr' | 'en' | 'es';

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

// Dictionnaire des traductions
const translations = {
  fr: {
    // Navigation principale
    'home': 'Accueil',
    'pricing': 'Prix',
    'login': 'Connexion',
    
    // Navigation
    'dashboard': 'Tableau de bord',
    'templates': 'Modèles',
    'guests': 'Invités',
    'tables': 'Tables',
    'analytics': 'Statistiques',
    'profile': 'Profil',
    'settings': 'Paramètres',
    'logout': 'Déconnexion',
    
    // Actions
    'create': 'Créer',
    'edit': 'Modifier',
    'delete': 'Supprimer',
    'save': 'Sauvegarder',
    'cancel': 'Annuler',
    'confirm': 'Confirmer',
    'back': 'Retour',
    'next': 'Suivant',
    'previous': 'Précédent',
    'close': 'Fermer',
    'view': 'Voir',
    'download': 'Télécharger',
    'upload': 'Télécharger',
    'send': 'Envoyer',
    'add': 'Ajouter',
    'remove': 'Supprimer',
    
    // Statuts
    'confirmed': 'Confirmé',
    'pending': 'En attente',
    'declined': 'Décliné',
    'active': 'Actif',
    'inactive': 'Inactif',
    'completed': 'Terminé',
    'draft': 'Brouillon',
    
    // Messages
    'welcome': 'Bienvenue',
    'loading': 'Chargement...',
    'error': 'Erreur',
    'success': 'Succès',
    'warning': 'Attention',
    'info': 'Information',
    'no_data': 'Aucune donnée disponible',
    'search': 'Rechercher',
    'filter': 'Filtrer',
    'sort': 'Trier',
    
    // Dashboard
    'total_invitations': 'Total invitations',
    'confirmed_guests': 'Invités confirmés',
    'pending_responses': 'Réponses en attente',
    'total_tables': 'Total tables',
    'recent_activity': 'Activité récente',
    'quick_actions': 'Actions rapides',
    'create_invitation': 'Créer une invitation',
    'manage_guests': 'Gérer les invités',
    'view_analytics': 'Voir les statistiques',
    
    // Invités
    'guest_name': 'Nom de l\'invité',
    'table_number': 'Numéro de table',
    'guest_type': 'Type d\'invité',
    'single': 'Simple',
    'couple': 'Couple',
    'confirmation_status': 'Statut de confirmation',
    'drink_choice': 'Choix de boisson',
    'message': 'Message',
    
    // Tables
    'table_name': 'Nom de la table',
    'seats': 'Places',
    'assigned_guests': 'Invités assignés',
    'available_seats': 'Places disponibles',
    'table_status': 'Statut de la table',
    'full': 'Complète',
    'partial': 'Partielle',
    'empty': 'Vide',
    
    // Paramètres
    'language': 'Langue',
    'theme': 'Thème',
    'light_mode': 'Mode clair',
    'dark_mode': 'Mode sombre',
    'notifications': 'Notifications',
    'privacy': 'Confidentialité',
    'account': 'Compte',
    
    // Profil
    'personal_info': 'Informations personnelles',
    'first_name': 'Prénom',
    'last_name': 'Nom',
    'email': 'Email',
    'phone': 'Téléphone',
    'address': 'Adresse',
    'member_since': 'Membre depuis',
    'subscription': 'Abonnement',
    
    // Erreurs
    'required_field': 'Ce champ est requis',
    'invalid_email': 'Email invalide',
    'password_too_short': 'Mot de passe trop court',
    'passwords_dont_match': 'Les mots de passe ne correspondent pas',
    'network_error': 'Erreur de connexion',
    'server_error': 'Erreur serveur',
    'not_found': 'Non trouvé',
    'unauthorized': 'Non autorisé',
    'forbidden': 'Accès interdit'
  },
  
  en: {
    // Navigation principale
    'home': 'Home',
    'pricing': 'Pricing',
    'login': 'Login',
    
    // Navigation
    'dashboard': 'Dashboard',
    'templates': 'Templates',
    'guests': 'Guests',
    'tables': 'Tables',
    'analytics': 'Analytics',
    'profile': 'Profile',
    'settings': 'Settings',
    'logout': 'Logout',
    
    // Actions
    'create': 'Create',
    'edit': 'Edit',
    'delete': 'Delete',
    'save': 'Save',
    'cancel': 'Cancel',
    'confirm': 'Confirm',
    'back': 'Back',
    'next': 'Next',
    'previous': 'Previous',
    'close': 'Close',
    'view': 'View',
    'download': 'Download',
    'upload': 'Upload',
    'send': 'Send',
    'add': 'Add',
    'remove': 'Remove',
    
    // Statuts
    'confirmed': 'Confirmed',
    'pending': 'Pending',
    'declined': 'Declined',
    'active': 'Active',
    'inactive': 'Inactive',
    'completed': 'Completed',
    'draft': 'Draft',
    
    // Messages
    'welcome': 'Welcome',
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'warning': 'Warning',
    'info': 'Information',
    'no_data': 'No data available',
    'search': 'Search',
    'filter': 'Filter',
    'sort': 'Sort',
    
    // Dashboard
    'total_invitations': 'Total invitations',
    'confirmed_guests': 'Confirmed guests',
    'pending_responses': 'Pending responses',
    'total_tables': 'Total tables',
    'recent_activity': 'Recent activity',
    'quick_actions': 'Quick actions',
    'create_invitation': 'Create invitation',
    'manage_guests': 'Manage guests',
    'view_analytics': 'View analytics',
    
    // Invités
    'guest_name': 'Guest name',
    'table_number': 'Table number',
    'guest_type': 'Guest type',
    'single': 'Single',
    'couple': 'Couple',
    'confirmation_status': 'Confirmation status',
    'drink_choice': 'Drink choice',
    'message': 'Message',
    
    // Tables
    'table_name': 'Table name',
    'seats': 'Seats',
    'assigned_guests': 'Assigned guests',
    'available_seats': 'Available seats',
    'table_status': 'Table status',
    'full': 'Full',
    'partial': 'Partial',
    'empty': 'Empty',
    
    // Paramètres
    'language': 'Language',
    'theme': 'Theme',
    'light_mode': 'Light mode',
    'dark_mode': 'Dark mode',
    'notifications': 'Notifications',
    'privacy': 'Privacy',
    'account': 'Account',
    
    // Profil
    'personal_info': 'Personal information',
    'first_name': 'First name',
    'last_name': 'Last name',
    'email': 'Email',
    'phone': 'Phone',
    'address': 'Address',
    'member_since': 'Member since',
    'subscription': 'Subscription',
    
    // Erreurs
    'required_field': 'This field is required',
    'invalid_email': 'Invalid email',
    'password_too_short': 'Password too short',
    'passwords_dont_match': 'Passwords don\'t match',
    'network_error': 'Network error',
    'server_error': 'Server error',
    'not_found': 'Not found',
    'unauthorized': 'Unauthorized',
    'forbidden': 'Access forbidden'
  },
  
  es: {
    // Navigation principale
    'home': 'Inicio',
    'pricing': 'Precios',
    'login': 'Iniciar sesión',
    
    // Navigation
    'dashboard': 'Panel de control',
    'templates': 'Plantillas',
    'guests': 'Invitados',
    'tables': 'Mesas',
    'analytics': 'Estadísticas',
    'profile': 'Perfil',
    'settings': 'Configuración',
    'logout': 'Cerrar sesión',
    
    // Actions
    'create': 'Crear',
    'edit': 'Editar',
    'delete': 'Eliminar',
    'save': 'Guardar',
    'cancel': 'Cancelar',
    'confirm': 'Confirmar',
    'back': 'Atrás',
    'next': 'Siguiente',
    'previous': 'Anterior',
    'close': 'Cerrar',
    'view': 'Ver',
    'download': 'Descargar',
    'upload': 'Subir',
    'send': 'Enviar',
    'add': 'Añadir',
    'remove': 'Quitar',
    
    // Statuts
    'confirmed': 'Confirmado',
    'pending': 'Pendiente',
    'declined': 'Rechazado',
    'active': 'Activo',
    'inactive': 'Inactivo',
    'completed': 'Completado',
    'draft': 'Borrador',
    
    // Messages
    'welcome': 'Bienvenido',
    'loading': 'Cargando...',
    'error': 'Error',
    'success': 'Éxito',
    'warning': 'Advertencia',
    'info': 'Información',
    'no_data': 'No hay datos disponibles',
    'search': 'Buscar',
    'filter': 'Filtrar',
    'sort': 'Ordenar',
    
    // Dashboard
    'total_invitations': 'Total invitaciones',
    'confirmed_guests': 'Invitados confirmados',
    'pending_responses': 'Respuestas pendientes',
    'total_tables': 'Total mesas',
    'recent_activity': 'Actividad reciente',
    'quick_actions': 'Acciones rápidas',
    'create_invitation': 'Crear invitación',
    'manage_guests': 'Gestionar invitados',
    'view_analytics': 'Ver estadísticas',
    
    // Invités
    'guest_name': 'Nombre del invitado',
    'table_number': 'Número de mesa',
    'guest_type': 'Tipo de invitado',
    'single': 'Individual',
    'couple': 'Pareja',
    'confirmation_status': 'Estado de confirmación',
    'drink_choice': 'Elección de bebida',
    'message': 'Mensaje',
    
    // Tables
    'table_name': 'Nombre de la mesa',
    'seats': 'Asientos',
    'assigned_guests': 'Invitados asignados',
    'available_seats': 'Asientos disponibles',
    'table_status': 'Estado de la mesa',
    'full': 'Completa',
    'partial': 'Parcial',
    'empty': 'Vacía',
    
    // Paramètres
    'language': 'Idioma',
    'theme': 'Tema',
    'light_mode': 'Modo claro',
    'dark_mode': 'Modo oscuro',
    'notifications': 'Notificaciones',
    'privacy': 'Privacidad',
    'account': 'Cuenta',
    
    // Profil
    'personal_info': 'Información personal',
    'first_name': 'Nombre',
    'last_name': 'Apellido',
    'email': 'Correo electrónico',
    'phone': 'Teléfono',
    'address': 'Dirección',
    'member_since': 'Miembro desde',
    'subscription': 'Suscripción',
    
    // Erreurs
    'required_field': 'Este campo es obligatorio',
    'invalid_email': 'Correo electrónico inválido',
    'password_too_short': 'Contraseña demasiado corta',
    'passwords_dont_match': 'Las contraseñas no coinciden',
    'network_error': 'Error de conexión',
    'server_error': 'Error del servidor',
    'not_found': 'No encontrado',
    'unauthorized': 'No autorizado',
    'forbidden': 'Acceso prohibido'
  }
};

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Récupérer la langue sauvegardée ou utiliser la langue du navigateur
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['fr', 'en', 'es'].includes(savedLanguage)) {
      return savedLanguage;
    }
    
    // Détecter la langue du navigateur
    const browserLanguage = navigator.language.split('-')[0];
    if (['fr', 'en', 'es'].includes(browserLanguage)) {
      return browserLanguage as Language;
    }
    
    return 'fr'; // Langue par défaut
  });

  useEffect(() => {
    // Sauvegarder la langue sélectionnée
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};