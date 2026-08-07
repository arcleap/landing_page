import { hero } from "@/content/hero";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function Hero() {
  return (
    <section
      id="top"
      className="container-page relative overflow-hidden pb-24 pt-16 md:pb-32 md:pt-24"
      aria-labelledby="hero-h1"
    >
      <div className="grid min-h-[calc(100svh-8rem)] items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="relative z-10 max-w-[46rem]">
          <Eyebrow>{hero.eyebrow}</Eyebrow>
          <h1 id="hero-h1" className="text-display max-w-[11ch] text-ink">
            {hero.h1}
          </h1>
          <p className="mt-7 max-w-[54ch] text-lg leading-8 text-ink-dim md:text-xl">
            {hero.body}
          </p>
          <div className="mt-10 flex flex-col items-start gap-7 sm:flex-row sm:items-center">
            <a href={hero.cta.href} className="primary-cta group">
              <span>{hero.cta.label}</span>
              <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </a>
            <p className="max-w-[31ch] font-mono text-xs uppercase leading-5 tracking-[0.1em] text-ink-dim">
              {hero.mission}
            </p>
          </div>
        </div>
        <AgentDiagram />
      </div>
    </section>
  );
}

function AgentDiagram() {
  return (
    <div className="agent-panel mx-auto w-full max-w-[34rem] lg:mr-0" aria-hidden="true">
      <div className="flex items-center justify-between border-b border-rule px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="size-2 rounded-full bg-accent" />
          <span className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-ink">ArcLeap agent</span>
        </div>
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-faint">Run 01</span>
      </div>
      <div className="p-6 md:p-8">
        <div className="agent-endpoint">
          <span className="agent-tag">Input</span>
          <p>Plain-language intent</p>
        </div>
        <div className="agent-connector" />
        <div className="agent-core">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.13em] text-accent">Engineering agent</p>
              <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-ink">Generate. Test. Repair.</p>
            </div>
            <div className="agent-status"><span className="size-1.5 rounded-full bg-accent" />Active</div>
          </div>
          <div className="mt-7 grid gap-2">
            {["Generate", "Test", "Repair"].map((label, index) => (
              <div key={label} className="agent-step">
                <span className="font-mono text-[0.62rem] text-ink-faint">0{index + 1}</span>
                <span className="text-sm font-medium text-ink">{label}</span>
                <span className="ml-auto size-1.5 rounded-full bg-accent" />
              </div>
            ))}
          </div>
        </div>
        <div className="agent-connector" />
        <div className="agent-endpoint">
          <span className="agent-tag">Output</span>
          <p>Verified product</p>
        </div>
        <p className="mt-6 text-center font-mono text-[0.6rem] uppercase tracking-[0.12em] text-ink-faint">
          Physics · factories · physical outcome
        </p>
      </div>
    </div>
  );
}
