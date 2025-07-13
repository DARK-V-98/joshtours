'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const stats = [
  { value: '126k+', label: 'TOTAL USER' },
  { value: '5+', label: 'YEARS EXPERIENCE' },
  { value: '4.8', label: 'AVERAGES REVIEW' },
  { value: '24/7', label: 'SERVICES' },
];

const BookingForm = () => (
   <Card className="p-6 shadow-xl bg-card/80 backdrop-blur-sm border-none">
    <CardContent className="p-0">
      <Tabs defaultValue="distance">
        <TabsList className="grid w-full grid-cols-3 bg-muted/70">
          <TabsTrigger value="distance">Distance</TabsTrigger>
          <TabsTrigger value="hourly">Hourly</TabsTrigger>
          <TabsTrigger value="flat_rate">Flat Rate</TabsTrigger>
        </TabsList>
        <TabsContent value="distance" className="mt-6">
          <form className="space-y-4">
            <Input placeholder="Pickup address" />
            <Input placeholder="Drop off address" />
            <Input placeholder="Pickup date" type="date" />
            <Input placeholder="Pickup time" type="time" />
            <Button type="submit" size="lg" className="w-full mt-4 text-base">
              Reserve Now
            </Button>
          </form>
        </TabsContent>
        <TabsContent value="hourly">
            <p className="text-center text-muted-foreground p-8">Hourly rates coming soon!</p>
        </TabsContent>
        <TabsContent value="flat_rate">
            <p className="text-center text-muted-foreground p-8">Flat rates coming soon!</p>
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
);

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h1 className="text-5xl lg:text-6xl font-headline font-bold !leading-tight">
            Rent A Car, <br /> Drive With Ease!
          </h1>
          <p className="text-muted-foreground text-lg max-w-md">
            Affordable, Reliable, And Hassle-Free Car Rentals For Every
            Journey. Book Your Ride Now!
          </p>
          <div className="max-w-md">
            <BookingForm />
          </div>
        </div>

        <div className="relative h-full min-h-[350px] lg:min-h-[450px]">
          <div className="absolute inset-0 bg-gray-200/50 rounded-3xl" />
          <div className="relative w-full h-full flex flex-col justify-between items-center p-8">
            <div className="w-full flex justify-end gap-4">
              <Badge variant="secondary" className="text-base py-2 px-4 rounded-lg bg-white shadow">Wide Range Of Vehicles</Badge>
              <Badge variant="secondary" className="text-base py-2 px-4 rounded-lg bg-white shadow">Affordable Pricing</Badge>
            </div>
            <div className="absolute bottom-0 w-[90%] lg:w-full">
              <Image
                src="/car.png"
                alt="Car"
                width={800}
                height={500}
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
      <section className="mt-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-4xl font-headline font-bold text-primary">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground tracking-widest mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
