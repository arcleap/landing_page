import Image from "next/image";
import arcleapMark from "@/design-assets/arcleap-logo-source.png";
import { hero } from "@/content/hero";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function Hero() {
  return (
    <section id="top" className="hero-section" aria-labelledby="hero-title">
      <div className="container-page hero-grid">
        <div className="hero-copy">
          <Eyebrow>{hero.eyebrow}</Eyebrow>
          <h1 id="hero-title" className="text-display max-w-[12ch] text-ink">
            {hero.h1}
          </h1>
          <p className="hero-body">{hero.body}</p>
          <div className="hero-actions">
            <a href={hero.cta.href} className="primary-cta group">
              <span>{hero.cta.label}</span>
              <span aria-hidden className="transition-transform group-hover:translate-y-1">↓</span>
            </a>
            <p className="hero-note">{hero.note}</p>
          </div>
        </div>
        <div className="hero-brand" aria-hidden="true">
          <Image
            src={arcleapMark}
            alt=""
            fill
            loading="eager"
            sizes="(min-width: 900px) 26vw, 1px"
            className="hero-brand-image"
          />
        </div>
      </div>
    </section>
  );
}
