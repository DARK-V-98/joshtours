
"use server";

import { collection, addDoc, serverTimestamp, getDocs, query, where, doc, deleteDoc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { revalidatePath } from "next/cache";

interface BookingRequestData {
  carId: string;
  carName: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupDate: string; // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD
  requests?: string;
}

// Stored in Firestore
export interface BookingRequest extends BookingRequestData {
  id: string;
  status: 'pending' | 'confirmed' | 'canceled';
  createdAt: string; // ISO String
}


export async function createBookingRequest(data: BookingRequestData) {
  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    const bookingRequestsCollectionRef = collection(db, "bookingRequests");
    await addDoc(bookingRequestsCollectionRef, {
      ...data,
      status: 'pending', // Initial status
      createdAt: serverTimestamp(),
    });
    revalidatePath('/my-bookings');
  } catch (error) {
    console.error("Error creating booking request:", error);
    throw new Error("Failed to submit booking request.");
  }
}

export async function getBookingRequestsForUser(userId: string): Promise<BookingRequest[]> {
    if (!db) {
        throw new Error("Database not initialized");
    }

    const requestsCollection = collection(db, 'bookingRequests');
    const q = query(requestsCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate().toISOString() 
            : new Date().toISOString();

        return {
            id: doc.id,
            ...data,
            createdAt,
        } as BookingRequest;
    });
}


export async function cancelBookingRequest(bookingId: string) {
    if (!db) {
        throw new Error("Database not initialized");
    }

    const bookingDocRef = doc(db, 'bookingRequests', bookingId);
    const bookingSnap = await getDoc(bookingDocRef);

    if (!bookingSnap.exists()) {
        throw new Error("Booking request not found.");
    }

    const bookingData = bookingSnap.data();

    if (bookingData.status !== 'pending') {
        throw new Error("Only pending requests can be canceled.");
    }

    try {
        await deleteDoc(bookingDocRef);
        revalidatePath('/my-bookings');
    } catch (error) {
        console.error("Error deleting booking request:", error);
        throw new Error("Failed to cancel the booking request.");
    }
}
