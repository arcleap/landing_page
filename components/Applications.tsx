import { explorations } from "@/content/explorations";
import { site } from "@/content/links";
import { FocusGlyph } from "@/components/figures/FocusGlyphs";
import { SectionHead } from "@/components/SectionHead";

export function Applications() {
  const { focus } = explorations;

  return (
    <section className="section" aria-labelledby="focus-title">
      <div className="container">
        <SectionHead number={focus.number} name={focus.eyebrow} aside={site.running} id="focus-title" />
        <ol className="grid focus-list">
          {focus.items.map((item, i) => (
            <li className="focus-item" key={item.number} data-reveal>
              <FocusGlyph index={i} />
              <p className="focus-num">{item.number}</p>
              <h3>{item.title}</h3>
              <p className="focus-line">{item.line}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
