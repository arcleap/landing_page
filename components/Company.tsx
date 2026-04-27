import { company } from "@/content/company";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { cn } from "@/lib/cn";

export function Company() {
  return (
    <section
      id="company"
      className="container-page py-24 md:py-32 border-t border-rule"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
          <Eyebrow>{company.eyebrow}</Eyebrow>
          <h2 className="text-h1 text-ink">{company.h2}</h2>
        </div>
        <div className="lg:col-span-7 lg:col-start-6 space-y-6">
          {company.body.map((p, i) => (
            <p key={i} className="text-body text-ink/85 max-w-[60ch]">
              {p}
            </p>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "mt-16 md:mt-24 grid grid-cols-1 gap-10 md:gap-14",
          company.founders.length > 1 && "md:grid-cols-2",
          company.founders.length === 1 && "max-w-[44rem]",
        )}
      >
        {company.founders.map((f) => (
          <article key={f.name} className="flex flex-col">
            <h3 className="text-h3 text-ink">{f.name}</h3>
            <p className="text-mono mt-1">{f.role}</p>
            <p className="mt-5 text-body text-ink/80 max-w-[44ch]">{f.bio}</p>
            <p className="text-mono mt-4">
              <a
                href={`mailto:${f.email}`}
                className="hover:text-ink transition-colors"
                rel="noopener noreferrer"
              >
                {f.email}
              </a>
            </p>
          </article>
        ))}
      </div>

      <p className="text-caption mt-16 text-ink-dim">
        {company.hiring.text}{" "}
        <a
          href={`mailto:${company.hiring.email}`}
          className="text-ink hover:text-accent transition-colors border-b border-rule hover:border-accent"
          rel="noopener noreferrer"
        >
          {company.hiring.email}
        </a>
      </p>
    </section>
  );
}
