import { explorations } from "@/content/explorations";

export function Explorations() {
  return (
    <section
      id="approach"
      className="research-section scroll-mt-24"
      aria-labelledby="approach-title"
    >
      <div className="container-page">
        <div className="research-heading">
          <p className="section-kicker">{explorations.eyebrow}</p>
          <div className="research-copy">
            <h2 id="approach-title">{explorations.h2}</h2>
            <p className="research-intro">{explorations.intro}</p>
            <p className="research-detail">{explorations.detail}</p>
            <p className="research-distribution">{explorations.distribution}</p>
            <p className="research-proof">{explorations.proof}</p>
            <p className="research-data">{explorations.data}</p>
          </div>
        </div>

        <p className="application-label">{explorations.applicationLabel}</p>
        <ol className="research-list">
          {explorations.items.map((item) => (
            <li className="research-row" key={item.number}>
              <span className="research-number">{item.number}</span>
              <div className="research-entry">
                <p className="research-signal">{item.signal}</p>
                <h3>{item.title}</h3>
                <p className="research-description">{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
