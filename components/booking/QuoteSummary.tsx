"use client";

import { useMemo } from "react";
import { calculateBookingPrice } from "@/app/lib/pricing";
import { useBooking } from "@/context/BookingContext";

export default function QuoteSummary() {
  const { booking } = useBooking();

  const quote = useMemo(() => {
    if (!booking.pickup || !booking.destination) {
      return null;
    }

    return calculateBookingPrice({
      pickup: booking.pickup,
      destination: booking.destination,
      tripType: booking.tripType ?? "One Way",
      passengers: booking.passengers ?? 1,
      childSeat: booking.childSeat,
      extraStop: booking.extraStop,
      waitingTimeHours: booking.waitingTimeHours ?? 0,
    });
  }, [booking]);

  return (
    <aside className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
      <h2 className="text-3xl font-black">
        Booking Summary
      </h2>

      {!quote ? (
        <p className="mt-6 text-slate-300">
          Select a pickup and destination to see your quote.
        </p>
      ) : (
        <div className="mt-8 space-y-5">

          <div className="flex justify-between">
            <span>Vehicle</span>
            <strong>{quote.vehicle}</strong>
          </div>

          <div className="flex justify-between">
            <span>Base Fare</span>
            <strong>USD ${quote.baseFare.toFixed(2)}</strong>
          </div>

          <div className="flex justify-between">
            <span>Passenger Fee</span>
            <strong>USD ${quote.passengerFee.toFixed(2)}</strong>
          </div>

          <div className="flex justify-between">
            <span>Child Seat</span>
            <strong>USD ${quote.childSeatFee.toFixed(2)}</strong>
          </div>

          <div className="flex justify-between">
            <span>Extra Stop</span>
            <strong>USD ${quote.extraStopFee.toFixed(2)}</strong>
          </div>

          <hr className="border-slate-700" />

          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span>USD ${quote.total.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Deposit (25%)</span>
            <span>USD ${quote.deposit.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sky-400 text-xl font-bold">
            <span>Balance</span>
            <span>USD ${quote.balance.toFixed(2)}</span>
          </div>

        </div>
      )}
    </aside>
  );
}