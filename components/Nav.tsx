import { nav } from "@/content/links";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-ground/80 border-b border-rule/60">
      <div className="container-page flex items-center justify-between h-16">
        <a
          href="#top"
          className="font-display text-xl tracking-tight text-ink hover:text-accent transition-colors"
          aria-label="ArcLeap home"
        >
          ArcLeap
        </a>
        <nav aria-label="Primary" className="flex items-center gap-7">
          {nav.map((item) => {
            const isExternal = item.href.startsWith("mailto:");
            return (
              <a
                key={item.label}
                href={item.href}
                {...(isExternal
                  ? { rel: "noopener noreferrer" }
                  : {})}
                className="text-caption hover:text-ink transition-colors hidden sm:inline"
              >
                {item.label}
              </a>
            );
          })}
          <a
            href="mailto:contact@arcleap.ai"
            className="text-caption hover:text-ink transition-colors sm:hidden"
            rel="noopener noreferrer"
          >
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}
