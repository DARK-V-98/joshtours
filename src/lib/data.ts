
import { collection, getDocs, doc, getDoc, query, where, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface Car {
  id: string; // Firestore document ID
  name: string;
  type: string;
  images: string[]; // URLs to images, e.g., ['/cars/car1.png', '/cars/car2.png']
  dataAiHint: string;
  isAvailable: boolean;
  specs: {
    engine: string;
    transmission: "Automatic" | "Manual";
    seats: number;
    fuel: "Gasoline" | "Diesel" | "Electric";
  };
  createdAt?: string; // Stored as a string after conversion
}

// Fetches all cars from Firestore
export async function getAllCars(): Promise<Car[]> {
  if (!db) {
    console.error("Firestore is not initialized.");
    return [];
  }
  const carsCollectionRef = collection(db, "cars");
  const carsSnapshot = await getDocs(carsCollectionRef);
  const carsList = carsSnapshot.docs.map(doc => {
    const data = doc.data();
    // Convert Firestore Timestamp to a serializable format (ISO string)
    const createdAt = data.createdAt instanceof Timestamp 
      ? data.createdAt.toDate().toISOString() 
      : data.createdAt;

    return {
      id: doc.id,
      ...data,
      createdAt,
    } as Car;
  });
  return carsList;
}

// Fetches a single car by its ID from Firestore
export async function getCarById(id: string): Promise<Car | null> {
  if (!db) {
    console.error("Firestore is not initialized.");
    return null;
  }
  const carDocRef = doc(db, "cars", id);
  const carDoc = await getDoc(carDocRef);

  if (carDoc.exists()) {
    const data = carDoc.data();
    // Convert Firestore Timestamp to a serializable format (ISO string)
    const createdAt = data.createdAt instanceof Timestamp 
      ? data.createdAt.toDate().toISOString() 
      : data.createdAt;
      
    return { 
        id: carDoc.id, 
        ...data,
        createdAt
    } as Car;
  } else {
    return null;
  }
}
