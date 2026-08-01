import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-[90vh] items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <Image
        src="/images/tours/beach.jpg"
        alt="Seven Mile Beach, Jamaica"
        fill
        priority
        className="object-cover"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Hero Content */}
      <div className="relative z-10 mx-auto flex min-h-[90vh] max-w-7xl items-center justify-center px-6 py-24 text-center text-white">

        <div>

          {/* Heading */}
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-[1.1] md:text-6xl lg:text-7xl">
            Every Great Relationship
            <br />
            Starts with a Destination.
          </h1>

          {/* Description */}
          <p className="mx-auto mt-10 max-w-3xl text-lg leading-9 text-gray-200 md:text-2xl">
            From airport transfers to unforgettable island adventures,
            <span className="font-semibold text-white">
              {" "}SASREY Taxi Services & Tours Limited{" "}
            </span>
            delivers safe, dependable, and personalized transportation
            throughout Jamaica.
          </p>

          {/* Action Buttons */}
          <div className="mt-14 flex flex-wrap justify-center gap-6">

            <button className="rounded-full bg-sky-500 px-12 py-5 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-sky-600 hover:shadow-2xl">
              Book Airport Transfer
            </button>

            <button className="rounded-full border-2 border-white px-12 py-5 text-lg font-semibold text-white transition-all duration-300 hover:bg-white hover:text-black">
              Explore Tours
            </button>

          </div>

          {/* Scroll Indicator */}
          <div className="mt-20 flex flex-col items-center">

            <span className="text-xs uppercase tracking-[0.6em] text-white/70">
              Scroll
            </span>

            <div className="mt-4 h-14 w-px bg-white/60 animate-pulse"></div>

          </div>

        </div>

      </div>
    </section>
  );
}