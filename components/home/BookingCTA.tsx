export default function BookingCTA() {
  return (
    <section className="bg-sky-600 py-24 text-white">
      <div className="mx-auto max-w-5xl px-6 text-center">

        <h2 className="text-5xl font-bold">
          Ready to Explore Jamaica?
        </h2>

        <p className="mt-8 text-xl leading-9 text-sky-100">
          Book your airport transfer, private tour or corporate transportation
          today and travel with confidence.
        </p>

        <div className="mt-12 flex flex-col justify-center gap-6 sm:flex-row">

          <a
            href="#"
            className="rounded-full bg-white px-10 py-4 text-lg font-semibold text-sky-600 transition hover:bg-slate-100"
          >
            Book Your Ride
          </a>

          <a
            href="https://wa.me/1876XXXXXXXX"
            className="rounded-full border-2 border-white px-10 py-4 text-lg font-semibold transition hover:bg-white hover:text-sky-600"
          >
            WhatsApp Us
          </a>

        </div>

      </div>
    </section>
  );
}