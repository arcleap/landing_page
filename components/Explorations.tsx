import { explorations } from "@/content/explorations";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function Explorations() {
  return (
    <section id="explorations" className="container-page scroll-mt-24 py-24 md:py-36">
      <div className="explorations-heading">
        <div>
          <Eyebrow>{explorations.eyebrow}</Eyebrow>
          <h2 className="text-h1 max-w-[18ch] text-ink">{explorations.h2}</h2>
        </div>
        <p>{explorations.intro}</p>
      </div>

      <div className="exploration-grid">
        {explorations.items.map((item) => (
          <article key={item.number} className="exploration-card">
            <div className={`exploration-visual exploration-${item.visual}`} aria-hidden="true">
              {item.visual === "physical" ? <PhysicalSignal /> : <WishSignal />}
            </div>
            <div className="exploration-copy">
              <div className="exploration-meta">
                <span>{item.number}</span>
                <span>{item.signal}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PhysicalSignal() {
  return (
    <div className="physical-signal">
      <span className="signal-node signal-node-start" />
      <span className="signal-line" />
      <span className="signal-pulse" />
      <span className="signal-node signal-node-end" />
      <span className="signal-label signal-label-start">intent</span>
      <span className="signal-label signal-label-end">outcome</span>
    </div>
  );
}

function WishSignal() {
  return (
    <div className="wish-signal">
      <span className="wish-core" />
      <span className="wish-ring wish-ring-one" />
      <span className="wish-ring wish-ring-two" />
      <span className="wish-dot wish-dot-one" />
      <span className="wish-dot wish-dot-two" />
      <span className="wish-dot wish-dot-three" />
    </div>
  );
}
