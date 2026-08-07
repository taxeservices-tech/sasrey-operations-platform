import type { Booking } from "@/types/booking";

import { calculateBookingPrice } from "./pricing";
import { validateBooking } from "./validation";
import { generateBookingReference } from "./bookingReference";
import { saveBooking } from "./bookingRepository";

export interface BookingServiceResult {
  success: boolean;
  bookingReference?: string;
  errors: string[];
  booking?: Booking;
}

export async function processBooking(
  booking: Booking
): Promise<BookingServiceResult> {
  const validation = validateBooking(booking);

  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors,
    };
  }

  const pricing = calculateBookingPrice({
    pickup: booking.pickup,
    destination: booking.destination,
    tripType: booking.tripType,
    passengers: booking.passengers,
    childSeat: booking.childSeat,
    extraStop: booking.extraStop,
    waitingTimeHours: booking.waitingTimeHours,
  });

  if (!pricing) {
    return {
      success: false,
      errors: ["Unable to calculate booking price."],
    };
  }

  const bookingReference = generateBookingReference();

  const completedBooking: Booking = {
    ...booking,

    bookingReference,

    vehicle: pricing.vehicle,

    baseFare: pricing.baseFare,

    additionalPassengerFee: pricing.passengerFee,

    additionalPassengerTotal: pricing.passengerFee,

    total: pricing.total,

    deposit: pricing.deposit,

    balance: pricing.balance,
  };

  await saveBooking(
    completedBooking,
    bookingReference
  );

  return {
    success: true,
    bookingReference,
    booking: completedBooking,
    errors: [],
  };
}