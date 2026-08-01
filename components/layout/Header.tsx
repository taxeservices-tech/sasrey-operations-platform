import Image from "next/image";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-black/55 backdrop-blur-xl border-b border-white/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-10 py-5">

        {/* Logo */}
        <div className="flex items-center gap-5">

          <Image
            src="/images/logo/logo.png"
            alt="SASREY Logo"
            width={70}
            height={70}
            priority
            className="rounded-lg"
          />

          <div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              SASREY
            </h1>

            <p className="text-sm tracking-wide text-gray-300">
              Taxi Services & Tours Limited
            </p>

          </div>

        </div>

        {/* Navigation */}

        <nav className="hidden items-center gap-12 md:flex">

          <a
            href="#home"
            className="text-lg font-medium text-white transition hover:text-sky-400"
          >
            Home
          </a>

          <a
            href="#discover"
            className="text-lg font-medium text-white transition hover:text-sky-400"
          >
            Discover
          </a>

          <a
            href="#services"
            className="text-lg font-medium text-white transition hover:text-sky-400"
          >
            Services
          </a>

          <a
            href="#fleet"
            className="text-lg font-medium text-white transition hover:text-sky-400"
          >
            Fleet
          </a>

          <a
            href="#contact"
            className="text-lg font-medium text-white transition hover:text-sky-400"
          >
            Contact
          </a>

        </nav>

        {/* Button */}

        <button className="rounded-full bg-sky-500 px-8 py-3 text-lg font-semibold text-white transition duration-300 hover:scale-105 hover:bg-sky-600">
          Book Now
        </button>

      </div>
    </header>
  );
}