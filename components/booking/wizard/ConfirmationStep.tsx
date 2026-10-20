"use client";

import { useBooking } from "@/context/BookingContext";

export default function ConfirmationStep() {
  const { booking, setCurrentStep, resetBooking } = useBooking();

  function handleBookAnotherTrip() {
    resetBooking();
    setCurrentStep(1);
  }

  return (
    <div className="rounded-3xl border border-green-200 bg-white p-10 shadow-sm">
      <div className="text-center">
        <div className="mb-6 text-6xl" aria-hidden="true">
          🎉
        </div>

        <h2 className="text-4xl font-black text-slate-900">
          Booking Request Received
        </h2>

        <p className="mt-4 text-lg text-slate-600">
          Thank you{" "}
          <strong>{booking.customerName ?? "Customer"}</strong>.
        </p>

        <p className="mt-2 text-slate-600">
          Your booking request has been successfully submitted.
        </p>

        {booking.bookingReference && (
          <div className="mx-auto mt-6 max-w-md rounded-2xl border border-green-200 bg-green-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-green-800">
              Your Booking Reference
            </p>
            <p className="mt-2 break-words text-2xl font-black text-green-900">
              {booking.bookingReference}
            </p>
            <p className="mt-2 text-sm text-green-800">
              Keep this reference for your records.
            </p>
          </div>
        )}
      </div>

      <div className="mt-10 rounded-2xl border border-slate-200 p-6">
        <h3 className="mb-6 text-2xl font-bold text-slate-900">
          Booking Summary
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <SummaryItem
            label="Service"
            value={booking.serviceCategory}
          />
          <SummaryItem label="Pickup" value={booking.pickup} />
          <SummaryItem
            label="Destination"
            value={booking.destination}
          />
          <SummaryItem
            label="Pickup Date"
            value={booking.pickupDate}
          />
          <SummaryItem
            label="Pickup Time"
            value={booking.pickupTime}
          />
          <SummaryItem
            label="Passengers"
            value={booking.passengers}
          />
          <SummaryItem
            label="Trip Type"
            value={booking.tripType}
          />
          <SummaryItem
            label="Total"
            value={formatCurrency(booking.total)}
          />
          <SummaryItem
            label="Deposit"
            value={formatCurrency(booking.deposit)}
          />
          <SummaryItem
            label="Balance"
            value={formatCurrency(booking.balance)}
          />
          <SummaryItem
            label="Payment Method"
            value={booking.paymentMethod}
          />
          <SummaryItem
            label="Booking Status"
            value={booking.status ?? "Pending"}
          />
        </div>
      </div>

      <div className="mt-10 rounded-2xl bg-sky-50 p-6">
        <h3 className="text-xl font-bold text-slate-900">
          What Happens Next?
        </h3>

        <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
          <li>
            Your booking request will be reviewed by our reservations team.
          </li>
          <li>
            Keep your booking reference for future enquiries.
          </li>
          <li>
            Your 25% deposit is required to secure your reservation.
          </li>
          <li>
            The remaining balance is due before your scheduled trip.
          </li>
        </ul>
      </div>

      <div className="mt-10 flex justify-center">
        <button
          type="button"
          onClick={handleBookAnotherTrip}
          className="rounded-full bg-sky-600 px-8 py-4 font-semibold text-white transition hover:bg-sky-700"
        >
          Book Another Trip
        </button>
      </div>
    </div>
  );
}

function formatCurrency(amount?: number): string {
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return "Pending";
  }

  return `USD ${amount.toFixed(2)}`;
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

      <p className="mt-1 break-words text-lg font-medium text-slate-900">
        {value ?? "-"}
      </p>
    </div>
  );
}