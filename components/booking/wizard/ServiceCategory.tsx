"use client";

import { useBooking } from "@/context/BookingContext";

export default function ServiceCategory() {
  const { booking, updateBooking } = useBooking();

  return (
    <div className="space-y-2">
      <label
        htmlFor="serviceCategory"
        className="block text-sm font-semibold text-slate-700"
      >
        Service Category
      </label>

      <select
        id="serviceCategory"
        value={booking.serviceCategory ?? "Airport Transfer"}
        onChange={(e) =>
          updateBooking({
            serviceCategory: e.target.value as
              | "Airport Transfer"
              | "Tour",
            pickup: "",
            destination: "",
            flightNumber: "",
          })
        }
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm transition-colors focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
      >
        <option value="Airport Transfer">
          🚖 Airport Transfer
        </option>

        <option value="Tour">
          🏝️ Tour
        </option>
      </select>

      <p className="text-sm text-slate-500">
        Select the type of transportation service you would like to book.
      </p>
    </div>
  );
}