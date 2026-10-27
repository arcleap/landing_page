import { explorations } from "@/content/explorations";
import { site } from "@/content/links";
import { ScaleRings } from "@/components/figures/ScaleRings";
import { SectionHead } from "@/components/SectionHead";

export function AnyWorld() {
  const { scale } = explorations;

  return (
    <section className="section" aria-labelledby="scale-title">
      <div className="container">
        <SectionHead number={scale.number} name={scale.eyebrow} aside={site.running} />
        <div className="grid scale-grid" data-reveal>
          <div className="scale-copy">
            <h2 id="scale-title" className="scale-title">{scale.h2}</h2>
            <p className="scale-body">{scale.body}</p>
          </div>
          <div className="scale-figure">
            <ScaleRings />
          </div>
        </div>
      </div>
    </section>
  );
}
