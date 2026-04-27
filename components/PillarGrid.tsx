import { pillars } from "@/content/pillars";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { cn } from "@/lib/cn";

export function PillarGrid() {
  return (
    <section
      id="research"
      className="container-page py-24 md:py-32 border-t border-rule"
    >
      <div className="max-w-[40ch] mb-16 md:mb-20">
        <Eyebrow>{pillars.eyebrow}</Eyebrow>
        <h2 className="text-h1 text-ink">{pillars.h2}</h2>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-14 md:gap-y-16">
        {pillars.items.map((p) => (
          <li key={p.number} className="flex flex-col">
            <p className="text-mono text-ink-faint mb-3">{p.number}</p>
            <h3 className="text-h3 text-ink mb-4">{p.title}</h3>
            <p className="text-body text-ink/80 max-w-[44ch]">{p.body}</p>
            <p
              className={cn(
                "text-mono mt-5",
                p.status === "production"
                  ? "text-accent"
                  : "text-ink-dim",
              )}
            >
              {p.tag}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
