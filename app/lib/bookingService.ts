import type { Booking } from "@/types/booking";

import {
  calculateBookingPrice,
} from "./pricing";

import {
  validateBooking,
} from "./validation";

import {
  generateBookingReference,
} from "./bookingReference";

export interface BookingServiceResult {
  success: boolean;

  bookingReference?: string;

  errors: string[];

  booking?: Booking;
}

export function processBooking(
  booking: Booking
): BookingServiceResult {
  const errors = validateBooking(booking);

  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }

  const pricing = calculateBookingPrice({
    pickup: booking.pickup,
    destination: booking.destination,
    tripType: booking.tripType,
    passengers: booking.passengers,
    childSeat: booking.childSeat,
    extraStop: booking.extraStop,
    waitingTimeHours:
      booking.waitingTimeHours,
  });

  if (!pricing) {
    return {
      success: false,
      errors: [
        "Unable to calculate booking price.",
      ],
    };
  }

  const bookingReference =
    generateBookingReference();

  return {
    success: true,

    bookingReference,

    booking: {
      ...booking,

      vehicle: pricing.vehicle,

      baseFare: pricing.baseFare,

      additionalPassengerFee:
        pricing.passengerFee,

      total: pricing.total,

      deposit: pricing.deposit,

      balance: pricing.balance,
    },

    errors: [],
  };
}