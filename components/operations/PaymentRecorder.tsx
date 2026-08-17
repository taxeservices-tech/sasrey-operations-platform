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
  totalPaid?: number;
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
  totalPaid = 0,
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
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to record payment.";

      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  }

    const normalizedTotal =
    typeof total === "number"
      ? Math.max(total, 0)
      : 0;

  const normalizedPaid =
    Math.min(
      Math.max(
        typeof totalPaid === "number"
          ? totalPaid
          : 0,
        0
      ),
      normalizedTotal
    );

  const outstanding =
    Math.max(
      normalizedTotal -
        normalizedPaid,
      0
    );

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

      <div className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-4">
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
            Total Paid
          </p>

          <p className="mt-1 font-bold text-slate-900">
            {typeof totalPaid === "number"
              ? `USD $${totalPaid.toFixed(2)}`
              : "—"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Outstanding
          </p>

          <p className="mt-1 font-bold text-slate-900">
            {typeof total === "number"
              ? `USD $${outstanding.toFixed(2)}`
              : typeof balance === "number"
              ? `USD $${balance.toFixed(2)}`
              : "—"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Deposit Required
          </p>

          <p className="mt-1 text-lg font-bold text-slate-900">
            {typeof deposit === "number"
              ? `USD $${deposit.toFixed(2)}`
              : "—"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Balance Required
          </p>

          <p className="mt-1 text-lg font-bold text-slate-900">
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
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="paymentAmount"
              className="block text-sm font-semibold text-slate-700"
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
              className="mt-2 w-full rounded-xl border border-slate-300 p-4"
              placeholder="0.00"
              disabled={saving}
            />
          </div>

          <div>
            <label
              htmlFor="paymentDate"
              className="block text-sm font-semibold text-slate-700"
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
              className="mt-2 w-full rounded-xl border border-slate-300 p-4"
              disabled={saving}
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-700">
            Payment Method
          </p>

          <div className="mt-3 flex flex-wrap gap-6">
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="paymentMethod"
                value="Credit Card"
                checked={
                  paymentMethod ===
                  "Credit Card"
                }
                onChange={() =>
                  setPaymentMethod(
                    "Credit Card"
                  )
                }
                disabled={saving}
              />

              <span>Credit Card</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="paymentMethod"
                value="Bank Transfer"
                checked={
                  paymentMethod ===
                  "Bank Transfer"
                }
                onChange={() =>
                  setPaymentMethod(
                    "Bank Transfer"
                  )
                }
                disabled={saving}
              />

              <span>Bank Transfer</span>
            </label>
          </div>
        </div>

        <div>
          <label
            htmlFor="paymentType"
            className="block text-sm font-semibold text-slate-700"
          >
            Payment Type
          </label>

          <select
            id="paymentType"
            value={paymentType}
            onChange={(event) =>
              setPaymentType(
                event.target.value as PaymentType
              )
            }
            className="mt-2 w-full rounded-xl border border-slate-300 p-4"
            disabled={saving}
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

        <div>
          <label
            htmlFor="paymentReference"
            className="block text-sm font-semibold text-slate-700"
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
            className="mt-2 w-full rounded-xl border border-slate-300 p-4"
            placeholder="Enter transaction reference"
            disabled={saving}
          />
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
          disabled={saving}
          className="w-full rounded-full bg-slate-900 py-4 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? "Recording Payment..."
            : "Record Payment"}
        </button>
      </form>
    </section>
  );
}