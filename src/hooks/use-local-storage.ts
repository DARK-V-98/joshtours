"use client";

import { useState, useEffect, useCallback } from "react";

function getValue<T>(key: string, defaultValue: T): T {
  // To prevent SSR errors, we only access localStorage on the client
  if (typeof window === "undefined") {
    return defaultValue;
  }
  try {
    const saved = window.localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved) as T;
    }
  } catch (error) {
    console.error("Error reading from localStorage", error);
    return defaultValue;
  }
  return defaultValue;
}

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    // This effect runs on the client after hydration
    setValue(getValue(key, defaultValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);


  useEffect(() => {
    // This effect runs on the client when value changes
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error("Error writing to localStorage", error);
    }
  }, [key, value]);

  return [value, setValue];
}
