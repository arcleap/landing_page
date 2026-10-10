import { hero } from "@/content/hero";
import { OutcomeField } from "@/components/figures/OutcomeField";

export function Hero() {
  return (
    <section id="top" className="hero-section" aria-labelledby="hero-title">
      <div className="container-page hero-grid">
        <div className="hero-head">
          <p className="hero-kicker">
            <span>{hero.eyebrow}</span>
            <span className="status">
              <span className="status-dot" aria-hidden="true" />
              {hero.status}
            </span>
          </p>
          <h1 id="hero-title">
            <span className="h1-line">{hero.h1.lead}</span>{" "}
            <span className="h1-line">{hero.h1.emphasis}</span>{" "}
            <span className="h1-line h1-accent">{hero.h1.accent}</span>
          </h1>
        </div>
        <div className="hero-side">
          <p className="hero-body">{hero.body}</p>
          <div className="hero-actions">
            <a className="button" href={hero.cta.href}>
              <span>{hero.cta.label}</span>
              <span aria-hidden="true">↓</span>
            </a>
            <a className="text-link" href={hero.secondary.href}>
              <span>{hero.secondary.label}</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
      <div className="container-page">
        <OutcomeField />
      </div>
    </section>
  );
}
