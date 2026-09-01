"use client";

type RevenueTargetStrategyProps = {
  monthlyTarget: number;
  planningDays: number;
  bookedRevenue: number;
  averageBookingValue: number;
  serviceRevenue: Record<string, number>;
  serviceBookingCounts: Record<string, number>;
};

export default function RevenueTargetStrategy({
  monthlyTarget,
  planningDays,
  bookedRevenue,
  averageBookingValue,
  serviceRevenue,
  serviceBookingCounts,
}: RevenueTargetStrategyProps) {
  const requiredDailyBookedRevenue =
    planningDays > 0
      ? monthlyTarget / planningDays
      : 0;

  const remainingBookedTarget = Math.max(
    monthlyTarget - bookedRevenue,
    0
  );

  const bookingsNeededAtCurrentAverage =
    averageBookingValue > 0
      ? Math.ceil(
          remainingBookedTarget / averageBookingValue
        )
      : 0;

   const currency = (value: number | undefined) =>
  `$${(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
          Revenue Target Strategy
        </p>

        <h3 className="mt-1 text-xl font-black text-slate-900">
          Path to {currency(monthlyTarget)}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Sales planning based on booked revenue and the current average
          booking value.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Planning Days
          </p>

          <p className="mt-1 text-2xl font-black text-slate-900">
            {planningDays}
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Required / Day
          </p>

          <p className="mt-1 text-2xl font-black text-slate-900">
            {currency(requiredDailyBookedRevenue)}
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Booked Revenue Remaining
          </p>

          <p className="mt-1 text-2xl font-black text-slate-900">
            {currency(remainingBookedTarget)}
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Additional Bookings Needed
          </p>

          <p className="mt-1 text-2xl font-black text-slate-900">
            {bookingsNeededAtCurrentAverage}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            at current average booking value
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900">
              Current Average Booking
            </p>

            <p className="text-xs text-slate-500">
              Based on current-month booked revenue
            </p>
          </div>

          <p className="text-xl font-black text-slate-900">
            {currency(averageBookingValue)}
          </p>
        </div>
      </div>
    </div>
  );
}