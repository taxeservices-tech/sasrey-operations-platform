export default function BookingSummary() {
  return (
    <aside className="sticky top-8 h-fit rounded-3xl bg-slate-900 p-10 text-white shadow-2xl">

      <h2 className="text-3xl font-black">
        Booking Summary
      </h2>

      <div className="mt-8 space-y-5">

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
          <span>Estimated Fare</span>
          <strong>To Be Calculated</strong>
        </div>

        <div className="flex justify-between">
          <span>Deposit Required</span>
          <strong>25%</strong>
        </div>

        <div className="flex justify-between text-xl font-bold text-sky-400">
          <span>Remaining Balance</span>
          <span>75%</span>
        </div>

      </div>

      <div className="mt-10 rounded-2xl bg-slate-800 p-5">

        <h3 className="font-bold">
          Payment Terms
        </h3>

        <ul className="mt-3 space-y-2 text-sm text-slate-300">
          <li>✓ 25% deposit required</li>
          <li>✓ Balance due 15 days before departure</li>
          <li>✓ Secure payment options</li>
        </ul>

      </div>

      <button className="mt-8 w-full rounded-full bg-sky-500 py-5 text-lg font-bold transition hover:bg-sky-600">
        Continue Booking →
      </button>

    </aside>
  );
}