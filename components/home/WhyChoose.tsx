import {
  ShieldCheck,
  Clock3,
  Star,
  MapPinned,
  Plane,
  HeartHandshake,
} from "lucide-react";

const reasons = [
  {
    icon: ShieldCheck,
    title: "Safety First",
    description:
      "Licensed drivers, insured vehicles and a commitment to safe transportation for every journey.",
  },
  {
    icon: Clock3,
    title: "Always On Time",
    description:
      "Flight tracking, punctual pickups and dependable service so you're never left waiting.",
  },
  {
    icon: Star,
    title: "Premium Experience",
    description:
      "Friendly service, spotless vehicles and personalized attention from booking to drop-off.",
  },
  {
    icon: MapPinned,
    title: "Island-wide Coverage",
    description:
      "Airport transfers, private tours and transportation across Jamaica's most popular destinations.",
  },
  {
    icon: Plane,
    title: "Airport Specialists",
    description:
      "Professional airport meet & greet service from Sangster International Airport and beyond.",
  },
  {
    icon: HeartHandshake,
    title: "Customer Focused",
    description:
      "Every trip is tailored to provide comfort, reliability and a memorable Jamaican experience.",
  },
];

export default function WhyChoose() {
  return (
    <section
      id="why-choose"
      className="bg-white py-28"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="mx-auto mb-20 max-w-3xl text-center">

          <span className="rounded-full bg-sky-100 px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">
            Why Choose SASREY
          </span>

          <h2 className="mt-6 text-5xl font-black text-slate-900">
            More Than Transportation.
            <br />
            We Deliver Peace of Mind.
          </h2>

          <p className="mt-6 text-xl leading-8 text-slate-600">
            From the moment you arrive in Jamaica until your journey is
            complete, SASREY is committed to providing safe, dependable
            and unforgettable transportation experiences.
          </p>

        </div>

        {/* Cards */}

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

          {reasons.map((reason) => {
            const Icon = reason.icon;

            return (
              <div
                key={reason.title}
                className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-md transition-all duration-500 hover:-translate-y-2 hover:border-sky-500 hover:shadow-2xl"
              >

                <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 p-4 shadow-lg transition-transform duration-500 group-hover:scale-110">

                  <Icon
                    size={36}
                    className="text-white"
                  />

                </div>

                <h3 className="mb-4 text-2xl font-bold text-slate-900 group-hover:text-sky-600">
                  {reason.title}
                </h3>

                <p className="leading-8 text-slate-600">
                  {reason.description}
                </p>

              </div>
            );
          })}

        </div>

        {/* Bottom Statement */}

        <div className="mt-20 rounded-3xl bg-gradient-to-r from-sky-600 to-cyan-600 p-12 text-center text-white shadow-2xl">

          <h3 className="text-3xl font-black">
            Your Journey Starts Here.
          </h3>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-sky-100">
            Whether you're visiting Jamaica for business, vacation or a
            special event, our professional team is ready to make every
            mile comfortable, safe and memorable.
          </p>

          <button className="mt-10 rounded-full bg-white px-10 py-5 text-lg font-semibold text-sky-700 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            Start Your Journey
          </button>

        </div>

      </div>
    </section>
  );
}