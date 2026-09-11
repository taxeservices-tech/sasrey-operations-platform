import { findBookingRoute } from "./routeResolver";
import { tours } from "./tours";

export interface BookingPriceInput {
  service: "Airport Transfer" | "Tour";

  pickup?: string;
  destination?: string;

  tripType?: "One Way" | "Round Trip";

  passengers: number;

  tourId?: string;

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
   * When a tourId is supplied, pricing comes from the
   * existing Master Tours catalogue. The legacy tourType
   * pricing remains as a compatibility fallback for
   * callers that have not yet been migrated to tourId.
   */
  if (booking.service === "Tour") {
    if (booking.passengers < 1 || booking.passengers > 7) {
      return null;
    }

    const selectedTour = booking.tourId
      ? tours.find((tour) => tour.id === booking.tourId)
      : undefined;

    if (booking.tourId && !selectedTour) {
      return null;
    }

    let baseFare: number;
    let passengerFee = 0;

    if (selectedTour) {
      baseFare = selectedTour.basePrice;

      if (
        selectedTour.includedPassengers !== null &&
        booking.passengers > selectedTour.includedPassengers
      ) {
        passengerFee =
          (booking.passengers -
            selectedTour.includedPassengers) *
          selectedTour.additionalPassengerFee;
      }

      if (
        selectedTour.maxPassengers !== null &&
        booking.passengers > selectedTour.maxPassengers
      ) {
        return null;
      }
    } else {
      if (!booking.tourType) {
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

      baseFare = tourPrices[booking.tourType];
    }

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
  if (
    !booking.pickup ||
    !booking.destination ||
    !booking.tripType
  ) {
    return null;
  }

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