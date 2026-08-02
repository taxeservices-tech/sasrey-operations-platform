import Button from "../ui/Button";
import { Phone, CalendarCheck, Plane } from "lucide-react";

export default function BookingCTA() {
  return (
    <section className="bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 py-28">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mx-auto max-w-4xl text-center text-white">

          <span className="rounded-full bg-white/20 px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em]">
            Book With Confidence
          </span>

          <h2 className="mt-8 text-5xl font-black leading-tight md:text-6xl">
            Your Jamaican Adventure
            <br />
            Starts Here.
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-sky-100">
            Airport transfers, private tours, cruise transportation and
            executive travel delivered with professionalism, comfort and
            reliability throughout Jamaica.
          </p>

          <div className="mt-14 flex flex-wrap justify-center gap-10">

            <div className="flex items-center gap-3">
              <Plane size={24} />
              <span>Airport Transfers</span>
            </div>

            <div className="flex items-center gap-3">
              <CalendarCheck size={24} />
              <span>Easy Online Booking</span>
            </div>

            <div className="flex items-center gap-3">
              <Phone size={24} />
              <span>24/7 Customer Support</span>
            </div>

          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-6">

            <Button>
              Book Your Ride
            </Button>

            <Button variant="secondary">
              Contact Us
            </Button>

          </div>

        </div>

      </div>
    </section>
  );
}