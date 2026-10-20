"use client";

import { useMemo, useState } from "react";

import {
  CustomTourServiceLevel,
} from "@/types/booking";
import { useBooking } from "@/context/BookingContext";

const SERVICE_LEVELS: Array<{
  value: CustomTourServiceLevel;
  durationHours: number;
  minimumPrice: number;
  description: string;
}> = [
  {
    value: "Private Excursion",
    durationHours: 5,
    minimumPrice: 175,
    description:
      "Up to 5 hours for a private sightseeing or excursion experience.",
  },
  {
    value: "Private Custom Tour",
    durationHours: 8,
    minimumPrice: 225,
    description:
      "Up to 8 hours for a flexible private tour with multiple stops.",
  },
  {
    value: "Full-Day Private Custom Tour",
    durationHours: 10,
    minimumPrice: 300,
    description:
      "Up to 10 hours for a full-day private Jamaica experience.",
  },
];

export default function CustomTourItineraryStep() {
  const { booking, updateBooking } = useBooking();

  const [stopInput, setStopInput] = useState("");

  const selectedServiceLevel = useMemo(
    () =>
      SERVICE_LEVELS.find(
        (level) =>
          level.value === booking.customTourServiceLevel
      ),
    [booking.customTourServiceLevel]
  );

  const stops = booking.customTourStops ?? [];

  function handleServiceLevelChange(
    value: CustomTourServiceLevel
  ) {
    const serviceLevel = SERVICE_LEVELS.find(
      (level) => level.value === value
    );

    updateBooking({
      customTourServiceLevel: value,
      customTourDurationHours:
        serviceLevel?.durationHours,
      customTourAdditionalHours: 0,
    });
  }

  function handleDestinationChange(value: string) {
    updateBooking({
      destination: value,
      tourDestination: value,
    });
  }

  function addStop() {
    const stop = stopInput.trim();

    if (!stop) {
      return;
    }

    if (
      stops.some(
        (existingStop) =>
          existingStop.toLowerCase() ===
          stop.toLowerCase()
      )
    ) {
      setStopInput("");
      return;
    }

    updateBooking({
      customTourStops: [...stops, stop],
    });

    setStopInput("");
  }

  function removeStop(indexToRemove: number) {
    updateBooking({
      customTourStops: stops.filter(
        (_, index) => index !== indexToRemove
      ),
    });
  }

  function moveStop(
    index: number,
    direction: "up" | "down"
  ) {
    const newIndex =
      direction === "up"
        ? index - 1
        : index + 1;

    if (
      newIndex < 0 ||
      newIndex >= stops.length
    ) {
      return;
    }

    const reorderedStops = [...stops];

    [
      reorderedStops[index],
      reorderedStops[newIndex],
    ] = [
      reorderedStops[newIndex],
      reorderedStops[index],
    ];

    updateBooking({
      customTourStops: reorderedStops,
    });
  }

  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">
          Custom / Private Excursion
        </p>

        <h2 className="mt-1 text-2xl font-black text-slate-900">
          Build Your Itinerary
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Tell us where you would like to go and the
          places you would like to visit. SASREY will
          calculate the route and package price from your
          itinerary.
        </p>
      </div>

      {/* Pickup Location */}
      <div>
        <label
          htmlFor="custom-tour-pickup"
          className="mb-2 block text-sm font-bold text-slate-800"
        >
          Pickup Location
        </label>

        <input
          id="custom-tour-pickup"
          type="text"
          value={booking.pickup ?? ""}
          onChange={(event) =>
            updateBooking({
              pickup: event.target.value,
            })
          }
          placeholder="Hotel, villa, resort or address"
          className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />

        <p className="mt-2 text-xs text-slate-500">
          Your pickup location can be anywhere in Jamaica.
          You do not need to start with an airport transfer.
        </p>
      </div>

      {/* Main Destination */}
      <div>
        <label
          htmlFor="custom-tour-destination"
          className="mb-2 block text-sm font-bold text-slate-800"
        >
          Main Destination
        </label>

        <input
          id="custom-tour-destination"
          type="text"
          value={booking.destination ?? ""}
          onChange={(event) =>
            handleDestinationChange(
              event.target.value
            )
          }
          placeholder="Where would you like to go?"
          className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />

        <p className="mt-2 text-xs text-slate-500">
          Example: Rick&apos;s Cafe, Negril.
        </p>
      </div>

      {/* Planned Stops */}
      <div>
        <label
          htmlFor="custom-tour-stop"
          className="mb-2 block text-sm font-bold text-slate-800"
        >
          Planned Stops
          <span className="ml-1 font-normal text-slate-400">
            (Optional)
          </span>
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="custom-tour-stop"
            type="text"
            value={stopInput}
            onChange={(event) =>
              setStopInput(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addStop();
              }
            }}
            placeholder="Add a place you want to visit"
            className="min-w-0 flex-1 rounded-2xl border border-slate-300 bg-white p-4 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />

          <button
            type="button"
            onClick={addStop}
            className="rounded-2xl bg-slate-900 px-6 py-3 font-bold text-white transition hover:bg-slate-800"
          >
            Add Stop
          </button>
        </div>

        {stops.length > 0 && (
          <div className="mt-4 space-y-3">
            {stops.map((stop, index) => (
              <div
                key={`${stop}-${index}`}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-700">
                  {index + 1}
                </span>

                <span className="min-w-0 flex-1 text-sm font-medium text-slate-800">
                  {stop}
                </span>

                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      moveStop(index, "up")
                    }
                    disabled={index === 0}
                    aria-label={`Move ${stop} up`}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Ôåæ
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      moveStop(index, "down")
                    }
                    disabled={
                      index === stops.length - 1
                    }
                    aria-label={`Move ${stop} down`}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Ôåô
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      removeStop(index)
                    }
                    aria-label={`Remove ${stop}`}
                    className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-2 text-xs text-slate-500">
          Planned stops are part of your agreed itinerary.
          Unplanned additional stops may be subject to an
          extra-stop charge.
        </p>
      </div>

      {/* Return To Pickup */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={
              booking.customTourReturnToPickup ??
              true
            }
            onChange={(event) =>
              updateBooking({
                customTourReturnToPickup:
                  event.target.checked,
              })
            }
            className="mt-1 h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />

          <span>
            <span className="block text-sm font-bold text-slate-800">
              Return me to my pickup location
            </span>

            <span className="mt-1 block text-xs leading-5 text-slate-500">
              Recommended for private excursions where
              the customer wants to return to the hotel,
              villa or original pickup point.
            </span>
          </span>
        </label>
      </div>

      {/* Service Level */}
      <div>
        <label
          htmlFor="custom-tour-service-level"
          className="mb-2 block text-sm font-bold text-slate-800"
        >
          Service Level
        </label>

        <select
          id="custom-tour-service-level"
          value={
            booking.customTourServiceLevel ?? ""
          }
          onChange={(event) =>
            handleServiceLevelChange(
              event.target
                .value as CustomTourServiceLevel
            )
          }
          className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="">
            Select your service level
          </option>

          {SERVICE_LEVELS.map((level) => (
            <option
              key={level.value}
              value={level.value}
            >
              {level.value} ÔÇö up to{" "}
              {level.durationHours} hours
            </option>
          ))}
        </select>
      </div>

      {/* Selected Service Level */}
      {selectedServiceLevel && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Selected Service
              </p>

              <h3 className="mt-1 text-lg font-black text-emerald-950">
                {selectedServiceLevel.value}
              </h3>

              <p className="mt-1 text-sm leading-6 text-emerald-900">
                {selectedServiceLevel.description}
              </p>
            </div>

            <div className="shrink-0 rounded-xl bg-white px-4 py-3 sm:text-right">
              <p className="text-xs font-semibold text-slate-500">
                Minimum package price
              </p>

              <p className="text-lg font-black text-emerald-700">
                US$
                {selectedServiceLevel.minimumPrice}
              </p>
            </div>
          </div>

          <p className="mt-4 border-t border-emerald-100 pt-4 text-xs leading-5 text-emerald-800">
            The minimum is a pricing floor, not necessarily
            your final price. Your final package price will
            be calculated from the actual route, distance,
            service time and applicable SASREY pricing rules.
          </p>
        </div>
      )}

      {/* GPS Pricing Notice */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <p className="text-sm font-bold text-blue-900">
          Your route will be calculated automatically
        </p>

        <p className="mt-1 text-xs leading-5 text-blue-800">
          Once your itinerary is complete, SASREY will use
          the actual route distance and travel time to
          calculate the package price. You will see one
          customer-facing price rather than separate
          deadhead, fuel or operating-cost charges.
        </p>
      </div>
    </section>
  );
}
