"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import RevenueTargetStrategy from "@/components/operations/RevenueTargetStrategy";
import {
  getBookingReservationWindow,
  getDispatchReservationWindow,
} from "@/app/lib/dispatchAvailability";
type SheetRow = Record<
  string,
  string | number | undefined
>;
type BookingFinancial = {
  total: number;
  paid: number;
  outstanding: number;
};
type ApiResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  found?: boolean;
  bookings?: SheetRow[];
  dispatches?: SheetRow[];
  drivers?: SheetRow[];
  vehicles?: SheetRow[];
  incidentId?: string;
  dispatchId?: string;
  settings?: Record<string, string | number | undefined>;
};



const TERMINAL_STATUSES = [
  "Completed",
];

const ACTIVE_DISPATCH_STATUSES = [
  "Assigned",
  "En Route",
  "Passenger Onboard",
  "Incident",
];

function isDispatchResourceBusy(
  resourceId: string,
  key: string,
  booking: SheetRow | undefined,
  dispatches: SheetRow[]
): boolean {
  const requestedWindow =
    getBookingReservationWindow(booking);

  if (!requestedWindow) {
    return false;
  }

  return dispatches.some((dispatch) => {
    const dispatchResourceId =
      getValue(dispatch, key);

    const dispatchStatus =
      getValue(
        dispatch,
        "Dispatch Status",
        "status"
      );

    if (
      dispatchResourceId !== resourceId ||
      !ACTIVE_DISPATCH_STATUSES.includes(
        dispatchStatus
      )
    ) {
      return false;
    }

    const existingWindow =
      getDispatchReservationWindow(dispatch);

    if (!existingWindow) {
      return false;
    }

    return (
      requestedWindow.start <
        existingWindow.occupiedEnd &&
      existingWindow.start <
        requestedWindow.occupiedEnd
    );
  });
}
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

  return Number.isFinite(value) ? value : 0;
}

function getStatusClasses(status: string) {
  switch (status) {
    case "Assigned":
      return "bg-blue-100 text-blue-700";

    case "En Route":
      return "bg-amber-100 text-amber-700";

    case "Passenger Onboard":
      return "bg-purple-100 text-purple-700";

    case "Incident":
      return "bg-orange-100 text-orange-700";

    case "Completed":
      return "bg-green-100 text-green-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getNextStatuses(status: string) {
  switch (status) {
    case "Assigned":
      return ["En Route", "Incident"];

    case "En Route":
      return ["Passenger Onboard", "Incident"];

    case "Passenger Onboard":
      return [
        "Incident",
        "Completed",
      ];

    case "Incident":
      return [];
    case "Completed":
      return [];

    default:
      return [];
  }
}

export default function DispatchPage() {
  const bookingId =
    typeof window !== "undefined"
      ? new URLSearchParams(
          window.location.search
        ).get("bookingId") ?? ""
      : "";

  const [bookings, setBookings] =
    useState<SheetRow[]>([]);

  const [dispatches, setDispatches] =
    useState<SheetRow[]>([]);

  const [drivers, setDrivers] =
    useState<SheetRow[]>([]);

  const [vehicles, setVehicles] =
    useState<SheetRow[]>([]);
      const [monthlyRevenueTarget, setMonthlyRevenueTarget] =
    useState(40000);

  const [targetCurrency, setTargetCurrency] =
    useState("USD");

const [
  financialByBookingId,
  setFinancialByBookingId,
] = useState<
  Map<string, BookingFinancial>
>(new Map());
  const [accountingRecordsForKpi, setAccountingRecordsForKpi] =
    useState<SheetRow[]>([]);

  const [selectedBookingId, setSelectedBookingId] =
    useState("");

  const [selectedDriverId, setSelectedDriverId] =
    useState("");

  const [selectedVehicleId, setSelectedVehicleId] =
    useState("");

  const [notes, setNotes] =
    useState("");
const [incidentDispatch, setIncidentDispatch] =
  useState<SheetRow | null>(null);

const [incidentType, setIncidentType] =
  useState("");

const [incidentLocation, setIncidentLocation] =
  useState("");

const [incidentDescription, setIncidentDescription] =
  useState("");

const [incidentActionTaken, setIncidentActionTaken] =
  useState("");

const [incidentNotes, setIncidentNotes] =
  useState("");
 const [resolveIncidentDispatch, setResolveIncidentDispatch] =
  useState<SheetRow | null>(null);

const [activeIncidentId, setActiveIncidentId] =
  useState("");

const [replacementDriverId, setReplacementDriverId] =
  useState("");

const [replacementVehicleId, setReplacementVehicleId] =
  useState("");

const [resolveIncidentNotes, setResolveIncidentNotes] =
  useState("");
  const [incidentResolutionType, setIncidentResolutionType] =
  useState("Continue Trip");
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
           accountingResponse,
           dispatchResponse,
           resourcesResponse,
           settingsResponse,
            ] = await Promise.all([
         fetch("/api/bookings", {
            cache: "no-store",
          }),
        fetch("/api/accounting", {
        method: "GET",
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
                       fetch(
            "/api/dispatch?action=getSettings",
            {
              cache: "no-store",
            }
          ),
        ]);

        const bookingsData: ApiResponse =
          await bookingsResponse.json();
        const accountingData =
        await accountingResponse.json();
        const dispatchData: ApiResponse =
          await dispatchResponse.json();

        const resourcesData: ApiResponse =
          await resourcesResponse.json();
        const settingsData: ApiResponse =
          await settingsResponse.json();

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
  !accountingResponse.ok ||
  accountingData.success === false
) {
  throw new Error(
    accountingData.message ??
      accountingData.error ??
      "Unable to retrieve accounting data."
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
           if (
  !settingsResponse.ok ||
  settingsData.success === false
) {
  throw new Error(
    settingsData.message ??
      settingsData.error ??
      "Unable to retrieve application settings."
  );
}
        if (!cancelled) {
          const accountingRecords =
  accountingData.payments ??
  accountingData.records ??
  accountingData.accounting ??
  [];

            setAccountingRecordsForKpi(accountingRecords);

const financialMap =
  new Map<string, BookingFinancial>();

for (const payment of accountingRecords) {
  const id = getValue(
    payment,
    "Booking ID",
    "bookingReference"
  );

  if (!id) {
    continue;
  }

  const total = getNumber(
    payment,
    "Total",
    "total"
  );

  const amountPaid = getNumber(
    payment,
    "Amount Paid",
    "amountPaid"
  );

  const existing =
    financialMap.get(id);

  if (!existing) {
    financialMap.set(id, {
      total,
      paid: amountPaid,
      outstanding: Math.max(
        total - amountPaid,
        0
      ),
    });
  } else {
    const paid =
      existing.paid + amountPaid;

    financialMap.set(id, {
      total:
        existing.total || total,
      paid,
      outstanding: Math.max(
        (existing.total || total) - paid,
        0
      ),
    });
  }
}

setFinancialByBookingId(
  financialMap
);
          setBookings(
            bookingsData.bookings ?? []
          );

          setDispatches(
            dispatchData.dispatches ?? []
          );

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

          setVehicles(
            (resourcesData.vehicles ?? []).filter(
              (vehicle) =>
                getValue(
                  vehicle,
                  "Vehicle ID"
                )
            )
          );

          if (bookingId) {
            const requestedBooking =
              (
                bookingsData.bookings ?? []
              ).find(
                (booking) =>
                  getValue(
                    booking,
                    "Booking ID"
                  ) === bookingId
              );

            const requestedBookingStatus =
              getValue(
                requestedBooking,
                "Status",
                "Booking Status"
              );

            const alreadyDispatched =
              (
                dispatchData.dispatches ?? []
              ).some(
                (dispatch) =>
                  getValue(
                    dispatch,
                    "Booking ID",
                    "bookingReference"
                  ) === bookingId
              );

            if (
              requestedBooking &&
              requestedBookingStatus ===
                "Confirmed" &&
              !alreadyDispatched
            ) {
              setSelectedBookingId(
                bookingId
              );
            }
          }
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
  }, [refreshKey, bookingId]);

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
         const financial =
  financialByBookingId.get(
    bookingId
  );

const outstanding =
  financial?.outstanding ?? 0;
if (
  bookingId ===
  "SAS-20260820-772529299561"
) {
  console.log(
    "DISPATCH TEST BOOKING:",
    {
      bookingId,
      status,
      financial,
      outstanding,
      alreadyDispatched:
        dispatchedBookingIds.has(
          bookingId
        ),
    }
  );
}
return (
  bookingId &&
  status === "Confirmed" &&
  outstanding <= 0.009 &&
  !dispatchedBookingIds.has(
    bookingId
  )
);
        }
      );
   }, [
  bookings,
  dispatchedBookingIds,
  financialByBookingId,
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
      return vehicles;
    }, [
      vehicles,
    ]);

  async function handleStatusUpdate(
    dispatch: SheetRow,
    status: string
  ) {
    setMessage("");
    setError("");

    const dispatchId = getValue(
      dispatch,
      "Dispatch ID",
      "dispatchId"
    );

    if (!dispatchId) {
      setError("Dispatch ID is missing.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/api/dispatch",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "updateDispatchStatus",
            dispatchId,
            status,
          }),
        }
      );

      const data: ApiResponse =
        await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ??
            data.error ??
            "Unable to update dispatch status."
        );
      }

      setMessage(
        `Dispatch ${dispatchId} updated to ${status}.`
      );
      setRefreshKey((current) => current + 1);
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

  async function handleOpenResolveIncident(
    dispatch: SheetRow
  ) {
    setMessage("");
    setError("");

    const dispatchId = getValue(
      dispatch,
      "Dispatch ID",
      "dispatchId"
    );

    if (!dispatchId) {
      setError("Dispatch ID is missing.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/api/dispatch",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "getActiveIncident",
            dispatchId,
          }),
        }
      );

      const data: ApiResponse =
        await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ??
            data.error ??
            "Unable to retrieve the active incident."
        );
      }

      if (!data.found || !data.incidentId) {
        throw new Error(
          "No active incident was found for this dispatch."
        );
      }

      setResolveIncidentDispatch(dispatch);
      setActiveIncidentId(data.incidentId);
     setReplacementDriverId("");
    setReplacementVehicleId("");
    setResolveIncidentNotes("");
    setIncidentResolutionType("Continue Trip");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to retrieve the active incident."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleResolveIncident() {
  setMessage("");
  setError("");

  if (!resolveIncidentDispatch) {
    setError("No incident dispatch selected.");
    return;
  }

  if (!activeIncidentId) {
    setError("Incident ID is missing.");
    return;
  }

  /*
   * ==========================================
   * DETERMINE REQUIRED REPLACEMENT RESOURCES
   * ==========================================
   */

  const requiresDriver =
    incidentResolutionType === "Driver Replaced" ||
    incidentResolutionType ===
      "Driver & Vehicle Replaced";

  const requiresVehicle =
    incidentResolutionType === "Vehicle Replaced" ||
    incidentResolutionType ===
      "Driver & Vehicle Replaced";

  /*
   * ==========================================
   * VALIDATE DRIVER
   * ==========================================
   */

  if (
    requiresDriver &&
    !replacementDriverId
  ) {
    setError(
      "Select a replacement driver."
    );
    return;
  }

  /*
   * ==========================================
   * VALIDATE VEHICLE
   * ==========================================
   */

  if (
    requiresVehicle &&
    !replacementVehicleId
  ) {
    setError(
      "Select a replacement vehicle."
    );
    return;
  }

  /*
   * ==========================================
   * CLEAR RESOURCES THAT ARE NOT REQUIRED
   * ==========================================
   *
   * This is important.
   *
   * Driver-only replacement:
   *   vehicle = ""
   *
   * Vehicle-only replacement:
   *   driver = ""
   *
   * Continue Trip / Rerouted / No Replacement:
   *   both = ""
   */

  const finalReplacementDriverId =
    requiresDriver
      ? replacementDriverId
      : "";

  const finalReplacementVehicleId =
    requiresVehicle
      ? replacementVehicleId
      : "";

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
            "resolveIncident",

          incidentId:
            activeIncidentId,

          dispatchId:
            getValue(
              resolveIncidentDispatch,
              "Dispatch ID",
              "dispatchId"
            ),

          bookingReference:
            getValue(
              resolveIncidentDispatch,
              "Booking ID",
              "bookingReference"
            ),

          /*
           * IMPORTANT:
           * Send the actual resolution type.
           */

          resolutionType:
            incidentResolutionType,

          /*
           * Only send a driver when
           * this resolution requires one.
           */

          replacementDriverId:
            finalReplacementDriverId,

          /*
           * Only send a vehicle when
           * this resolution requires one.
           */

          replacementVehicleId:
            finalReplacementVehicleId,

          notes:
            resolveIncidentNotes.trim(),
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
          "Unable to resolve incident."
      );
    }

    /*
     * ==========================================
     * SUCCESS
     * ==========================================
     */

    setMessage(
      `Incident ${activeIncidentId} resolved successfully. Dispatch ${data.dispatchId ?? ""} is now En Route.`
    );

    setResolveIncidentDispatch(null);
    setActiveIncidentId("");

    setReplacementDriverId("");
    setReplacementVehicleId("");

    setIncidentResolutionType(
      "Continue Trip"
    );

    setResolveIncidentNotes("");

    setRefreshKey(
      (current) => current + 1
    );

  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to resolve incident."
    );

  } finally {
    setSaving(false);
  }
}

  async function handleCreateIncident() {
    setMessage("");
    setError("");

    if (!incidentDispatch) {
      setError("No dispatch selected for the incident.");
      return;
    }

    if (!incidentType) {
      setError("Select an incident type.");
      return;
    }

    if (!incidentLocation.trim()) {
      setError("Incident location is required.");
      return;
    }

    if (!incidentDescription.trim()) {
      setError("Incident description is required.");
      return;
    }

    if (!incidentActionTaken.trim()) {
      setError("Action taken is required.");
      return;
    }

    const dispatchId = getValue(
      incidentDispatch,
      "Dispatch ID",
      "dispatchId"
    );

    const bookingReference = getValue(
      incidentDispatch,
      "Booking ID",
      "bookingReference"
    );

    if (!dispatchId) {
      setError("Dispatch ID is missing.");
      return;
    }

    if (!bookingReference) {
      setError("Booking reference is missing.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/api/dispatch",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "createIncident",
            dispatchId,
            bookingReference,
            incidentType: incidentType.trim(),
            location: incidentLocation.trim(),
            description: incidentDescription.trim(),
            actionTaken: incidentActionTaken.trim(),
            notes: incidentNotes.trim(),
          }),
        }
      );

      const data: ApiResponse =
        await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ??
            data.error ??
            "Unable to create incident."
        );
      }

      setMessage(
        `Incident ${data.incidentId ?? ""} created successfully.`
      );
      setIncidentDispatch(null);
      setIncidentType("");
      setIncidentLocation("");
      setIncidentDescription("");
      setIncidentActionTaken("");
      setIncidentNotes("");
      setRefreshKey((current) => current + 1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create incident."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateDispatch(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!selectedBookingId) {
      setError("Select a booking.");
      return;
    }
    if (!selectedDriverId) {
      setError("Select a driver.");
      return;
    }
    if (!selectedVehicleId) {
      setError("Select a vehicle.");
      return;
    }
    if (!selectedBooking) {
      setError("Selected booking could not be found.");
      return;
    }

    const bookingReference = getValue(
      selectedBooking,
      "Booking ID"
    );

    const driverName = getValue(
      selectedDriver,
      "Driver Name"
    );

    const selectedVehicle = vehicles.find(
      (vehicle) =>
        getValue(vehicle, "Vehicle ID") ===
        selectedVehicleId
    );

    const vehicleLabel = [
      getValue(selectedVehicle, "Make"),
      getValue(selectedVehicle, "Model"),
    ]
      .filter(Boolean)
      .join(" ");

    try {
      setSaving(true);

      const response = await fetch(
        "/api/dispatch",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "createDispatch",
            bookingReference,
            driverId: selectedDriverId,
            driverName,
            vehicleId: selectedVehicleId,
            vehicle: vehicleLabel,
            notes: notes.trim(),
          }),
        }
      );

      const data: ApiResponse =
        await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ??
            data.error ??
            "Unable to create dispatch."
        );
      }

      setMessage(
        `Dispatch ${data.dispatchId ?? ""} created successfully.`
      );
      setSelectedBookingId("");
      setSelectedDriverId("");
      setSelectedVehicleId("");
      setNotes("");
      setRefreshKey((current) => current + 1);
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

        {/* ============================================================
            SASREY REVENUE & KPI DASHBOARD
            Initial monthly target: $40,000.
            Uses existing booking, accounting, dispatch and resource data.
        ============================================================ */}
        {(() => {
          const MONTHLY_REVENUE_TARGET =
          monthlyRevenueTarget;
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();

          const parseDate = (value: string): Date | null => {
            if (!value) return null;
            const direct = new Date(value);
            if (!Number.isNaN(direct.getTime())) return direct;

            const parts = value.trim().split(/[\/-]/);
            if (parts.length === 3) {
              const numbers = parts.map(Number);
              if (numbers.every(Number.isFinite)) {
                const [a, b, c] = numbers;
                if (a >= 1900) return new Date(a, b - 1, c);
                if (c >= 1900) return new Date(c, b - 1, a);
              }
            }
            return null;
          };

          const isCurrentMonth = (row: SheetRow) => {
            const date = parseDate(
              getValue(
                row,
                "Pickup Date",
                "Date Received",
                "Created At"
              )
            );
            return (
              !!date &&
              date.getMonth() === currentMonth &&
              date.getFullYear() === currentYear
            );
          };

          const currentMonthBookings = bookings.filter(isCurrentMonth);
          const currentMonthDispatches = dispatches.filter(isCurrentMonth);
          const currentMonthPayments =
            accountingRecordsForKpi.filter((payment) => {
              const paymentDate = parseDate(
                getValue(
                  payment,
                  "Payment Date"
                )
              );

              return (
                !!paymentDate &&
                paymentDate.getMonth() === currentMonth &&
                paymentDate.getFullYear() === currentYear
              );
            });

          const revenueCollected = currentMonthPayments.reduce(
            (sum, payment) =>
              sum +
              getNumber(
                payment,
                "Amount Paid",
                "amountPaid"
              ),
            0
          );

          const revenueBooked = currentMonthBookings.reduce(
            (sum, booking) => {
              const bookingId = getValue(
                booking,
                "Booking ID"
              );

              const financial =
                financialByBookingId.get(bookingId);

              const total =
                financial?.total ??
                getNumber(
                  booking,
                  "Total",
                  "Price USD",
                  "Total Price",
                  "Amount"
                );

              return sum + total;
            },
            0
          );

          const outstandingRevenue = currentMonthBookings.reduce(
            (sum, booking) => {
              const bookingId = getValue(booking, "Booking ID");
              const financial = financialByBookingId.get(bookingId);
              return (
                sum +
                (financial?.outstanding ??
                  getNumber(
                    booking,
                    "Balance",
                    "Outstanding",
                    "Amount Outstanding"
                  ))
              );
            },
            0
          );

          const targetPercentage =
            MONTHLY_REVENUE_TARGET > 0
              ? Math.min(
                  (revenueCollected / MONTHLY_REVENUE_TARGET) * 100,
                  100
                )
              : 0;

          const remainingTarget = Math.max(
            MONTHLY_REVENUE_TARGET - revenueCollected,
            0
          );

          const daysInMonth = new Date(
            currentYear,
            currentMonth + 1,
            0
          ).getDate();

          const remainingDays = Math.max(
            daysInMonth - now.getDate(),
            1
          );

          const requiredDailyPace =
            remainingTarget / remainingDays;

          const completedTrips = currentMonthDispatches.filter(
            (dispatch) =>
              getValue(
                dispatch,
                "Dispatch Status",
                "status"
              ) === "Completed"
          ).length;

          const activeTrips = currentMonthDispatches.filter(
            (dispatch) =>
              ACTIVE_DISPATCH_STATUSES.includes(
                getValue(
                  dispatch,
                  "Dispatch Status",
                  "status"
                )
              )
          ).length;

          const incidentCount = currentMonthDispatches.filter(
            (dispatch) =>
              getValue(
                dispatch,
                "Dispatch Status",
                "status"
              ) === "Incident"
          ).length;

          const averageBookingValue =
            currentMonthBookings.length > 0
              ? revenueBooked / currentMonthBookings.length
              : 0;

          const serviceRevenue =
            currentMonthBookings.reduce(
              (result, booking) => {
                const service =
                  getValue(
                    booking,
                    "Service Type",
                    "Service",
                    "Tour Type",
                    "Booking Type"
                  ) || "Other Services";

                const bookingId = getValue(
                  booking,
                  "Booking ID"
                );

                const financial =
                  financialByBookingId.get(bookingId);

                const value =
                  financial?.total ??
                  getNumber(
                    booking,
                    "Total",
                    "Price USD",
                    "Total Price",
                    "Amount"
                  );

                result[service] =
  Number(result[service] || 0) + Number(value);

                return result;
              },
              {} as Record<string, number>
            );
            const serviceBookingCounts =
            currentMonthBookings.reduce(
              (result, booking) => {
                const service =
                  getValue(
                    booking,
                    "Service Type",
                    "Service",
                    "Tour Type",
                    "Booking Type"
                  ) || "Other Services";

                result[service] =
                  Number(result[service] || 0) + 1;

                return result;
              },
              {} as Record<string, number>
            );
          const serviceRows = Object.entries(serviceRevenue)
  .sort((a, b) => Number(b[1]) - Number(a[1]))
  .slice(0, 6);
const planningDays = 26;

const requiredDailyBookedRevenue =
  planningDays > 0
    ? MONTHLY_REVENUE_TARGET / planningDays
    : 0;

const remainingBookedTarget = Math.max(
  MONTHLY_REVENUE_TARGET - revenueBooked,
  0
);

const bookingsNeededAtCurrentAverage =
  averageBookingValue > 0
    ? Math.ceil(
        remainingBookedTarget / averageBookingValue
      )
    : 0;
          const currency = (value: number) =>
            `$${value.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`;

          const card = (
            label: string,
            value: string,
            subtext?: string
          ) => (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {label}
              </p>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {value}
              </p>
              {subtext && (
                <p className="mt-1 text-xs text-slate-500">
                  {subtext}
                </p>
              )}
            </div>
          );

          return (
            <section className="mb-8 rounded-3xl bg-white p-6 shadow-lg">
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-emerald-600">
                    Revenue & KPI
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-slate-900">
                    Monthly Performance
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Track revenue and operating performance against the $40,000 monthly target.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-900 px-5 py-4 text-white">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-300">
                    Monthly Target
                  </p>
                  <p className="mt-1 text-2xl font-black">
                    {currency(MONTHLY_REVENUE_TARGET)}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {card(
                  "Revenue Collected",
                  currency(revenueCollected),
                  `${targetPercentage.toFixed(1)}% of target`
                )}
                {card(
                  "Revenue Remaining",
                  currency(remainingTarget),
                  "Needed to reach target"
                )}
                {card(
                  "Revenue Booked",
                  currency(revenueBooked),
                  `${currentMonthBookings.length} booking(s)`
                )}
                {card(
                  "Outstanding",
                  currency(outstandingRevenue),
                  "Current booking balances"
                )}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {card("Bookings", String(currentMonthBookings.length), "Current month")}
                {card("Completed Trips", String(completedTrips), "Current month")}
                {card("Average Booking", currency(averageBookingValue), "Booked revenue / booking")}
                {card("Required Daily Pace", currency(requiredDailyPace), `${remainingDays} day(s) remaining`)}
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-700">
                    Progress toward $40,000
                  </span>
                  <span className="font-black text-slate-900">
                    {targetPercentage.toFixed(1)}%
                  </span>
                </div>

                <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${targetPercentage}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <h3 className="text-lg font-black text-slate-900">
                    Targeted Service Performance
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Revenue booked by service type this month.
                  </p>

                  {serviceRows.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-500">
                      No current-month service revenue is available yet.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {serviceRows.map(([service, value]) => (
                        <div
                          key={service}
                          className="flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-3"
                        >
                          <span className="text-sm font-semibold text-slate-700">
                            {service}
                          </span>
                          <span className="text-sm font-black text-slate-900">
                            {currency(Number(value) || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-xs text-slate-500">
                    Growth focus: airport transfers, hotel transfers, private tours, full-day tours, and custom/private excursions.
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <h3 className="text-lg font-black text-slate-900">
                    Operations Snapshot
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Current-month operational indicators.
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {card("Active Trips", String(activeTrips))}
                    {card("Incidents", String(incidentCount))}
                    {card(
                      "Available Drivers",
                      String(
                        drivers.filter(
                          (driver) =>
                            getValue(
                              driver,
                              "Driver Status"
                            ) === "Available"
                        ).length
                      )
                    )}
                    {card(
                      "Available Vehicles",
                      String(
                        vehicles.filter(
                          (vehicle) =>
                            getValue(vehicle, "Status") === "Available"
                        ).length
                      )
                    )}
                  </div>
                </div>
              </div>
                        <RevenueTargetStrategy
                monthlyTarget={MONTHLY_REVENUE_TARGET}
                planningDays={planningDays}
                bookedRevenue={revenueBooked}
                averageBookingValue={averageBookingValue}
                serviceRevenue={Object.fromEntries(
                  Object.entries(serviceRevenue).map(
                    ([service, value]) => [
                      service,
                      Number(value) || 0,
                    ]
                  )
                )}
                serviceBookingCounts={Object.fromEntries(
                  Object.entries(serviceBookingCounts).map(
                    ([service, value]) => [
                      service,
                      Number(value) || 0,
                    ]
                  )
                )}
              />
            </section>
          );
        })()}


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
  Dispatch-Eligible Booking
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

                  setSelectedVehicleId("");
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

                    const busy =
                      isDispatchResourceBusy(
                        driverId,
                        "Driver ID",
                        selectedBooking,
                        dispatches
                      );
const driverStatus =
  getValue(
    driver,
    "Driver Status"
  );

const unavailable =
  driverStatus !== "Available";
                    return (
                      
                      <option
  key={driverId}
  value={driverId}
  disabled={unavailable}
>
                        {driverName} (
                        {driverId}){" "}
                        {unavailable
                        ? `— ${driverStatus || "Unavailable"}`
                        : busy
                        ? "— Busy"
                        : "— Available"}
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

                    const busy =
                      isDispatchResourceBusy(
                        vehicleId,
                        "Vehicle ID",
                        selectedBooking,
                        dispatches
                      );
                      const vehicleStatus =
                     getValue(
                     vehicle,
                    "Status"
                     );

                    const unavailable =
                    vehicleStatus !== "Available";
                    return (
                      <option
                     key={vehicleId}
                     value={vehicleId}
                     disabled={unavailable}
                     >
                        {make} {model} —{" "}
                        {seats} seats (
                        {vehicleId}){" "}
                        {unavailable
                        ? `— ${vehicleStatus || "Unavailable"}`
                        : busy
                        ? "— Busy"
                        : "— Available"}
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
                  !selectedVehicleId ||
                  isDispatchResourceBusy(
                    selectedDriverId,
                    "Driver ID",
                    selectedBooking,
                    dispatches
                  ) ||
                  isDispatchResourceBusy(
                    selectedVehicleId,
                    "Vehicle ID",
                    selectedBooking,
                    dispatches
                  )
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


   {incidentDispatch && (
  <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
    <div className="mb-6">
      <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
        Incident Management
      </p>

      <h2 className="mt-1 text-2xl font-black text-slate-900">
        Report Incident
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Record the incident before changing the
        dispatch status.
      </p>
    </div>

    <div className="mb-6 rounded-xl bg-slate-50 p-4">
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <p className="text-xs font-bold uppercase text-slate-500">
            Dispatch ID
          </p>

          <p className="mt-1 text-sm font-bold text-slate-900">
            {String(
              getValue(
                incidentDispatch,
                "Dispatch ID",
                "dispatchId"
              ) ?? ""
            )}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase text-slate-500">
            Booking ID
          </p>

          <p className="mt-1 text-sm font-bold text-slate-900">
            {String(
              getValue(
                incidentDispatch,
                "Booking ID",
                "bookingId"
              ) ?? ""
            )}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase text-slate-500">
            Driver
          </p>

          <p className="mt-1 text-sm font-bold text-slate-900">
            {String(
              getValue(
                incidentDispatch,
                "Driver Name",
                "driverName"
              ) ?? ""
            )}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase text-slate-500">
            Vehicle
          </p>

          <p className="mt-1 text-sm font-bold text-slate-900">
            {String(
              getValue(
                incidentDispatch,
                "Vehicle",
                "vehicle"
              ) ?? ""
            )}
          </p>
        </div>
      </div>
    </div>

    <div className="grid gap-5 md:grid-cols-2">
      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Incident Type
        </label>

        <select
          value={incidentType}
          onChange={(event) =>
            setIncidentType(event.target.value)
          }
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
        >
          <option value="">
            Select incident type
          </option>
          <option value="Mechanical">
            Mechanical
          </option>
          <option value="Accident">
            Accident
          </option>
          <option value="Passenger Issue">
            Passenger Issue
          </option>
          <option value="Traffic">
            Traffic
          </option>
          <option value="Medical">
            Medical
          </option>
          <option value="Other">
            Other
          </option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Location
        </label>

        <input
          type="text"
          value={incidentLocation}
          onChange={(event) =>
            setIncidentLocation(event.target.value)
          }
          placeholder="Where did the incident occur?"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Description
        </label>

        <textarea
          value={incidentDescription}
          onChange={(event) =>
            setIncidentDescription(event.target.value)
          }
          rows={4}
          placeholder="Describe what happened..."
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Action Taken
        </label>

        <textarea
          value={incidentActionTaken}
          onChange={(event) =>
            setIncidentActionTaken(event.target.value)
          }
          rows={3}
          placeholder="Describe the action taken..."
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Notes
        </label>

        <textarea
          value={incidentNotes}
          onChange={(event) =>
            setIncidentNotes(event.target.value)
          }
          rows={3}
          placeholder="Optional additional notes..."
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
        />
      </div>
    </div>

    <div className="mt-6 flex justify-end gap-3">
      <button
        type="button"
        onClick={() => {
          setIncidentDispatch(null);
          setIncidentType("");
          setIncidentLocation("");
          setIncidentDescription("");
          setIncidentActionTaken("");
          setIncidentNotes("");
          setError("");
          setMessage("");
        }}
        disabled={saving}
        className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        Cancel
      </button>

      <button
        type="button"
        onClick={handleCreateIncident}
        disabled={saving}
        className="rounded-full bg-orange-500 px-5 py-2 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50"
      >
        {saving
          ? "Reporting..."
          : "Report Incident"}
      </button>
    </div>
  </section>
)}

        {resolveIncidentDispatch && (
  <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
    <div className="mb-6">
      <p className="text-sm font-bold uppercase tracking-widest text-sky-600">
        Incident Management
      </p>

      <h2 className="mt-1 text-2xl font-black text-slate-900">
        Resolve Incident
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Select how the incident was resolved. Replacement resources are only required when the selected resolution requires them.
      </p>
    </div>

    {/* INCIDENT DETAILS */}
    <div className="mb-6 rounded-xl bg-slate-50 p-4">
      <div className="grid gap-4 md:grid-cols-5">

        <div>
          <p className="text-xs font-bold uppercase text-slate-500">
            Incident ID
          </p>

          <p className="mt-1 text-sm font-bold text-slate-900">
            {activeIncidentId}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase text-slate-500">
            Dispatch ID
          </p>

          <p className="mt-1 text-sm font-bold text-slate-900">
            {getValue(
              resolveIncidentDispatch,
              "Dispatch ID",
              "dispatchId"
            )}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase text-slate-500">
            Booking ID
          </p>

          <p className="mt-1 text-sm font-bold text-slate-900">
            {getValue(
              resolveIncidentDispatch,
              "Booking ID",
              "bookingReference"
            )}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase text-slate-500">
            Current Driver
          </p>

          <p className="mt-1 text-sm font-bold text-slate-900">
            {getValue(
              resolveIncidentDispatch,
              "Driver Name",
              "driverName"
            )}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase text-slate-500">
            Current Vehicle
          </p>

          <p className="mt-1 text-sm font-bold text-slate-900">
            {getValue(
              resolveIncidentDispatch,
              "Vehicle",
              "vehicle"
            )}
          </p>
        </div>

      </div>
    </div>

    {/* RESOLUTION TYPE */}
    <div className="mb-5">
      <label className="mb-2 block text-sm font-bold text-slate-700">
        Resolution Type
      </label>

      <select
        value={incidentResolutionType}
        onChange={(event) => {
          setIncidentResolutionType(
            event.target.value
          );

          setReplacementDriverId("");
          setReplacementVehicleId("");
        }}
        disabled={saving}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
      >
        <option value="Continue Trip">
          Continue Trip
        </option>

        <option value="Rerouted">
          Rerouted
        </option>

        <option value="No Replacement Required">
          No Replacement Required
        </option>

        <option value="Driver Replaced">
          Driver Replaced
        </option>

        <option value="Vehicle Replaced">
          Vehicle Replaced
        </option>

        <option value="Driver & Vehicle Replaced">
          Driver &amp; Vehicle Replaced
        </option>
      </select>
    </div>

    {/* REPLACEMENT RESOURCES */}
    <div className="grid gap-5 md:grid-cols-2">

           {/* DRIVER REPLACEMENT */}
      {(incidentResolutionType === "Driver Replaced" ||
        incidentResolutionType ===
          "Driver & Vehicle Replaced") && (
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Replacement Driver
          </label>

          <select
            value={replacementDriverId}
            onChange={(event) => {
              setReplacementDriverId(
                event.target.value
              );
            }}
            disabled={saving}
            className="w-full rounded-xl border border-slate-300 bg-white p-3"
          >
            <option value="">
              Select replacement driver
            </option>

            {drivers.map((driver) => {
              const id = getValue(
                driver,
                "Driver ID"
              );

              const name = getValue(
                driver,
                "Driver Name"
              );

              const status = getValue(
                driver,
                "Driver Status"
              );

              const pickupDate = getValue(
                resolveIncidentDispatch,
                "Pickup Date"
              );

              const busy =
                isDispatchResourceBusy(
                  id,
                  "Driver ID",
                  resolveIncidentDispatch,
                  dispatches
                );

              const currentDriver =
                id ===
                getValue(
                  resolveIncidentDispatch,
                  "Driver ID",
                  "driverId"
                );

              const unavailable =
                status !== "Available";

              return (
                <option
                  key={id}
                  value={id}
                  disabled={
                    unavailable ||
                    busy ||
                    currentDriver
                  }
                >
                  {name} ({id}) —{" "}
                  {currentDriver
                    ? "Current Driver"
                    : unavailable
                    ? status ||
                      "Unavailable"
                    : busy
                    ? "Busy"
                    : "Available"}
                </option>
              );
            })}
          </select>

          <p className="mt-2 text-xs text-slate-500">
            Select an available driver who is
            not assigned to another active
            dispatch.
          </p>
        </div>
      )}
            {/* VEHICLE REPLACEMENT */}
      {(incidentResolutionType === "Vehicle Replaced" ||
        incidentResolutionType ===
          "Driver & Vehicle Replaced") && (
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Replacement Vehicle
          </label>

          <select
            value={replacementVehicleId}
            onChange={(event) => {
              setReplacementVehicleId(
                event.target.value
              );
            }}
            disabled={saving}
            className="w-full rounded-xl border border-slate-300 bg-white p-3"
          >
            <option value="">
              Select replacement vehicle
            </option>

            {vehicles.map((vehicle) => {
              const id = getValue(
                vehicle,
                "Vehicle ID"
              );

              const make = getValue(
                vehicle,
                "Make"
              );

              const model = getValue(
                vehicle,
                "Model"
              );

              const status = getValue(
                vehicle,
                "Status"
              );

              const pickupDate = getValue(
                resolveIncidentDispatch,
                "Pickup Date"
              );

              const busy =
                isDispatchResourceBusy(
                  id,
                  "Vehicle ID",
                  resolveIncidentDispatch,
                  dispatches
                );

              const currentVehicle =
                id ===
                getValue(
                  resolveIncidentDispatch,
                  "Vehicle ID",
                  "vehicleId"
                );

              const unavailable =
                status !== "Available";

              return (
                <option
                  key={id}
                  value={id}
                  disabled={
                    unavailable ||
                    busy ||
                    currentVehicle
                  }
                >
                  {make} {model} ({id}) —{" "}
                  {currentVehicle
                    ? "Current Vehicle"
                    : unavailable
                    ? status ||
                      "Unavailable"
                    : busy
                    ? "Busy"
                    : "Available"}
                </option>
              );
            })}
          </select>

          <p className="mt-2 text-xs text-slate-500">
            Select any available fleet vehicle
            that is not assigned to another
            active dispatch.
          </p>
        </div>
      )}
      {/* RESOLUTION NOTES */}
      <div
        className={
          incidentResolutionType ===
            "Driver Replaced" ||
          incidentResolutionType ===
            "Vehicle Replaced" ||
          incidentResolutionType ===
            "Driver & Vehicle Replaced"
            ? "md:col-span-2"
            : "md:col-span-2"
        }
      >
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Resolution Notes
        </label>

        <textarea
          value={resolveIncidentNotes}
          onChange={(event) =>
            setResolveIncidentNotes(
              event.target.value
            )
          }
          rows={3}
          placeholder="Optional notes about the incident resolution..."
          disabled={saving}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
        />
      </div>

    </div>

    {/* ACTION BUTTONS */}
    <div className="mt-6 flex justify-end gap-3">

      <button
        type="button"
        onClick={() => {
          setResolveIncidentDispatch(null);
          setActiveIncidentId("");
          setReplacementDriverId("");
          setReplacementVehicleId("");
          setIncidentResolutionType(
            "Continue Trip"
          );
          setResolveIncidentNotes("");
          setError("");
          setMessage("");
        }}
        disabled={saving}
        className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        Cancel
      </button>

      <button
        type="button"
        onClick={handleResolveIncident}
        disabled={saving}
        className="rounded-full bg-sky-600 px-5 py-2 text-sm font-bold text-white hover:bg-sky-700 disabled:opacity-50"
      >
        {saving
          ? "Resolving..."
          : "Resolve Incident"}
      </button>

    </div>
  </section>
)}
<section className="rounded-2xl bg-white p-6 shadow-sm">
  <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
    <div>
      <h2 className="text-2xl font-black text-slate-900">
        Dispatch Board
      </h2>

      <p className="mt-1 text-sm text-slate-500">
  Only fully paid, confirmed bookings without an existing dispatch are available.
</p>
    </div>

    <button
      type="button"
      onClick={() =>
        setRefreshKey(
          (current) => current + 1
        )
      }
      disabled={loading || saving}
      className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
    >
      Refresh
    </button>
  </div>

  {loading ? (
    <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
      Loading dispatch records...
    </div>
  ) : dispatches.length === 0 ? (
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
                      console.log(
                        "RENDERING DISPATCH:",
                        dispatch
                      );

                      const status = getValue(
                        dispatch,
                        "Dispatch Status",
                        "status"
                      ).trim();

                      const nextStatuses =
                        getNextStatuses(status);

                      const dispatchId = getValue(
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
                              {dispatchId || "—"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {getValue(dispatch, "Pickup Date")} {getValue(dispatch, "Pickup Time")}
                            </p>
                          </td>

                          <td className="p-3">
                            <p className="font-semibold text-slate-900">
                              {getValue(dispatch, "Booking ID", "bookingReference") || "—"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {getNumber(dispatch, "Passengers")} passenger(s)
                            </p>
                          </td>

                          <td className="p-3">
                            <p className="font-semibold text-slate-900">
                              {getValue(dispatch, "Pickup") || "—"}
                            </p>
                            <p className="my-1 text-xs text-slate-400">↓</p>
                            <p className="font-semibold text-slate-900">
                              {getValue(dispatch, "Destination") || "—"}
                            </p>
                          </td>

                          <td className="p-3">
                            <p className="font-semibold text-slate-900">
                              {getValue(dispatch, "Driver Name", "driverName") || "—"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {getValue(dispatch, "Driver ID", "driverId") || "—"}
                            </p>
                          </td>

                          <td className="p-3">
                            <p className="font-semibold text-slate-900">
                              {getValue(dispatch, "Vehicle", "vehicle") || "—"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {getValue(dispatch, "Vehicle ID", "vehicleId") || "—"}
                            </p>
                          </td>

                          <td className="p-3">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusClasses(status)}`}
                            >
                              {status || "Unknown"}
                            </span>
                          </td>

                          <td className="p-3">
                            {status === "Incident" ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenResolveIncident(dispatch)
                                }
                                disabled={saving}
                                className="rounded-full border border-orange-300 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700 transition hover:bg-orange-100 disabled:opacity-50"
                              >
                                Resolve Incident
                              </button>
                            ) : nextStatuses.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {nextStatuses.map((nextStatus) => (
                                  <button
                                    key={nextStatus}
                                    type="button"
                                    onClick={() => {
                                      if (nextStatus === "Incident") {
                                        setIncidentDispatch(dispatch);
                                        setIncidentType("");
                                        setIncidentLocation("");
                                        setIncidentDescription("");
                                        setIncidentActionTaken("");
                                        setIncidentNotes("");
                                        setError("");
                                        setMessage("");
                                        return;
                                      }

                                      handleStatusUpdate(
                                        dispatch,
                                        nextStatus
                                      );
                                    }}
                                    disabled={saving}
                                    className="rounded-full border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                                  >
                                    {nextStatus}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs font-semibold text-slate-400">
                                {TERMINAL_STATUSES.includes(status)
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