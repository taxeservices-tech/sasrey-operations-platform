/**
 * SASREY Operations Platform
 * Time-based resource availability engine.
 *
 * This file is intentionally separate from Dispatch.gs.
 * It provides reusable helpers for checking whether a driver
 * or vehicle is available for a requested service window.
 */

var AVAILABILITY_TIMEZONE = "America/Jamaica";
var AVAILABILITY_DEFAULT_BUFFER_MINUTES = 60;

/**
 * Parse a booking date/time into a JavaScript Date.
 *
 * Supports:
 *   2026-09-15
 *   10:30 AM
 *   10:30
 *   14:30
 */
function parseAvailabilityDateTime_(pickupDate, pickupTime) {
  var dateText = String(pickupDate || "").trim();
  var timeText = String(pickupTime || "").trim();

  if (!dateText || !timeText) {
    return null;
  }

  var dateMatch = dateText.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);

  if (!dateMatch) {
    return null;
  }

  var year = Number(dateMatch[1]);
  var month = Number(dateMatch[2]);
  var day = Number(dateMatch[3]);

  var hours;
  var minutes;

  var ampmMatch = timeText.match(
    /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i
  );

  if (ampmMatch) {
    hours = Number(ampmMatch[1]);
    minutes = Number(ampmMatch[2] || 0);

    var ampm = ampmMatch[3].toUpperCase();

    if (hours === 12) {
      hours = 0;
    }

    if (ampm === "PM") {
      hours += 12;
    }
  } else {
    var timeMatch = timeText.match(/^(\d{1,2}):(\d{2})$/);

    if (!timeMatch) {
      return null;
    }

    hours = Number(timeMatch[1]);
    minutes = Number(timeMatch[2]);
  }

  if (
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return new Date(
    year,
    month - 1,
    day,
    hours,
    minutes,
    0,
    0
  );
}

/**
 * Add minutes to a date without mutating the original Date object.
 */
function addAvailabilityMinutes_(startDate, minutes) {
  return new Date(startDate.getTime() + Number(minutes || 0) * 60000);
}

/**
 * Return true when two time windows overlap.
 *
 * End time is treated as exclusive, so:
 *   A: 10:00-11:00
 *   B: 11:00-12:00
 *
 * do not overlap.
 */
function availabilityWindowsOverlap_(
  startA,
  endA,
  startB,
  endB
) {
  return (
    startA &&
    endA &&
    startB &&
    endB &&
    startA.getTime() < endB.getTime() &&
    startB.getTime() < endA.getTime()
  );
}

/**
 * Build a requested reservation window.
 *
 * Occupancy includes:
 *   service duration
 *   turnaround buffer
 */
function buildAvailabilityWindow_(
  pickupDate,
  pickupTime,
  serviceDurationMinutes,
  bufferMinutes
) {
  var start = parseAvailabilityDateTime_(
    pickupDate,
    pickupTime
  );

  if (!start) {
    return null;
  }

  var duration = Number(serviceDurationMinutes);

  if (!isFinite(duration) || duration <= 0) {
    return null;
  }

  var buffer =
    bufferMinutes === undefined ||
    bufferMinutes === null
      ? AVAILABILITY_DEFAULT_BUFFER_MINUTES
      : Number(bufferMinutes);

  if (!isFinite(buffer) || buffer < 0) {
    return null;
  }

  var serviceEnd = addAvailabilityMinutes_(
    start,
    duration
  );

  var occupiedEnd = addAvailabilityMinutes_(
    serviceEnd,
    buffer
  );

  return {
    start: start,
    serviceEnd: serviceEnd,
    occupiedEnd: occupiedEnd,
    durationMinutes: duration,
    bufferMinutes: buffer
  };
}

/**
 * Determine whether a resource has a conflicting dispatch.
 *
 * dispatchRecord must contain:
 *   Driver ID or Vehicle ID
 *   Pickup Date
 *   Pickup Time
 *   Service Duration Minutes
 *
 * For now this function is deliberately generic so it can
 * be wired into the existing Dispatch records without changing
 * the dispatch lifecycle logic.
 */
function isDispatchResourceWindowBusy_(
  resourceId,
  resourceType,
  requestedWindow,
  dispatchRecords,
  getDispatchWindow
) {
  var id = String(resourceId || "").trim();

  if (!id || !requestedWindow) {
    return false;
  }

  var records = dispatchRecords || [];

  for (var i = 0; i < records.length; i++) {
    var dispatch = records[i];

    var status = String(
      dispatch["Dispatch Status"] || ""
    ).trim();

    if (
      status !== "Assigned" &&
      status !== "En Route" &&
      status !== "Passenger Onboard" &&
      status !== "Incident"
    ) {
      continue;
    }

    var resourceField =
      resourceType === "driver"
        ? "Driver ID"
        : "Vehicle ID";

    var dispatchResourceId = String(
      dispatch[resourceField] || ""
    ).trim();

    if (dispatchResourceId !== id) {
      continue;
    }

    var existingWindow =
      typeof getDispatchWindow === "function"
        ? getDispatchWindow(dispatch)
        : null;

    if (!existingWindow) {
      continue;
    }

    if (
      availabilityWindowsOverlap_(
        requestedWindow.start,
        requestedWindow.occupiedEnd,
        existingWindow.start,
        existingWindow.occupiedEnd
      )
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Return conflicting dispatch records for diagnostics.
 *
 * This is useful for the Operations UI because we can later
 * show exactly which booking is causing the conflict.
 */
function findDispatchResourceWindowConflicts_(
  resourceId,
  resourceType,
  requestedWindow,
  dispatchRecords,
  getDispatchWindow
) {
  var conflicts = [];
  var id = String(resourceId || "").trim();

  if (!id || !requestedWindow) {
    return conflicts;
  }

  var records = dispatchRecords || [];

  for (var i = 0; i < records.length; i++) {
    var dispatch = records[i];

    var status = String(
      dispatch["Dispatch Status"] || ""
    ).trim();

    if (
      status !== "Assigned" &&
      status !== "En Route" &&
      status !== "Passenger Onboard" &&
      status !== "Incident"
    ) {
      continue;
    }

    var resourceField =
      resourceType === "driver"
        ? "Driver ID"
        : "Vehicle ID";

    var dispatchResourceId = String(
      dispatch[resourceField] || ""
    ).trim();

    if (dispatchResourceId !== id) {
      continue;
    }

    var existingWindow =
      typeof getDispatchWindow === "function"
        ? getDispatchWindow(dispatch)
        : null;

    if (!existingWindow) {
      continue;
    }

    if (
      availabilityWindowsOverlap_(
        requestedWindow.start,
        requestedWindow.occupiedEnd,
        existingWindow.start,
        existingWindow.occupiedEnd
      )
    ) {
      conflicts.push(dispatch);
    }
  }

  return conflicts;
}