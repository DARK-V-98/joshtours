"use client";

import Image from "next/image";
import Link from "next/link";
import { Car as CarType } from "@/lib/data";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { Users, Gauge, Settings, Heart } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import React from "react";

interface CarCardProps {
  car: CarType;
}

export function CarCard({ car }: CarCardProps) {
  const [savedCars, setSavedCars] = useLocalStorage<number[]>("savedCars", []);
  const { toast } = useToast();
  const isSaved = savedCars.includes(car.id);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaved) {
      setSavedCars(savedCars.filter((id) => id !== car.id));
      toast({
        title: "Removed from saved",
        description: `${car.name} has been removed from your saved list.`,
      });
    } else {
      setSavedCars([...savedCars, car.id]);
      toast({
        title: "Saved for later!",
        description: `${car.name} has been added to your saved list.`,
      });
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0 relative">
        <Link href={`/cars/${car.id}`} className="block aspect-video overflow-hidden">
          <Image
            src={car.image}
            alt={car.name}
            width={600}
            height={400}
            data-ai-hint={car.dataAiHint}
            className="object-cover w-full h-full transform transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/70 backdrop-blur-sm"
          onClick={toggleSave}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isSaved ? "fill-primary text-primary" : "text-foreground"
            )}
          />
          <span className="sr-only">Save car</span>
        </Button>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl mb-2 font-headline">
          <Link
            href={`/cars/${car.id}`}
            className="hover:text-primary transition-colors"
          >
            {car.name}
          </Link>
        </CardTitle>
        <div className="text-sm text-muted-foreground grid grid-cols-3 gap-2">
          <div className="flex items-center gap-1.5">
            <Users size={16} />
            <span>{car.specs.seats}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Gauge size={16} />
            <span>{car.specs.engine}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Settings size={16} />
            <span>{car.specs.transmission}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center border-t">
        <p className="text-lg font-bold">
          ${car.pricePerDay}
          <span className="text-sm font-normal text-muted-foreground">/day</span>
        </p>
        <Button asChild size="sm">
          <Link href={`/cars/${car.id}`}>Rent Now</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
