export interface Route {
  id: string;

  service: "Airport Transfer" | "Tour";

  pickup: string;
  destination: string;

  vehicle: string;

  basePrice: number;
  roundTripPrice: number;

  includedPassengers: number;
  additionalPassengerFee: number;

  maxPassengers: number;

  childSeatFee: number;
  extraStopFee: number;
  waitingTimeFee: number;

  currency: "USD";

  active: boolean;
}

export const routes: Route[] = [
  {
    id: "AP001",
    service: "Airport Transfer",
    pickup: "MBJ Airport",
    destination: "Montego Bay Hotels",
    vehicle: "Toyota Noah",

    basePrice: 35,
    roundTripPrice: 70,

    includedPassengers: 4,
    additionalPassengerFee: 10,

    maxPassengers: 7,

    childSeatFee: 10,
    extraStopFee: 15,
    waitingTimeFee: 20,

    currency: "USD",

    active: true,
  },
  {
    id: "AP002",
    service: "Airport Transfer",
    pickup: "MBJ Airport",
    destination: "Rose Hall",
    vehicle: "Toyota Noah",

    basePrice: 45,
    roundTripPrice: 90,

    includedPassengers: 4,
    additionalPassengerFee: 10,

    maxPassengers: 7,

    childSeatFee: 10,
    extraStopFee: 15,
    waitingTimeFee: 20,

    currency: "USD",

    active: true,
  },
  {
    id: "AP003",
    service: "Airport Transfer",
    pickup: "MBJ Airport",
    destination: "Falmouth",
    vehicle: "Toyota Noah",

    basePrice: 60,
    roundTripPrice: 120,

    includedPassengers: 4,
    additionalPassengerFee: 15,

    maxPassengers: 7,

    childSeatFee: 10,
    extraStopFee: 15,
    waitingTimeFee: 20,

    currency: "USD",

    active: true,
  },
  {
    id: "AP004",
    service: "Airport Transfer",
    pickup: "MBJ Airport",
    destination: "Runaway Bay",
    vehicle: "Toyota Noah",

    basePrice: 95,
    roundTripPrice: 190,

    includedPassengers: 4,
    additionalPassengerFee: 15,

    maxPassengers: 7,

    childSeatFee: 10,
    extraStopFee: 15,
    waitingTimeFee: 20,

    currency: "USD",

    active: true,
  },
  {
    id: "AP005",
    service: "Airport Transfer",
    pickup: "MBJ Airport",
    destination: "Negril",
    vehicle: "Toyota Noah",

    basePrice: 120,
    roundTripPrice: 240,

    includedPassengers: 4,
    additionalPassengerFee: 20,

    maxPassengers: 7,

    childSeatFee: 10,
    extraStopFee: 15,
    waitingTimeFee: 20,

    currency: "USD",

    active: true,
  },
  {
    id: "AP006",
    service: "Airport Transfer",
    pickup: "MBJ Airport",
    destination: "Ocho Rios",
    vehicle: "Toyota Noah",

    basePrice: 120,
    roundTripPrice: 240,

    includedPassengers: 4,
    additionalPassengerFee: 20,

    maxPassengers: 7,

    childSeatFee: 10,
    extraStopFee: 15,
    waitingTimeFee: 20,

    currency: "USD",

    active: true,
  },
  {
    id: "AP007",
    service: "Airport Transfer",
    pickup: "MBJ Airport",
    destination: "Kingston",
    vehicle: "Toyota Noah",

    basePrice: 280,
    roundTripPrice: 560,

    includedPassengers: 4,
    additionalPassengerFee: 35,

    maxPassengers: 7,

    childSeatFee: 10,
    extraStopFee: 15,
    waitingTimeFee: 20,

    currency: "USD",

    active: true,
  },

  {
    id: "AH001",
    service: "Airport Transfer",
    pickup: "MBJ Airport",
    destination: "Montego Bay Hotels",
    vehicle: "Toyota Hiace Commuter",

    basePrice: 50,
    roundTripPrice: 100,

    includedPassengers: 4,
    additionalPassengerFee: 10,

    maxPassengers: 15,

    childSeatFee: 10,
    extraStopFee: 15,
    waitingTimeFee: 20,

    currency: "USD",

    active: true,
  },
  {
    id: "AH002",
    service: "Airport Transfer",
    pickup: "MBJ Airport",
    destination: "Rose Hall",
    vehicle: "Toyota Hiace Commuter",

    basePrice: 60,
    roundTripPrice: 120,

    includedPassengers: 4,
    additionalPassengerFee: 10,

    maxPassengers: 15,

    childSeatFee: 10,
    extraStopFee: 15,
    waitingTimeFee: 20,

    currency: "USD",

    active: true,
  },
  {
    id: "AH003",
    service: "Airport Transfer",
    pickup: "MBJ Airport",
    destination: "Falmouth",
    vehicle: "Toyota Hiace Commuter",

    basePrice: 75,
    roundTripPrice: 150,

    includedPassengers: 4,
    additionalPassengerFee: 15,

    maxPassengers: 15,

    childSeatFee: 10,
    extraStopFee: 15,
    waitingTimeFee: 20,

    currency: "USD",

    active: true,
  },
  {
    id: "AH004",
    service: "Airport Transfer",
    pickup: "MBJ Airport",
    destination: "Runaway Bay",
    vehicle: "Toyota Hiace Commuter",

    basePrice: 100,
    roundTripPrice: 200,

    includedPassengers: 4,
    additionalPassengerFee: 15,

    maxPassengers: 15,

    childSeatFee: 10,
    extraStopFee: 15,
    waitingTimeFee: 20,

    currency: "USD",

    active: true,
  },
  {
    id: "AH005",
    service: "Airport Transfer",
    pickup: "MBJ Airport",
    destination: "Negril",
    vehicle: "Toyota Hiace Commuter",

    basePrice: 110,
    roundTripPrice: 220,

    includedPassengers: 4,
    additionalPassengerFee: 15,

    maxPassengers: 15,

    childSeatFee: 10,
    extraStopFee: 15,
    waitingTimeFee: 20,

    currency: "USD",

    active: true,
  },
  {
    id: "AH006",
    service: "Airport Transfer",
    pickup: "MBJ Airport",
    destination: "Ocho Rios",
    vehicle: "Toyota Hiace Commuter",

    basePrice: 125,
    roundTripPrice: 250,

    includedPassengers: 4,
    additionalPassengerFee: 20,

    maxPassengers: 15,

    childSeatFee: 10,
    extraStopFee: 15,
    waitingTimeFee: 20,

    currency: "USD",

    active: true,
  },
  {
    id: "AH007",
    service: "Airport Transfer",
    pickup: "MBJ Airport",
    destination: "Kingston",
    vehicle: "Toyota Hiace Commuter",

    basePrice: 320,
    roundTripPrice: 640,

    includedPassengers: 4,
    additionalPassengerFee: 35,

    maxPassengers: 15,

    childSeatFee: 10,
    extraStopFee: 15,
    waitingTimeFee: 20,

    currency: "USD",

    active: true,
  },
];