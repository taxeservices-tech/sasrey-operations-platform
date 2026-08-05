"use client";

import { useBooking } from "@/context/BookingContext";

export default function ConfirmationStep() {
  const { booking, setCurrentStep } = useBooking();

  return (
    <div className="rounded-3xl border border-green-200 bg-white p-10 shadow-sm">
      <div className="text-center">
        <div className="mb-6 text-6xl">🎉</div>

        <h2 className="text-4xl font-black text-slate-900">
          Booking Confirmed
        </h2>

        <p className="mt-4 text-lg text-slate-600">
          Thank you{" "}
          <strong>{booking.customerName ?? "Customer"}</strong>.
        </p>

        <p className="mt-2 text-slate-600">
          Your booking request has been successfully received.
        </p>
      </div>

      <div className="mt-10 rounded-2xl border border-slate-200 p-6">
        <h3 className="mb-6 text-2xl font-bold">
          Booking Summary
        </h3>

        <div className="grid gap-4 md:grid-cols-2">

          <SummaryItem label="Service" value={booking.serviceCategory} />
          <SummaryItem label="Pickup" value={booking.pickup} />
          <SummaryItem label="Destination" value={booking.destination} />
          <SummaryItem label="Pickup Date" value={booking.pickupDate} />
          <SummaryItem label="Pickup Time" value={booking.pickupTime} />
          <SummaryItem label="Passengers" value={booking.passengers} />
          <SummaryItem label="Total" value={`USD ${booking.total.toFixed(2)}`} />
          <SummaryItem label="Deposit" value={`USD ${booking.deposit.toFixed(2)}`} />
          <SummaryItem label="Balance" value={`USD ${booking.balance.toFixed(2)}`} />
          <SummaryItem label="Payment Method" value={booking.paymentMethod} />

        </div>
      </div>

      <div className="mt-10 rounded-2xl bg-sky-50 p-6">
        <h3 className="text-xl font-bold">
          What Happens Next?
        </h3>

        <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
          <li>Your booking request will be reviewed by our reservations team.</li>
          <li>You will receive a booking confirmation by email.</li>
          <li>Your 25% deposit secures your reservation.</li>
          <li>The remaining balance is due before your scheduled trip.</li>
        </ul>
      </div>

      <div className="mt-10 flex justify-center">
        <button
          onClick={() => setCurrentStep(1)}
          className="rounded-full bg-sky-600 px-8 py-4 font-semibold text-white transition hover:bg-sky-700"
        >
          Book Another Trip
        </button>
      </div>
    </div>
  );
}

function SummaryItem({
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
        {value ?? "-"}
      </p>
    </div>
  );
}