import { hero } from "@/content/hero";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function Hero() {
  return (
    <section
      id="top"
      className="container-page relative overflow-hidden pb-28 pt-16 md:pb-40 md:pt-24"
      aria-labelledby="hero-h1"
    >
      <div className="grid min-h-[calc(100svh-8rem)] items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
        <div className="relative z-10 max-w-[45rem]">
          <Eyebrow>{hero.eyebrow}</Eyebrow>
          <h1 id="hero-h1" className="text-display max-w-[10ch] text-ink">
            {hero.h1}
          </h1>
          <p className="mt-8 max-w-[56ch] text-lg leading-8 text-ink-dim md:text-xl">
            {hero.body}
          </p>
          <div className="mt-10 flex flex-col items-start gap-8 sm:flex-row sm:items-center">
            <a href={hero.cta.href} className="primary-cta group">
              <span>{hero.cta.label}</span>
              <span aria-hidden className="transition-transform group-hover:translate-y-1">↓</span>
            </a>
            <p className="max-w-[31ch] font-mono text-xs uppercase leading-5 tracking-[0.12em] text-ink-dim">
              {hero.mission}
            </p>
          </div>
        </div>
        <WorldField />
      </div>
    </section>
  );
}

function WorldField() {
  return (
    <div className="world-field relative mx-auto aspect-square w-full max-w-[38rem] lg:mr-0" aria-hidden="true">
      <div className="world-halo absolute inset-[16%] rounded-full" />
      <svg viewBox="0 0 700 700" className="relative h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="arc" x1="115" y1="120" x2="610" y2="590" gradientUnits="userSpaceOnUse">
            <stop stopColor="currentColor" stopOpacity="0.08" />
            <stop offset="0.46" stopColor="currentColor" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.18" />
          </linearGradient>
          <radialGradient id="core" cx="0" cy="0" r="1" gradientTransform="translate(350 350) rotate(90) scale(95)">
            <stop stopColor="#f4f1ea" />
            <stop offset="0.24" stopColor="#f3b85b" />
            <stop offset="1" stopColor="#f3b85b" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="350" cy="350" r="94" fill="url(#core)" opacity="0.72" />
        <circle cx="350" cy="350" r="44" fill="currentColor" fillOpacity="0.11" stroke="currentColor" strokeOpacity="0.72" />
        <g className="orbit orbit-one" stroke="url(#arc)">
          <ellipse cx="350" cy="350" rx="275" ry="118" strokeWidth="1.4" transform="rotate(-18 350 350)" />
          <circle cx="604" cy="262" r="8" fill="currentColor" stroke="none" />
        </g>
        <g className="orbit orbit-two" stroke="url(#arc)">
          <ellipse cx="350" cy="350" rx="252" ry="144" strokeWidth="1.2" transform="rotate(48 350 350)" />
          <circle cx="202" cy="546" r="6" fill="currentColor" stroke="none" />
        </g>
        <path className="signal-path" d="M76 430C172 386 196 214 316 249C428 282 423 514 618 457" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M115 184C202 126 258 150 315 199C386 259 451 218 580 112" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1" />
        <path d="M124 563C240 626 352 615 440 568C496 538 544 536 608 559" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" />
        <g fill="currentColor">
          <circle cx="76" cy="430" r="4" /><circle cx="618" cy="457" r="4" />
          <circle cx="115" cy="184" r="3" fillOpacity="0.55" /><circle cx="580" cy="112" r="3" fillOpacity="0.55" />
          <circle cx="124" cy="563" r="3" fillOpacity="0.4" /><circle cx="608" cy="559" r="3" fillOpacity="0.4" />
        </g>
        <g stroke="currentColor" strokeOpacity="0.4">
          <circle cx="142" cy="294" r="18" />
          <path d="M530 339l16 16-16 16-16-16 16-16Z" />
          <path d="M285 575h34v34h-34z" transform="rotate(12 302 592)" />
        </g>
      </svg>
    </div>
  );
}
