
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
import { CheckCircle, XCircle, Check } from "lucide-react";
import React from "react";
import { useCurrency } from "@/context/CurrencyContext";

interface CarCardProps {
  car: CarType;
}

export function CarCard({ car }: CarCardProps) {
  const { currency, getSymbol } = useCurrency();

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
      <CardHeader className="p-0 relative">
        <Link href={`/cars/${car.id}`} className="block aspect-video overflow-hidden">
          <Image
            src={car.images[0] || "https://placehold.co/600x400.png"}
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
         {car.priceEnabled && car.pricePerDay && (
           <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm text-foreground font-bold p-2 rounded-md">
              {getSymbol()}{car.pricePerDay[currency]}
              <span className="font-normal text-sm text-muted-foreground">/day</span>
          </div>
         )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl mb-2 font-headline">
          <Link href={`/cars/${car.id}`} className="hover:underline">
            {car.name}
          </Link>
        </CardTitle>
        <div className="text-sm text-muted-foreground">
            <ul className="space-y-1">
                {car.specifications.slice(0, 3).map((spec, index) => (
                    <li key={index} className="flex items-center gap-1.5">
                        <Check size={16} className="text-primary" />
                        <span>{spec}</span>
                    </li>
                ))}
            </ul>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" asChild>
          <Link href={`/cars/${car.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
