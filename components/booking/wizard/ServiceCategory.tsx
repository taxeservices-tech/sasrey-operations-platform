"use client";

import { useBooking } from "@/context/BookingContext";

export default function ServiceCategory() {
  const { booking, updateBooking } = useBooking();

  function handleChange(value: "Airport Transfer" | "Tour") {
    // Do nothing if the selection didn't actually change.
    if (booking.serviceCategory === value) {
      return;
    }

    updateBooking({
      serviceCategory: value,
      pickup: "",
      destination: "",
      vehicle: "",
      flightNumber: "",
    });
  }

  return (
    <div>
      <label
        htmlFor="serviceCategory"
        className="mb-2 block font-semibold"
      >
        Service Category
      </label>

      <select
        id="serviceCategory"
        value={booking.serviceCategory ?? "Airport Transfer"}
        onChange={(e) =>
          handleChange(
            e.target.value as "Airport Transfer" | "Tour"
          )
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

      <p className="mt-2 text-sm text-slate-500">
        Changing the service category will reset the pickup and destination
        because different services use different routes.
      </p>
    </div>
  );
}