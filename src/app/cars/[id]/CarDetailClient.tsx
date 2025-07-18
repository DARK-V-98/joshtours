
"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { parse } from "date-fns";

interface CarDetailClientProps {
  bookedDates: string[]; // Dates in 'yyyy-MM-dd' format
}

export default function CarDetailClient({ bookedDates }: CarDetailClientProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [hydrated, setHydrated] = useState(false);

  const disabledDates = bookedDates.map(d => parse(d, 'yyyy-MM-dd', new Date()));
  
  // Disable past dates and already booked dates
  const isDisabled = (day: Date) => {
    const isPast = day < new Date(new Date().setDate(new Date().getDate() - 1));
    const isBooked = disabledDates.some(
      (disabledDate) => disabledDate.toDateString() === day.toDateString()
    );
    return isPast || isBooked;
  };

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    // Render a placeholder or null on the server to avoid hydration mismatch
    return <div className="h-[298px] w-[280px] rounded-md border" />;
  }

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border"
      disabled={isDisabled}
    />
  );
}
