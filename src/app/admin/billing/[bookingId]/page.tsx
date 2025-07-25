
'use client';

import { redirect, useParams } from 'next/navigation';

// This page is now deprecated.
// All billing logic has been merged into the agreement page.
export default function DeprecatedBillingPage() {
    const params = useParams();
    const bookingId = Array.isArray(params.bookingId) ? params.bookingId[0] : params.bookingId;
    
    // Redirect users to the main agreement page for this booking.
    if (bookingId) {
        redirect(`/agreement/${bookingId}`);
    } else {
        redirect('/admin/bookings');
    }
}
