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
          <h1 id="hero-title" className="text-display max-w-[10.5ch] text-ink">
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

        <div className="hero-visual" aria-label="ArcLeap symbol">
          <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
          <div className="hero-orbit hero-orbit-two" aria-hidden="true" />
          <div className="hero-image-frame">
            <Image
              src={arcleapMark}
              alt="ArcLeap"
              fill
              priority
              sizes="(max-width: 1023px) 90vw, 42vw"
              className="object-cover"
            />
          </div>
          <div className="hero-coordinate hero-coordinate-one" aria-hidden="true">A / 01</div>
          <div className="hero-coordinate hero-coordinate-two" aria-hidden="true">INTELLIGENCE · POSSIBILITY</div>
        </div>
      </div>
    </section>
  );
}
