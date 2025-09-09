import { useState, useEffect } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  photoURL?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Configurer la persistance pour maintenir la session
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error('Erreur lors de la configuration de la persistance:', error);
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      setError(null);
      console.log('Changement d\'état d\'authentification:', firebaseUser?.email || 'Déconnecté');

      if (firebaseUser) {
        try {
          // Récupérer les données utilisateur depuis Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as Omit<UserData, 'id'>;
            setUser({
              id: firebaseUser.uid,
              ...userData
            });
            console.log('Données utilisateur récupérées depuis Firestore');
          } else {
            console.log('Document utilisateur non trouvé, création d\'un profil basique');
            // Si le document n'existe pas, créer un profil basique
            const basicUserData = {
              email: firebaseUser.email || '',
              firstName: firebaseUser.displayName?.split(' ')[0] || 'Utilisateur',
              lastName: firebaseUser.displayName?.split(' ')[1] || '',
              createdAt: new Date().toISOString()
            };
            
            // Ajouter photoURL seulement s'il existe
            if (firebaseUser.photoURL) {
              basicUserData.photoURL = firebaseUser.photoURL;
            }
            
            try {
              const newUserDocRef = doc(db, 'users', firebaseUser.uid);
              await setDoc(newUserDocRef, basicUserData);
              console.log('Profil basique créé dans Firestore');
            } catch (firestoreError) {
              console.error('Erreur lors de la création du profil basique:', firestoreError);
              // Continuer même si Firestore échoue
            }
            
            setUser({
              id: firebaseUser.uid,
              ...basicUserData,
              photoURL: firebaseUser.photoURL || undefined
            });
          }
          setFirebaseUser(firebaseUser);
        } catch (error) {
          console.error('Erreur lors de la récupération des données utilisateur:', error);
          
          // Créer un profil temporaire en cas d'erreur Firestore
          console.warn('Création d\'un profil temporaire suite à l\'erreur Firestore');
          const tempUserData = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            firstName: firebaseUser.displayName?.split(' ')[0] || 'Utilisateur',
            lastName: firebaseUser.displayName?.split(' ')[1] || '',
            createdAt: new Date().toISOString()
          };
          
          // Ajouter photoURL seulement s'il existe pour l'état local
          if (firebaseUser.photoURL) {
            tempUserData.photoURL = firebaseUser.photoURL;
          }
          
          setUser(tempUserData);
          setFirebaseUser(firebaseUser);
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

      // S'assurer que la persistance est configurée avant l'inscription
      await setPersistence(auth, browserLocalPersistence);

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

      // Ajouter photoURL seulement s'il existe
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

      setUser(newUser);
      setFirebaseUser(firebaseUser);
      
      return { success: true, user: newUser };
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error.code);
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

      // S'assurer que la persistance est configurée avant la connexion
      await setPersistence(auth, browserLocalPersistence);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // L'utilisateur sera automatiquement défini via onAuthStateChanged
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
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
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateUserProfile = async (updates: Partial<Pick<UserData, 'firstName' | 'lastName'>>) => {
    if (!firebaseUser || !user) return { success: false, error: 'Utilisateur non connecté' };

    try {
      setError(null);
      
      // Mettre à jour Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, updates, { merge: true });
      
      // Mettre à jour le profil Firebase si nécessaire
      if (updates.firstName || updates.lastName) {
        const displayName = `${updates.firstName || user.firstName} ${updates.lastName || user.lastName}`;
        await updateProfile(firebaseUser, { displayName });
      }
      
      // Mettre à jour l'état local
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

// Fonction utilitaire pour traduire les erreurs Firebase
const getFirebaseErrorMessage = (errorCode: string): string => {
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
};