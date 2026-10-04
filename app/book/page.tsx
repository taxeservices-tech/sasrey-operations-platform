"use client";

import BookingHero from "@/components/booking/BookingHero";
import BookingBenefits from "@/components/booking/BookingBenefits";
import BookingWizard from "@/components/booking/BookingWizard";

export default function BookPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <BookingHero />

      <BookingBenefits />

      <section className="mx-auto mt-8 max-w-7xl px-6">
        <BookingWizard />
      </section>
    </main>
  );
}
