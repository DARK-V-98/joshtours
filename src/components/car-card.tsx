
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
import { CheckCircle, XCircle, Check, Users, Cog, Fuel } from "lucide-react";
import React from "react";
import { useCurrency } from "@/context/CurrencyContext";

interface CarCardProps {
  car: CarType;
}

export function CarCard({ car }: CarCardProps) {
  const { currency, getSymbol } = useCurrency();

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group bg-card/50">
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
         <div className="absolute top-4 left-4 flex gap-2">
            <Badge
                variant="secondary"
                className="capitalize text-xs font-medium"
            >
                {car.type}
            </Badge>
            {car.isAvailable ? (
                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                Available
                </Badge>
            ) : (
                <Badge variant="destructive" className="text-xs">
                Booked
                </Badge>
            )}
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-grow space-y-4">
        <CardTitle className="text-xl mb-2 font-display">
          <Link href={`/cars/${car.id}`} className="hover:text-primary transition-colors">
            {car.name}
          </Link>
        </CardTitle>
        
        {/* Specs */}
        <div className="flex items-center gap-4 text-muted-foreground text-sm">
            {car.specifications.slice(0, 3).map((spec, index) => (
                <div key={index} className="flex items-center gap-1.5">
                    {index === 0 && <Users className="w-4 h-4 text-primary" />}
                    {index === 1 && <Cog className="w-4 h-4 text-primary" />}
                    {index === 2 && <Fuel className="w-4 h-4 text-primary" />}
                    <span className="capitalize">{spec}</span>
                </div>
            ))}
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0 flex items-center justify-between">
         {car.priceEnabled && car.pricePerDay && (
           <div className="">
              <span className="text-muted-foreground text-xs">From</span>
              <p className="text-2xl font-display font-bold text-primary">
                {getSymbol()}{car.pricePerDay[currency]}
                <span className="text-sm font-normal text-muted-foreground">/day</span>
              </p>
          </div>
         )}
        <Button asChild>
          <Link href={`/cars/${car.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
