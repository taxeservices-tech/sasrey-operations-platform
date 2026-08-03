export interface Route {
  id: string;
  pickup: string;
  destination: string;
  service: string;
  vehicle: string;
  price: number;
}

export const routes: Route[] = [
  {
    id: "AP001",
    pickup: "MBJ Airport",
    destination: "Montego Bay Hotels",
    service: "Airport Transfer",
    vehicle: "Toyota Noah",
    price: 35,
  },
  {
    id: "AP002",
    pickup: "MBJ Airport",
    destination: "Negril",
    service: "Airport Transfer",
    vehicle: "Toyota Noah",
    price: 120,
  },
  {
    id: "AP003",
    pickup: "MBJ Airport",
    destination: "Ocho Rios",
    service: "Airport Transfer",
    vehicle: "Toyota Noah",
    price: 140,
  },
  {
    id: "AP004",
    pickup: "MBJ Airport",
    destination: "Falmouth",
    service: "Airport Transfer",
    vehicle: "Toyota Noah",
    price: 60,
  },
];