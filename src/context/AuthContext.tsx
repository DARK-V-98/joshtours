
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { app, db } from '@/lib/firebase';
import { createUserInFirestore } from '@/lib/userActions';

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  phone: string | null;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!app || !db) {
      // Firebase might not be configured
      console.warn("Firebase is not configured, authentication will be disabled.");
      setLoading(false);
      return;
    }

    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        // User is signed in, now fetch their profile from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
              const userData = userDoc.data();
              setUser({
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: userData.displayName || firebaseUser.displayName,
                  phone: userData.phone || firebaseUser.phoneNumber,
                  role: userData.role || 'user', // Set role from Firestore, default to 'user'
              });
          } else {
              // Document doesn't exist, so create it
              console.log(`User document for uid: ${firebaseUser.uid} not found. Creating it.`);
              await createUserInFirestore(firebaseUser);
              setUser({
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName,
                  phone: firebaseUser.phoneNumber,
                  role: 'user', // Default role for newly created doc
              });
          }
        } catch (error) {
            console.error("Error fetching or creating user data in Firestore:", error);
            setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                phone: firebaseUser.phoneNumber,
                role: 'user', // Default to user on error
            });
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
