import type { Booking } from "@/types/booking";

export async function saveBooking(
  booking: Booking,
  bookingReference: string
) {
  const response = await fetch("/api/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...booking,
      bookingReference,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to save booking.");
  }

  return response.json();
}