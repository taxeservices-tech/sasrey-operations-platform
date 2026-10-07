"use client";

import { useMemo } from "react";

import { calculateBookingPrice } from "@/app/lib/pricing";
import { tours } from "@/app/lib/tours";
import { useBooking } from "@/context/BookingContext";

export default function BookingSummary() {
  const {
    booking,
    currentStep,
    setCurrentStep,
  } = useBooking();

  console.log(
    "BookPage currentStep:",
    currentStep
  );

  const selectedTour = useMemo(
    () =>
      booking.tourId
        ? tours.find(
            (tour) =>
              tour.id === booking.tourId
          )
        : undefined,
    [booking.tourId]
  );

  const quote = useMemo(() => {
    const isTour =
      booking.serviceCategory === "Tour" ||
      Boolean(booking.tourId);

    if (isTour) {
      if (!booking.tourId) {
        return null;
      }

      return calculateBookingPrice({
        tourId: booking.tourId,
        passengers:
          booking.passengers ?? 1,
        childSeat:
          (booking.childSeat ?? 0) > 0,
        extraStop:
          (booking.extraStop ?? 0) > 0,
        waitingTimeHours:
          booking.waitingTimeHours ?? 0,
      });
    }

    if (
      !booking.pickup ||
      !booking.destination
    ) {
      return null;
    }

    return calculateBookingPrice({
      pickup: booking.pickup,
      destination: booking.destination,
      tripType:
        booking.tripType ?? "One Way",
      passengers:
        booking.passengers ?? 1,
      childSeat:
        (booking.childSeat ?? 0) > 0,
      extraStop:
        (booking.extraStop ?? 0) > 0,
      waitingTimeHours:
        booking.waitingTimeHours ?? 0,
    });
  }, [booking]);

  const isTour =
    booking.serviceCategory === "Tour" ||
    Boolean(booking.tourId);

  return (
    <aside className="sticky top-8 h-fit rounded-3xl bg-slate-900 p-10 text-white shadow-2xl">
      <h2 className="text-3xl font-black">
        Booking Summary
      </h2>

      {isTour && selectedTour && (
        <div className="mt-6 rounded-2xl bg-slate-800 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-sky-400">
            Selected Tour
          </p>

          <h3 className="mt-1 text-lg font-black">
            {selectedTour.name}
          </h3>

          <p className="mt-2 text-sm text-slate-300">
            {selectedTour.destination}
          </p>

          <div className="mt-4 border-t border-slate-700 pt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Package Includes
            </p>

            <ul className="mt-2 space-y-1 text-sm text-slate-300">
              {selectedTour.destinations.map(
                (destination) => (
                  <li key={destination}>
                    • {destination}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-8 space-y-5">
        <div className="flex justify-between">
          <span>Vehicle</span>

          <strong>
            {quote?.vehicle ??
              "Toyota Noah"}
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
          <span>
            {isTour
              ? "Tour Price"
              : "Base Fare"}
          </span>

          <span>
            {quote
              ? `USD $${quote.baseFare.toFixed(
                  2
                )}`
              : "USD $0.00"}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Passenger Fee</span>

          <span>
            {quote
              ? `USD $${quote.passengerFee.toFixed(
                  2
                )}`
              : "USD $0.00"}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Child Seat</span>

          <span>
            {quote
              ? `USD $${quote.childSeatFee.toFixed(
                  2
                )}`
              : "USD $0.00"}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Extra Stop</span>

          <span>
            {quote
              ? `USD $${quote.extraStopFee.toFixed(
                  2
                )}`
              : "USD $0.00"}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Waiting Time</span>

          <span>
            {quote
              ? `USD $${quote.waitingTimeFee.toFixed(
                  2
                )}`
              : "USD $0.00"}
          </span>
        </div>

        <hr className="border-slate-700" />

        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>

          <span>
            {quote
              ? `USD $${quote.total.toFixed(
                  2
                )}`
              : "To Be Calculated"}
          </span>
        </div>

        <div className="flex justify-between">
          <span>
            Deposit Required
          </span>

          <span>
            {quote
              ? `USD $${quote.deposit.toFixed(
                  2
                )}`
              : "25%"}
          </span>
        </div>

        <div className="flex justify-between text-xl font-bold text-sky-400">
          <span>
            Remaining Balance
          </span>

          <span>
            {quote
              ? `USD $${quote.balance.toFixed(
                  2
                )}`
              : "75%"}
          </span>
        </div>
      </div>

      <div className="mt-10 rounded-2xl bg-slate-800 p-5">
        <h3 className="font-bold">
          Payment Terms
        </h3>

        <ul className="mt-3 space-y-2 text-sm text-slate-300">
          <li>
            ✓ 25% deposit required
          </li>
          <li>
            ✓ Balance due 15 days before
            departure
          </li>
          <li>
            ✓ Secure payment options
          </li>
        </ul>
      </div>

      <button
        disabled={!quote}
        onClick={() => {
          setCurrentStep(2);
        }}
        className="mt-8 w-full rounded-full bg-sky-500 py-5 text-lg font-bold transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-700"
      >
        Continue Booking →
      </button>
    </aside>
  );
}