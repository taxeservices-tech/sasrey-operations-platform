import { Wifi, Plane, ShieldCheck, MapPin } from "lucide-react";

export default function BookingBenefits() {
  return (
    <section className="mx-auto -mt-12 max-w-7xl px-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-3xl bg-white p-8 shadow-lg">
          <Wifi className="mb-4 text-sky-600" size={34} />
          <h3 className="text-lg font-bold">Free Wi-Fi</h3>
          <p className="mt-2 text-slate-600">
            Complimentary Wi-Fi in every vehicle.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-lg">
          <Plane className="mb-4 text-sky-600" size={34} />
          <h3 className="text-lg font-bold">Flight Monitoring</h3>
          <p className="mt-2 text-slate-600">
            We automatically monitor delayed flights.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-lg">
          <ShieldCheck className="mb-4 text-sky-600" size={34} />
          <h3 className="text-lg font-bold">Private Transfers</h3>
          <p className="mt-2 text-slate-600">
            Your vehicle is reserved exclusively for your booking.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-lg">
          <MapPin className="mb-4 text-sky-600" size={34} />
          <h3 className="text-lg font-bold">
            GPS Trip Tracking
          </h3>

          <span className="mt-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            Coming Soon
          </span>

          <p className="mt-3 text-slate-600">
            Live tracking will become available after driver assignment.
          </p>
        </div>

      </div>
    </section>
  );
}