
'use server';

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
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

  createdAt: any;
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
    revalidatePath(`/admin/billing`);
    return { success: true };
  } catch (error) {
    console.error('Error saving bill:', error);
    throw new Error('Failed to save bill.');
  }
}
