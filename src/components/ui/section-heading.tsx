export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-500">
        {eyebrow}
      </p>
      <h2 className="font-display text-4xl leading-tight text-rose-950 md:text-5xl">
        {title}
      </h2>
      <p className="text-base leading-8 text-rose-800/80 md:text-lg">
        {description}
      </p>
    </div>
  );
}
