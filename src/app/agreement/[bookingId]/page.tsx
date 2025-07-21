
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
import { Loader2, Save, ArrowLeft, FileSignature, User, Car, Calendar, UserCheck, Download, Languages } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';
import PrintableAgreement from '@/components/printable-agreement';
import PrintableAgreementSi from '@/components/printable-agreement-si';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";


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

const labels = {
    en: {
        backToBookings: 'Back to Bookings',
        downloadAsPdf: 'Download as PDF',
        downloading: 'Downloading...',
        agreementDetails: 'Agreement Details',
        agreementDesc: 'Records of the rental transaction basics.',
        date: 'Date',
        nicPassport: 'NIC or Passport No',
        nicPassportPlaceholder: 'Client\'s National ID or Passport',
        address: 'Address',
        addressPlaceholder: 'Full address of the renter',
        vehicleDetails: 'Vehicle Details',
        rentalStartDate: 'Rental Start Date',
        rentalDuration: 'Rental Duration (Days/Months)',
        rentalDurationPlaceholder: 'e.g., 7 Days',
        rentCost: 'Rent Cost Per Day/Month',
        rentCostPlaceholder: 'e.g., $50 / Day',
        totalRentCost: 'Total Rent Cost',
        totalRentCostPlaceholder: 'Total calculated price',
        depositMoney: 'Deposit Money',
        depositMoneyPlaceholder: 'Refundable security deposit',
        dailyKmLimit: 'Daily KM Limit',
        dailyKmLimitPlaceholder: 'e.g., 100km',
        priceForAdditionalKm: 'Price for Additional KM',
        priceForAdditionalKmPlaceholder: 'e.g., $0.50 / km',
        clientDetails: 'Client Details',
        clientFullName: 'Client Full Name',
        clientContact: 'Contact Number',
        dateOfSigning: 'Date of Signing',
        guarantorDetails: 'Guarantor Details',
        guarantorName: 'Guarantor Name',
        guarantorNamePlaceholder: 'Full name of guarantor',
        guarantorNic: 'Guarantor NIC',
        guarantorNicPlaceholder: 'National ID of guarantor',
        guarantorAddress: 'Guarantor Address',
        guarantorAddressPlaceholder: 'Guarantor\'s home or office address',
        guarantorContact: 'Guarantor Contact Number',
        guarantorContactPlaceholder: 'Guarantor\'s phone number',
        printableSections: 'Printable Sections',
        printableDesc: 'The following sections are part of the downloadable PDF and are intended to be filled out on the printed copy.',
        agreementConfirmation: 'Agreement Confirmation: Client and company signatures.',
        extensionSection: 'Extension Section: Details and signatures for rental extensions.',
        vehicleReturnSection: 'Vehicle Return Section: Final charges, damages, and return signatures.',
        saveAgreement: 'Save Agreement',
        saving: 'Saving...',
        selectLanguage: 'Select Language'
    },
    si: {
        backToBookings: 'වෙන්කිරීම් වෙත ආපසු',
        downloadAsPdf: 'PDF ලෙස බාගන්න',
        downloading: 'බාගත වෙමින් පවතී...',
        agreementDetails: 'ගිවිසුම් විස්තර',
        agreementDesc: '',
        date: 'දිනය',
        nicPassport: 'ජාතික හැඳුනුම්පත් අංකය හෝ ගමන් බලපත්‍ර අංකය',
        nicPassportPlaceholder: 'සේවාදායකයාගේ ජාතික හැඳුනුම්පත හෝ ගමන් බලපත්‍රය',
        address: 'ලිපිනය',
        addressPlaceholder: 'කුලීකරුගේ සම්පූර්ණ ලිපිනය',
        vehicleDetails: 'වාහන විස්තර',
        rentalStartDate: 'කුලියට දෙන දිනය',
        rentalDuration: 'කුලී කාලය (දින/මාස)',
        rentalDurationPlaceholder: 'උදා: දින 7',
        rentCost: 'දිනකට/මාසයකට කුලී ගාස්තුව',
        rentCostPlaceholder: 'උදා: $50 / දිනකට',
        totalRentCost: 'සම්පූර්ණ කුලී ගාස්තුව',
        totalRentCostPlaceholder: 'ගණනය කළ සම්පූර්ණ මිල',
        depositMoney: 'තැන්පතු මුදල',
        depositMoneyPlaceholder: 'ආපසු ගෙවිය හැකි ආරක්ෂක තැන්පතුව',
        dailyKmLimit: 'දෛනික කි.මී. සීමාව',
        dailyKmLimitPlaceholder: 'උදා: 100km',
        priceForAdditionalKm: 'අමතර කි.මී. සඳහා මිල',
        priceForAdditionalKmPlaceholder: 'උදා: $0.50 / කි.මී.',
        clientDetails: 'සේවාදායකයාගේ විස්තර',
        clientFullName: 'සේවාදායකයාගේ සම්පූර්ණ නම',
        clientContact: 'සම්බන්ධතා අංකය',
        dateOfSigning: 'අත්සන් කළ දිනය',
        guarantorDetails: 'ඇපකරුගේ විස්තර',
        guarantorName: 'ඇපකරුගේ නම',
        guarantorNamePlaceholder: 'ඇපකරුගේ සම්පූර්ණ නම',
        guarantorNic: 'ඇපකරුගේ ජාතික හැඳුනුම්පත',
        guarantorNicPlaceholder: 'ඇපකරුගේ ජාතික හැඳුනුම්පත',
        guarantorAddress: 'ඇපකරුගේ ලිපිනය',
        guarantorAddressPlaceholder: 'ඇපකරුගේ නිවසේ හෝ කාර්යාල ලිපිනය',
        guarantorContact: 'ඇපකරුගේ සම්බන්ධතා අංකය',
        guarantorContactPlaceholder: 'ඇපකරුගේ දුරකථන අංකය',
        printableSections: 'මුද්‍රණය කළ හැකි කොටස්',
        printableDesc: 'පහත කොටස් බාගත හැකි PDF හි කොටසක් වන අතර මුද්‍රිත පිටපතේ පිරවීම සඳහා අදහස් කෙරේ.',
        agreementConfirmation: 'ගිවිසුම් තහවුරු කිරීම: සේවාදායකයාගේ සහ සමාගමේ අත්සන්.',
        extensionSection: 'දීර්ඝ කිරීමේ කොටස: කුලී දීර්ඝ කිරීම් සඳහා විස්තර සහ අත්සන්.',
        vehicleReturnSection: 'වාහන ආපසු භාරදීමේ කොටස: අවසාන ගාස්තු, හානි, සහ ආපසු භාරදීමේ අත්සන්.',
        saveAgreement: 'ගිවිසුම සුරකින්න',
        saving: 'සුරැකෙමින්...',
        selectLanguage: 'භාෂාව තෝරන්න'
    }
};

export default function AgreementPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [language, setLanguage] = useState<'en' | 'si'>('en');
  
  const bookingId = Array.isArray(params.bookingId) ? params.bookingId[0] : params.bookingId;
  const printableRefEn = useRef<HTMLDivElement>(null);
  const printableRefSi = useRef<HTMLDivElement>(null);

  const t = labels[language];

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
    const printableElement = language === 'en' ? printableRefEn.current : printableRefSi.current;

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

        pdf.save(`rental-agreement-${bookingId}-${language}.pdf`);
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
       <div className="mb-8 flex justify-between items-center gap-4">
            <Button variant="outline" asChild>
                <Link href={user?.role === 'admin' ? '/admin/bookings' : '/my-bookings'}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t.backToBookings}
                </Link>
            </Button>
            <div className="flex items-center gap-2">
                <ToggleGroup type="single" value={language} onValueChange={(value: 'en' | 'si') => {if(value) setLanguage(value)}} aria-label={t.selectLanguage}>
                    <ToggleGroupItem value="en" aria-label="English">EN</ToggleGroupItem>
                    <ToggleGroupItem value="si" aria-label="Sinhala">සිං</ToggleGroupItem>
                </ToggleGroup>
                <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                    {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4"/>}
                    {isDownloading ? t.downloading : t.downloadAsPdf}
                </Button>
            </div>
        </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl"><FileSignature className="h-6 w-6"/>{t.agreementDetails}</CardTitle>
                    <CardDescription>{t.agreementDesc}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="agreementDate" render={({ field }) => (
                        <FormItem><FormLabel>{t.date}</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="renterIdOrPassport" render={({ field }) => (
                        <FormItem><FormLabel>{t.nicPassport}</FormLabel><FormControl><Input placeholder={t.nicPassportPlaceholder} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="renterAddress" render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>{t.address}</FormLabel><FormControl><Textarea placeholder={t.addressPlaceholder} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="vehicleDetails" render={({ field }) => (
                        <FormItem><FormLabel>{t.vehicleDetails}</FormLabel><FormControl><Input disabled {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="rentalStartDate" render={({ field }) => (
                        <FormItem><FormLabel>{t.rentalStartDate}</FormLabel><FormControl><Input type="date" disabled {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="rentalDuration" render={({ field }) => (
                        <FormItem><FormLabel>{t.rentalDuration}</FormLabel><FormControl><Input placeholder={t.rentalDurationPlaceholder} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="rentCostPerDayMonth" render={({ field }) => (
                        <FormItem><FormLabel>{t.rentCost}</FormLabel><FormControl><Input placeholder={t.rentCostPlaceholder} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="totalRentCost" render={({ field }) => (
                        <FormItem><FormLabel>{t.totalRentCost}</FormLabel><FormControl><Input placeholder={t.totalRentCostPlaceholder} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="depositMoney" render={({ field }) => (
                        <FormItem><FormLabel>{t.depositMoney}</FormLabel><FormControl><Input placeholder={t.depositMoneyPlaceholder} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="dailyKMLimit" render={({ field }) => (
                        <FormItem><FormLabel>{t.dailyKmLimit}</FormLabel><FormControl><Input placeholder={t.dailyKmLimitPlaceholder} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="priceForAdditionalKM" render={({ field }) => (
                        <FormItem><FormLabel>{t.priceForAdditionalKm}</FormLabel><FormControl><Input placeholder={t.priceForAdditionalKmPlaceholder} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl"><User className="h-6 w-6"/>{t.clientDetails}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="clientFullName" render={({ field }) => (
                        <FormItem><FormLabel>{t.clientFullName}</FormLabel><FormControl><Input disabled {...field} value={field.value ?? ''} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="clientContactNumber" render={({ field }) => (
                        <FormItem><FormLabel>{t.clientContact}</FormLabel><FormControl><Input disabled {...field} value={field.value ?? ''} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="clientSignDate" render={({ field }) => (
                        <FormItem><FormLabel>{t.dateOfSigning}</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl></FormItem>
                    )} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl"><UserCheck className="h-6 w-6"/>{t.guarantorDetails}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormField control={form.control} name="guarantorName" render={({ field }) => (
                        <FormItem><FormLabel>{t.guarantorName}</FormLabel><FormControl><Input placeholder={t.guarantorNamePlaceholder} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                     )} />
                     <FormField control={form.control} name="guarantorNIC" render={({ field }) => (
                        <FormItem><FormLabel>{t.guarantorNic}</FormLabel><FormControl><Input placeholder={t.guarantorNicPlaceholder} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                     )} />
                     <FormField control={form.control} name="guarantorAddress" render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>{t.guarantorAddress}</FormLabel><FormControl><Textarea placeholder={t.guarantorAddressPlaceholder} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                     )} />
                     <FormField control={form.control} name="guarantorContact" render={({ field }) => (
                        <FormItem><FormLabel>{t.guarantorContact}</FormLabel><FormControl><Input placeholder={t.guarantorContactPlaceholder} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                     )} />
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>{t.printableSections}</CardTitle>
                    <CardDescription>{t.printableDesc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground italic">
                    <p><strong>{t.agreementConfirmation}</strong></p>
                    <p><strong>{t.extensionSection}</strong></p>
                    <p><strong>{t.vehicleReturnSection}</strong></p>
                </CardContent>
            </Card>

            <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="w-full">
                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {form.formState.isSubmitting ? t.saving : t.saveAgreement}
            </Button>
        </form>
      </Form>
      <div className="absolute -z-50 -left-[9999px] top-0">
        <PrintableAgreement ref={printableRefEn} data={form.getValues()} />
        <PrintableAgreementSi ref={printableRefSi} data={form.getValues()} />
      </div>
    </div>
  );
}
