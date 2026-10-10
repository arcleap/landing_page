import { footer } from "@/content/links";

export function Footer() {
  return (
    <footer id="contact" className="site-footer scroll-mt-24">
      <div className="container-page footer-cta" data-reveal>
        <p className="section-kicker">
          <span className="kicker-number">05</span>
          {footer.label}
        </p>
        <p className="footer-question">{footer.question}</p>
        <p className="footer-ask">{footer.ask}</p>
        <a className="footer-email" href={`mailto:${footer.email}`}>
          <span>{footer.email}</span>
          <span className="footer-email-arrow" aria-hidden="true">→</span>
        </a>
      </div>
      <div className="container-page footer-bottom">
        <p>{footer.rights}</p>
        <div className="footer-founders" aria-label="ArcLeap AI founders">
          {footer.founders.map((founder) => (
            <p key={founder.name}>
              {founder.role}: <span>{founder.name}</span>
            </p>
          ))}
        </div>
      </div>
    </footer>
  );
}
