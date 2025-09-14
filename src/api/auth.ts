import { auth, db } from '../config/firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  photoURL?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class AuthAPI {
  static async register(
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ): Promise<AuthResponse> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Mettre à jour le profil Firebase
      await updateProfile(firebaseUser, {
        displayName: `${firstName} ${lastName}`
      });

      // Créer le document utilisateur dans Firestore
      const userData = {
        email,
        firstName,
        lastName,
        createdAt: new Date().toISOString()
      };

      if (firebaseUser.photoURL) {
        userData.photoURL = firebaseUser.photoURL;
      }

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, userData);

      const newUser: UserData = {
        id: firebaseUser.uid,
        ...userData,
        photoURL: firebaseUser.photoURL || undefined
      };

      return { success: true, data: newUser };
    } catch (error: any) {
      return { 
        success: false, 
        error: this.getFirebaseErrorMessage(error.code) 
      };
    }
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Récupérer les données utilisateur depuis Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as Omit<UserData, 'id'>;
        const user: UserData = {
          id: firebaseUser.uid,
          ...userData
        };
        return { success: true, data: user };
      } else {
        // Créer un profil basique si inexistant
        const basicUserData = {
          email: firebaseUser.email || '',
          firstName: firebaseUser.displayName?.split(' ')[0] || 'Utilisateur',
          lastName: firebaseUser.displayName?.split(' ')[1] || '',
          createdAt: new Date().toISOString()
        };
        
        const newUserDocRef = doc(db, 'users', firebaseUser.uid);
        await setDoc(newUserDocRef, basicUserData);
        
        const user: UserData = {
          id: firebaseUser.uid,
          ...basicUserData,
          photoURL: firebaseUser.photoURL || undefined
        };
        
        return { success: true, data: user };
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: this.getFirebaseErrorMessage(error.code) 
      };
    }
  }

  static async logout(): Promise<AuthResponse> {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: 'Erreur lors de la déconnexion' 
      };
    }
  }

  static async resetPassword(email: string): Promise<AuthResponse> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: this.getFirebaseErrorMessage(error.code) 
      };
    }
  }

  static async updateUserProfile(
    userId: string,
    updates: Partial<Pick<UserData, 'firstName' | 'lastName'>>
  ): Promise<AuthResponse> {
    try {
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, updates, { merge: true });
      
      // Mettre à jour le profil Firebase si nécessaire
      if (auth.currentUser && (updates.firstName || updates.lastName)) {
        const currentUser = auth.currentUser;
        const currentData = await this.getUserData(userId);
        
        if (currentData.success) {
          const userData = currentData.data;
          const displayName = `${updates.firstName || userData.firstName} ${updates.lastName || userData.lastName}`;
          await updateProfile(currentUser, { displayName });
        }
      }
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: 'Erreur lors de la mise à jour du profil' 
      };
    }
  }

  static async getUserData(userId: string): Promise<AuthResponse> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as Omit<UserData, 'id'>;
        const user: UserData = {
          id: userDoc.id,
          ...userData
        };
        return { success: true, data: user };
      } else {
        return { success: false, error: 'Utilisateur non trouvé' };
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: 'Erreur lors de la récupération des données utilisateur' 
      };
    }
  }

  private static getFirebaseErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Aucun utilisateur trouvé avec cette adresse email';
      case 'auth/wrong-password':
        return 'Mot de passe incorrect';
      case 'auth/email-already-in-use':
        return 'Cette adresse email est déjà utilisée';
      case 'auth/weak-password':
        return 'Le mot de passe doit contenir au moins 6 caractères';
      case 'auth/invalid-email':
        return 'Adresse email invalide';
      case 'auth/too-many-requests':
        return 'Trop de tentatives. Veuillez réessayer plus tard';
      case 'auth/network-request-failed':
        return 'Erreur de connexion. Vérifiez votre connexion internet';
      case 'auth/user-disabled':
        return 'Ce compte a été désactivé';
      default:
        return 'Une erreur est survenue. Veuillez réessayer';
    }
  }
}