"use client";

import BookingHero from "@/components/booking/BookingHero";
import BookingBenefits from "@/components/booking/BookingBenefits";
import BookingWizard from "@/components/booking/BookingWizard";

export default function BookPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <BookingHero />

      <BookingBenefits />

      <section
  id="booking-form"
  className="mx-auto max-w-7xl px-6 py-20"
>
  <BookingWizard />
</section>
    </main>
  );
}