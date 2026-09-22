import { footer } from "@/content/links";

export function Footer() {
  return (
    <footer id="contact" className="site-footer scroll-mt-24">
      <div className="container-page footer-main">
        <div>
          <p className="footer-label">CONTACT</p>
          <a className="footer-email" href={`mailto:${footer.email}`}>{footer.email}</a>
        </div>
      </div>
      <div className="container-page footer-bottom">
        <p>{footer.rights}</p>
      </div>
    </footer>
  );
}
