
'use server';

// This file is DEPRECATED.
// All billing logic has been merged into rentalAgreementActions.ts
// This file can be safely removed in the future.

import { doc, setDoc, serverTimestamp, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export interface Bill {
  id: string; // Corresponds to bookingId
  bookingId: string;
  customerName: string;
  vehicleName: string;
  
  // Return Details
  additionalKm: number;
  pricePerKm: number;
  additionalDays: number;
  pricePerDay: number;
  damages: number;
  delayPayments: number;
  otherCharges: number;

  // Calculation
  subTotal: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;

  createdAt: string;
  billDate?: string;
}

export async function saveBill(
  bookingId: string,
  data: Omit<Bill, 'id' | 'createdAt'>
): Promise<{ success: boolean }> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const billDocRef = doc(db, 'bills', bookingId);

  try {
    await setDoc(
      billDocRef,
      {
        ...data,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
    revalidatePath(`/admin/billing/${bookingId}`);
    return { success: true };
  } catch (error) {
    console.error('Error saving bill:', error);
    throw new Error('Failed to save bill.');
  }
}

export async function getBillById(bookingId: string): Promise<Bill | null> {
    if (!db) {
        throw new Error("Database not initialized");
    }
    const docRef = doc(db, "bills", bookingId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        const createdAt = data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate().toISOString()
            : (new Date().toISOString());
            
        return { id: docSnap.id, ...data, createdAt } as Bill;
    }

    return null;
}
