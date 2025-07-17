
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getCarById, Car } from "@/lib/data";
import { updateCar } from "@/lib/carActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

// Schema for editing, images are not required for update
const carFormSchema = z.object({
  name: z.string().min(2, "Car name must be at least 2 characters."),
  type: z.string().min(2, "Car type must be at least 2 characters."),
  isAvailable: z.boolean().default(true),
  specs: z.object({
    engine: z.string().min(1, "Engine spec is required."),
    transmission: z.enum(["Automatic", "Manual"]),
    seats: z.coerce.number().min(1, "Number of seats is required."),
    fuel: z.enum(["Gasoline", "Diesel", "Electric"]),
  }),
});

type CarFormValues = z.infer<typeof carFormSchema>;

export default function EditCarPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  const carId = Array.isArray(params.id) ? params.id[0] : params.id;

  const form = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!carId) return;

    const fetchCarData = async () => {
      setLoading(true);
      try {
        const carData = await getCarById(carId);
        if (carData) {
          setCar(carData);
          // Populate form with existing data
          form.reset({
            name: carData.name,
            type: carData.type,
            isAvailable: carData.isAvailable,
            specs: {
              engine: carData.specs.engine,
              transmission: carData.specs.transmission,
              seats: carData.specs.seats,
              fuel: carData.specs.fuel,
            },
          });
        } else {
          toast({ variant: "destructive", title: "Error", description: "Car not found." });
          router.push("/admin");
        }
      } catch (error) {
        console.error("Failed to fetch car data:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load car data." });
      } finally {
        setLoading(false);
      }
    };

    fetchCarData();
  }, [carId, form, router, toast]);

  async function onSubmit(values: CarFormValues) {
    try {
      await updateCar(carId, values);
      toast({
        title: "Success!",
        description: `The car "${values.name}" has been updated successfully.`,
      });
      router.push("/admin");
    } catch (error) {
      console.error("Failed to update car:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update the car. Please try again.",
      });
    }
  }

  if (loading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-1/3 mb-8" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/4" />
            </CardHeader>
            <CardContent className="space-y-8">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!car) {
    return null; // Or some other UI indicating car not found
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-headline font-bold mb-2">Edit Car</h1>
        <p className="text-muted-foreground mb-8">
          Modify the details for "{car.name}". Image editing is not yet supported.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Car Details</CardTitle>
            <CardDescription>
              Make your changes below and click save.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Car Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Toyota Camry" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Car Type / Description</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Sedan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Card className="bg-card/50">
                    <CardHeader><CardTitle className="text-lg">Specifications</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
                         <FormField
                            control={form.control}
                            name="specs.engine"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Engine</FormLabel>
                                <FormControl>
                                <Input placeholder="e.g., 2.5L V6" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="specs.transmission"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Transmission</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select transmission" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Automatic">Automatic</SelectItem>
                                        <SelectItem value="Manual">Manual</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="specs.seats"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Seats</FormLabel>
                                <FormControl>
                                <Input type="number" placeholder="e.g., 5" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="specs.fuel"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fuel Type</FormLabel>
                                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select fuel type" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Gasoline">Gasoline</SelectItem>
                                        <SelectItem value="Diesel">Diesel</SelectItem>
                                        <SelectItem value="Electric">Electric</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <FormField
                  control={form.control}
                  name="isAvailable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Availability</FormLabel>
                        <FormDescription>
                          Is this car available for rent right now?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button type="button" variant="outline" asChild>
                     <Link href="/admin">Cancel</Link>
                  </Button>
                  <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="flex-1">
                    {form.formState.isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {form.formState.isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
