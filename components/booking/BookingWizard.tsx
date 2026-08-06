"use client";

import { useState } from "react";

import ConfirmationStep from "./wizard/ConfirmationStep";
import PassengerDetailsStep from "./wizard/PassengerDetailsStep";
import PaymentStep from "./wizard/PaymentStep";
import ReviewStep from "./wizard/ReviewStep";
import TripDetailsStep from "./wizard/TripDetailsStep";
import QuoteSummary from "./QuoteSummary";

import { useBooking } from "@/context/BookingContext";

import {
  validatePassengerDetails,
  validatePayment,
  validateTripDetails,
} from "@/app/lib/validation";

export default function BookingWizard() {
  const {
    booking,
    currentStep,
    setCurrentStep,
  } = useBooking();

  const [errors, setErrors] = useState<string[]>([]);

  function handleContinue() {
    let result = {
      valid: true,
      errors: [] as string[],
    };

    switch (currentStep) {
      case 1:
        result = validateTripDetails(booking);
        break;

      case 2:
        result = validatePassengerDetails(booking);
        break;

      case 3:
        result = {
          valid: true,
          errors: [],
        };
        break;

      case 4:
        result = validatePayment(booking);
        break;

      default:
        result = {
          valid: true,
          errors: [],
        };
    }

    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    setErrors([]);

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  }

  function handlePrevious() {
    setErrors([]);

    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

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
              style={{
                width: `${currentStep * 20}%`,
              }}
            />
          </div>
        </div>

        {/* Heading */}

        <div className="mb-10">
          <h2 className="text-4xl font-black text-slate-900">
            Booking Wizard
          </h2>

          <p className="mt-3 text-slate-600">
            Book your airport transfer in a few simple steps.
          </p>
        </div>

        {/* Validation Errors */}

        {errors.length > 0 && (
          <div className="mb-8 rounded-2xl border border-red-300 bg-red-50 p-6">
            <h3 className="font-bold text-red-700">
              Please correct the following:
            </h3>

            <ul className="mt-3 list-disc space-y-2 pl-6 text-red-700">
              {errors.map((error) => (
                <li key={error}>
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Step Content */}

        <div className="grid gap-10 lg:grid-cols-[3fr_2fr]">

          <div>

            {currentStep === 1 && <TripDetailsStep />}

            {currentStep === 2 && <PassengerDetailsStep />}

            {currentStep === 3 && <ReviewStep />}

            {currentStep === 4 && <PaymentStep />}

            {currentStep === 5 && <ConfirmationStep />}

          </div>

          <QuoteSummary />

        </div>

        {/* Navigation */}

        <div className="mt-10 flex justify-between">

          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`rounded-full px-8 py-4 text-lg font-semibold transition ${
              currentStep === 1
                ? "cursor-not-allowed bg-slate-200 text-slate-400"
                : "bg-slate-700 text-white hover:bg-slate-800"
            }`}
          >
            ← Previous
          </button>

          <button
            onClick={handleContinue}
            className="rounded-full bg-sky-500 px-8 py-4 text-lg font-semibold text-white transition hover:bg-sky-600"
          >
            {currentStep === 5
              ? "Finish"
              : "Continue →"}
          </button>

        </div>

      </div>
    </section>
  );
}