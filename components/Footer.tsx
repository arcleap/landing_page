import { footer, site } from "@/content/links";
import { SectionHead } from "@/components/SectionHead";

export function Footer() {
  return (
    <footer id="contact" className="site-footer section scroll-mt-24">
      <div className="container">
        <SectionHead number={footer.number} name={footer.label} aside={site.running} />
        <div className="grid contact-grid" data-reveal>
          <p className="contact-question">{footer.question}</p>
          <div className="contact-side">
            <p className="contact-ask">{footer.ask}</p>
            <a className="contact-email" href={`mailto:${footer.email}`}>
              <span>{footer.email}</span>
              <span className="contact-arrow" aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
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
