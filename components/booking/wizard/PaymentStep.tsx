"use client";

import { calculateBookingPrice } from "@/app/lib/pricing";
import { useBooking } from "@/context/BookingContext";

export default function PaymentStep() {
  const { booking, updateBooking } = useBooking();

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
          childSeat: booking.childSeat,
          extraStop: booking.extraStop,
          waitingTimeHours: booking.waitingTimeHours,
        })
      : null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-3xl font-black text-slate-900">
        Payment
      </h2>

      <p className="mt-2 text-slate-600">
        Choose your preferred payment method.
      </p>

      {!quote ? (
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-6">
          <p className="text-amber-700">
            Complete your trip details to calculate your payment.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-8 rounded-xl border border-slate-200 p-6">
            <div className="flex justify-between">
              <span>Deposit (25%)</span>

              <strong>
                USD {quote.deposit.toFixed(2)}
              </strong>
            </div>

            <div className="mt-3 flex justify-between">
              <span>Balance</span>

              <strong>
                USD {quote.balance.toFixed(2)}
              </strong>
            </div>

            <div className="mt-3 flex justify-between border-t pt-3 text-lg font-bold">
              <span>Total</span>

              <span>
                USD {quote.total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="paymentMethod"
                checked={
                  booking.paymentMethod === "Credit Card"
                }
                onChange={() =>
                  updateBooking({
                    paymentMethod: "Credit Card",
                  })
                }
              />

              Credit Card
            </label>

            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="paymentMethod"
                checked={
                  booking.paymentMethod === "Bank Transfer"
                }
                onChange={() =>
                  updateBooking({
                    paymentMethod: "Bank Transfer",
                  })
                }
              />

              Bank Transfer
            </label>
          </div>

          <div className="mt-8 rounded-xl bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Payment Terms
            </h3>

            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>25% deposit is required to confirm your booking.</li>
              <li>The remaining balance is due 15 days before travel.</li>
              <li>Payments are accepted by Credit Card or Bank Transfer.</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}