import { explorations } from "@/content/explorations";
import { site } from "@/content/links";
import { SectionHead } from "@/components/SectionHead";

export function Approach() {
  return (
    <section id="approach" className="section scroll-mt-24" aria-labelledby="approach-title">
      <div className="container">
        <SectionHead number={explorations.number} name={explorations.eyebrow} aside={site.running} />
        <div className="grid direction-grid" data-reveal>
          <h2 id="approach-title" className="direction-title">{explorations.h2}</h2>
          <p className="direction-body">{explorations.body}</p>
        </div>
      </div>
    </section>
  );
}
