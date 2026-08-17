"use client";

import { useEffect, useMemo, useState } from "react";

type SheetRow = Record<
  string,
  string | number | undefined
>;

type ApiResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  bookings?: SheetRow[];
  dispatches?: SheetRow[];
  drivers?: SheetRow[];
  vehicles?: SheetRow[];
};

const TERMINAL_STATUSES = [
  "Completed",
  "Cancelled",
];

function getValue(
  row: SheetRow | undefined,
  ...keys: string[]
): string {
  if (!row) {
    return "";
  }

  for (const key of keys) {
    const value = row[key];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return String(value).trim();
    }
  }

  return "";
}

function getNumber(
  row: SheetRow | undefined,
  ...keys: string[]
): number {
  const value = Number(
    getValue(row, ...keys)
  );

  return Number.isFinite(value)
    ? value
    : 0;
}

function getStatusClasses(
  status: string
) {
  switch (status) {
    case "Assigned":
      return "bg-blue-100 text-blue-700";

    case "En Route":
      return "bg-amber-100 text-amber-700";

    case "Passenger Onboard":
      return "bg-purple-100 text-purple-700";

    case "Completed":
      return "bg-green-100 text-green-700";

    case "Cancelled":
      return "bg-red-100 text-red-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getNextStatuses(
  status: string
) {
  switch (status) {
    case "Assigned":
      return [
        "En Route",
        "Cancelled",
      ];

    case "En Route":
      return [
        "Passenger Onboard",
        "Cancelled",
      ];

    case "Passenger Onboard":
      return ["Completed"];

    default:
      return [];
  }
}

export default function DispatchPage() {
  const [bookings, setBookings] =
    useState<SheetRow[]>([]);

  const [dispatches, setDispatches] =
    useState<SheetRow[]>([]);

  const [drivers, setDrivers] =
    useState<SheetRow[]>([]);

  const [vehicles, setVehicles] =
    useState<SheetRow[]>([]);

  const [selectedBookingId, setSelectedBookingId] =
    useState("");

  const [selectedDriverId, setSelectedDriverId] =
    useState("");

  const [selectedVehicleId, setSelectedVehicleId] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [refreshKey, setRefreshKey] =
    useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [
          bookingsResponse,
          dispatchResponse,
          resourcesResponse,
        ] = await Promise.all([
          fetch("/api/bookings", {
            cache: "no-store",
          }),

          fetch(
            "/api/dispatch?action=listDispatch",
            {
              cache: "no-store",
            }
          ),

          fetch(
            "/api/dispatch?action=listDispatchResources",
            {
              cache: "no-store",
            }
          ),
        ]);

        const bookingsData: ApiResponse =
          await bookingsResponse.json();

        const dispatchData: ApiResponse =
          await dispatchResponse.json();

        const resourcesData: ApiResponse =
          await resourcesResponse.json();

        if (
          !bookingsResponse.ok ||
          bookingsData.success === false
        ) {
          throw new Error(
            bookingsData.message ??
              bookingsData.error ??
              "Unable to retrieve bookings."
          );
        }

        if (
          !dispatchResponse.ok ||
          dispatchData.success === false
        ) {
          throw new Error(
            dispatchData.message ??
              dispatchData.error ??
              "Unable to retrieve dispatch records."
          );
        }

        if (
          !resourcesResponse.ok ||
          resourcesData.success === false
        ) {
          throw new Error(
            resourcesData.message ??
              resourcesData.error ??
              "Unable to retrieve drivers and vehicles."
          );
        }

        if (!cancelled) {
          setBookings(
            bookingsData.bookings ?? []
          );

          setDispatches(
            dispatchData.dispatches ?? []
          );

          /*
           * Ignore completely blank driver rows.
           */
          setDrivers(
            (resourcesData.drivers ?? []).filter(
              (driver) =>
                getValue(
                  driver,
                  "Driver ID"
                ) &&
                getValue(
                  driver,
                  "Driver Name"
                )
            )
          );

          /*
           * Ignore completely blank vehicle rows.
           */
          setVehicles(
            (resourcesData.vehicles ?? []).filter(
              (vehicle) =>
                getValue(
                  vehicle,
                  "Vehicle ID"
                )
            )
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load dispatch data."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const dispatchedBookingIds =
    useMemo(() => {
      return new Set(
        dispatches
          .map((dispatch) =>
            getValue(
              dispatch,
              "Booking ID",
              "bookingReference"
            )
          )
          .filter(Boolean)
      );
    }, [dispatches]);

  const confirmedBookings =
    useMemo(() => {
      return bookings.filter(
        (booking) => {
          const bookingId =
            getValue(
              booking,
              "Booking ID"
            );

          const status =
            getValue(
              booking,
              "Status",
              "Booking Status"
            );

          return (
            bookingId &&
            status === "Confirmed" &&
            !dispatchedBookingIds.has(
              bookingId
            )
          );
        }
      );
    }, [
      bookings,
      dispatchedBookingIds,
    ]);

  const selectedBooking =
    useMemo(() => {
      return bookings.find(
        (booking) =>
          getValue(
            booking,
            "Booking ID"
          ) === selectedBookingId
      );
    }, [
      bookings,
      selectedBookingId,
    ]);

  const selectedDriver =
    useMemo(() => {
      return drivers.find(
        (driver) =>
          getValue(
            driver,
            "Driver ID"
          ) === selectedDriverId
      );
    }, [
      drivers,
      selectedDriverId,
    ]);

  const availableVehicles =
    useMemo(() => {
      if (!selectedDriverId) {
        return [];
      }

      /*
       * Prefer vehicles explicitly assigned
       * to the selected driver.
       */
      return vehicles.filter(
        (vehicle) => {
          const vehicleDriverId =
            getValue(
              vehicle,
              "Driver ID"
            );

          return (
            vehicleDriverId ===
            selectedDriverId
          );
        }
      );
    }, [
      vehicles,
      selectedDriverId,
    ]);

  async function handleCreateDispatch(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!selectedBooking) {
      setError(
        "Select a confirmed booking."
      );
      return;
    }

    if (!selectedDriverId) {
      setError(
        "Select a driver."
      );
      return;
    }

    if (!selectedVehicleId) {
      setError(
        "Select a vehicle."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/api/dispatch",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action:
              "createDispatch",

            bookingReference:
              getValue(
                selectedBooking,
                "Booking ID"
              ),

            driverId:
              selectedDriverId,

            vehicleId:
              selectedVehicleId,

            notes:
              notes.trim(),
          }),
        }
      );

      const data: ApiResponse =
        await response.json();

      if (
        !response.ok ||
        data.success === false
      ) {
        throw new Error(
          data.message ??
            data.error ??
            "Unable to create dispatch."
        );
      }

      setMessage(
        "Dispatch created successfully."
      );

      setSelectedBookingId("");
      setSelectedDriverId("");
      setSelectedVehicleId("");
      setNotes("");

      setRefreshKey(
        (current) => current + 1
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create dispatch."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusUpdate(
    dispatch: SheetRow,
    status: string
  ) {
    setMessage("");
    setError("");

    const dispatchId =
      getValue(
        dispatch,
        "Dispatch ID",
        "dispatchId"
      );

    if (!dispatchId) {
      setError(
        "Dispatch ID is missing."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/api/dispatch",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action:
              "updateDispatchStatus",

            dispatchId,

            status,
          }),
        }
      );

      const data: ApiResponse =
        await response.json();

      if (
        !response.ok ||
        data.success === false
      ) {
        throw new Error(
          data.message ??
            data.error ??
            "Unable to update dispatch status."
        );
      }

      setMessage(
        `Dispatch ${dispatchId} updated to ${status}.`
      );

      setRefreshKey(
        (current) => current + 1
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update dispatch status."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-sky-600">
            SASREY Operations
          </p>

          <h1 className="mt-2 text-4xl font-black text-slate-900">
            Dispatch
          </h1>

          <p className="mt-2 max-w-3xl text-slate-600">
            Assign confirmed bookings to
            drivers and vehicles, then manage
            each trip through its operational
            lifecycle.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
            {message}
          </div>
        )}

        <section className="mb-8 rounded-3xl bg-white p-6 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-900">
              Create Dispatch
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Only confirmed bookings without
              an existing dispatch are available.
            </p>
          </div>

          <form
            onSubmit={
              handleCreateDispatch
            }
            className="grid gap-5 lg:grid-cols-4"
          >
            <div>
              <label className="text-sm font-bold text-slate-700">
                Confirmed Booking
              </label>

              <select
                value={
                  selectedBookingId
                }
                onChange={(event) =>
                  setSelectedBookingId(
                    event.target.value
                  )
                }
                disabled={
                  loading || saving
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3"
              >
                <option value="">
                  Select booking
                </option>

                {confirmedBookings.map(
                  (booking) => {
                    const id =
                      getValue(
                        booking,
                        "Booking ID"
                      );

                    return (
                      <option
                        key={id}
                        value={id}
                      >
                        {id} —{" "}
                        {getValue(
                          booking,
                          "Customer Name"
                        )}
                      </option>
                    );
                  }
                )}
              </select>

              {confirmedBookings.length ===
                0 &&
                !loading && (
                  <p className="mt-2 text-xs text-slate-500">
                    No confirmed bookings are
                    currently available for
                    dispatch.
                  </p>
                )}
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Driver
              </label>

              <select
                value={
                  selectedDriverId
                }
                onChange={(event) => {
                  setSelectedDriverId(
                    event.target.value
                  );

                  setSelectedVehicleId(
                    ""
                  );
                }}
                disabled={
                  loading || saving
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3"
              >
                <option value="">
                  Select driver
                </option>

                {drivers.map(
                  (driver) => {
                    const driverId =
                      getValue(
                        driver,
                        "Driver ID"
                      );

                    const driverName =
                      getValue(
                        driver,
                        "Driver Name"
                      );

                    const status =
                      getValue(
                        driver,
                        "Driver Status"
                      );

                    return (
                      <option
                        key={
                          driverId
                        }
                        value={
                          driverId
                        }
                      >
                        {driverName} (
                        {driverId}){" "}
                        {status
                          ? `— ${status}`
                          : ""}
                      </option>
                    );
                  }
                )}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Vehicle
              </label>

              <select
                value={
                  selectedVehicleId
                }
                onChange={(event) =>
                  setSelectedVehicleId(
                    event.target.value
                  )
                }
                disabled={
                  !selectedDriverId ||
                  loading ||
                  saving
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3"
              >
                <option value="">
                  Select vehicle
                </option>

                {availableVehicles.map(
                  (vehicle) => {
                    const vehicleId =
                      getValue(
                        vehicle,
                        "Vehicle ID"
                      );

                    const make =
                      getValue(
                        vehicle,
                        "Make"
                      );

                    const model =
                      getValue(
                        vehicle,
                        "Model"
                      );

                    const seats =
                      getValue(
                        vehicle,
                        "Seats"
                      );

                    return (
                      <option
                        key={
                          vehicleId
                        }
                        value={
                          vehicleId
                        }
                      >
                        {make} {model} —{" "}
                        {seats} seats (
                        {vehicleId})
                      </option>
                    );
                  }
                )}
              </select>

              {selectedDriver &&
                selectedDriverId &&
                availableVehicles.length ===
                  0 && (
                  <p className="mt-2 text-xs text-amber-600">
                    No vehicle is currently
                    assigned to this driver.
                  </p>
                )}
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Notes
              </label>

              <input
                value={notes}
                onChange={(event) =>
                  setNotes(
                    event.target.value
                  )
                }
                disabled={
                  loading || saving
                }
                className="mt-2 w-full rounded-xl border border-slate-300 p-3"
                placeholder="Optional dispatch notes"
              />
            </div>

            <div className="lg:col-span-4 flex justify-end">
              <button
                type="submit"
                disabled={
                  loading ||
                  saving ||
                  !selectedBookingId ||
                  !selectedDriverId ||
                  !selectedVehicleId
                }
                className="rounded-full bg-sky-600 px-8 py-3 font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Create Dispatch"}
              </button>
            </div>
          </form>

          {selectedBooking && (
            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <div className="grid gap-4 text-sm md:grid-cols-4">
                <div>
                  <p className="font-bold text-slate-500">
                    Pickup
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {getValue(
                      selectedBooking,
                      "Pickup"
                    )}
                  </p>
                </div>

                <div>
                  <p className="font-bold text-slate-500">
                    Destination
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {getValue(
                      selectedBooking,
                      "Destination"
                    )}
                  </p>
                </div>

                <div>
                  <p className="font-bold text-slate-500">
                    Pickup
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {getValue(
                      selectedBooking,
                      "Pickup Date"
                    )}{" "}
                    {getValue(
                      selectedBooking,
                      "Pickup Time"
                    )}
                  </p>
                </div>

                <div>
                  <p className="font-bold text-slate-500">
                    Passengers
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {getNumber(
                      selectedBooking,
                      "Passengers"
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-lg">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Dispatch Board
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Active and completed dispatch
                records.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setRefreshKey(
                  (current) =>
                    current + 1
                )
              }
              disabled={
                loading || saving
              }
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
              Loading dispatch records...
            </div>
          ) : dispatches.length ===
            0 ? (
            <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
              No dispatch records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="p-3">
                      Dispatch
                    </th>

                    <th className="p-3">
                      Booking
                    </th>

                    <th className="p-3">
                      Trip
                    </th>

                    <th className="p-3">
                      Driver
                    </th>

                    <th className="p-3">
                      Vehicle
                    </th>

                    <th className="p-3">
                      Status
                    </th>

                    <th className="p-3">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {dispatches.map(
                    (dispatch, index) => {
                      const status =
                        getValue(
                          dispatch,
                          "Dispatch Status",
                          "status"
                        );

                      const nextStatuses =
                        getNextStatuses(
                          status
                        );

                      const dispatchId =
                        getValue(
                          dispatch,
                          "Dispatch ID",
                          "dispatchId"
                        );

                      return (
                        <tr
                          key={
                            dispatchId ||
                            `${getValue(
                              dispatch,
                              "Booking ID"
                            )}-${index}`
                          }
                          className="border-b border-slate-100 align-top"
                        >
                          <td className="p-3">
                            <p className="font-bold text-slate-900">
                              {dispatchId ||
                                "—"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {getValue(
                                dispatch,
                                "Pickup Date"
                              )}{" "}
                              {getValue(
                                dispatch,
                                "Pickup Time"
                              )}
                            </p>
                          </td>

                          <td className="p-3">
                            <p className="font-semibold text-slate-900">
                              {getValue(
                                dispatch,
                                "Booking ID",
                                "bookingReference"
                              ) ||
                                "—"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {getNumber(
                                dispatch,
                                "Passengers"
                              )}{" "}
                              passenger(s)
                            </p>
                          </td>

                          <td className="p-3">
                            <p className="font-semibold text-slate-900">
                              {getValue(
                                dispatch,
                                "Pickup"
                              ) ||
                                "—"}
                            </p>

                            <p className="my-1 text-xs text-slate-400">
                              ↓
                            </p>

                            <p className="font-semibold text-slate-900">
                              {getValue(
                                dispatch,
                                "Destination"
                              ) ||
                                "—"}
                            </p>
                          </td>

                          <td className="p-3">
                            <p className="font-semibold text-slate-900">
                              {getValue(
                                dispatch,
                                "Driver Name",
                                "driverName"
                              ) ||
                                "—"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {getValue(
                                dispatch,
                                "Driver ID",
                                "driverId"
                              ) ||
                                "—"}
                            </p>
                          </td>

                          <td className="p-3">
                            <p className="font-semibold text-slate-900">
                              {getValue(
                                dispatch,
                                "Vehicle",
                                "vehicle"
                              ) ||
                                "—"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {getValue(
                                dispatch,
                                "Vehicle ID",
                                "vehicleId"
                              ) ||
                                "—"}
                            </p>
                          </td>

                          <td className="p-3">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusClasses(
                                status
                              )}`}
                            >
                              {status ||
                                "Unknown"}
                            </span>
                          </td>

                          <td className="p-3">
                            {nextStatuses.length >
                            0 ? (
                              <div className="flex flex-wrap gap-2">
                                {nextStatuses.map(
                                  (
                                    nextStatus
                                  ) => (
                                    <button
                                      key={
                                        nextStatus
                                      }
                                      type="button"
                                      onClick={() =>
                                        handleStatusUpdate(
                                          dispatch,
                                          nextStatus
                                        )
                                      }
                                      disabled={
                                        saving
                                      }
                                      className="rounded-full border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                                    >
                                      {nextStatus}
                                    </button>
                                  )
                                )}
                              </div>
                            ) : (
                              <span className="text-xs font-semibold text-slate-400">
                                {TERMINAL_STATUSES.includes(
                                  status
                                )
                                  ? "Terminal"
                                  : "No actions"}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}