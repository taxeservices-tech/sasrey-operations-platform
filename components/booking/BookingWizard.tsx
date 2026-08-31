"use client";

import { useRef, useState } from "react";

import { processBooking } from "@/app/lib/bookingService";
import {
  validatePassengerDetails,
  validatePayment,
  validateTripDetails,
} from "@/app/lib/validation";

import { useBooking } from "@/context/BookingContext";
import type { Booking } from "@/types/booking";

import ConfirmationStep from "./wizard/ConfirmationStep";
import PassengerDetailsStep from "./wizard/PassengerDetailsStep";
import PaymentStep from "./wizard/PaymentStep";
import ReviewStep from "./wizard/ReviewStep";
import TripDetailsStep from "./wizard/TripDetailsStep";
import QuoteSummary from "./QuoteSummary";

export default function BookingWizard() {
  const {
    booking,
    currentStep,
    setCurrentStep,
    resetBooking,
  } = useBooking();

  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Prevent duplicate submissions caused by rapid multiple clicks.
  const submissionLock = useRef(false);

  function handleContinue() {
    let result: {
      valid: boolean;
      errors: string[];
    } = {
      valid: true,
      errors: [],
    };

    switch (currentStep) {
      case 1:
        console.log(
          "Booking before validation:",
          booking
        );

        result = validateTripDetails(booking);

        console.log(result.errors);

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

  async function handleSubmit() {
    // Immediate lock prevents two rapid clicks from creating
    // two separate booking requests before React updates state.
    if (submissionLock.current) {
      console.log(
        "Duplicate booking submission prevented."
      );
      return;
    }

    submissionLock.current = true;

    try {
      setSubmitting(true);
      setErrors([]);
      setSuccessMessage("");

      const result = await processBooking(
        booking as Booking
      );

      if (!result.success) {
        setErrors(result.errors);
        return;
      }

      setSuccessMessage(
        `Booking confirmed! Reference: ${result.bookingReference}`
      );

      resetBooking();
      setCurrentStep(1);
    } catch (error) {
      console.error(
        "Booking submission error:",
        error
      );

      if (error instanceof Error) {
        setErrors([
          error.message ||
            "Unable to save booking.",
        ]);
      } else {
        setErrors([
          "Unable to save booking.",
        ]);
      }
    } finally {
      submissionLock.current = false;
      setSubmitting(false);
    }
  }

  return (
    <section>
      {/* Progress */}

<div className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-sky-600">
        Booking Progress
      </p>

      <p className="mt-2 text-lg font-bold text-slate-900">
        Step {currentStep} of 5
      </p>
    </div>

    <span className="rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700">
      {currentStep * 20}% Complete
    </span>
  </div>

  <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200">
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
          Book your airport transfer in a few simple
          steps.
        </p>
      </div>

      {successMessage && (
        <div className="mb-8 rounded-2xl border border-green-300 bg-green-50 p-6">
          <p className="font-semibold text-green-700">
            {successMessage}
          </p>
        </div>
      )}

      {errors.length > 0 && (
        <div className="mb-8 rounded-2xl border border-red-300 bg-red-50 p-6">
          <h3 className="font-bold text-red-700">
            Please correct the following:
          </h3>

          <ul className="mt-3 list-disc space-y-2 pl-6 text-red-700">
            {errors.map((error, index) => (
              <li key={`${error}-${index}`}>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Step Content */}

      <div className="grid gap-10 lg:grid-cols-[3fr_2fr]">
        <div>
          {currentStep === 1 && (
            <TripDetailsStep />
          )}

          {currentStep === 2 && (
            <PassengerDetailsStep />
          )}

          {currentStep === 3 && <ReviewStep />}

          {currentStep === 4 && <PaymentStep />}

          {currentStep === 5 && (
            <ConfirmationStep />
          )}
        </div>

        <QuoteSummary />
      </div>

      {/* Navigation */}

      <div className="mt-10 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={
            currentStep === 1 || submitting
          }
          className={`rounded-full px-8 py-4 text-lg font-semibold transition ${
            currentStep === 1 || submitting
              ? "cursor-not-allowed bg-slate-200 text-slate-400"
              : "bg-slate-700 text-white hover:bg-slate-800"
          }`}
        >
          ← Previous
        </button>

        <button
          type="button"
          onClick={
            currentStep === 5
              ? handleSubmit
              : handleContinue
          }
          disabled={submitting}
          className="rounded-full bg-sky-500 px-8 py-4 text-lg font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? "Submitting..."
            : currentStep === 5
              ? "Finish"
              : "Continue →"}
        </button>
      </div>
    </section>
  );
}