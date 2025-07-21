
'use client';

import React from 'react';
import Image from 'next/image';
import type { AgreementFormValues } from '@/app/agreement/[bookingId]/page';

interface PrintableAgreementProps {
  data: AgreementFormValues;
}

const Field = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex flex-col">
    <p className="text-xs font-semibold text-gray-600 mb-1">{label}</p>
    <p className="text-sm border-b border-gray-400 border-dotted pb-1 min-h-[24px]">
      {value || ''}
    </p>
  </div>
);

const SignatureField = ({ label }: { label: string }) => (
    <div className="flex flex-col mt-8">
        <p className="border-t border-gray-400 pt-2 text-sm text-center">{label}</p>
    </div>
)

const PrintableAgreement = React.forwardRef<HTMLDivElement, PrintableAgreementProps>(({ data }, ref) => {
  return (
    <div ref={ref} className="bg-white text-black p-8 font-sans w-[210mm] min-h-[297mm]">
      <div className="text-center mb-6">
        <div className="flex justify-center items-center gap-4">
             <Image src="/jtr.png" alt="Josh Tours Logo" width={80} height={80} className="rounded-full"/>
             <div>
                <h1 className="text-4xl font-bold text-red-600">Josh Tours</h1>
                <p className="text-sm">Your trusted partner for reliable car rentals.</p>
             </div>
        </div>
        <h2 className="text-2xl font-semibold mt-4 border-b-2 border-black pb-2">Vehicle Rental Agreement</h2>
      </div>

      <div className="space-y-4">
        {/* Section 1 */}
        <div className="border border-black p-3">
            <h3 className="text-lg font-bold mb-2">1. Agreement Details</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <Field label="Agreement Date" value={data.agreementDate} />
                <Field label="NIC or Passport No" value={data.renterIdOrPassport} />
                <div className="col-span-2">
                    <Field label="Address" value={data.renterAddress} />
                </div>
                <Field label="Vehicle Details" value={data.vehicleDetails} />
                <Field label="Rental Start Date" value={data.rentalStartDate} />
                <Field label="Rental Duration (Days/Months)" value={data.rentalDuration} />
                <Field label="Rent Cost Per Day/Month" value={data.rentCostPerDayMonth} />
                <Field label="Total Rent Cost" value={data.totalRentCost} />
                <Field label="Deposit Money" value={data.depositMoney} />
                <Field label="Daily KM Limit" value={data.dailyKMLimit} />
                <Field label="Price for Additional KM" value={data.priceForAdditionalKM} />
            </div>
        </div>
        
        {/* Section 2 */}
        <div className="border border-black p-3">
            <h3 className="text-lg font-bold mb-2">2. Client Details & Signature</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                 <Field label="Client Full Name" value={data.clientFullName} />
                 <Field label="Contact Number" value={data.clientContactNumber} />
                 <Field label="Date of Signing" value={data.clientSignDate} />
                 <div className="col-span-2 pt-6">
                    <SignatureField label="Client Signature" />
                 </div>
            </div>
        </div>

        {/* Section 3 */}
        <div className="border border-black p-3">
            <h3 className="text-lg font-bold mb-2">3. Guarantor Details</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                 <Field label="Guarantor Name" value={data.guarantorName} />
                 <Field label="Guarantor NIC" value={data.guarantorNIC} />
                 <div className="col-span-2">
                    <Field label="Address" value={data.guarantorAddress} />
                 </div>
                 <Field label="Contact Number" value={data.guarantorContact} />
                 <div className="col-span-2 pt-6">
                    <SignatureField label="Guarantor Signature" />
                 </div>
            </div>
        </div>
        
         {/* Other sections as placeholders */}
         <div className="text-sm text-gray-500 space-y-1 mt-4">
            <p><strong>Agreement Confirmation:</strong> Future section for final confirmation signatures.</p>
            <p><strong>Extension Section:</strong> Future section for documenting rental extensions.</p>
            <p><strong>Vehicle Return Section:</strong> Future section for final charges and return conditions.</p>
         </div>
      </div>
    </div>
  );
});

PrintableAgreement.displayName = 'PrintableAgreement';
export default PrintableAgreement;
