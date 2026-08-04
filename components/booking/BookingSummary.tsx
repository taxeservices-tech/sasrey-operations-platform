"use client";

import { useMemo } from "react";

import { calculateBookingPrice } from "@/app/lib/pricing";
import { useBooking } from "@/context/BookingContext";

export default function BookingSummary() {
  const {
  booking,
  currentStep,
  setCurrentStep,
} = useBooking();

console.log("BookPage currentStep:", currentStep);

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
    <aside className="sticky top-8 h-fit rounded-3xl bg-slate-900 p-10 text-white shadow-2xl">
      <h2 className="text-3xl font-black">
        Booking Summary
      </h2>

      <div className="mt-8 space-y-5">

        <div className="flex justify-between">
          <span>Vehicle</span>

          <strong>
            {quote?.vehicle ?? "Toyota Noah"}
          </strong>
        </div>

        <div className="flex justify-between">
          <span>Passengers</span>

          <strong>
            {booking.passengers ?? 1}
          </strong>
        </div>

        <hr className="border-slate-700" />

        <h3 className="text-lg font-bold text-sky-400">
          Pricing Breakdown
        </h3>

        <div className="flex justify-between">
          <span>Base Fare</span>

          <span>
            {quote
              ? `USD $${quote.baseFare.toFixed(2)}`
              : "USD $0.00"}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Passenger Fee</span>

          <span>
            {quote
              ? `USD $${quote.passengerFee.toFixed(2)}`
              : "USD $0.00"}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Child Seat</span>

          <span>
            {quote
              ? `USD $${quote.childSeatFee.toFixed(2)}`
              : "USD $0.00"}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Extra Stop</span>

          <span>
            {quote
              ? `USD $${quote.extraStopFee.toFixed(2)}`
              : "USD $0.00"}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Waiting Time</span>

          <span>
            {quote
              ? `USD $${quote.waitingTimeFee.toFixed(2)}`
              : "USD $0.00"}
          </span>
        </div>

        <hr className="border-slate-700" />

        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>

          <span>
            {quote
              ? `USD $${quote.total.toFixed(2)}`
              : "To Be Calculated"}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Deposit Required</span>

          <span>
            {quote
              ? `USD $${quote.deposit.toFixed(2)}`
              : "25%"}
          </span>
        </div>

        <div className="flex justify-between text-xl font-bold text-sky-400">
          <span>Remaining Balance</span>

          <span>
            {quote
              ? `USD $${quote.balance.toFixed(2)}`
              : "75%"}
          </span>
        </div>

      </div>

      <div className="mt-10 rounded-2xl bg-slate-800 p-5">
        <h3 className="font-bold">
          Payment Terms
        </h3>

        <ul className="mt-3 space-y-2 text-sm text-slate-300">
          <li>✓ 25% deposit required</li>
          <li>✓ Balance due 15 days before departure</li>
          <li>✓ Secure payment options</li>
        </ul>
      </div>

      <button
  disabled={!quote}
  onClick={() => {
  setCurrentStep(2);
  alert("Current step set to 2");
}}
  className="mt-8 w-full rounded-full bg-sky-500 py-5 text-lg font-bold transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-700"
>
  Continue Booking →
</button>
    </aside>
  );
}