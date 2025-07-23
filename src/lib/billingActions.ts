
'use server';

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

  createdAt?: string;
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
        // Convert timestamp to string to make it serializable for client components
        const createdAt = data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate().toISOString()
            : data.createdAt;
            
        return { id: docSnap.id, ...data, createdAt } as Bill;
    }

    return null;
}
