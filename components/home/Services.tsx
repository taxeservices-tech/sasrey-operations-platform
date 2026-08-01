export default function Services() {
  const services = [
    {
      icon: "✈️",
      title: "Airport Transfers",
      description:
        "Reliable private transfers to and from Sangster International Airport across Jamaica.",
    },
    {
      icon: "🌴",
      title: "Private Tours",
      description:
        "Experience Jamaica with customized sightseeing tours and unforgettable adventures.",
    },
    {
      icon: "🚢",
      title: "Cruise Port Transfers",
      description:
        "Comfortable transportation for cruise passengers with punctual pickup and return service.",
    },
    {
      icon: "💼",
      title: "Corporate Travel",
      description:
        "Professional executive transportation for meetings, conferences and business travel.",
    },
  ];

  return (
    <section id="services" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-16 text-center">
          <h2 className="text-5xl font-bold text-gray-900">
            Our Services
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-xl text-gray-600">
            Professional transportation solutions designed to make every
            journey safe, comfortable and memorable.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {services.map((service) => (
            <div
              key={service.title}
              className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="mb-6 text-5xl">
                {service.icon}
              </div>

              <h3 className="mb-4 text-2xl font-bold">
                {service.title}
              </h3>

              <p className="leading-7 text-gray-600">
                {service.description}
              </p>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}