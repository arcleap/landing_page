import { process } from "@/content/process";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function Process() {
  return (
    <section id="how" className="container-page scroll-mt-24 py-24 md:py-36">
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Eyebrow>{process.eyebrow}</Eyebrow>
          <h2 className="text-h1 max-w-[16ch] text-ink">{process.h2}</h2>
        </div>
        <p className="max-w-[46ch] text-body text-ink-dim lg:col-span-4 lg:col-start-9 lg:pt-10">{process.intro}</p>
      </div>
      <ol className="mt-16 grid border-l border-t border-rule sm:grid-cols-2 lg:grid-cols-4">
        {process.steps.map((step) => (
          <li key={step.number} className="group relative min-h-[22rem] border-b border-r border-rule p-7 transition-colors hover:bg-panel/70 md:p-8">
            <span className="font-mono text-xs tracking-[0.16em] text-accent">{step.number}</span>
            <div className="mt-24">
              <h3 className="text-h3 text-ink">{step.title}</h3>
              <p className="mt-5 text-base leading-7 text-ink-dim">{step.description}</p>
            </div>
            <span aria-hidden className="absolute right-7 top-7 size-2 rounded-full border border-accent/50 transition-colors group-hover:bg-accent" />
          </li>
        ))}
      </ol>
    </section>
  );
}
