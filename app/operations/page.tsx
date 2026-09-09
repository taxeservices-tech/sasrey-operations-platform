"use client";
import { useEffect, useMemo, useState } from "react";
import DispatchStatusBadge from "@/components/operations/DispatchStatusBadge";
import PaymentRecorder from "@/components/operations/PaymentRecorder";
import PaymentsLedger from "@/components/accounting/PaymentsLedger";
import AccountingSummary from "@/components/accounting/AccountingSummary";
import SignOutButton from "@/components/auth/SignOutButton";

interface BookingRecord {
  "Booking ID": string;
  Status: string;
  "Customer Name": string;
  Email: string;
  Phone: string | number;
  Pickup: string;
  Destination: string;
  "Pickup Date": string;
  "Pickup Time": string;
  Passengers: string | number;
  "Flight Number": string;
  "Service Type": string;
  "Special Requests": string;
  Hotel: string;
  Vehicle: string;
  "Route ID": string;
  "Price USD": string | number;
  Deposit: string | number;
  Balance: string | number;
}

interface BookingsResponse {
  success: boolean;
  bookings?: BookingRecord[];
  message?: string;
  error?: string;
}
interface DispatchRecord {
  "Dispatch ID": string;
  "Booking ID": string;
  "Dispatch Status": string;
  "Driver ID": string;
  "Driver Name": string;
  "Vehicle ID": string;
  Vehicle: string;
  "Pickup Date": string;
  "Pickup Time": string;
  Pickup: string;
  Destination: string;
  Passengers: string | number;
  "Assigned At": string;
  "En Route At": string;
  "Passenger Onboard At": string;
  "Completed At": string;
  "Cancelled At": string;
  Notes: string;
}

interface DispatchResponse {
  success: boolean;
  dispatches?: DispatchRecord[];
  message?: string;
  error?: string;
}

interface AccountingPayment {
  "Booking ID"?: string;
  Total?: string | number;
  "Amount Paid"?: string | number;
}
interface SettingsResponse {
  success: boolean;
  settings?: Record<string, string>;
  message?: string;
  error?: string;
}

interface AccountingResponse {
  success: boolean;
  payments?: AccountingPayment[];
  message?: string;
  error?: string;
}

type PaymentStatus =
  | "Paid"
  | "Deposit Paid"
  | "Partially Paid"
  | "Unpaid";

interface BookingFinancial {
  total: number;
  paid: number;
  outstanding: number;
  status: PaymentStatus;
}

type SortOption =
  | "pickup-asc"
  | "pickup-desc"
  | "customer-asc"
  | "customer-desc"
  | "status-pending"
  | "status-confirmed"
  | "price-asc"
  | "price-desc";

function formatDate(value: string): string {
  return value || "";
}

function formatTime(value: string): string {
  return value || "";
}

function formatCurrency(
  value: string | number
): string {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return "";
  }

  return `$${amount.toFixed(2)}`;
}

function toAmount(
  value: string | number | undefined
): number {
  const amount = Number(value);

  return Number.isFinite(amount)
    ? amount
    : 0;
}
function roundCurrency(
  value: number
): number {
  return (
    Math.round(
      (value + Number.EPSILON) * 100
    ) / 100
  );
}

function getPaymentStatus(
  total: number,
  paid: number
): PaymentStatus {
  const normalizedTotal =
    roundCurrency(Math.max(total, 0));

  const normalizedPaid =
    roundCurrency(Math.max(paid, 0));

  const requiredDeposit =
    roundCurrency(normalizedTotal * 0.25);

  if (
    normalizedTotal > 0 &&
    normalizedPaid >= normalizedTotal
  ) {
    return "Paid";
  }

  if (
    normalizedTotal > 0 &&
    normalizedPaid >= requiredDeposit
  ) {
    return "Deposit Paid";
  }

  if (normalizedPaid > 0) {
    return "Partially Paid";
  }

  return "Unpaid";
}

function getPaymentStatusClasses(
  status: PaymentStatus
): string {
  switch (status) {
    case "Paid":
      return "bg-green-100 text-green-700";

    case "Deposit Paid":
      return "bg-blue-100 text-blue-700";

    case "Partially Paid":
      return "bg-amber-100 text-amber-700";

    case "Unpaid":
    default:
      return "bg-slate-100 text-slate-700";
  }
}
function getBookingFinancial(
  booking: BookingRecord,
  financialByBookingId: Map<
    string,
    BookingFinancial
  >
): BookingFinancial {
  const existing =
    financialByBookingId.get(
      booking["Booking ID"]
    );

  if (existing) {
    return existing;
  }

  const total = roundCurrency(
    Math.max(
      toAmount(booking["Price USD"]),
      0
    )
  );

  return {
    total,
    paid: 0,
    outstanding: total,
    status: getPaymentStatus(total, 0),
  };
}

function isValidBooking(
  booking: BookingRecord
): boolean {
  return Boolean(
    booking["Booking ID"]?.trim() &&
      booking["Customer Name"]?.trim()
  );
}

function getStatusClasses(
  status: string
): string {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "bg-green-100 text-green-700";

    case "cancelled":
      return "bg-red-100 text-red-700";

    case "completed":
      return "bg-blue-100 text-blue-700";

    case "pending":
    default:
      return "bg-amber-100 text-amber-700";
  }
}

function getStatusPriority(
  status: string
): number {
  switch (status.toLowerCase()) {
    case "pending":
      return 1;

    case "confirmed":
      return 2;

    case "completed":
      return 3;

    case "cancelled":
      return 4;

    default:
      return 5;
  }
}

function getConfirmedFirstPriority(
  status: string
): number {
  switch (status.toLowerCase()) {
    case "confirmed":
      return 1;

    case "pending":
      return 2;

    case "completed":
      return 3;

    case "cancelled":
      return 4;

    default:
      return 5;
  }

}

function getPickupTimestamp(
  booking: BookingRecord
): number {
  const date =
    booking["Pickup Date"]?.trim() ?? "";

  const time =
    booking["Pickup Time"]?.trim() ?? "";

  if (!date) {
    return Number.MAX_SAFE_INTEGER;
  }

  const timestamp = new Date(
    `${date} ${time}`
  ).getTime();

  if (Number.isNaN(timestamp)) {
    return Number.MAX_SAFE_INTEGER;
  }

  return timestamp;
}
function getDispatchForBooking(
  bookingId: string,
  dispatches: DispatchRecord[]
): DispatchRecord | undefined {
  return dispatches.find(
    (dispatch) =>
      dispatch["Booking ID"] === bookingId
  );
}

export default function OperationsPage() {
  const [bookings, setBookings] = useState<
    BookingRecord[]
  >([]);
const [dispatches, setDispatches] =
  useState<DispatchRecord[]>([]);
  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  const [
    updatingBookingId,
    setUpdatingBookingId,
  ] = useState<string | null>(null);

  const [
    selectedBooking,
    setSelectedBooking,
  ] = useState<BookingRecord | null>(
    null
  );

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [
    paymentStatusFilter,
    setPaymentStatusFilter,
  ] = useState("All");

  const [
    financialByBookingId,
    setFinancialByBookingId,
  ] = useState<Map<string, BookingFinancial>>(
    new Map()
  );
  const [settings, setSettings] = useState<Record<string, string>>({});

  const [sortOption, setSortOption] =
    useState<SortOption>("pickup-asc");

  const [
    paymentRefreshKey,
    setPaymentRefreshKey,
  ] = useState(0);

  useEffect(() => {
    async function loadOperationsData() {
      try {
        setLoading(true);
        setError("");
        const [
          bookingsResponse,
          accountingResponse,
          dispatchResponse,
          settingsResponse,
        ] = await Promise.all([
          fetch("/api/bookings", {
            method: "GET",
            cache: "no-store",
          }),
          fetch("/api/accounting", {
            method: "GET",
            cache: "no-store",
          }),
          fetch(
            "/api/dispatch?action=listDispatch",
            {
              method: "GET",
              cache: "no-store",
            }
          ),
          fetch(
            "/api/dispatch?action=getSettings",
            {
              method: "GET",
              cache: "no-store",
            }
          ),
        ]);

        const bookingsData: BookingsResponse =
          await bookingsResponse.json();

        if (
          !bookingsResponse.ok ||
          !bookingsData.success
        ) {
          throw new Error(
            bookingsData.message ??
              bookingsData.error ??
              "Unable to load bookings."
          );
        }

        const accountingData: AccountingResponse =
          await accountingResponse.json();
        const settingsData: SettingsResponse =
          await settingsResponse.json();
        if (
          !settingsResponse.ok ||
          !settingsData.success
        ) {
          throw new Error(
            settingsData.message ??
              settingsData.error ??
              "Unable to load settings."
          );
        }

        const dispatchData: DispatchResponse =
          await dispatchResponse.json();

        if (
          !dispatchResponse.ok ||
          !dispatchData.success
        ) {
          throw new Error(
            dispatchData.message ??
              dispatchData.error ??
              "Unable to load dispatch data."
          );
        }

        if (
          !accountingResponse.ok ||
          !accountingData.success
        ) {
          throw new Error(
            accountingData.message ??
              accountingData.error ??
              "Unable to load accounting data."
          );
        }

        const validBookings = (
          bookingsData.bookings ?? []
        ).filter(isValidBooking);

        const financialMap =
          new Map<string, BookingFinancial>();

        for (
          const payment of accountingData.payments ?? []
        ) {
          const bookingId =
            payment["Booking ID"]?.trim() ?? "";

          if (!bookingId) {
            continue;
          }

          const total = toAmount(payment.Total);
          const amountPaid = toAmount(
            payment["Amount Paid"]
          );

          const existing =
            financialMap.get(bookingId);

          if (!existing) {
            financialMap.set(bookingId, {
              total: roundCurrency(Math.max(total, 0)),
              paid: roundCurrency(Math.max(amountPaid, 0)),
              outstanding: 0,
              status: "Unpaid",
            });
          } else {
            if (total > 0) {
              existing.total = roundCurrency(total);
            }

            existing.paid = roundCurrency(
              existing.paid + Math.max(amountPaid, 0)
            );
          }
        }

        for (const booking of validBookings) {
          const bookingId = booking["Booking ID"];
          const existing = financialMap.get(bookingId);

          const total =
            existing && existing.total > 0
              ? existing.total
              : roundCurrency(
                  Math.max(
                    toAmount(booking["Price USD"]),
                    0
                  )
                );

          const paid = roundCurrency(
            Math.min(Math.max(existing?.paid ?? 0, 0), total)
          );

          financialMap.set(bookingId, {
            total,
            paid,
            outstanding: roundCurrency(
              Math.max(total - paid, 0)
            ),
            status: getPaymentStatus(total, paid),
          });
        }

        setBookings(validBookings);
        setDispatches(
          dispatchData.dispatches ?? []
        );
        setFinancialByBookingId(financialMap);
        setSettings(settingsData.settings ?? {});

      } catch (err) {
        console.error(
          "Operations data load error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load operations data."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOperationsData();
  }, [paymentRefreshKey]);

  async function updateBookingStatus(
    bookingReference: string,
    status: string
  ) {
    try {
      setUpdatingBookingId(
        bookingReference
      );

      setError("");

      const response = await fetch(
        "/api/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action: "updateStatus",
            bookingReference,
            status,
          }),
        }
      );

      const data: {
        success?: boolean;
        message?: string;
        error?: string;
      } = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ??
            data.error ??
            "Unable to update booking status."
        );
      }

      setBookings(
        (currentBookings) =>
          currentBookings.map(
            (booking) =>
              booking["Booking ID"] ===
              bookingReference
                ? {
                    ...booking,
                    Status: status,
                  }
                : booking
          )
      );

      setSelectedBooking(
        (currentBooking) =>
          currentBooking &&
          currentBooking["Booking ID"] ===
            bookingReference
            ? {
                ...currentBooking,
                Status: status,
              }
            : currentBooking
      );
    } catch (err) {
      console.error(
        "Booking status update error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update booking status."
      );
    } finally {
      setUpdatingBookingId(null);
    }
  }

  const kpiMetrics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const isCurrentMonth = (value: string): boolean => {
      if (!value) return false;

      const date = new Date(value);

      return (
        !Number.isNaN(date.getTime()) &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    };

    const currentMonthBookings = bookings.filter(
      (booking) =>
        isCurrentMonth(booking["Pickup Date"])
    );

    const revenueBooked = roundCurrency(
      currentMonthBookings.reduce(
        (sum, booking) =>
          sum +
          getBookingFinancial(
            booking,
            financialByBookingId
          ).total,
        0
      )
    );

    const revenueCollected = roundCurrency(
      currentMonthBookings.reduce(
        (sum, booking) =>
          sum +
          getBookingFinancial(
            booking,
            financialByBookingId
          ).paid,
        0
      )
    );

    const outstandingRevenue = roundCurrency(
      Math.max(revenueBooked - revenueCollected, 0)
    );

    const bookingCount = currentMonthBookings.length;

    const averageBookingValue =
      bookingCount > 0
        ? roundCurrency(revenueBooked / bookingCount)
        : 0;

    const serviceMix = new Map<
      string,
      { bookingCount: number; revenue: number }
    >();

    for (const booking of currentMonthBookings) {
      const serviceType =
        String(booking["Service Type"] ?? "").trim() ||
        "Unspecified";

      const financial = getBookingFinancial(
        booking,
        financialByBookingId
      );

      const existing = serviceMix.get(serviceType);

      if (existing) {
        existing.bookingCount += 1;
        existing.revenue = roundCurrency(
          existing.revenue + financial.total
        );
      } else {
        serviceMix.set(serviceType, {
          bookingCount: 1,
          revenue: financial.total,
        });
      }
    }

    const serviceMixRows = Array.from(
      serviceMix.entries()
    )
      .map(([serviceType, values]) => ({
        serviceType,
        bookingCount: values.bookingCount,
        revenue: roundCurrency(values.revenue),
        revenuePercentage:
          revenueBooked > 0
            ? roundCurrency(
                (values.revenue / revenueBooked) * 100
              )
            : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const topService = serviceMixRows[0] ?? {
      serviceType: "None",
      bookingCount: 0,
      revenue: 0,
      revenuePercentage: 0,
    };


    const destinationMix = new Map<
      string,
      { bookingCount: number; revenue: number }
    >();

    for (const booking of currentMonthBookings) {
      const destination =
        String(booking.Destination ?? "").trim() ||
        "Unspecified";

      const financial = getBookingFinancial(
        booking,
        financialByBookingId
      );

      const existing = destinationMix.get(destination);

      if (existing) {
        existing.bookingCount += 1;
        existing.revenue = roundCurrency(
          existing.revenue + financial.total
        );
      } else {
        destinationMix.set(destination, {
          bookingCount: 1,
          revenue: financial.total,
        });
      }
    }

    const destinationMixRows = Array.from(
      destinationMix.entries()
    )
      .map(([destination, values]) => ({
        destination,
        bookingCount: values.bookingCount,
        revenue: roundCurrency(values.revenue),
        revenuePercentage:
          revenueBooked > 0
            ? roundCurrency(
                (values.revenue / revenueBooked) * 100
              )
            : 0,
        averageBookingValue:
          values.bookingCount > 0
            ? roundCurrency(
                values.revenue / values.bookingCount
              )
            : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const topDestination =
      destinationMixRows[0] ?? {
        destination: "None",
        bookingCount: 0,
        revenue: 0,
        revenuePercentage: 0,
        averageBookingValue: 0,
      };



    const destinationServiceMix = new Map<
      string,
      {
        destination: string;
        serviceType: string;
        bookingCount: number;
        revenue: number;
      }
    >();

    for (const booking of currentMonthBookings) {
      const destination =
        String(booking.Destination ?? "").trim() ||
        "Unspecified";

      const serviceType =
        String(booking["Service Type"] ?? "").trim() ||
        "Unspecified";

      const financial = getBookingFinancial(
        booking,
        financialByBookingId
      );

      const key = `${destination}::${serviceType}`;
      const existing = destinationServiceMix.get(key);

      if (existing) {
        existing.bookingCount += 1;
        existing.revenue = roundCurrency(
          existing.revenue + financial.total
        );
      } else {
        destinationServiceMix.set(key, {
          destination,
          serviceType,
          bookingCount: 1,
          revenue: financial.total,
        });
      }
    }

    const destinationServiceMixRows =
      Array.from(destinationServiceMix.values())
        .map((values) => ({
          destination: values.destination,
          serviceType: values.serviceType,
          bookingCount: values.bookingCount,
          revenue: roundCurrency(values.revenue),
          revenuePercentage:
            revenueBooked > 0
              ? roundCurrency(
                  (values.revenue / revenueBooked) * 100
                )
              : 0,
          averageBookingValue:
            values.bookingCount > 0
              ? roundCurrency(
                  values.revenue / values.bookingCount
                )
              : 0,
        }))
        .sort((a, b) => b.revenue - a.revenue);

    const topDestinationService =
      destinationServiceMixRows[0] ?? {
        destination: "None",
        serviceType: "None",
        bookingCount: 0,
        revenue: 0,
        revenuePercentage: 0,
        averageBookingValue: 0,
      };



    const destinationOpportunityRows =
      destinationMixRows
        .map((destination, index) => ({
          ...destination,
          revenueRank: index + 1,
        }))
        .sort((a, b) => b.bookingCount - a.bookingCount)
        .map((destination, index) => ({
          ...destination,
          volumeRank: index + 1,
        }))
        .sort(
          (a, b) =>
            b.averageBookingValue -
            a.averageBookingValue
        )
        .map((destination, index) => ({
          ...destination,
          averageValueRank: index + 1,
        }))
        .sort((a, b) => a.revenueRank - b.revenueRank);


    const currentMonthDispatches = dispatches.filter(
      (dispatch) =>
        isCurrentMonth(dispatch["Pickup Date"])
    );

    const completedTrips = currentMonthDispatches.filter(
      (dispatch) =>
        dispatch["Dispatch Status"] === "Completed"
    ).length;

    const activeTrips = currentMonthDispatches.filter(
      (dispatch) =>
        [
          "Assigned",
          "En Route",
          "Passenger Onboard",
          "Incident",
        ].includes(dispatch["Dispatch Status"])
    ).length;

    const incidentCount = currentMonthDispatches.filter(
      (dispatch) =>
        dispatch["Dispatch Status"] === "Incident"
    ).length;

    const monthlyRevenueTarget = toAmount(
      settings["Monthly Revenue Target"]
    );

    const targetCurrency =
      String(settings["Target Currency"] ?? "USD").trim() || "USD";

    const targetPercentage =
      monthlyRevenueTarget > 0
        ? Math.min(
            roundCurrency(
              (revenueBooked / monthlyRevenueTarget) * 100
            ),
            100
          )
        : 0;

    const remainingTarget = roundCurrency(
      Math.max(monthlyRevenueTarget - revenueBooked, 0)
    );

    const daysInCurrentMonth = new Date(
      currentYear,
      currentMonth + 1,
      0
    ).getDate();

    const daysElapsed = Math.min(
      now.getDate(),
      daysInCurrentMonth
    );

    const daysRemaining = Math.max(
      daysInCurrentMonth - daysElapsed,
      0
    );

    const expectedRevenueByToday =
      monthlyRevenueTarget > 0
        ? roundCurrency(
            (monthlyRevenueTarget * daysElapsed) /
              daysInCurrentMonth
          )
        : 0;

    const paceVariance = roundCurrency(
      revenueBooked - expectedRevenueByToday
    );

    const revenuePacePercentage =
      expectedRevenueByToday > 0
        ? roundCurrency(
            (revenueBooked / expectedRevenueByToday) * 100
          )
        : 0;

    const additionalBookingsNeeded =
      remainingTarget > 0 && averageBookingValue > 0
        ? Math.ceil(
            remainingTarget / averageBookingValue
          )
        : 0;

    const requiredDailyRevenue =
      daysRemaining > 0
        ? roundCurrency(
            remainingTarget / daysRemaining
          )
        : remainingTarget;


    return {
      monthlyRevenueTarget,
      targetCurrency,
      revenueBooked,
      revenueCollected,
      outstandingRevenue,
      targetPercentage,
      remainingTarget,
      daysElapsed,
      daysRemaining,
      expectedRevenueByToday,
      paceVariance,
      revenuePacePercentage,
      additionalBookingsNeeded,
      requiredDailyRevenue,
      bookingCount,
      averageBookingValue,
      serviceMixRows,
      topService,
      destinationMixRows,
      topDestination,
      destinationServiceMixRows,
      topDestinationService,
      destinationOpportunityRows,
      completedTrips,
      activeTrips,
      incidentCount,
    };
  }, [
    bookings,
    dispatches,
    financialByBookingId,
    settings,
  ]);

  const filteredBookings = useMemo(() => {
    const normalizedSearch =
      searchTerm.trim().toLowerCase();

    const matchingBookings = bookings.filter(
      (booking) => {
        const financial = getBookingFinancial(
          booking,
          financialByBookingId
        );

        const matchesSearch =
          !normalizedSearch ||
          [
            booking["Booking ID"],
            booking["Customer Name"],
            booking.Pickup,
            booking.Destination,
            booking.Vehicle,
            booking["Route ID"],
            booking["Price USD"],
            booking.Deposit,
            booking.Balance,
            booking.Status,
            financial.status,
            financial.paid,
            financial.outstanding,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesStatus =
          statusFilter === "All" ||
          booking.Status.toLowerCase() ===
            statusFilter.toLowerCase();

        const matchesPaymentStatus =
          paymentStatusFilter === "All" ||
          financial.status === paymentStatusFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPaymentStatus
        );
      }
    );

    return [...matchingBookings].sort((a, b) => {
      switch (sortOption) {
        case "pickup-asc":
          return getPickupTimestamp(a) - getPickupTimestamp(b);

        case "pickup-desc":
          return getPickupTimestamp(b) - getPickupTimestamp(a);

        case "customer-asc":
          return a["Customer Name"].localeCompare(
            b["Customer Name"]
          );

        case "customer-desc":
          return b["Customer Name"].localeCompare(
            a["Customer Name"]
          );

        case "status-pending":
          return getStatusPriority(a.Status) - getStatusPriority(b.Status);

        case "status-confirmed":
          return (
            getConfirmedFirstPriority(a.Status) -
            getConfirmedFirstPriority(b.Status)
          );

        case "price-asc":
          return Number(a["Price USD"]) - Number(b["Price USD"]);

        case "price-desc":
          return Number(b["Price USD"]) - Number(a["Price USD"]);

        default:
          return 0;
      }
    });
  }, [
    bookings,
    financialByBookingId,
    searchTerm,
    statusFilter,
    paymentStatusFilter,
    sortOption,
  ]);

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("All");
    setPaymentStatusFilter("All");
    setSortOption("pickup-asc");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-[1800px]">
      <div className="mb-10">
  <div className="flex flex-wrap items-start justify-between gap-4">
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">
        SASREY Operations
      </p>

      <h1 className="mt-2 text-4xl font-black text-slate-900">
        Booking Records
      </h1>
    </div>

    <SignOutButton />
  </div>

  <p className="mt-3 text-slate-600">
    View current booking records and
    operational details.
  </p>

  <nav className="mt-6 flex flex-wrap gap-3">
    <a
      href="/operations"
      className="rounded-full bg-sky-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-sky-700"
    >
      Booking Records
    </a>

    <a
      href="/dispatch"
      className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-sky-500 hover:text-sky-600"
    >
      Dispatch
    </a>
  </nav>
</div>

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="font-semibold text-slate-700">
              Loading bookings...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="mb-6 rounded-2xl border border-red-300 bg-red-50 p-6">
            <h2 className="font-bold text-red-700">
              Unable to load or update bookings
            </h2>

            <p className="mt-2 text-red-600">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="mb-6">
              <div className="mb-4">
                <h2 className="text-lg font-black text-slate-900">
                  Revenue Performance
                </h2>
                <p className="text-sm text-slate-500">
                  Current month revenue against the configured target
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">Monthly Target</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {formatCurrency(kpiMetrics.monthlyRevenueTarget)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">Revenue Booked</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {formatCurrency(kpiMetrics.revenueBooked)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">Revenue Collected</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {formatCurrency(kpiMetrics.revenueCollected)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">Outstanding Revenue</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {formatCurrency(kpiMetrics.outstandingRevenue)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">Target Achieved</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {kpiMetrics.targetPercentage.toFixed(1)}%
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatCurrency(kpiMetrics.remainingTarget)} remaining
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-6">
              <div className="mb-4">
                <h2 className="text-lg font-black text-slate-900">
                  Target Pace & Sales Gap
                </h2>
                <p className="text-sm text-slate-500">
                  Current month sales pace and revenue required to reach target
                </p>
              </div>

              <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">
                    Expected Revenue by Today
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {formatCurrency(kpiMetrics.expectedRevenueByToday)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Day {kpiMetrics.daysElapsed} of {kpiMetrics.daysElapsed + kpiMetrics.daysRemaining}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">
                    Revenue Pace
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {kpiMetrics.revenuePacePercentage.toFixed(1)}%
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {kpiMetrics.paceVariance >= 0 ? "Ahead" : "Behind"} by{" "}
                    {formatCurrency(Math.abs(kpiMetrics.paceVariance))}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">
                    Required Daily Revenue
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {formatCurrency(kpiMetrics.requiredDailyRevenue)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {kpiMetrics.daysRemaining} day{kpiMetrics.daysRemaining === 1 ? "" : "s"} remaining
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">
                    Additional Bookings Needed
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {kpiMetrics.additionalBookingsNeeded}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Based on current average booking value
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-6">
              <div className="mb-4">
                <h2 className="text-lg font-black text-slate-900">
                  Service Mix Analysis
                </h2>
                <p className="text-sm text-slate-500">
                  Current month revenue and booking mix by service type
                </p>
              </div>

              <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Top Service
                </p>
                <p className="mt-1 text-2xl font-black text-slate-900">
                  {kpiMetrics.topService.serviceType}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatCurrency(kpiMetrics.topService.revenue)} booked
                  {" · "}
                  {kpiMetrics.topService.bookingCount} booking
                  {kpiMetrics.topService.bookingCount === 1 ? "" : "s"}
                  {" · "}
                  {kpiMetrics.topService.revenuePercentage.toFixed(1)}% of revenue
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                {kpiMetrics.serviceMixRows.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No service activity recorded for the current month.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {kpiMetrics.serviceMixRows.map((service) => (
                      <div
                        key={service.serviceType}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-bold text-slate-900">
                              {service.serviceType}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {service.bookingCount} booking
                              {service.bookingCount === 1 ? "" : "s"}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-black text-slate-900">
                              {formatCurrency(service.revenue)}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-500">
                              {service.revenuePercentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>


            <section className="mb-6">
              <div className="mb-4">
                <h2 className="text-lg font-black text-slate-900">
                  Sales Opportunity Analysis
                </h2>
                <p className="text-sm text-slate-500">
                  Current month revenue and booking performance by destination
                </p>
              </div>

              <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Top Destination
                </p>
                <p className="mt-1 text-2xl font-black text-slate-900">
                  {kpiMetrics.topDestination.destination}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatCurrency(kpiMetrics.topDestination.revenue)} booked
                  {" · "}
                  {kpiMetrics.topDestination.bookingCount} booking
                  {kpiMetrics.topDestination.bookingCount === 1 ? "" : "s"}
                  {" · "}
                  {kpiMetrics.topDestination.revenuePercentage.toFixed(1)}% of revenue
                  {" · "}
                  {formatCurrency(kpiMetrics.topDestination.averageBookingValue)} average
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                {kpiMetrics.destinationMixRows.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No destination activity recorded for the current month.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {kpiMetrics.destinationMixRows.map((destination) => (
                      <div
                        key={destination.destination}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-bold text-slate-900">
                              {destination.destination}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {destination.bookingCount} booking
                              {destination.bookingCount === 1 ? "" : "s"}
                              {" · "}
                              {formatCurrency(destination.averageBookingValue)} average
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-black text-slate-900">
                              {formatCurrency(destination.revenue)}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-500">
                              {destination.revenuePercentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>



            <section className="mb-6">
              <div className="mb-4">
                <h2 className="text-lg font-black text-slate-900">
                  Sales Growth Opportunities
                </h2>
                <p className="text-sm text-slate-500">
                  Compare destination demand, revenue contribution, and booking value
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                {kpiMetrics.destinationOpportunityRows.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No destination activity recorded for the current month.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {kpiMetrics.destinationOpportunityRows.map((destination) => (
                      <div
                        key={destination.destination}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="font-bold text-slate-900">
                              {destination.destination}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {destination.bookingCount} booking
                              {destination.bookingCount === 1 ? "" : "s"}
                              {" · "}
                              {formatCurrency(destination.averageBookingValue)} average
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-black text-slate-900">
                              {formatCurrency(destination.revenue)}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-500">
                              {destination.revenuePercentage.toFixed(1)}% of revenue
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-2 sm:grid-cols-3">
                          <div className="rounded-lg bg-white px-3 py-2">
                            <p className="text-xs font-medium text-slate-500">
                              Revenue Rank
                            </p>
                            <p className="mt-1 font-bold text-slate-900">
                              #{destination.revenueRank}
                            </p>
                          </div>

                          <div className="rounded-lg bg-white px-3 py-2">
                            <p className="text-xs font-medium text-slate-500">
                              Volume Rank
                            </p>
                            <p className="mt-1 font-bold text-slate-900">
                              #{destination.volumeRank}
                            </p>
                          </div>

                          <div className="rounded-lg bg-white px-3 py-2">
                            <p className="text-xs font-medium text-slate-500">
                              Avg. Value Rank
                            </p>
                            <p className="mt-1 font-bold text-slate-900">
                              #{destination.averageValueRank}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="mb-6">
              <div className="mb-4">
                <h2 className="text-lg font-black text-slate-900">
                  Destination × Service Performance
                </h2>
                <p className="text-sm text-slate-500">
                  Current month revenue performance by destination and service type
                </p>
              </div>

              <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Top Destination × Service
                </p>
                <p className="mt-1 text-2xl font-black text-slate-900">
                  {kpiMetrics.topDestinationService.destination}
                  {" × "}
                  {kpiMetrics.topDestinationService.serviceType}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatCurrency(kpiMetrics.topDestinationService.revenue)} booked
                  {" · "}
                  {kpiMetrics.topDestinationService.bookingCount} booking
                  {kpiMetrics.topDestinationService.bookingCount === 1 ? "" : "s"}
                  {" · "}
                  {kpiMetrics.topDestinationService.revenuePercentage.toFixed(1)}% of revenue
                  {" · "}
                  {formatCurrency(kpiMetrics.topDestinationService.averageBookingValue)} average
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                {kpiMetrics.destinationServiceMixRows.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No destination and service activity recorded for the current month.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {kpiMetrics.destinationServiceMixRows.map((combination) => (
                      <div
                        key={`${combination.destination}-${combination.serviceType}`}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-bold text-slate-900">
                              {combination.destination}
                              {" × "}
                              {combination.serviceType}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {combination.bookingCount} booking
                              {combination.bookingCount === 1 ? "" : "s"}
                              {" · "}
                              {formatCurrency(combination.averageBookingValue)} average
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-black text-slate-900">
                              {formatCurrency(combination.revenue)}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-500">
                              {combination.revenuePercentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="mb-6">
              <div className="mb-4">
                <h2 className="text-lg font-black text-slate-900">
                  Operations Performance
                </h2>
                <p className="text-sm text-slate-500">
                  Current month booking and trip activity
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">Bookings This Month</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {kpiMetrics.bookingCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">Average Booking Value</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {formatCurrency(kpiMetrics.averageBookingValue)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">Completed Trips</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {kpiMetrics.completedTrips}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">Active Trips</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {kpiMetrics.activeTrips}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">Incidents</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {kpiMetrics.incidentCount}
                  </p>
                </div>
              </div>
            </section>

            <div className="mb-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Total booking records
                </p>

                <p className="mt-1 text-3xl font-black text-slate-900">
                  {bookings.length}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Matching records
                </p>

                <p className="mt-1 text-3xl font-black text-slate-900">
                  {filteredBookings.length}
                </p>
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px_260px_auto]">
                <div>
                  <label
                    htmlFor="booking-search"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Search bookings
                  </label>

                  <input
                    id="booking-search"
                    type="text"
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(
                        event.target.value
                      )
                    }
                    placeholder="Booking ID, customer, pickup, destination, vehicle, route, price..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="status-filter"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Status
                  </label>

                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="All">
                      All Statuses
                    </option>

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Confirmed">
                      Confirmed
                    </option>

                    <option value="Cancelled">
                      Cancelled
                    </option>

                    <option value="Completed">
                      Completed
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="payment-status-filter"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Payment Status
                  </label>

                  <select
                    id="payment-status-filter"
                    value={paymentStatusFilter}
                    onChange={(event) =>
                      setPaymentStatusFilter(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="All">
                      All Payment Statuses
                    </option>

                    <option value="Paid">
                      Paid
                    </option>

                    <option value="Partially Paid">
                      Partially Paid
                    </option>

                    <option value="Unpaid">
                      Unpaid
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="sort-filter"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Sort by
                  </label>

                  <select
                    id="sort-filter"
                    value={sortOption}
                    onChange={(event) =>
                      setSortOption(
                        event.target
                          .value as SortOption
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="pickup-asc">
                      Pickup — Earliest First
                    </option>

                    <option value="pickup-desc">
                      Pickup — Latest First
                    </option>

                    <option value="customer-asc">
                      Customer Name — A–Z
                    </option>

                    <option value="customer-desc">
                      Customer Name — Z–A
                    </option>

                    <option value="status-pending">
                      Status — Pending First
                    </option>

                    <option value="status-confirmed">
                      Status — Confirmed First
                    </option>

                    <option value="price-desc">
                      Price — Highest First
                    </option>

                    <option value="price-asc">
                      Price — Lowest First
                    </option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    disabled={
                      !searchTerm &&
                      statusFilter === "All" &&
                      paymentStatusFilter ===
                        "All" &&
                      sortOption ===
                        "pickup-asc"
                    }
                    className="w-full rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 lg:w-auto"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-[1100px] text-left">
                  <thead className="bg-slate-800 text-sm text-white">
                    <tr>
                      <th className="px-4 py-4 font-semibold">
                        Booking ID
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        Status
                      </th>
                      <th className="px-4 py-4 font-semibold">
                       Dispatch
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        Customer
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        Pickup
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        Destination
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        Date
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        Time
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        Passengers
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        Vehicle
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        Price
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        Payment Status
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        Paid
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        Outstanding
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {filteredBookings.map(
                      (booking, index) => {
                        const bookingId =
                          booking[
                            "Booking ID"
                          ];

                        const status =
                          booking.Status ||
                          "Pending";

                        const normalizedStatus =
                          status.toLowerCase();

                        const isUpdating =
                          updatingBookingId ===
                          bookingId;

                        const financial =
                          getBookingFinancial(
                            booking,
                            financialByBookingId
                          );

                        return (
                          <tr
                            key={`${bookingId}-${index}`}
                            className="cursor-pointer hover:bg-slate-50"
                            onClick={() =>
                              setSelectedBooking(
                                booking
                              )
                            }
                          >
                            <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-900">
                              {bookingId}
                            </td>

                            <td className="whitespace-nowrap px-4 py-4">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClasses(
                                    status
                                  )}`}
                                >
                                  {status}
                                </span>

                                {normalizedStatus ===
                                  "pending" && (
                                  <div
                                    className="flex gap-2"
                                    onClick={(
                                      event
                                    ) =>
                                      event.stopPropagation()
                                    }
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateBookingStatus(
                                          bookingId,
                                          "Confirmed"
                                        )
                                      }
                                      disabled={
                                        isUpdating
                                      }
                                      className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      {isUpdating
                                        ? "Updating..."
                                        : "Confirm"}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const confirmed =
                                          window.confirm(
                                            `Are you sure you want to cancel booking ${bookingId}?`
                                          );

                                        if (
                                          !confirmed
                                        ) {
                                          return;
                                        }

                                        updateBookingStatus(
                                          bookingId,
                                          "Cancelled"
                                        );
                                      }}
                                      disabled={
                                        isUpdating
                                      }
                                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      {isUpdating
                                        ? "Updating..."
                                        : "Cancel"}
                                    </button>
                                  </div>
                                )}

                                {normalizedStatus ===
                                  "confirmed" && (
                                  <div
                                    className="flex gap-2"
                                    onClick={(
                                      event
                                    ) =>
                                      event.stopPropagation()
                                    }
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const confirmed =
                                          window.confirm(
                                            `Mark booking ${bookingId} as completed?`
                                          );

                                        if (
                                          !confirmed
                                        ) {
                                          return;
                                        }

                                        updateBookingStatus(
                                          bookingId,
                                          "Completed"
                                        );
                                      }}
                                      disabled={
                                        isUpdating
                                      }
                                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      {isUpdating
                                        ? "Updating..."
                                        : "Complete"}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const confirmed =
                                          window.confirm(
                                            `Are you sure you want to cancel booking ${bookingId}?`
                                          );

                                        if (
                                          !confirmed
                                        ) {
                                          return;
                                        }

                                        updateBookingStatus(
                                          bookingId,
                                          "Cancelled"
                                        );
                                      }}
                                      disabled={
                                        isUpdating
                                      }
                                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      {isUpdating
                                        ? "Updating..."
                                        : "Cancel"}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                                                         <td className="whitespace-nowrap px-4 py-4">
                              <DispatchStatusBadge
                                status={
                                  getDispatchForBooking(
                                    bookingId,
                                    dispatches
                                  )?.[
                                    "Dispatch Status"
                                  ] ??
                                  "Not Dispatched"
                                }
                              />
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                              {
                                booking[
                                  "Customer Name"
                                ]
                              }
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                              {booking.Pickup}
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                              {
                                booking.Destination
                              }
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                              {formatDate(
                                booking[
                                  "Pickup Date"
                                ]
                              )}
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                              {formatTime(
                                booking[
                                  "Pickup Time"
                                ]
                              )}
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                              {booking.Passengers}
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                              {booking.Vehicle}
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-900">
                              {formatCurrency(
                                booking[
                                  "Price USD"
                                ]
                              )}
                            </td>

                            <td className="whitespace-nowrap px-4 py-4">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ${getPaymentStatusClasses(
                                  financial.status
                                )}`}
                              >
                                {financial.status}
                              </span>
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-900">
                              {formatCurrency(
                                financial.paid
                              )}
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-900">
                              {formatCurrency(
                                financial.outstanding
                              )}
                            </td>
                          </tr>
                        );
                      }
                    )}

                    {filteredBookings.length ===
                      0 && (
                      <tr>
                        <td
                          colSpan={13}
                          className="px-6 py-12 text-center"
                        >
                          <p className="font-semibold text-slate-700">
                            No matching booking
                            records found.
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Try changing the
                            search, booking status,
                            payment status, or sort
                            option.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {selectedBooking && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6"
            onClick={() =>
              setSelectedBooking(null)
            }
          >
            <div
              className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-sky-600">
                    Booking Details
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-slate-900">
                    {
                      selectedBooking[
                        "Booking ID"
                      ]
                    }
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedBooking(null)
                  }
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>

              <div className="space-y-8 p-6">
                {(() => {
                  const selectedFinancial =
                    getBookingFinancial(
                      selectedBooking,
                      financialByBookingId
                    );

                  return (
                    <section>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">
                          Payment Status
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${getPaymentStatusClasses(
                            selectedFinancial.status
                          )}`}
                        >
                          {selectedFinancial.status}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 p-4">
                          <p className="text-xs font-semibold uppercase text-slate-500">
                            Total Paid
                          </p>

                          <p className="mt-1 text-xl font-black text-slate-900">
                            {formatCurrency(
                              selectedFinancial.paid
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 p-4">
                          <p className="text-xs font-semibold uppercase text-slate-500">
                            Outstanding
                          </p>

                          <p className="mt-1 text-xl font-black text-slate-900">
                            {formatCurrency(
                              selectedFinancial.outstanding
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 p-4">
                          <p className="text-xs font-semibold uppercase text-slate-500">
                            Payment Total
                          </p>

                          <p className="mt-1 text-xl font-black text-slate-900">
                            {formatCurrency(
                              selectedFinancial.total
                            )}
                          </p>
                        </div>
                      </div>
                    </section>
                  );
                })()}

                <section>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">
                      Booking Status
                    </h3>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClasses(
                        selectedBooking.Status ||
                          "Pending"
                      )}`}
                    >
                      {selectedBooking.Status ||
                        "Pending"}
                    </span>
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 text-lg font-bold text-slate-900">
                    Customer
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Name
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {
                          selectedBooking[
                            "Customer Name"
                          ]
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Phone
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {selectedBooking.Phone}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Email
                      </p>

                      <p className="mt-1 break-all text-sm text-slate-700">
                        {selectedBooking.Email}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Passengers
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {
                          selectedBooking.Passengers
                        }
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 text-lg font-bold text-slate-900">
                    Trip
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Pickup
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {selectedBooking.Pickup}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Destination
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {
                          selectedBooking.Destination
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Pickup Date
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {formatDate(
                          selectedBooking[
                            "Pickup Date"
                          ]
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Pickup Time
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {formatTime(
                          selectedBooking[
                            "Pickup Time"
                          ]
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Vehicle
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {selectedBooking.Vehicle}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Route
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {
                          selectedBooking[
                            "Route ID"
                          ]
                        }
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 text-lg font-bold text-slate-900">
                    Flight & Hotel
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Flight Number
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {selectedBooking[
                          "Flight Number"
                        ] || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Service Type
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {selectedBooking[
                          "Service Type"
                        ] || "—"}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Hotel
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {selectedBooking.Hotel ||
                          "—"}
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 text-lg font-bold text-slate-900">
                    Special Requests
                  </h3>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {selectedBooking[
                        "Special Requests"
                      ] ||
                        "No special requests."}
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 text-lg font-bold text-slate-900">
                    Financial
                  </h3>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Price
                      </p>

                      <p className="mt-1 text-xl font-black text-slate-900">
                        {formatCurrency(
                          selectedBooking[
                            "Price USD"
                          ]
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Deposit
                      </p>

                      <p className="mt-1 text-xl font-black text-slate-900">
                        {formatCurrency(
                          selectedBooking.Deposit
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Outstanding
                      </p>

                      <p className="mt-1 text-xl font-black text-slate-900">
                        {formatCurrency(
                          getBookingFinancial(
                            selectedBooking,
                            financialByBookingId
                          ).outstanding
                        )}
                      </p>
                    </div>
                  </div>
                </section>

                <PaymentRecorder
                  bookingReference={
                    selectedBooking[
                      "Booking ID"
                    ]
                  }
                  total={Number(
                    selectedBooking[
                      "Price USD"
                    ]
                  )}
                  totalPaid={
                    getBookingFinancial(
                      selectedBooking,
                      financialByBookingId
                    ).paid
                  }
                  deposit={Number(
                    selectedBooking.Deposit
                  )}
                  balance={Number(
                    selectedBooking.Balance
                  )}
                  onPaymentRecorded={() => {
                    setError("");

                    setPaymentRefreshKey(
                      (currentKey) =>
                        currentKey + 1
                    );
                  }}
                />


                {selectedBooking.Status
                  ?.toLowerCase() ===
                  "pending" && (
                  <section className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
                    <button
                      type="button"
                      onClick={() =>
                        updateBookingStatus(
                          selectedBooking[
                            "Booking ID"
                          ],
                          "Confirmed"
                        )
                      }
                      disabled={
                        updatingBookingId ===
                        selectedBooking[
                          "Booking ID"
                        ]
                      }
                      className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingBookingId ===
                      selectedBooking[
                        "Booking ID"
                      ]
                        ? "Updating..."
                        : "Confirm Booking"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const confirmed =
                          window.confirm(
                            `Are you sure you want to cancel booking ${selectedBooking["Booking ID"]}?`
                          );

                        if (!confirmed) {
                          return;
                        }

                        updateBookingStatus(
                          selectedBooking[
                            "Booking ID"
                          ],
                          "Cancelled"
                        );
                      }}
                      disabled={
                        updatingBookingId ===
                        selectedBooking[
                          "Booking ID"
                        ]
                      }
                      className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingBookingId ===
                      selectedBooking[
                        "Booking ID"
                      ]
                        ? "Updating..."
                        : "Cancel Booking"}
                    </button>
                  </section>
                )}

                {selectedBooking.Status
                  ?.toLowerCase() ===
                  "confirmed" && (
                  <section className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
                    <button
  type="button"
  onClick={() => {
    window.location.href = `/dispatch?bookingId=${encodeURIComponent(
      selectedBooking["Booking ID"]
    )}`;
  }}
  className="rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-700"
>
  Dispatch Booking
</button>
                    <button
                      type="button"
                      onClick={() => {
                        const confirmed =
                          window.confirm(
                            `Mark booking ${selectedBooking["Booking ID"]} as completed?`
                          );

                        if (!confirmed) {
                          return;
                        }

                        updateBookingStatus(
                          selectedBooking[
                            "Booking ID"
                          ],
                          "Completed"
                        );
                      }}
                      disabled={
                        updatingBookingId ===
                        selectedBooking[
                          "Booking ID"
                        ]
                      }
                      className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingBookingId ===
                      selectedBooking[
                        "Booking ID"
                      ]
                        ? "Updating..."
                        : "Complete Booking"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const confirmed =
                          window.confirm(
                            `Are you sure you want to cancel booking ${selectedBooking["Booking ID"]}?`
                          );

                        if (!confirmed) {
                          return;
                        }

                        updateBookingStatus(
                          selectedBooking[
                            "Booking ID"
                          ],
                          "Cancelled"
                        );
                      }}
                      disabled={
                        updatingBookingId ===
                        selectedBooking[
                          "Booking ID"
                        ]
                      }
                      className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingBookingId ===
                      selectedBooking[
                        "Booking ID"
                      ]
                        ? "Updating..."
                        : "Cancel Booking"}
                    </button>
                  </section>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-8">
  <AccountingSummary
    refreshKey={paymentRefreshKey}
  />

  <PaymentsLedger
    refreshKey={paymentRefreshKey}
  />
</div>
      </div>
    </main>
  );
}
