
"use client";

import { getCarById, Car } from "@/lib/data";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Users, Gauge, Settings, Fuel, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import CarDetailClient from "./CarDetailClient";
import { useEffect, useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { Skeleton } from "@/components/ui/skeleton";


export default function CarDetailPage() {
  const params = useParams();
  const carId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { currency, getSymbol } = useCurrency();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCar = async () => {
      setLoading(true);
      const fetchedCar = await getCarById(carId);
      if (!fetchedCar) {
        notFound();
      } else {
        setCar(fetchedCar);
      }
      setLoading(false);
    };

    fetchCar();
  }, [carId]);

  if (loading || !car) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <Skeleton className="aspect-video w-full rounded-lg" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <Carousel className="w-full">
              <CarouselContent>
                {car.images.map((imageSrc, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-video relative">
                      <Image
                        src={imageSrc}
                        alt={`${car.name} view ${index + 1}`}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
               {car.images.length > 1 && (
                  <>
                    <CarouselPrevious className="left-4" />
                    <CarouselNext className="right-4" />
                  </>
                )}
            </Carousel>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-headline font-bold mb-1">{car.name}</h1>
          <p className="text-lg text-muted-foreground mb-4">{car.type}</p>

          <div className="flex items-center gap-2 mb-4">
            {car.isAvailable ? (
              <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4" />
                Available
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="mr-2 h-4 w-4" />
                Not Available
              </Badge>
            )}
          </div>

          {car.priceEnabled && (
            <div className="text-4xl font-bold mb-4">
                {getSymbol()}{car.pricePerDay[currency]}
                <span className="text-xl font-normal text-muted-foreground">/day</span>
            </div>
           )}

          <div className="flex items-stretch gap-4 mb-6">
            <Button size="lg" className="flex-1 h-12 text-lg" disabled={!car.isAvailable}>
              {car.isAvailable ? 'Rent Now' : 'Currently Unavailable'}
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
             <CarDetailClient bookedDates={car.bookedDates} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
