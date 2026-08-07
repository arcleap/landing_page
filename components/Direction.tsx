import { direction } from "@/content/direction";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function Direction() {
  return (
    <section id="direction" className="direction-section scroll-mt-24">
      <div className="container-page py-24 md:py-36">
        <div className="direction-intro">
          <Eyebrow>{direction.eyebrow}</Eyebrow>
          <h2 className="text-h1 max-w-[18ch] text-ink">{direction.h2}</h2>
          <p className="direction-body">{direction.body}</p>
        </div>

        <ol className="principle-rail">
          {direction.principles.map((principle) => (
            <li key={principle.number} className="principle-item">
              <span className="principle-number">{principle.number}</span>
              <div>
                <h3>{principle.label}</h3>
                <p>{principle.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
