"use client";

import BookingHero from "@/components/booking/BookingHero";
import BookingBenefits from "@/components/booking/BookingBenefits";
import BookingForm from "@/components/booking/BookingForm";
import BookingSummary from "@/components/booking/BookingSummary";
import BookingReview from "@/components/booking/BookingReview";
import { useBooking } from "@/context/BookingContext";

export default function BookPage() {
  const { currentStep } = useBooking();

  return (
    <main className="min-h-screen bg-slate-50">
      <BookingHero />

      <BookingBenefits />

      <div className="mx-auto max-w-7xl px-6 py-4 text-xl font-bold text-red-600">
        Current Step: {currentStep}
      </div>

      <section className="mx-auto max-w-7xl px-6 py-20">
        {currentStep === 1 ? (
          <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
            <BookingForm />
            <BookingSummary />
          </div>
        ) : (
          <BookingReview />
        )}
      </section>
    </main>
  );
}