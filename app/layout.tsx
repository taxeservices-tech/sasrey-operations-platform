import type { Metadata } from "next";
import "./globals.css";

import { BookingProvider } from "../context/BookingContext";

export const metadata: Metadata = {
  title: "SASREY Taxi Services & Tours Limited",
  description:
    "Professional airport transfers, private tours and transportation services across Jamaica.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <BookingProvider>{children}</BookingProvider>
      </body>
    </html>
  );
}