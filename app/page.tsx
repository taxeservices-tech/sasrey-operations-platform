import Header from "@/components/layout/Header";
import Hero from "@/components/home/Hero";
import DiscoverJamaica from "@/components/home/DiscoverJamaica";
import Services from "@/components/home/Services";
import Fleet from "@/components/home/Fleet";
import WhyChoose from "@/components/home/WhyChoose";
import Testimonials from "@/components/home/Testimonials";
import BookingCTA from "@/components/home/BookingCTA";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <DiscoverJamaica />
      <Services />
      <Fleet />
      <WhyChoose />
      <Testimonials />
      <BookingCTA />
      <Footer />
    </main>
  );
}