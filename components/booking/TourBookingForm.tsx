"use client";

import { useMemo } from "react";

import { tours } from "@/app/lib/tours";
import { useBooking } from "@/context/BookingContext";

export default function TourBookingForm() {
  const { booking, updateBooking } = useBooking();

  const activeTours = useMemo(
    () =>
      tours
        .filter((tour) => tour.active)
        .sort(
          (a, b) =>
            a.displayOrder - b.displayOrder
        ),
    []
  );

  const selectedTour = useMemo(
    () =>
      tours.find(
        (tour) => tour.id === booking.tourId
      ),
    [booking.tourId]
  );

  function handleTourChange(
    tourId: string
  ) {
    const tour = tours.find(
      (item) => item.id === tourId
    );

    if (!tour) {
      updateBooking({
        tourId: undefined,
        tourType: undefined,
        tourDestination: undefined,
        destination: "",
      });

      return;
    }

    updateBooking({
      tourId: tour.id,
      tourType: tour.type,
      tourDestination:
        tour.destination ?? "",
      destination:
        tour.destination ?? "",
      passengers:
        booking.passengers &&
        booking.passengers >= 1 &&
        booking.passengers <= 7
          ? booking.passengers
          : 1,
    });
  }

  function handlePassengerChange(
    value: string
  ) {
    const passengers = Number(value);

    if (
      !Number.isInteger(passengers) ||
      passengers < 1 ||
      passengers > 7
    ) {
      return;
    }

    updateBooking({
      passengers,
    });
  }

  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">
          SASREY Tours
        </p>

        <h2 className="mt-1 text-2xl font-black text-slate-900">
          Choose Your Tour
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Select one of our Jamaica experiences. Your
          SASREY transportation price is shown before
          you continue to booking.
        </p>
      </div>

      {/* Tour Selection */}
      <div>
        <label
          htmlFor="tour"
          className="mb-2 block text-sm font-bold text-slate-800"
        >
          Tour / Experience
        </label>

        <select
          id="tour"
          value={booking.tourId ?? ""}
          onChange={(event) =>
            handleTourChange(
              event.target.value
            )
          }
          className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="">
            Select a tour
          </option>

          {activeTours.map((tour) => (
            <option
              key={tour.id}
              value={tour.id}
            >
              {tour.id} — {tour.name}
            </option>
          ))}
        </select>
      </div>

      {/* Passenger Count */}
      <div>
        <label
          htmlFor="tour-passengers"
          className="mb-2 block text-sm font-bold text-slate-800"
        >
          Number of Passengers
        </label>

        <select
          id="tour-passengers"
          value={booking.passengers ?? 1}
          onChange={(event) =>
            handlePassengerChange(
              event.target.value
            )
          }
          className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        >
          {Array.from(
            { length: 7 },
            (_, index) => index + 1
          ).map((number) => (
            <option
              key={number}
              value={number}
            >
              {number}{" "}
              {number === 1
                ? "Passenger"
                : "Passengers"}
            </option>
          ))}
        </select>

        <p className="mt-2 text-xs text-slate-500">
          Private Toyota Noah capacity:
          maximum 7 passengers.
        </p>
      </div>

      {/* Selected Tour */}
      {selectedTour && (
        <div className="space-y-6 rounded-2xl bg-slate-50 p-5">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {selectedTour.id}
                </p>

                <h3 className="mt-1 text-xl font-black text-slate-900">
                  {selectedTour.name}
                </h3>
              </div>

              <div className="rounded-xl bg-white px-4 py-3 text-right shadow-sm">
                <p className="text-xs font-semibold text-slate-500">
                  SASREY Price
                </p>

                <p className="text-lg font-black text-emerald-700">
                  {selectedTour.priceLabel}
                </p>
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {selectedTour.description}
            </p>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-900">
              Destinations & Stops
            </h4>

            <div className="space-y-2">
              {selectedTour.destinations.map(
                (destination) => (
                  <div
                    key={destination}
                    className="flex items-start gap-3 text-sm text-slate-700"
                  >
                    <span className="mt-1 text-emerald-600">
                      ●
                    </span>

                    <span>
                      {destination}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Itinerary */}
          <div>
            <h4 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-900">
              Itinerary
            </h4>

            <ol className="space-y-3">
              {selectedTour.itinerary.map(
                (step, index) => (
                  <li
                    key={step}
                    className="flex items-start gap-3"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700">
                      {index + 1}
                    </span>

                    <span className="text-sm leading-6 text-slate-700">
                      {step}
                    </span>
                  </li>
                )
              )}
            </ol>
          </div>

          {/* Included / Excluded */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-900">
                Included
              </h4>

              <ul className="space-y-2">
                {selectedTour.included.map(
                  (item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-slate-700"
                    >
                      <span className="font-bold text-emerald-600">
                        ✓
                      </span>

                      <span>{item}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-900">
                Not Included
              </h4>

              <ul className="space-y-2">
                {selectedTour.excluded.map(
                  (item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-slate-700"
                    >
                      <span className="font-bold text-slate-400">
                        •
                      </span>

                      <span>{item}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          {/* Pricing Notice */}
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-sm font-bold text-emerald-900">
              {selectedTour.pricingModel ===
              "dynamic_activity"
                ? "Activity pricing is calculated separately."
                : selectedTour.pricingModel ===
                    "custom"
                  ? "Custom tour pricing is calculated from your selected itinerary."
                  : "This is the current SASREY launch price."}
            </p>

            <p className="mt-1 text-xs leading-5 text-emerald-800">
              Attraction admission, meals, drinks and
              personal expenses are paid separately unless
              specifically stated as included.
            </p>
          </div>

          {/* Booking Notes */}
          {selectedTour.bookingNotes.length >
            0 && (
            <div>
              <h4 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-900">
                Important Information
              </h4>

              <ul className="space-y-2">
                {selectedTour.bookingNotes.map(
                  (note) => (
                    <li
                      key={note}
                      className="text-sm leading-6 text-slate-600"
                    >
                      • {note}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}