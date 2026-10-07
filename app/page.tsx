export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-3xl text-center">
        <div className="mb-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/10 text-3xl font-bold">
            S
          </div>
        </div>

        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
          SASREY Taxi Services & Tours Limited
        </p>

        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Our New Website Is Coming Soon
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/70">
          We are currently putting the finishing touches on our new website
          and private tour booking experience.
        </p>

        <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-base font-medium">
            Private Airport Transfers & Tours
          </p>

          <p className="mt-2 text-sm leading-6 text-white/60">
            Montego Bay and destinations throughout Jamaica.
          </p>
        </div>

        <p className="mt-10 text-sm text-white/50">
          Thank you for your patience. SASREY Tours will be back online soon.
        </p>

        <div className="mt-8 text-xs text-white/40">
          © {new Date().getFullYear()} SASREY Taxi Services & Tours Limited
        </div>
      </div>
    </main>
  );
}
