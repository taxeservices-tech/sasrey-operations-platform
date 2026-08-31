export default function BookingHero() {
  return (
    <section className="relative min-h-[520px] overflow-hidden text-white">
      {/* Background video */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/VIDEO-2026-08-26-21-30-22.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Hero content */}
      <div className="relative z-10 mx-auto flex min-h-[520px] max-w-7xl items-center px-6">
        <div>
          <span className="rounded-full border border-sky-400 px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
            SASREY BOOKING
          </span>

          <h1 className="mt-8 text-5xl font-black leading-tight md:text-7xl">
            Book Your
            <br />
            Private Transfer
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-slate-200 md:text-xl">
            Fast, secure airport transfers and private transportation
            throughout Jamaica.
          </p>

          {/* Call to action */}
          <a
            href="#booking-form"
            className="mt-8 inline-flex items-center rounded-xl bg-sky-500 px-7 py-4 text-base font-bold text-white shadow-lg transition hover:bg-sky-400 hover:shadow-xl"
          >
            Book Your Transfer
            <span className="ml-2 text-lg">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}