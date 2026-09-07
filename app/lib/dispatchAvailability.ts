import {
  getTransferDurationMinutes,
  getTourDurationMinutes,
} from "@/app/lib/serviceDuration";

export type DispatchSheetRow = Record<
  string,
  string | number | undefined
>;

const DEFAULT_TURNAROUND_BUFFER_MINUTES = 60;

function getValue(
  row: DispatchSheetRow | undefined,
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
  row: DispatchSheetRow | undefined,
  ...keys: string[]
): number {
  const value = Number(
    getValue(row, ...keys)
  );

  return Number.isFinite(value)
    ? value
    : 0;
}

function parseDispatchDateTime(
  pickupDate: string,
  pickupTime: string
): Date | null {
  const date = pickupDate.trim();
  const time = pickupTime.trim();

  const match =
    /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(date);

  if (!match || !time) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  let hours = 0;
  let minutes = 0;

  const amPmMatch =
    /^([0-9]{1,2}):([0-9]{2})\s*(AM|PM)$/i.exec(time);

  if (amPmMatch) {
    hours = Number(amPmMatch[1]);
    minutes = Number(amPmMatch[2]);

    if (
      hours < 1 ||
      hours > 12 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return null;
    }

    const period =
      amPmMatch[3].toUpperCase();

    hours =
      period === "AM"
        ? hours === 12
          ? 0
          : hours
        : hours === 12
          ? 12
          : hours + 12;
  } else {
    const timeMatch =
      /^([0-9]{1,2}):([0-9]{2})$/.exec(time);

    if (!timeMatch) {
      return null;
    }

    hours = Number(timeMatch[1]);
    minutes = Number(timeMatch[2]);

    if (
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return null;
    }
  }

  const result = new Date(
    year,
    month - 1,
    day,
    hours,
    minutes,
    0,
    0
  );

  return Number.isNaN(result.getTime())
    ? null
    : result;
}

function getBookingServiceDurationMinutes(
  booking: DispatchSheetRow | undefined
): number | null {
  if (!booking) {
    return null;
  }

  const serviceType = getValue(
    booking,
    "Service Type",
    "Service Category"
  );

  if (serviceType === "Airport Transfer") {
    return getTransferDurationMinutes(
      getValue(booking, "Pickup"),
      getValue(booking, "Destination")
    );
  }

  if (serviceType === "Tour") {
    const tourType = getValue(
      booking,
      "Tour Type"
    );

    if (
      tourType === "Private Tour" ||
      tourType === "Full-Day Tour" ||
      tourType === "Custom/Private Excursion"
    ) {
      return getTourDurationMinutes(
        tourType
      );
    }

    const storedDuration = getNumber(
      booking,
      "Service Duration Minutes"
    );

    return storedDuration > 0
      ? storedDuration
      : null;
  }

  const storedDuration = getNumber(
    booking,
    "Service Duration Minutes"
  );

  return storedDuration > 0
    ? storedDuration
    : null;
}

export function getDispatchReservationWindow(
  dispatch: DispatchSheetRow
): {
  start: Date;
  occupiedEnd: Date;
} | null {
  const start = parseDispatchDateTime(
    getValue(
      dispatch,
      "Pickup Date"
    ),
    getValue(
      dispatch,
      "Pickup Time"
    )
  );

  const durationMinutes = getNumber(
    dispatch,
    "Service Duration Minutes"
  );

  const bufferRaw = getValue(
    dispatch,
    "Turnaround Buffer Minutes"
  );

  const bufferMinutes =
    bufferRaw === ""
      ? DEFAULT_TURNAROUND_BUFFER_MINUTES
      : Number(bufferRaw);

  if (
    !start ||
    durationMinutes <= 0 ||
    !Number.isFinite(
      bufferMinutes
    ) ||
    bufferMinutes < 0
  ) {
    return null;
  }

  return {
    start,
    occupiedEnd: new Date(
      start.getTime() +
        (durationMinutes +
          bufferMinutes) *
          60 *
          1000
    ),
  };
}

export function getBookingReservationWindow(
  booking: DispatchSheetRow | undefined
): {
  start: Date;
  occupiedEnd: Date;
} | null {
  if (!booking) {
    return null;
  }

  const durationMinutes =
    getBookingServiceDurationMinutes(
      booking
    );

  if (!durationMinutes) {
    return null;
  }

  const start = parseDispatchDateTime(
    getValue(
      booking,
      "Pickup Date"
    ),
    getValue(
      booking,
      "Pickup Time"
    )
  );

  if (!start) {
    return null;
  }

  return {
    start,
    occupiedEnd: new Date(
      start.getTime() +
        (durationMinutes +
          DEFAULT_TURNAROUND_BUFFER_MINUTES) *
          60 *
          1000
    ),
  };
}
