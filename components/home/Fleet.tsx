import Image from "next/image";

export default function Fleet() {
  return (
    <section
      id="fleet"
      className="bg-slate-100 py-24"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">

        {/* Vehicle Image */}

        <div className="overflow-hidden rounded-3xl shadow-2xl">
          <Image
            src="/images/tours/boat-tour.JPG"
            alt="SASREY Fleet"
            width={900}
            height={700}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Content */}

        <div>

          <span className="font-semibold uppercase tracking-[0.3em] text-sky-500">
            PREMIUM TRANSPORT
          </span>

          <h2 className="mt-4 text-5xl font-bold text-gray-900">
            Travel in Comfort
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our modern fleet is designed to provide safe,
            comfortable and dependable transportation anywhere
            across Jamaica.
          </p>

          <div className="mt-10 grid gap-5">

            <div>✅ Seats up to 7 Passengers</div>

            <div>✅ Fully Air Conditioned</div>

            <div>✅ Professional Drivers</div>

            <div>✅ Spacious Luggage Capacity</div>

            <div>✅ Sanitized Before Every Trip</div>

            <div>✅ Complimentary Bottled Water</div>

          </div>

          <button className="mt-12 rounded-full bg-sky-500 px-10 py-4 text-lg font-semibold text-white transition hover:bg-sky-600">
            Book This Vehicle
          </button>

        </div>

      </div>
    </section>
  );
}