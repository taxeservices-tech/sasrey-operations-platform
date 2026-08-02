const stats = [
  {
    value: "5000+",
    label: "Happy Travelers",
  },
  {
    value: "10+",
    label: "Years Experience",
  },
  {
    value: "100+",
    label: "Tour Destinations",
  },
  {
    value: "24/7",
    label: "Customer Support",
  },
];

export default function HeroStats() {
  return (
    <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">

      {stats.map((stat) => (
        <div
          key={stat.label}
          className="text-center"
        >
          <h3 className="text-4xl font-black text-sky-400">
            {stat.value}
          </h3>

          <p className="mt-2 text-slate-300">
            {stat.label}
          </p>
        </div>
      ))}

    </div>
  );
}