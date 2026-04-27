import { positioning } from "@/content/positioning";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function Positioning() {
  return (
    <section
      id="positioning"
      className="container-page py-24 md:py-32 border-t border-rule"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
          <Eyebrow>{positioning.eyebrow}</Eyebrow>
          <h2 className="text-h1 text-ink">{positioning.h2}</h2>
        </div>
        <div className="lg:col-span-7 lg:col-start-6 space-y-6">
          {positioning.body.map((p, i) => (
            <p key={i} className="text-body text-ink/85 max-w-[60ch]">
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
