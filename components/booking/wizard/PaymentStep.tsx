"use client";

import { useState } from "react";

import { calculateBookingPrice } from "@/app/lib/pricing";
import { processBooking } from "@/app/lib/bookingService";
import type { Booking } from "@/types/booking";
import { useBooking } from "@/context/BookingContext";

export default function PaymentStep() {
  const {
    booking,
    updateBooking,
    setCurrentStep,
  } = useBooking();

  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [paymentError, setPaymentError] =
    useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] =
    useState(false);

  const quote =
    booking.passengers &&
    booking.serviceCategory === "Tour"
      ? calculateBookingPrice({
          service: "Tour",
          pickup: booking.pickup,
          destination: booking.destination,
          tripType: booking.tripType,
          passengers: booking.passengers,
          tourType: booking.tourType,
          childSeat:
            (booking.childSeat ?? 0) > 0,
          extraStop:
            (booking.extraStop ?? 0) > 0,
          waitingTimeHours:
            booking.waitingTimeHours ?? 0,
        })
      : booking.pickup &&
        booking.destination &&
        booking.tripType &&
        booking.passengers
      ? calculateBookingPrice({
          service:
            booking.serviceCategory ??
            "Airport Transfer",
          pickup: booking.pickup,
          destination: booking.destination,
          tripType: booking.tripType,
          passengers: booking.passengers,
          tourType: booking.tourType,
          childSeat:
            (booking.childSeat ?? 0) > 0,
          extraStop:
            (booking.extraStop ?? 0) > 0,
          waitingTimeHours:
            booking.waitingTimeHours ?? 0,
        })
      : null;

  const deposit =
    booking.deposit ??
    quote?.deposit ??
    0;

  const balance =
    booking.balance ??
    quote?.balance ??
    0;

  const total =
    booking.total ??
    quote?.total ??
    0;

  async function handlePayment() {
    setPaymentError(null);

    if (!booking.paymentMethod) {
      setPaymentError(
        "Please select a payment method."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await processBooking(
        booking as Booking
      );

      if (!result.success) {
        throw new Error(
          result.errors.join(" ") ||
            "Unable to create booking."
        );
      }

      if (result.booking) {
        updateBooking(result.booking);
      }

      setPaymentSuccess(true);
      setCurrentStep(5);
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Unable to submit booking."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-3xl font-black text-slate-900">
        Payment
      </h2>

      <p className="mt-2 text-slate-600">
        Choose your preferred payment method
        and enter your payment reference.
      </p>

      {!quote ? (
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-6">
          <p className="text-amber-700">
            Complete your trip details to calculate
            your payment.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-8 rounded-xl border border-slate-200 p-6">
            <div className="flex justify-between">
              <span>Deposit (25%)</span>

              <strong>
                USD {deposit.toFixed(2)}
              </strong>
            </div>

            <div className="mt-3 flex justify-between">
              <span>Balance</span>

              <strong>
                USD {balance.toFixed(2)}
              </strong>
            </div>

            <div className="mt-3 flex justify-between border-t pt-3 text-lg font-bold">
              <span>Total</span>

              <span>
                USD {total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <p className="font-semibold text-slate-900">
              Payment Method
            </p>

            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="paymentMethod"
                checked={
                  booking.paymentMethod ===
                  "Credit Card"
                }
                disabled={
                  isSubmitting ||
                  paymentSuccess
                }
                onChange={() =>
                  updateBooking({
                    paymentMethod:
                      "Credit Card",
                  })
                }
              />

              Credit Card
            </label>

            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="paymentMethod"
                checked={
                  booking.paymentMethod ===
                  "Bank Transfer"
                }
                disabled={
                  isSubmitting ||
                  paymentSuccess
                }
                onChange={() =>
                  updateBooking({
                    paymentMethod:
                      "Bank Transfer",
                  })
                }
              />

              Bank Transfer
            </label>
          </div>


          {paymentError && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {paymentError}
            </div>
          )}

          {paymentSuccess && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              Booking submitted successfully. Our team will confirm your payment in Operations.

            </div>
          )}

          <div className="mt-8 rounded-xl bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Payment Terms
            </h3>

            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>
                25% deposit is required to confirm
                your booking.
              </li>
              <li>
                The remaining balance is due 15 days
                before travel.
              </li>
              <li>
                Payments are accepted by Credit Card
                or Bank Transfer.
              </li>
            </ul>
          </div>

          {!paymentSuccess && (
            <button
              type="button"
              disabled={
                isSubmitting ||
                !booking.paymentMethod
              }
              onClick={handlePayment}
              className="mt-8 w-full rounded-full bg-sky-500 py-4 text-lg font-bold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting
                ? "Submitting Booking..."
                : "Submit Booking"}
            </button>
          )}
        </>
      )}
    </div>
  );
}