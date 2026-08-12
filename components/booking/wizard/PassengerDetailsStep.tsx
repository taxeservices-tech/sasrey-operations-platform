"use client";

import { useBooking } from "@/context/BookingContext";

export default function PassengerDetailsStep() {
  const { booking, updateBooking } = useBooking();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-3xl font-black text-slate-900">
        Passenger Details
      </h2>

      <p className="mt-2 text-slate-600">
        Tell us who will be travelling.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="customerName"
            className="mb-2 block font-semibold"
          >
            Full Name
          </label>

          <input
            id="customerName"
            type="text"
            className="w-full rounded-xl border border-slate-300 p-4"
            value={booking.customerName ?? ""}
            onChange={(e) =>
              updateBooking({
                customerName: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block font-semibold"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            className="w-full rounded-xl border border-slate-300 p-4"
            value={booking.email ?? ""}
            onChange={(e) =>
              updateBooking({
                email: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-2 block font-semibold"
          >
            Phone Number
          </label>

          <input
            id="phone"
            type="tel"
            className="w-full rounded-xl border border-slate-300 p-4"
            value={booking.phone ?? ""}
            onChange={(e) =>
              updateBooking({
                phone: e.target.value,
              })
            }
          />
        </div>
      </div>
    </div>
  );
}