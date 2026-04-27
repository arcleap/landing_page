import { footer } from "@/content/links";

export function Footer() {
  return (
    <footer className="border-t border-rule mt-12">
      <div className="container-page py-16 md:py-20 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <p className="font-display text-2xl tracking-tight text-ink">
            arcleap
          </p>
          <p className="text-caption mt-3">{footer.tagline}</p>
        </div>

        <div className="space-y-2">
          <p className="text-mono mb-3">Contact</p>
          {footer.contacts.map((c) => (
            <p key={c}>
              <a
                href={`mailto:${c}`}
                className="text-body text-ink/85 hover:text-accent transition-colors"
                rel="noopener noreferrer"
              >
                {c}
              </a>
            </p>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-mono mb-3">Elsewhere</p>
          {footer.external.map((l) => (
            <p key={l.label}>
              <a
                href={l.href}
                target={l.external ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="text-body text-ink/85 hover:text-accent transition-colors inline-flex items-center gap-1"
              >
                {l.label} <span aria-hidden>→</span>
              </a>
            </p>
          ))}
        </div>
      </div>

      <div className="container-page border-t border-rule py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <p className="text-mono text-ink-faint">{footer.rights}</p>
        <ul className="flex items-center gap-5">
          {footer.legal.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="text-mono text-ink-faint hover:text-ink-dim transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
