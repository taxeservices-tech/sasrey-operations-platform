"use client";

import { useBooking } from "@/context/BookingContext";
import { calculateBookingPrice } from "@/app/lib/pricing";

export default function ReviewStep() {
  const { booking } = useBooking();

  const quote =
    booking.pickup &&
    booking.destination &&
    booking.tripType &&
    booking.passengers
      ? calculateBookingPrice({
          pickup: booking.pickup,
          destination: booking.destination,
          tripType: booking.tripType,
          passengers: booking.passengers,

          childSeat:
            (booking.childSeat ?? 0) > 0,

          extraStop:
            (booking.extraStop ?? 0) > 0,

          waitingTimeHours:
            booking.waitingTimeHours ?? 0,
        })
      : null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-3xl font-black text-slate-900">
        Review Booking
      </h2>

      <p className="mt-2 text-slate-600">
        Please review your booking before proceeding to payment.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <ReviewItem
          label="Service"
          value={booking.serviceCategory}
        />

        <ReviewItem
          label="Pickup"
          value={booking.pickup}
        />

        <ReviewItem
          label="Destination"
          value={booking.destination}
        />

        <ReviewItem
          label="Date"
          value={booking.pickupDate}
        />

        <ReviewItem
          label="Time"
          value={booking.pickupTime}
        />

        <ReviewItem
          label="Trip Type"
          value={booking.tripType}
        />

        <ReviewItem
          label="Passengers"
          value={booking.passengers?.toString()}
        />

        <ReviewItem
          label="Flight"
          value={booking.flightNumber}
        />

        <ReviewItem
          label="Customer"
          value={booking.customerName}
        />

        <ReviewItem
          label="Email"
          value={booking.email}
        />

        <ReviewItem
          label="Phone"
          value={booking.phone}
        />

        {quote && (
          <div className="mt-8 rounded-2xl border border-slate-200 p-6 md:col-span-2">
            <h3 className="mb-4 text-2xl font-bold text-slate-900">
              Fare Summary
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Vehicle</span>

                <strong>
                  {quote.vehicle}
                </strong>
              </div>

              <div className="flex justify-between">
                <span>Base Fare</span>

                <strong>
                  USD $
                  {quote.baseFare.toFixed(2)}
                </strong>
              </div>

              <div className="flex justify-between">
                <span>Passenger Fee</span>

                <strong>
                  USD $
                  {quote.passengerFee.toFixed(2)}
                </strong>
              </div>

              <div className="flex justify-between">
                <span>Child Seat</span>

                <strong>
                  USD $
                  {quote.childSeatFee.toFixed(2)}
                </strong>
              </div>

              <div className="flex justify-between">
                <span>Extra Stop</span>

                <strong>
                  USD $
                  {quote.extraStopFee.toFixed(2)}
                </strong>
              </div>

              <div className="flex justify-between">
                <span>Waiting Time</span>

                <strong>
                  USD $
                  {quote.waitingTimeFee.toFixed(2)}
                </strong>
              </div>

              <hr className="border-slate-300" />

              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>

                <span>
                  USD $
                  {quote.total.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Deposit (25%)</span>

                <span>
                  USD $
                  {quote.deposit.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-xl font-bold text-sky-600">
                <span>Balance</span>

                <span>
                  USD $
                  {quote.balance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
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
        {value ?? "-"}
      </p>
    </div>
  );
}