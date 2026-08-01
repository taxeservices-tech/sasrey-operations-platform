export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">

        <div className="grid gap-12 md:grid-cols-4">

          {/* Company */}

          <div>
            <h3 className="text-2xl font-bold">
              SASREY
            </h3>

            <p className="mt-4 leading-7 text-slate-300">
              Premium airport transfers, private tours and transportation
              services throughout Jamaica.
            </p>
          </div>

          {/* Quick Links */}

          <div>
            <h4 className="mb-4 text-lg font-semibold">
              Quick Links
            </h4>

            <ul className="space-y-3 text-slate-300">
              <li><a href="#">Home</a></li>
              <li><a href="#discover">Discover</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#fleet">Fleet</a></li>
            </ul>
          </div>

          {/* Services */}

          <div>
            <h4 className="mb-4 text-lg font-semibold">
              Services
            </h4>

            <ul className="space-y-3 text-slate-300">
              <li>Airport Transfers</li>
              <li>Private Tours</li>
              <li>Cruise Transfers</li>
              <li>Corporate Travel</li>
            </ul>
          </div>

          {/* Contact */}

          <div>
            <h4 className="mb-4 text-lg font-semibold">
              Contact
            </h4>

            <ul className="space-y-3 text-slate-300">
              <li>📍 Montego Bay, Jamaica</li>
              <li>📞 +1 (876) XXX-XXXX</li>
              <li>✉️ info@sasreytours.com</li>
              <li>💬 WhatsApp Available</li>
            </ul>
          </div>

        </div>

        <div className="mt-12 border-t border-slate-700 pt-8 text-center text-slate-400">

          © {new Date().getFullYear()} SASREY Taxi Services & Tours Limited.
          All Rights Reserved.

        </div>

      </div>
    </footer>
  );
}