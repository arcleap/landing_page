import { explorations } from "@/content/explorations";
import { Population } from "@/components/figures/Population";

export function Approach() {
  const { prediction, pair } = explorations;

  return (
    <section id="approach" className="approach-section scroll-mt-24" aria-labelledby="approach-title">
      <div className="container-page">
        <div className="statement" data-reveal>
          <p className="section-kicker">
            <span className="kicker-number">01</span>
            {explorations.eyebrow}
          </p>
          <h2 id="approach-title" className="statement-text">
            <span className="statement-generation">{explorations.generation}</span>{" "}
            <span className="statement-prediction">
              {prediction.before}
              <em>{prediction.emphasis}</em>
              {prediction.after}
            </span>
          </h2>
        </div>

        <div className="pair" data-reveal>
          <p className="section-kicker">
            <span className="kicker-number">02</span>
            {pair.eyebrow}
          </p>
          <div className="pair-grid">
            {pair.sides.map((side, i) => (
              <div className="pair-side" key={side.name}>
                <h3 className={i === 0 ? "pair-name" : "pair-name pair-name-serif"}>{side.name}</h3>
                <p className="pair-question">{side.question}</p>
                <ul className="pair-traits">
                  {side.traits.map((trait) => (
                    <li key={trait}>{trait}</li>
                  ))}
                </ul>
              </div>
            ))}
            <span className="pair-join" aria-hidden="true">+</span>
          </div>
          <p className="pair-detail">{pair.detail}</p>
          <Population />
        </div>
      </div>
    </section>
  );
}
