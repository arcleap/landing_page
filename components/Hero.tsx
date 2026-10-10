import { hero } from "@/content/hero";
import { CrowdField } from "@/components/figures/CrowdField";
import { SectionHead } from "@/components/SectionHead";

export function Hero() {
  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="container">
        <SectionHead
          number="00"
          name={hero.eyebrow}
          aside={
            <span className="status">
              <span className="status-dot" aria-hidden="true" />
              {hero.status}
            </span>
          }
        />
        <div className="grid hero-grid">
          <div className="hero-copy">
            <h1 id="hero-title">
              <span>{hero.h1.lead}</span> <span className="accent-text">{hero.h1.accent}</span>
            </h1>
            <p className="hero-body">{hero.body}</p>
            <div className="actions">
              <a className="button" href={hero.cta.href}>
                <span>{hero.cta.label}</span>
                <span aria-hidden="true">→</span>
              </a>
              <a className="text-link" href={hero.secondary.href}>
                <span>{hero.secondary.label}</span>
                <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
          <div className="hero-figure">
            <CrowdField />
          </div>
        </div>
      </div>
    </section>
  );
}
