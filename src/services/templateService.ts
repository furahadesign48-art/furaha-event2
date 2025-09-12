// Service de templates simplifié (sans Firebase)

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
  createdAt?: string;
  updatedAt?: string;
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
  createdAt: string;
  updatedAt: string;
}

// Templates par défaut en mémoire
const defaultTemplates: TemplateData[] = [
  {
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
    },
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
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
    },
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
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
    },
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Stockage local pour les données utilisateur
let userModels: { [userId: string]: UserModel[] } = {};
let userInvites: { [userId: string]: Invite[] } = {};

// Service pour les templates par défaut
export class TemplateService {
  static async getDefaultTemplates(): Promise<TemplateData[]> {
    return defaultTemplates;
  }

  static async getDefaultTemplate(templateId: string): Promise<TemplateData | null> {
    return defaultTemplates.find(t => t.id === templateId) || null;
  }

  static async getTemplatesByCategory(category: 'wedding' | 'birthday' | 'graduation'): Promise<TemplateData[]> {
    return defaultTemplates.filter(t => t.category === category);
  }
}

// Service pour les modèles utilisateur
export class UserModelService {
  static async createUserModel(
    userId: string, 
    originalTemplate: TemplateData,
    customizations?: Partial<UserModel>
  ): Promise<string> {
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...customizations
    };

    if (!userModels[userId]) {
      userModels[userId] = [];
    }
    userModels[userId].push(userModel);
    
    return modelId;
  }

  static async getUserModels(userId: string): Promise<UserModel[]> {
    return userModels[userId] || [];
  }

  static async getUserModel(userId: string, modelId: string): Promise<UserModel | null> {
    const models = userModels[userId] || [];
    return models.find(m => m.id === modelId) || null;
  }

  static async updateUserModel(
    userId: string,
    modelId: string,
    updates: Partial<UserModel>
  ): Promise<void> {
    const models = userModels[userId] || [];
    const modelIndex = models.findIndex(m => m.id === modelId);
    
    if (modelIndex !== -1) {
      userModels[userId][modelIndex] = {
        ...models[modelIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
    }
  }

  static async deleteUserModel(userId: string, modelId: string): Promise<void> {
    if (userModels[userId]) {
      userModels[userId] = userModels[userId].filter(m => m.id !== modelId);
    }
  }
}

// Service pour les invités
export class InviteService {
  static async createInvite(userId: string, inviteData: Omit<Invite, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const existingInvites = userInvites[userId] || [];
    
    // Vérification de la limite de 5 invitations
    if (existingInvites.length >= 5) {
      throw new Error('Limite de 5 invitations atteinte. Passez au plan premium pour continuer.');
    }
    
    const inviteId = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const invite: Invite = {
      id: inviteId,
      ...inviteData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!userInvites[userId]) {
      userInvites[userId] = [];
    }
    userInvites[userId].push(invite);
    
    return inviteId;
  }

  static async getUserInvites(userId: string): Promise<Invite[]> {
    return userInvites[userId] || [];
  }

  static async getInvite(userId: string, inviteId: string): Promise<(Invite & { userId: string }) | null> {
    const invites = userInvites[userId] || [];
    const invite = invites.find(i => i.id === inviteId);
    return invite ? { ...invite, userId } : null;
  }

  static async getInviteGlobal(inviteId: string): Promise<(Invite & { userId: string }) | null> {
    for (const userId in userInvites) {
      const invites = userInvites[userId];
      const invite = invites.find(i => i.id === inviteId);
      if (invite) {
        return { ...invite, userId };
      }
    }
    return null;
  }

  static async updateInvite(
    userId: string,
    inviteId: string,
    updates: Partial<Invite>
  ): Promise<void> {
    const invites = userInvites[userId] || [];
    const inviteIndex = invites.findIndex(i => i.id === inviteId);
    
    if (inviteIndex !== -1) {
      userInvites[userId][inviteIndex] = {
        ...invites[inviteIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
    }
  }

  static async deleteInvite(userId: string, inviteId: string): Promise<void> {
    if (userInvites[userId]) {
      userInvites[userId] = userInvites[userId].filter(i => i.id !== inviteId);
    }
  }

  static async updateInviteResponse(
    userId: string,
    inviteId: string,
    responseData: {
      confirmed?: boolean;
      statut?: 'pending' | 'confirmed' | 'declined';
      boissons?: string;
      voeux?: string;
      selectedDrink?: string;
      message?: string;
    }
  ): Promise<void> {
    await this.updateInvite(userId, inviteId, responseData as Partial<Invite>);
  }
}

// Maintenir la compatibilité avec l'ancien service
export const UserTemplateService = UserModelService;