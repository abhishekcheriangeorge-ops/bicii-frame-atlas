export function PageHeading({
  kicker,
  title,
  lede,
}: {
  kicker: string;
  title: string;
  lede?: string;
}) {
  return (
    <header>
      <p className="font-mono text-[0.7rem] tracking-[0.16em] text-steel uppercase">
        {kicker}
      </p>
      <h1 className="mt-1 font-display text-[2rem] leading-[1.12] text-ink">
        {title}
      </h1>
      {lede ? (
        <p className="mt-2 max-w-prose text-base leading-relaxed text-muted">
          {lede}
        </p>
      ) : null}
    </header>
  );
}
