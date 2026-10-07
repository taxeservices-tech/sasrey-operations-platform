import { tours } from "./tours";

export interface RoutePricing {
  pickup: string;
  destination: string;
  basePrice: number;
  roundTrip: number;
  additionalPassengerFee: number;
  maxPassengers: number;
}

export interface BookingPriceInput {
  pickup?: string;
  destination?: string;

  tripType?: "One Way" | "Round Trip";

  passengers: number;

  tourId?: string;

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

const VEHICLE_NAME = "Toyota Noah";

const CHILD_SEAT_FEE = 10;
const EXTRA_STOP_FEE = 15;
const WAITING_TIME_FEE_PER_HOUR = 20;

const DEPOSIT_PERCENTAGE = 0.25;

function calculatePaymentSplit(total: number) {
  const deposit = Number(
    (total * DEPOSIT_PERCENTAGE).toFixed(2)
  );

  const balance = Number(
    (total - deposit).toFixed(2)
  );

  return {
    deposit,
    balance,
  };
}

function calculateOptionalFees(
  booking: BookingPriceInput
) {
  const childSeatFee =
    booking.childSeat ? CHILD_SEAT_FEE : 0;

  const extraStopFee =
    booking.extraStop ? EXTRA_STOP_FEE : 0;

  const waitingTimeFee =
    (booking.waitingTimeHours ?? 0) *
    WAITING_TIME_FEE_PER_HOUR;

  return {
    childSeatFee,
    extraStopFee,
    waitingTimeFee,
  };
}

function calculateTourPrice(
  booking: BookingPriceInput
): BookingPriceResult | null {
  if (!booking.tourId) {
    return null;
  }

  if (
    booking.passengers < 1 ||
    booking.passengers > 7
  ) {
    return null;
  }

  const selectedTour = tours.find(
    (tour) => tour.id === booking.tourId
  );

  if (!selectedTour || !selectedTour.active) {
    return null;
  }

  if (
    selectedTour.maxPassengers !== null &&
    booking.passengers >
      selectedTour.maxPassengers
  ) {
    return null;
  }

  let baseFare = selectedTour.basePrice;

  let passengerFee = 0;

  if (
    selectedTour.includedPassengers !== null &&
    booking.passengers >
      selectedTour.includedPassengers
  ) {
    passengerFee =
      (booking.passengers -
        selectedTour.includedPassengers) *
      selectedTour.additionalPassengerFee;
  }

  const {
    childSeatFee,
    extraStopFee,
    waitingTimeFee,
  } = calculateOptionalFees(booking);

  const total =
    baseFare +
    passengerFee +
    childSeatFee +
    extraStopFee +
    waitingTimeFee;

  const { deposit, balance } =
    calculatePaymentSplit(total);

  return {
    vehicle:
      selectedTour.vehicle ?? VEHICLE_NAME,

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

function calculateAirportTransferPrice(
  booking: BookingPriceInput
): BookingPriceResult | null {
  if (
    !booking.pickup ||
    !booking.destination ||
    !booking.tripType
  ) {
    return null;
  }

  const route = routes.find(
    (route) =>
      route.pickup === booking.pickup &&
      route.destination === booking.destination
  );

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
      ? route.roundTrip
      : route.basePrice;

  const extraPassengers =
    Math.max(booking.passengers - 1, 0);

  const passengerFee =
    extraPassengers *
    route.additionalPassengerFee;

  const {
    childSeatFee,
    extraStopFee,
    waitingTimeFee,
  } = calculateOptionalFees(booking);

  const total =
    baseFare +
    passengerFee +
    childSeatFee +
    extraStopFee +
    waitingTimeFee;

  const { deposit, balance } =
    calculatePaymentSplit(total);

  return {
    vehicle: VEHICLE_NAME,

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

export function calculateBookingPrice(
  booking: BookingPriceInput
): BookingPriceResult | null {
  /*
   * Tour bookings use the new SASREY tour catalogue.
   *
   * Airport-transfer bookings continue using the
   * existing route pricing table.
   *
   * A tour is identified by tourId.
   */
  if (booking.tourId) {
    return calculateTourPrice(booking);
  }

  return calculateAirportTransferPrice(booking);
}