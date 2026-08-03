import {
  CalendarDays,
  Clock3,
  Plane,
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Wifi,
} from "lucide-react";

export default function BookPage() {
  return (
    <main className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">

        {/* Hero */}

        <div className="mb-16 text-center">

          <span className="rounded-full bg-sky-100 px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">
            Book Your Transfer
          </span>

          <h1 className="mt-6 text-5xl font-black text-slate-900">
            Your Jamaican Journey
            <br />
            Starts Here
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-xl leading-8 text-slate-600">
            Complete your booking in just a few simple steps.
          </p>

        </div>

        {/* Included */}

        <div className="mb-16 grid gap-4 md:grid-cols-4">

          <div className="rounded-2xl bg-white p-5 shadow">
            <Wifi className="mb-3 text-sky-600" />
            <h3 className="font-bold">Free Wi-Fi</h3>
            <p className="text-sm text-slate-600">
              Stay connected throughout your journey.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <MapPin className="mb-3 text-sky-600" />
            <h3 className="font-bold">GPS Tracking</h3>
            <p className="text-sm text-slate-600">
              Live tracking available after driver assignment.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <Plane className="mb-3 text-sky-600" />
            <h3 className="font-bold">Flight Monitoring</h3>
            <p className="text-sm text-slate-600">
              We monitor delays so you don't have to.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <ShieldCheck className="mb-3 text-sky-600" />
            <h3 className="font-bold">Private Transfers</h3>
            <p className="text-sm text-slate-600">
              Your vehicle is reserved exclusively for you.
            </p>
          </div>

        </div>

        <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">

          {/* Booking Form */}

          <div className="rounded-3xl bg-white p-10 shadow-xl">

            <h2 className="mb-8 text-3xl font-black">
              Booking Details
            </h2>

            <div className="grid gap-6 md:grid-cols-2">

              <div>
                <label className="mb-2 block font-semibold">
                  Full Name
                </label>

                <input
                  className="w-full rounded-xl border p-4"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  Email
                </label>

                <input
                  className="w-full rounded-xl border p-4"
                  placeholder="john@email.com"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  Phone
                </label>

                <input
                  className="w-full rounded-xl border p-4"
                  placeholder="+1..."
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  Flight Number
                </label>

                <input
                  className="w-full rounded-xl border p-4"
                  placeholder="AA123"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  Pickup Date
                </label>

                <input
                  type="date"
                  className="w-full rounded-xl border p-4"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  Pickup Time
                </label>

                <input
                  type="time"
                  className="w-full rounded-xl border p-4"
                />
              </div>

            </div>

            <div className="mt-8">

              <label className="mb-2 block font-semibold">
                Special Requests
              </label>

              <textarea
                rows={5}
                className="w-full rounded-xl border p-4"
                placeholder="Child seat, supermarket stop, wheelchair assistance..."
              />

            </div>

          </div>

          {/* Booking Summary */}

          <aside className="rounded-3xl bg-slate-900 p-10 text-white shadow-2xl">

            <h2 className="text-3xl font-black">
              Booking Summary
            </h2>

            <div className="mt-8 space-y-4">

              <div className="flex justify-between">
                <span>Vehicle</span>
                <strong>Toyota Noah</strong>
              </div>

              <div className="flex justify-between">
                <span>Passengers</span>
                <strong>1–7</strong>
              </div>

              <hr className="border-slate-700" />

              <div className="flex justify-between">
                <span>Total</span>
                <strong>Calculated after quote</strong>
              </div>

              <div className="flex justify-between">
                <span>Deposit</span>
                <strong>25%</strong>
              </div>

              <div className="flex justify-between text-xl font-bold text-sky-400">
                <span>Balance</span>
                <span>Remaining 75%</span>
              </div>

            </div>

            <button className="mt-10 w-full rounded-full bg-sky-500 py-5 text-lg font-bold transition hover:bg-sky-600">
              Continue →
            </button>

          </aside>

        </div>

      </div>
    </main>
  );
}