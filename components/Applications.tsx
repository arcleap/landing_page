import { explorations } from "@/content/explorations";
import { applicationGlyphs } from "@/components/figures/ApplicationGlyphs";

export function Applications() {
  return (
    <section className="applications-section" aria-labelledby="applications-title">
      <div className="container-page">
        <p id="applications-title" className="section-kicker">
          <span className="kicker-number">04</span>
          {explorations.applicationLabel}
        </p>
        <ol className="application-list">
          {explorations.items.map((item, i) => {
            const Glyph = applicationGlyphs[i];
            return (
              <li className="application-row" key={item.number} data-reveal>
                <span className="application-number">{item.number}</span>
                <div className="application-entry">
                  <p className="application-signal">{item.signal}</p>
                  <h3>{item.title}</h3>
                </div>
                <Glyph />
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
