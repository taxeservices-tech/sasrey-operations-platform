"use client";

import { useState } from "react";
import { useBooking } from "@/context/BookingContext";
import { calculateBookingPrice } from "@/app/lib/pricing";
import { routes } from "@/app/lib/routes";

import TripDetailsStep from "./wizard/TripDetailsStep";
import PassengerDetailsStep from "./wizard/PassengerDetailsStep";
import ReviewStep from "./wizard/ReviewStep";
import PaymentStep from "./wizard/PaymentStep";
import ConfirmationStep from "./wizard/ConfirmationStep";
import QuoteSummary from "./QuoteSummary";

interface BookingApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  bookingReference?: string;
  action?: string;
  status?: string;
}

export default function BookingWizard() {
  const {
    booking,
    currentStep,
    setCurrentStep,
    updateBooking,
  } = useBooking();

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const quote =
    booking.pickup && booking.destination
      ? calculateBookingPrice({
          pickup: booking.pickup,
          destination: booking.destination,
          tripType: booking.tripType ?? "One Way",
          passengers: booking.passengers ?? 1,
          childSeat: (booking.childSeat ?? 0) > 0,
          extraStop: (booking.extraStop ?? 0) > 0,
          waitingTimeHours: booking.waitingTimeHours ?? 0,
        })
      : null;

  function validateTripDetails(): string | null {
    if (!booking.pickup) {
      return "Please select a pickup location.";
    }

    if (!booking.destination) {
      return "Please select a destination.";
    }

    if (!booking.pickupDate) {
      return "Please select your pickup date.";
    }

    const today = new Date();
    const todayString = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    if (booking.pickupDate < todayString) {
      return "The pickup date cannot be in the past.";
    }

    if (!booking.pickupTime) {
      return "Please select your pickup time.";
    }

    if (
      !Number.isInteger(booking.passengers) ||
      (booking.passengers ?? 0) < 1 ||
      (booking.passengers ?? 0) > 7
    ) {
      return "Please select between 1 and 7 passengers.";
    }

    if (!quote) {
      return "This route does not have an approved instant price. Please contact us for a quote.";
    }

    return null;
  }

  function validatePassengerDetails(): string | null {
    if (!booking.customerName?.trim()) {
      return "Please enter the passenger's full name.";
    }

    if (
      !booking.email?.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email.trim())
    ) {
      return "Please enter a valid email address.";
    }

    if (!booking.phone?.trim()) {
      return "Please enter a phone number.";
    }

    return null;
  }

  async function submitBooking() {
    if (submitting) return;

    const tripError = validateTripDetails();

    if (tripError) {
      setErrorMessage(tripError);
      setCurrentStep(1);
      return;
    }

    const passengerError = validatePassengerDetails();

    if (passengerError) {
      setErrorMessage(passengerError);
      setCurrentStep(2);
      return;
    }

    if (!booking.paymentMethod) {
      setErrorMessage("Please select a payment method.");
      return;
    }

    if (!quote) {
      setErrorMessage(
        "A valid instant-price quote is required before submission."
      );
      return;
    }

    const route = routes.find(
      (item) =>
        item.pickup === booking.pickup &&
        item.destination === booking.destination
    );

    const payload = {
      action: "createBooking",
      ...booking,
      customerName: booking.customerName!.trim(),
      email: booking.email!.trim(),
      phone: booking.phone!.trim(),
      pickup: booking.pickup!,
      destination: booking.destination!,
      pickupDate: booking.pickupDate!,
      pickupTime: booking.pickupTime!,
      passengers: booking.passengers!,
      tripType: booking.tripType ?? "One Way",
      serviceCategory: booking.serviceCategory ?? "Airport Transfer",
      vehicle: quote.vehicle,
      routeId: route?.id,
      baseFare: quote.baseFare,
      additionalPassengerFee: quote.passengerFee,
      additionalPassengerTotal: quote.passengerFee,
      total: quote.total,
      deposit: quote.deposit,
      balance: quote.balance,
      childSeat: booking.childSeat ?? 0,
      extraStop: booking.extraStop ?? 0,
      waitingTimeHours: booking.waitingTimeHours ?? 0,
      status: "Pending",
    };

    setSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data =
        (await response.json()) as BookingApiResponse;

      if (!response.ok || data.success !== true) {
        throw new Error(
          data.message ||
            data.error ||
            "The booking could not be saved. Please try again."
        );
      }

      if (!data.bookingReference) {
        throw new Error(
          "The server reported success but did not return a booking reference. Please verify the booking in Booking Records before retrying."
        );
      }

      updateBooking({
        ...payload,
        bookingReference: data.bookingReference,
        status: "Pending",
      });

      setCurrentStep(5);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit your booking. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleContinue() {
    setErrorMessage("");

    if (currentStep === 1) {
      const error = validateTripDetails();

      if (error) {
        setErrorMessage(error);
        return;
      }

      updateBooking({
        vehicle: quote?.vehicle,
        baseFare: quote?.baseFare,
        additionalPassengerFee: quote?.passengerFee,
        additionalPassengerTotal: quote?.passengerFee,
        total: quote?.total,
        deposit: quote?.deposit,
        balance: quote?.balance,
      });

      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      const error = validatePassengerDetails();

      if (error) {
        setErrorMessage(error);
        return;
      }

      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      setCurrentStep(4);
      return;
    }

    if (currentStep === 4) {
      void submitBooking();
    }
  }

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
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

        <div className="mb-10">
          <h2 className="text-4xl font-black text-slate-900">
            Booking Wizard
          </h2>

          <p className="mt-3 text-slate-600">
            Book your airport transfer in a few simple steps.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[3fr_2fr]">
          <div>
            {currentStep === 1 && <TripDetailsStep />}
            {currentStep === 2 && <PassengerDetailsStep />}
            {currentStep === 3 && <ReviewStep />}
            {currentStep === 4 && <PaymentStep />}
            {currentStep === 5 && <ConfirmationStep />}
          </div>

          {currentStep !== 5 && <QuoteSummary />}
        </div>

        {errorMessage && currentStep !== 5 && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
          >
            {errorMessage}
          </div>
        )}

        {currentStep < 5 && (
          <div className="mt-10 flex justify-between gap-4">
            <button
              type="button"
              disabled={currentStep === 1 || submitting}
              onClick={() => {
                setErrorMessage("");
                setCurrentStep(currentStep - 1);
              }}
              className="rounded-full border border-slate-300 px-8 py-4 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Back
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={handleContinue}
              className="rounded-full bg-sky-500 px-8 py-4 text-lg font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Submitting Booking..."
                : currentStep === 4
                  ? "Submit Booking"
                  : "Continue"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}