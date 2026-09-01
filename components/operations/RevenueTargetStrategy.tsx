"use client";
const SERVICE_TARGET_MIX = [
  {
    name: "Airport Transfers",
    percentage: 0.15,
  },
  {
    name: "Hotel Transfers",
    percentage: 0.10,
  },
  {
    name: "Private Tours",
    percentage: 0.25,
  },
  {
    name: "Full-Day Tours",
    percentage: 0.30,
  },
  {
    name: "Custom/Private Excursions",
    percentage: 0.20,
  },
];
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
   const serviceRows = Object.entries(serviceRevenue)
    .map(([service, revenue]) => {
      const bookingCount =
        serviceBookingCounts[service] || 0;

      const averageValue =
        bookingCount > 0
          ? revenue / bookingCount
          : 0;

      return {
        service,
        revenue,
        bookingCount,
        averageValue,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
     const strategicServiceTargets =
    SERVICE_TARGET_MIX.map((target) => {
      const targetRevenue =
        monthlyTarget * target.percentage;

            const normalizeServiceName = (value: string) =>
        value
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .replace(/s$/, "");

      const matchingService = serviceRows.find(
        (row) =>
          normalizeServiceName(row.service) ===
          normalizeServiceName(target.name)
      );

      const averageValue =
        matchingService?.averageValue ||
        averageBookingValue;

      const bookingsNeeded =
        averageValue > 0
          ? Math.ceil(
              targetRevenue / averageValue
            )
          : 0;

      const currentRevenue =
        matchingService?.revenue || 0;

      return {
        ...target,
        targetRevenue,
        currentRevenue,
        averageValue,
        bookingsNeeded,
      };
    });
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
          <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-4">
          <p className="text-sm font-bold text-slate-900">
            Service Performance
          </p>

          <p className="text-xs text-slate-500">
            Current-month revenue, booking volume, and average value by service.
          </p>
        </div>

        {serviceRows.length === 0 ? (
          <p className="text-sm text-slate-500">
            No service performance data is available yet.
          </p>
        ) : (
          <div className="space-y-3">
            {serviceRows.map(
              ({
                service,
                revenue,
                bookingCount,
                averageValue,
              }) => {
                const revenueShare =
                  bookedRevenue > 0
                    ? (revenue / bookedRevenue) * 100
                    : 0;

                return (
                  <div
                    key={service}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-bold text-slate-900">
                          {service}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {bookingCount} booking
                          {bookingCount === 1 ? "" : "s"}
                          {" · "}
                          {revenueShare.toFixed(1)}% of booked revenue
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-right">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Revenue
                          </p>

                          <p className="font-black text-slate-900">
                            {currency(revenue)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Avg. Booking
                          </p>

                          <p className="font-black text-slate-900">
                            {currency(averageValue)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
}