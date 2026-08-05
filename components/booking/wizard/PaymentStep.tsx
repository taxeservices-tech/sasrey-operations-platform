"use client";

import { useBooking } from "@/context/BookingContext";

export default function PaymentStep() {
  const { booking, updateBooking } = useBooking();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-3xl font-black text-slate-900">
        Payment
      </h2>

      <p className="mt-2 text-slate-600">
        Choose your preferred payment method.
      </p>

      <div className="mt-8 space-y-6">

        <div className="rounded-xl border border-slate-200 p-6">
          <div className="flex justify-between">
            <span>Deposit (25%)</span>

            <strong>
              USD {booking.deposit.toFixed(2)}
            </strong>
          </div>

          <div className="mt-3 flex justify-between">
            <span>Balance</span>

            <strong>
              USD {booking.balance.toFixed(2)}
            </strong>
          </div>

          <div className="mt-3 flex justify-between border-t pt-3 text-lg font-bold">
            <span>Total</span>

            <span>
              USD {booking.total.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="space-y-4">

          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="paymentMethod"
              checked={booking.paymentMethod === "Credit Card"}
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
              checked={booking.paymentMethod === "Bank Transfer"}
              onChange={() =>
                updateBooking({
                  paymentMethod: "Bank Transfer",
                })
              }
            />

            Bank Transfer
          </label>

        </div>

      </div>
    </div>
  );
}