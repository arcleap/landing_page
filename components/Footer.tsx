import { footer } from "@/content/links";

export function Footer() {
  return (
    <footer id="contact" className="scroll-mt-24 border-t border-rule bg-panel/40">
      <div className="container-page grid grid-cols-1 gap-14 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-7">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
            CONTACT
          </p>
          <p className="mt-8 max-w-[19ch] text-h1 text-ink">{footer.tagline}</p>
        </div>
        <div className="flex flex-col justify-end md:col-span-4 md:col-start-9">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-faint">
            General inquiries
          </p>
          <address className="mt-4 not-italic text-xl text-ink">{footer.email}</address>
        </div>
      </div>
      <div className="container-page flex flex-col items-start justify-between gap-3 border-t border-rule py-6 md:flex-row md:items-center">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-faint">
          {footer.rights}
        </p>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-faint">
          Silicon Valley · California
        </p>
      </div>
    </footer>
  );
}
