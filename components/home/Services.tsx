import {
  Plane,
  Palmtree,
  Ship,
  BriefcaseBusiness,
} from "lucide-react";

const services = [
  {
    icon: Plane,
    title: "Airport Transfers",
    description:
      "Reliable private transfers to and from Sangster International Airport across Jamaica.",
  },
  {
    icon: Palmtree,
    title: "Private Tours",
    description:
      "Experience Jamaica with customized sightseeing tours and unforgettable adventures.",
  },
  {
    icon: Ship,
    title: "Cruise Port Transfers",
    description:
      "Comfortable transportation for cruise passengers with punctual pickup and return service.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Corporate Travel",
    description:
      "Professional executive transportation for meetings, conferences and business travel.",
  },
];

export default function Services() {
  return (
    <section
      id="services"
      className="bg-gradient-to-b from-white to-slate-50 py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-16 text-center">

          <h2 className="text-5xl font-extrabold text-slate-900">
            Our Services
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-xl leading-8 text-slate-600">
            Professional transportation solutions designed to make every
            journey safe, comfortable and memorable.
          </p>

        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">

          {services.map((service) => {
            const Icon = service.icon;

            return (
              <div
                key={service.title}
                className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-md transition-all duration-500 hover:-translate-y-3 hover:border-sky-500 hover:shadow-2xl"
              >
                <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 p-4 shadow-lg">

                  <Icon
                    size={42}
                    strokeWidth={2.25}
                    className="text-white"
                  />

                </div>

                <h3 className="mb-4 text-2xl font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                  {service.title}
                </h3>

                <p className="leading-8 text-slate-600">
                  {service.description}
                </p>

              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}