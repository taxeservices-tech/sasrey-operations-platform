"use client";

import { calculateBookingPrice } from "@/app/lib/pricing";
import { useBooking } from "@/context/BookingContext";

export default function ConfirmationStep() {
  const { booking, setCurrentStep, resetBooking } = useBooking();

  const quote =
    booking.pickup &&
    booking.destination &&
    booking.tripType &&
    booking.passengers
      ? calculateBookingPrice({
          service:
            booking.serviceCategory ??
            "Airport Transfer",
          pickup: booking.pickup,
          destination: booking.destination,
          tripType: booking.tripType,
          passengers: booking.passengers,
          childSeat: (booking.childSeat ?? 0) > 0,
          extraStop: (booking.extraStop ?? 0) > 0,
          waitingTimeHours:
            booking.waitingTimeHours ?? 0,
        })
      : null;

  function handleNewBooking() {
    resetBooking();
    setCurrentStep(1);
  }

  return (
    <div className="rounded-3xl border border-green-200 bg-white p-8 shadow-sm md:p-10">

      {/* Confirmation Header */}
      <div className="text-center">

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
          ✓
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-green-600">
          Booking Received
        </p>

        <h2 className="mt-3 text-4xl font-black text-slate-900 md:text-5xl">
          Booking Confirmed
        </h2>

        <p className="mt-4 text-lg text-slate-600">
          Thank you{" "}
          <strong className="text-slate-900">
            {booking.customerName ?? "Customer"}
          </strong>
          .
        </p>

        <p className="mt-2 text-slate-600">
          Your booking request has been successfully received.
        </p>
      </div>

      {/* Booking Reference */}
      <div className="mt-8 rounded-2xl bg-slate-900 p-6 text-center text-white">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-400">
          Booking Reference
        </p>

        <p className="mt-3 text-2xl font-black tracking-wider">
          Pending Confirmation
        </p>

        <p className="mt-2 text-sm text-slate-400">
          Your reservation team will provide your final booking reference.
        </p>
      </div>

      {/* Trip Summary */}
      <div className="mt-8 rounded-2xl border border-slate-200 p-6 md:p-7">

        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-600">
            Your Reservation
          </p>

          <h3 className="mt-2 text-2xl font-black text-slate-900">
            Trip Details
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">

          <SummaryItem
            label="Service"
            value={booking.serviceCategory}
          />

          <SummaryItem
            label="Vehicle"
            value={quote?.vehicle}
          />

          <SummaryItem
            label="Pickup"
            value={booking.pickup}
          />

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
            label="Flight Number"
            value={booking.flightNumber}
          />

          <SummaryItem
            label="Payment Method"
            value={booking.paymentMethod}
          />

        </div>
      </div>

      {/* Fare */}
      {quote && (
        <div className="mt-8 rounded-2xl border border-slate-200 p-6 md:p-7">

          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-600">
              Payment Summary
            </p>

            <h3 className="mt-2 text-2xl font-black text-slate-900">
              Fare Details
            </h3>
          </div>

          <div className="space-y-4">

            <FareRow
              label="Base Fare"
              value={quote.baseFare}
            />

            <FareRow
              label="Passenger Fee"
              value={quote.passengerFee}
            />

            <FareRow
              label="Child Seat"
              value={quote.childSeatFee}
            />

            <FareRow
              label="Extra Stop"
              value={quote.extraStopFee}
            />

            <FareRow
              label="Waiting Time"
              value={quote.waitingTimeFee}
            />

            <div className="border-t border-slate-200 pt-5">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-slate-900">
                  Total
                </span>

                <span className="text-2xl font-black text-slate-900">
                  USD ${quote.total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900 p-5 text-white">

              <div className="flex justify-between">
                <span className="text-slate-300">
                  Deposit (25%)
                </span>

                <strong>
                  USD ${quote.deposit.toFixed(2)}
                </strong>
              </div>

              <div className="mt-3 flex justify-between">
                <span className="text-slate-300">
                  Remaining Balance
                </span>

                <strong className="text-sky-400">
                  USD ${quote.balance.toFixed(2)}
                </strong>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* What Happens Next */}
      <div className="mt-8 rounded-2xl bg-sky-50 p-6 md:p-7">

        <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-600">
          Next Steps
        </p>

        <h3 className="mt-2 text-2xl font-black text-slate-900">
          What Happens Next?
        </h3>

        <div className="mt-6 space-y-5">

          <NextStep
            number="1"
            title="Booking Review"
            text="Our reservations team will review your booking request."
          />

          <NextStep
            number="2"
            title="Confirmation"
            text="You will receive your booking confirmation and final details."
          />

          <NextStep
            number="3"
            title="Secure Your Reservation"
            text="Your 25% deposit secures your reservation."
          />

          <NextStep
            number="4"
            title="Remaining Balance"
            text="The remaining balance is due before your scheduled trip."
          />

        </div>
      </div>

      {/* New Booking */}
      <div className="mt-10 flex justify-center">

        <button
          type="button"
          onClick={handleNewBooking}
          className="rounded-full bg-sky-500 px-8 py-4 text-lg font-semibold text-white transition hover:bg-sky-600"
        >
          Book Another Trip →
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
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-base font-semibold text-slate-900">
        {value ?? "—"}
      </p>
    </div>
  );
}

function FareRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-600">
        {label}
      </span>

      <span className="font-semibold text-slate-900">
        USD ${value.toFixed(2)}
      </span>
    </div>
  );
}

function NextStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500 text-sm font-bold text-white">
        {number}
      </div>

      <div>
        <h4 className="font-bold text-slate-900">
          {title}
        </h4>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          {text}
        </p>
      </div>

    </div>
  );
}