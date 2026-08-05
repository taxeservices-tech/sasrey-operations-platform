"use client";

import { useMemo } from "react";

import { routes } from "@/app/lib/routes";
import { useBooking } from "@/context/BookingContext";

export default function PickupDestination() {
  const { booking, updateBooking } = useBooking();

  const pickupLocations = useMemo(
    () => [...new Set(routes.map((route) => route.pickup))],
    []
  );

  const destinations = useMemo(() => {
    if (!booking.pickup) return [];

    return [
      ...new Set(
        routes
          .filter((route) => route.pickup === booking.pickup)
          .map((route) => route.destination)
      ),
    ];
  }, [booking.pickup]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Pickup */}

      <div className="space-y-2">
        <label
          htmlFor="pickup"
          className="block text-sm font-semibold text-slate-700"
        >
          Pickup Location
        </label>

        <select
          id="pickup"
          value={booking.pickup ?? ""}
          onChange={(e) =>
            updateBooking({
              pickup: e.target.value,
              destination: "",
              vehicle: "",
            })
          }
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
        >
          <option value="">Select Pickup Location</option>

          {pickupLocations.map((pickup) => (
            <option key={pickup} value={pickup}>
              {pickup}
            </option>
          ))}
        </select>
      </div>

      {/* Destination */}

      <div className="space-y-2">
        <label
          htmlFor="destination"
          className="block text-sm font-semibold text-slate-700"
        >
          Destination
        </label>

        <select
          id="destination"
          value={booking.destination ?? ""}
          onChange={(e) => {
            const destination = e.target.value;

            const route = routes.find(
              (route) =>
                route.pickup === booking.pickup &&
                route.destination === destination
            );

            updateBooking({
              destination,
              vehicle: route?.vehicle ?? "",
            });
          }}
          disabled={!booking.pickup}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm disabled:bg-slate-100 disabled:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
        >
          <option value="">
            {booking.pickup
              ? "Select Destination"
              : "Choose Pickup First"}
          </option>

          {destinations.map((destination) => (
            <option key={destination} value={destination}>
              {destination}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}