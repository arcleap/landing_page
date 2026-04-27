import { pillars } from "@/content/pillars";
import { Eyebrow } from "@/components/ui/Eyebrow";

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
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 md:gap-y-12">
        {pillars.items.map((p) => (
          <li key={p.number} className="flex items-baseline gap-6">
            <span className="text-mono text-ink-faint">{p.number}</span>
            <h3 className="text-h3 text-ink">{p.title}</h3>
          </li>
        ))}
      </ul>
    </section>
  );
}
