
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { getCarById, Car } from "@/lib/data";
import { createBookingRequest } from "@/lib/bookingActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, CheckCircle, Loader2, Phone, Mail, User, Car as CarIcon, ArrowLeft, Route } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const bookingFormSchema = z.object({
  pickupDate: z.date({
    required_error: "A pickup date is required.",
  }),
  returnDate: z.date({
    required_error: "A return date is required.",
  }),
  estimatedKm: z.coerce.number().min(1, "Please enter an estimated mileage.").optional(),
  requests: z.string().max(500, "Message cannot exceed 500 characters.").optional(),
}).refine((data) => data.returnDate > data.pickupDate, {
  message: "Return date must be after pickup date.",
  path: ["returnDate"],
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const carId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      requests: "",
      estimatedKm: undefined,
    },
  });

   useEffect(() => {
    if (authLoading) return;
    if (!user) {
      // Redirect to login but save the intended destination
      router.push(`/login?redirect=/book/${carId}`);
    }
  }, [user, authLoading, router, carId]);


  useEffect(() => {
    const fetchCar = async () => {
      setLoading(true);
      const fetchedCar = await getCarById(carId);
      if (!fetchedCar) {
        router.push("/cars");
      } else {
        setCar(fetchedCar);
      }
      setLoading(false);
    };
    fetchCar();
  }, [carId, router]);

  async function onSubmit(values: BookingFormValues) {
    if (!car || !user) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "You must be logged in to make a booking request.",
        });
        return;
    }
    try {
      await createBookingRequest({
        carId: car.id,
        carName: car.name,
        userId: user.uid,
        customerName: user.displayName || user.email || 'N/A',
        customerEmail: user.email || 'N/A',
        customerPhone: user.phone || 'N/A',
        pickupDate: format(values.pickupDate, "yyyy-MM-dd"),
        returnDate: format(values.returnDate, "yyyy-MM-dd"),
        estimatedKm: values.estimatedKm,
        requests: values.requests,
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to create booking request:", error);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "Could not submit your request. Please try again.",
      });
    }
  }

  if (loading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid md:grid-cols-2 gap-12">
          <Skeleton className="h-[500px] w-full" />
          <Skeleton className="h-[700px] w-full" />
        </div>
      </div>
    );
  }
  
  if (!car || !user) return null;

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[70vh]">
        <Card className="max-w-2xl text-center">
            <CardHeader>
                 <div className="mx-auto bg-green-100 dark:bg-green-900/50 rounded-full h-16 w-16 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                 </div>
                 <CardTitle className="text-3xl font-headline mt-4">Inquiry Sent Successfully!</CardTitle>
                 <CardDescription className="text-lg">Thank you, {user.displayName || user.email}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                    Your request to book the <strong>{car.name}</strong> has been received. Our team will review the availability for your selected dates. You can check the status on your bookings page.
                </p>
                <Alert>
                    <Mail className="h-4 w-4"/>
                    <AlertTitle>What's Next?</AlertTitle>
                    <AlertDescription>
                        We will contact you shortly to confirm availability and discuss pricing. You can also call us to finalize your booking.
                    </AlertDescription>
                </Alert>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button size="lg" className="flex-1" asChild>
                       <a href="tel:+94701209694"><Phone className="mr-2"/>Call JOSH TOURS</a>
                    </Button>
                    <Button size="lg" variant="secondary" className="flex-1" asChild>
                        <Link href="/my-bookings">
                            <CarIcon className="mr-2"/>View My Bookings
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
         <div className="mb-8">
            <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Car Details
            </Button>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Car Details Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Selected Vehicle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                  src={car.images[0]}
                  alt={car.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h2 className="mt-4 text-2xl font-bold">{car.name}</h2>
              <p className="text-muted-foreground">{car.type}</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Your Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{user.displayName || 'N/A'}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user.email}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user.phone || 'Not provided'}</span>
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Column */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Booking Inquiry</CardTitle>
            <CardDescription>
              Confirm your dates to request a booking for the {car.name}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pickupDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Pickup Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="returnDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Return Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < (form.getValues("pickupDate") || new Date())}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                 <FormField
                  control={form.control}
                  name="estimatedKm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Mileage (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Route className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type="number" placeholder="e.g., 500" className="pl-8" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Requests (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., airport pickup, child seat..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                   {form.formState.isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   ) : (
                     <CheckCircle className="mr-2 h-4 w-4" />
                   )}
                  {form.formState.isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
