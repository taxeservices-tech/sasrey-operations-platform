"use client";

import ExtrasSection from "./ExtrasSection";
import TravelDetails from "./TravelDetails";
import ServiceCategory from "./ServiceCategory";
import PickupDestination from "./PickupDestination";
import FlightDetails from "./FlightDetails";

export default function TripDetailsStep() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-3xl font-black text-slate-900">
        Trip Details
      </h2>

           <div className="mt-8 space-y-8">
        <ServiceCategory />

        <PickupDestination />

        <TravelDetails />

        <FlightDetails />

        <ExtrasSection />
      </div>
    </div>
  );
}
