import { routes } from "./routes";

export interface BookingPriceInput {
  pickup: string;
  destination: string;

  tripType: "One Way" | "Round Trip";

  passengers: number;

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
  const route = routes.find(
    (route) =>
      route.active &&
      route.pickup === booking.pickup &&
      route.destination === booking.destination
  );

  if (!route) {
    return null;
  }

  const baseFare =
    booking.tripType === "Round Trip"
      ? route.roundTripPrice
      : route.basePrice;

  const extraPassengers = Math.max(
    booking.passengers - 1,
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