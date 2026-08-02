type SectionHeadingProps = {
  badge: string;
  title: string;
  description: string;
};

export default function SectionHeading({
  badge,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="mx-auto mb-20 max-w-3xl text-center">

      <span className="rounded-full bg-sky-100 px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">
        {badge}
      </span>

      <h2 className="mt-6 text-5xl font-black leading-tight text-slate-900">
        {title}
      </h2>

      <p className="mt-6 text-xl leading-8 text-slate-600">
        {description}
      </p>

    </div>
  );
}