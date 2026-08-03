"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";

const links = [
  { name: "Home", href: "/" },
  { name: "Services", href: "#services" },
  { name: "Fleet", href: "#fleet" },
  { name: "Tours", href: "#discover" },
  { name: "Contact", href: "#footer" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/20 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        {/* Logo */}

        <Link href="/" className="text-2xl font-black text-slate-900">
          <span className="text-sky-600">SASREY</span> Taxi
        </Link>

        {/* Desktop Menu */}

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="font-medium text-slate-700 transition hover:text-sky-600"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Side */}

        <div className="hidden items-center gap-4 lg:flex">
          <a
            href="tel:+18765551234"
            className="flex items-center gap-2 text-sm font-semibold text-slate-700"
          >
            <Phone className="h-4 w-4 text-sky-600" />
            +1 (876) XXX-XXXX
          </a>

          <Link
            href="/book"
            className="rounded-full bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-600"
          >
            Book Now
          </Link>
        </div>

        {/* Mobile Button */}

        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden"
        >
          {open ? (
            <X className="h-7 w-7" />
          ) : (
            <Menu className="h-7 w-7" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}

      {open && (
        <div className="border-t bg-white lg:hidden">
          <nav className="flex flex-col p-6">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="py-3 text-lg font-medium text-slate-700"
                onClick={() => setOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            <Link
              href="/book"
              className="mt-6 rounded-full bg-sky-500 py-3 text-center font-semibold text-white"
              onClick={() => setOpen(false)}
            >
              Book Now
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}