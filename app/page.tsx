const services = [
  {
    number: "01",
    title: "Airport Transfers",
    description:
      "Private airport pickups and drop-offs from Sangster International Airport in Montego Bay to hotels and destinations across Jamaica.",
  },
  {
    number: "02",
    title: "Private Tours",
    description:
      "Explore Jamaica at your own pace with private transportation for sightseeing, attractions, and memorable day trips.",
  },
  {
    number: "03",
    title: "Private Transportation",
    description:
      "Comfortable, pre-arranged transportation for individuals, families, and small groups.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <a href="/" className="text-lg font-bold tracking-wide">
            SASREY
            <span className="mt-1 block text-xs font-medium tracking-widest text-slate-500">
              TAXI SERVICES &amp; TOURS LIMITED
            </span>
          </a>
          <a
            href="/book"
            className="rounded-full bg-blue-900 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Book a Transfer
          </a>
        </div>
      </header>

      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center md:py-28">
          <div>
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
              Your Jamaican journey starts here
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              Private Airport Transfers &amp; Tours in Jamaica
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Travel with confidence with SASREY Taxi Services &amp; Tours
              Limited. Arrange private transportation from Montego Bay to
              hotels, attractions, and destinations throughout Jamaica.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/book"
                className="rounded-full bg-amber-400 px-7 py-4 font-bold text-slate-950 hover:bg-amber-300"
              >
                Book Your Transfer
              </a>
              <a
                href="https://wa.me/18767973510"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/40 px-7 py-4 font-semibold text-white hover:bg-white/10"
              >
                Contact Us on WhatsApp
              </a>
            </div>
            <p className="mt-6 text-sm text-slate-400">
              Based in Montego Bay, Jamaica · Advance bookings recommended
            </p>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/5 p-8 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">
              Travel made easier
            </p>
            <h2 className="mt-4 text-3xl font-bold">
              Your trip. Your schedule. Your Jamaica.
            </h2>
            <ul className="mt-6 space-y-4 text-slate-200">
              <li>✓ Private airport pickups and drop-offs</li>
              <li>✓ Hotel and resort transportation</li>
              <li>✓ Private tours and attraction trips</li>
              <li>✓ Arranged transportation for families and groups</li>
            </ul>
            <a
              href="/book"
              className="mt-8 inline-flex font-semibold text-amber-300 underline underline-offset-4"
            >
              Start your booking →
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-800">
            Our services
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Get around Jamaica with SASREY
          </h2>
          <p className="mt-4 leading-7 text-slate-600">
            Plan your airport transfer or arrange private transportation for
            your Jamaican holiday.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.number}
              className="rounded-2xl border border-slate-200 p-7 shadow-sm"
            >
              <p className="text-sm font-bold text-amber-600">
                {service.number}
              </p>
              <h3 className="mt-4 text-xl font-bold">{service.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">
                {service.description}
              </p>
              <a
                href="/book"
                className="mt-6 inline-block font-semibold text-blue-900 underline underline-offset-4"
              >
                Arrange transportation
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-slate-100">
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <h2 className="text-3xl font-bold">Ready to plan your journey?</h2>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
            Contact SASREY to discuss your airport transfer, tour, or private
            transportation requirements.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-4">
            <a
              href="/book"
              className="rounded-full bg-blue-900 px-7 py-4 font-semibold text-white hover:bg-blue-800"
            >
              Make a Booking
            </a>
            <a
              href="https://wa.me/18767973510"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-300 bg-white px-7 py-4 font-semibold hover:bg-slate-50"
            >
              WhatsApp: +1 876 797-3510
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} SASREY Taxi Services &amp; Tours
            Limited. All rights reserved.
          </p>
          <nav className="flex flex-wrap gap-5">
            <a className="underline underline-offset-4" href="/privacy-policy">
              Privacy Policy
            </a>
            <a className="underline underline-offset-4" href="/data-deletion">
              Data Deletion
            </a>
            <a
              className="underline underline-offset-4"
              href="https://wa.me/18767973510"
              target="_blank"
              rel="noreferrer"
            >
              Contact
            </a>
          </nav>
        </div>
      </footer>
    </main>
  );
}