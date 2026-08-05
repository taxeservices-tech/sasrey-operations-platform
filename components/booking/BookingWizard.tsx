"use client";

import { useBooking } from "@/context/BookingContext";
import type { Booking } from "@/types/booking";
import TripDetailsStep from "./wizard/TripDetailsStep";
import QuoteCalculator from "./QuoteCalculator";

interface BookingWizardProps {
  booking: Partial<Booking>;
}

export default function BookingWizard({
  booking,
}: BookingWizardProps) {
  const { currentStep, setCurrentStep } = useBooking();

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">

        {/* Progress */}
        <div className="mb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">
            Step {currentStep} of 5
          </p>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-sky-500 transition-all duration-300"
              style={{ width: `${currentStep * 20}%` }}
            />
          </div>
        </div>

        {/* Heading */}
        <div className="mb-10">
          <h2 className="text-4xl font-black text-slate-900">
            Booking Wizard
          </h2>

          <p className="mt-3 text-slate-600">
            We will build the booking process one step at a time.
          </p>
        </div>

{/* Step Content */}
<div className="grid gap-10 lg:grid-cols-[3fr_2fr]">

<TripDetailsStep />
 
  <QuoteCalculator />
  
  </div>

<div className="mt-10 flex justify-end">
          <button
            onClick={() => {
              if (currentStep < 5) {
                setCurrentStep(currentStep + 1);
              }
            }}
            className="rounded-full bg-sky-500 px-8 py-4 text-lg font-semibold text-white transition hover:bg-sky-600"
          >
            {currentStep === 5 ? "Finish" : "Continue →"}
          </button>
        </div>

      </div>
    </section>
  );
}