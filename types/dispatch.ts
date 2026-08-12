export type DispatchStatus =
  | "Assigned"
  | "En Route"
  | "Passenger Onboard"
  | "Completed"
  | "Cancelled";

export interface Dispatch {
  dispatchId: string;
  bookingReference: string;

  driverId?: string;
  vehicleId?: string;

  status: DispatchStatus;

  assignedAt?: string;
  enRouteAt?: string;
  passengerOnboardAt?: string;
  completedAt?: string;
  cancelledAt?: string;

  notes?: string;
}