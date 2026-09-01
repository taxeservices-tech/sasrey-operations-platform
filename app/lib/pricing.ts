import { findBookingRoute } from "./routeResolver";

export interface BookingPriceInput {
  service: "Airport Transfer" | "Tour";

  pickup: string;
  destination: string;

  tripType: "One Way" | "Round Trip";

  passengers: number;

  tourType?:
    | "Private Tour"
    | "Full-Day Tour"
    | "Custom/Private Excursion";

  childSeat?: boolean;
  extraStop?: boolean;
  waitingTimeHours?: number;
}

export interface BookingPriceResult {
  vehicle: string;

  baseFare: number;

  passengerFee: number;

  childSeatFee: number;

  extraStopFee: number;

  waitingTimeFee: number;

  total: number;

  deposit: number;

  balance: number;
}

export function calculateBookingPrice(
  booking: BookingPriceInput
): BookingPriceResult | null {
  /*
   * Tour pricing
   *
   * Tours use fixed starting prices by tour type
   * and do not depend on the airport-transfer route table.
   */
  if (booking.service === "Tour") {
    if (!booking.tourType) {
      return null;
    }

    if (booking.passengers < 1 || booking.passengers > 7) {
      return null;
    }

    const tourPrices: Record<
      NonNullable<BookingPriceInput["tourType"]>,
      number
    > = {
      "Private Tour": 275,
      "Full-Day Tour": 350,
      "Custom/Private Excursion": 450,
    };

    const baseFare = tourPrices[booking.tourType];

    const passengerFee = 0;

    const childSeatFee = booking.childSeat ? 10 : 0;

    const extraStopFee = booking.extraStop ? 15 : 0;

    const waitingTimeFee =
      (booking.waitingTimeHours ?? 0) * 20;

    const total =
      baseFare +
      passengerFee +
      childSeatFee +
      extraStopFee +
      waitingTimeFee;

    const deposit = Number(
      (total * 0.25).toFixed(2)
    );

    const balance = Number(
      (total * 0.75).toFixed(2)
    );

    return {
      vehicle: "Toyota Noah Station Wagon",

      baseFare,

      passengerFee,

      childSeatFee,

      extraStopFee,

      waitingTimeFee,

      total,

      deposit,

      balance,
    };
  }

  /*
   * Airport Transfer pricing
   *
   * Existing route-based pricing remains unchanged.
   */
  const route = findBookingRoute({
    service: booking.service,
    pickup: booking.pickup,
    destination: booking.destination,
    passengers: booking.passengers,
  });

  if (!route) {
    return null;
  }

  if (
    booking.passengers < 1 ||
    booking.passengers > route.maxPassengers
  ) {
    return null;
  }

  const baseFare =
    booking.tripType === "Round Trip"
      ? route.roundTripPrice
      : route.basePrice;

  const extraPassengers = Math.max(
    booking.passengers -
      route.includedPassengers,
    0
  );

  const passengerFee =
    extraPassengers *
    route.additionalPassengerFee;

  const childSeatFee =
    booking.childSeat
      ? route.childSeatFee
      : 0;

  const extraStopFee =
    booking.extraStop
      ? route.extraStopFee
      : 0;

  const waitingTimeFee =
    (booking.waitingTimeHours ?? 0) *
    route.waitingTimeFee;

  const total =
    baseFare +
    passengerFee +
    childSeatFee +
    extraStopFee +
    waitingTimeFee;

  const deposit = Number(
    (total * 0.25).toFixed(2)
  );

  const balance = Number(
    (total * 0.75).toFixed(2)
  );

  return {
    vehicle: route.vehicle,

    baseFare,

    passengerFee,

    childSeatFee,

    extraStopFee,

    waitingTimeFee,

    total,

    deposit,

    balance,
  };
}