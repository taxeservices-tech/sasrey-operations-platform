"use client";

import { useMemo, useState } from "react";
import { calculateBookingPrice } from "@/app/lib/pricing";
import { findBookingRoute } from "@/app/lib/routeResolver";
import { routes } from "@/app/lib/routes";

export default function QuoteCalculator() {
  const [pickup] = useState("MBJ Airport");
  const [destination, setDestination] = useState("Montego Bay Hotels");
  const [tripType, setTripType] = useState<"One Way" | "Round Trip">("One Way");
  const [passengers, setPassengers] = useState(1);

  const selectedRoute = useMemo(() => {
    return (
      findBookingRoute({
        service: "Airport Transfer",
        pickup,
        destination,
        passengers,
      }) ??
      routes.find(
        (route) =>
          route.active &&
          route.pickup === pickup &&
          route.destination === destination
      ) ??
      routes[0]
    );
  }, [pickup, destination, passengers]);
  const pricing = useMemo(() => {
    return calculateBookingPrice({
      service: selectedRoute.service,
      pickup: selectedRoute.pickup,
      destination: selectedRoute.destination,
      tripType,
      passengers,
    });
  }, [selectedRoute, tripType, passengers]);

    const maximumAvailablePassengers = useMemo(() => {
    const matchingRoutes = routes.filter(
      (route) =>
        route.active &&
        route.service === "Airport Transfer" &&
        route.pickup === pickup &&
        route.destination === destination
    );

    return matchingRoutes.reduce(
      (maximum, route) =>
        Math.max(maximum, route.maxPassengers),
      0
    );
  }, [pickup, destination]);

  const passengerOptions = useMemo(() => {
    const maximum =
      maximumAvailablePassengers || selectedRoute.maxPassengers;

    return Array.from(
      { length: maximum },
      (_, index) => index + 1
    );
  }, [
    maximumAvailablePassengers,
    selectedRoute.maxPassengers,
  ]);

  const baseFare = pricing?.baseFare ?? 0;

  const extraPassengers = pricing
    ? Math.max(
        passengers - selectedRoute.includedPassengers,
        0
      )
    : 0;

  const extraPassengerTotal = pricing?.passengerFee ?? 0;

  const total = pricing?.total ?? 0;

  const deposit = pricing?.deposit ?? 0;

  const balance = pricing?.balance ?? 0;

  return (
    <section className="bg-slate-100 py-24">
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="mb-14 text-center">

          <span className="rounded-full bg-sky-100 px-6 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">
            Instant Quote
          </span>

          <h2 className="mt-6 text-5xl font-black text-slate-900">
            Calculate Your Fare
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-600">
            Base fare includes{" "}
            {selectedRoute.includedPassengers} passengers.
            Additional passengers incur an additional charge
            up to the vehicle capacity of{" "}
            {selectedRoute.maxPassengers}.
          </p>

        </div>

        <div className="grid gap-10 rounded-3xl bg-white p-10 shadow-xl lg:grid-cols-2">

          {/* LEFT PANEL */}

          <div className="space-y-6">

            <div>

              <label className="mb-2 block font-semibold">
                Pickup
              </label>

              <input
                value={pickup}
                disabled
                className="w-full rounded-xl border bg-slate-100 p-4"
              />

            </div>

            <div>

              <label className="mb-2 block font-semibold">
                Trip Type
              </label>

              <select
                value={tripType}
                onChange={(e) =>
                  setTripType(
                    e.target.value as "One Way" | "Round Trip"
                  )
                }
                className="w-full rounded-xl border p-4"
              >
                <option>One Way</option>
                <option>Round Trip</option>
              </select>

            </div>

            <div>

              <label className="mb-2 block font-semibold">
                Destination
              </label>

              <select
                value={destination}
                onChange={(e) =>
                  setDestination(e.target.value)
                }
                className="w-full rounded-xl border p-4"
              >
                {routes
                  .filter(
                    (route) =>
                      route.active &&
                      route.pickup === pickup
                  )
                  .map((route) => (
                    <option
                      key={route.id}
                      value={route.destination}
                    >
                      {route.destination}
                    </option>
                  ))}
              </select>

            </div>

            <div>

              <label className="mb-2 block font-semibold">
                Passengers
              </label>

              <select
                value={passengers}
                onChange={(e) =>
                  setPassengers(Number(e.target.value))
                }
                className="w-full rounded-xl border p-4"
              >
                {passengerOptions.map((num) => (
                  <option
                    key={num}
                    value={num}
                  >
                    {num} Passenger{num > 1 ? "s" : ""}
                  </option>
                ))}
              </select>

              <p className="mt-3 text-sm text-slate-500">
                Base fare covers up to{" "}
                {selectedRoute.includedPassengers} passengers.
                Passengers{" "}
                {selectedRoute.includedPassengers + 1}–
                {selectedRoute.maxPassengers} are charged
                per person.
              </p>

            </div>

          </div>

          {/* RIGHT PANEL */}

          <div className="w-full rounded-3xl bg-sky-50 p-8">

            <h3 className="text-3xl font-black text-slate-900">
              Quote Summary
            </h3>

            <div className="mt-8 space-y-5">

              <div className="flex items-center justify-between gap-4">
                <span>Vehicle</span>
                <strong>{selectedRoute.vehicle}</strong>
              </div>

              <div className="flex justify-between">
                <span>Trip Type</span>
                <strong>{tripType}</strong>
              </div>

              <div className="flex justify-between">
                <span>Passengers</span>
                <strong>{passengers}</strong>
              </div>

              <div className="flex justify-between">
                <span>Base Fare</span>
                <strong>
                  US${baseFare.toFixed(2)}
                </strong>
              </div>

              {extraPassengers > 0 && (
                <div className="flex justify-between">

                  <span>
                    Extra Passenger ({extraPassengers})
                  </span>

                  <strong>
                    US${extraPassengerTotal.toFixed(2)}
                  </strong>

                </div>
              )}

              <hr />

              <div className="flex justify-between text-2xl font-bold">

                <span>Total</span>

                <span>
                  US${total.toFixed(2)}
                </span>

              </div>

              <div className="flex justify-between">

                <span>Deposit (25%)</span>

                <strong>
                  US${deposit.toFixed(2)}
                </strong>

              </div>

              <div className="flex justify-between text-xl font-bold text-sky-700">

                <span>Balance</span>

                <span>
                  US${balance.toFixed(2)}
                </span>

              </div>

            </div>

            <button
              type="button"
              className="mt-10 w-full rounded-full bg-sky-500 py-4 text-lg font-semibold text-white transition hover:bg-sky-600"
            >
              Continue Booking
            </button>

          </div>

        </div>

      </div>
    </section>
  );
}