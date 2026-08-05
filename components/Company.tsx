import { company } from "@/content/company";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function Company() {
  return (
    <section id="company" className="scroll-mt-24 border-t border-rule bg-panel/45">
      <div className="container-page grid grid-cols-1 gap-12 py-24 md:py-36 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <Eyebrow>{company.eyebrow}</Eyebrow>
        </div>
        <div className="lg:col-span-8 lg:col-start-5">
          <h2 className="text-h1 max-w-[22ch] text-ink">{company.h2}</h2>
          <div className="mt-8 max-w-[60ch] space-y-6 text-xl leading-8 text-ink-dim">
            {company.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <div className="mt-16 flex items-end justify-between gap-8 border-t border-rule pt-8">
            <div>
              <h3 className="text-h3 text-ink">{company.founder.name}</h3>
              <p className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-ink-dim">
                {company.founder.role}
              </p>
            </div>
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.13em] text-ink-faint">
              Silicon Valley · California
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
