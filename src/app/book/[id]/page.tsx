
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";

import { getCarById, Car } from "@/lib/data";
import { createBookingRequest } from "@/lib/bookingActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, CheckCircle, Loader2, Phone, Mail, User, Car as CarIcon, ArrowLeft, Route, UploadCloud } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const fileSchema = z.custom<File>((val) => val instanceof File, "Please upload a file")
  .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
  .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), ".jpg, .jpeg, .png and .webp files are accepted.");

const bookingFormSchema = z.object({
  // Booking Details
  pickupDate: z.date({ required_error: "A pickup date is required." }),
  returnDate: z.date({ required_error: "A return date is required." }),
  estimatedKm: z.coerce.number().min(1, "Please enter an estimated mileage.").optional(),
  requests: z.string().max(500, "Message cannot exceed 500 characters.").optional(),

  // Customer Details
  customerName: z.string().min(2, "Full name is required."),
  customerPhone: z.string().min(5, "A valid phone number is required."),
  customerResidency: z.enum(['local', 'tourist'], { required_error: "Please select your residency status."}),
  customerNicOrPassport: z.string().min(3, "NIC or Passport number is required."),
  
  // Guarantor Details
  guarantorName: z.string().min(2, "Guarantor's full name is required."),
  guarantorPhone: z.string().min(5, "A valid phone number is required."),
  guarantorResidency: z.enum(['local', 'tourist'], { required_error: "Please select guarantor's residency."}),
  guarantorNicOrPassport: z.string().min(3, "Guarantor's NIC or Passport number is required."),
  
  // File Uploads (all optional in schema, required conditionally in form)
  customerNicFront: fileSchema.optional(),
  customerNicBack: fileSchema.optional(),
  customerLightBill: fileSchema.optional(),
  customerPassportFront: fileSchema.optional(),
  customerPassportBack: fileSchema.optional(),
  customerLicenseFront: fileSchema.optional(),
  customerLicenseBack: fileSchema.optional(),
  
  guarantorNicFront: fileSchema.optional(),
  guarantorNicBack: fileSchema.optional(),
  guarantorLightBill: fileSchema.optional(),
  guarantorPassportFront: fileSchema.optional(),
  guarantorPassportBack: fileSchema.optional(),
  guarantorLicenseFront: fileSchema.optional(),
  guarantorLicenseBack: fileSchema.optional(),
})
.refine((data) => data.returnDate > data.pickupDate, {
  message: "Return date must be after pickup date.",
  path: ["returnDate"],
})
.superRefine((data, ctx) => {
    // Customer validation
    if (data.customerResidency === 'local') {
        if (!data.customerNicFront) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "NIC front is required.", path: ["customerNicFront"] });
        if (!data.customerNicBack) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "NIC back is required.", path: ["customerNicBack"] });
        if (!data.customerLightBill) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Utility bill is required.", path: ["customerLightBill"] });
    } else if (data.customerResidency === 'tourist') {
        if (!data.customerPassportFront) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Passport front is required.", path: ["customerPassportFront"] });
        if (!data.customerPassportBack) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Passport back is required.", path: ["customerPassportBack"] });
        if (!data.customerLicenseFront) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "License front is required.", path: ["customerLicenseFront"] });
        if (!data.customerLicenseBack) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "License back is required.", path: ["customerLicenseBack"] });
    }
    // Guarantor validation
    if (data.guarantorResidency === 'local') {
        if (!data.guarantorNicFront) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Guarantor's NIC front is required.", path: ["guarantorNicFront"] });
        if (!data.guarantorNicBack) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Guarantor's NIC back is required.", path: ["guarantorNicBack"] });
        if (!data.guarantorLightBill) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Guarantor's utility bill is required.", path: ["guarantorLightBill"] });
    } else if (data.guarantorResidency === 'tourist') {
        if (!data.guarantorPassportFront) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Guarantor's Passport front is required.", path: ["guarantorPassportFront"] });
        if (!data.guarantorPassportBack) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Guarantor's Passport back is required.", path: ["guarantorPassportBack"] });
        if (!data.guarantorLicenseFront) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Guarantor's License front is required.", path: ["guarantorLicenseFront"] });
        if (!data.guarantorLicenseBack) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Guarantor's License back is required.", path: ["guarantorLicenseBack"] });
    }
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
      customerName: '',
      customerPhone: '',
      customerNicOrPassport: '',
      guarantorName: '',
      guarantorPhone: '',
      guarantorNicOrPassport: '',
    },
  });

  const customerResidency = form.watch('customerResidency');
  const guarantorResidency = form.watch('guarantorResidency');

  useEffect(() => {
    if (!authLoading && user) {
        form.setValue('customerName', user.displayName || '');
        form.setValue('customerPhone', user.phone || '');
    }
  }, [user, authLoading, form]);


   useEffect(() => {
    if (authLoading) return;
    if (!user) {
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
    
    const documentFormData = new FormData();
    const fileFields = [
        'customerNicFront', 'customerNicBack', 'customerLicenseFront', 'customerLicenseBack',
        'customerPassportFront', 'customerPassportBack', 'customerLightBill',
        'guarantorNicFront', 'guarantorNicBack', 'guarantorLicenseFront', 'guarantorLicenseBack',
        'guarantorPassportFront', 'guarantorPassportBack', 'guarantorLightBill'
    ];

    fileFields.forEach(field => {
        const file = values[field as keyof BookingFormValues] as File | undefined;
        if(file) {
            documentFormData.append(field, file);
        }
    })

    const bookingData = {
        carId: car.id,
        carName: car.name,
        userId: user.uid,
        customerEmail: user.email || 'N/A',
        ...values
    };
    
    try {
      await createBookingRequest(bookingData, documentFormData);
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
                    Your request to book the <strong>{car.name}</strong> has been received. Our team will review the availability for your selected dates and the documents you have provided.
                </p>
                <Alert>
                    <Mail className="h-4 w-4"/>
                    <AlertTitle>What's Next?</AlertTitle>
                    <AlertDescription>
                        We will contact you shortly to confirm your booking. You can check the status on your bookings page.
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
  
  const FileUploadField = ({ name, label }: { name: keyof BookingFormValues, label: string }) => (
    <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
            <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                    <div className="relative">
                        <Input
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={(e) => field.onChange(e.target.files?.[0])}
                        />
                        <div className="flex items-center space-x-2 w-full h-12 border-2 border-dashed rounded-md px-4 bg-card/50 hover:bg-card/70 transition-colors">
                            <UploadCloud className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground truncate">
                                {field.value instanceof File ? field.value.name : `Choose ${label.toLowerCase()}...`}
                            </span>
                        </div>
                    </div>
                </FormControl>
                <FormMessage />
            </FormItem>
        )}
    />
);


  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Car Details
        </Button>
      </div>
       <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column for Car Info */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Your Selected Vehicle</CardTitle></CardHeader>
                        <CardContent>
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                            <Image src={car.images[0]} alt={car.name} fill className="object-cover"/>
                        </div>
                        <h2 className="mt-4 text-2xl font-bold">{car.name}</h2>
                        <p className="text-muted-foreground">{car.type}</p>
                        </CardContent>
                    </Card>
                </div>
            
                {/* Right Column for Form */}
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-headline">Booking Inquiry</CardTitle>
                            <CardDescription>Confirm your dates and details to request a booking for the {car.name}.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField control={form.control} name="pickupDate" render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Pickup Date</FormLabel>
                                    <Popover><PopoverTrigger asChild><FormControl>
                                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                    </FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))} initialFocus /></PopoverContent></Popover>
                                    <FormMessage />
                                </FormItem>
                                )}/>
                                <FormField control={form.control} name="returnDate" render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Return Date</FormLabel>
                                    <Popover><PopoverTrigger asChild><FormControl>
                                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                    </FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < (form.getValues("pickupDate") || new Date())} initialFocus /></PopoverContent></Popover>
                                    <FormMessage />
                                </FormItem>
                                )}/>
                            </div>
                            <FormField control={form.control} name="estimatedKm" render={({ field }) => (
                                <FormItem><FormLabel>Estimated Mileage (Optional)</FormLabel><FormControl>
                                <div className="relative"><Route className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="number" placeholder="e.g., 500" className="pl-8" {...field} /></div>
                                </FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="requests" render={({ field }) => (
                                <FormItem><FormLabel>Special Requests (Optional)</FormLabel><FormControl><Textarea placeholder="e.g., airport pickup, child seat..."{...field}/></FormControl><FormMessage /></FormItem>
                            )}/>
                        </CardContent>
                    </Card>

                    {/* Customer Information */}
                    <Card>
                        <CardHeader><CardTitle>Your Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           <div className="grid md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="customerName" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                <FormField control={form.control} name="customerPhone" render={({ field }) => (<FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input placeholder="+94 123 456 789" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                            </div>
                            <FormField control={form.control} name="customerNicOrPassport" render={({ field }) => (<FormItem><FormLabel>NIC / Passport Number</FormLabel><FormControl><Input placeholder="Enter your ID number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        </CardContent>
                    </Card>

                    {/* Customer Documents */}
                    <Card>
                        <CardHeader><CardTitle>Your Documents</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <FormField control={form.control} name="customerResidency" render={({ field }) => (
                                <FormItem className="space-y-3"><FormLabel>Residency Status</FormLabel><FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="local" /></FormControl><FormLabel className="font-normal">Sri Lankan</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="tourist" /></FormControl><FormLabel className="font-normal">Tourist / Foreign National</FormLabel></FormItem>
                                </RadioGroup></FormControl><FormMessage />
                            </FormItem>
                            )}/>
                            {customerResidency === 'local' && (
                                <div className="grid md:grid-cols-2 gap-4 pt-2">
                                    <FileUploadField name="customerNicFront" label="NIC (Front Side)" />
                                    <FileUploadField name="customerNicBack" label="NIC (Back Side)" />
                                    <FileUploadField name="customerLightBill" label="Utility Bill (e.g., Light Bill)" />
                                </div>
                            )}
                            {customerResidency === 'tourist' && (
                                <div className="grid md:grid-cols-2 gap-4 pt-2">
                                    <FileUploadField name="customerPassportFront" label="Passport (Front Side)" />
                                    <FileUploadField name="customerPassportBack" label="Passport (Back Side)" />
                                    <FileUploadField name="customerLicenseFront" label="Driving License (Front)" />
                                    <FileUploadField name="customerLicenseBack" label="Driving License (Back)" />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    
                    {/* Guarantor Information */}
                    <Card>
                        <CardHeader><CardTitle>Guarantor's Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           <div className="grid md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="guarantorName" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Jane Smith" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                <FormField control={form.control} name="guarantorPhone" render={({ field }) => (<FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input placeholder="+94 123 456 789" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                            </div>
                            <FormField control={form.control} name="guarantorNicOrPassport" render={({ field }) => (<FormItem><FormLabel>NIC / Passport Number</FormLabel><FormControl><Input placeholder="Enter guarantor's ID number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        </CardContent>
                    </Card>

                     {/* Guarantor Documents */}
                    <Card>
                        <CardHeader><CardTitle>Guarantor's Documents</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <FormField control={form.control} name="guarantorResidency" render={({ field }) => (
                                <FormItem className="space-y-3"><FormLabel>Residency Status</FormLabel><FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="local" /></FormControl><FormLabel className="font-normal">Sri Lankan</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="tourist" /></FormControl><FormLabel className="font-normal">Tourist / Foreign National</FormLabel></FormItem>
                                </RadioGroup></FormControl><FormMessage />
                            </FormItem>
                            )}/>
                            {guarantorResidency === 'local' && (
                                <div className="grid md:grid-cols-2 gap-4 pt-2">
                                    <FileUploadField name="guarantorNicFront" label="NIC (Front Side)" />
                                    <FileUploadField name="guarantorNicBack" label="NIC (Back Side)" />
                                    <FileUploadField name="guarantorLightBill" label="Utility Bill (e.g., Light Bill)" />
                                </div>
                            )}
                            {guarantorResidency === 'tourist' && (
                                <div className="grid md:grid-cols-2 gap-4 pt-2">
                                    <FileUploadField name="guarantorPassportFront" label="Passport (Front Side)" />
                                    <FileUploadField name="guarantorPassportBack" label="Passport (Back Side)" />
                                    <FileUploadField name="guarantorLicenseFront" label="Driving License (Front)" />
                                    <FileUploadField name="guarantorLicenseBack" label="Driving License (Back)" />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<CheckCircle className="mr-2 h-4 w-4" />)}
                        {form.formState.isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                    </Button>
                </div>
            </div>
         </form>
       </Form>
    </div>
  );
}

    