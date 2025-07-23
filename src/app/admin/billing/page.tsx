
import { redirect } from 'next/navigation';

// This page is now deprecated in favor of the dynamic billing page.
// Redirect users to the main bookings page where they can initiate billing.
export default function BillingRedirectPage() {
    redirect('/admin/bookings');
}
