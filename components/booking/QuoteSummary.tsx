"use client";

import { useMemo } from "react";

import { calculateBookingPrice } from "@/app/lib/pricing";
import { tours } from "@/app/lib/tours";
import { useBooking } from "@/context/BookingContext";

export default function QuoteSummary() {
  const { booking } = useBooking();

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
    <aside className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
      <h2 className="text-3xl font-black">
        Booking Summary
      </h2>

      {!quote ? (
        <p className="mt-6 text-slate-300">
          {isTour
            ? "Select a tour to see your price."
            : "Select a pickup and destination to see your quote."}
        </p>
      ) : (
        <div className="mt-8 space-y-5">
          {isTour && selectedTour && (
            <div className="rounded-2xl bg-slate-800 p-5">
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
                  Destinations & Stops
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

          <div className="flex justify-between">
            <span>Vehicle</span>

            <strong>
              {quote.vehicle}
            </strong>
          </div>

          <div className="flex justify-between">
            <span>Passengers</span>

            <strong>
              {booking.passengers ?? 1}
            </strong>
          </div>

          <div className="flex justify-between">
            <span>
              {isTour
                ? "Tour Price"
                : "Base Fare"}
            </span>

            <strong>
              USD ${quote.baseFare.toFixed(2)}
            </strong>
          </div>

          <div className="flex justify-between">
            <span>Passenger Fee</span>

            <strong>
              USD ${quote.passengerFee.toFixed(2)}
            </strong>
          </div>

          <div className="flex justify-between">
            <span>Child Seat</span>

            <strong>
              USD ${quote.childSeatFee.toFixed(2)}
            </strong>
          </div>

          <div className="flex justify-between">
            <span>Extra Stop</span>

            <strong>
              USD ${quote.extraStopFee.toFixed(2)}
            </strong>
          </div>

          <div className="flex justify-between">
            <span>Waiting Time</span>

            <strong>
              USD ${quote.waitingTimeFee.toFixed(2)}
            </strong>
          </div>

          <hr className="border-slate-700" />

          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>

            <span>
              USD ${quote.total.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Deposit (25%)</span>

            <span>
              USD ${quote.deposit.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-xl font-bold text-sky-400">
            <span>Balance</span>

            <span>
              USD ${quote.balance.toFixed(2)}
            </span>
          </div>

          {isTour && selectedTour && (
            <div className="rounded-2xl bg-slate-800 p-4 text-sm text-slate-300">
              <p className="font-bold text-white">
                Package information
              </p>

              <p className="mt-2 leading-6">
                Attraction admission, meals, drinks
                and personal expenses are paid
                separately unless specifically stated
                as included in the selected package.
              </p>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}