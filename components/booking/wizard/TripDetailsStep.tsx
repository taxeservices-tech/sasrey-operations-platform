"use client";

import ExtrasSection from "./ExtrasSection";
import TravelDetails from "./TravelDetails";
import ServiceCategory from "./ServiceCategory";
import PickupDestination from "./PickupDestination";
import FlightDetails from "./FlightDetails";
import TourBookingForm from "../TourBookingForm";
import { useBooking } from "@/context/BookingContext";

export default function TripDetailsStep() {
  const { booking } = useBooking();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      {/* Section heading */}
      <div className="border-b border-slate-100 pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-sky-600">
          Step 1
        </p>

        <h2 className="mt-2 text-3xl font-black text-slate-900">
          Trip Details
        </h2>

        <p className="mt-2 text-slate-600">
          Tell us about your journey so we can prepare your transfer.
        </p>
      </div>

      {/* Trip information */}
      <div className="mt-8 space-y-8">
        <ServiceCategory />
        {booking.serviceCategory === "Tour" && <TourBookingForm />}
        <PickupDestination />

        <TravelDetails />

        <FlightDetails />

        <ExtrasSection />
      </div>
    </div>
  );
}