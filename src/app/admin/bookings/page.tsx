
"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  getAllBookingRequests,
  updateBookingStatus,
  BookingRequest,
} from "@/lib/bookingActions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Loader2,
  Check,
  X,
  Mail,
  Phone,
  User,
  Calendar,
  Info,
  Car,
  ArrowLeft,
  AlertCircle,
  Route,
  FileText
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function AdminBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, startUpdateTransition] = useTransition();

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") {
      router.push("/");
      return;
    }

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const allBookings = await getAllBookingRequests();
        setBookings(allBookings);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load booking requests.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, authLoading, router, toast]);

  const handleStatusUpdate = (bookingId: string, newStatus: 'confirmed' | 'canceled') => {
    startUpdateTransition(async () => {
      try {
        await updateBookingStatus(bookingId, newStatus);
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
        );
        toast({
          title: "Success",
          description: `Booking has been ${newStatus}.`,
        });
      } catch (error) {
        console.error("Failed to update booking status:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update the booking. Please try again.",
        });
      }
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'canceled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-6 w-72 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex justify-between items-center">
            <div>
                 <h1 className="text-3xl font-headline font-bold mb-2">Booking Requests</h1>
                <p className="text-muted-foreground">
                    Review, confirm, or cancel customer booking inquiries.
                </p>
            </div>
            <Button variant="outline" asChild>
                <Link href="/admin">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
        </div>


      {bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2"><Car className="h-5 w-5 text-primary"/>{booking.carName}</CardTitle>
                       <CardDescription>
                        Requested on {format(parseISO(booking.createdAt), "PPP, p")}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusVariant(booking.status)} className="capitalize text-sm py-1 px-3">
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-semibold">Customer Details</h4>
                            <div className="text-sm space-y-2">
                                <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground"/>{booking.customerName}</div>
                                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground"/>{booking.customerEmail}</div>
                                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground"/>{booking.customerPhone}</div>
                            </div>
                             <Separator />
                             <h4 className="font-semibold">Booking Period</h4>
                             <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{format(parseISO(booking.pickupDate), "MMM dd, yyyy")} to {format(parseISO(booking.returnDate), "MMM dd, yyyy")}</span>
                            </div>
                             {booking.estimatedKm && (
                                <>
                                <Separator />
                                <h4 className="font-semibold">Estimated Mileage</h4>
                                <div className="flex items-center gap-2 text-sm">
                                    <Route className="h-4 w-4 text-muted-foreground" />
                                    <span>{booking.estimatedKm} km</span>
                                </div>
                                </>
                             )}
                        </div>

                         <div className="space-y-4">
                            <h4 className="font-semibold">Special Requests</h4>
                             {booking.requests ? (
                                <Alert variant="default">
                                    <Info className="h-4 w-4" />
                                    <AlertDescription>
                                        {booking.requests}
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No special requests submitted.</p>
                            )}

                             {booking.status === 'pending' && (
                                <div className="flex items-center gap-2 pt-4">
                                    <Button onClick={() => handleStatusUpdate(booking.id, 'confirmed')} disabled={isUpdating} className="flex-1 bg-green-600 hover:bg-green-700">
                                        <Check className="mr-2"/> Confirm
                                    </Button>
                                    <Button variant="destructive" onClick={() => handleStatusUpdate(booking.id, 'canceled')} disabled={isUpdating} className="flex-1">
                                        <X className="mr-2"/> Reject
                                    </Button>
                                </div>
                            )}

                            {booking.status !== 'pending' && (
                                <div className="pt-4">
                                     <Alert variant={booking.status === 'confirmed' ? 'default' : 'destructive'}>
                                        <AlertTitle>
                                            Request {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                        </AlertTitle>
                                        <AlertDescription className="flex items-center justify-between">
                                            This booking request has already been processed.
                                            {booking.status === 'confirmed' && (
                                                <Button asChild variant="secondary" size="sm">
                                                    <Link href={`/agreement/${booking.id}`}>
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        View Agreement
                                                    </Link>
                                                </Button>
                                            )}
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            )}
                         </div>

                    </div>
                </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Booking Requests Found</AlertTitle>
            <AlertDescription>
              There are currently no customer inquiries. When a new request is made, it will appear here.
            </AlertDescription>
          </Alert>
      )}
    </div>
  );
}
