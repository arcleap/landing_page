import { products } from "@/content/products";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { FilmStill } from "@/components/FilmStill";

export function ProductCard() {
  const d = products.dreamist;
  return (
    <section
      id="products"
      className="container-page py-24 md:py-32 border-t border-rule"
    >
      <Eyebrow>{products.eyebrow}</Eyebrow>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        <div className="lg:col-span-7 order-2 lg:order-1">
          <h2 className="text-h1 text-ink">{d.name}</h2>
          <p className="mt-3 text-h3 text-ink/85 max-w-[28ch] font-display">
            {d.tagline}
          </p>
          <p className="mt-8 text-body text-ink/80 max-w-[58ch]">{d.body}</p>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <span className="text-mono px-2 py-1 border border-rule text-ink-dim">
              {d.status}
            </span>
            <ArrowLink href={d.href} variant="primary" external>
              {d.cta}
            </ArrowLink>
          </div>
        </div>
        <div className="lg:col-span-5 order-1 lg:order-2">
          <FilmStill
            slug={d.still.slug}
            time={d.still.time}
            ariaLabel="Sample frame from a Dreamist reel"
          />
        </div>
      </div>
      <p className="mt-16 md:mt-24 text-mono text-ink-faint">
        {products.more}
      </p>
    </section>
  );
}
