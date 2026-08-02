"use client";

import { Booking } from "@/types/booking";

interface BookingWizardProps {
  booking: Booking;
}

export default function BookingWizard({
  booking,
}: BookingWizardProps) {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">

        {/* Progress */}

        <div className="mb-12">

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">
            Step 2 of 5
          </p>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-2/5 rounded-full bg-sky-500" />
          </div>

        </div>

        {/* Heading */}

        <div className="mb-14">

          <h2 className="text-5xl font-black text-slate-900">
            Trip Details
          </h2>

          <p className="mt-5 text-lg text-slate-600">
            Tell us when you'd like us to pick you up.
          </p>

        </div>

        <div className="grid gap-10 lg:grid-cols-2">

          {/* LEFT */}

          <div className="space-y-6">

            <div>

              <label className="mb-2 block font-semibold">
                Pickup Date
              </label>

              <input
                type="date"
                className="w-full rounded-xl border border-slate-300 p-4"
              />

            </div>

            <div>

              <label className="mb-2 block font-semibold">
                Pickup Time
              </label>

              <input
                type="time"
                className="w-full rounded-xl border border-slate-300 p-4"
              />

            </div>

            <div>

              <label className="mb-2 block font-semibold">
                Flight Number
              </label>

              <input
                type="text"
                placeholder="AA123"
                className="w-full rounded-xl border border-slate-300 p-4"
              />

            </div>

            <div>

              <label className="mb-2 block font-semibold">
                Airline
              </label>

              <input
                type="text"
                placeholder="American Airlines"
                className="w-full rounded-xl border border-slate-300 p-4"
              />

            </div>

          </div>

          {/* RIGHT */}

          <div className="rounded-3xl bg-slate-50 p-8 shadow-lg">

            <h3 className="text-3xl font-black text-slate-900">
              Booking Summary
            </h3>

            <div className="mt-8 space-y-5">

              <div className="flex justify-between">
                <span>Vehicle</span>
                <strong>{booking.vehicle}</strong>
              </div>

              <div className="flex justify-between">
                <span>Pickup</span>
                <strong>{booking.pickup}</strong>
              </div>

              <div className="flex justify-between">
                <span>Destination</span>
                <strong>{booking.destination}</strong>
              </div>

              <div className="flex justify-between">
                <span>Trip Type</span>
                <strong>{booking.tripType}</strong>
              </div>

              <div className="flex justify-between">
                <span>Passengers</span>
                <strong>{booking.passengers}</strong>
              </div>

              <hr />

              <div className="flex justify-between">
                <span>Total</span>
                <strong>US${booking.total.toFixed(2)}</strong>
              </div>

              <div className="flex justify-between">
                <span>Deposit</span>
                <strong>US${booking.deposit.toFixed(2)}</strong>
              </div>

              <div className="flex justify-between text-lg font-bold text-sky-700">
                <span>Balance</span>
                <span>US${booking.balance.toFixed(2)}</span>
              </div>

            </div>

            <button className="mt-10 w-full rounded-full bg-sky-500 py-4 text-lg font-semibold text-white transition hover:bg-sky-600">
              Continue →
            </button>

          </div>

        </div>

      </div>
    </section>
  );
}