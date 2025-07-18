
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
import { Badge } from "./ui/badge";
import { Users, Gauge, Settings, CheckCircle, XCircle, Fuel } from "lucide-react";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface CarCardProps {
  car: CarType;
}

export function CarCard({ car }: CarCardProps) {
  return (
    <Dialog>
      <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
        <CardHeader className="p-0 relative">
          <div className="block aspect-video overflow-hidden">
            <Image
              src={car.images[0] || "https://placehold.co/600x400.png"}
              alt={car.name}
              width={600}
              height={400}
              data-ai-hint={car.dataAiHint}
              className="object-cover w-full h-full transform transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="absolute top-2 right-2">
            {car.isAvailable ? (
              <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4" />
                Available
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="mr-2 h-4 w-4" />
                Unavailable
              </Badge>
            )}
          </div>
           {car.priceEnabled && (
             <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm text-foreground font-bold p-2 rounded-md">
                ${car.pricePerDay}
                <span className="font-normal text-sm text-muted-foreground">/day</span>
            </div>
           )}
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-xl mb-2 font-headline">
            {car.name}
          </CardTitle>
          <div className="text-sm text-muted-foreground grid grid-cols-3 gap-2">
            <div className="flex items-center gap-1.5">
              <Users size={16} />
              <span>{car.specs.seats} Seats</span>
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
        <CardFooter className="p-4 pt-0">
          <DialogTrigger asChild>
            <Button className="w-full">View Details</Button>
          </DialogTrigger>
        </CardFooter>
      </Card>

      <DialogContent className="sm:max-w-4xl p-0">
        <div className="grid grid-cols-1 md:grid-cols-2">
           <div className="p-2">
                <Carousel className="w-full">
                <CarouselContent>
                    {car.images.map((imageSrc, index) => (
                    <CarouselItem key={index}>
                        <div className="aspect-video relative overflow-hidden rounded-lg">
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
           </div>
           <div className="p-6 flex flex-col">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-3xl font-headline">{car.name}</DialogTitle>
                    <DialogDescription className="text-base">{car.type}</DialogDescription>
                </DialogHeader>
                
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
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-6 text-sm">
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
                
                {car.priceEnabled && (
                    <div className="text-3xl font-bold mb-6">
                        ${car.pricePerDay}
                        <span className="text-lg font-normal text-muted-foreground">/day</span>
                    </div>
                )}

                <div className="mt-auto flex gap-4">
                     <Button size="lg" className="flex-1" asChild>
                        <Link href={`/cars/${car.id}`}>
                            Rent Now
                        </Link>
                    </Button>
                </div>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
