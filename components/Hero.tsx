import { hero } from "@/content/hero";

export function Hero() {
  return (
    <section id="top" className="hero-section" aria-labelledby="hero-title">
      <div className="container-page hero-inner">
        <div className="hero-copy">
          <p className="section-kicker">{hero.eyebrow}</p>
          <h1 id="hero-title">{hero.h1}</h1>
          <p className="hero-body">{hero.body}</p>
          <div className="hero-actions">
            <a className="hero-link" href={hero.cta.href}>
              <span>{hero.cta.label}</span>
              <span aria-hidden="true">↓</span>
            </a>
            <span className="hero-note">{hero.note}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
