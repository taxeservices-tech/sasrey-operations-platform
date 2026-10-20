"use client";

import { useBooking } from "@/context/BookingContext";

export default function ReviewStep() {
  const { booking } = useBooking();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-3xl font-black text-slate-900">
        Review Booking
      </h2>

      <p className="mt-2 text-slate-600">
        Please review your booking before proceeding to payment.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <ReviewItem label="Service" value={booking.serviceCategory} />
        <ReviewItem label="Pickup" value={booking.pickup} />
        <ReviewItem label="Destination" value={booking.destination} />
        <ReviewItem label="Date" value={booking.pickupDate} />
        <ReviewItem label="Time" value={booking.pickupTime} />
        <ReviewItem label="Trip Type" value={booking.tripType} />
        <ReviewItem label="Passengers" value={String(booking.passengers)} />
        <ReviewItem label="Flight" value={booking.flightNumber} />
        <ReviewItem label="Customer" value={booking.customerName} />
        <ReviewItem label="Email" value={booking.email} />
        <ReviewItem label="Phone" value={booking.phone} />
      </div>
    </div>
  );
}

function ReviewItem({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-sm font-semibold text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-medium text-slate-900">
        {value || "-"}
      </p>
    </div>
  );
}
