export default function BookingForm() {
  return (
    <div className="rounded-3xl bg-white p-10 shadow-xl">
      <h2 className="mb-8 text-3xl font-black text-slate-900">
        Booking Details
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-semibold">
            Full Name
          </label>

          <input
            className="w-full rounded-xl border border-slate-300 p-4"
            placeholder="John Smith"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Email Address
          </label>

          <input
            type="email"
            className="w-full rounded-xl border border-slate-300 p-4"
            placeholder="john@email.com"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Phone Number
          </label>

          <input
            className="w-full rounded-xl border border-slate-300 p-4"
            placeholder="+1 876..."
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Flight Number
          </label>

          <input
            className="w-full rounded-xl border border-slate-300 p-4"
            placeholder="AA123"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Pickup Location
          </label>

          <input
            className="w-full rounded-xl border border-slate-300 p-4"
            placeholder="MBJ Airport"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Destination
          </label>

          <input
            className="w-full rounded-xl border border-slate-300 p-4"
            placeholder="Secrets Wild Orchid"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Pickup Date
          </label>

          <input
            type="date"
            className="w-full rounded-xl border border-slate-300 p-4"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Pickup Time
          </label>

          <input
            type="time"
            className="w-full rounded-xl border border-slate-300 p-4"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Passengers
          </label>

          <select className="w-full rounded-xl border border-slate-300 p-4">
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
            <option>6</option>
            <option>7</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Service Type
          </label>

          <select className="w-full rounded-xl border border-slate-300 p-4">
            <option>Airport Transfer</option>
            <option>Round Trip</option>
            <option>Private Tour</option>
            <option>Cruise Transfer</option>
          </select>
        </div>
      </div>

      <div className="mt-8">
        <label className="mb-2 block font-semibold">
          Special Requests
        </label>

        <textarea
          rows={5}
          className="w-full rounded-xl border border-slate-300 p-4"
          placeholder="Child seat, supermarket stop, wheelchair assistance..."
        />
      </div>
    </div>
  );
}