"use client";

import { useMemo } from "react";

import { routes } from "@/app/lib/routes";
import { useBooking } from "@/context/BookingContext";

const destinationParishes: Record<string, string> = {
  "Montego Bay Hotels": "St. James",
  "Rose Hall": "St. James",
  Falmouth: "Trelawny",
  "Runaway Bay": "St. Ann",
  "Ocho Rios": "St. Ann",
  Negril: "Westmoreland",
  Kingston: "Kingston & St. Andrew",
};

export default function PickupDestination() {
  const { booking, updateBooking } = useBooking();

  const pickupLocations = useMemo(
    () => [...new Set(routes.map((route) => route.pickup))],
    []
  );

  const groupedDestinations = useMemo(() => {
    const groups: Record<string, string[]> = {};

    if (!booking.pickup) return groups;

    for (const route of routes) {
      if (route.pickup !== booking.pickup) continue;

      const destination = route.destination;
      const parish =
        destinationParishes[destination] ?? "Other Destinations";

      if (!groups[parish]) groups[parish] = [];

      if (!groups[parish].includes(destination)) {
        groups[parish].push(destination);
      }
    }

    return groups;
  }, [booking.pickup]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
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

          {Object.entries(groupedDestinations).map(([parish, destinations]) => (
            <optgroup key={parish} label={parish}>
              {destinations.map((destination) => (
                <option key={destination} value={destination}>
                  {destination}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    </div>
  );
}