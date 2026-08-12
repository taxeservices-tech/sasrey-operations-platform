import type { Booking } from "@/types/booking";

export interface SaveBookingResponse {
  success: boolean;
  bookingReference?: string;
  message?: string;
}

export async function saveBooking(
  booking: Booking,
  bookingReference: string
): Promise<SaveBookingResponse> {
  try {
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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ?? "Failed to save booking."
      );
    }

    return data as SaveBookingResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error(
      "Unable to connect to the booking service."
    );
  }
}