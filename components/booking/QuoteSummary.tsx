"use client";

import { useMemo } from "react";
import { calculateBookingPrice } from "@/app/lib/pricing";
import { useBooking } from "@/context/BookingContext";

export default function QuoteSummary() {
  const { booking } = useBooking();

  const quote = useMemo(() => {
    if (
      booking.serviceCategory !== "Tour" &&
      (!booking.pickup || !booking.destination)
    ) {
      return null;
    }

    if (
      booking.serviceCategory === "Tour" &&
      !booking.tourType
    ) {
      return null;
    }

        return calculateBookingPrice({
      service:
        booking.serviceCategory ??
        "Airport Transfer",
      pickup: booking.pickup ?? "",
      destination: booking.destination ?? "",
      tripType:
        booking.tripType ?? "One Way",
      passengers:
        booking.passengers ?? 1,
      tourType:
        booking.tourType,
      childSeat:
        (booking.childSeat ?? 0) > 0,
      extraStop:
        (booking.extraStop ?? 0) > 0,
      waitingTimeHours:
        booking.waitingTimeHours ?? 0,
    });
  }, [booking]);
  return (
    <aside className="h-fit self-start rounded-3xl bg-slate-900 p-8 text-white shadow-xl lg:sticky lg:top-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-sky-400">
          Your Quote
        </p>

        <h2 className="mt-2 text-3xl font-black">
          Booking Summary
        </h2>

        <p className="mt-2 text-sm text-slate-400">
  {booking.serviceCategory === "Tour"
    ? "Your estimated tour cost"
    : "Your estimated transfer cost"}
</p>
      </div>

      {!quote ? (
        <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-800/60 p-6">
          <p className="font-semibold text-white">
            Select a pickup and destination
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Your vehicle and estimated fare will
            appear here automatically.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">

          {/* Trip */}
          <div className="rounded-2xl bg-slate-800 p-5">
           <p className="text-xs font-bold uppercase tracking-widest text-sky-400">
  {booking.serviceCategory === "Tour"
    ? "Your Tour"
    : "Your Trip"}
</p>

            <div className="mt-4 space-y-4">

                            {booking.serviceCategory === "Tour" ? (
                <div>
                  <p className="text-xs text-slate-400">
                    Tour Type
                  </p>
                  <p className="mt-1 font-semibold">
                    {booking.tourType}
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-xs text-slate-400">
                      Pickup
                    </p>
                    <p className="mt-1 font-semibold">
                      {booking.pickup}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Destination
                    </p>
                    <p className="mt-1 font-semibold">
                      {booking.destination}
                    </p>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">
                    Date
                  </p>
                  <p className="mt-1 font-semibold">
                    {booking.pickupDate || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Time
                  </p>
                  <p className="mt-1 font-semibold">
                    {booking.pickupTime || "—"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400">
                  Passengers
                </p>
                <p className="mt-1 font-semibold">
                  {booking.passengers ?? 1}
                </p>
              </div>
              {booking.serviceCategory !== "Tour" && (
                <div>
                  <p className="text-xs text-slate-400">
                    Trip Type
                  </p>
                  <p className="mt-1 font-semibold">
                    {booking.tripType ?? "One Way"}
                  </p>
                </div>
              )}
            </div>
            </div>
           </div>
          {/* Vehicle */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-700 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Vehicle
              </p>
              <p className="mt-1 font-semibold">
                {quote.vehicle}
              </p>
            </div>

            <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-400">
              Private
            </span>
          </div>

          {/* Fare Breakdown */}
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
              Fare Breakdown
            </p>

            <div className="space-y-3 text-sm">

              <div className="flex justify-between">
                <span className="text-slate-300">
                  Base Fare
                </span>
                <span>
                  USD ${quote.baseFare.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-300">
                  Passenger Fee
                </span>
                <span>
                  USD ${quote.passengerFee.toFixed(2)}
                </span>
              </div>

              {quote.childSeatFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-300">
                    Child Seat
                  </span>
                  <span>
                    USD ${quote.childSeatFee.toFixed(2)}
                  </span>
                </div>
              )}

              {quote.extraStopFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-300">
                    Extra Stop
                  </span>
                  <span>
                    USD ${quote.extraStopFee.toFixed(2)}
                  </span>
                </div>
              )}

            </div>
          </div>

          {/* Total */}
          <div className="border-t border-slate-700 pt-6">

            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Estimated Total
                </p>

                <p className="mt-1 text-3xl font-black text-white">
                  USD ${quote.total.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Payment */}
            <div className="mt-5 rounded-2xl bg-slate-800 p-5">

              <div className="flex justify-between text-sm">
                <span className="text-slate-300">
                  Deposit (25%)
                </span>

                <span className="font-semibold">
                  USD ${quote.deposit.toFixed(2)}
                </span>
              </div>

              <div className="mt-3 flex justify-between">
                <span className="text-slate-300">
                  Balance
                </span>

                <span className="text-lg font-bold text-sky-400">
                  USD ${quote.balance.toFixed(2)}
                </span>
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-400">
                A 25% deposit is required to secure
                your booking. The remaining balance
                is due before departure.
              </p>

            </div>
          </div>

        </div>
      )}
    </aside>
  );
}