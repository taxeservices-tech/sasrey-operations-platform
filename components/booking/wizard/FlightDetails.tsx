"use client";

import { useBooking } from "@/context/BookingContext";

export default function FlightDetails() {
  const { booking, updateBooking } = useBooking();

  // Only show for airport transfers
  if (booking.serviceCategory !== "Airport Transfer") {
    return null;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <label
          htmlFor="flightNumber"
          className="mb-2 block font-semibold"
        >
          Flight Number
        </label>

        <input
          id="flightNumber"
          type="text"
          placeholder="AA1234"
          className="w-full rounded-xl border border-slate-300 p-4"
          value={booking.flightNumber ?? ""}
          onChange={(e) =>
            updateBooking({
              flightNumber: e.target.value,
            })
          }
        />
      </div>
    </div>
  );
}