
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// A helper function to validate the config
const isFirebaseConfigValid = (config: FirebaseOptions) => {
    return Object.values(config).every(value => typeof value === 'string' && value.length > 0);
}

// Initialize Firebase
const app = !getApps().length && isFirebaseConfigValid(firebaseConfig) ? initializeApp(firebaseConfig) : (getApps().length > 0 ? getApp() : null);

// Conditionally export auth and db
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;


export { app, auth, db };
