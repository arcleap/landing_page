import { explorations } from "@/content/explorations";

export function Explorations() {
  return (
    <section
      id="explorations"
      className="research-section scroll-mt-24"
      aria-labelledby="explorations-title"
    >
      <div className="container-page">
        <div className="research-heading">
          <p className="section-kicker">{explorations.eyebrow}</p>
          <div>
            <h2 id="explorations-title">{explorations.h2}</h2>
            <p className="research-intro">{explorations.intro}</p>
          </div>
        </div>

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
