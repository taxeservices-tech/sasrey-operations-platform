export function generateBookingReference(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const timestamp = Date.now().toString().slice(-8);

  const randomPart = Math.floor(
    1000 + Math.random() * 9000
  ).toString();

  return `SAS-${year}${month}${day}-${timestamp}${randomPart}`;
}