"use client";

import { useState } from "react";

type PaymentMethod =
  | "Credit Card"
  | "Bank Transfer";

type PaymentType =
  | "Deposit"
  | "Balance"
  | "Other";

interface PaymentRecorderProps {
  bookingReference?: string;
  total?: number;
  deposit?: number;
  balance?: number;
  onPaymentRecorded?: () => void;
}

interface PaymentResponse {
  success?: boolean;
  message?: string;
  error?: string;
  bookingReference?: string;
  amountPaid?: number;
  paymentMethod?: string;
  paymentType?: string;
  paymentReference?: string;
}

export default function PaymentRecorder({
  bookingReference = "",
  total,
  deposit,
  balance,
  onPaymentRecorded,
}: PaymentRecorderProps) {
  const [amountPaid, setAmountPaid] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("Credit Card");

  const [paymentType, setPaymentType] =
    useState<PaymentType>("Deposit");

  const [paymentDate, setPaymentDate] =
    useState("");

  const [paymentReference, setPaymentReference] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    const normalizedBookingReference =
      bookingReference.trim();

    const parsedAmount =
      Number(amountPaid);

    const normalizedPaymentReference =
      paymentReference.trim();

    if (!normalizedBookingReference) {
      setError(
        "A booking reference is required."
      );
      return;
    }

    if (
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    ) {
      setError(
        "Enter a valid payment amount greater than zero."
      );
      return;
    }

    if (!normalizedPaymentReference) {
      setError(
        "Payment reference is required."
      );
      return;
    }

    try {
      setSaving(true);

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
            bookingReference:
              normalizedBookingReference,
            amountPaid:
              parsedAmount,
            paymentMethod,
            paymentDate,
            paymentReference:
              normalizedPaymentReference,
            paymentType,
          }),
        }
      );

      const data: PaymentResponse =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ??
            data.error ??
            "Unable to record payment."
        );
      }

      setMessage(
        `Payment of USD $${parsedAmount.toFixed(
          2
        )} recorded successfully.`
      );

      setAmountPaid("");
      setPaymentDate("");
      setPaymentReference("");

      onPaymentRecorded?.();
    } catch (err) {
      console.error(
        "Payment recording error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to record payment."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div>
        <h2 className="text-2xl font-black text-slate-900">
          Record Payment
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Record a payment transaction for this
          booking.
        </p>
      </div>

      <div className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Booking
          </p>

          <p className="mt-1 font-bold text-slate-900">
            {bookingReference || "Not selected"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Total
          </p>

          <p className="mt-1 font-bold text-slate-900">
            {typeof total === "number"
              ? `USD $${total.toFixed(2)}`
              : "—"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Outstanding
          </p>

          <p className="mt-1 font-bold text-slate-900">
            {typeof balance === "number"
              ? `USD $${balance.toFixed(2)}`
              : "—"}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6"
      >
        <div>
          <label
            htmlFor="paymentAmount"
            className="mb-2 block font-semibold text-slate-900"
          >
            Amount Paid
          </label>

          <input
            id="paymentAmount"
            type="number"
            min="0.01"
            step="0.01"
            value={amountPaid}
            onChange={(event) =>
              setAmountPaid(
                event.target.value
              )
            }
            placeholder="0.00"
            className="w-full rounded-xl border border-slate-300 p-4 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="paymentMethod"
              className="mb-2 block font-semibold text-slate-900"
            >
              Payment Method
            </label>

            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(event) =>
                setPaymentMethod(
                  event.target
                    .value as PaymentMethod
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white p-4 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
              <option value="Credit Card">
                Credit Card
              </option>

              <option value="Bank Transfer">
                Bank Transfer
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="paymentType"
              className="mb-2 block font-semibold text-slate-900"
            >
              Payment Type
            </label>

            <select
              id="paymentType"
              value={paymentType}
              onChange={(event) =>
                setPaymentType(
                  event.target
                    .value as PaymentType
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white p-4 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
              <option value="Deposit">
                Deposit
              </option>

              <option value="Balance">
                Balance
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="paymentDate"
              className="mb-2 block font-semibold text-slate-900"
            >
              Payment Date
            </label>

            <input
              id="paymentDate"
              type="date"
              value={paymentDate}
              onChange={(event) =>
                setPaymentDate(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 p-4 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div>
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
              onChange={(event) =>
                setPaymentReference(
                  event.target.value
                )
              }
              placeholder="Transaction reference"
              className="w-full rounded-xl border border-slate-300 p-4 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={
            saving ||
            !bookingReference.trim()
          }
          className="w-full rounded-full bg-sky-600 py-4 font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {saving
            ? "Recording Payment..."
            : "Record Payment"}
        </button>
      </form>
    </section>
  );
}