import type { Booking } from "@/types/booking";

import { calculateBookingPrice } from "./pricing";
import { validateBooking } from "./validation";
import { generateBookingReference } from "./bookingReference";
import { saveBooking } from "./bookingRepository";
import { routes } from "./routes";

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
    service: booking.serviceCategory as
      "Airport Transfer" | "Tour",
    pickup: booking.pickup,
    destination: booking.destination,
    tripType: booking.tripType,
    passengers: booking.passengers,
    tourType: booking.tourType,
    childSeat: booking.childSeat > 0,
    extraStop: booking.extraStop > 0,
    waitingTimeHours: booking.waitingTimeHours,
  });

  if (!pricing) {
    return {
      success: false,
      errors: [
        booking.serviceCategory === "Tour"
          ? "Unable to calculate pricing for the selected tour."
          : `No active ${booking.serviceCategory} route found for ${booking.pickup} to ${booking.destination}.`,
      ],
    };
  }

  const route =
    booking.serviceCategory === "Tour"
      ? null
      : routes.find(
          (item) =>
            item.pickup === booking.pickup &&
            item.destination === booking.destination &&
            item.service === booking.serviceCategory &&
            item.vehicle === pricing.vehicle
        );

  if (
    booking.serviceCategory !== "Tour" &&
    !route
  ) {
    return {
      success: false,
      errors: [
        `No route found for ${booking.pickup} to ${booking.destination}.`,
      ],
    };
  }

  const bookingReference = generateBookingReference();

  const completedBooking: Booking = {
    ...booking,

    bookingReference,

    status: "Pending",

    vehicle: pricing.vehicle,

    baseFare: pricing.baseFare,

    additionalPassengerFee: pricing.passengerFee,

    additionalPassengerTotal: pricing.passengerFee,

    total: pricing.total,

    deposit: pricing.deposit,

    balance: pricing.balance,

    routeId: route?.id,
  };

  const saveResult = await saveBooking(
    completedBooking,
    bookingReference
  );

  if (!saveResult.success) {
    return {
      success: false,
      errors: [
        saveResult.message ?? "Unable to save booking.",
      ],
    };
  }

  return {
    success: true,
    bookingReference,
    booking: completedBooking,
    errors: [],
  };
}