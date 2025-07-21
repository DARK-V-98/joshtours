
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { useAuth } from '@/context/AuthContext';
import { getBookingRequestById } from '@/lib/bookingActions';
import { getCarById } from '@/lib/data';
import { getRentalAgreement, saveRentalAgreement, RentalAgreement } from '@/lib/rentalAgreementActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Loader2, Save, ArrowLeft, FileSignature, User, Car, Calendar, UserCheck, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';
import PrintableAgreement from '@/components/printable-agreement';

const agreementFormSchema = z.object({
  agreementDate: z.string().optional(),
  renterIdOrPassport: z.string().optional(),
  renterAddress: z.string().optional(),
  vehicleDetails: z.string().optional(),
  rentalStartDate: z.string().optional(),
  rentalDuration: z.string().optional(),
  rentCostPerDayMonth: z.string().optional(),
  totalRentCost: z.string().optional(),
  depositMoney: z.string().optional(),
  dailyKMLimit: z.string().optional(),
  priceForAdditionalKM: z.string().optional(),
  clientFullName: z.string().optional(),
  clientContactNumber: z.string().optional(),
  clientSignDate: z.string().optional(),
  guarantorName: z.string().optional(),
  guarantorNIC: z.string().optional(),
  guarantorAddress: z.string().optional(),
  guarantorContact: z.string().optional(),
});

export type AgreementFormValues = z.infer<typeof agreementFormSchema>;

export default function AgreementPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const bookingId = Array.isArray(params.bookingId) ? params.bookingId[0] : params.bookingId;
  const printableRef = useRef<HTMLDivElement>(null);

  const form = useForm<AgreementFormValues>({
    resolver: zodResolver(agreementFormSchema),
    defaultValues: {
        agreementDate: '',
        renterIdOrPassport: '',
        renterAddress: '',
        vehicleDetails: '',
        rentalStartDate: '',
        clientFullName: '',
        clientContactNumber: '',
        rentalDuration: '',
        rentCostPerDayMonth: '',
        totalRentCost: '',
        depositMoney: '',
        dailyKMLimit: '',
        priceForAdditionalKM: '',
        clientSignDate: '',
        guarantorName: '',
        guarantorNIC: '',
        guarantorAddress: '',
        guarantorContact: '',
    },
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push(`/login?redirect=/agreement/${bookingId}`);
      return;
    }

    async function fetchData() {
      setLoading(true);
      try {
        const booking = await getBookingRequestById(bookingId);

        if (!booking) {
            toast({ variant: 'destructive', title: 'Error', description: 'Booking not found.' });
            router.push('/my-bookings');
            return;
        }
        
        const [agreement, carDetails] = await Promise.all([
            getRentalAgreement(bookingId),
            getCarById(booking.carId)
        ]);

        
        form.reset({
            agreementDate: agreement?.agreementDate || format(new Date(), 'yyyy-MM-dd'),
            renterIdOrPassport: agreement?.renterIdOrPassport || '',
            renterAddress: agreement?.renterAddress || '',
            vehicleDetails: agreement?.vehicleDetails || `${carDetails?.name} (${carDetails?.type})`,
            rentalStartDate: agreement?.rentalStartDate || booking.pickupDate,
            clientFullName: agreement?.clientFullName || booking.customerName,
            clientContactNumber: agreement?.clientContactNumber || booking.customerPhone,
            rentalDuration: agreement?.rentalDuration || '',
            rentCostPerDayMonth: agreement?.rentCostPerDayMonth || '',
            totalRentCost: agreement?.totalRentCost || '',
            depositMoney: agreement?.depositMoney || '',
            dailyKMLimit: agreement?.dailyKMLimit || '',
            priceForAdditionalKM: agreement?.priceForAdditionalKM || '',
            clientSignDate: agreement?.clientSignDate || '',
            guarantorName: agreement?.guarantorName || '',
            guarantorNIC: agreement?.guarantorNIC || '',
            guarantorAddress: agreement?.guarantorAddress || '',
            guarantorContact: agreement?.guarantorContact || '',
        });

      } catch (error) {
        console.error('Failed to fetch agreement data:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load agreement data.' });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [bookingId, user, authLoading, router, toast, form]);

  async function onSubmit(values: AgreementFormValues) {
    try {
      await saveRentalAgreement(bookingId, values);
      toast({
        title: 'Success!',
        description: 'Your rental agreement has been saved.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save the agreement. Please try again.',
      });
    }
  }

  const handleDownloadPdf = async () => {
    const printableElement = printableRef.current;
    if (!printableElement) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not find printable content.' });
      return;
    }
    
    const page1 = printableElement.querySelector<HTMLElement>('[data-page="1"]');
    const page2 = printableElement.querySelector<HTMLElement>('[data-page="2"]');

    if (!page1 || !page2) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not find page elements for PDF generation.' });
      return;
    }

    setIsDownloading(true);

    try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const processPage = async (element: HTMLElement) => {
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const imgProps = pdf.getImageProperties(imgData);
            const pageHeight = (imgProps.height * pdfWidth) / imgProps.width;
            return { imgData, pdfWidth, pageHeight };
        };

        const page1Data = await processPage(page1);
        pdf.addImage(page1Data.imgData, 'PNG', 0, 0, page1Data.pdfWidth, page1Data.pageHeight);

        pdf.addPage();
        const page2Data = await processPage(page2);
        pdf.addImage(page2Data.imgData, 'PNG', 0, 0, page2Data.pdfWidth, page2Data.pageHeight);

        pdf.save(`rental-agreement-${bookingId}.pdf`);
    } catch (error) {
        console.error("Error generating PDF:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate PDF.' });
    } finally {
        setIsDownloading(false);
    }
  };
  
  if (loading || authLoading) {
      return (
          <div className="container mx-auto px-4 py-12 max-w-4xl">
              <Skeleton className="h-10 w-64 mb-8" />
              <Card>
                  <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
                  <CardContent className="space-y-6 mt-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-20 w-full" />
                  </CardContent>
              </Card>
          </div>
      );
  }


  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
       <div className="mb-8 flex justify-between items-center">
            <Button variant="outline" asChild>
                <Link href={user?.role === 'admin' ? '/admin/bookings' : '/my-bookings'}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Bookings
                </Link>
            </Button>
            <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4"/>}
                {isDownloading ? 'Downloading...' : 'Download as PDF'}
            </Button>
        </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl"><FileSignature className="h-6 w-6"/>Agreement Details</CardTitle>
                    <CardDescription>Records of the rental transaction basics.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="agreementDate" render={({ field }) => (
                        <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="renterIdOrPassport" render={({ field }) => (
                        <FormItem><FormLabel>NIC or Passport No</FormLabel><FormControl><Input placeholder="Client's National ID or Passport" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="renterAddress" render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>Address</FormLabel><FormControl><Textarea placeholder="Full address of the renter" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="vehicleDetails" render={({ field }) => (
                        <FormItem><FormLabel>Vehicle Details</FormLabel><FormControl><Input disabled {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="rentalStartDate" render={({ field }) => (
                        <FormItem><FormLabel>Rental Start Date</FormLabel><FormControl><Input type="date" disabled {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="rentalDuration" render={({ field }) => (
                        <FormItem><FormLabel>Rental Duration (Days/Months)</FormLabel><FormControl><Input placeholder="e.g., 7 Days" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="rentCostPerDayMonth" render={({ field }) => (
                        <FormItem><FormLabel>Rent Cost Per Day/Month</FormLabel><FormControl><Input placeholder="e.g., $50 / Day" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="totalRentCost" render={({ field }) => (
                        <FormItem><FormLabel>Total Rent Cost</FormLabel><FormControl><Input placeholder="Total calculated price" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="depositMoney" render={({ field }) => (
                        <FormItem><FormLabel>Deposit Money</FormLabel><FormControl><Input placeholder="Refundable security deposit" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="dailyKMLimit" render={({ field }) => (
                        <FormItem><FormLabel>Daily KM Limit</FormLabel><FormControl><Input placeholder="e.g., 100km" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="priceForAdditionalKM" render={({ field }) => (
                        <FormItem><FormLabel>Price for Additional KM</FormLabel><FormControl><Input placeholder="e.g., $0.50 / km" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl"><User className="h-6 w-6"/>Client Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="clientFullName" render={({ field }) => (
                        <FormItem><FormLabel>Client Full Name</FormLabel><FormControl><Input disabled {...field} value={field.value ?? ''} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="clientContactNumber" render={({ field }) => (
                        <FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input disabled {...field} value={field.value ?? ''} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="clientSignDate" render={({ field }) => (
                        <FormItem><FormLabel>Date of Signing</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl></FormItem>
                    )} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl"><UserCheck className="h-6 w-6"/>Guarantor Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormField control={form.control} name="guarantorName" render={({ field }) => (
                        <FormItem><FormLabel>Guarantor Name</FormLabel><FormControl><Input placeholder="Full name of guarantor" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                     )} />
                     <FormField control={form.control} name="guarantorNIC" render={({ field }) => (
                        <FormItem><FormLabel>Guarantor NIC</FormLabel><FormControl><Input placeholder="National ID of guarantor" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                     )} />
                     <FormField control={form.control} name="guarantorAddress" render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>Guarantor Address</FormLabel><FormControl><Textarea placeholder="Guarantor's home or office address" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                     )} />
                     <FormField control={form.control} name="guarantorContact" render={({ field }) => (
                        <FormItem><FormLabel>Guarantor Contact Number</FormLabel><FormControl><Input placeholder="Guarantor's phone number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                     )} />
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Printable Sections</CardTitle>
                    <CardDescription>The following sections are part of the downloadable PDF and are intended to be filled out on the printed copy.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground italic">
                    <p><strong>Agreement Confirmation:</strong> Client and company signatures.</p>
                    <p><strong>Extension Section:</strong> Details and signatures for rental extensions.</p>
                    <p><strong>Vehicle Return Section:</strong> Final charges, damages, and return signatures.</p>
                </CardContent>
            </Card>

            <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="w-full">
                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {form.formState.isSubmitting ? 'Saving...' : 'Save Agreement'}
            </Button>
        </form>
      </Form>
      <div className="absolute -z-50 -left-[9999px] top-0">
        <PrintableAgreement ref={printableRef} data={form.getValues()} />
      </div>
    </div>
  );
}
