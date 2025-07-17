
"use server";

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, app } from "@/lib/firebase"; // Make sure app is exported from firebase.ts
import type { Car } from "./data";

// This function uploads images to Firebase Storage and returns their URLs.
export async function uploadImages(formData: FormData): Promise<string[]> {
  const storage = getStorage(app);
  const images = formData.getAll("images") as File[];
  
  if (!images || images.length === 0) {
    throw new Error("No images provided for upload.");
  }

  const imageUrls: string[] = [];

  for (const image of images) {
    // Generate a unique filename for each image
    const fileName = `${Date.now()}-${image.name}`;
    const storageRef = ref(storage, `cars/${fileName}`);
    
    // Upload the file
    await uploadBytes(storageRef, image);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    imageUrls.push(downloadURL);
  }

  return imageUrls;
}

// This function adds a new car document to the 'cars' collection in Firestore.
export async function addCar(carData: Omit<Car, "id">) {
  if (!db) {
    console.error("Firestore is not initialized.");
    throw new Error("Database connection is not available.");
  }

  try {
    const carsCollectionRef = collection(db, "cars");
    const docRef = await addDoc(carsCollectionRef, {
      ...carData,
      createdAt: serverTimestamp(),
    });
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw new Error("Failed to add car to the database.");
  }
}
