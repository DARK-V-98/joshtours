
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { useAuth } from '@/context/AuthContext';
import { getBookingRequestById, BookingRequest } from '@/lib/bookingActions';
import { getCarById, Car } from '@/lib/data';
import { saveBill, getBillById, Bill } from '@/lib/billingActions';
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ArrowLeft, FileText, Loader2, Save, Download } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import PrintableBill from '@/components/printable-bill';
import { format } from 'date-fns';


const billingFormSchema = z.object({
  additionalKm: z.coerce.number().min(0).optional().default(0),
  pricePerKm: z.coerce.number().min(0).optional().default(0),
  additionalDays: z.coerce.number().min(0).optional().default(0),
  damages: z.coerce.number().min(0).optional().default(0),
  delayPayments: z.coerce.number().min(0).optional().default(0),
  otherCharges: z.coerce.number().min(0).optional().default(0),
  paidAmount: z.coerce.number().min(0).optional().default(0),
  billDate: z.string().optional(),
});

type BillingFormValues = z.infer<typeof billingFormSchema>;

export default function BillingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [booking, setBooking] = useState<BookingRequest | null>(null);
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const printableRef = useRef<HTMLDivElement>(null);
  const bookingId = Array.isArray(params.bookingId) ? params.bookingId[0] : params.bookingId;

  const form = useForm<BillingFormValues>({
    resolver: zodResolver(billingFormSchema),
    defaultValues: {
      additionalKm: 0,
      pricePerKm: 0,
      additionalDays: 0,
      damages: 0,
      delayPayments: 0,
      otherCharges: 0,
      paidAmount: 0,
      billDate: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const watchFields = form.watch();

  const subTotal =
    (watchFields.additionalKm || 0) * (watchFields.pricePerKm || 0) +
    (watchFields.additionalDays || 0) * (car?.pricePerDay.lkr || 0);

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
    if (!bookingId) return;
    async function fetchBookingData() {
      setLoading(true);
      try {
        const bookingData = await getBookingRequestById(bookingId);
        if (!bookingData) {
            toast({ variant: 'destructive', title: 'Not Found', description: 'Booking could not be found.' });
            router.push('/admin/bookings');
            return;
        }
        setBooking(bookingData);
        
        const [carData, billData] = await Promise.all([
            getCarById(bookingData.carId),
            getBillById(bookingId)
        ]);

        if (!carData) {
             toast({ variant: 'destructive', title: 'Not Found', description: 'Associated car could not be found.' });
             router.push('/admin/bookings');
             return;
        }
        setCar(carData);
        
        // If a bill already exists, populate the form
        if (billData) {
            form.reset({
                additionalKm: billData.additionalKm,
                pricePerKm: billData.pricePerKm,
                additionalDays: billData.additionalDays,
                damages: billData.damages,
                delayPayments: billData.delayPayments,
                otherCharges: billData.otherCharges,
                paidAmount: billData.paidAmount,
                billDate: billData.billDate || format(new Date(), 'yyyy-MM-dd')
            });
        } else {
            form.reset({
                ...form.getValues(),
                billDate: format(new Date(), 'yyyy-MM-dd')
            });
        }

      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load booking data.',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchBookingData();
  }, [bookingId, toast, router, form]);

  
  async function onSubmit(values: BillingFormValues) {
    if (!booking || !car) {
        toast({ variant: "destructive", title: 'Error', description: 'Booking or car data is missing.' });
        return;
    }

    try {
        await saveBill(booking.id, {
            bookingId: booking.id,
            customerName: booking.customerName,
            vehicleName: booking.carName,
            additionalKm: values.additionalKm || 0,
            pricePerKm: values.pricePerKm || 0,
            additionalDays: values.additionalDays || 0,
            pricePerDay: car.pricePerDay.lkr,
            damages: values.damages || 0,
            delayPayments: values.delayPayments || 0,
            otherCharges: values.otherCharges || 0,
            subTotal: subTotal,
            totalAmount: totalAmount,
            paidAmount: values.paidAmount || 0,
            balanceDue: balanceDue,
            billDate: values.billDate
        });
        toast({
            title: 'Bill Saved!',
            description: 'The final bill has been recorded successfully.',
        });
    } catch (error) {
        console.error("Failed to save bill:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to save the bill. Please try again.",
        });
    }
  }

  const handleDownloadPdf = async () => {
    if (!printableRef.current) return;
    setIsDownloading(true);
    try {
        const canvas = await html2canvas(printableRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`bill-${bookingId}.pdf`);
    } catch (error) {
        console.error("Error generating PDF:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to generate PDF." });
    } finally {
        setIsDownloading(false);
    }
  };


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
                    Generate a final bill for {booking?.carName} rented by {booking?.customerName}.
                </p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" asChild>
                    <Link href="/admin/bookings">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Bookings
                    </Link>
                </Button>
                 <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                    {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4"/>}
                    {isDownloading ? 'Downloading...' : 'Download as PDF'}
                </Button>
            </div>
        </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        <FormItem><FormLabel>Price per Additional Day</FormLabel><FormControl><Input type="number" disabled value={car?.pricePerDay.lkr || 0} /></FormControl></FormItem>
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
                    <FormField control={form.control} name="billDate" render={({ field }) => (
                        <FormItem><FormLabel>Bill Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
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
        </form>
      </Form>
       {/* Printable component hidden from view */}
      <div className="absolute -z-50 -left-[9999px] top-0">
         <PrintableBill 
            ref={printableRef} 
            data={form.getValues()}
            booking={booking}
            subTotal={subTotal}
            totalAmount={totalAmount}
            balanceDue={balanceDue}
            car={car}
        />
      </div>
    </div>
  );
}
