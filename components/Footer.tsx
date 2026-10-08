import { footer } from "@/content/links";

export function Footer() {
  return (
    <footer id="contact" className="site-footer scroll-mt-24">
      <div className="container-page footer-main">
        <p className="footer-label">CONTACT</p>
        <div className="footer-contact-copy">
          <p className="footer-note">Research, partnerships, and company inquiries.</p>
          <a className="footer-email" href={`mailto:${footer.email}`}>{footer.email}</a>
        </div>
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
