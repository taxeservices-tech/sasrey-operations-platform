import { routes } from "./routes";

export function calculatePrice(
  pickup: string,
  destination: string
) {
  const route = routes.find(
    (r) =>
      r.pickup === pickup &&
      r.destination === destination
  );

  if (!route) {
    return null;
  }

  const total = route.price;
  const deposit = +(total * 0.25).toFixed(2);
  const balance = +(total * 0.75).toFixed(2);

  return {
    ...route,
    total,
    deposit,
    balance,
  };
}