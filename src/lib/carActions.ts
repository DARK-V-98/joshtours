
"use server";

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Car } from "./data";

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

    