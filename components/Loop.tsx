import { explorations } from "@/content/explorations";
import { LearnFigure, MeasureFigure, PredictFigure } from "@/components/figures/LoopFigures";

const figures = [PredictFigure, MeasureFigure, LearnFigure];

export function Loop() {
  const { loop } = explorations;

  return (
    <section className="loop-section" aria-labelledby="loop-title">
      <div className="container-page">
        <div className="loop-head" data-reveal>
          <p className="section-kicker">
            <span className="kicker-number">03</span>
            {loop.eyebrow}
          </p>
          <h2 id="loop-title" className="loop-title">
            {loop.h2.map((word, i) => (
              <span key={word} className={i === loop.h2.length - 1 ? "loop-word loop-word-accent" : "loop-word"}>
                {word}
              </span>
            ))}
          </h2>
          <p className="loop-proof">{loop.proof}</p>
        </div>

        <div className="loop-track" data-reveal>
          <ol className="loop-steps">
            {loop.steps.map((step, i) => {
              const Figure = figures[i];
              return (
                <li className="loop-step" key={step.number}>
                  <Figure />
                  <p className="loop-step-number">{step.number}</p>
                  <h3>{step.title}</h3>
                  <p className="loop-step-body">{step.body}</p>
                </li>
              );
            })}
          </ol>
          <div className="loop-return" aria-hidden="true">
            <svg viewBox="0 0 1200 80" preserveAspectRatio="none">
              <path className="loop-return-line" d="M1000 2C1000 62 970 74 890 74H310C230 74 200 62 200 2" />
              <path className="loop-return-head" d="M190 16L200 2L210 16" />
            </svg>
            <p className="loop-return-label">{loop.returnLabel}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
