"use client";

import AirportTransferForm from "./AirportTransferForm";
import TourBookingForm from "./TourBookingForm";
import { useMemo } from "react";

import { routes } from "@/app/lib/routes";
import { useBooking } from "@/context/BookingContext";

export default function BookingForm() {
  const {
    booking,
    updateBooking,
  } = useBooking();

  const pickupLocations = [
    ...new Set(
      routes
        .filter((route) => route.active)
        .map((route) => route.pickup)
    ),
  ];

  const availableDestinations = useMemo(() => {
    if (!booking.pickup) return [];

    return [
      ...new Set(
        routes
          .filter(
            (route) =>
              route.active &&
              route.pickup === booking.pickup &&
              route.service ===
                (booking.serviceCategory ??
                  "Airport Transfer")
          )
          .map((route) => route.destination)
      ),
    ];
  }, [
    booking.pickup,
    booking.serviceCategory,
  ]);

  const selectedRoute = useMemo(() => {
    if (
      !booking.pickup ||
      !booking.destination ||
      !booking.serviceCategory
    ) {
      return undefined;
    }

    return routes.find(
      (route) =>
        route.active &&
        route.pickup === booking.pickup &&
        route.destination ===
          booking.destination &&
        route.service ===
          booking.serviceCategory
    );
  }, [
    booking.pickup,
    booking.destination,
    booking.serviceCategory,
  ]);

  return (
    <div className="rounded-3xl bg-white p-10 shadow-xl">
      <h2 className="mb-8 text-3xl font-black text-slate-900">
        Booking Details
      </h2>

      <div className="mb-8">
        <label className="mb-2 block font-semibold">
          Service Category
        </label>

        <select
          className="w-full rounded-xl border border-slate-300 p-4"
          value={
            booking.serviceCategory ??
            "Airport Transfer"
          }
          onChange={(e) =>
            updateBooking({
              serviceCategory:
                e.target.value as
                  | "Airport Transfer"
                  | "Tour",
              destination: "",
              vehicle: "",
              passengers: 1,
            })
          }
        >
          <option value="Airport Transfer">
            🚖 Airport Transfer
          </option>

          <option value="Tour">
            🏝️ Tour
          </option>
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Full Name */}

        <div>
          <label className="mb-2 block font-semibold">
            Full Name
          </label>

          <input
            className="w-full rounded-xl border border-slate-300 p-4"
            placeholder="John Smith"
            value={booking.customerName ?? ""}
            onChange={(e) =>
              updateBooking({
                customerName: e.target.value,
              })
            }
          />
        </div>

        {/* Email */}

        <div>
          <label className="mb-2 block font-semibold">
            Email Address
          </label>

          <input
            type="email"
            className="w-full rounded-xl border border-slate-300 p-4"
            placeholder="john@email.com"
            value={booking.email ?? ""}
            onChange={(e) =>
              updateBooking({
                email: e.target.value,
              })
            }
          />
        </div>

        {/* Phone */}

        <div>
          <label className="mb-2 block font-semibold">
            Phone Number
          </label>

          <input
            className="w-full rounded-xl border border-slate-300 p-4"
            placeholder="+1 876..."
            value={booking.phone ?? ""}
            onChange={(e) =>
              updateBooking({
                phone: e.target.value,
              })
            }
          />
        </div>

        {/* Flight */}

        <div>
          <label className="mb-2 block font-semibold">
            Flight Number
          </label>

          <input
            className="w-full rounded-xl border border-slate-300 p-4"
            placeholder="AA123"
            value={booking.flightNumber ?? ""}
            onChange={(e) =>
              updateBooking({
                flightNumber: e.target.value,
              })
            }
          />
        </div>

        {/* Pickup */}

        <div>
          <label className="mb-2 block font-semibold">
            Pickup Location
          </label>

          <select
            className="w-full rounded-xl border border-slate-300 p-4"
            value={booking.pickup ?? ""}
            onChange={(e) =>
              updateBooking({
                pickup: e.target.value,
                destination: "",
                vehicle: "",
                passengers: 1,
              })
            }
          >
            <option value="">
              Select Pickup
            </option>

            {pickupLocations.map((pickup) => (
              <option key={pickup} value={pickup}>
                {pickup}
              </option>
            ))}
          </select>
        </div>

        {/* Destination */}

        <div>
          <label className="mb-2 block font-semibold">
            Destination
          </label>

          <select
            className="w-full rounded-xl border border-slate-300 p-4"
            value={booking.destination ?? ""}
            onChange={(e) => {
              const destination = e.target.value;

              const route = routes.find(
                (r) =>
                  r.active &&
                  r.pickup === booking.pickup &&
                  r.destination ===
                    destination &&
                  r.service ===
                    (booking.serviceCategory ??
                      "Airport Transfer")
              );

              updateBooking({
                destination,
                serviceCategory:
                  route?.service ??
                  booking.serviceCategory ??
                  "Airport Transfer",
                vehicle:
                  route?.vehicle ?? "",
                passengers: 1,
              });
            }}
          >
            <option value="">
              Select Destination
            </option>

            {availableDestinations.map(
              (destination) => (
                <option
                  key={destination}
                  value={destination}
                >
                  {destination}
                </option>
              )
            )}
          </select>
        </div>

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
                waitingTimeHours:
                  Number(e.target.value),
              })
            }
          >
            <option value={0}>
              No Waiting Time
            </option>
            <option value={1}>
              1 Hour
            </option>
            <option value={2}>
              2 Hours
            </option>
            <option value={3}>
              3 Hours
            </option>
            <option value={4}>
              4 Hours
            </option>
          </select>
        </div>

        {/* Passengers */}

        <div>
          <label className="mb-2 block font-semibold">
            Passengers
          </label>

          <select
            className="w-full rounded-xl border border-slate-300 p-4"
            value={booking.passengers ?? 1}
            onChange={(e) =>
              updateBooking({
                passengers:
                  Number(e.target.value),
              })
            }
            disabled={!selectedRoute}
          >
            {Array.from(
              {
                length:
                  selectedRoute?.maxPassengers ??
                  1,
              },
              (_, index) => index + 1
            ).map((number) => (
              <option
                key={number}
                value={number}
              >
                {number}
              </option>
            ))}
          </select>

          {selectedRoute && (
            <p className="mt-2 text-sm text-slate-500">
              Maximum passengers:
              {" "}
              {selectedRoute.maxPassengers}
            </p>
          )}
        </div>

        {/* Trip Type */}

        <div>
          <label className="mb-2 block font-semibold">
            Trip Type
          </label>

          <select
            className="w-full rounded-xl border border-slate-300 p-4"
            value={
              booking.tripType ?? "One Way"
            }
            onChange={(e) =>
              updateBooking({
                tripType:
                  e.target.value as
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

        {/* Service */}

        <div>
          <label className="mb-2 block font-semibold">
            Service Type
          </label>

          <input
            readOnly
            className="w-full rounded-xl border border-slate-300 bg-slate-100 p-4"
            value={
              booking.serviceCategory ?? ""
            }
            placeholder="Automatically selected"
          />
        </div>
      </div>

      {/* Optional Extras */}

      <div className="mt-8 rounded-2xl border border-slate-200 p-6">
        <h3 className="mb-4 text-xl font-bold">
          Optional Extras
        </h3>

        <div className="space-y-4">
          {/* Child Seat */}

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={
                (booking.childSeat ?? 0) > 0
              }
              onChange={(e) =>
                updateBooking({
                  childSeat:
                    e.target.checked ? 1 : 0,
                })
              }
            />

            <span>
              Child Seat (+USD $10)
            </span>
          </label>

          {/* Extra Stop */}

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={
                (booking.extraStop ?? 0) > 0
              }
              onChange={(e) =>
                updateBooking({
                  extraStop:
                    e.target.checked ? 1 : 0,
                })
              }
            />

            <span>
              Extra Stop (+USD $15)
            </span>
          </label>
        </div>
      </div>

      {/* Special Requests */}

      <div className="mt-8">
        <label className="mb-2 block font-semibold">
          Special Requests
        </label>

        <textarea
          rows={5}
          className="w-full rounded-xl border border-slate-300 p-4"
          placeholder="Child seat position, supermarket stop, wheelchair assistance..."
          value={
            booking.specialRequests ?? ""
          }
          onChange={(e) =>
            updateBooking({
              specialRequests:
                e.target.value,
            })
          }
        />
      </div>
    </div>
  );
}