import { hero } from "@/content/hero";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function Hero() {
  return (
    <section
      id="top"
      className="container-page relative overflow-hidden pb-24 pt-16 md:pb-36 md:pt-24"
      aria-labelledby="hero-h1"
    >
      <div className="grid min-h-[calc(100svh-8rem)] items-center gap-16 lg:grid-cols-[1.04fr_0.96fr] lg:gap-10">
        <div className="relative z-10 max-w-[46rem]">
          <Eyebrow>{hero.eyebrow}</Eyebrow>
          <h1 id="hero-h1" className="text-display max-w-[11ch] text-ink">
            {hero.h1}
          </h1>
          <p className="mt-8 max-w-[58ch] text-lg leading-8 text-ink-dim md:text-xl">
            {hero.body}
          </p>
          <div className="mt-10 flex flex-col items-start gap-8 sm:flex-row sm:items-center">
            <a href={hero.cta.href} className="primary-cta group" rel="noopener noreferrer">
              <span>{hero.cta.label}</span>
              <span aria-hidden className="transition-transform group-hover:translate-x-1">↗</span>
            </a>
            <p className="max-w-[29ch] font-mono text-xs uppercase leading-5 tracking-[0.13em] text-ink-dim">
              {hero.mission}
            </p>
          </div>
        </div>
        <BuildDiagram />
      </div>
    </section>
  );
}

function BuildDiagram() {
  return (
    <div className="blueprint-panel relative mx-auto aspect-[4/5] w-full max-w-[36rem] lg:mr-0" aria-hidden="true">
      <div className="blueprint-grid absolute inset-0" />
      <div className="blueprint-glow absolute inset-0" />
      <svg viewBox="0 0 640 760" className="relative h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path className="trace-line" d="M66 164C116 107 166 224 226 163C270 119 299 118 335 165" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="65" cy="164" r="5" fill="currentColor" />
        <circle cx="335" cy="165" r="5" fill="currentColor" />
        <path d="M112 300H502V594H112V300Z" stroke="currentColor" strokeOpacity="0.24" strokeWidth="1" strokeDasharray="7 8" />
        <path className="trace-line trace-line-delay" d="M186 374H274V339H415V395H472V516H384V553H230V506H168V409H186V374Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="244" cy="435" r="31" stroke="currentColor" strokeWidth="2" />
        <circle cx="401" cy="463" r="47" stroke="currentColor" strokeWidth="2" />
        <circle cx="401" cy="463" r="14" stroke="currentColor" strokeWidth="1" />
        <path d="M168 278V329M472 278V329" stroke="currentColor" strokeOpacity="0.5" />
        <path d="M168 288H472" stroke="currentColor" strokeOpacity="0.5" />
        <path d="M168 288L180 282V294L168 288ZM472 288L460 282V294L472 288Z" fill="currentColor" />
        <text x="297" y="278" fill="currentColor" fontSize="11" letterSpacing="2.4">VERIFIED ENVELOPE</text>
        <path d="M520 374H488M520 553H488M508 374V553" stroke="currentColor" strokeOpacity="0.5" />
        <path d="M508 374L502 386H514L508 374ZM508 553L502 541H514L508 553Z" fill="currentColor" />
        <g fill="currentColor" fontSize="11" letterSpacing="2.2">
          <text x="52" y="100">01 / INTENT</text>
          <text x="52" y="650">02 / CONSTRAINTS</text>
          <text x="352" y="650">03 / BUILD OUTPUT</text>
        </g>
        <g stroke="currentColor" strokeOpacity="0.42">
          <path d="M52 116H154" />
          <path d="M52 666H154" />
          <path d="M352 666H520" />
        </g>
        <g fill="currentColor" fillOpacity="0.68" fontSize="10" letterSpacing="1.8">
          <text x="52" y="692">GEOMETRY</text>
          <text x="206" y="692">PHYSICS</text>
          <text x="352" y="692">MANUFACTURABILITY</text>
        </g>
      </svg>
    </div>
  );
}
