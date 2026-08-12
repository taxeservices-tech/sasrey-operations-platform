"use client";

import { useBooking } from "@/context/BookingContext";

export default function ExtrasSection() {
  const { booking, updateBooking } = useBooking();

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-900">
        Optional Extras
      </h3>

      <div className="space-y-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(booking.childSeat ?? 0) > 0}
            onChange={(e) =>
              updateBooking({
                childSeat: e.target.checked ? 1 : 0,
              })
            }
          />

          <span>Child Seat Required</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(booking.extraStop ?? 0) > 0}
            onChange={(e) =>
              updateBooking({
                extraStop: e.target.checked ? 1 : 0,
              })
            }
          />

          <span>Include an Extra Stop</span>
        </label>
      </div>

      <div>
        <label
          htmlFor="specialRequests"
          className="mb-2 block font-semibold"
        >
          Special Requests
        </label>

        <textarea
          id="specialRequests"
          rows={4}
          className="w-full rounded-xl border border-slate-300 p-4"
          placeholder="Anything we should know before your trip?"
          value={booking.specialRequests ?? ""}
          onChange={(e) =>
            updateBooking({
              specialRequests: e.target.value,
            })
          }
        />
      </div>
    </div>
  );
}