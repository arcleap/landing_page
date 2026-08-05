import { positioning } from "@/content/positioning";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function Positioning() {
  return (
    <section id="positioning" className="border-y border-rule bg-panel/35">
      <div className="container-page grid grid-cols-1 gap-12 py-24 md:py-36 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <Eyebrow>{positioning.eyebrow}</Eyebrow>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-faint">Verification thesis</p>
        </div>
        <div className="lg:col-span-8 lg:col-start-5">
          <h2 className="text-h1 max-w-[20ch] text-ink">{positioning.h2}</h2>
          <blockquote className="mt-10 border-l-2 border-accent pl-6 text-2xl leading-[1.35] tracking-[-0.025em] text-ink md:pl-9 md:text-4xl">
            {positioning.thesis}
          </blockquote>
          <p className="mt-8 max-w-[62ch] text-body text-ink-dim">{positioning.body}</p>
        </div>
      </div>
    </section>
  );
}
