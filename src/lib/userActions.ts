

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from 'firebase/auth';

export async function createUserInFirestore(user: User) {
  if (!db) {
    console.error("Firestore is not initialized. Cannot create user profile.");
    throw new Error("Failed to create user profile due to database connection issue.");
  }

  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      role: 'user', // Default role for all new users
      createdAt: serverTimestamp(),
    }, { merge: true }); // Use merge to avoid overwriting existing data if called accidentally
  } catch (error) {
    console.error("Error creating user document in Firestore:", error);
    // Re-throwing the error so it can be caught by the calling function
    throw new Error("Failed to create user profile in database.");
  }
}
