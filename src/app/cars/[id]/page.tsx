"use client";

import { cars } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Heart, Users, Gauge, Settings, Fuel } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import React from "react";

export default function CarDetailPage({ params }: { params: { id: string } }) {
  const car = cars.find((c) => c.id === parseInt(params.id, 10));
  const { toast } = useToast();
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  const [savedCars, setSavedCars] = useLocalStorage<number[]>("savedCars", []);

  if (!car) {
    notFound();
  }
  
  const isSaved = savedCars.includes(car.id);

  const toggleSave = () => {
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
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <div className="aspect-video relative">
              <Image
                src={car.image}
                alt={car.name}
                fill
                data-ai-hint={car.dataAiHint}
                className="object-cover"
                priority
              />
            </div>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-headline font-bold mb-1">{car.name}</h1>
          <p className="text-lg text-muted-foreground mb-4">{car.type}</p>

          <div className="flex items-stretch gap-4 mb-6">
            <Button size="lg" className="flex-1 h-12 text-lg">
              Rent Now
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12"
              onClick={toggleSave}
              aria-label="Save car"
            >
              <Heart
                className={cn(
                  "h-6 w-6 transition-all",
                  isSaved && "fill-primary text-primary"
                )}
              />
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Users className="text-primary h-5 w-5" />
                  <span>{car.specs.seats} Seats</span>
                </div>
                <div className="flex items-center gap-3">
                  <Gauge className="text-primary h-5 w-5" />
                  <span>{car.specs.engine}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Settings className="text-primary h-5 w-5" />
                  <span>{car.specs.transmission}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Fuel className="text-primary h-5 w-5" />
                  <span>{car.specs.fuel}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Check Availability</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
              disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
