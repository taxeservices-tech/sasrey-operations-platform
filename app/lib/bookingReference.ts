export function generateBookingReference(
  sequence: number = 1
): string {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  const bookingNumber = String(
    sequence
  ).padStart(6, "0");

  return `SAS-${year}${month}${day}-${bookingNumber}`;
}