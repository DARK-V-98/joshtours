
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { parse, startOfDay, isSameDay } from "date-fns";

interface CarDetailClientProps {
  bookedDates: string[]; // Dates in 'yyyy-MM-dd' format
}

export default function CarDetailClient({ bookedDates }: CarDetailClientProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [hydrated, setHydrated] = useState(false);

  // Memoize the disabled dates calculation to avoid re-computing on every render
  const bookedDateObjects = useMemo(() => {
    return bookedDates.map(d => {
        // The date from firestore might be malformed, so we should handle it gracefully
        try {
            return startOfDay(parse(d, 'yyyy-MM-dd', new Date()));
        } catch (e) {
            console.warn(`Invalid date format found in bookedDates: ${d}`);
            return null;
        }
    }).filter(d => d !== null) as Date[];
  }, [bookedDates]);

  // Disable past dates and already booked dates
  const isDisabled = (day: Date) => {
    const today = startOfDay(new Date());
    // Dates in the past (before today) should be disabled.
    if (day < today) return true;
    
    // Check if the current day is one of the booked dates.
    return bookedDateObjects.some(
      (disabledDate) => isSameDay(day, disabledDate)
    );
  };

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    // Render a placeholder or null on the server to avoid hydration mismatch
    // and layout shift when the real component renders.
    return <div className="h-[298px] w-full rounded-md border" />;
  }

  return (
    <Calendar
      mode="single"
      selected={bookedDateObjects}
      onSelect={setDate}
      className="rounded-md border"
      disabled={isDisabled}
    />
  );
}
