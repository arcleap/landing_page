import { portfolio } from "@/content/portfolio";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function Portfolio() {
  return (
    <section id="work" className="container-page scroll-mt-24 py-24 md:py-36">
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Eyebrow>{portfolio.eyebrow}</Eyebrow>
          <h2 className="text-h1 max-w-[17ch] text-ink">{portfolio.h2}</h2>
        </div>
        <p className="max-w-[43ch] text-body text-ink-dim lg:col-span-4 lg:col-start-9 lg:pt-10">
          {portfolio.intro}
        </p>
      </div>
      <div className="mt-16 overflow-hidden rounded-[1.25rem] border border-rule">
        {portfolio.items.map((item, index) => (
          <article
            key={item.title}
            className="portfolio-row grid gap-8 border-b border-rule p-8 last:border-b-0 md:grid-cols-12 md:items-center md:p-10"
          >
            <div className="flex items-center gap-4 md:col-span-2">
              <span className="font-mono text-xs text-ink-faint">0{index + 1}</span>
              <span className="portfolio-dot size-2 rounded-full" />
            </div>
            <div className="md:col-span-4">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.13em] text-accent">{item.status}</p>
              <h3 className="mt-3 text-h2 text-ink">{item.title}</h3>
            </div>
            <p className="max-w-[48ch] text-body text-ink-dim md:col-span-5 md:col-start-8">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
