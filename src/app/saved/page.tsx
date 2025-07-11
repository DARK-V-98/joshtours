"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { cars } from "@/lib/data";
import { CarCard } from "@/components/car-card";
import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function SavedCarsPage() {
  const [savedCarIds] = useLocalStorage<number[]>("savedCars", []);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const savedCars = useMemo(() => {
    if (!isClient) return [];
    return cars.filter((car) => savedCarIds.includes(car.id));
  }, [savedCarIds, isClient]);

  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-headline font-bold text-center mb-8">
          Your Saved Cars
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
             <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[225px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-headline font-bold text-center mb-8">
        Your Saved Cars
      </h1>
      {savedCars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {savedCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      ) : (
        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground mb-4">
            You haven't saved any cars yet.
          </p>
          <Button asChild>
            <Link href="/">Explore Cars</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
