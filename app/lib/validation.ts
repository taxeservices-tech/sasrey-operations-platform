import type { Booking } from "@/types/booking";
import { routes } from "./routes";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function getJamaicaDateTime(): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Jamaica",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const values: Record<string, string> = {};

  parts.forEach((part) => {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  });

  let hour = Number(values.hour);

  if (hour === 24) {
    hour = 0;
  }

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour,
    minute: Number(values.minute),
  };
}

function parsePickupTime(
  pickupTime: string
): {
  hour: number;
  minute: number;
} | null {
  const value = pickupTime.trim();

  const twentyFourHourMatch =
    /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);

  if (twentyFourHourMatch) {
    return {
      hour: Number(twentyFourHourMatch[1]),
      minute: Number(twentyFourHourMatch[2]),
    };
  }

  const twelveHourMatch =
    /^(1[0-2]|[1-9]):([0-5]\d)\s(AM|PM)$/i.exec(
      value
    );

  if (twelveHourMatch) {
    let hour = Number(twelveHourMatch[1]);
    const minute = Number(twelveHourMatch[2]);
    const period = twelveHourMatch[3].toUpperCase();

    if (period === "AM" && hour === 12) {
      hour = 0;
    }

    if (period === "PM" && hour !== 12) {
      hour += 12;
    }

    return {
      hour,
      minute,
    };
  }

  return null;
}

export function validateTripDetails(
  booking: Partial<Booking>
): ValidationResult {
  const errors: string[] = [];

  if (!booking.pickup) {
    errors.push("Pickup location is required.");
  }

  if (!booking.destination) {
    errors.push("Destination is required.");
  }

  if (
    booking.pickup &&
    booking.destination &&
    booking.pickup === booking.destination
  ) {
    errors.push(
      "Pickup and destination cannot be the same."
    );
  }

  if (!booking.tripType) {
    errors.push("Trip type is required.");
  }

  if (!booking.pickupDate) {
    errors.push("Pickup date is required.");
  } else {
    const pickupDate = new Date(
      `${booking.pickupDate}T00:00:00`
    );

    const jamaicaNow = getJamaicaDateTime();

    if (Number.isNaN(pickupDate.getTime())) {
      errors.push("Pickup date is invalid.");
    } else {
      const pickupYear = pickupDate.getFullYear();
      const pickupMonth =
        pickupDate.getMonth() + 1;
      const pickupDay = pickupDate.getDate();

      const pickupDateKey =
        pickupYear * 10000 +
        pickupMonth * 100 +
        pickupDay;

      const todayDateKey =
        jamaicaNow.year * 10000 +
        jamaicaNow.month * 100 +
        jamaicaNow.day;

      if (pickupDateKey < todayDateKey) {
        errors.push(
          "Pickup date cannot be in the past."
        );
      }
    }
  }

  if (!booking.pickupTime) {
    errors.push("Pickup time is required.");
  } else {
    const parsedTime = parsePickupTime(
      booking.pickupTime
    );

    if (!parsedTime) {
      errors.push("Pickup time is invalid.");
    } else if (booking.pickupDate) {
      const pickupDate = new Date(
        `${booking.pickupDate}T00:00:00`
      );

      if (!Number.isNaN(pickupDate.getTime())) {
        const pickupYear =
          pickupDate.getFullYear();

        const pickupMonth =
          pickupDate.getMonth() + 1;

        const pickupDay =
          pickupDate.getDate();

        const jamaicaNow =
          getJamaicaDateTime();

        const pickupDateKey =
          pickupYear * 10000 +
          pickupMonth * 100 +
          pickupDay;

        const todayDateKey =
          jamaicaNow.year * 10000 +
          jamaicaNow.month * 100 +
          jamaicaNow.day;

        if (pickupDateKey === todayDateKey) {
          const pickupMinutes =
            parsedTime.hour * 60 +
            parsedTime.minute;

          const currentMinutes =
            jamaicaNow.hour * 60 +
            jamaicaNow.minute;

          if (pickupMinutes <= currentMinutes) {
            errors.push(
              "Pickup time must be in the future."
            );
          }
        }
      }
    }
  }

  if (
    booking.passengers === undefined ||
    booking.passengers < 1
  ) {
    errors.push(
      "At least one passenger is required."
    );
  }

  const matchingRoute =
    booking.pickup &&
    booking.destination &&
    booking.serviceCategory
      ? routes.find(
          (route) =>
            route.active &&
            route.pickup === booking.pickup &&
            route.destination ===
              booking.destination &&
            route.service ===
              booking.serviceCategory
        )
      : undefined;

  if (
    booking.passengers !== undefined &&
    matchingRoute &&
    booking.passengers > matchingRoute.maxPassengers
  ) {
    errors.push(
      `Maximum passengers for this vehicle is ${matchingRoute.maxPassengers}.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validatePassengerDetails(
  booking: Partial<Booking>
): ValidationResult {
  const errors: string[] = [];

  if (!booking.customerName?.trim()) {
    errors.push("Customer name is required.");
  }

  if (!booking.email?.trim()) {
    errors.push("Email is required.");
  }

  if (
    booking.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      booking.email.trim()
    )
  ) {
    errors.push("Email address is invalid.");
  }

  if (!booking.phone?.trim()) {
    errors.push("Phone number is required.");
  } else {
    const phoneDigits = booking.phone.replace(
      /\D/g,
      ""
    );

    if (
      phoneDigits.length < 10 ||
      phoneDigits.length > 15
    ) {
      errors.push("Phone number is invalid.");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validatePayment(
  booking: Partial<Booking>
): ValidationResult {
  const errors: string[] = [];

  if (!booking.paymentMethod) {
    errors.push("Please select a payment method.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateBooking(
  booking: Partial<Booking>
): ValidationResult {
  const trip = validateTripDetails(booking);
  const passenger =
    validatePassengerDetails(booking);
  const payment = validatePayment(booking);

  return {
    valid:
      trip.valid &&
      passenger.valid &&
      payment.valid,
    errors: [
      ...trip.errors,
      ...passenger.errors,
      ...payment.errors,
    ],
  };
}