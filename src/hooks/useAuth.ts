import { useState, useEffect } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';

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
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      setError(null);
      console.log('Changement d\'état d\'authentification:', firebaseUser?.email || 'Déconnecté');

      if (firebaseUser) {
        // IMPORTANT: Bloquer complètement l'accès si l'email n'est pas vérifié
        if (!firebaseUser.emailVerified) {
          console.log('Email non vérifié pour:', firebaseUser.email);
          setFirebaseUser(firebaseUser);
          setUser(null); // Aucun accès tant que l'email n'est pas vérifié
          setEmailVerificationSent(true); // Indiquer qu'une vérification est nécessaire
          setIsLoading(false);
          return;
        }

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
              (basicUserData as any).photoURL = firebaseUser.photoURL;
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
            (tempUserData as any).photoURL = firebaseUser.photoURL;
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
      console.log('Début de l\'inscription pour:', email);

      // S'assurer que la persistance est configurée avant l'inscription
      await setPersistence(auth, browserLocalPersistence);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log('Utilisateur Firebase créé:', firebaseUser.uid);

      // IMPORTANT: Envoyer l'email de vérification IMMÉDIATEMENT
      await sendEmailVerification(firebaseUser);
      console.log('Email de vérification envoyé à:', email);
      setEmailVerificationSent(true);

      // Mettre à jour le profil Firebase
      await updateProfile(firebaseUser, {
        displayName: `${firstName} ${lastName}`
      });
      console.log('Profil Firebase mis à jour');

      // IMPORTANT: Déconnecter immédiatement l'utilisateur pour forcer la vérification
      await signOut(auth);
      console.log('Utilisateur déconnecté pour forcer la vérification');
      
      return { 
        success: true, 
        user: null, 
        emailVerificationSent: true,
        message: `Un email de vérification a été envoyé à ${email}. Veuillez vérifier votre boîte mail (et le dossier spam) et cliquer sur le lien de confirmation avant de vous connecter.`
      };
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      const errorMessage = getFirebaseErrorMessage(error.code);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const resendEmailVerification = async () => {
    if (!firebaseUser) {
      return { success: false, error: 'Aucun utilisateur connecté' };
    }

    try {
      await sendEmailVerification(firebaseUser);
      setEmailVerificationSent(true);
      return { 
        success: true, 
        message: 'Email de vérification renvoyé avec succès' 
      };
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const checkEmailVerification = async () => {
    if (!firebaseUser) {
      return { success: false, error: 'Aucun utilisateur connecté' };
    }

    try {
      console.log('Vérification du statut de l\'email pour:', firebaseUser.email);
      // Recharger les données utilisateur pour vérifier le statut de vérification
      await firebaseUser.reload();
      console.log('Données utilisateur rechargées, email vérifié:', firebaseUser.emailVerified);
      
      if (firebaseUser.emailVerified) {
        console.log('Email vérifié, création du document utilisateur');
        // L'email est maintenant vérifié, créer le document utilisateur dans Firestore
        const userData = {
          email: firebaseUser.email || '',
          firstName: firebaseUser.displayName?.split(' ')[0] || 'Utilisateur',
          lastName: firebaseUser.displayName?.split(' ')[1] || '',
          createdAt: new Date().toISOString()
        };

        if (firebaseUser.photoURL) {
          (userData as any).photoURL = firebaseUser.photoURL;
        }

        const userDocRef = doc(db, 'users', firebaseUser.uid);
        await setDoc(userDocRef, userData);
        console.log('Document utilisateur créé dans Firestore');

        const newUser: UserData = {
          id: firebaseUser.uid,
          ...userData,
          photoURL: firebaseUser.photoURL || undefined
        };

        setUser(newUser);
        setFirebaseUser(firebaseUser);
        setEmailVerificationSent(false);
        
        return { 
          success: true, 
          message: 'Email vérifié avec succès ! Vous pouvez maintenant utiliser votre compte.' 
        };
      } else {
        console.log('Email toujours non vérifié');
        return { 
          success: false, 
          error: 'Email non encore vérifié. Veuillez vérifier votre boîte mail (et le dossier spam) et cliquer sur le lien de confirmation.' 
        };
      }
    } catch (error: any) {
      console.error('Erreur lors de la vérification de l\'email:', error);
      const errorMessage = getFirebaseErrorMessage(error.code);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      console.log('Tentative de connexion pour:', email);

      // S'assurer que la persistance est configurée avant la connexion
      await setPersistence(auth, browserLocalPersistence);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log('Connexion Firebase réussie pour:', email, 'Email vérifié:', firebaseUser.emailVerified);
      
      // IMPORTANT: Vérification stricte de l'email
      if (!firebaseUser.emailVerified) {
        console.log('Email non vérifié, déconnexion forcée');
        await signOut(auth); // Déconnecter l'utilisateur
        setFirebaseUser(firebaseUser); // Garder la référence pour le renvoi d'email
        setEmailVerificationSent(true);
        return { 
          success: false, 
          error: `Votre email ${email} n'est pas encore vérifié. Veuillez vérifier votre boîte mail (et le dossier spam) et cliquer sur le lien de confirmation avant de vous connecter.`,
          emailNotVerified: true
        };
      }
      
      console.log('Email vérifié, connexion autorisée');
      // L'utilisateur sera automatiquement défini via onAuthStateChanged
      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      const errorMessage = getFirebaseErrorMessage(error.code);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      setIsLoading(true);
      console.log('Début de la connexion Google');

      // S'assurer que la persistance est configurée avant la connexion
      await setPersistence(auth, browserLocalPersistence);
      
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      console.log('Connexion Google réussie pour:', firebaseUser.email);
      
      // Vérifier si c'est un nouvel utilisateur
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Nouvel utilisateur, créer le profil
        const userData = {
          email: firebaseUser.email || '',
          firstName: firebaseUser.displayName?.split(' ')[0] || 'Utilisateur',
          lastName: firebaseUser.displayName?.split(' ')[1] || '',
          createdAt: new Date().toISOString()
        };
        
        if (firebaseUser.photoURL) {
          (userData as any).photoURL = firebaseUser.photoURL;
        }
        
        await setDoc(userDocRef, userData);
        console.log('Profil Google créé dans Firestore');
      }
      
      // L'utilisateur sera automatiquement défini via onAuthStateChanged
      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors de la connexion Google:', error);
      
      // Gestion des erreurs spécifiques à Google
      let errorMessage = 'Erreur lors de la connexion avec Google';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Connexion annulée par l\'utilisateur';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup bloquée par le navigateur. Veuillez autoriser les popups pour ce site';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Demande de connexion annulée';
      }
      
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
      setEmailVerificationSent(false);
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
    emailVerificationSent,
    register,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    resendEmailVerification,
    checkEmailVerification,
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
      return 'Adresse email invalide. Veuillez vérifier le format de votre email';
    case 'auth/invalid-credential':
      return 'Email ou mot de passe incorrect';
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Veuillez réessayer plus tard';
    case 'auth/network-request-failed':
      return 'Erreur de connexion. Vérifiez votre connexion internet';
    case 'auth/user-disabled':
      return 'Ce compte a été désactivé';
    case 'auth/operation-not-allowed':
      return 'L\'inscription par email/mot de passe n\'est pas activée';
    default:
      console.error('Erreur Firebase non gérée:', errorCode);
      return 'Une erreur est survenue. Veuillez réessayer';
  }
};