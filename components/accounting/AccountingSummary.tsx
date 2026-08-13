"use client";

import { useEffect, useState } from "react";

interface AccountingSummaryData {
  bookingValue: number;
  paymentsReceived: number;
  outstanding: number;
  depositsReceived: number;
  balancesReceived: number;
  otherPayments: number;
  creditCardReceived: number;
  bankTransferReceived: number;
  bookingCount: number;
  paidBookingCount: number;
  partiallyPaidBookingCount: number;
  unpaidBookingCount: number;
}

interface AccountingResponse {
  success: boolean;
  summary?: AccountingSummaryData;
  message?: string;
  error?: string;
}

interface AccountingSummaryProps {
  refreshKey?: number;
}

function formatCurrency(
  value: number
): string {
  return `USD $${value.toFixed(2)}`;
}

export default function AccountingSummary({
  refreshKey = 0,
}: AccountingSummaryProps) {
  const [summary, setSummary] =
    useState<AccountingSummaryData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/accounting",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data: AccountingResponse =
          await response.json();

        if (
          !response.ok ||
          !data.success ||
          !data.summary
        ) {
          throw new Error(
            data.message ??
              data.error ??
              "Unable to load accounting summary."
          );
        }

        setSummary(data.summary);
      } catch (err) {
        console.error(
          "Accounting summary load error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load accounting summary."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, [refreshKey]);

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-600">
            Accounting
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-900">
            Revenue & Payments
          </h2>
        </div>

        <p className="mt-6 font-semibold text-slate-600">
          Loading accounting summary...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-600">
          Accounting
        </p>

        <h2 className="mt-2 text-2xl font-black text-red-900">
          Revenue & Payments
        </h2>

        <p className="mt-4 text-red-700">
          {error}
        </p>
      </section>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-600">
          Accounting
        </p>

        <h2 className="mt-2 text-2xl font-black text-slate-900">
          Revenue & Payments
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Current booking value, payments received,
          and outstanding receivables.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-500">
            Booking Value
          </p>

          <p className="mt-2 text-3xl font-black text-slate-900">
            {formatCurrency(
              summary.bookingValue
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-500">
            Payments Received
          </p>

          <p className="mt-2 text-3xl font-black text-slate-900">
            {formatCurrency(
              summary.paymentsReceived
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-500">
            Outstanding
          </p>

          <p className="mt-2 text-3xl font-black text-slate-900">
            {formatCurrency(
              summary.outstanding
            )}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-6">
          <h3 className="font-black text-slate-900">
            Payment Breakdown
          </h3>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">
                Deposits Received
              </span>

              <span className="font-bold text-slate-900">
                {formatCurrency(
                  summary.depositsReceived
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600">
                Balances Received
              </span>

              <span className="font-bold text-slate-900">
                {formatCurrency(
                  summary.balancesReceived
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600">
                Other Payments
              </span>

              <span className="font-bold text-slate-900">
                {formatCurrency(
                  summary.otherPayments
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-6">
          <h3 className="font-black text-slate-900">
            Payment Methods
          </h3>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">
                Credit Card
              </span>

              <span className="font-bold text-slate-900">
                {formatCurrency(
                  summary.creditCardReceived
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600">
                Bank Transfer
              </span>

              <span className="font-bold text-slate-900">
                {formatCurrency(
                  summary.bankTransferReceived
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 p-6">
        <h3 className="font-black text-slate-900">
          Booking Payment Status
        </h3>

        <div className="mt-5 grid gap-4 sm:grid-cols-4">
          <div>
            <p className="text-sm text-slate-500">
              Total Bookings
            </p>

            <p className="mt-1 text-2xl font-black text-slate-900">
              {summary.bookingCount}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Paid
            </p>

            <p className="mt-1 text-2xl font-black text-green-700">
              {summary.paidBookingCount}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Partially Paid
            </p>

            <p className="mt-1 text-2xl font-black text-amber-600">
              {summary.partiallyPaidBookingCount}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Unpaid
            </p>

            <p className="mt-1 text-2xl font-black text-red-600">
              {summary.unpaidBookingCount}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}