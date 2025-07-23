
"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { parse, startOfDay } from "date-fns";

interface CarDetailClientProps {
  bookedDates: string[]; // Dates in 'yyyy-MM-dd' format
}

export default function CarDetailClient({ bookedDates }: CarDetailClientProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [hydrated, setHydrated] = useState(false);

  // Memoize the disabled dates calculation to avoid re-computing on every render
  const disabledDates = React.useMemo(() => {
    return bookedDates.map(d => startOfDay(parse(d, 'yyyy-MM-dd', new Date())));
  }, [bookedDates]);
  
  // Disable past dates and already booked dates
  const isDisabled = (day: Date) => {
    const today = startOfDay(new Date());
    const isPast = day < today;
    
    // Check if the current day is in the list of disabled (booked) dates
    const isBooked = disabledDates.some(
      (disabledDate) => disabledDate.getTime() === day.getTime()
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
