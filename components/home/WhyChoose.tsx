export default function WhyChoose() {
  const features = [
    {
      icon: "🛡️",
      title: "Safe & Reliable",
      description:
        "Your safety is our priority. Every trip is handled with professionalism and care.",
    },
    {
      icon: "⏰",
      title: "Always On Time",
      description:
        "Punctual airport pickups and timely transportation throughout Jamaica.",
    },
    {
      icon: "🚖",
      title: "Professional Drivers",
      description:
        "Friendly, licensed and experienced drivers dedicated to excellent service.",
    },
    {
      icon: "🌴",
      title: "Island-wide Service",
      description:
        "From Montego Bay to Negril, Ocho Rios, Kingston and beyond.",
    },
    {
      icon: "⭐",
      title: "Premium Experience",
      description:
        "Comfortable vehicles, clean interiors and personalized customer service.",
    },
    {
      icon: "💳",
      title: "Easy Booking",
      description:
        "Simple booking process with secure payment options and responsive support.",
    },
  ];

  return (
    <section id="why-us" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-16 text-center">
          <h2 className="text-5xl font-bold text-gray-900">
            Why Choose SASREY?
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-xl text-gray-600">
            We combine professionalism, comfort and reliability to give every
            customer an exceptional travel experience.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="mb-6 text-6xl">
                {feature.icon}
              </div>

              <h3 className="text-2xl font-bold text-gray-900">
                {feature.title}
              </h3>

              <p className="mt-4 leading-7 text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}