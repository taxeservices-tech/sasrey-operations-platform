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
    paymentAuthorizationToken,
    setPaymentAuthorizationToken,
    setCurrentStep,
  } = useBooking();

  const [paymentReference, setPaymentReference] =
    useState("");
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

    if (!paymentReference.trim()) {
      setPaymentError(
        "Payment reference is required."
      );
      return;
    }

    if (deposit <= 0) {
      setPaymentError(
        "A valid deposit amount could not be calculated."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      let bookingReference =
        booking.bookingReference;

      let authorizationToken =
        paymentAuthorizationToken;

      if (!bookingReference) {
        const result = await processBooking(
          booking as Booking
        );

        if (!result.success) {
          throw new Error(
            result.errors.join(" ") ||
              "Unable to create booking."
          );
        }

        bookingReference =
          result.bookingReference;

        authorizationToken =
          result.paymentAuthorizationToken ?? null;

        if (!result.bookingReference) {
          throw new Error(
            "Booking reference was not returned."
          );
        }

        if (!result.paymentAuthorizationToken) {
          throw new Error(
            "Payment authorization was not issued."
          );
        }

        if (result.booking) {
          updateBooking(result.booking);
        }

        setPaymentAuthorizationToken(
          result.paymentAuthorizationToken
        );
      }

      if (!bookingReference) {
        throw new Error(
          "Booking reference is required before payment can be recorded."
        );
      }

      if (!authorizationToken) {
        throw new Error(
          "Payment authorization is required before payment can be recorded."
        );
      }

      const response = await fetch(
        "/api/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action: "recordPayment",
            bookingReference,
            paymentAuthorizationToken:
              authorizationToken,
            amountPaid: deposit,
            paymentMethod:
              booking.paymentMethod,
            paymentDate:
              new Date().toISOString(),
            paymentReference:
              paymentReference.trim(),
            paymentType: "Deposit",
          }),
        }
      );

      const data = await response.json();

      if (
        !response.ok ||
        data.success === false
      ) {
        throw new Error(
          data.message ??
            data.error ??
            "Unable to record payment."
        );
      }

      setPaymentSuccess(true);
      setCurrentStep(5);
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Unable to record payment."
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

          <div className="mt-8">
            <label
              htmlFor="paymentReference"
              className="mb-2 block font-semibold text-slate-900"
            >
              Payment Reference
            </label>

            <input
              id="paymentReference"
              type="text"
              value={paymentReference}
              disabled={
                isSubmitting ||
                paymentSuccess
              }
              onChange={(e) =>
                setPaymentReference(
                  e.target.value
                )
              }
              placeholder="Enter payment confirmation/reference"
              className="w-full rounded-xl border border-slate-300 p-4 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            />

            <p className="mt-2 text-sm text-slate-500">
              Enter the confirmation or transaction
              reference provided by your payment
              provider.
            </p>
          </div>

          {paymentError && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {paymentError}
            </div>
          )}

          {paymentSuccess && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              Deposit payment recorded successfully.
              Amount paid: USD{" "}
              {deposit.toFixed(2)}.
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
                !booking.paymentMethod ||
                !paymentReference.trim()
              }
              onClick={handlePayment}
              className="mt-8 w-full rounded-full bg-sky-500 py-4 text-lg font-bold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting
                ? "Preparing Booking / Recording Payment..."
                : `Pay Deposit — USD ${deposit.toFixed(2)}`}
            </button>
          )}
        </>
      )}
    </div>
  );
}