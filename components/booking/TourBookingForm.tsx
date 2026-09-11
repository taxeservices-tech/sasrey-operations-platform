"use client";

import { useBooking } from "@/context/BookingContext";
import { tours } from "@/app/lib/tours";

const TOUR_TYPES = [
  "Private Tour",
  "Full-Day Tour",
  "Custom/Private Excursion",
] as const;

export default function TourBookingForm() {
  const { booking, updateBooking } = useBooking();

  return (
    <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <label className="mb-2 block font-semibold text-slate-900">
        Tour Type
      </label>

      <select
        className="w-full rounded-xl border border-slate-300 bg-white p-4"
        value={booking.tourType ?? ""}
        onChange={(e) =>
          updateBooking({
            tourType: e.target.value as
              | "Private Tour"
              | "Full-Day Tour"
              | "Custom/Private Excursion",
          })
        }
      >
        <option value="">Select Tour Type</option>

        {TOUR_TYPES.map((tourType) => (
          <option key={tourType} value={tourType}>
            {tourType}
          </option>
        ))}
      </select>

      <p className="mt-2 text-xs text-slate-500">
        Select the type of private tour or excursion you would like.
      </p>

      <div className="mt-6">
        <label className="mb-2 block font-semibold text-slate-900">
          Tour Selection
        </label>

        <select
          className="w-full rounded-xl border border-slate-300 bg-white p-4"
          value={booking.tourId ?? ""}
          onChange={(e) =>
            updateBooking({
              tourId: e.target.value || undefined,
            })
          }
        >
          <option value="">Select Tour</option>

          {tours.map((tour) => (
            <option key={tour.id} value={tour.id}>
              {tour.name} — ${tour.basePrice}
            </option>
          ))}
        </select>

        <p className="mt-2 text-xs text-slate-500">
          Select a tour from the SASREY Tours catalogue.
        </p>
      </div>

      <div className="mt-6">
        <label className="mb-2 block font-semibold text-slate-900">
          Tour Destination / Attractions
        </label>

        <textarea
          className="w-full rounded-xl border border-slate-300 bg-white p-4"
          rows={3}
          value={booking.tourDestination ?? ""}
          onChange={(e) =>
            updateBooking({
              tourDestination: e.target.value,
            })
          }
          placeholder="e.g. Negril, Seven Mile Beach & Rick's Café"
        />

        <p className="mt-2 text-xs text-slate-500">
          Tell us where you would like to go or the attractions you would like
          to visit.
        </p>
      </div>
    </div>
  );
}
