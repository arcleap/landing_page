import { company } from "@/content/company";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function Company() {
  return (
    <section id="company" className="company-section scroll-mt-24">
      <div className="container-page company-grid">
        <div>
          <Eyebrow>{company.eyebrow}</Eyebrow>
          <h2 className="text-h1 max-w-[19ch] text-ink">{company.h2}</h2>
        </div>
        <div className="company-copy">
          <p>{company.body}</p>
          <div className="company-origin">
            <span>{company.founder}</span>
            <span>Silicon Valley · California</span>
          </div>
        </div>
      </div>
    </section>
  );
}
