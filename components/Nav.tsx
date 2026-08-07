import Image from "next/image";
import arcleapMark from "@/design-assets/arcleap-logo-source.png";
import { nav } from "@/content/links";

export function Nav() {
  const isPreview = process.env.VERCEL_ENV === "preview";

  return (
    <header className="site-header">
      {isPreview ? (
        <div className="preview-banner">Protected review candidate · not production</div>
      ) : null}
      <div className="container-page nav-inner">
        <a href="#top" className="brand-link" aria-label="ArcLeap AI home">
          <span className="brand-mark" aria-hidden="true">
            <Image src={arcleapMark} alt="" fill sizes="42px" className="object-cover" />
          </span>
          <span>ARCLEAP AI</span>
        </a>
        <nav aria-label="Primary" className="nav-links">
          {nav.map((item) => (
            <a key={item.label} href={item.href}>{item.label}</a>
          ))}
          <a href="#contact" className="nav-contact">Contact</a>
        </nav>
      </div>
    </header>
  );
}
