
"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";

export default function CarDetailClient() {
  const [date, setDate] = useState<Date | undefined>(undefined);

  // Set the initial date only on the client-side to avoid hydration mismatch
  useEffect(() => {
    setDate(new Date());
  }, []);

  // Render a placeholder or nothing until the date is set on the client
  if (!date) {
    return null; 
  }

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md"
      disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
    />
  );
}
