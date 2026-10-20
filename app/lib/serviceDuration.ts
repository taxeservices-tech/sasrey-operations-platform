export type TourDurationType =
  | "Private Tour"
  | "Full-Day Tour"
  | "Custom/Private Excursion";

export const DEFAULT_TURNAROUND_BUFFER_MINUTES = 60;

export const TRANSFER_DURATION_MINUTES: Record<
  string,
  number
> = {
  "MBJ Airport::Montego Bay Hotels": 30,
  "MBJ Airport::Rose Hall": 45,
  "MBJ Airport::Falmouth": 60,
  "MBJ Airport::Runaway Bay": 90,
  "MBJ Airport::Negril": 120,
  "MBJ Airport::Ocho Rios": 150,
  "MBJ Airport::Kingston": 240,
};

export const TOUR_DURATION_MINUTES: Record<
  TourDurationType,
  number | null
> = {
  "Private Tour": 360,
  "Full-Day Tour": 480,
  "Custom/Private Excursion": null,
};

export function getTransferDurationMinutes(
  pickup: string,
  destination: string
): number | null {
  const key =
    `${pickup.trim()}::${destination.trim()}`;

  return TRANSFER_DURATION_MINUTES[key] ?? null;
}

export function getTourDurationMinutes(
  tourType: TourDurationType
): number | null {
  return TOUR_DURATION_MINUTES[tourType];
}
