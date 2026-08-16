"use client";

import { findBookingRoute } from "@/app/lib/routeResolver";
import { routes } from "@/app/lib/routes";
import { useBooking } from "@/context/BookingContext";

export default function TravelDetails() {
  const { booking, updateBooking } = useBooking();

  const availableRoutes =
    booking.pickup &&
    booking.destination &&
    booking.serviceCategory
      ? routes.filter(
          (route) =>
            route.active &&
            route.service === booking.serviceCategory &&
            route.pickup === booking.pickup &&
            route.destination === booking.destination
        )
      : [];

  const maxPassengers =
    availableRoutes.reduce(
      (maximum, route) =>
        Math.max(maximum, route.maxPassengers),
      0
    ) || 7;

  const passengerOptions = Array.from(
    { length: maxPassengers },
    (_, index) => index + 1
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">

      {/* Pickup Date */}
      <div>
        <label className="mb-2 block font-semibold">
          Pickup Date
        </label>

        <input
          type="date"
          className="w-full rounded-xl border border-slate-300 p-4"
          value={booking.pickupDate ?? ""}
          onChange={(e) =>
            updateBooking({
              pickupDate: e.target.value,
            })
          }
        />
      </div>

      {/* Pickup Time */}
      <div>
        <label className="mb-2 block font-semibold">
          Pickup Time
        </label>

        <input
          type="time"
          className="w-full rounded-xl border border-slate-300 p-4"
          value={booking.pickupTime ?? ""}
          onChange={(e) =>
            updateBooking({
              pickupTime: e.target.value,
            })
          }
        />
      </div>

      {/* Passengers */}
      <div>
        <label className="mb-2 block font-semibold">
          Passengers
        </label>

        <select
          className="w-full rounded-xl border border-slate-300 p-4"
          value={booking.passengers ?? 1}
          onChange={(e) => {
            const passengers = Number(e.target.value);

            const route =
              booking.pickup &&
              booking.destination &&
              booking.serviceCategory
                ? findBookingRoute({
                    service: booking.serviceCategory,
                    pickup: booking.pickup,
                    destination: booking.destination,
                    passengers,
                  })
                : null;

            updateBooking({
              passengers,
              routeId: route?.id,
              vehicle: route?.vehicle,
            });
          }}
        >
          {passengerOptions.map((number) => (
            <option key={number} value={number}>
              {number}
            </option>
          ))}
        </select>
      </div>

      {/* Trip Type */}
      <div>
        <label className="mb-2 block font-semibold">
          Trip Type
        </label>

        <select
          className="w-full rounded-xl border border-slate-300 p-4"
          value={booking.tripType ?? "One Way"}
          onChange={(e) =>
            updateBooking({
              tripType: e.target.value as
                | "One Way"
                | "Round Trip",
            })
          }
        >
          <option value="One Way">
            One Way
          </option>

          <option value="Round Trip">
            Round Trip
          </option>
        </select>
      </div>

      {/* Waiting Time */}
      <div>
        <label className="mb-2 block font-semibold">
          Waiting Time
        </label>

        <select
          className="w-full rounded-xl border border-slate-300 p-4"
          value={booking.waitingTimeHours ?? 0}
          onChange={(e) =>
            updateBooking({
              waitingTimeHours: Number(e.target.value),
            })
          }
        >
          <option value={0}>No Waiting Time</option>
          <option value={1}>1 Hour</option>
          <option value={2}>2 Hours</option>
          <option value={3}>3 Hours</option>
          <option value={4}>4 Hours</option>
        </select>
      </div>

    </div>
  );
}