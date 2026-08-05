"use client";

import BookingHero from "@/components/booking/BookingHero";
import BookingBenefits from "@/components/booking/BookingBenefits";
import BookingWizard from "@/components/booking/BookingWizard";
import { useBooking } from "@/context/BookingContext";

export default function BookPage() {
  const { booking } = useBooking();

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <BookingHero />

      {/* Benefits */}
      <BookingBenefits />

      {/* Booking Wizard */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <BookingWizard booking={booking} />
      </section>
    </main>
  );
}