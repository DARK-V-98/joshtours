
"use server";

import { collection, addDoc, serverTimestamp, getDocs, query, where, doc, getDoc, Timestamp, orderBy, updateDoc,getCountFromServer } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, app } from "@/lib/firebase";
import { revalidatePath } from "next/cache";


// Helper function to upload a single file and return its URL
async function uploadFile(file: File, path: string): Promise<string> {
    if (!app) throw new Error("Firebase not initialized");
    const storage = getStorage(app);
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
}

// New function to handle uploading all booking-related documents
export async function uploadBookingDocuments(bookingId: string, formData: FormData) {
    const fileFields = [
        'customerNicFront', 'customerNicBack', 'customerLicenseFront', 'customerLicenseBack',
        'customerPassportFront', 'customerPassportBack', 'customerLightBill',
        'guarantorNicFront', 'guarantorNicBack', 'guarantorLicenseFront', 'guarantorLicenseBack',
        'guarantorPassportFront', 'guarantorPassportBack', 'guarantorLightBill'
    ];
    
    const urls: { [key: string]: string } = {};

    for (const field of fileFields) {
        const file = formData.get(field) as File | null;
        if (file && file.size > 0) {
            const path = `booking-documents/${bookingId}/${field}-${file.name}`;
            urls[`${field}Url`] = await uploadFile(file, path);
        }
    }
    return urls;
}


// All possible fields for a booking request
export interface BookingRequestData {
  carId: string;
  carName: string;
  userId: string;
  pickupDate: string; // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD
  estimatedKm?: number;
  requests?: string;
  status?: 'pending' | 'confirmed' | 'canceled';

  // Customer Details
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerResidency: 'local' | 'tourist';
  customerNicOrPassport: string;
  customerNicFrontUrl?: string;
  customerNicBackUrl?: string;
  customerPassportFrontUrl?: string;
  customerPassportBackUrl?: string;
  customerLicenseFrontUrl?: string;
  customerLicenseBackUrl?: string;
  customerLightBillUrl?: string;

  // Guarantor Details
  guarantorName: string;
  guarantorPhone: string;
  guarantorResidency: 'local' | 'tourist';
  guarantorNicOrPassport: string;
  guarantorNicFrontUrl?: string;
  guarantorNicBackUrl?: string;
  guarantorPassportFrontUrl?: string;
  guarantorPassportBackUrl?: string;
  guarantorLicenseFrontUrl?: string;
  guarantorLicenseBackUrl?: string;
  guarantorLightBillUrl?: string;
}


// Stored in Firestore
export interface BookingRequest extends BookingRequestData {
  id: string;
  status: 'pending' | 'confirmed' | 'canceled';
  createdAt: string; // ISO String
}


export async function createBookingRequest(
    data: Omit<BookingRequestData, 'status' | 'customerNicFrontUrl' | 'customerNicBackUrl' | 'customerPassportFrontUrl' | 'customerPassportBackUrl' | 'customerLicenseFrontUrl' | 'customerLicenseBackUrl' | 'customerLightBillUrl' | 'guarantorNicFrontUrl' | 'guarantorNicBackUrl' | 'guarantorPassportFrontUrl' | 'guarantorPassportBackUrl' | 'guarantorLicenseFrontUrl' | 'guarantorLicenseBackUrl' | 'guarantorLightBillUrl' >, 
    documentFormData: FormData
) {
  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    const bookingStatus = (data as any).status || 'pending';
    
    const bookingRequestData = {
        ...data,
        status: bookingStatus,
        createdAt: serverTimestamp()
    };
    
    // Step 1: Create the document first to get an ID
    const bookingRequestsCollectionRef = collection(db, "bookingRequests");
    const docRef = await addDoc(bookingRequestsCollectionRef, bookingRequestData);
    
    // Step 2: Upload documents using the new document's ID
    const documentUrls = await uploadBookingDocuments(docRef.id, documentFormData);

    // Step 3: Update the document with the image URLs
    await updateDoc(docRef, { ...documentUrls });

    revalidatePath('/my-bookings');
    revalidatePath('/admin/bookings');
  } catch (error) {
    console.error("Error creating booking request:", error);
    throw new Error("Failed to submit booking request.");
  }
}

export async function getBookingRequestById(bookingId: string): Promise<BookingRequest | null> {
    if (!db) {
        throw new Error("Database not initialized");
    }
    const docRef = doc(db, 'bookingRequests', bookingId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }

    const data = docSnap.data();
    const createdAt = data.createdAt instanceof Timestamp 
        ? data.createdAt.toDate().toISOString() 
        : new Date().toISOString();
    
    return {
        id: docSnap.id,
        ...data,
        createdAt,
    } as BookingRequest;
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

    // Instead of deleting, we update the status to 'canceled'
    try {
        await updateDoc(bookingDocRef, {
            status: 'canceled'
        });
        revalidatePath('/my-bookings');
        revalidatePath('/admin/bookings');
    } catch (error) {
        console.error("Error canceling booking request:", error);
        throw new Error("Failed to cancel the booking request.");
    }
}


// ADMIN FUNCTIONS

export async function getAllBookingRequests(): Promise<BookingRequest[]> {
    if (!db) {
        throw new Error("Database not initialized");
    }

    const requestsCollection = collection(db, 'bookingRequests');
    const q = query(requestsCollection, orderBy('createdAt', 'desc'));
    
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

export async function updateBookingStatus(bookingId: string, status: 'confirmed' | 'canceled') {
    if (!db) {
        throw new Error("Database not initialized");
    }

    const bookingDocRef = doc(db, 'bookingRequests', bookingId);
    
    try {
        await updateDoc(bookingDocRef, { status });
        revalidatePath('/admin/bookings');
        revalidatePath('/my-bookings'); // Also revalidate user's page
    } catch (error) {
        console.error("Error updating booking status:", error);
        throw new Error("Failed to update booking status.");
    }
}


export async function getPendingBookingCount(): Promise<number> {
    if (!db) {
        console.error("Database not initialized");
        return 0;
    }
    try {
        const requestsCollection = collection(db, 'bookingRequests');
        const q = query(requestsCollection, where('status', '==', 'pending'));
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    } catch (error) {
        console.error("Error fetching pending booking count:", error);
        return 0;
    }
}
