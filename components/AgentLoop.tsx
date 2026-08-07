import { agent } from "@/content/agent";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function AgentLoop() {
  return (
    <section id="how" className="scroll-mt-24 border-y border-rule bg-panel/55">
      <div className="container-page py-24 md:py-32">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Eyebrow>{agent.eyebrow}</Eyebrow>
            <h2 className="text-h1 max-w-[20ch] text-ink">{agent.h2}</h2>
          </div>
          <p className="max-w-[44ch] text-body text-ink-dim lg:col-span-4 lg:pt-10">
            {agent.intro}
          </p>
        </div>
        <ol className="mt-14 grid overflow-hidden rounded-2xl border border-rule bg-ground md:grid-cols-2 lg:grid-cols-4">
          {agent.steps.map((step) => (
            <li key={step.number} className="min-h-[18rem] border-b border-rule p-7 last:border-b-0 md:border-r lg:border-b-0">
              <span className="font-mono text-xs tracking-[0.12em] text-accent">{step.number}</span>
              <h3 className="mt-16 text-h3 text-ink">{step.title}</h3>
              <p className="mt-4 text-sm leading-6 text-ink-dim">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
