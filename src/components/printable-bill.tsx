
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
        <div className={`flex justify-between items-center py-0.5 border-b border-gray-200 ${className}`}>
            <p className="text-[10px] text-gray-600">{label}</p>
            <p className="text-[10px] font-medium text-gray-800">{displayValue}</p>
        </div>
    );
};


const PrintableBill = React.forwardRef<HTMLDivElement, PrintableBillProps>(({ data, booking, car, subTotal, totalAmount, balanceDue }, ref) => {
  
  if (!booking || !car) return null;

  return (
    <div ref={ref} className="bg-white text-black font-sans w-[210mm] p-6">
      <div className="border-2 border-black p-4">
        {/* Header */}
        <div className="text-center mb-2 border-b-2 border-black pb-2">
            <div className="flex justify-center items-center gap-2">
                <Image src="/jtr.png" alt="JOSH TOURS Logo" width={50} height={50} className="rounded-full"/>
                <div>
                    <h1 className="text-2xl font-bold text-red-600">JOSH TOURS</h1>
                    <p className="text-[10px]">Your trusted partner for reliable car rentals.</p>
                </div>
            </div>
            <h2 className="text-lg font-semibold mt-1">Final Bill / Invoice</h2>
        </div>

        {/* Bill Details */}
        <div className="grid grid-cols-2 gap-x-6 mb-2 text-xs">
            <div>
                <p className="font-bold">Bill To:</p>
                <p>{booking.customerName}</p>
                <p>{booking.customerPhone}</p>
                <p>{booking.customerEmail}</p>
            </div>
            <div className="text-right">
                <p><span className="font-bold">Bill Date:</span> {data.billDate ? format(parseISO(data.billDate), 'PPP') : 'N/A'}</p>
                <p><span className="font-bold">Booking ID:</span> {booking.id}</p>
                 <p><span className="font-bold">Vehicle:</span> {booking.carName}</p>
            </div>
        </div>

        {/* Charges Table */}
        <div>
            <h3 className="text-sm font-bold mb-1 bg-gray-100 p-1">Rental Charges</h3>
            <div className="space-y-0">
                <Field label="Additional Kilometers" value={`${data.additionalKm || 0} km`} isCurrency={false}/>
                <Field label="Price per Additional KM" value={data.pricePerKm || 0} />
                <Field label="Additional Days" value={`${data.additionalDays || 0} days`} isCurrency={false}/>
                <Field label="Price per Additional Day" value={data.pricePerDay || 0} />
                <div className="flex justify-between items-center py-1 border-t-2 border-gray-400 mt-0.5 pt-0.5">
                    <p className="text-[10px] font-bold">Sub-Total (KM & Days)</p>
                    <p className="text-[10px] font-bold">Rs {subTotal.toFixed(2)}</p>
                </div>
            </div>

            <h3 className="text-sm font-bold mt-1 mb-1 bg-gray-100 p-1">Other Charges</h3>
             <div className="space-y-0">
                <Field label="Damages" value={data.damages || 0} />
                <Field label="Delay Payments" value={data.delayPayments || 0} />
                <Field label="Other Miscellaneous Charges" value={data.otherCharges || 0} />
            </div>

             <h3 className="text-sm font-bold mt-1 mb-1 bg-gray-100 p-1">Summary</h3>
              <div className="space-y-0">
                <Field label="Total Amount Due" value={totalAmount} className="font-bold"/>
                <Field label="Amount Paid (Advance, etc.)" value={data.paidAmount || 0} />
                <div className="flex justify-between items-center py-1 border-t-2 border-dashed mt-0.5 bg-blue-50 text-blue-800 px-2 rounded-md">
                    <p className="text-sm font-extrabold">Balance Due</p>
                    <p className="text-sm font-extrabold">Rs {balanceDue.toFixed(2)}</p>
                </div>
            </div>
        </div>
        
        {/* Footer */}
        <div className="text-center text-[9px] text-gray-500 mt-4 pt-2 border-t">
            <p>Thank you for choosing JOSH TOURS!</p>
            <p>Please contact us with any questions about this bill.</p>
        </div>
      </div>
    </div>
  );
});

PrintableBill.displayName = 'PrintableBill';
export default PrintableBill;
