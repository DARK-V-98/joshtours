
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { getAllBookingRequests, BookingRequest } from '@/lib/bookingActions';
import { getCarById, Car } from '@/lib/data';
import { saveBill } from '@/lib/billingActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ArrowLeft, FileText, Loader2, Save } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const billingFormSchema = z.object({
  bookingId: z.string().min(1, 'Please select a booking.'),
  additionalKm: z.coerce.number().min(0).optional().default(0),
  pricePerKm: z.coerce.number().min(0).optional().default(0),
  additionalDays: z.coerce.number().min(0).optional().default(0),
  damages: z.coerce.number().min(0).optional().default(0),
  delayPayments: z.coerce.number().min(0).optional().default(0),
  otherCharges: z.coerce.number().min(0).optional().default(0),
  paidAmount: z.coerce.number().min(0).optional().default(0),
});

type BillingFormValues = z.infer<typeof billingFormSchema>;

export default function BillingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<BillingFormValues>({
    resolver: zodResolver(billingFormSchema),
  });

  const watchFields = form.watch();

  const subTotal =
    (watchFields.additionalKm || 0) * (watchFields.pricePerKm || 0) +
    (watchFields.additionalDays || 0) * (selectedCar?.pricePerDay.lkr || 0);

  const totalAmount =
    subTotal +
    (watchFields.damages || 0) +
    (watchFields.delayPayments || 0) +
    (watchFields.otherCharges || 0);

  const balanceDue = totalAmount - (watchFields.paidAmount || 0);


  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      try {
        const allBookings = await getAllBookingRequests();
        setBookings(allBookings.filter(b => b.status === 'confirmed'));
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load booking requests.',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [toast]);

  const handleBookingChange = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
        setSelectedBooking(booking);
        const carDetails = await getCarById(booking.carId);
        setSelectedCar(carDetails);
    }
  };
  
  async function onSubmit(values: BillingFormValues) {
    if (!selectedBooking || !selectedCar) {
        toast({ variant: "destructive", title: 'Error', description: 'Please select a booking first.' });
        return;
    }

    try {
        await saveBill(values.bookingId, {
            bookingId: values.bookingId,
            customerName: selectedBooking.customerName,
            vehicleName: selectedBooking.carName,
            additionalKm: values.additionalKm || 0,
            pricePerKm: values.pricePerKm || 0,
            additionalDays: values.additionalDays || 0,
            pricePerDay: selectedCar.pricePerDay.lkr,
            damages: values.damages || 0,
            delayPayments: values.delayPayments || 0,
            otherCharges: values.otherCharges || 0,
            subTotal: subTotal,
            totalAmount: totalAmount,
            paidAmount: values.paidAmount || 0,
            balanceDue: balanceDue
        });
        toast({
            title: 'Bill Saved!',
            description: 'The final bill has been recorded successfully.',
        });
        form.reset({ bookingId: '' });
        setSelectedBooking(null);
        setSelectedCar(null);
    } catch (error) {
        console.error("Failed to save bill:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to save the bill. Please try again.",
        });
    }
  }


  if (authLoading || loading) {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <Skeleton className="h-10 w-64 mb-8" />
            <Card><CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
                <CardContent className="space-y-6 mt-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-headline font-bold">Create Customer Bill</h1>
                <p className="text-muted-foreground">
                    Generate a final bill for a vehicle return.
                </p>
            </div>
            <Button variant="outline" asChild>
                <Link href="/admin">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
        </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
           <Card>
            <CardHeader>
                <CardTitle>Select Booking</CardTitle>
            </CardHeader>
            <CardContent>
                 <FormField
                  control={form.control}
                  name="bookingId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmed Booking</FormLabel>
                      <Select onValueChange={(value) => {
                          field.onChange(value);
                          handleBookingChange(value);
                      }} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a completed rental..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bookings.map((booking) => (
                            <SelectItem key={booking.id} value={booking.id}>
                              {booking.carName} - {booking.customerName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </CardContent>
           </Card>

           {selectedBooking && (
            <>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileText /> Return & Payment Details</CardTitle>
                        <CardDescription>All prices are in LKR.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="grid sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="additionalKm" render={({ field }) => (
                                <FormItem><FormLabel>Additional KM Used</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="pricePerKm" render={({ field }) => (
                                <FormItem><FormLabel>Price per Additional KM</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                         </div>
                          <div className="grid sm:grid-cols-2 gap-4">
                             <FormField control={form.control} name="additionalDays" render={({ field }) => (
                                <FormItem><FormLabel>Additional Days</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormItem><FormLabel>Price per Additional Day</FormLabel><FormControl><Input type="number" disabled value={selectedCar?.pricePerDay.lkr || 0} /></FormControl></FormItem>
                         </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Additional Charges (Optional)</CardTitle></CardHeader>
                    <CardContent className="grid sm:grid-cols-3 gap-4">
                         <FormField control={form.control} name="damages" render={({ field }) => (
                            <FormItem><FormLabel>Damages</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="delayPayments" render={({ field }) => (
                            <FormItem><FormLabel>Delay Payments</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="otherCharges" render={({ field }) => (
                            <FormItem><FormLabel>Other Charges</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Final Calculation</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2 text-lg">
                           <div className="flex justify-between items-center"><span className="text-muted-foreground">Sub-total (KM & Days)</span><span>Rs {subTotal.toFixed(2)}</span></div>
                           <Separator/>
                           <div className="flex justify-between items-center font-bold text-xl"><span className="text-foreground">Total Amount</span><span>Rs {totalAmount.toFixed(2)}</span></div>
                        </div>
                        <Separator/>
                        <div className="grid sm:grid-cols-2 gap-4 items-end">
                             <FormField control={form.control} name="paidAmount" render={({ field }) => (
                                <FormItem><FormLabel>Paid Amount (Advance, etc.)</FormLabel><FormControl><Input type="number" className="h-12 text-lg" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <div className="flex justify-between items-center font-bold text-2xl text-primary p-2 rounded-md bg-primary/10">
                                <span>Balance Due</span>
                                <span>Rs {balanceDue.toFixed(2)}</span>
                            </div>
                        </div>
                    </CardContent>
                 </Card>
                <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="w-full">
                    {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {form.formState.isSubmitting ? 'Saving Bill...' : 'Save Final Bill'}
                </Button>
            </>
           )}
        </form>
      </Form>
    </div>
  );
}
