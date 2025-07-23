
'use client';

import React from 'react';
import Image from 'next/image';
import { BookingRequest } from '@/lib/bookingActions';
import { Car } from '@/lib/data';
import { format, parseISO } from 'date-fns';

interface PrintableBillProps {
  data: any;
  booking: BookingRequest | null;
  car: Car | null;
  subTotal: number;
  totalAmount: number;
  balanceDue: number;
}

const Field = ({ label, value, className, isCurrency = true }: { label: string; value?: string | number, className?: string, isCurrency?: boolean }) => {
    let displayValue: string;

    if (typeof value === 'number') {
        displayValue = isCurrency ? `Rs ${value.toFixed(2)}` : `${value}`;
    } else {
        displayValue = value || '---';
    }

    return (
        <div className={`flex justify-between items-center py-2 border-b border-gray-200 ${className}`}>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-sm font-medium text-gray-800">{displayValue}</p>
        </div>
    );
};


const PrintableBill = React.forwardRef<HTMLDivElement, PrintableBillProps>(({ data, booking, car, subTotal, totalAmount, balanceDue }, ref) => {
  
  if (!booking || !car) return null;

  return (
    <div ref={ref} className="bg-white text-black font-sans w-[210mm] p-8">
      <div className="border-2 border-black p-6">
        {/* Header */}
        <div className="text-center mb-6 border-b-2 border-black pb-4">
            <div className="flex justify-center items-center gap-4">
                <Image src="/jtr.png" alt="JOSH TOURS Logo" width={60} height={60} className="rounded-full"/>
                <div>
                    <h1 className="text-3xl font-bold text-red-600">JOSH TOURS</h1>
                    <p className="text-xs">Your trusted partner for reliable car rentals.</p>
                </div>
            </div>
            <h2 className="text-2xl font-semibold mt-4">Final Bill / Invoice</h2>
        </div>

        {/* Bill Details */}
        <div className="grid grid-cols-2 gap-x-8 mb-6">
            <div>
                <p className="text-sm font-bold">Bill To:</p>
                <p className="text-sm">{booking.customerName}</p>
                <p className="text-sm">{booking.customerPhone}</p>
                <p className="text-sm">{booking.customerEmail}</p>
            </div>
            <div className="text-right">
                <p className="text-sm"><span className="font-bold">Bill Date:</span> {data.billDate ? format(parseISO(data.billDate), 'PPP') : 'N/A'}</p>
                <p className="text-sm"><span className="font-bold">Booking ID:</span> {booking.id.slice(0, 10)}...</p>
                 <p className="text-sm"><span className="font-bold">Vehicle:</span> {booking.carName}</p>
            </div>
        </div>

        {/* Charges Table */}
        <div>
            <h3 className="text-lg font-bold mb-2 bg-gray-100 p-2">Rental Charges</h3>
            <div className="space-y-1">
                <Field label="Additional Kilometers" value={`${data.additionalKm || 0} km`} isCurrency={false}/>
                <Field label="Price per Additional KM" value={data.pricePerKm || 0} />
                <Field label="Additional Days" value={`${data.additionalDays || 0} days`} isCurrency={false}/>
                <Field label="Price per Additional Day" value={car.pricePerDay.lkr} />
                <div className="flex justify-between items-center py-2 border-t-2 border-gray-400 mt-2 pt-2">
                    <p className="text-sm font-bold">Sub-Total (KM & Days)</p>
                    <p className="text-sm font-bold">Rs {subTotal.toFixed(2)}</p>
                </div>
            </div>

            <h3 className="text-lg font-bold mt-6 mb-2 bg-gray-100 p-2">Other Charges</h3>
             <div className="space-y-1">
                <Field label="Damages" value={data.damages || 0} />
                <Field label="Delay Payments" value={data.delayPayments || 0} />
                <Field label="Other Miscellaneous Charges" value={data.otherCharges || 0} />
            </div>

             <h3 className="text-lg font-bold mt-6 mb-2 bg-gray-100 p-2">Summary</h3>
              <div className="space-y-1">
                <Field label="Total Amount Due" value={totalAmount} className="font-bold"/>
                <Field label="Amount Paid (Advance, etc.)" value={data.paidAmount || 0} />
                <div className="flex justify-between items-center py-3 border-t-2 border-dashed mt-2 bg-blue-50 text-blue-800 px-2 rounded-md">
                    <p className="text-lg font-extrabold">Balance Due</p>
                    <p className="text-lg font-extrabold">Rs {balanceDue.toFixed(2)}</p>
                </div>
            </div>
        </div>
        
        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-12 pt-4 border-t">
            <p>Thank you for choosing JOSH TOURS!</p>
            <p>Please contact us with any questions about this bill.</p>
        </div>
      </div>
    </div>
  );
});

PrintableBill.displayName = 'PrintableBill';
export default PrintableBill;
