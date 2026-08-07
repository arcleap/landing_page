import { system } from "@/content/system";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function System() {
  return (
    <section id="system" className="container-page scroll-mt-24 py-24 md:py-32">
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Eyebrow>{system.eyebrow}</Eyebrow>
          <h2 className="text-h1 max-w-[21ch] text-ink">{system.h2}</h2>
        </div>
        <p className="max-w-[43ch] text-body text-ink-dim lg:col-span-4 lg:col-start-9 lg:pt-10">
          {system.intro}
        </p>
      </div>
      <div className="mt-14 overflow-hidden rounded-2xl border border-rule bg-panel/40">
        {system.items.map((item, index) => (
          <article
            key={item.title}
            className="system-row grid gap-7 border-b border-rule p-8 last:border-b-0 md:grid-cols-12 md:items-center md:p-10"
          >
            <div className="flex items-center gap-3 md:col-span-2">
              <span className="system-dot size-2 rounded-full" />
              <span className="font-mono text-xs text-ink-faint">0{index + 1}</span>
            </div>
            <div className="md:col-span-4">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.11em] text-accent">{item.label}</p>
              <h3 className="mt-3 text-h2 text-ink">{item.title}</h3>
            </div>
            <p className="max-w-[48ch] text-body text-ink-dim md:col-span-5 md:col-start-8">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
