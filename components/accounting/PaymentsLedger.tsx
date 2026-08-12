"use client";

import { useEffect, useMemo, useState } from "react";

interface PaymentRecord {
  "Booking ID"?: string;
  Total?: string | number;
  Deposit?: string | number;
  Balance?: string | number;
  Status?: string;
  "Amount Paid"?: string | number;
  "Payment Method"?: string;
  "Payment Date"?: string;
  "Payment Reference"?: string;
  "Payment Type"?: string;
}

interface PaymentsResponse {
  success: boolean;
  payments?: PaymentRecord[];
  message?: string;
  error?: string;
}interface PaymentsLedgerProps {
  refreshKey?: number;
}

interface BookingPaymentSummary {
  bookingId: string;
  total: number;
  depositDue: number;
  depositPaid: number;
  balancePaid: number;
  otherPaid: number;
  totalPaid: number;
  outstanding: number;
  status: "Unpaid" | "Partially Paid" | "Paid";
}

function toAmount(
  value: string | number | undefined
): number {
  const amount = Number(value);

  return Number.isFinite(amount) ? amount : 0;
}

function formatCurrency(
  value: number
): string {
  return `$${value.toFixed(2)}`;
}

function getPaymentStatus(
  totalPaid: number,
  total: number
): BookingPaymentSummary["status"] {
  if (totalPaid <= 0) {
    return "Unpaid";
  }

  if (totalPaid >= total) {
    return "Paid";
  }

  return "Partially Paid";
}

function getStatusClasses(
  status: BookingPaymentSummary["status"]
): string {
  switch (status) {
    case "Paid":
      return "bg-green-100 text-green-700";

    case "Partially Paid":
      return "bg-amber-100 text-amber-700";

    case "Unpaid":
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function PaymentsLedger({
  refreshKey = 0,
}: PaymentsLedgerProps) { 
  const [payments, setPayments] = useState<
    PaymentRecord[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadPayments() {
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

        const data: PaymentsResponse =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ??
              data.error ??
              "Unable to load payments."
          );
        }

        setPayments(
          Array.isArray(data.payments)
            ? data.payments
            : []
        );
      } catch (err) {
        console.error(
          "Payments ledger load error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load payments."
        );
      } finally {
        setLoading(false);
      }
    }

    loadPayments();
  }, [refreshKey]);

  const bookingSummaries =
    useMemo<BookingPaymentSummary[]>(
      () => {
        const grouped =
          new Map<
            string,
            BookingPaymentSummary
          >();

        for (const payment of payments) {
          const bookingId =
            payment["Booking ID"]
              ?.trim() ?? "";

          if (!bookingId) {
            continue;
          }

          const total = toAmount(
            payment.Total
          );

          const depositDue = toAmount(
            payment.Deposit
          );

          const balance = toAmount(
            payment.Balance
          );

          const amountPaid = toAmount(
            payment["Amount Paid"]
          );

          if (!grouped.has(bookingId)) {
            grouped.set(bookingId, {
              bookingId,
              total,
              depositDue,
              depositPaid: 0,
              balancePaid: 0,
              otherPaid: 0,
              totalPaid: 0,
              outstanding: total,
              status: "Unpaid",
            });
          }

          const summary =
            grouped.get(bookingId)!;

          /*
           * Keep the most complete financial
           * values found for the booking.
           */
          if (total > 0) {
            summary.total = total;
          }

          if (depositDue > 0) {
            summary.depositDue =
              depositDue;
          }

          const paymentType =
            payment["Payment Type"]
              ?.trim()
              .toLowerCase();

          if (
            paymentType ===
            "deposit"
          ) {
            summary.depositPaid +=
              amountPaid;
          } else if (
            paymentType ===
            "balance"
          ) {
            summary.balancePaid +=
              amountPaid;
          } else {
            summary.otherPaid +=
              amountPaid;
          }

          summary.totalPaid =
            summary.depositPaid +
            summary.balancePaid +
            summary.otherPaid;

          /*
           * Use the booking's financial
           * balance as a fallback only when
           * the total is unavailable.
           */
          if (
            summary.total <= 0 &&
            balance >= 0
          ) {
            summary.outstanding =
              balance;
          } else {
            summary.outstanding =
              Math.max(
                summary.total -
                  summary.totalPaid,
                0
              );
          }

          summary.status =
            getPaymentStatus(
              summary.totalPaid,
              summary.total
            );
        }

        return Array.from(
          grouped.values()
        ).sort((a, b) =>
          a.bookingId.localeCompare(
            b.bookingId
          )
        );
      },
      [payments]
    );

  const totals = useMemo(() => {
    return bookingSummaries.reduce(
      (result, booking) => {
        result.bookingTotal +=
          booking.total;

        result.depositDue +=
          booking.depositDue;

        result.depositPaid +=
          booking.depositPaid;

        result.balancePaid +=
          booking.balancePaid;

        result.otherPaid +=
          booking.otherPaid;

        result.totalPaid +=
          booking.totalPaid;

        result.outstanding +=
          booking.outstanding;

        return result;
      },
      {
        bookingTotal: 0,
        depositDue: 0,
        depositPaid: 0,
        balancePaid: 0,
        otherPaid: 0,
        totalPaid: 0,
        outstanding: 0,
      }
    );
  }, [bookingSummaries]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">
            Payments Ledger
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Payment totals and outstanding
            balances by booking.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Total Payments Received
          </p>

          <p className="mt-1 text-2xl font-black text-slate-900">
            {formatCurrency(
              totals.totalPaid
            )}
          </p>
        </div>
      </div>

      {loading && (
        <div className="mt-8 rounded-2xl border border-slate-200 p-6 text-sm text-slate-600">
          Loading payment transactions...
        </div>
      )}

      {!loading && error && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        bookingSummaries.length ===
          0 && (
          <div className="mt-8 rounded-2xl border border-slate-200 p-6 text-sm text-slate-600">
            No payment transactions have
            been recorded yet.
          </div>
        )}

      {!loading &&
        !error &&
        bookingSummaries.length > 0 && (
          <>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Booking Value
                </p>

                <p className="mt-1 text-xl font-black text-slate-900">
                  {formatCurrency(
                    totals.bookingTotal
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total Paid
                </p>

                <p className="mt-1 text-xl font-black text-slate-900">
                  {formatCurrency(
                    totals.totalPaid
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Outstanding
                </p>

                <p className="mt-1 text-xl font-black text-slate-900">
                  {formatCurrency(
                    totals.outstanding
                  )}
                </p>
              </div>
            </div>

            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Booking ID
                    </th>

                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Total
                    </th>

                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Deposit Due
                    </th>

                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Deposit Paid
                    </th>

                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Balance Paid
                    </th>

                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Other
                    </th>

                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Total Paid
                    </th>

                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Outstanding
                    </th>

                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Payment Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {bookingSummaries.map(
                    (booking) => (
                      <tr
                        key={
                          booking.bookingId
                        }
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        <td className="px-4 py-4 text-sm font-bold text-slate-900">
                          {booking.bookingId}
                        </td>

                        <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                          {formatCurrency(
                            booking.total
                          )}
                        </td>

                        <td className="px-4 py-4 text-sm text-slate-700">
                          {formatCurrency(
                            booking.depositDue
                          )}
                        </td>

                        <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                          {formatCurrency(
                            booking.depositPaid
                          )}
                        </td>

                        <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                          {formatCurrency(
                            booking.balancePaid
                          )}
                        </td>

                        <td className="px-4 py-4 text-sm text-slate-700">
                          {formatCurrency(
                            booking.otherPaid
                          )}
                        </td>

                        <td className="px-4 py-4 text-sm font-black text-slate-900">
                          {formatCurrency(
                            booking.totalPaid
                          )}
                        </td>

                        <td className="px-4 py-4 text-sm font-black text-slate-900">
                          {formatCurrency(
                            booking.outstanding
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClasses(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="grid gap-4 text-sm md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Deposits Received
                  </p>

                  <p className="mt-1 font-black text-slate-900">
                    {formatCurrency(
                      totals.depositPaid
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Balances Received
                  </p>

                  <p className="mt-1 font-black text-slate-900">
                    {formatCurrency(
                      totals.balancePaid
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Other Payments
                  </p>

                  <p className="mt-1 font-black text-slate-900">
                    {formatCurrency(
                      totals.otherPaid
                    )}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
    </section>
  );
}