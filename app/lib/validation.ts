import type { Booking } from "@/types/booking";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
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
  }

  if (!booking.pickupTime) {
    errors.push("Pickup time is required.");
  }

  if (
    booking.passengers === undefined ||
    booking.passengers < 1
  ) {
    errors.push(
      "At least one passenger is required."
    );
  }

  if (
    booking.passengers !== undefined &&
    booking.passengers > 7
  ) {
    errors.push(
      "Maximum passengers for this vehicle is 7."
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
      booking.email
    )
  ) {
    errors.push("Email address is invalid.");
  }

  if (!booking.phone?.trim()) {
    errors.push("Phone number is required.");
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
    errors.push(
      "Please select a payment method."
    );
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

  const errors = [
    ...trip.errors,
    ...passenger.errors,
    ...payment.errors,
  ];

  return {
    valid: errors.length === 0,
    errors,
  };
}