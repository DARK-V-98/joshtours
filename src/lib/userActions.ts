
'use server';

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from 'firebase/auth';

export async function createUserInFirestore(user: User) {
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      role: 'user', // Default role
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating user document in Firestore:", error);
    throw new Error("Failed to create user profile.");
  }
}
