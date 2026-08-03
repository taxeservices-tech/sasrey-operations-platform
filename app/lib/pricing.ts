export interface RoutePricing {
  pickup: string;
  destination: string;
  basePrice: number;
  roundTrip: number;
  additionalPassengerFee: number;
  maxPassengers: number;
}

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

export const routes: RoutePricing[] = [
  {
    pickup: "MBJ Airport",
    destination: "Montego Bay Hotels",
    basePrice: 35,
    roundTrip: 70,
    additionalPassengerFee: 10,
    maxPassengers: 7,
  },
  {
    pickup: "MBJ Airport",
    destination: "Rose Hall",
    basePrice: 45,
    roundTrip: 90,
    additionalPassengerFee: 10,
    maxPassengers: 7,
  },
  {
    pickup: "MBJ Airport",
    destination: "Falmouth",
    basePrice: 60,
    roundTrip: 120,
    additionalPassengerFee: 15,
    maxPassengers: 7,
  },
  {
    pickup: "MBJ Airport",
    destination: "Runaway Bay",
    basePrice: 95,
    roundTrip: 190,
    additionalPassengerFee: 15,
    maxPassengers: 7,
  },
  {
    pickup: "MBJ Airport",
    destination: "Negril",
    basePrice: 120,
    roundTrip: 240,
    additionalPassengerFee: 20,
    maxPassengers: 7,
  },
  {
    pickup: "MBJ Airport",
    destination: "Ocho Rios",
    basePrice: 120,
    roundTrip: 240,
    additionalPassengerFee: 20,
    maxPassengers: 7,
  },
  {
    pickup: "MBJ Airport",
    destination: "Kingston",
    basePrice: 280,
    roundTrip: 560,
    additionalPassengerFee: 35,
    maxPassengers: 7,
  },
];

export function calculateBookingPrice(
  booking: BookingPriceInput
): BookingPriceResult | null {

  const route = routes.find(
    (r) =>
      r.pickup === booking.pickup &&
      r.destination === booking.destination
  );

  if (!route) return null;

  const baseFare =
    booking.tripType === "Round Trip"
      ? route.roundTrip
      : route.basePrice;

  const extraPassengers =
    Math.max(booking.passengers - 1, 0);

  const passengerFee =
    extraPassengers *
    route.additionalPassengerFee;

  const childSeatFee =
    booking.childSeat ? 10 : 0;

  const extraStopFee =
    booking.extraStop ? 15 : 0;

  const waitingTimeFee =
    (booking.waitingTimeHours ?? 0) * 20;

  const total =
    baseFare +
    passengerFee +
    childSeatFee +
    extraStopFee +
    waitingTimeFee;

  const deposit =
    Number((total * 0.25).toFixed(2));

  const balance =
    Number((total * 0.75).toFixed(2));

  return {
    vehicle: "Toyota Noah",

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