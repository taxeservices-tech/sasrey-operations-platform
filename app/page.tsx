import Hero from "@/components/home/Hero";
import HeroStats from "@/components/home/HeroStats";
import DiscoverJamaica from "@/components/home/DiscoverJamaica";
import Services from "@/components/home/Services";
import Fleet from "@/components/home/Fleet";
import WhyChoose from "@/components/home/WhyChoose";
import Testimonials from "@/components/home/Testimonials";
import BookingCTA from "@/components/home/BookingCTA";
import QuoteCalculator from "@/components/booking/QuoteCalculator";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <main>
      <Hero />

      <HeroStats />

      <DiscoverJamaica />

      <Services />

      <Fleet />

      <WhyChoose />

      <Testimonials />

      <BookingCTA />

      <QuoteCalculator />

      <Footer />
    </main>
  );
}