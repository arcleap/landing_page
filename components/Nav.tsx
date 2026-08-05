import { nav } from "@/content/links";

export function Nav() {
  const isPreview = process.env.VERCEL_ENV === "preview";

  return (
    <header className="sticky top-0 z-50 border-b border-rule/80 bg-ground/85 backdrop-blur-xl">
      {isPreview ? (
        <div className="border-b border-accent/30 bg-accent/10 py-1.5 text-center font-mono text-[0.65rem] uppercase tracking-[0.16em] text-accent">
          Protected review candidate · not production
        </div>
      ) : null}
      <div className="container-page flex h-16 items-center justify-between">
        <a
          href="#top"
          className="flex items-center gap-3 text-base font-semibold tracking-[-0.02em] text-ink transition-colors hover:text-accent"
          aria-label="ArcLeap home"
        >
          <span aria-hidden className="size-2 rotate-45 border border-accent" />
          ARCLEAP
        </a>
        <nav aria-label="Primary" className="flex items-center gap-6 lg:gap-8">
          {nav.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="hidden font-mono text-[0.68rem] uppercase tracking-[0.13em] text-ink-dim transition-colors hover:text-ink sm:inline"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#contact"
            className="font-mono text-[0.68rem] uppercase tracking-[0.13em] text-ink-dim transition-colors hover:text-ink sm:hidden"
          >
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}
