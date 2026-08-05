import { direction } from "@/content/direction";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function Direction() {
  return (
    <section id="direction" className="scroll-mt-24 border-y border-rule bg-panel/45">
      <div className="container-page py-24 md:py-36">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Eyebrow>{direction.eyebrow}</Eyebrow>
            <h2 className="text-h1 max-w-[19ch] text-ink">{direction.h2}</h2>
          </div>
          <p className="max-w-[44ch] text-body text-ink-dim lg:col-span-4 lg:pt-10">
            {direction.intro}
          </p>
        </div>
        <div className="mt-16 grid border-t border-rule md:grid-cols-3">
          {direction.territories.map((territory, index) => (
            <article
              key={territory.title}
              className="border-b border-rule py-10 md:min-h-[19rem] md:border-b-0 md:border-r md:px-8 md:py-10 first:pl-0 last:border-r-0 last:pr-0"
            >
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
                0{index + 1}
              </p>
              <h3 className="mt-16 text-h2 text-ink">{territory.title}</h3>
              <p className="mt-5 max-w-[34ch] text-body text-ink-dim">{territory.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
