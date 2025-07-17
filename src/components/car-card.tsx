
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
import { Users, Gauge, Settings, CheckCircle, XCircle } from "lucide-react";
import React from "react";

interface CarCardProps {
  car: CarType;
}

export function CarCard({ car }: CarCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
      <CardHeader className="p-0 relative">
        <Link href={`/cars/${car.id}`} className="block aspect-video overflow-hidden">
          <Image
            src={car.images[0] || "https://placehold.co/600x400.png"} // Display the first image
            alt={car.name}
            width={600}
            height={400}
            data-ai-hint={car.dataAiHint}
            className="object-cover w-full h-full transform transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
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
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link href={`/cars/${car.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
