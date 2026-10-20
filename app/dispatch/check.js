// @ts-nocheck
function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    Logger.log("=== BOOKING POST REQUEST START ===");

    const spreadsheet = SpreadsheetApp.openById(
      "1YRM_PENzcd_7B2_oHmwR5TkbDeE78ZhNGGg94JQY7Fc"
    );

    const sheet = spreadsheet.getSheetByName(
      "Booking Records"
    );

    if (!sheet) {
      throw new Error(
        'Booking sheet "Booking Records" was not found.'
      );
    }

    if (
      !e ||
      !e.postData ||
      !e.postData.contents
    ) {
      throw new Error(
        "No request data was received."
      );
    }

    const data = JSON.parse(
      e.postData.contents
    );

    Logger.log("Request received:");
    Logger.log(JSON.stringify(data));

    if (data.action === "checkDispatchResourceAvailability") {
      const result =
        checkDispatchResourceAvailability(data);

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
     * RECORD PAYMENT
     * ==========================================
     *
     * IMPORTANT:
     * Payment processing is handled ONLY by
     * recordPayment(data).
     *
     * Do not duplicate payment-processing
     * logic inside doPost().
     *
     * recordPayment() is responsible for:
     * - validating payment
     * - preventing duplicate references
     * - calculating cumulative payment
     * - calculating deposit
     * - calculating balance
     * - writing the Payments ledger
     * - updating Booking Records
     * - automatically confirming the booking
     *   once the required 25% deposit is paid
     */

    if (data.action === "recordPayment") {
      const result = recordPayment(data);

      return ContentService
        .createTextOutput(
          JSON.stringify(result)
        )
        .setMimeType(
          ContentService.MimeType.JSON
        );
    } if (data.action === "reconcileResourceStatus") {
      const result = reconcileResourceStatus(data);

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
     * CREATE INCIDENT
     * ==========================================
     *
     * Creates an incident record and moves the
     * associated dispatch into Incident status.
     */

    if (data.action === "createIncident") {
      const result = createIncident(data);

      return ContentService
        .createTextOutput(
          JSON.stringify(result)
        )
        .setMimeType(
          ContentService.MimeType.JSON
        );
    }

    if (data.action === "resolveIncident") {
      const result = resolveIncident(data);

      return ContentService
        .createTextOutput(
          JSON.stringify(result)
        )
        .setMimeType(
          ContentService.MimeType.JSON
        );
    }

    if (data.action === "getActiveIncident") {
      const result = getActiveIncident(data);

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
   * RESOLVE INCIDENT
   * ==========================================
   *
   * Resolves an Incident by optionally assigning
   * a replacement driver and vehicle.
   *
   * Workflow:
   *
   * Incident
   *    ↓
   * Validate replacement resources
   *    ↓
   * Release original resources
   *    ↓
   * Assign replacement resources
   *    ↓
   * Update Dispatch → En Route
   *    ↓
   * Record replacement details
   *    ↓
   * Record Resolved At
   */

    function resolveIncident(data) {

      const lock =
        LockService.getScriptLock();

      lock.waitLock(30000);

      try {

        data = data || {};

        const incidentId =
          String(
            data.incidentId ?? ""
          ).trim();

        const replacementDriverId =
          String(
            data.replacementDriverId ?? ""
          ).trim();

        const replacementVehicleId =
          String(
            data.replacementVehicleId ?? ""
          ).trim();

        const resolutionType =
          String(
            data.resolutionType ?? ""
          ).trim();

        const validResolutionTypes = [
          "Continue Trip",
          "Rerouted",
          "No Replacement Required",
          "Driver Replaced",
          "Vehicle Replaced",
          "Driver & Vehicle Replaced"
        ];

        if (
          !validResolutionTypes.includes(
            resolutionType
          )
        ) {
          throw new Error(
            `Invalid incident resolution type: ${resolutionType || "Missing"}.`
          );
        }

        const requiresDriverReplacement =
          resolutionType === "Driver Replaced" ||
          resolutionType === "Driver & Vehicle Replaced";

        const requiresVehicleReplacement =
          resolutionType === "Vehicle Replaced" ||
          resolutionType === "Driver & Vehicle Replaced";

        const notes =
          String(
            data.notes ?? ""
          ).trim();

        if (!incidentId) {
          throw new Error(
            "Incident ID is required."
          );
        }

        if (
          requiresDriverReplacement &&
          !replacementDriverId
        ) {
          throw new Error(
            "Replacement Driver ID is required for this resolution type."
          );
        }

        if (
          requiresVehicleReplacement &&
          !replacementVehicleId
        ) {
          throw new Error(
            "Replacement Vehicle ID is required for this resolution type."
          );
        }


        const spreadsheet =
          getDispatchSpreadsheet_();

        const incidentsSheet =
          getRequiredSheet_(
            spreadsheet,
            "Incidents"
          );

        const dispatchSheet =
          getRequiredSheet_(
            spreadsheet,
            DISPATCH_SHEET_NAME
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

        /*
         * ==========================================
         * READ INCIDENT
         * ==========================================
         */

        const incidentValues =
          incidentsSheet
            .getDataRange()
            .getDisplayValues();

        if (
          incidentValues.length < 2
        ) {
          throw new Error(
            "No incident records were found."
          );
        }

        const incidentHeaders =
          incidentValues[0].map(
            function (header) {
              return String(
                header ?? ""
              ).trim();
            }
          );

        const incidentIdColumn =
          incidentHeaders.indexOf(
            "Incident ID"
          );

        const incidentDispatchColumn =
          incidentHeaders.indexOf(
            "Dispatch ID"
          );

        const incidentBookingColumn =
          incidentHeaders.indexOf(
            "Booking ID"
          );

        const replacementDriverIdColumn =
          incidentHeaders.indexOf(
            "Replacement Driver ID"
          );

        const replacementDriverNameColumn =
          incidentHeaders.indexOf(
            "Replacement Driver Name"
          );

        const replacementVehicleIdColumn =
          incidentHeaders.indexOf(
            "Replacement Vehicle ID"
          );

        const replacementVehicleColumn =
          incidentHeaders.indexOf(
            "Replacement Vehicle"
          );

        const resolvedAtColumn =
          incidentHeaders.indexOf(
            "Resolved At"
          );

        const notesColumn =
          incidentHeaders.indexOf(
            "Notes"
          );

        if (
          incidentIdColumn === -1
        ) {
          throw new Error(
            'Column "Incident ID" was not found in Incidents.'
          );
        }

        if (
          incidentDispatchColumn === -1
        ) {
          throw new Error(
            'Column "Dispatch ID" was not found in Incidents.'
          );
        }

        if (
          incidentBookingColumn === -1
        ) {
          throw new Error(
            'Column "Booking ID" was not found in Incidents.'
          );
        }

        if (
          replacementDriverIdColumn === -1 ||
          replacementDriverNameColumn === -1 ||
          replacementVehicleIdColumn === -1 ||
          replacementVehicleColumn === -1
        ) {
          throw new Error(
            "Incident replacement columns are missing."
          );
        }

        if (
          resolvedAtColumn === -1
        ) {
          throw new Error(
            'Column "Resolved At" was not found in Incidents.'
          );
        }

        let incidentRowNumber =
          null;

        let incidentRow =
          null;

        for (
          let i = 1;
          i < incidentValues.length;
          i++
        ) {

          const existingIncidentId =
            String(
              incidentValues[i][
              incidentIdColumn
              ] ?? ""
            ).trim();

          if (
            existingIncidentId ===
            incidentId
          ) {

            incidentRowNumber =
              i + 1;

            incidentRow =
              incidentValues[i];

            break;
          }
        }

        if (
          incidentRowNumber === null ||
          !incidentRow
        ) {
          throw new Error(
            `Incident ${incidentId} was not found.`
          );
        }

        /*
         * ==========================================
         * PREVENT DOUBLE RESOLUTION
         * ==========================================
         */

        const existingResolvedAt =
          String(
            incidentRow[
            resolvedAtColumn
            ] ?? ""
          ).trim();

        if (
          existingResolvedAt
        ) {
          throw new Error(
            `Incident ${incidentId} has already been resolved.`
          );
        }

        const dispatchId =
          String(
            incidentRow[
            incidentDispatchColumn
            ] ?? ""
          ).trim();

        const bookingReference =
          String(
            incidentRow[
            incidentBookingColumn
            ] ?? ""
          ).trim();

        if (!dispatchId) {
          throw new Error(
            `Incident ${incidentId} does not have a Dispatch ID.`
          );
        }

        if (!bookingReference) {
          throw new Error(
            `Incident ${incidentId} does not have a Booking ID.`
          );
        }

        /*
         * ==========================================
         * READ DISPATCH
         * ==========================================
         */

        const dispatchValues =
          dispatchSheet
            .getDataRange()
            .getDisplayValues();

        if (
          dispatchValues.length < 2
        ) {
          throw new Error(
            "No dispatch records were found."
          );
        }

        const dispatchHeaders =
          dispatchValues[0].map(
            function (header) {
              return String(
                header ?? ""
              ).trim();
            }
          );

        const dispatchIdColumn =
          dispatchHeaders.indexOf(
            "Dispatch ID"
          );

        const dispatchBookingColumn =
          dispatchHeaders.indexOf(
            "Booking ID"
          );

        const dispatchStatusColumn =
          dispatchHeaders.indexOf(
            "Dispatch Status"
          );

        const dispatchDriverIdColumn =
          dispatchHeaders.indexOf(
            "Driver ID"
          );

        const dispatchDriverNameColumn =
          dispatchHeaders.indexOf(
            "Driver Name"
          );

        const dispatchVehicleIdColumn =
          dispatchHeaders.indexOf(
            "Vehicle ID"
          );

        const dispatchVehicleColumn =
          dispatchHeaders.indexOf(
            "Vehicle"
          );

        if (
          dispatchIdColumn === -1 ||
          dispatchBookingColumn === -1 ||
          dispatchStatusColumn === -1 ||
          dispatchDriverIdColumn === -1 ||
          dispatchDriverNameColumn === -1 ||
          dispatchVehicleIdColumn === -1 ||
          dispatchVehicleColumn === -1
        ) {
          throw new Error(
            "Required Dispatch columns are missing."
          );
        }

        let dispatchRowNumber =
          null;

        let dispatchRow =
          null;

        for (
          let i = 1;
          i < dispatchValues.length;
          i++
        ) {

          const existingDispatchId =
            String(
              dispatchValues[i][
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
              dispatchValues[i];

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

        const dispatchBookingReference =
          String(
            dispatchRow[
            dispatchBookingColumn
            ] ?? ""
          ).trim();

        if (
          dispatchBookingReference !==
          bookingReference
        ) {
          throw new Error(
            `Incident booking ${bookingReference} does not match Dispatch ${dispatchId}.`
          );
        }

        const currentDispatchStatus =
          String(
            dispatchRow[
            dispatchStatusColumn
            ] ?? ""
          ).trim();

        if (
          currentDispatchStatus !==
          "Incident"
        ) {
          throw new Error(
            `Dispatch ${dispatchId} must be in Incident status before it can be resolved. Current status: ${currentDispatchStatus || "Unknown"}.`
          );
        }

        const originalDriverId =
          String(
            dispatchRow[
            dispatchDriverIdColumn
            ] ?? ""
          ).trim();

        const originalDriverName =
          String(
            dispatchRow[
            dispatchDriverNameColumn
            ] ?? ""
          ).trim();

        const originalVehicleId =
          String(
            dispatchRow[
            dispatchVehicleIdColumn
            ] ?? ""
          ).trim();

        const originalVehicleName =
          String(
            dispatchRow[
            dispatchVehicleColumn
            ] ?? ""
          ).trim();

        if (!originalDriverId) {
          throw new Error(
            `Dispatch ${dispatchId} does not have an original Driver ID.`
          );
        }

        if (!originalVehicleId) {
          throw new Error(
            `Dispatch ${dispatchId} does not have an original Vehicle ID.`
          );
        }

        /*
         * ==========================================
         * PREVENT SAME RESOURCE REPLACEMENT
         * ==========================================
         */

        if (
          requiresDriverReplacement &&
          replacementDriverId ===
          originalDriverId
        ) {
          throw new Error(
            "Replacement Driver must be different from the original driver."
          );
        }

        if (
          requiresVehicleReplacement &&
          replacementVehicleId ===
          originalVehicleId
        ) {
          throw new Error(
            "Replacement Vehicle must be different from the original vehicle."
          );
        }

        /*
         * ==========================================
         * FIND REPLACEMENT DRIVER
         * ==========================================
         */

        let replacementDriverRowNumber =
          null;

        let replacementDriverName =
          "";

        let replacementDriverStatus =
          "";

        if (requiresDriverReplacement) {


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

          const driverNameColumn =
            driverHeaders.indexOf(
              "Driver Name"
            );

          const driverStatusColumn =
            driverHeaders.indexOf(
              "Driver Status"
            );

          if (
            driverIdColumn === -1 ||
            driverNameColumn === -1 ||
            driverStatusColumn === -1
          ) {
            throw new Error(
              "Required Drivers columns are missing."
            );
          }



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
              replacementDriverId
            ) {

              replacementDriverRowNumber =
                i + 1;

              replacementDriverName =
                String(
                  driverValues[i][
                  driverNameColumn
                  ] ?? ""
                ).trim();

              replacementDriverStatus =
                String(
                  driverValues[i][
                  driverStatusColumn
                  ] ?? ""
                ).trim();

              break;
            }
          }

          if (
            replacementDriverRowNumber ===
            null
          ) {
            throw new Error(
              `Replacement Driver ${replacementDriverId} was not found.`
            );
          }

          if (
            replacementDriverStatus !==
            "Available"
          ) {
            throw new Error(
              `Replacement Driver ${replacementDriverId} is not Available. Current status: ${replacementDriverStatus || "Unknown"}.`
            );
          }


        }

        /*
         * ==========================================
         * FIND REPLACEMENT VEHICLE
         * ==========================================
         */

        let replacementVehicleRowNumber =
          null;

        let replacementVehicleName =
          "";

        let replacementVehicleStatus =
          "";

        const replacementVehicleDriverIdValues =
          [];

        if (requiresVehicleReplacement) {


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

          const vehicleMakeColumn =
            vehicleHeaders.indexOf(
              "Make"
            );

          const vehicleModelColumn =
            vehicleHeaders.indexOf(
              "Model"
            );

          const vehicleDriverIdColumn =
            vehicleHeaders.indexOf(
              "Driver ID"
            );

          const vehicleStatusColumn =
            vehicleHeaders.indexOf(
              "Status"
            );

          if (
            vehicleIdColumn === -1 ||
            vehicleMakeColumn === -1 ||
            vehicleModelColumn === -1 ||
            vehicleDriverIdColumn === -1 ||
            vehicleStatusColumn === -1
          ) {
            throw new Error(
              "Required Vehicles columns are missing."
            );
          }



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
              replacementVehicleId
            ) {

              replacementVehicleRowNumber =
                i + 1;

              const make =
                String(
                  vehicleValues[i][
                  vehicleMakeColumn
                  ] ?? ""
                ).trim();

              const model =
                String(
                  vehicleValues[i][
                  vehicleModelColumn
                  ] ?? ""
                ).trim();

              replacementVehicleName =
                [make, model]
                  .filter(Boolean)
                  .join(" ")
                  .trim();

              replacementVehicleStatus =
                String(
                  vehicleValues[i][
                  vehicleStatusColumn
                  ] ?? ""
                ).trim();

              replacementVehicleDriverIdValues.push(
                String(
                  vehicleValues[i][
                  vehicleDriverIdColumn
                  ] ?? ""
                ).trim()
              );

              break;
            }
          }

          if (
            replacementVehicleRowNumber ===
            null
          ) {
            throw new Error(
              `Replacement Vehicle ${replacementVehicleId} was not found.`
            );
          }

          if (
            replacementVehicleStatus !==
            "Available"
          ) {
            throw new Error(
              `Replacement Vehicle ${replacementVehicleId} is not Available. Current status: ${replacementVehicleStatus || "Unknown"}.`
            );
          }



        }

        /*
         * ==========================================
         * DRIVER / VEHICLE COMPATIBILITY
         * ==========================================
         *
         * A replacement vehicle may be unassigned,
         * or already assigned to the driver who will
         * operate the resolved dispatch.
         */

        if (requiresVehicleReplacement) {

          const assignedVehicleDriverId =
            replacementVehicleDriverIdValues[0] ??
            "";

          const effectiveDriverId =
            requiresDriverReplacement
              ? replacementDriverId
              : originalDriverId;

          if (
            assignedVehicleDriverId &&
            assignedVehicleDriverId !==
            effectiveDriverId
          ) {
            throw new Error(
              `Replacement Vehicle ${replacementVehicleId} is assigned to Driver ${assignedVehicleDriverId}, not Driver ${effectiveDriverId}.`
            );
          }
        }

        /*
         * ==========================================
         * RELEASE ORIGINAL RESOURCES
         * ==========================================
         *
         * Use the existing synchronization
         * functions with Completed semantics.
         *
         * These functions check whether the
         * original resources have another active
         * dispatch before releasing them.
         */


        /*
         * ==========================================
         * ASSIGN REPLACEMENT RESOURCES
         * ==========================================
         */

        if (requiresDriverReplacement) {
          synchronizeDriverStatusForDispatch_(
            spreadsheet,
            replacementDriverId,
            "En Route"
          );
        }

        if (requiresVehicleReplacement) {
          synchronizeVehicleStatusForDispatch_(
            spreadsheet,
            replacementVehicleId,
            "En Route"
          );
        }

        /*
         * ==========================================
         * UPDATE DISPATCH RESOURCE ASSIGNMENT
         * ==========================================
         */

        const effectiveDriverId =
          requiresDriverReplacement
            ? replacementDriverId
            : originalDriverId;

        const effectiveDriverName =
          requiresDriverReplacement
            ? replacementDriverName
            : originalDriverName;

        const effectiveVehicleId =
          requiresVehicleReplacement
            ? replacementVehicleId
            : originalVehicleId;

        const effectiveVehicleName =
          requiresVehicleReplacement
            ? replacementVehicleName
            : originalVehicleName;

        dispatchSheet
          .getRange(
            dispatchRowNumber,
            dispatchDriverIdColumn + 1
          )
          .setValue(
            effectiveDriverId
          );

        dispatchSheet
          .getRange(
            dispatchRowNumber,
            dispatchDriverNameColumn + 1
          )
          .setValue(
            effectiveDriverName
          );

        dispatchSheet
          .getRange(
            dispatchRowNumber,
            dispatchVehicleIdColumn + 1
          )
          .setValue(
            effectiveVehicleId
          );

        dispatchSheet
          .getRange(
            dispatchRowNumber,
            dispatchVehicleColumn + 1
          )
          .setValue(
            effectiveVehicleName
          );

        /*
         * ==========================================
         * DISPATCH STATUS → EN ROUTE
         * ==========================================
         *
         * We update the dispatch directly here
         * rather than calling updateDispatchStatus()
         * because that function would synchronize
         * the replacement resources again.
         */

        dispatchSheet
          .getRange(
            dispatchRowNumber,
            dispatchStatusColumn + 1
          )
          .setValue(
            "En Route"
          );

        /*
         * Record the new En Route timestamp.
         */

        const enRouteAtColumn =
          dispatchHeaders.indexOf(
            "En Route At"
          );

        if (
          enRouteAtColumn !== -1
        ) {
          dispatchSheet
            .getRange(
              dispatchRowNumber,
              enRouteAtColumn + 1
            )
            .setValue(
              new Date()
            );
        }
        /*
         * ==========================================
         * RELEASE ORIGINAL RESOURCES
         * ==========================================
         */

        if (requiresDriverReplacement) {
          synchronizeDriverStatusForDispatch_(
            spreadsheet,
            originalDriverId,
            "Completed"
          );
        }

        if (requiresVehicleReplacement) {
          synchronizeVehicleStatusForDispatch_(
            spreadsheet,
            originalVehicleId,
            "Completed"
          );
        }
        /*
         * ==========================================
         * UPDATE INCIDENT
         * ==========================================
         */

        const resolvedAt =
          new Date();

        incidentsSheet
          .getRange(
            incidentRowNumber,
            replacementDriverIdColumn + 1
          )
          .setValue(
            requiresDriverReplacement
              ? replacementDriverId
              : ""
          );

        incidentsSheet
          .getRange(
            incidentRowNumber,
            replacementDriverNameColumn + 1
          )
          .setValue(
            requiresDriverReplacement
              ? replacementDriverName
              : ""
          );

        incidentsSheet
          .getRange(
            incidentRowNumber,
            replacementVehicleIdColumn + 1
          )
          .setValue(
            requiresVehicleReplacement
              ? replacementVehicleId
              : ""
          );

        incidentsSheet
          .getRange(
            incidentRowNumber,
            replacementVehicleColumn + 1
          )
          .setValue(
            requiresVehicleReplacement
              ? replacementVehicleName
              : ""
          );

        incidentsSheet
          .getRange(
            incidentRowNumber,
            resolvedAtColumn + 1
          )
          .setValue(
            resolvedAt
          );

        if (
          notes &&
          notesColumn !== -1
        ) {
          incidentsSheet
            .getRange(
              incidentRowNumber,
              notesColumn + 1
            )
            .setValue(
              notes
            );
        }

        SpreadsheetApp.flush();

        Logger.log(
          "RESOLVE INCIDENT RESULT: " +
          JSON.stringify({
            incidentId:
              incidentId,
            dispatchId:
              dispatchId,
            bookingReference:
              bookingReference,
            originalDriverId:
              originalDriverId,
            originalVehicleId:
              originalVehicleId,
            replacementDriverId:
              replacementDriverId,
            replacementVehicleId:
              replacementVehicleId,
            dispatchStatus:
              "En Route"
          })
        );

        return {
          success: true,
          action:
            "resolveIncident",
          incidentId:
            incidentId,
          dispatchId:
            dispatchId,
          bookingReference:
            bookingReference,
          originalDriverId:
            originalDriverId,
          originalDriverName:
            originalDriverName,
          originalVehicleId:
            originalVehicleId,
          originalVehicle:
            originalVehicleName,
          replacementDriverId:
            replacementDriverId,
          replacementDriverName:
            replacementDriverName,
          replacementVehicleId:
            replacementVehicleId,
          replacementVehicle:
            replacementVehicleName,
          status:
            "En Route",
          resolvedAt:
            resolvedAt,
          message:
            requiresDriverReplacement ||
              requiresVehicleReplacement
              ? "Incident resolved and replacement resources assigned successfully."
              : "Incident resolved successfully and dispatch resumed."
        };

      } catch (error) {

        Logger.log(
          "Resolve Incident Error: " +
          error.toString()
        );

        return {
          success: false,
          action:
            "resolveIncident",
          error:
            error.toString()
        };

      } finally {

        lock.releaseLock();

      }
    }
    /*
       * ==========================================
       * DISPATCH ROUTING
       * ==========================================
       */

    if (data.action === "createDispatch") {
      const result =
        createDispatch(data);

      return ContentService
        .createTextOutput(
          JSON.stringify(result)
        )
        .setMimeType(
          ContentService.MimeType.JSON
        );
    }

    if (
      data.action ===
      "updateDispatchStatus"
    ) {
      const result =
        updateDispatchStatus(data);

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
     * STATUS UPDATE
     * ==========================================
     */

    if (data.action === "updateStatus") {
      const bookingReference = String(
        data.bookingReference ??
        data.bookingId ??
        ""
      ).trim();

      const requestedStatus = String(
        data.status ?? ""
      ).trim();

      if (!bookingReference) {
        throw new Error(
          "Booking reference is required for status update."
        );
      }

      if (!requestedStatus) {
        throw new Error(
          "Status is required for status update."
        );
      }

      const allowedStatuses = [
        "Pending",
        "Confirmed",
        "Cancelled",
        "Completed"
      ];

      if (
        !allowedStatuses.includes(
          requestedStatus
        )
      ) {
        throw new Error(
          `Invalid booking status: ${requestedStatus}`
        );
      }

      /*
       * ------------------------------------------
       * LOCK STATUS UPDATE
       * ------------------------------------------
       */

      lock.waitLock(30000);

      try {
        const lastRow =
          sheet.getLastRow();

        if (lastRow < 2) {
          throw new Error(
            "No booking records were found."
          );
        }

        const bookingIds =
          sheet
            .getRange(
              2,
              1,
              lastRow - 1,
              1
            )
            .getDisplayValues();

        const matchingRows = [];

        for (
          let i = 0;
          i < bookingIds.length;
          i++
        ) {
          const existingBookingId =
            String(
              bookingIds[i][0] ?? ""
            ).trim();

          if (
            existingBookingId ===
            bookingReference
          ) {
            matchingRows.push(
              i + 2
            );
          }
        }

        /*
         * A status update must match
         * exactly one booking.
         */

        if (
          matchingRows.length === 0
        ) {
          throw new Error(
            `Booking ${bookingReference} was not found.`
          );
        }

        if (
          matchingRows.length > 1
        ) {
          throw new Error(
            `Booking reference ${bookingReference} is duplicated across ${matchingRows.length} records. Status update was refused.`
          );
        }

        const foundRow =
          matchingRows[0];

        /*
         * ------------------------------------------
         * READ CURRENT STATUS
         * ------------------------------------------
         */

        // Column B = Status
        const currentStatus =
          String(
            sheet
              .getRange(
                foundRow,
                2
              )
              .getDisplayValue() ??
            ""
          ).trim();

        Logger.log(
          `Current status for ${bookingReference}: ${currentStatus}`
        );

        Logger.log(
          `Requested status for ${bookingReference}: ${requestedStatus}`
        );

        /*
         * ------------------------------------------
         * STATUS TRANSITION RULES
         * ------------------------------------------
         */

        const validTransitions = {
          Pending: [
            "Confirmed",
            "Cancelled"
          ],

          Confirmed: [
            "Completed",
            "Cancelled"
          ],

          Completed: [],

          Cancelled: []
        };

        if (
          !Object.prototype.hasOwnProperty.call(
            validTransitions,
            currentStatus
          )
        ) {
          throw new Error(
            `Invalid current booking status: ${currentStatus}`
          );
        }

        /*
         * Prevent the same status from
         * being submitted again.
         */

        if (
          currentStatus ===
          requestedStatus
        ) {
          throw new Error(
            `Booking ${bookingReference} is already ${currentStatus}.`
          );
        }

        const allowedTransitions =
          validTransitions[
          currentStatus
          ];

        if (
          !allowedTransitions.includes(
            requestedStatus
          )
        ) {
          throw new Error(
            `Invalid status transition: ${currentStatus} → ${requestedStatus}.`
          );
        }

        /*
         * ------------------------------------------
         * APPLY STATUS UPDATE
         * ------------------------------------------
         */

        sheet
          .getRange(
            foundRow,
            2
          )
          .setValue(
            requestedStatus
          );

        SpreadsheetApp.flush();

        Logger.log(
          `Booking ${bookingReference} status updated from ${currentStatus} to ${requestedStatus}.`
        );

        return ContentService
          .createTextOutput(
            JSON.stringify({
              success: true,
              action:
                "updateStatus",
              bookingReference:
                bookingReference,
              previousStatus:
                currentStatus,
              status:
                requestedStatus
            })
          )
          .setMimeType(
            ContentService.MimeType.JSON
          );

      } finally {
        lock.releaseLock();
      }
    }

    /*
     * ==========================================
     * NORMAL BOOKING CREATION
     * ==========================================
     */

    const bookingReference =
      String(
        data.bookingReference ??
        ""
      ).trim();

    if (!bookingReference) {
      throw new Error(
        "Booking reference is required."
      );
    }

    /*
     * ==========================================
     * DUPLICATE PROTECTION
     * ==========================================
     */

    Logger.log(
      `Checking booking before append: ${bookingReference}`
    );

    lock.waitLock(30000);

    try {
      const lastRow =
        sheet.getLastRow();

      if (lastRow >= 2) {

        /*
         * Read columns A through S.
         *
         * A = Booking ID
         * B = Status
         * C = Customer Name
         * D = Email
         * E = Phone
         * F = Pickup
         * G = Destination
         * H = Pickup Date
         * I = Pickup Time
         * J = Passengers
         * K = Flight Number
         * L = Service Type
         * M = Special Requests
         * N = Hotel
         * O = Vehicle
         * P = Route ID
         * Q = Price
         * R = Deposit
         * S = Balance
         */

        const existingRows =
          sheet
            .getRange(
              2,
              1,
              lastRow - 1,
              19
            )
            .getDisplayValues();

        /*
         * ------------------------------------------
         * 1. DUPLICATE BOOKING REFERENCE CHECK
         * ------------------------------------------
         */

        for (
          let i = 0;
          i < existingRows.length;
          i++
        ) {
          const existingBookingId =
            String(
              existingRows[i][0] ??
              ""
            ).trim();

          if (
            existingBookingId ===
            bookingReference
          ) {
            throw new Error(
              `Booking reference ${bookingReference} already exists. Duplicate booking was refused.`
            );
          }
        }

        /*
         * ------------------------------------------
         * 2. DUPLICATE BOOKING CONTENT CHECK
         * ------------------------------------------
         */

        const normalize =
          function (value) {
            return String(
              value ?? ""
            )
              .trim()
              .toLowerCase()
              .replace(
                /\s+/g,
                " "
              );
          };

        const incomingCustomerName =
          normalize(
            data.customerName
          );

        const incomingEmail =
          normalize(
            data.email
          );

        const incomingPhone =
          normalize(
            data.phone
          );

        const incomingPickup =
          normalize(
            data.pickup
          );

        const incomingDestination =
          normalize(
            data.destination
          );

        const incomingPickupDate =
          normalize(
            data.pickupDate
          );

        const incomingPickupTime =
          normalize(
            data.pickupTime
          );

        const incomingPassengers =
          normalize(
            data.passengers
          );

        const incomingFlightNumber =
          normalize(
            data.flightNumber
          );

        const incomingServiceType =
          normalize(
            data.serviceCategory
          );

        for (
          let i = 0;
          i < existingRows.length;
          i++
        ) {
          const row =
            existingRows[i];

          /*
           * Existing spreadsheet columns:
           *
           * C = index 2  Customer Name
           * D = index 3  Email
           * E = index 4  Phone
           * F = index 5  Pickup
           * G = index 6  Destination
           * H = index 7  Pickup Date
           * I = index 8  Pickup Time
           * J = index 9  Passengers
           * K = index 10 Flight Number
           * L = index 11 Service Type
           */

          const sameCustomer =
            normalize(row[2]) ===
            incomingCustomerName;

          const sameEmail =
            normalize(row[3]) ===
            incomingEmail;

          const samePhone =
            normalize(row[4]) ===
            incomingPhone;

          const samePickup =
            normalize(row[5]) ===
            incomingPickup;

          const sameDestination =
            normalize(row[6]) ===
            incomingDestination;

          const samePickupDate =
            normalize(row[7]) ===
            incomingPickupDate;

          const samePickupTime =
            normalize(row[8]) ===
            incomingPickupTime;

          const samePassengers =
            normalize(row[9]) ===
            incomingPassengers;

          const sameFlightNumber =
            normalize(row[10]) ===
            incomingFlightNumber;

          const sameServiceType =
            normalize(row[11]) ===
            incomingServiceType;

          const isDuplicateBooking =
            sameCustomer &&
            sameEmail &&
            samePhone &&
            samePickup &&
            sameDestination &&
            samePickupDate &&
            samePickupTime &&
            samePassengers &&
            sameFlightNumber &&
            sameServiceType;

          if (
            isDuplicateBooking
          ) {
            const existingReference =
              String(
                row[0] ?? ""
              ).trim();

            const existingStatus =
              String(
                row[1] ?? ""
              ).trim();

            throw new Error(
              `Duplicate booking detected. This booking already exists as ${existingReference} with status ${existingStatus}. Duplicate submission was refused.`
            );
          }
        }
      }

      Logger.log(
        "Booking passed duplicate checks."
      );

      /*
       * ==========================================
       * APPEND BOOKING
       * ==========================================
       */

      Logger.log(
        "ABOUT TO APPEND BOOKING"
      );

      sheet.appendRow([
        // A - Booking ID
        bookingReference,

        // B - Status
        "Pending",

        // C - Customer Name
        data.customerName ?? "",

        // D - Email
        data.email ?? "",

        // E - Phone
        "'" +
        String(
          data.phone ?? ""
        ),

        // F - Pickup
        data.pickup ?? "",

        // G - Destination
        data.destination ?? "",

        // H - Pickup Date
        data.pickupDate ?? "",

        // I - Pickup Time
        data.pickupTime ?? "",

        // J - Passengers
        data.passengers ?? "",

        // K - Flight Number
        data.flightNumber ?? "",

        // L - Service Type
        data.serviceCategory ?? "",

        // M - Special Requests
        data.specialRequests ?? "",

        // N - Hotel
        data.hotel ??
        data.destination ??
        "",

        // O - Vehicle
        data.vehicle ?? "",

        // P - Route ID
        data.routeId ?? "",

        // Q - Price USD
        data.total ?? "",

        // R - Deposit
        data.deposit ?? "",

        // S - Balance
        data.balance ?? "",

        // T - Customer Reference
        data.customerReference ?? "",

        // U - Tour Destination / Attractions
        data.tourDestination ?? ""
      ]);
      SpreadsheetApp.flush();

      Logger.log(
        "BOOKING APPENDED"
      );

    } finally {
      lock.releaseLock();
    }

    /*
     * ==========================================
     * NORMAL BOOKING RESPONSE
     * ==========================================
     */

    return ContentService
      .createTextOutput(
        JSON.stringify({
          success: true,
          action:
            "createBooking",
          bookingReference:
            bookingReference
        })
      )
      .setMimeType(
        ContentService.MimeType.JSON
      );

  } catch (error) {

    Logger.log(
      "=== BOOKING POST REQUEST ERROR ==="
    );

    Logger.log(
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
}

/*
 * ==========================================
 * CREATE INCIDENT
 * ==========================================
 *
 * Creates an incident record in the Incidents
 * sheet and moves the associated dispatch to
 * Incident status.
 *
 * Required request fields:
 * - dispatchId
 * - bookingReference (or bookingId)
 * - incidentType
 * - location
 * - description
 * - actionTaken
 *
 * Optional:
 * - notes
 *
 * Replacement driver/vehicle fields are left
 * blank until a replacement is actually made.
 */
function getActiveIncident(data) {
  try {
    const spreadsheet =
      getDispatchSpreadsheet_();

    const incidentsSheet =
      getRequiredSheet_(
        spreadsheet,
        "Incidents"
      );

    const dispatchId =
      String(
        data.dispatchId ?? ""
      ).trim();

    if (!dispatchId) {
      throw new Error(
        "Dispatch ID is required."
      );
    }

    const incidentValues =
      incidentsSheet
        .getDataRange()
        .getDisplayValues();

    if (
      incidentValues.length < 2
    ) {
      return {
        success: true,
        action: "getActiveIncident",
        found: false,
        incidentId: "",
        dispatchId: dispatchId
      };
    }

    const incidentHeaders =
      incidentValues[0].map(
        function (header) {
          return String(
            header ?? ""
          ).trim();
        }
      );

    const incidentIdColumn =
      incidentHeaders.indexOf(
        "Incident ID"
      );

    const incidentDispatchColumn =
      incidentHeaders.indexOf(
        "Dispatch ID"
      );

    const resolvedAtColumn =
      incidentHeaders.indexOf(
        "Resolved At"
      );

    if (
      incidentIdColumn === -1 ||
      incidentDispatchColumn === -1 ||
      resolvedAtColumn === -1
    ) {
      throw new Error(
        "Required Incidents columns are missing."
      );
    }

    for (
      let i = 1;
      i < incidentValues.length;
      i++
    ) {
      const existingDispatchId =
        String(
          incidentValues[i][
            incidentDispatchColumn
          ] ?? ""
        ).trim();

      const resolvedAt =
        String(
          incidentValues[i][
            resolvedAtColumn
          ] ?? ""
        ).trim();

      if (
        existingDispatchId ===
          dispatchId &&
        !resolvedAt
      ) {
        return {
          success: true,
          action: "getActiveIncident",
          found: true,
          incidentId:
            String(
              incidentValues[i][
                incidentIdColumn
              ] ?? ""
            ).trim(),
          dispatchId: dispatchId
        };
      }
    }

    return {
      success: true,
      action: "getActiveIncident",
      found: false,
      incidentId: "",
      dispatchId: dispatchId
    };

  } catch (error) {
    Logger.log(
      "GET ACTIVE INCIDENT ERROR: " +
      error.toString()
    );

    return {
      success: false,
      action: "getActiveIncident",
      error:
        error instanceof Error
          ? error.message
          : String(error)
    };
  }
}
function createIncident(data) {
  try {
    const spreadsheet =
      getDispatchSpreadsheet_();

    const dispatchSheet =
      getRequiredSheet_(
        spreadsheet,
        DISPATCH_SHEET_NAME
      );

    const incidentsSheet =
      getRequiredSheet_(
        spreadsheet,
        "Incidents"
      );

    const dispatchId = String(
      data.dispatchId ?? ""
    ).trim();

    const bookingReference = String(
      data.bookingReference ??
      data.bookingId ??
      ""
    ).trim();

    const incidentType = String(
      data.incidentType ?? ""
    ).trim();

    const location = String(
      data.location ?? ""
    ).trim();

    const description = String(
      data.description ?? ""
    ).trim();

    const actionTaken = String(
      data.actionTaken ?? ""
    ).trim();

    const notes = String(
      data.notes ?? ""
    ).trim();

    if (!dispatchId) {
      throw new Error(
        "Dispatch ID is required for incident creation."
      );
    }

    if (!bookingReference) {
      throw new Error(
        "Booking reference is required for incident creation."
      );
    }

    if (!incidentType) {
      throw new Error(
        "Incident type is required."
      );
    }

    if (!location) {
      throw new Error(
        "Incident location is required."
      );
    }

    if (!description) {
      throw new Error(
        "Incident description is required."
      );
    }

    if (!actionTaken) {
      throw new Error(
        "Action taken is required."
      );
    }

    /*
     * ------------------------------------------
     * FIND DISPATCH
     * ------------------------------------------
     */

    const dispatchValues =
      dispatchSheet
        .getDataRange()
        .getDisplayValues();

    if (dispatchValues.length < 2) {
      throw new Error(
        "No dispatch records were found."
      );
    }

    const dispatchHeaders =
      dispatchValues[0].map(
        function (header) {
          return String(
            header ?? ""
          ).trim();
        }
      );

    const dispatchIdColumn =
      dispatchHeaders.indexOf(
        "Dispatch ID"
      );

    const dispatchBookingColumn =
      dispatchHeaders.indexOf(
        "Booking ID"
      );

    const dispatchStatusColumn =
      dispatchHeaders.indexOf(
        "Dispatch Status"
      );

    if (dispatchIdColumn === -1) {
      throw new Error(
        'Column "Dispatch ID" was not found in Dispatch.'
      );
    }

    if (dispatchBookingColumn === -1) {
      throw new Error(
        'Column "Booking ID" was not found in Dispatch.'
      );
    }

    if (dispatchStatusColumn === -1) {
      throw new Error(
        'Column "Dispatch Status" was not found in Dispatch.'
      );
    }

    let dispatchRowNumber = null;
    let dispatchStatus = "";
    let dispatchBookingId = "";

    for (
      let i = 1;
      i < dispatchValues.length;
      i++
    ) {
      const existingDispatchId =
        String(
          dispatchValues[i][
          dispatchIdColumn
          ] ?? ""
        ).trim();

      if (
        existingDispatchId ===
        dispatchId
      ) {
        dispatchRowNumber = i + 1;
        dispatchStatus = String(
          dispatchValues[i][
          dispatchStatusColumn
          ] ?? ""
        ).trim();
        dispatchBookingId = String(
          dispatchValues[i][
          dispatchBookingColumn
          ] ?? ""
        ).trim();
        break;
      }
    }

    if (dispatchRowNumber === null) {
      throw new Error(
        `Dispatch ${dispatchId} was not found.`
      );
    }

    if (
      dispatchBookingId !==
      bookingReference
    ) {
      throw new Error(
        `Dispatch ${dispatchId} does not belong to booking ${bookingReference}.`
      );
    }

    /*
     * ------------------------------------------
     * INCIDENT STATUS RULE
     * ------------------------------------------
     *
     * An incident can be recorded only while
     * the dispatch is active. Once an incident
     * is recorded, updateDispatchStatus() moves
     * the dispatch to Incident.
     */

    const incidentEligibleStatuses = [
      "Assigned",
      "En Route",
      "Passenger Onboard"
    ];

    if (
      !incidentEligibleStatuses.includes(
        dispatchStatus
      )
    ) {
      throw new Error(
        `Incident cannot be reported when dispatch status is ${dispatchStatus}.`
      );
    }

    /*
     * ------------------------------------------
     * INCIDENT SHEET VALIDATION
     * ------------------------------------------
     *
     * Expected Incidents columns:
     * A Incident ID
     * B Dispatch ID
     * C Booking ID
     * D Incident At
     * E Incident Type
     * F Location
     * G Description
     * H Action Taken
     * I Replacement Driver ID
     * J Replacement Driver Name
     * K Replacement Vehicle ID
     * L Replacement Vehicle
     * M Resolved At
     * N Notes
     */

    const incidentHeaders =
      incidentsSheet
        .getRange(
          1,
          1,
          1,
          14
        )
        .getDisplayValues()[0]
        .map(
          function (header) {
            return String(
              header ?? ""
            ).trim();
          }
        );

    const expectedIncidentHeaders = [
      "Incident ID",
      "Dispatch ID",
      "Booking ID",
      "Incident At",
      "Incident Type",
      "Location",
      "Description",
      "Action Taken",
      "Replacement Driver ID",
      "Replacement Driver Name",
      "Replacement Vehicle ID",
      "Replacement Vehicle",
      "Resolved At",
      "Notes"
    ];

    for (
      let i = 0;
      i < expectedIncidentHeaders.length;
      i++
    ) {
      if (
        incidentHeaders[i] !==
        expectedIncidentHeaders[i]
      ) {
        throw new Error(
          `Incidents header mismatch at column ${i + 1}. Expected "${expectedIncidentHeaders[i]}".`
        );
      }
    }

    /*
     * ------------------------------------------
     * PREVENT DUPLICATE ACTIVE INCIDENT
     * ------------------------------------------
     *
     * Do not create a second incident for the
     * same dispatch while the dispatch is already
     * active. This protects against double-clicks
     * or repeated submissions from the UI.
     */

    const incidentLastRow =
      incidentsSheet.getLastRow();

    if (incidentLastRow >= 2) {
      const existingIncidents =
        incidentsSheet
          .getRange(
            2,
            1,
            incidentLastRow - 1,
            14
          )
          .getDisplayValues();

      for (
        let i = 0;
        i < existingIncidents.length;
        i++
      ) {
        const existingDispatchId =
          String(
            existingIncidents[i][1] ??
            ""
          ).trim();

        const resolvedAt =
          String(
            existingIncidents[i][12] ??
            ""
          ).trim();

        if (
          existingDispatchId ===
          dispatchId &&
          !resolvedAt
        ) {
          throw new Error(
            `An unresolved incident already exists for dispatch ${dispatchId}.`
          );
        }
      }
    }

    /*
     * ------------------------------------------
     * GENERATE INCIDENT ID
     * ------------------------------------------
     */

    const now = new Date();

    const incidentId =
      "INC-" +
      Utilities.formatDate(
        now,
        Session.getScriptTimeZone(),
        "yyyyMMdd-HHmmss"
      ) +
      "-" +
      Math.floor(
        100000 +
        Math.random() * 900000
      );

    /*
     * ------------------------------------------
     * WRITE INCIDENT RECORD
     * ------------------------------------------
     */

    incidentsSheet.appendRow([
      // A - Incident ID
      incidentId,

      // B - Dispatch ID
      dispatchId,

      // C - Booking ID
      bookingReference,

      // D - Incident At
      now,

      // E - Incident Type
      incidentType,

      // F - Location
      location,

      // G - Description
      description,

      // H - Action Taken
      actionTaken,

      // I - Replacement Driver ID
      "",

      // J - Replacement Driver Name
      "",

      // K - Replacement Vehicle ID
      "",

      // L - Replacement Vehicle
      "",

      // M - Resolved At
      "",

      // N - Notes
      notes
    ]);

    SpreadsheetApp.flush();

    /*
     * ------------------------------------------
     * MOVE DISPATCH TO INCIDENT
     * ------------------------------------------
     */

    const statusResult =
      updateDispatchStatus({
        dispatchId: dispatchId,
        status: "Incident",
        notes:
          notes || description
      });

    if (
      !statusResult ||
      statusResult.success !== true
    ) {
      throw new Error(
        statusResult?.error ??
        statusResult?.message ??
        "Incident was recorded, but the dispatch could not be moved to Incident."
      );
    }

    Logger.log(
      "INCIDENT CREATED: " +
      JSON.stringify({
        incidentId: incidentId,
        dispatchId: dispatchId,
        bookingReference:
          bookingReference,
        incidentType: incidentType,
        previousDispatchStatus:
          dispatchStatus,
        dispatchStatus: "Incident"
      })
    );

    return {
      success: true,
      action: "createIncident",
      incidentId: incidentId,
      dispatchId: dispatchId,
      bookingReference:
        bookingReference,
      previousStatus:
        dispatchStatus,
      status: "Incident"
    };

  } catch (error) {
    Logger.log(
      "CREATE INCIDENT ERROR: " +
      error.toString()
    );

    return {
      success: false,
      action: "createIncident",
      error: error.toString()
    };
  }
}/**
 * Reconcile the operational status of a driver
 * and/or vehicle against the current Dispatch sheet.
 *
 * Uses the existing synchronization functions.
 *
 * Completed semantics mean:
 * - Available if there is no active dispatch.
 * - On Trip if another active dispatch exists.
 */
function reconcileResourceStatus(data) {

  const lock =
    LockService.getScriptLock();

  lock.waitLock(30000);

  try {

    data = data || {};

    const driverId =
      String(
        data.driverId ?? ""
      ).trim();

    const vehicleId =
      String(
        data.vehicleId ?? ""
      ).trim();

    if (!driverId && !vehicleId) {
      throw new Error(
        "Driver ID or Vehicle ID is required."
      );
    }

    const spreadsheet =
      getDispatchSpreadsheet_();

    const result = {
      success: true,
      action:
        "reconcileResourceStatus"
    };

    if (driverId) {

      result.driver =
        synchronizeDriverStatusForDispatch_(
          spreadsheet,
          driverId,
          "Completed"
        );
    }

    if (vehicleId) {

      result.vehicle =
        synchronizeVehicleStatusForDispatch_(
          spreadsheet,
          vehicleId,
          "Completed"
        );
    }

    Logger.log(
      "RESOURCE STATUS RECONCILIATION: " +
      JSON.stringify(result)
    );

    return result;

  } catch (error) {

    Logger.log(
      "Resource Reconciliation Error: " +
      error.toString()
    );

    return {
      success: false,
      action:
        "reconcileResourceStatus",
      error:
        error.toString()
    };

  } finally {

    lock.releaseLock();

  }
}
function checkDispatchResourceAvailability(data) {

  try {

    data = data || {};

    const driverId =
      String(
        data.driverId ?? ""
      ).trim();

    const vehicleId =
      String(
        data.vehicleId ?? ""
      ).trim();

    if (!driverId && !vehicleId) {
      throw new Error(
        "Driver ID or Vehicle ID is required."
      );
    }

    const spreadsheet =
      getDispatchSpreadsheet_();

    const result = {
      success: true,
      action:
        "checkDispatchResourceAvailability"
    };

    /*
     * ==========================================
     * CHECK DRIVER
     * ==========================================
     */

    if (driverId) {

      const driversSheet =
        getRequiredSheet_(
          spreadsheet,
          DRIVERS_SHEET_NAME
        );

      const driverValues =
        driversSheet
          .getDataRange()
          .getDisplayValues();

      if (driverValues.length < 2) {
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

      const driverNameColumn =
        driverHeaders.indexOf(
          "Driver Name"
        );

      const driverStatusColumn =
        driverHeaders.indexOf(
          "Driver Status"
        );

      if (
        driverIdColumn === -1 ||
        driverNameColumn === -1 ||
        driverStatusColumn === -1
      ) {
        throw new Error(
          "Required Drivers columns are missing."
        );
      }

      let driverFound =
        false;

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

          const driverName =
            String(
              driverValues[i][
              driverNameColumn
              ] ?? ""
            ).trim();

          const driverStatus =
            String(
              driverValues[i][
              driverStatusColumn
              ] ?? ""
            ).trim();

          result.driver = {
            driverId:
              driverId,
            driverName:
              driverName,
            status:
              driverStatus,
            available:
              driverStatus ===
              "Available"
          };

          driverFound =
            true;

          break;
        }
      }

      if (!driverFound) {
        throw new Error(
          `Driver ${driverId} was not found.`
        );
      }
    }

    /*
     * ==========================================
     * CHECK VEHICLE
     * ==========================================
     */

    if (vehicleId) {

      const vehiclesSheet =
        getRequiredSheet_(
          spreadsheet,
          VEHICLES_SHEET_NAME
        );

      const vehicleValues =
        vehiclesSheet
          .getDataRange()
          .getDisplayValues();

      if (vehicleValues.length < 2) {
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

      const vehicleMakeColumn =
        vehicleHeaders.indexOf(
          "Make"
        );

      const vehicleModelColumn =
        vehicleHeaders.indexOf(
          "Model"
        );

      const vehicleStatusColumn =
        vehicleHeaders.indexOf(
          "Status"
        );

      if (
        vehicleIdColumn === -1 ||
        vehicleMakeColumn === -1 ||
        vehicleModelColumn === -1 ||
        vehicleStatusColumn === -1
      ) {
        throw new Error(
          "Required Vehicles columns are missing."
        );
      }

      let vehicleFound =
        false;

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

          const make =
            String(
              vehicleValues[i][
              vehicleMakeColumn
              ] ?? ""
            ).trim();

          const model =
            String(
              vehicleValues[i][
              vehicleModelColumn
              ] ?? ""
            ).trim();

          const vehicleStatus =
            String(
              vehicleValues[i][
              vehicleStatusColumn
              ] ?? ""
            ).trim();

          result.vehicle = {
            vehicleId:
              vehicleId,
            vehicle:
              [make, model]
                .filter(Boolean)
                .join(" ")
                .trim(),
            status:
              vehicleStatus,
            available:
              vehicleStatus ===
              "Available"
          };

          vehicleFound =
            true;

          break;
        }
      }

      if (!vehicleFound) {
        throw new Error(
          `Vehicle ${vehicleId} was not found.`
        );
      }
    }

    return result;

  } catch (error) {

    Logger.log(
      "Dispatch Resource Availability Error: " +
      error.toString()
    );

    return {
      success: false,
      action:
        "checkDispatchResourceAvailability",
      error:
        error.toString()
    };

  }

}

function recordPayment(data) {
  data = data || {};

  const bookingReference =
    String(
      data.bookingReference ?? ""
    ).trim();

  const amountPaid =
    Number(
      data.amountPaid
    );

  const paymentMethod =
    String(
      data.paymentMethod ?? ""
    ).trim();

  const paymentDate =
    String(
      data.paymentDate ?? ""
    ).trim();

  const paymentReference =
    String(
      data.paymentReference ?? ""
    ).trim();

  const paymentType =
    String(
      data.paymentType ?? ""
    ).trim();

  if (!bookingReference) {
    throw new Error(
      "Booking reference is required."
    );
  }
  if (
    !Number.isFinite(amountPaid) ||
    amountPaid <= 0
  ) {
    throw new Error(
      "Payment amount must be greater than zero."
    );
  }

  const lock =
    LockService.getScriptLock();
  const spreadsheet =
    SpreadsheetApp.openById(
      "1YRM_PENzcd_7B2_oHmwR5TkbDeE78ZhNGGg94JQY7Fc"
    );

  const sheet =
    spreadsheet.getSheetByName(
      "Booking Records"
    );

  if (!sheet) {
    throw new Error(
      'Booking sheet "Booking Records" was not found.'
    );
  }

  const paymentsSheet =
    spreadsheet.getSheetByName(
      "Payments"
    );

  if (!paymentsSheet) {
    throw new Error(
      'Sheet "Payments" was not found.'
    );
  } const allowedPaymentMethods = [
    "Credit Card",
    "Bank Transfer"
  ];

  if (
    !allowedPaymentMethods.includes(
      paymentMethod
    )
  ) {
    throw new Error(
      "Invalid payment method."
    );
  }

  const allowedPaymentTypes = [
    "Deposit",
    "Balance",
    "Other"
  ];

  if (
    !allowedPaymentTypes.includes(
      paymentType
    )
  ) {
    throw new Error(
      "Invalid payment type."
    );
  }

  if (!paymentReference) {
    throw new Error(
      "Payment reference is required."
    );
  } lock.waitLock(30000);

  try {
    const bookingLastRow =
      sheet.getLastRow();

    if (bookingLastRow < 2) {
      throw new Error(
        "No booking records were found."
      );
    }

    const bookingRows =
      sheet
        .getRange(
          2,
          1,
          bookingLastRow - 1,
          19
        )
        .getDisplayValues();

    let bookingRecord = null;

    for (
      let i = 0;
      i < bookingRows.length;
      i++
    ) {
      const existingBookingId =
        String(
          bookingRows[i][0] ?? ""
        ).trim();

      if (
        existingBookingId ===
        bookingReference
      ) {
        bookingRecord =
          bookingRows[i];

        break;
      }
    }

    if (!bookingRecord) {
      throw new Error(
        `Booking ${bookingReference} was not found.`
      );
    } const paymentsLastRow =
      paymentsSheet.getLastRow();

    if (paymentsLastRow >= 2) {
      const existingPaymentReferences =
        paymentsSheet
          .getRange(
            2,
            9,
            paymentsLastRow - 1,
            1
          )
          .getDisplayValues();

      for (
        let i = 0;
        i < existingPaymentReferences.length;
        i++
      ) {
        const existingReference =
          String(
            existingPaymentReferences[i][0] ?? ""
          ).trim();

        if (
          existingReference ===
          paymentReference
        ) {
          throw new Error(
            `Payment reference ${paymentReference} already exists.`
          );
        }
      }
    }

    const total =
      Number(
        bookingRecord[16]
      );

    const deposit =
      Number(
        bookingRecord[17]
      );

    const balance =
      Number(
        bookingRecord[18]
      );

    if (
      !Number.isFinite(total) ||
      total < 0
    ) {
      throw new Error(
        "Invalid booking total."
      );
    }

    if (
      !Number.isFinite(deposit) ||
      deposit < 0
    ) {
      throw new Error(
        "Invalid booking deposit."
      );
    }

    if (
      !Number.isFinite(balance) ||
      balance < 0
    ) {
      throw new Error(
        "Invalid booking balance."
      );
    }
    let totalPaidAlready = 0;
    let depositPaidAlready = 0;
    let balancePaidAlready = 0;
    let otherPaidAlready = 0;

    if (paymentsLastRow >= 2) {
      const existingPayments =
        paymentsSheet
          .getRange(
            2,
            1,
            paymentsLastRow - 1,
            10
          )
          .getDisplayValues();

      for (
        let i = 0;
        i < existingPayments.length;
        i++
      ) {
        const existingBookingId =
          String(
            existingPayments[i][0] ?? ""
          ).trim();

        if (
          existingBookingId !==
          bookingReference
        ) {
          continue;
        }

        const existingAmount =
          Number(
            existingPayments[i][5]
          );

        if (
          !Number.isFinite(existingAmount) ||
          existingAmount <= 0
        ) {
          continue;
        }

        totalPaidAlready +=
          existingAmount;

        const existingPaymentType =
          String(
            existingPayments[i][9] ?? ""
          )
            .trim()
            .toLowerCase();

        if (
          existingPaymentType ===
          "deposit"
        ) {
          depositPaidAlready +=
            existingAmount;
        } else if (
          existingPaymentType ===
          "balance"
        ) {
          balancePaidAlready +=
            existingAmount;
        } else {
          otherPaidAlready +=
            existingAmount;
        }
      }
    } const outstandingAmount =
      Math.max(
        total -
        totalPaidAlready,
        0
      );

    const remainingDeposit =
      Math.max(
        deposit -
        depositPaidAlready,
        0
      );

    const remainingBalance =
      Math.max(
        balance -
        balancePaidAlready,
        0
      );

    const roundedOutstanding =
      Math.round(
        (
          outstandingAmount +
          Number.EPSILON
        ) * 100
      ) / 100;

    const roundedDepositRemaining =
      Math.round(
        (
          remainingDeposit +
          Number.EPSILON
        ) * 100
      ) / 100;

    const roundedBalanceRemaining =
      Math.round(
        (
          remainingBalance +
          Number.EPSILON
        ) * 100
      ) / 100;

    const roundedAmountPaid =
      Math.round(
        (
          amountPaid +
          Number.EPSILON
        ) * 100
      ) / 100;
    /*
* ==========================================
* OVERALL OUTSTANDING VALIDATION
* ==========================================
*/

    if (
      roundedAmountPaid >
      roundedOutstanding
    ) {
      throw new Error(
        `Payment amount USD $${roundedAmountPaid.toFixed(
          2
        )} exceeds the outstanding balance of USD $${roundedOutstanding.toFixed(
          2
        )}.`
      );
    }

    /*
     * ==========================================
     * PAYMENT TYPE VALIDATION
     * ==========================================
     */

    if (
      paymentType === "Deposit" &&
      roundedAmountPaid >
      roundedDepositRemaining
    ) {
      throw new Error(
        `Deposit payment USD $${roundedAmountPaid.toFixed(
          2
        )} exceeds the remaining deposit due of USD $${roundedDepositRemaining.toFixed(
          2
        )}.`
      );
    }

    if (
      paymentType === "Balance" &&
      roundedAmountPaid >
      roundedBalanceRemaining
    ) {
      throw new Error(
        `Balance payment USD $${roundedAmountPaid.toFixed(
          2
        )} exceeds the remaining balance due of USD $${roundedBalanceRemaining.toFixed(
          2
        )}.`
      );
    }

    if (
      paymentType === "Other" &&
      roundedAmountPaid >
      roundedOutstanding
    ) {
      throw new Error(
        `Other payment USD $${roundedAmountPaid.toFixed(
          2
        )} exceeds the outstanding balance of USD $${roundedOutstanding.toFixed(
          2
        )}.`
      );
    }    /*
     * ==========================================
     * CALCULATE PAYMENT STATUS
     * ==========================================
     */

    const totalPaidAfterPayment =
      totalPaidAlready +
      roundedAmountPaid;

    const paymentStatus =
      totalPaidAfterPayment >= total
        ? "Paid"
        : "Partially Paid";

    /*
     * ==========================================
     * WRITE PAYMENT TO PAYMENTS SHEET
     * ==========================================
     */

    const recordedPaymentDate =
      paymentDate ||
      new Date();

    paymentsSheet.appendRow([
      bookingReference,
      total,
      deposit,
      balance,
      paymentStatus,
      roundedAmountPaid,
      paymentMethod,
      recordedPaymentDate,
      paymentReference,
      paymentType
    ]);

    /*
     * ==========================================
     * UPDATE BOOKING STATUS
     * ==========================================
     *
     * The booking becomes Confirmed once
     * cumulative payments reach the required
     * deposit.
     *
     * Dispatch is NOT called here.
     */

    const bookingStatus =
      totalPaidAfterPayment >= deposit
        ? "Confirmed"
        : "Pending";


    const currentBookingStatus =
      String(
        bookingRecord[1] ?? ""
      ).trim();

    if (
      currentBookingStatus !==
      "Cancelled" &&
      currentBookingStatus !==
      "Completed"
    ) {
      sheet
        .getRange(
          bookingRecord
            ? bookingRows.indexOf(
              bookingRecord
            ) + 2
            : 0,
          2
        )
        .setValue(
          bookingStatus
        );
    }

    SpreadsheetApp.flush();

    Logger.log(
      `Payment ${paymentReference} recorded for ${bookingReference}.`
    );

    Logger.log(
      `Total paid after payment: ${totalPaidAfterPayment}`
    );

    Logger.log(
      `Booking status: ${bookingStatus}`
    );

    return {
      success: true,
      action:
        "recordPayment",
      bookingReference:
        bookingReference,
      amountPaid:
        roundedAmountPaid,
      paymentMethod:
        paymentMethod,
      paymentType:
        paymentType,
      paymentReference:
        paymentReference,
      totalPaid:
        totalPaidAfterPayment,
      outstandingBalance:
        Math.max(
          total -
          totalPaidAfterPayment,
          0
        ),
      bookingStatus:
        bookingStatus,
      paymentStatus:
        paymentStatus
    };

  } catch (error) {

    Logger.log(
      "RECORD PAYMENT ERROR: " +
      error.toString()
    );
    throw error;
  } finally {

    lock.releaseLock();

  }

}
