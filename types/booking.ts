export type BookingStatus =
  | "Pending"
  | "Confirmed"
  | "Paid"
  | "Assigned"
  | "Completed"
  | "Cancelled";

export interface Booking {
  bookingReference?: string;
  routeId?: string;
  status?: BookingStatus;

  // Trip Details
  pickup: string;
  destination: string;
  tripType: "One Way" | "Round Trip";
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  serviceCategory: "Airport Transfer" | "Tour";
  tourId?: string;

  tourType?:
    | "Private Tour"
    | "Full-Day Tour"
    | "Custom/Private Excursion";
  tourDestination?: string;

  // Passenger Details
  customerName: string;
  email: string;
  phone: string;
  flightNumber?: string;
  airline?: string;
  country?: string;

  // Optional Services
  childSeat: number;
  extraStop: number;
  waitingTimeHours: number;
  specialRequests?: string;

  // Payment
  paymentMethod: "Credit Card" | "Bank Transfer";

  // Pricing
  vehicle?: string;
  baseFare?: number;
  additionalPassengerFee?: number;
  additionalPassengerTotal?: number;
  total?: number;
  deposit?: number;
  balance?: number;
}
