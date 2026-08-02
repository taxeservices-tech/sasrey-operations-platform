import Image from "next/image";

import HeroTrustStrip from "./HeroTrustStrip";
import HeroStats from "./HeroStats";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden"
    >
      {/* Background Image */}
      <Image
        src="/images/tours/beach.jpg"
        alt="Seven Mile Beach, Jamaica"
        fill
        priority
        className="object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-900/55 to-slate-950/70" />

      {/* Hero Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-8 pt-40 pb-20 lg:px-12">

        <div className="max-w-4xl">

          {/* Top Badge */}

          <div className="inline-flex rounded-full border border-sky-400/30 bg-sky-500/10 px-6 py-3 backdrop-blur-md">

            <span className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-300">
              Premium Transportation Across Jamaica
            </span>

          </div>

          {/* Main Heading */}

          <h1 className="mt-8 text-5xl font-black leading-tight text-white md:text-6xl lg:text-6xl">

            Every Great Relationship
            <br />
            Starts with a Destination.

          </h1>

          {/* Secondary Heading */}

          <h2 className="mt-8 text-xl font-semibold uppercase tracking-[0.25em] text-sky-400 md:text-2xl">

            Explore Jamaica With Confidence

          </h2>

          {/* Description */}

          <p className="mt-8 max-w-3xl text-lg leading-9 text-slate-200 md:text-xl">

            Airport transfers, private tours, cruise transportation and
            executive travel designed for comfort, safety and reliability.

            <span className="font-semibold text-white">
              {" "}SASREY Taxi Services & Tours Limited{" "}
            </span>

            delivers exceptional transportation experiences throughout
            Jamaica.

          </p>

          {/* Buttons */}

          <div className="mt-12 flex flex-wrap gap-6">

            <button className="rounded-full bg-sky-500 px-10 py-5 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-sky-600 hover:shadow-2xl">

              Start Your Journey

            </button>

            <button className="rounded-full border-2 border-white px-10 py-5 text-lg font-semibold text-white transition-all duration-300 hover:bg-white hover:text-slate-900">

              Explore Jamaica

            </button>

          </div>

          {/* Trust Strip */}

          <HeroTrustStrip />

          {/* Statistics */}

          <HeroStats />

        </div>

      </div>
    </section>
  );
}