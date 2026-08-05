import { builders } from "@/content/builders";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function Builders() {
  return (
    <section id="builders" className="container-page scroll-mt-24 py-24 md:py-36">
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Eyebrow>{builders.eyebrow}</Eyebrow>
          <h2 className="text-h1 max-w-[18ch] text-ink">{builders.h2}</h2>
        </div>
        <p className="max-w-[40ch] text-body text-ink-dim lg:col-span-4 lg:col-start-9 lg:pt-10">{builders.intro}</p>
      </div>
      <div className="mt-16 grid gap-px overflow-hidden border border-rule bg-rule md:grid-cols-2">
        {builders.audiences.map((audience, index) => (
          <article key={audience.label} className="relative bg-ground p-8 md:p-12">
            <div className="flex items-center justify-between gap-6">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">{audience.label}</p>
              <span className="font-mono text-xs text-ink-faint">0{index + 1}</span>
            </div>
            <h3 className="mt-20 text-h2 text-ink">{audience.title}</h3>
            <p className="mt-5 max-w-[48ch] text-body text-ink-dim">{audience.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
