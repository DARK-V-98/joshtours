
"use server";

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { revalidatePath } from "next/cache";

interface BookingRequestData {
  carId: string;
  carName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupDate: string; // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD
  requests?: string;
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
    // Optionally revalidate a path if you have an admin page for requests
    // revalidatePath('/admin/bookings');
  } catch (error) {
    console.error("Error creating booking request:", error);
    throw new Error("Failed to submit booking request.");
  }
}
