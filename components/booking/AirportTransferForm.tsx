"use client";

import { useMemo } from "react";

import { routes } from "@/app/lib/routes";
import { useBooking } from "@/context/BookingContext";

export default function AirportTransferForm() {
  const { booking, updateBooking } = useBooking();

  const pickupLocations = [
    ...new Set(routes.map((route) => route.pickup)),
  ];

  const availableDestinations = useMemo(() => {
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
    <>
     <div className="rounded-xl border border-dashed border-slate-300 p-6">
  <h3 className="text-xl font-bold text-slate-900">
    Airport Transfer Form
  </h3>

  <p className="mt-2 text-slate-600">
    Airport transfer fields will be moved here.
  </p>
</div>
    </>
  );
}