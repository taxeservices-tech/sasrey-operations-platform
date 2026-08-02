export interface RoutePricing {
  pickup: string;
  destination: string;
  basePrice: number;
  roundTrip: number;
  additionalPassengerFee: number;
  maxPassengers: number;
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