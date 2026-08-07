import { verification } from "@/content/verification";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function Verification() {
  return (
    <section id="verification" className="scroll-mt-24 border-b border-rule bg-ink text-ground">
      <div className="container-page grid gap-14 py-24 md:py-32 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <Eyebrow tone="inverse">{verification.eyebrow}</Eyebrow>
          <h2 className="text-h1 max-w-[18ch]">{verification.h2}</h2>
          <blockquote className="mt-9 max-w-[40ch] border-l-2 border-accent pl-6 text-2xl leading-9 tracking-[-0.025em]">
            {verification.thesis}
          </blockquote>
          <p className="mt-7 max-w-[58ch] text-base leading-7 text-ground/70">
            {verification.body}
          </p>
        </div>
        <div className="verification-card lg:col-span-4 lg:col-start-9">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ground/55">Physical test suite</p>
          <ul className="mt-6 grid gap-3">
            {verification.checks.map((check) => (
              <li key={check} className="flex items-center gap-3 rounded-lg border border-ground/15 bg-ground/5 px-4 py-3">
                <span aria-hidden className="flex size-5 items-center justify-center rounded-full bg-accent text-[0.7rem] text-white">✓</span>
                <span className="text-sm font-medium">{check}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 font-mono text-[0.6rem] uppercase tracking-[0.11em] text-ground/45">Generate → test → repair</p>
        </div>
      </div>
    </section>
  );
}
