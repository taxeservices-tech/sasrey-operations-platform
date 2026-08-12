"use client";

import { useEffect, useMemo, useState } from "react";
import PaymentRecorder from "@/components/operations/PaymentRecorder";

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

function formatCurrency(value: string | number): string {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return "";
  }

  return `$${amount.toFixed(2)}`;
}

function isValidBooking(booking: BookingRecord): boolean {
  return Boolean(
    booking["Booking ID"]?.trim() &&
      booking["Customer Name"]?.trim()
  );
}

function getStatusClasses(status: string): string {
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

function getStatusPriority(status: string): number {
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

function getConfirmedFirstPriority(status: string): number {
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
  const date = booking["Pickup Date"]?.trim() ?? "";
  const time = booking["Pickup Time"]?.trim() ?? "";

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

export default function OperationsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>(
    []
  );

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [updatingBookingId, setUpdatingBookingId] =
    useState<string | null>(null);

  const [selectedBooking, setSelectedBooking] =
    useState<BookingRecord | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [sortOption, setSortOption] =
    useState<SortOption>("pickup-asc");

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/bookings", {
          method: "GET",
          cache: "no-store",
        });

        const data: BookingsResponse =
          await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ??
              data.error ??
              "Unable to load bookings."
          );
        }

        const validBookings = (
          data.bookings ?? []
        ).filter(isValidBooking);

        setBookings(validBookings);
      } catch (err) {
        console.error(
          "Operations booking load error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load bookings."
        );
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, []);

  async function updateBookingStatus(
    bookingReference: string,
    status: string
  ) {
    try {
      setUpdatingBookingId(bookingReference);
      setError("");

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "updateStatus",
          bookingReference,
          status,
        }),
      });

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

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking["Booking ID"] ===
          bookingReference
            ? {
                ...booking,
                Status: status,
              }
            : booking
        )
      );

      setSelectedBooking((currentBooking) =>
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

  const filteredBookings = useMemo(() => {
    const normalizedSearch =
      searchTerm.trim().toLowerCase();

    const matchingBookings = bookings.filter(
      (booking) => {
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
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesStatus =
          statusFilter === "All" ||
          booking.Status.toLowerCase() ===
            statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
      }
    );

    return [...matchingBookings].sort(
      (a, b) => {
        switch (sortOption) {
          case "pickup-asc":
            return (
              getPickupTimestamp(a) -
              getPickupTimestamp(b)
            );

          case "pickup-desc":
            return (
              getPickupTimestamp(b) -
              getPickupTimestamp(a)
            );

          case "customer-asc":
            return a["Customer Name"].localeCompare(
              b["Customer Name"]
            );

          case "customer-desc":
            return b["Customer Name"].localeCompare(
              a["Customer Name"]
            );

          case "status-pending":
            return (
              getStatusPriority(a.Status) -
              getStatusPriority(b.Status)
            );

          case "status-confirmed":
            return (
              getConfirmedFirstPriority(a.Status) -
              getConfirmedFirstPriority(b.Status)
            );

          case "price-asc":
            return (
              Number(a["Price USD"]) -
              Number(b["Price USD"])
            );

          case "price-desc":
            return (
              Number(b["Price USD"]) -
              Number(a["Price USD"])
            );

          default:
            return 0;
        }
      }
    );
  }, [
    bookings,
    searchTerm,
    statusFilter,
    sortOption,
  ]);

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("All");
    setSortOption("pickup-asc");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">
            SASREY Operations
          </p>

          <h1 className="mt-2 text-4xl font-black text-slate-900">
            Booking Records
          </h1>

          <p className="mt-3 text-slate-600">
            View current booking records and operational
            details.
          </p>
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
              <div className="grid gap-4 lg:grid-cols-[1fr_220px_260px_auto]">
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
                      sortOption === "pickup-asc"
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
                <table className="min-w-full text-left">
                  <thead className="bg-slate-800 text-sm text-white">
                    <tr>
                      <th className="px-4 py-4 font-semibold">
                        Booking ID
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        Status
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
                        Route
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        Price
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        Deposit
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        Balance
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {filteredBookings.map(
                      (booking, index) => {
                        const bookingId =
                          booking["Booking ID"];

                        const status =
                          booking.Status ||
                          "Pending";

                        const normalizedStatus =
                          status.toLowerCase();

                        const isUpdating =
                          updatingBookingId ===
                          bookingId;

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

                            <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-700">
                              {
                                booking[
                                  "Route ID"
                                ]
                              }
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-900">
                              {formatCurrency(
                                booking[
                                  "Price USD"
                                ]
                              )}
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                              {formatCurrency(
                                booking.Deposit
                              )}
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                              {formatCurrency(
                                booking.Balance
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
                            Try changing the search,
                            status filter, or sort
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
                      ] || "No special requests."}
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
                        Balance
                      </p>

                      <p className="mt-1 text-xl font-black text-slate-900">
                        {formatCurrency(
                          selectedBooking.Balance
                        )}
                      </p>
                    </div>
                  </div>
                </section>

                  <PaymentRecorder
                  bookingReference={
                    selectedBooking["Booking ID"]
                  }
                  total={Number(
                    selectedBooking["Price USD"]
                  )}
                  deposit={Number(
                    selectedBooking.Deposit
                  )}
                  balance={Number(
                    selectedBooking.Balance
                  )}
                  onPaymentRecorded={() => {
                    setError("");
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
      </div>
    </main>
  );
}