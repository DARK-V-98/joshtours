
'use client';

import React from 'react';
import Image from 'next/image';
import type { AgreementFormValues } from '@/app/agreement/[bookingId]/page';

interface PrintableAgreementProps {
  data: AgreementFormValues;
}

const Field = ({ label, value, className }: { label: string; value?: string, className?: string }) => (
  <div className={`flex flex-col ${className}`}>
    <p className="text-xs font-semibold text-gray-600 mb-0.5">{label}</p>
    <p className="text-sm border-b border-gray-400 border-dotted pb-0.5 min-h-[20px]">
      {value || ''}
    </p>
  </div>
);

const SignatureField = ({ label, className }: { label: string, className?: string }) => (
    <div className={`flex flex-col mt-6 ${className}`}>
        <p className="border-t border-gray-400 pt-1 text-xs text-center">{label}</p>
    </div>
)

const PageHeader = () => (
    <div className="text-center mb-4">
        <div className="flex justify-center items-center gap-4">
             <Image src="/jtr.png" alt="JOSH TOURS Logo" width={60} height={60} className="rounded-full"/>
             <div>
                <h1 className="text-3xl font-bold text-red-600">JOSH TOURS</h1>
                <p className="text-xs">Your trusted partner for reliable car rentals.</p>
             </div>
        </div>
        <h2 className="text-xl font-semibold mt-3 border-b-2 border-black pb-1">Vehicle Rental Agreement</h2>
      </div>
);

const PrintableAgreement = React.forwardRef<HTMLDivElement, PrintableAgreementProps>(({ data }, ref) => {
  return (
    <div ref={ref} className="bg-white text-black font-sans w-[210mm]">
      {/* Page 1 */}
      <div data-page="1" className="p-8 min-h-[297mm] flex flex-col">
        <PageHeader />
        <div className="space-y-2 flex-grow">
          {/* Section 1 */}
          <div className="border border-black p-2">
              <h3 className="text-base font-bold mb-2">1. Agreement Details</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
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
          <div className="border border-black p-2">
              <h3 className="text-base font-bold mb-2">2. Client Details</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                   <Field label="Client Full Name" value={data.clientFullName} />
                   <Field label="Contact Number" value={data.clientContactNumber} />
                   <div className="col-span-2 pt-4">
                      <SignatureField label="Client Signature" />
                   </div>
              </div>
          </div>

          {/* Section 3 */}
          <div className="border border-black p-2">
              <h3 className="text-base font-bold mb-2">3. Guarantor Details</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                   <Field label="Guarantor Name" value={data.guarantorName} />
                   <Field label="Guarantor NIC" value={data.guarantorNIC} />
                   <div className="col-span-2">
                      <Field label="Address" value={data.guarantorAddress} />
                   </div>
                   <Field label="Contact Number" value={data.guarantorContact} />
                   <div className="col-span-2 pt-4">
                      <SignatureField label="Guarantor Signature" />
                   </div>
              </div>
          </div>
        </div>
        <p className="text-xs text-center text-gray-500 pt-2">Page 1 of 2</p>
      </div>

      {/* Page 2 */}
      <div data-page="2" className="p-8 min-h-[297mm] flex flex-col">
        <PageHeader />
         <div className="space-y-2 flex-grow">
            {/* Section 4 */}
            <div className="border border-black p-2">
                <h3 className="text-base font-bold mb-2">4. Agreement Confirmation</h3>
                <div className="grid grid-cols-2 gap-x-8">
                    <SignatureField label="Client/Official Signature" />
                    <Field label="Date" value={data.clientSignDate} />
                </div>
            </div>

            {/* Section 5 */}
            <div className="border border-black p-2">
                <h3 className="text-base font-bold mb-2">5. Extension Section (Optional)</h3>
                <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                    <Field label="Extension Date" className="col-span-3"/>
                    <SignatureField label="Renter Signature" />
                    <SignatureField label="Guarantor Signature" />
                    <SignatureField label="Company Signature" />
                </div>
            </div>

            {/* Section 6 */}
            <div className="border border-black p-2">
                <h3 className="text-base font-bold mb-2">6. Vehicle Return Signatures</h3>
                 <div className="col-span-2 grid grid-cols-2 gap-x-8 pt-4">
                    <SignatureField label="Client Return Signature" />
                    <SignatureField label="Company Owner Signature" />
                </div>
            </div>
             <div className="text-xs text-gray-600 mt-4 p-2 border border-dashed">
                <h4 className="font-bold">Terms & Conditions Summary</h4>
                <p>The vehicle must be returned on the specified date. Any delay will incur additional charges. The renter is responsible for any damage not covered by insurance. Fuel must be returned at the same level as received. Full terms are available upon request.</p>
            </div>
        </div>
        <p className="text-xs text-center text-gray-500 pt-2">Page 2 of 2</p>
      </div>
    </div>
  );
});

PrintableAgreement.displayName = 'PrintableAgreement';
export default PrintableAgreement;
