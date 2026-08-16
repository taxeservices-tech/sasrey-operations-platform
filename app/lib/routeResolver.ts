import { routes, type Route } from "./routes";

export interface RouteSelectionInput {
  service: Route["service"];
  pickup: string;
  destination: string;
  passengers: number;
}

export function findBookingRoute(
  input: RouteSelectionInput
): Route | null {
  if (input.passengers < 1) {
    return null;
  }

  const matchingRoutes = routes.filter(
    (route) =>
      route.active &&
      route.service === input.service &&
      route.pickup === input.pickup &&
      route.destination === input.destination &&
      input.passengers <= route.maxPassengers
  );

  if (matchingRoutes.length === 0) {
    return null;
  }

  return (
    matchingRoutes.sort(
      (a, b) => a.maxPassengers - b.maxPassengers
    )[0] ?? null
  );
}