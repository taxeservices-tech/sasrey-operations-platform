import {
  ShieldCheck,
  Clock3,
  Star,
  MapPinned,
} from "lucide-react";

const items = [
  {
    icon: ShieldCheck,
    title: "Licensed & Insured",
  },
  {
    icon: Clock3,
    title: "24/7 Service",
  },
  {
    icon: Star,
    title: "5-Star Experience",
  },
  {
    icon: MapPinned,
    title: "Island-wide Coverage",
  },
];

export default function HeroTrustStrip() {
  return (
    <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-6 py-5 backdrop-blur-md transition-all duration-300 hover:bg-white/20"
          >
            <Icon
              size={24}
              className="text-sky-400"
            />

            <span className="font-medium text-white">
              {item.title}
            </span>
          </div>
        );
      })}

    </div>
  );
}