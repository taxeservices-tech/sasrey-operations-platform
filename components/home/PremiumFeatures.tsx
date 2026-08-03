import {
  Wifi,
  MapPinned,
  Plane,
  Snowflake,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

const features = [
  {
    icon: Wifi,
    title: "Complimentary Wi-Fi",
    description:
      "Stay connected from the moment you arrive with free onboard Wi-Fi.",
  },
  {
    icon: MapPinned,
    title: "Live GPS Tracking",
    description:
      "Know where your driver is with real-time trip tracking.",
  },
  {
    icon: Plane,
    title: "Flight Monitoring",
    description:
      "We monitor your flight and adjust pickup times for delays.",
  },
  {
    icon: Snowflake,
    title: "Air-Conditioned Fleet",
    description:
      "Travel comfortably in our modern Toyota Noah vehicles.",
  },
  {
    icon: UserCheck,
    title: "Professional Drivers",
    description:
      "Licensed, courteous and experienced drivers you can trust.",
  },
  {
    icon: ShieldCheck,
    title: "Private Transfers",
    description:
      "Your vehicle is reserved exclusively for you and your group.",
  },
];

export default function PremiumFeatures() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="rounded-full bg-sky-100 px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">
            Why Choose SASREY
          </span>

          <h2 className="mt-6 text-5xl font-black text-slate-900">
            Premium Transportation
            <br />
            Across Jamaica
          </h2>

          <p className="mt-6 text-xl leading-8 text-slate-600">
            Every journey is designed to provide comfort, reliability and
            peace of mind from pickup to destination.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-sky-200 hover:shadow-xl"
              >
                <div className="inline-flex rounded-2xl bg-sky-100 p-4">
                  <Icon className="h-8 w-8 text-sky-600" />
                </div>

                <h3 className="mt-6 text-2xl font-bold text-slate-900">
                  {feature.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}