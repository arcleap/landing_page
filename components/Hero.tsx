import { hero } from "@/content/hero";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { FilmStill } from "@/components/FilmStill";

export function Hero() {
  return (
    <section
      id="top"
      className="container-page pt-20 pb-32 md:pt-28 md:pb-40"
      aria-labelledby="hero-h1"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-end">
        <div className="lg:col-span-8">
          <h1
            id="hero-h1"
            className="text-display text-ink max-w-[16ch]"
          >
            {hero.h1}
          </h1>
          <p className="mt-8 max-w-[58ch] text-body text-ink/85">
            {hero.sub}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <ArrowLink href={hero.primary.href} variant="primary">
              {hero.primary.label}
            </ArrowLink>
            <ArrowLink
              href={hero.secondary.href}
              variant="secondary"
              disabled={hero.secondary.soon}
              badge={hero.secondary.soon ? "Soon" : undefined}
            >
              {hero.secondary.label}
            </ArrowLink>
          </div>
          <p className="text-mono mt-12 flex flex-wrap gap-x-3 gap-y-1">
            {hero.meta.map((m, i) => (
              <span key={m} className="inline-flex items-center gap-3">
                {m}
                {i < hero.meta.length - 1 && (
                  <span aria-hidden className="text-ink-faint">·</span>
                )}
              </span>
            ))}
          </p>
        </div>
        <div className="lg:col-span-4 hidden lg:block">
          <FilmStill
            slug="dreamist / reel 001"
            time="00:00:14"
            ariaLabel="Sample frame from a Dreamist reel"
          />
        </div>
      </div>
    </section>
  );
}
