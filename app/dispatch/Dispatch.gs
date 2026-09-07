const DISPATCH_SHEET_NAME = "Dispatch";
const BOOKING_SHEET_NAME = "Booking Records";
const DRIVERS_SHEET_NAME = "Drivers";
const VEHICLES_SHEET_NAME = "Vehicles";
const INCIDENTS_SHEET_NAME = "Incidents";
/**
 * GET API
 *
 * Supported actions:
 *
 * ?action=list
 * ?action=listPayments
 * ?action=listDispatch
 * ?action=listDispatchResources
 */
function doGet(e) {
  try {

    const action = String(
      e &&
      e.parameter &&
      e.parameter.action
        ? e.parameter.action
        : ""
    ).trim();

    Logger.log(
      "GET request received. Action: " +
        action
    );

    /*
     * ==========================================
     * LIST BOOKINGS
     * ==========================================
     *
     * Request:
     * ?action=list
     */

    if (action === "list") {

      const spreadsheet =
        getDispatchSpreadsheet_();

      const bookingSheet =
        getRequiredSheet_(
          spreadsheet,
          BOOKING_SHEET_NAME
        );

      const values =
        bookingSheet
          .getDataRange()
          .getDisplayValues();

      if (values.length === 0) {
        return ContentService
          .createTextOutput(
            JSON.stringify({
              success: true,
              bookings: []
            })
          )
          .setMimeType(
            ContentService.MimeType.JSON
          );
      }

      const headers =
        values[0].map(
          function (header) {
            return String(
              header ?? ""
            ).trim();
          }
        );

      const bookings = [];

      for (
        let i = 1;
        i < values.length;
        i++
      ) {

        const row =
          values[i];

        const hasData =
          row.some(
            function (value) {
              return String(
                value ?? ""
              ).trim() !== "";
            }
          );

        if (!hasData) {
          continue;
        }

        const booking = {};

        headers.forEach(
          function (
            header,
            index
          ) {

            if (header) {
              booking[header] =
                row[index] ?? "";
            }

          }
        );

        bookings.push(
          booking
        );
      }

      Logger.log(
        "LIST BOOKINGS RESULT: " +
          JSON.stringify({
            count: bookings.length
          })
      );

      return ContentService
        .createTextOutput(
          JSON.stringify({
            success: true,
            bookings: bookings
          })
        )
        .setMimeType(
          ContentService.MimeType.JSON
        );
    }


    /*
     * ==========================================
     * LIST PAYMENTS
     * ==========================================
     *
     * Request:
     * ?action=listPayments
     */

    if (action === "listPayments") {

      const spreadsheet =
        getDispatchSpreadsheet_();

      const paymentsSheet =
        getRequiredSheet_(
          spreadsheet,
          "Payments"
        );

      const values =
        paymentsSheet
          .getDataRange()
          .getDisplayValues();

      if (values.length === 0) {
        return ContentService
          .createTextOutput(
            JSON.stringify({
              success: true,
              payments: []
            })
          )
          .setMimeType(
            ContentService.MimeType.JSON
          );
      }

      const headers =
        values[0].map(
          function (header) {
            return String(
              header ?? ""
            ).trim();
          }
        );

      const payments = [];

      for (
        let i = 1;
        i < values.length;
        i++
      ) {

        const row =
          values[i];

        const hasData =
          row.some(
            function (value) {
              return String(
                value ?? ""
              ).trim() !== "";
            }
          );

        if (!hasData) {
          continue;
        }

        const payment = {};

        headers.forEach(
          function (
            header,
            index
          ) {

            if (header) {
              payment[header] =
                row[index] ?? "";
            }

          }
        );

        payments.push(
          payment
        );
      }

      Logger.log(
        "LIST PAYMENTS RESULT: " +
          JSON.stringify({
            count: payments.length
          })
      );

      return ContentService
        .createTextOutput(
          JSON.stringify({
            success: true,
            payments: payments
          })
        )
        .setMimeType(
          ContentService.MimeType.JSON
        );
    }


    /*
     * ==========================================
     * LIST DISPATCH
     * ==========================================
     *
     * Request:
     * ?action=listDispatch
     */

    if (action === "listDispatch") {

      const result =
        listDispatchRecords();

      return ContentService
        .createTextOutput(
          JSON.stringify(result)
        )
        .setMimeType(
          ContentService.MimeType.JSON
        );
    }


    /*
     * ==========================================
     * LIST DISPATCH RESOURCES
     * ==========================================
     *
     * Returns the drivers and vehicles
     * needed by the Dispatch page.
     *
     * Request:
     * ?action=listDispatchResources
     */

    if (action === "listDispatchResources") {

      const spreadsheet =
        getDispatchSpreadsheet_();


      /*
       * ------------------------------------------
       * GET DRIVERS SHEET
       * ------------------------------------------
       */

      const driversSheet =
        getRequiredSheet_(
          spreadsheet,
          DRIVERS_SHEET_NAME
        );


      /*
       * ------------------------------------------
       * GET VEHICLES SHEET
       * ------------------------------------------
       */

      const vehiclesSheet =
        getRequiredSheet_(
          spreadsheet,
          VEHICLES_SHEET_NAME
        );


      /*
       * ------------------------------------------
       * READ DRIVERS
       * ------------------------------------------
       */

      const driverValues =
        driversSheet
          .getDataRange()
          .getDisplayValues();

      const drivers = [];

      if (
        driverValues.length >= 1
      ) {

        const driverHeaders =
          driverValues[0].map(
            function (header) {
              return String(
                header ?? ""
              ).trim();
            }
          );

        for (
          let i = 1;
          i < driverValues.length;
          i++
        ) {

          const row =
            driverValues[i];

          const hasData =
            row.some(
              function (value) {
                return String(
                  value ?? ""
                ).trim() !== "";
              }
            );

          if (!hasData) {
            continue;
          }

         const driverId =
  String(
    row[
      driverHeaders.indexOf(
        "Driver ID"
      )
    ] ?? ""
  ).trim();

if (!driverId) {
  continue;
}

const driver = {};

driverHeaders.forEach(
  function (
    header,
    index
  ) {
    if (header) {
      driver[header] =
        row[index] ?? "";
    }
  }
);

drivers.push(
  driver
);
        }
      }


      /*
       * ------------------------------------------
       * READ VEHICLES
       * ------------------------------------------
       */

      const vehicleValues =
        vehiclesSheet
          .getDataRange()
          .getDisplayValues();

      const vehicles = [];

      if (
        vehicleValues.length >= 1
      ) {

        const vehicleHeaders =
          vehicleValues[0].map(
            function (header) {
              return String(
                header ?? ""
              ).trim();
            }
          );

        for (
          let i = 1;
          i < vehicleValues.length;
          i++
        ) {

          const row =
            vehicleValues[i];

          const hasData =
            row.some(
              function (value) {
                return String(
                  value ?? ""
                ).trim() !== "";
              }
            );

          if (!hasData) {
            continue;
          }

          const vehicle = {};

          vehicleHeaders.forEach(
            function (
              header,
              index
            ) {

              if (header) {
                vehicle[header] =
                  row[index] ?? "";
              }

            }
          );

          vehicles.push(
            vehicle
          );
        }
      }


      /*
       * ------------------------------------------
       * LOG RESULT
       * ------------------------------------------
       */

      Logger.log(
        "LIST DISPATCH RESOURCES RESULT: " +
          JSON.stringify({
            drivers: drivers.length,
            vehicles: vehicles.length
          })
      );


      /*
       * ------------------------------------------
       * RETURN RESULT
       * ------------------------------------------
       */

      return ContentService
        .createTextOutput(
          JSON.stringify({
            success: true,
            action:
              "listDispatchResources",
            drivers: drivers,
            vehicles: vehicles
          })
        )
        .setMimeType(
          ContentService.MimeType.JSON
        );
    }
           /*
     * ==========================================
     * GET SETTINGS
     * ==========================================
     *
     * Request:
     * ?action=getSettings
     *
     * Reads management settings from the
     * Settings sheet.
     */

    if (action === "getSettings") {

      const spreadsheet =
        getDispatchSpreadsheet_();

      const settingsSheet =
        getRequiredSheet_(
          spreadsheet,
          "Settings"
        );

      const values =
        settingsSheet
          .getDataRange()
          .getDisplayValues();

      if (values.length < 2) {
        return ContentService
          .createTextOutput(
            JSON.stringify({
              success: true,
              action: "getSettings",
              settings: {}
            })
          )
          .setMimeType(
            ContentService.MimeType.JSON
          );
      }

      const settings = {};

      for (let i = 1; i < values.length; i++) {

        const setting =
          String(
            values[i][0] ?? ""
          ).trim();

        const value =
          String(
            values[i][1] ?? ""
          ).trim();

        if (setting) {
          settings[setting] = value;
        }
      }

      Logger.log(
        "GET SETTINGS RESULT: " +
        JSON.stringify(settings)
      );

      return ContentService
        .createTextOutput(
          JSON.stringify({
            success: true,
            action: "getSettings",
            settings: settings
          })
        )
        .setMimeType(
          ContentService.MimeType.JSON
        );
    }

    /*
     * ==========================================
     * UNKNOWN ACTION
     * ==========================================
     */

    return ContentService
      .createTextOutput(
        JSON.stringify({
          success: false,
          error:
            action
              ? `Unknown GET action: ${action}`
              : "GET action is required."
        })
      )
      .setMimeType(
        ContentService.MimeType.JSON
      );


  } catch (error) {

    Logger.log(
      "GET API ERROR: " +
        error.toString()
    );

    return ContentService
      .createTextOutput(
        JSON.stringify({
          success: false,
          error:
            error.toString()
        })
      )
      .setMimeType(
        ContentService.MimeType.JSON
      );
  }
}function getDispatchSpreadsheet_() {
  return SpreadsheetApp.openById(
    "1YRM_PENzcd_7B2_oHmwR5TkbDeE78ZhNGGg94JQY7Fc"
  );
}/**
 * Get a required sheet.
 */
function getRequiredSheet_(
  spreadsheet,
  sheetName
) {
  const sheet =
    spreadsheet.getSheetByName(
      sheetName
    );

  if (!sheet) {
    throw new Error(
      `Sheet "${sheetName}" was not found.`
    );
  }

  return sheet;
}function listDispatchRecords() {
  try {
    const spreadsheet =
      getDispatchSpreadsheet_();

    const sheet =
      getRequiredSheet_(
        spreadsheet,
        DISPATCH_SHEET_NAME
      );

    ensureDispatchHeaders_(sheet);

    const values =
      sheet
        .getDataRange()
        .getDisplayValues();

    if (values.length < 2) {
      return {
        success: true,
        action: "listDispatch",
        dispatches: []
      };
    }

    const headers = values[0];

    const dispatches =
      values
        .slice(1)
        .filter(function (row) {
          return String(
            row[0] ?? ""
          ).trim() !== "";
        })
        .map(function (row) {
          const dispatch = {};

          headers.forEach(
            function (
              header,
              index
            ) {
              dispatch[header] =
                row[index] ?? "";
            }
          );

          return dispatch;
        });

    return {
      success: true,
      action: "listDispatch",
      dispatches: dispatches
    };

  } catch (error) {

    Logger.log(
      "List Dispatch Error: " +
        error.toString()
    );

    return {
      success: false,
      action: "listDispatch",
      error: error.toString(),
      dispatches: []
    };
  }
}/**
 * Ensure the Dispatch sheet has the
 * required header row.
 */
function ensureDispatchHeaders_(sheet) {
  const headers = [
    "Dispatch ID",
    "Booking ID",
    "Dispatch Status",
    "Driver ID",
    "Driver Name",
    "Vehicle ID",
    "Vehicle",
    "Pickup Date",
    "Pickup Time",
    "Pickup",
    "Destination",
    "Passengers",
    "Service Type",
    "Tour Type",
    "Tour Destination",
    "Service Duration Minutes",
    "Turnaround Buffer Minutes",
    "Service End Time",
    "Occupied Until",
    "Assigned At",
    "En Route At",
    "Passenger Onboard At",
    "Incident At",
    "Completed At",
    "Notes"
  ];

  const currentLastColumn =
    sheet.getLastColumn();

  const currentLastRow =
    sheet.getLastRow();

  if (
    currentLastRow === 0 ||
    currentLastColumn === 0
  ) {
    sheet
      .getRange(
        1,
        1,
        1,
        headers.length
      )
      .setValues([headers]);

    return;
  }

  const existingHeaders =
    sheet
      .getRange(
        1,
        1,
        1,
        currentLastColumn
      )
      .getDisplayValues()[0]
      .map(function (header) {
        return String(
          header ?? ""
        ).trim();
      });

  const hasHeaders =
    existingHeaders.some(
      function (header) {
        return header !== "";
      }
    );

  if (!hasHeaders) {
    sheet
      .getRange(
        1,
        1,
        1,
        headers.length
      )
      .setValues([headers]);

    return;
  }

  const missingHeaders =
    headers.filter(
      function (header) {
        return (
          existingHeaders.indexOf(
            header
          ) === -1
        );
      }
    );

  if (
    missingHeaders.length === 0
  ) {
    return;
  }

  const startColumn =
    sheet.getLastColumn() + 1;

  sheet
    .getRange(
      1,
      startColumn,
      1,
      missingHeaders.length
    )
    .setValues([
      missingHeaders
    ]);
}
 /**
 * Create a dispatch for a confirmed booking.
 *
 * Required data:
 * {
 *   action: "createDispatch",
 *   bookingReference: "...",
 *   driverId: "...",
 *   vehicleId: "...",
 *   notes: "..."
 * }
 */
function createDispatch(data) {
  const lock =
    LockService.getScriptLock();

  lock.waitLock(30000);

  try {
    data = data || {};

    const bookingReference =
      String(
        data.bookingReference ?? ""
      ).trim();

    const driverId =
      String(
        data.driverId ?? ""
      ).trim();

    const vehicleId =
      String(
        data.vehicleId ?? ""
      ).trim();

    const notes =
      String(
        data.notes ?? ""
      ).trim();

    if (!bookingReference) {
      throw new Error(
        "Booking ID is required."
      );
    }

    if (!driverId) {
      throw new Error(
        "Driver ID is required."
      );
    }

    if (!vehicleId) {
      throw new Error(
        "Vehicle ID is required."
      );
    }

    const spreadsheet =
      getDispatchSpreadsheet_();

    const dispatchSheet =
      getRequiredSheet_(
        spreadsheet,
        DISPATCH_SHEET_NAME
      );

    const bookingSheet =
      getRequiredSheet_(
        spreadsheet,
        BOOKING_SHEET_NAME
      );

    const driversSheet =
      getRequiredSheet_(
        spreadsheet,
        DRIVERS_SHEET_NAME
      );

    const vehiclesSheet =
      getRequiredSheet_(
        spreadsheet,
        VEHICLES_SHEET_NAME
      );

    ensureDispatchHeaders_(
      dispatchSheet
    );

    /*
     * ------------------------------------------
     * READ BOOKING
     * ------------------------------------------
     */

    const bookingValues =
      bookingSheet
        .getDataRange()
        .getDisplayValues();

    if (bookingValues.length < 2) {
      throw new Error(
        "No booking records were found."
      );
    }

    const bookingHeaders =
      bookingValues[0].map(
        function (header) {
          return String(
            header ?? ""
          ).trim();
        }
      );

    const bookingIdColumn =
      bookingHeaders.indexOf(
        "Booking ID"
      );

    if (bookingIdColumn === -1) {
      throw new Error(
        'Column "Booking ID" was not found in Bookings.'
      );
    }

    let booking = null;

    for (
      let i = 1;
      i < bookingValues.length;
      i++
    ) {
      const row =
        bookingValues[i];

      const existingBookingId =
        String(
          row[bookingIdColumn] ?? ""
        ).trim();

      if (
        existingBookingId ===
        bookingReference
      ) {
        booking = {};

        bookingHeaders.forEach(
          function (
            header,
            index
          ) {
            if (header) {
              booking[header] =
                row[index] ?? "";
            }
          }
        );

        break;
      }
    }

    if (!booking) {
      throw new Error(
        `Booking ${bookingReference} was not found.`
      );
    }

   
    /*
 * ------------------------------------------
 * BOOKING STATUS VALIDATION
 * ------------------------------------------
 */

const bookingStatus =
  String(
    booking["Status"] ?? ""
  ).trim();

if (bookingStatus !== "Confirmed") {
  throw new Error(
    `Booking ${bookingReference} must be Confirmed before a dispatch can be created. Current status: ${bookingStatus || "Unknown"}.`
  );
}

/*
 * ------------------------------------------
 * PAYMENT VALIDATION
 * ------------------------------------------
 *
 * A booking must be FULLY PAID before
 * a dispatch can be created.
 *
 * Payment reconciliation is based on the
 * Payments ledger, not a stored Outstanding
 * field in Booking Records.
 */

const paymentsSheet =
  getRequiredSheet_(
    spreadsheet,
    "Payments"
  );

const totalRaw =
  String(
    booking["Price USD"] ??
    ""
  ).trim();

const total =
  Number(
    totalRaw.replace(/[^0-9.-]+/g, "")
  );

if (!Number.isFinite(total) || total < 0) {
  throw new Error(
    `Booking ${bookingReference} has an invalid total: ${totalRaw || "Missing"}.`
  );
}

const paymentValues =
  paymentsSheet
    .getDataRange()
    .getDisplayValues();

let totalPaidAlready = 0;

if (paymentValues.length >= 2) {
  for (
    let i = 1;
    i < paymentValues.length;
    i++
  ) {
    const existingBookingId =
      String(
        paymentValues[i][0] ?? ""
      ).trim();

    if (
      existingBookingId !==
      bookingReference
    ) {
      continue;
    }

    const existingAmount =
      Number(
        String(
          paymentValues[i][5] ?? ""
        ).replace(/[^0-9.-]+/g, "")
      );

    if (
      !Number.isFinite(existingAmount) ||
      existingAmount <= 0
    ) {
      continue;
    }

    totalPaidAlready += existingAmount;
  }
}

const outstanding =
  Math.max(
    total - totalPaidAlready,
    0
  );

const roundedOutstanding =
  Math.round(
    (outstanding + Number.EPSILON) * 100
  ) / 100;

const paymentStatus =
  roundedOutstanding <= 0.009
    ? "Paid"
    : totalPaidAlready > 0
      ? "Partially Paid"
      : "Unpaid";

if (roundedOutstanding > 0.009) {
  throw new Error(
    `Booking ${bookingReference} cannot be dispatched because it is not fully paid. Payment status: ${paymentStatus}. Outstanding balance: USD $${roundedOutstanding.toFixed(2)}.`
  );
}

/*
 * Payment reconciliation passed.
 * The booking is fully paid and may proceed.
 */

Logger.log(
  "PAYMENT VALIDATION PASSED: " +
  JSON.stringify({
    bookingReference: bookingReference,
    paymentStatus: paymentStatus,
    outstanding: outstanding
  })
);

    /*
     * ------------------------------------------
     * READ EXISTING DISPATCHES
     * ------------------------------------------
     */

    const dispatchValues =
      dispatchSheet
        .getDataRange()
        .getDisplayValues();

    if (
      dispatchValues.length >= 2
    ) {
      const dispatchHeaders =
        dispatchValues[0].map(
          function (header) {
            return String(
              header ?? ""
            ).trim();
          }
        );

      const dispatchBookingColumn =
        dispatchHeaders.indexOf(
          "Booking ID"
        );

      const dispatchIdColumn =
        dispatchHeaders.indexOf(
          "Dispatch ID"
        );

      if (
        dispatchBookingColumn !== -1
      ) {
        for (
          let i = 1;
          i < dispatchValues.length;
          i++
        ) {
          const existingBookingId =
            String(
              dispatchValues[i][
                dispatchBookingColumn
              ] ?? ""
            ).trim();

          if (
            existingBookingId ===
            bookingReference
          ) {
            const existingDispatchId =
              dispatchIdColumn !== -1
                ? String(
                    dispatchValues[i][
                      dispatchIdColumn
                    ] ?? ""
                  ).trim()
                : "";

            throw new Error(
              `A dispatch already exists for booking ${bookingReference}${existingDispatchId ? ": " + existingDispatchId : "."}`
            );
          }
        }
      }
    }

    /*
     * ------------------------------------------
     * READ DRIVER
     * ------------------------------------------
     */

    const driverValues =
      driversSheet
        .getDataRange()
        .getDisplayValues();

    if (
      driverValues.length < 2
    ) {
      throw new Error(
        "No driver records were found."
      );
    }

    const driverHeaders =
      driverValues[0].map(
        function (header) {
          return String(
            header ?? ""
          ).trim();
        }
      );

    const driverIdColumn =
      driverHeaders.indexOf(
        "Driver ID"
      );

    if (
      driverIdColumn === -1
    ) {
      throw new Error(
        'Column "Driver ID" was not found in Drivers.'
      );
    }

    let driver = null;

    for (
      let i = 1;
      i < driverValues.length;
      i++
    ) {
      const existingDriverId =
        String(
          driverValues[i][
            driverIdColumn
          ] ?? ""
        ).trim();

      if (
        existingDriverId ===
        driverId
      ) {
        driver = {};

        driverHeaders.forEach(
          function (
            header,
            index
          ) {
            if (header) {
              driver[header] =
                driverValues[i][
                  index
                ] ?? "";
            }
          }
        );

        break;
      }
    }

    if (!driver) {
      throw new Error(
        `Driver ${driverId} was not found.`
      );
    }

    const driverName =
      String(
        driver["Driver Name"] ??
        driver["Name"] ??
        ""
      ).trim();

    if (!driverName) {
      throw new Error(
        `Driver ${driverId} does not have a Driver Name.`
      );
    }

    /*
     * ------------------------------------------
     * READ VEHICLE
     * ------------------------------------------
     */

    const vehicleValues =
      vehiclesSheet
        .getDataRange()
        .getDisplayValues();

    if (
      vehicleValues.length < 2
    ) {
      throw new Error(
        "No vehicle records were found."
      );
    }

    const vehicleHeaders =
      vehicleValues[0].map(
        function (header) {
          return String(
            header ?? ""
          ).trim();
        }
      );

    const vehicleIdColumn =
      vehicleHeaders.indexOf(
        "Vehicle ID"
      );

    if (
      vehicleIdColumn === -1
    ) {
      throw new Error(
        'Column "Vehicle ID" was not found in Vehicles.'
      );
    }

    let vehicle = null;

    for (
      let i = 1;
      i < vehicleValues.length;
      i++
    ) {
      const existingVehicleId =
        String(
          vehicleValues[i][
            vehicleIdColumn
          ] ?? ""
        ).trim();

      if (
        existingVehicleId ===
        vehicleId
      ) {
        vehicle = {};

        vehicleHeaders.forEach(
          function (
            header,
            index
          ) {
            if (header) {
              vehicle[header] =
                vehicleValues[i][
                  index
                ] ?? "";
            }
          }
        );

        break;
      }
    }

    if (!vehicle) {
      throw new Error(
        `Vehicle ${vehicleId} was not found.`
      );
    }

    /*
     * ------------------------------------------
     * DRIVER / VEHICLE ASSIGNMENT VALIDATION
     * ------------------------------------------
     */

    const vehicleDriverId =
      String(
        vehicle["Driver ID"] ?? ""
      ).trim();

    if (
      vehicleDriverId &&
      vehicleDriverId !==
        driverId
    ) {
      throw new Error(
        `Vehicle ${vehicleId} is assigned to driver ${vehicleDriverId}, not ${driverId}.`
      );
    }
/*
 * ------------------------------------------
 * RESOURCE AVAILABILITY VALIDATION
 * ------------------------------------------
 *
 * A driver and vehicle must both be Available
 * before a new dispatch can be created.
 */

const currentDriverStatus =
  String(
    driver["Driver Status"] ??
    ""
  ).trim();

if (
  currentDriverStatus !==
  "Available"
) {
  throw new Error(
    `Driver ${driverId} is not Available. Current status: ${currentDriverStatus || "Unknown"}.`
  );
}

const currentVehicleStatus =
  String(
    vehicle["Status"] ??
    ""
  ).trim();

if (
  currentVehicleStatus !==
  "Available"
) {
  throw new Error(
    `Vehicle ${vehicleId} is not Available. Current status: ${currentVehicleStatus || "Unknown"}.`
  );
}
    /*
     * ------------------------------------------
     * VEHICLE NAME
     * ------------------------------------------
     */

    const make =
      String(
        vehicle["Make"] ?? ""
      ).trim();

    const model =
      String(
        vehicle["Model"] ?? ""
      ).trim();

    const vehicleName =
      [make, model]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      String(
        vehicle["Vehicle"] ?? ""
      ).trim() ||
      vehicleId;

    /*
     * ------------------------------------------
     * CREATE DISPATCH ID
     * ------------------------------------------
     */

    const now =
      new Date();

    const timezone =
      Session.getScriptTimeZone() ||
      "America/Jamaica";

    const datePart =
      Utilities.formatDate(
        now,
        timezone,
        "yyyyMMdd"
      );

    const timePart =
      Utilities.formatDate(
        now,
        timezone,
        "HHmmss"
      );

    const randomPart =
      Math.floor(
        100000 +
          Math.random() *
            900000
      );

    const dispatchId =
      `DSP-${datePart}-${timePart}-${randomPart}`;

    const timestamp =
      now.toISOString();

    /*
     * ------------------------------------------
     * BOOKING VALUES
     * ------------------------------------------
     */

    const pickupDate =
      String(
        booking["Pickup Date"] ??
        ""
      ).trim();

    const pickupTime =
      String(
        booking["Pickup Time"] ??
        ""
      ).trim();

    const pickup =
      String(
        booking["Pickup"] ??
        ""
      ).trim();

    const destination =
      String(
        booking["Destination"] ??
        ""
      ).trim();

    const passengers =
      String(
        booking["Passengers"] ??
        ""
      ).trim();

    /*
     * ------------------------------------------
     * SCHEDULING VALUES
     * ------------------------------------------
     *
     * Determine the service duration from the
     * existing booking service model.
     *
     * Airport Transfer:
     *   route-based duration.
     *
     * Tour:
     *   tour-type duration.
     *
     * Custom/Private Excursion:
     *   requires an explicit duration because
     *   there is no fixed default duration.
     */

    const serviceType =
      String(
        booking["Service Type"] ??
        booking["Service Category"] ??
        ""
      ).trim();

    const tourType =
      String(
        booking["Tour Type"] ??
        ""
      ).trim();

    const tourDestination =
      String(
        booking["Tour Destination / Attractions"] ??
        booking["Tour Destination"] ??
        ""
      ).trim();

    const turnaroundBufferMinutes =
      AVAILABILITY_DEFAULT_BUFFER_MINUTES;

    let serviceDurationMinutes = null;

    if (
      serviceType ===
      "Airport Transfer"
    ) {
      const transferKey =
        `${pickup}::${destination}`;

      const transferDurations = {
        "MBJ Airport::Montego Bay Hotels": 30,
        "MBJ Airport::Rose Hall": 45,
        "MBJ Airport::Falmouth": 60,
        "MBJ Airport::Runaway Bay": 90,
        "MBJ Airport::Negril": 120,
        "MBJ Airport::Ocho Rios": 150,
        "MBJ Airport::Kingston": 240
      };

      serviceDurationMinutes =
        transferDurations[
          transferKey
        ] ?? null;

    } else if (
      serviceType === "Tour"
    ) {
      const tourDurations = {
        "Private Tour": 360,
        "Full-Day Tour": 480
      };

      serviceDurationMinutes =
        tourDurations[
          tourType
        ] ?? null;

      if (
        serviceDurationMinutes === null
      ) {
        const customDurationRaw =
          String(
            booking[
              "Service Duration Minutes"
            ] ?? ""
          ).trim();

        if (customDurationRaw) {
          const customDuration =
            Number(
              customDurationRaw
            );

          if (
            Number.isFinite(
              customDuration
            ) &&
            customDuration > 0
          ) {
            serviceDurationMinutes =
              customDuration;
          }
        }
      }
    }

    if (
      serviceDurationMinutes ===
      null
    ) {
      throw new Error(
        `Booking ${bookingReference} does not have a supported service duration. Service Type: ${serviceType || "Unknown"}. Tour Type: ${tourType || "Unknown"}. For Custom/Private Excursion, an explicit duration must be provided before dispatch can be created.`
      );
    }

    const availabilityWindow =
      buildAvailabilityWindow_(
        pickupDate,
        pickupTime,
        serviceDurationMinutes,
        turnaroundBufferMinutes
      );

    if (!availabilityWindow) {
      throw new Error(
        `Booking ${bookingReference} has an invalid Pickup Date or Pickup Time and cannot be scheduled.`
      );
    }

    const serviceEndTime =
      Utilities.formatDate(
        availabilityWindow.serviceEnd,
        AVAILABILITY_TIMEZONE,
        "yyyy-MM-dd HH:mm"
      );

    const occupiedUntil =
      Utilities.formatDate(
        availabilityWindow.occupiedEnd,
        AVAILABILITY_TIMEZONE,
        "yyyy-MM-dd HH:mm"
      );

      /*
       * ------------------------------------------
       * TIME-WINDOW AVAILABILITY VALIDATION
       * ------------------------------------------
       *
       * Prevent the selected driver or vehicle
       * from being assigned to an overlapping
       * active dispatch reservation.
       */

      const existingDispatchRecords = [];

      if (
        dispatchValues.length >= 2
      ) {
        const existingDispatchHeaders =
          dispatchValues[0].map(
            function (header) {
              return String(
                header ?? ""
              ).trim();
            }
          );

        for (
          let i = 1;
          i < dispatchValues.length;
          i++
        ) {
          const record = {};

          existingDispatchHeaders.forEach(
            function (
              header,
              index
            ) {
              if (header) {
                record[header] =
                  dispatchValues[i][
                    index
                  ] ?? "";
              }
            }
          );

          existingDispatchRecords.push(
            record
          );
        }
      }

      const driverConflicts =
        findDispatchResourceWindowConflicts_(
          driverId,
          "driver",
          availabilityWindow,
          existingDispatchRecords,
          getDispatchReservationWindow_
        );

      if (
        driverConflicts.length > 0
      ) {
        const conflict =
          driverConflicts[0];

        const conflictDispatchId =
          String(
            conflict["Dispatch ID"] || ""
          ).trim();

        throw new Error(
          `Driver ${driverId} is already reserved during this time window${conflictDispatchId ? " by dispatch " + conflictDispatchId : ""}.`
        );
      }

      const vehicleConflicts =
        findDispatchResourceWindowConflicts_(
          vehicleId,
          "vehicle",
          availabilityWindow,
          existingDispatchRecords,
          getDispatchReservationWindow_
        );

      if (
        vehicleConflicts.length > 0
      ) {
        const conflict =
          vehicleConflicts[0];

        const conflictDispatchId =
          String(
            conflict["Dispatch ID"] || ""
          ).trim();

        throw new Error(
          `Vehicle ${vehicleId} is already reserved during this time window${conflictDispatchId ? " by dispatch " + conflictDispatchId : ""}.`
        );
      }

      /*
       * ------------------------------------------
       * WRITE DISPATCH
       * ------------------------------------------
       */

      const dispatchHeaders =
          dispatchSheet
        .getRange(
          1,
          1,
          1,
          dispatchSheet.getLastColumn()
        )
        .getDisplayValues()[0]
        .map(
          function (header) {
            return String(
              header ?? ""
            ).trim();
          }
        );

    const dispatchRecord = {};

    dispatchHeaders.forEach(
      function (header) {
        dispatchRecord[header] =
          "";
      }
    );

    dispatchRecord[
      "Dispatch ID"
    ] = dispatchId;

    dispatchRecord[
      "Booking ID"
    ] = bookingReference;

    dispatchRecord[
      "Dispatch Status"
    ] = "Assigned";

    dispatchRecord[
      "Driver ID"
    ] = driverId;

    dispatchRecord[
      "Driver Name"
    ] = driverName;

    dispatchRecord[
      "Vehicle ID"
    ] = vehicleId;

    dispatchRecord[
      "Vehicle"
    ] = vehicleName;

    dispatchRecord[
      "Pickup Date"
    ] = pickupDate;

    dispatchRecord[
      "Pickup Time"
    ] = pickupTime;

    dispatchRecord[
      "Pickup"
    ] = pickup;

    dispatchRecord[
      "Destination"
    ] = destination;

    dispatchRecord[
      "Passengers"
    ] = passengers;

    dispatchRecord[
      "Service Type"
    ] = serviceType;

    dispatchRecord[
      "Tour Type"
    ] = tourType;

    dispatchRecord[
      "Tour Destination"
    ] = tourDestination;

    dispatchRecord[
      "Service Duration Minutes"
    ] = serviceDurationMinutes;

    dispatchRecord[
      "Turnaround Buffer Minutes"
    ] = turnaroundBufferMinutes;

    dispatchRecord[
      "Service End Time"
    ] = serviceEndTime;

    dispatchRecord[
      "Occupied Until"
    ] = occupiedUntil;

    dispatchRecord[
      "Assigned At"
    ] = timestamp;

    dispatchRecord[
      "En Route At"
    ] = "";

    dispatchRecord[
      "Passenger Onboard At"
    ] = "";

    dispatchRecord[
      "Incident At"
    ] = "";

    dispatchRecord[
      "Completed At"
    ] = "";

    dispatchRecord[
      "Notes"
    ] = notes;

    const newRow =
      dispatchHeaders.map(
        function (header) {
          return dispatchRecord[
            header
          ] ?? "";
        }
      );

    dispatchSheet.appendRow(
      newRow
    );

        /*
     * ------------------------------------------
     * UPDATE DRIVER STATUS
     * ------------------------------------------
     */

    const driverStatusColumn =
      driverHeaders.indexOf(
        "Driver Status"
      );

    if (
      driverStatusColumn !== -1
    ) {
      let driverSheetRow =
        null;

      for (
        let i = 1;
        i < driverValues.length;
        i++
      ) {
        const existingDriverId =
          String(
            driverValues[i][
              driverIdColumn
            ] ?? ""
          ).trim();

        if (
          existingDriverId ===
          driverId
        ) {
          driverSheetRow =
            i + 1;
          break;
        }
      }

      if (
        driverSheetRow !== null
      ) {
        driversSheet
          .getRange(
            driverSheetRow,
            driverStatusColumn + 1
          )
          .setValue(
            "On Trip"
          );
      }
    }    /*
     * ------------------------------------------
     * UPDATE VEHICLE STATUS
     * ------------------------------------------
     *
     * A newly created dispatch starts as
     * "Assigned", so the assigned vehicle
     * must immediately become "On Trip".
     */

    synchronizeVehicleStatusForDispatch_(
      spreadsheet,
      vehicleId,
      "Assigned"
    );

    Logger.log(
      "CREATE DISPATCH RESULT: " +
        JSON.stringify({
          dispatchId:
            dispatchId,
          bookingReference:
            bookingReference,
          driverId:
            driverId,
          vehicleId:
            vehicleId,
          status:
            "Assigned"
        })
    );

    return {
      success: true,
      action:
        "createDispatch",
      dispatchId:
        dispatchId,
      bookingReference:
        bookingReference,
      status:
        "Assigned",
      previousStatus:
        "",
      driverId:
        driverId,
      driverName:
        driverName,
      vehicleId:
        vehicleId,
      vehicle:
        vehicleName,
      message:
        "Dispatch created successfully."
    };

  } catch (error) {

    Logger.log(
      "Create Dispatch Error: " +
        error.toString()
    );

    return {
      success: false,
      action:
        "createDispatch",
      error:
        error.toString()
    };

  } finally {
    lock.releaseLock();
  }
}/**
 * Update the operational status of a dispatch.
 *
 * Supported lifecycle:
 *
 * Assigned
 *    ↓
 * En Route
 *    ↓
 * Passenger Onboard
 *    ↓
 * Completed
 *
 * Incident may occur from an active dispatch:
 *
 * Assigned / En Route / Passenger Onboard
 *    ↓
 * Incident
 */
function updateDispatchStatus(data) {
  const lock =
    LockService.getScriptLock();

  lock.waitLock(30000);

  try {
    data = data || {};

    const dispatchId =
      String(
        data.dispatchId ?? ""
      ).trim();

    const requestedStatus =
      String(
        data.status ?? ""
      ).trim();

    const notes =
      String(
        data.notes ?? ""
      ).trim();

    if (!dispatchId) {
      throw new Error(
        "Dispatch ID is required."
      );
    }

    if (!requestedStatus) {
      throw new Error(
        "Dispatch status is required."
      );
    }

    const allowedStatuses = [
      "Assigned",
      "En Route",
      "Passenger Onboard",
      "Incident",
      "Completed"
    ];

    if (
      !allowedStatuses.includes(
        requestedStatus
      )
    ) {
      throw new Error(
        `Unsupported dispatch status: ${requestedStatus}`
      );
    }

    const spreadsheet =
      getDispatchSpreadsheet_();

    const dispatchSheet =
      getRequiredSheet_(
        spreadsheet,
        DISPATCH_SHEET_NAME
      );

    ensureDispatchHeaders_(
      dispatchSheet
    );

    const values =
      dispatchSheet
        .getDataRange()
        .getDisplayValues();

    if (values.length < 2) {
      throw new Error(
        "No dispatch records were found."
      );
    }

    const headers =
      values[0].map(
        function (header) {
          return String(
            header ?? ""
          ).trim();
        }
      );

    const dispatchIdColumn =
      headers.indexOf(
        "Dispatch ID"
      );

    const statusColumn =
      headers.indexOf(
        "Dispatch Status"
      );

    const driverIdColumn =
      headers.indexOf(
        "Driver ID"
      );

    const notesColumn =
      headers.indexOf(
        "Notes"
      );

    if (
      dispatchIdColumn === -1
    ) {
      throw new Error(
        'Column "Dispatch ID" was not found in Dispatch.'
      );
    }

    if (
      statusColumn === -1
    ) {
      throw new Error(
        'Column "Dispatch Status" was not found in Dispatch.'
      );
    }

    if (
      driverIdColumn === -1
    ) {
      throw new Error(
        'Column "Driver ID" was not found in Dispatch.'
      );
    }

    let dispatchRowNumber =
      null;

    let dispatchRow =
      null;

    for (
      let i = 1;
      i < values.length;
      i++
    ) {
      const existingDispatchId =
        String(
          values[i][
            dispatchIdColumn
          ] ?? ""
        ).trim();

      if (
        existingDispatchId ===
        dispatchId
      ) {
        dispatchRowNumber =
          i + 1;

        dispatchRow =
          values[i];

        break;
      }
    }

    if (
      dispatchRowNumber === null ||
      !dispatchRow
    ) {
      throw new Error(
        `Dispatch ${dispatchId} was not found.`
      );
    }

    const previousStatus =
      String(
        dispatchRow[
          statusColumn
        ] ?? ""
      ).trim();

    const driverId =
      String(
        dispatchRow[
          driverIdColumn
        ] ?? ""
      ).trim();

    if (!driverId) {
      throw new Error(
        `Dispatch ${dispatchId} does not have a Driver ID.`
      );
    }

    /*
     * ------------------------------------------
     * VALIDATE STATUS TRANSITION
     * ------------------------------------------
     */

    const validTransitions = {
      "Assigned": [
        "En Route",
        "Incident"
      ],

      "En Route": [
        "Passenger Onboard",
        "Incident"
      ],

      "Passenger Onboard": [
        "Completed",
        "Incident"
      ],

      "Incident": [
        "En Route",
        "Passenger Onboard",
        "Completed"
      ],

      "Completed": []
    };

    const possibleNextStatuses =
      validTransitions[
        previousStatus
      ] ?? [];

    /*
     * Allow an Incident status
     * from any non-terminal operational
     * state.
     */
    if (
      requestedStatus !==
        previousStatus &&
      !possibleNextStatuses.includes(
        requestedStatus
      )
    ) {
      throw new Error(
        `Invalid dispatch status transition: ${previousStatus || "Unknown"} → ${requestedStatus}.`
      );
    }

    if (
      previousStatus ===
        "Completed" &&
      requestedStatus !==
        "Completed"
    ) {
      throw new Error(
        "Completed dispatches cannot be reopened."
      );
    }

    /*
     * ------------------------------------------
     * TIMESTAMP COLUMN
     * ------------------------------------------
     */

    const timestamp =
      new Date();

    let timestampColumnName =
      "";

    if (
      requestedStatus ===
      "Assigned"
    ) {
      timestampColumnName =
        "Assigned At";
    } else if (
      requestedStatus ===
      "En Route"
    ) {
      timestampColumnName =
        "En Route At";
    } else if (
      requestedStatus ===
      "Passenger Onboard"
    ) {
      timestampColumnName =
        "Passenger Onboard At";
    } else if (
      requestedStatus ===
      "Incident"
    ) {
      timestampColumnName =
        "Incident At";
    } else if (
      requestedStatus ===
      "Completed"
    ) {
      timestampColumnName =
        "Completed At";
    }

    const timestampColumn =
      headers.indexOf(
        timestampColumnName
      );

    if (
      timestampColumn === -1
    ) {
      throw new Error(
        `Column "${timestampColumnName}" was not found in Dispatch.`
      );
    }

    /*
     * ------------------------------------------
     * WRITE STATUS
     * ------------------------------------------
     */

    dispatchSheet
      .getRange(
        dispatchRowNumber,
        statusColumn + 1
      )
      .setValue(
        requestedStatus
      );

    /*
     * Write lifecycle timestamp.
     */
    dispatchSheet
      .getRange(
        dispatchRowNumber,
        timestampColumn + 1
      )
      .setValue(
        timestamp
      );

    /*
     * Update notes only when notes
     * were supplied.
     */
    if (
      notes &&
      notesColumn !== -1
    ) {
      dispatchSheet
        .getRange(
          dispatchRowNumber,
          notesColumn + 1
        )
        .setValue(
          notes
        );
    }

    /*
     * ------------------------------------------
     * DRIVER STATUS SYNCHRONIZATION
     * ------------------------------------------
     *
     * Active dispatch states:
     *
     * Assigned
     * En Route
     * Passenger Onboard
     * Incident
     *
     * Completed:
     *
     * Available unless another active
     * dispatch still exists for the driver.
     */

   /*
 * ------------------------------------------
 * DRIVER STATUS SYNCHRONIZATION
 * ------------------------------------------
 */

/*
 * ------------------------------------------
 * DRIVER STATUS SYNCHRONIZATION
 * ------------------------------------------
 */

synchronizeDriverStatusForDispatch_(
  spreadsheet,
  driverId,
  requestedStatus
);

/*
 * ------------------------------------------
 * VEHICLE STATUS SYNCHRONIZATION
 * ------------------------------------------
 */

const vehicleIdColumn =
  headers.indexOf(
    "Vehicle ID"
  );

if (
  vehicleIdColumn === -1
) {
  throw new Error(
    'Column "Vehicle ID" was not found in Dispatch.'
  );
}

const vehicleId =
  String(
    dispatchRow[
      vehicleIdColumn
    ] ?? ""
  ).trim();

if (!vehicleId) {
  throw new Error(
    `Dispatch ${dispatchId} does not have a Vehicle ID.`
  );
}

synchronizeVehicleStatusForDispatch_(
  spreadsheet,
  vehicleId,
  requestedStatus
);


    Logger.log(
      "UPDATE DISPATCH STATUS RESULT: " +
        JSON.stringify({
          dispatchId:
            dispatchId,
          previousStatus:
            previousStatus,
          status:
            requestedStatus,
          driverId:
            driverId
        })
    );

    return {
      success: true,
      action:
        "updateDispatchStatus",
      dispatchId:
        dispatchId,
      previousStatus:
        previousStatus,
      status:
        requestedStatus,
      driverId:
        driverId,
      message:
        `Dispatch status updated to ${requestedStatus}.`
    };

  } catch (error) {

    Logger.log(
      "Update Dispatch Status Error: " +
        error.toString()
    );

    return {
      success: false,
      action:
        "updateDispatchStatus",
      error:
        error.toString()
    };

  } finally {
    lock.releaseLock();
  }
}/**
 * Synchronize a driver's operational status
 * with the dispatch lifecycle.
 *
 * Active dispatch statuses:
 *   Assigned
 *   En Route
 *   Passenger Onboard
 *   Incident
 *
 * Completed dispatches release the driver
 * when the driver has no other active dispatch.
 */
function synchronizeDriverStatusForDispatch_(
  spreadsheet,
  driverId,
  dispatchStatus
) {
  const normalizedDriverId =
    String(
      driverId ?? ""
    ).trim();

  const normalizedStatus =
    String(
      dispatchStatus ?? ""
    ).trim();

  if (!normalizedDriverId) {
    throw new Error(
      "Driver ID is required for driver status synchronization."
    );
  }

  const activeStatuses = [
    "Assigned",
    "En Route",
    "Passenger Onboard",
    "Incident"
  ];

  const terminalStatuses = [
    "Completed"
  ];

  if (
    !activeStatuses.includes(
      normalizedStatus
    ) &&
    !terminalStatuses.includes(
      normalizedStatus
    )
  ) {
    throw new Error(
      `Unsupported dispatch status for driver synchronization: ${normalizedStatus}`
    );
  }

  const driversSheet =
    getRequiredSheet_(
      spreadsheet,
      DRIVERS_SHEET_NAME
    );

  const dispatchSheet =
    getRequiredSheet_(
      spreadsheet,
      DISPATCH_SHEET_NAME
    );

  /*
   * ------------------------------------------
   * FIND DRIVER
   * ------------------------------------------
   */

  const driverValues =
    driversSheet
      .getDataRange()
      .getDisplayValues();

  if (
    driverValues.length < 2
  ) {
    throw new Error(
      "No driver records were found."
    );
  }

  const driverHeaders =
    driverValues[0].map(
      function (header) {
        return String(
          header ?? ""
        ).trim();
      }
    );

  const driverIdColumn =
    driverHeaders.indexOf(
      "Driver ID"
    );

  const driverStatusColumn =
    driverHeaders.indexOf(
      "Driver Status"
    );

  if (
    driverIdColumn === -1
  ) {
    throw new Error(
      'Column "Driver ID" was not found in Drivers.'
    );
  }

  if (
    driverStatusColumn === -1
  ) {
    throw new Error(
      'Column "Driver Status" was not found in Drivers.'
    );
  }

  let driverRowNumber =
    null;

  for (
    let i = 1;
    i < driverValues.length;
    i++
  ) {
    const existingDriverId =
      String(
        driverValues[i][
          driverIdColumn
        ] ?? ""
      ).trim();

    if (
      existingDriverId ===
      normalizedDriverId
    ) {
      driverRowNumber =
        i + 1;

      break;
    }
  }

  if (
    driverRowNumber === null
  ) {
    throw new Error(
      `Driver ${normalizedDriverId} was not found in Drivers.`
    );
  }

  /*
   * ------------------------------------------
   * ACTIVE DISPATCH
   * ------------------------------------------
   *
   * Any active dispatch means the driver
   * must remain On Trip.
   */

  let targetStatus =
    "Available";

  if (
    activeStatuses.includes(
      normalizedStatus
    )
  ) {
    targetStatus =
      "On Trip";
  } else {

    /*
     * ----------------------------------------
     * COMPLETED
     * ----------------------------------------
     *
     * The dispatch has just become Completed.
     * Check whether this driver still has
     * another active dispatch.
     */

    const dispatchValues =
      dispatchSheet
        .getDataRange()
        .getDisplayValues();

    if (
      dispatchValues.length >= 2
    ) {
      const dispatchHeaders =
        dispatchValues[0].map(
          function (header) {
            return String(
              header ?? ""
            ).trim();
          }
        );

      const dispatchDriverColumn =
        dispatchHeaders.indexOf(
          "Driver ID"
        );

      const dispatchStatusColumn =
        dispatchHeaders.indexOf(
          "Dispatch Status"
        );

      if (
        dispatchDriverColumn === -1
      ) {
        throw new Error(
          'Column "Driver ID" was not found in Dispatch.'
        );
      }

      if (
        dispatchStatusColumn === -1
      ) {
        throw new Error(
          'Column "Dispatch Status" was not found in Dispatch.'
        );
      }

      for (
        let i = 1;
        i < dispatchValues.length;
        i++
      ) {
        const existingDriverId =
          String(
            dispatchValues[i][
              dispatchDriverColumn
            ] ?? ""
          ).trim();

        const existingStatus =
          String(
            dispatchValues[i][
              dispatchStatusColumn
            ] ?? ""
          ).trim();

        if (
          existingDriverId ===
            normalizedDriverId &&
          activeStatuses.includes(
            existingStatus
          )
        ) {
          targetStatus =
            "On Trip";

          break;
        }
      }
    }
  }

  /*
   * ------------------------------------------
   * WRITE DRIVER STATUS
   * ------------------------------------------
   */

  driversSheet
    .getRange(
      driverRowNumber,
      driverStatusColumn + 1
    )
    .setValue(
      targetStatus
    );

  Logger.log(
    "DRIVER STATUS SYNCHRONIZED: " +
      JSON.stringify({
        driverId:
          normalizedDriverId,
        dispatchStatus:
          normalizedStatus,
        driverStatus:
          targetStatus
      })
  );

  return {
    success: true,
    driverId:
      normalizedDriverId,
    dispatchStatus:
      normalizedStatus,
    driverStatus:
      targetStatus
  };
}/**
 * Synchronize a vehicle's operational status
 * with the dispatch lifecycle.
 *
 * Active dispatch statuses:
 *   Assigned
 *   En Route
 *   Passenger Onboard
 *   Incident
 *
 * Completed dispatches release the vehicle
 * when the vehicle has no other active dispatch.
 */
function synchronizeVehicleStatusForDispatch_(
  spreadsheet,
  vehicleId,
  dispatchStatus
) {
  const normalizedVehicleId =
    String(
      vehicleId ?? ""
    ).trim();

  const normalizedStatus =
    String(
      dispatchStatus ?? ""
    ).trim();

  if (!normalizedVehicleId) {
    throw new Error(
      "Vehicle ID is required for vehicle status synchronization."
    );
  }

  const activeStatuses = [
    "Assigned",
    "En Route",
    "Passenger Onboard",
    "Incident"
  ];

  const terminalStatuses = [
    "Completed"
  ];

  if (
    !activeStatuses.includes(
      normalizedStatus
    ) &&
    !terminalStatuses.includes(
      normalizedStatus
    )
  ) {
    throw new Error(
      `Unsupported dispatch status for vehicle synchronization: ${normalizedStatus}`
    );
  }

  const vehiclesSheet =
    getRequiredSheet_(
      spreadsheet,
      VEHICLES_SHEET_NAME
    );

  const dispatchSheet =
    getRequiredSheet_(
      spreadsheet,
      DISPATCH_SHEET_NAME
    );

  /*
   * ------------------------------------------
   * FIND VEHICLE
   * ------------------------------------------
   */

  const vehicleValues =
    vehiclesSheet
      .getDataRange()
      .getDisplayValues();

  if (
    vehicleValues.length < 2
  ) {
    throw new Error(
      "No vehicle records were found."
    );
  }

  const vehicleHeaders =
    vehicleValues[0].map(
      function (header) {
        return String(
          header ?? ""
        ).trim();
      }
    );

  const vehicleIdColumn =
    vehicleHeaders.indexOf(
      "Vehicle ID"
    );

  const vehicleStatusColumn =
    vehicleHeaders.indexOf(
      "Status"
    );

  if (
    vehicleIdColumn === -1
  ) {
    throw new Error(
      'Column "Vehicle ID" was not found in Vehicles.'
    );
  }

  if (
    vehicleStatusColumn === -1
  ) {
    throw new Error(
      'Column "Status" was not found in Vehicles.'
    );
  }

  let vehicleRowNumber =
    null;

  for (
    let i = 1;
    i < vehicleValues.length;
    i++
  ) {
    const existingVehicleId =
      String(
        vehicleValues[i][
          vehicleIdColumn
        ] ?? ""
      ).trim();

    if (
      existingVehicleId ===
      normalizedVehicleId
    ) {
      vehicleRowNumber =
        i + 1;

      break;
    }
  }

  if (
    vehicleRowNumber === null
  ) {
    throw new Error(
      `Vehicle ${normalizedVehicleId} was not found in Vehicles.`
    );
  }

  /*
   * ------------------------------------------
   * DETERMINE TARGET STATUS
   * ------------------------------------------
   */

  let targetStatus =
    "Available";

  /*
   * Any active dispatch means the vehicle
   * remains On Trip.
   */
  if (
    activeStatuses.includes(
      normalizedStatus
    )
  ) {
    targetStatus =
      "On Trip";
  } else {

    /*
     * ----------------------------------------
     * COMPLETED
     * ----------------------------------------
     *
     * Only release the vehicle if it has
     * no other active dispatch.
     */

    const dispatchValues =
      dispatchSheet
        .getDataRange()
        .getDisplayValues();

    if (
      dispatchValues.length >= 2
    ) {
      const dispatchHeaders =
        dispatchValues[0].map(
          function (header) {
            return String(
              header ?? ""
            ).trim();
          }
        );

      const dispatchVehicleColumn =
        dispatchHeaders.indexOf(
          "Vehicle ID"
        );

      const dispatchStatusColumn =
        dispatchHeaders.indexOf(
          "Dispatch Status"
        );

      if (
        dispatchVehicleColumn === -1
      ) {
        throw new Error(
          'Column "Vehicle ID" was not found in Dispatch.'
        );
      }

      if (
        dispatchStatusColumn === -1
      ) {
        throw new Error(
          'Column "Dispatch Status" was not found in Dispatch.'
        );
      }

      for (
        let i = 1;
        i < dispatchValues.length;
        i++
      ) {
        const existingVehicleId =
          String(
            dispatchValues[i][
              dispatchVehicleColumn
            ] ?? ""
          ).trim();

        const existingStatus =
          String(
            dispatchValues[i][
              dispatchStatusColumn
            ] ?? ""
          ).trim();

        if (
          existingVehicleId ===
            normalizedVehicleId &&
          activeStatuses.includes(
            existingStatus
          )
        ) {
          targetStatus =
            "On Trip";

          break;
        }
      }
    }
  }

  /*
   * ------------------------------------------
   * WRITE VEHICLE STATUS
   * ------------------------------------------
   */

  vehiclesSheet
    .getRange(
      vehicleRowNumber,
      vehicleStatusColumn + 1
    )
    .setValue(
      targetStatus
    );

  Logger.log(
    "VEHICLE STATUS SYNCHRONIZED: " +
      JSON.stringify({
        vehicleId:
          normalizedVehicleId,
        dispatchStatus:
          normalizedStatus,
        vehicleStatus:
          targetStatus
      })
  );

  return {
    success: true,
    vehicleId:
      normalizedVehicleId,
    dispatchStatus:
      normalizedStatus,
    vehicleStatus:
      targetStatus
  };
}