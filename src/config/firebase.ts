import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBtWKFZ78KtLA_WKEkNBpJWS1LQVUMWQXc",
  authDomain: "furaha-event-831ca.firebaseapp.com",
  projectId: "furaha-event-831ca",
  storageBucket: "furaha-event-831ca.firebasestorage.app",
  messagingSenderId: "369854399050",
  appId: "1:369854399050:web:9dd985ac0fd2a26a8e9cb3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Configure persistence to keep user logged in
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Erreur lors de la configuration de la persistance initiale:', error);
});

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
console.log('Firebase initialisé avec le projet:', firebaseConfig.projectId);

export default app;