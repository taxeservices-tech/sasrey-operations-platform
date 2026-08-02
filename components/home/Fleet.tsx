import Image from "next/image";
import {
  Users,
  Snowflake,
  Briefcase,
  ShieldCheck,
  MapPin,
  Baby,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Up to 7 Passengers",
  },
  {
    icon: Snowflake,
    title: "Fully Air Conditioned",
  },
  {
    icon: Briefcase,
    title: "Spacious Luggage Capacity",
  },
  {
    icon: ShieldCheck,
    title: "Licensed Professional Drivers",
  },
  {
    icon: MapPin,
    title: "Island-wide Service",
  },
  {
    icon: Baby,
    title: "Child Seats Available",
  },
];

export default function Fleet() {
  return (
    <section
      id="fleet"
      className="bg-slate-50 py-28"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="mb-16 text-center">

          <span className="rounded-full bg-sky-100 px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">
            Premium Fleet
          </span>

          <h2 className="mt-6 text-5xl font-black text-slate-900">
            Travel in Comfort.
            <br />
            Arrive in Style.
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-xl leading-8 text-slate-600">
            Our modern Toyota Noah fleet provides safe, spacious and
            comfortable transportation for airport transfers, private
            tours, cruise passengers and executive travel throughout
            Jamaica.
          </p>

        </div>

        {/* Vehicle Gallery */}

        <div className="grid gap-8 lg:grid-cols-2">

          {/* Vehicle 1 */}

          <div className="group relative h-[420px] overflow-hidden rounded-3xl shadow-xl">

            <Image
              src="/images/fleet/noah-1.png"
              alt="Toyota Noah"
              fill
              className="object-cover transition duration-700 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute bottom-6 left-6">

              <span className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white">
                Toyota Noah
              </span>

            </div>

          </div>

          {/* Vehicle 2 */}

          <div className="group relative h-[420px] overflow-hidden rounded-3xl shadow-xl">

            <Image
              src="/images/fleet/noah-2.png"
              alt="Toyota Noah"
              fill
              className="object-cover transition duration-700 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute bottom-6 left-6">

              <span className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white">
                Toyota Noah Hybrid
              </span>

            </div>

          </div>

        </div>

        {/* Fleet Details */}

        <div className="mt-16 rounded-3xl bg-white p-10 shadow-xl">

          <div className="grid gap-12 lg:grid-cols-2">

            <div>

              <h3 className="text-4xl font-black text-slate-900">
                Premium 7-Passenger Fleet
              </h3>

              <p className="mt-6 text-lg leading-8 text-slate-600">
                Our Toyota Noah vehicles are designed for travelers who
                value comfort, safety and reliability. Whether you're
                arriving at Sangster International Airport, visiting
                Jamaica's beautiful attractions or attending business
                meetings, SASREY delivers a first-class transportation
                experience.
              </p>

            </div>

            <div className="grid gap-5">

              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="flex items-center gap-4 rounded-2xl bg-slate-50 p-5 transition-all duration-300 hover:bg-sky-50 hover:shadow-md"
                  >
                    <div className="rounded-xl bg-sky-100 p-3">

                      <Icon
                        size={24}
                        className="text-sky-600"
                      />

                    </div>

                    <span className="font-semibold text-slate-800">
                      {feature.title}
                    </span>

                  </div>
                );
              })}

            </div>

          </div>

          {/* CTA */}

          <div className="mt-14 text-center">

            <button className="inline-flex items-center gap-3 rounded-full bg-sky-500 px-10 py-5 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-sky-600 hover:shadow-2xl">

              Start Your Journey

              <ArrowRight size={20} />

            </button>

          </div>

        </div>

      </div>
    </section>
  );
}