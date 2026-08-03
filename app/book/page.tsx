import BookingHero from "@/components/booking/BookingHero";
import BookingBenefits from "@/components/booking/BookingBenefits";
import BookingForm from "@/components/booking/BookingForm";
import BookingSummary from "@/components/booking/BookingSummary";

export default function BookPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <BookingHero />

      <BookingBenefits />

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          <BookingForm />

          <BookingSummary />
        </div>
      </section>
    </main>
  );
}