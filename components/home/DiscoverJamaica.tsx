import Image from "next/image";

export default function DiscoverJamaica() {
  const destinations = [
    {
      title: "Seven Mile Beach",
      image: "/images/tours/beach.jpg",
      description:
        "Relax on one of the Caribbean's most beautiful white-sand beaches.",
    },
    {
      title: "Private Boat Tours",
      image: "/images/tours/boat-tour.jpg",
      description:
        "Explore hidden coves and unforgettable coastal scenery by private boat.",
    },
  ];

  return (
    <section
      id="discover"
      className="bg-gradient-to-b from-white to-slate-50 py-24"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-4xl font-bold text-gray-900 md:text-5xl">
            Discover the Heart of Jamaica
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            Every destination has a story. Let SASREY help you experience it.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-8 md:grid-cols-2">
          {destinations.map((destination) => (
            <div
              key={destination.title}
              className="overflow-hidden rounded-3xl bg-white shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <Image
                src={destination.image}
                alt={destination.title}
                width={700}
                height={500}
                className="h-64 w-full object-cover"
              />

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900">
                  {destination.title}
                </h3>

                <p className="mt-4 leading-7 text-gray-600">
                  {destination.description}
                </p>

                <button className="mt-8 rounded-full bg-sky-500 px-8 py-3 text-white transition hover:bg-sky-600">
                  Explore
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}