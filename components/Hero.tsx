import { hero } from "@/content/hero";

export function Hero() {
  return (
    <section
      id="top"
      className="container-page pt-20 pb-32 md:pt-28 md:pb-40"
      aria-labelledby="hero-h1"
    >
      <div className="max-w-[60rem]">
        <h1 id="hero-h1" className="text-display text-ink max-w-[16ch]">
          {hero.h1}
        </h1>
        <p className="mt-8 max-w-[58ch] text-body text-ink/85">{hero.sub}</p>
        <p className="text-mono mt-12 flex flex-wrap gap-x-3 gap-y-1">
          {hero.meta.map((m, i) => (
            <span key={m} className="inline-flex items-center gap-3">
              {m}
              {i < hero.meta.length - 1 && (
                <span aria-hidden className="text-ink-faint">
                  ·
                </span>
              )}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
