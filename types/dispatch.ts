export type DispatchStatus =
  | "Assigned"
  | "En Route"
  | "Passenger Onboard"
  | "Incident"
  | "Completed";

export interface Dispatch {
  dispatchId: string;

  bookingReference: string;

  driverId?: string;

  vehicleId?: string;

  status: DispatchStatus;

  assignedAt?: string;

  enRouteAt?: string;

  passengerOnboardAt?: string;

  incidentAt?: string;

  completedAt?: string;

  notes?: string;
}